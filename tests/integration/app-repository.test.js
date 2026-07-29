import assert from 'node:assert/strict';
import test from 'node:test';

import { StorageError } from '../../src/core/errors.js';
import { createAppRepository } from '../../src/data/repositories/app-repository.js';
import { createMemoryStorageAdapter } from '../../src/data/storage/memory-storage-adapter.js';
import {
  STORAGE_KEYS,
  createDefaultPreferences,
  createEmptyData,
} from '../../src/domain/constants.js';
import { validData } from '../fixtures/data-builders.js';

test('armazenamento vazio produz estrutura e preferências padrão', () => {
  const repository = createAppRepository({ storageAdapter: createMemoryStorageAdapter() });

  assert.deepEqual(repository.loadData().data, createEmptyData());
  assert.deepEqual(repository.loadPreferences().preferences, createDefaultPreferences());
});

test('salva e recarrega um retrato completo validado', () => {
  const storage = createMemoryStorageAdapter();
  const repository = createAppRepository({ storageAdapter: storage });
  const saved = repository.saveData(validData(), { today: '2026-07-24' });
  const loaded = repository.loadData({ today: '2026-07-24' });

  assert.deepEqual(loaded.data, saved);
  assert.equal(loaded.status, 'ready');
});

test('carrega estrutura v1 como v2 e sinaliza migração sem apagar a origem', () => {
  const created = '2026-07-24T12:00:00.000Z';
  const legacy = {
    schemaVersion: 1,
    materias: [
      {
        id: 'materia-1',
        nome: 'Matemática',
        descricao: '',
        corId: 'roxo',
        ordem: 0,
        criadoEm: created,
        atualizadoEm: created,
      },
    ],
    temas: [
      {
        id: 'tema-1',
        materiaId: 'materia-1',
        nome: 'Álgebra',
        descricao: '',
        ordem: 0,
        criadoEm: created,
        atualizadoEm: created,
      },
    ],
    assuntos: [
      {
        id: 'assunto-1',
        temaId: 'tema-1',
        nome: 'Equação',
        descricao: '',
        estado: 'precisa_reforco',
        dificuldade: 'media',
        observacoes: 'Preservar',
        ultimoEstudoEm: '2026-07-24',
        ordem: 0,
        criadoEm: created,
        atualizadoEm: created,
      },
    ],
  };
  const rawData = JSON.stringify(legacy);
  const storage = createMemoryStorageAdapter({ [STORAGE_KEYS.data]: rawData });
  const repository = createAppRepository({ storageAdapter: storage });
  const result = repository.loadData({ today: '2026-07-24' });

  assert.equal(result.status, 'ready');
  assert.equal(result.migrated, true);
  assert.equal(result.data.schemaVersion, 2);
  assert.equal(result.data.assuntos[0].pontosProgresso, 3);
  assert.equal(result.data.assuntos[0].metaPontosProgresso, 5);
  assert.equal(result.data.assuntos[0].precisaReforco, true);
  assert.equal(result.data.assuntos[0].observacoes, 'Preservar');
  assert.equal(storage.dump()[STORAGE_KEYS.data], rawData);
});

test('JSON corrompido entra em recuperação e preserva conteúdo bruto', () => {
  const rawData = '{"schemaVersion":1';
  const repository = createAppRepository({
    storageAdapter: createMemoryStorageAdapter({ [STORAGE_KEYS.data]: rawData }),
  });
  const result = repository.loadData();

  assert.equal(result.status, 'recovery');
  assert.equal(result.rawData, rawData);
  assert.equal(result.data, null);
});

test('estrutura com referência órfã entra em recuperação sem sobrescrever', () => {
  const invalid = validData();
  invalid.temas[0].materiaId = 'ausente';
  const rawData = JSON.stringify(invalid);
  const storage = createMemoryStorageAdapter({ [STORAGE_KEYS.data]: rawData });
  const repository = createAppRepository({ storageAdapter: storage });

  assert.equal(repository.loadData().status, 'recovery');
  assert.equal(storage.dump()[STORAGE_KEYS.data], rawData);
});

test('esquema futuro entra em recuperação', () => {
  const futureData = { ...createEmptyData(), schemaVersion: 999 };
  const repository = createAppRepository({
    storageAdapter: createMemoryStorageAdapter({
      [STORAGE_KEYS.data]: JSON.stringify(futureData),
    }),
  });

  const result = repository.loadData();
  assert.equal(result.status, 'recovery');
  assert.equal(result.error.code, 'MIGRATION_ERROR');
});

test('falha de gravação não altera o retrato anterior', () => {
  const original = JSON.stringify(createEmptyData());
  const storage = createMemoryStorageAdapter({ [STORAGE_KEYS.data]: original }, { write: true });
  const repository = createAppRepository({ storageAdapter: storage });

  assert.throws(() => repository.saveData(validData()), StorageError);
  assert.equal(storage.dump()[STORAGE_KEYS.data], original);
});

test('preferência inválida usa padrão sem apagar o valor bruto', () => {
  const rawPreferences = JSON.stringify({ theme: 'sepia', viewMode: 'lista', schemaVersion: 1 });
  const storage = createMemoryStorageAdapter({
    [STORAGE_KEYS.preferences]: rawPreferences,
  });
  const repository = createAppRepository({ storageAdapter: storage });
  const result = repository.loadPreferences();

  assert.equal(result.status, 'fallback');
  assert.deepEqual(result.preferences, createDefaultPreferences());
  assert.equal(storage.dump()[STORAGE_KEYS.preferences], rawPreferences);
});

test('salva e remove preferências e dados separadamente', () => {
  const storage = createMemoryStorageAdapter();
  const repository = createAppRepository({ storageAdapter: storage });

  repository.savePreferences({ theme: 'dark', viewMode: 'cards', schemaVersion: 1 });
  repository.saveData(validData(), { today: '2026-07-24' });
  repository.clearPreferences();

  assert.equal(STORAGE_KEYS.preferences in storage.dump(), false);
  assert.equal(STORAGE_KEYS.data in storage.dump(), true);

  repository.clearData();
  assert.deepEqual(storage.dump(), {});
});

test('substitui dados e preferências somente depois de validar o retrato completo', () => {
  const originalData = createEmptyData();
  const originalPreferences = createDefaultPreferences();
  const storage = createMemoryStorageAdapter({
    [STORAGE_KEYS.data]: JSON.stringify(originalData),
    [STORAGE_KEYS.preferences]: JSON.stringify(originalPreferences),
  });
  const repository = createAppRepository({ storageAdapter: storage });
  const nextPreferences = { ...createDefaultPreferences(), theme: 'dark' };

  const restored = repository.replaceSnapshot(
    { data: validData(), preferences: nextPreferences },
    { today: '2026-07-29' },
  );

  assert.deepEqual(restored.data, validData());
  assert.deepEqual(restored.preferences, nextPreferences);
  assert.deepEqual(JSON.parse(storage.dump()[STORAGE_KEYS.data]), validData());
  assert.deepEqual(JSON.parse(storage.dump()[STORAGE_KEYS.preferences]), nextPreferences);
});

test('falha durante substituição restaura dados e preferências anteriores', () => {
  const originalData = createEmptyData();
  const originalPreferences = createDefaultPreferences();
  const storage = createMemoryStorageAdapter(
    {
      [STORAGE_KEYS.data]: JSON.stringify(originalData),
      [STORAGE_KEYS.preferences]: JSON.stringify(originalPreferences),
    },
    { writeAt: 2 },
  );
  const repository = createAppRepository({ storageAdapter: storage });

  assert.throws(
    () =>
      repository.replaceSnapshot(
        {
          data: validData(),
          preferences: { ...createDefaultPreferences(), theme: 'dark' },
        },
        { today: '2026-07-29' },
      ),
    StorageError,
  );

  assert.deepEqual(JSON.parse(storage.dump()[STORAGE_KEYS.data]), originalData);
  assert.deepEqual(JSON.parse(storage.dump()[STORAGE_KEYS.preferences]), originalPreferences);
});
