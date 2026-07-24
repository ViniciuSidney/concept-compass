import { MigrationError } from '../../core/errors.js';
import { DATA_SCHEMA_VERSION } from '../../domain/constants.js';
import { cloneValue } from '../../utils/clone.js';
import { isPlainObject } from '../../utils/object.js';

export function migrateData(value) {
  if (!isPlainObject(value) || !Number.isInteger(value.schemaVersion)) {
    throw new MigrationError('Não foi possível identificar a versão da estrutura dos dados.');
  }

  if (value.schemaVersion > DATA_SCHEMA_VERSION) {
    throw new MigrationError(
      'O arquivo utiliza uma versão de dados mais recente que a aplicação.',
      {
        details: { received: value.schemaVersion, supported: DATA_SCHEMA_VERSION },
      },
    );
  }

  if (value.schemaVersion < 1) {
    throw new MigrationError('A versão da estrutura dos dados não pode ser migrada.');
  }

  let migrated = cloneValue(value);

  while (migrated.schemaVersion < DATA_SCHEMA_VERSION) {
    const migration = DATA_MIGRATIONS.get(migrated.schemaVersion);

    if (!migration) {
      throw new MigrationError('Não existe uma sequência segura de migração para esses dados.');
    }

    migrated = migration(migrated);
  }

  return migrated;
}

const DATA_MIGRATIONS = new Map();
