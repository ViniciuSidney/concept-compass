import assert from 'node:assert/strict';
import test from 'node:test';

import { ImportError } from '../../src/core/errors.js';
import {
  BACKUP_APP_NAME,
  BACKUP_LEGACY_APP_NAMES,
  BACKUP_FORMAT_VERSION,
  createBackupDocument,
  createBackupFileName,
  createBackupSummary,
  parseBackupText,
  serializeBackup,
} from '../../src/data/backup/backup-service.js';
import { createDefaultPreferences } from '../../src/domain/constants.js';
import { validData } from '../fixtures/data-builders.js';

const NOW = new Date('2026-07-29T18:30:00-03:00');

function validBackup(overrides = {}) {
  return {
    ...createBackupDocument({
      data: validData(),
      preferences: createDefaultPreferences(),
      now: NOW,
      today: '2026-07-29',
    }),
    ...overrides,
  };
}

test('gera backup oficial com metadados, dados e preferências permitidas', () => {
  const backup = validBackup();

  assert.equal(backup.app, BACKUP_APP_NAME);
  assert.equal(backup.appVersion, 'v0.1.1');
  assert.equal(backup.formatVersion, BACKUP_FORMAT_VERSION);
  assert.equal(backup.exportedAt, NOW.toISOString());
  assert.deepEqual(backup.data, validData());
  assert.deepEqual(backup.preferences, createDefaultPreferences());
  assert.equal('ui' in backup, false);
  assert.equal('status' in backup, false);
});

test('nome do arquivo usa a data local e serialização termina em nova linha', () => {
  const backup = validBackup();

  assert.equal(createBackupFileName(NOW), 'concept-compass-backup-2026-07-29.json');
  assert.equal(serializeBackup(backup).endsWith('\n'), true);
});

test('interpreta backup válido e produz resumo', () => {
  const parsed = parseBackupText(serializeBackup(validBackup()), { today: '2026-07-29' });
  const summary = createBackupSummary(parsed);

  assert.equal(summary.materias, 1);
  assert.equal(summary.temas, 1);
  assert.equal(summary.assuntos, 1);
  assert.equal(summary.theme, 'system');
});

test('aceita backups da marca anterior e os normaliza para Concept Compass', () => {
  const legacyBackup = validBackup({
    app: BACKUP_LEGACY_APP_NAMES[0],
    appVersion: 'v0.1',
  });

  const parsed = parseBackupText(JSON.stringify(legacyBackup), { today: '2026-07-29' });

  assert.equal(parsed.app, BACKUP_APP_NAME);
  assert.equal(parsed.appVersion, 'v0.1.1');
  assert.deepEqual(parsed.data, validData());
});

test('rejeita JSON malformado sem tentar recuperar parcialmente', () => {
  assert.throws(
    () => parseBackupText('{"app":', { today: '2026-07-29' }),
    (error) => error instanceof ImportError && error.code === 'BACKUP_JSON_INVALID',
  );
});

test('rejeita arquivo de outra aplicação', () => {
  const backup = validBackup({ app: 'Outro aplicativo' });

  assert.throws(
    () => parseBackupText(JSON.stringify(backup), { today: '2026-07-29' }),
    (error) => error instanceof ImportError && error.code === 'BACKUP_WRONG_APP',
  );
});

test('rejeita formato e versão da aplicação incompatíveis', () => {
  assert.throws(
    () =>
      parseBackupText(JSON.stringify(validBackup({ formatVersion: 99 })), {
        today: '2026-07-29',
      }),
    (error) => error.code === 'BACKUP_FORMAT_UNSUPPORTED',
  );
  assert.throws(
    () =>
      parseBackupText(JSON.stringify(validBackup({ appVersion: 'v9.0' })), {
        today: '2026-07-29',
      }),
    (error) => error.code === 'BACKUP_APP_VERSION_UNSUPPORTED',
  );
});

test('rejeita relações quebradas e preserva a causa como conteúdo inválido', () => {
  const backup = validBackup();
  backup.data.temas[0].materiaId = 'materia-ausente';

  assert.throws(
    () => parseBackupText(JSON.stringify(backup), { today: '2026-07-29' }),
    (error) => error instanceof ImportError && error.code === 'BACKUP_CONTENT_INVALID',
  );
});

test('migra dados antigos válidos antes de concluir a importação', () => {
  const backup = validBackup();
  const assunto = backup.data.assuntos[0];
  backup.data = {
    ...backup.data,
    schemaVersion: 1,
    assuntos: [
      {
        id: assunto.id,
        temaId: assunto.temaId,
        nome: assunto.nome,
        descricao: assunto.descricao,
        estado: 'consolidado',
        dificuldade: assunto.dificuldade,
        observacoes: assunto.observacoes,
        ultimoEstudoEm: assunto.ultimoEstudoEm,
        ordem: assunto.ordem,
        criadoEm: assunto.criadoEm,
        atualizadoEm: assunto.atualizadoEm,
      },
    ],
  };

  const parsed = parseBackupText(JSON.stringify(backup), { today: '2026-07-29' });
  assert.equal(parsed.data.schemaVersion, 2);
  assert.equal(parsed.data.assuntos[0].pontosProgresso, 5);
});
