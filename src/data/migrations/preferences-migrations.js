import { MigrationError } from '../../core/errors.js';
import { PREFERENCES_SCHEMA_VERSION } from '../../domain/constants.js';
import { cloneValue } from '../../utils/clone.js';
import { isPlainObject } from '../../utils/object.js';

export function migratePreferences(value) {
  if (!isPlainObject(value) || !Number.isInteger(value.schemaVersion)) {
    throw new MigrationError('Não foi possível identificar a versão das preferências.');
  }

  if (value.schemaVersion !== PREFERENCES_SCHEMA_VERSION) {
    throw new MigrationError('A versão das preferências não é suportada.', {
      details: { received: value.schemaVersion, supported: PREFERENCES_SCHEMA_VERSION },
    });
  }

  return cloneValue(value);
}
