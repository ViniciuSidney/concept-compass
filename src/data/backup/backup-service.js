import { APP_CONFIG } from '../../core/config.js';
import { ImportError } from '../../core/errors.js';
import { validateAppData } from '../../domain/validators/app-data-validator.js';
import { validatePreferences } from '../../domain/validators/preferences-validator.js';
import { createIsoTimestamp, createLocalDate, isValidIsoTimestamp } from '../../utils/date.js';
import { isPlainObject } from '../../utils/object.js';
import { migrateData } from '../migrations/data-migrations.js';
import { migratePreferences } from '../migrations/preferences-migrations.js';

export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_APP_NAME = APP_CONFIG.name;
export const BACKUP_LEGACY_APP_NAMES = APP_CONFIG.legacyNames;
export const BACKUP_ACCEPTED_APP_NAMES = Object.freeze([
  BACKUP_APP_NAME,
  ...BACKUP_LEGACY_APP_NAMES,
]);
export const BACKUP_ACCEPTED_APP_VERSIONS = APP_CONFIG.backupCompatibleVersions;
export const BACKUP_FILE_PREFIX = 'concept-compass-backup';

export function createBackupDocument({ data, preferences, now = new Date(), today } = {}) {
  const exportedAt = createIsoTimestamp(now);
  const validationDate = today ?? createLocalDate(now);

  return Object.freeze({
    app: BACKUP_APP_NAME,
    appVersion: APP_CONFIG.productVersion,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt,
    data: validateAppData(data, { today: validationDate }),
    preferences: validatePreferences(preferences),
  });
}

export function serializeBackup(documentValue) {
  return `${JSON.stringify(documentValue, null, 2)}\n`;
}

export function createBackupFileName(now = new Date()) {
  return `${BACKUP_FILE_PREFIX}-${createLocalDate(now)}.json`;
}

export function parseBackupText(text, { today = createLocalDate() } = {}) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new ImportError('O arquivo de backup está vazio.', {
      code: 'BACKUP_EMPTY',
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new ImportError('O arquivo não contém um JSON válido.', {
      cause: error,
      code: 'BACKUP_JSON_INVALID',
    });
  }

  if (!isPlainObject(parsed)) {
    throw new ImportError('O backup precisa possuir uma estrutura de objeto válida.', {
      code: 'BACKUP_STRUCTURE_INVALID',
    });
  }

  if (!BACKUP_ACCEPTED_APP_NAMES.includes(parsed.app)) {
    throw new ImportError('O arquivo pertence a outra aplicação.', {
      code: 'BACKUP_WRONG_APP',
      details: { received: parsed.app ?? null, accepted: BACKUP_ACCEPTED_APP_NAMES },
    });
  }

  if (parsed.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new ImportError('A versão do formato de backup não é compatível.', {
      code: 'BACKUP_FORMAT_UNSUPPORTED',
      details: { received: parsed.formatVersion ?? null, supported: BACKUP_FORMAT_VERSION },
    });
  }

  if (!BACKUP_ACCEPTED_APP_VERSIONS.includes(parsed.appVersion)) {
    throw new ImportError('O backup foi criado por uma versão incompatível da aplicação.', {
      code: 'BACKUP_APP_VERSION_UNSUPPORTED',
      details: { received: parsed.appVersion ?? null, accepted: BACKUP_ACCEPTED_APP_VERSIONS },
    });
  }

  if (!isValidIsoTimestamp(parsed.exportedAt)) {
    throw new ImportError('A data de exportação do backup é inválida.', {
      code: 'BACKUP_DATE_INVALID',
    });
  }

  try {
    const migratedData = migrateData(parsed.data);
    const migratedPreferences = migratePreferences(parsed.preferences);
    const data = validateAppData(migratedData, { today });
    const preferences = validatePreferences(migratedPreferences);

    return Object.freeze({
      app: BACKUP_APP_NAME,
      appVersion: APP_CONFIG.productVersion,
      formatVersion: BACKUP_FORMAT_VERSION,
      exportedAt: parsed.exportedAt,
      data,
      preferences,
    });
  } catch (error) {
    if (error instanceof ImportError) throw error;

    throw new ImportError(createValidationMessage(error), {
      cause: error,
      code: 'BACKUP_CONTENT_INVALID',
      details: { originalCode: error?.code ?? null },
    });
  }
}

export function createBackupSummary(backup) {
  return Object.freeze({
    exportedAt: backup.exportedAt,
    appVersion: backup.appVersion,
    theme: backup.preferences.theme,
    materias: backup.data.materias.length,
    temas: backup.data.temas.length,
    assuntos: backup.data.assuntos.length,
  });
}

function createValidationMessage(error) {
  if (error?.code === 'MIGRATION_ERROR') {
    return 'A estrutura dos dados utiliza uma versão incompatível.';
  }
  if (error?.code === 'VALIDATION_ERROR') {
    return 'O backup possui dados inválidos ou relações quebradas.';
  }
  return 'Não foi possível validar o conteúdo do backup.';
}
