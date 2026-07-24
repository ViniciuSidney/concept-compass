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
