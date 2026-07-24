import { STORAGE_KEYS, createDefaultPreferences, createEmptyData } from '../../domain/constants.js';
import { validateAppData } from '../../domain/validators/app-data-validator.js';
import { validatePreferences } from '../../domain/validators/preferences-validator.js';
import { cloneValue } from '../../utils/clone.js';
import { migrateData } from '../migrations/data-migrations.js';
import { migratePreferences } from '../migrations/preferences-migrations.js';

export function createAppRepository({ storageAdapter }) {
  if (!storageAdapter) {
    throw new TypeError('O repositório exige um adaptador de armazenamento.');
  }

  function loadData(options = {}) {
    const rawData = storageAdapter.getItem(STORAGE_KEYS.data);

    if (rawData === null) {
      return readyResult(createEmptyData(), false);
    }

    try {
      const parsed = JSON.parse(rawData);
      const migrated = migrateData(parsed);
      return readyResult(
        validateAppData(migrated, options),
        migrated.schemaVersion !== parsed.schemaVersion,
      );
    } catch (error) {
      return Object.freeze({
        status: 'recovery',
        data: null,
        rawData,
        error,
      });
    }
  }

  function saveData(candidate, options = {}) {
    const normalized = validateAppData(candidate, options);
    storageAdapter.setItem(STORAGE_KEYS.data, JSON.stringify(normalized));
    return cloneValue(normalized);
  }

  function loadPreferences() {
    const rawPreferences = storageAdapter.getItem(STORAGE_KEYS.preferences);

    if (rawPreferences === null) {
      return preferenceResult('ready', createDefaultPreferences());
    }

    try {
      const parsed = JSON.parse(rawPreferences);
      const migrated = migratePreferences(parsed);
      return preferenceResult('ready', validatePreferences(migrated));
    } catch (error) {
      return preferenceResult('fallback', createDefaultPreferences(), rawPreferences, error);
    }
  }

  function savePreferences(candidate) {
    const normalized = validatePreferences(candidate);
    storageAdapter.setItem(STORAGE_KEYS.preferences, JSON.stringify(normalized));
    return cloneValue(normalized);
  }

  function clearData() {
    storageAdapter.removeItem(STORAGE_KEYS.data);
  }

  function clearPreferences() {
    storageAdapter.removeItem(STORAGE_KEYS.preferences);
  }

  return Object.freeze({
    loadData,
    saveData,
    loadPreferences,
    savePreferences,
    clearData,
    clearPreferences,
  });
}

function readyResult(data, migrated) {
  return Object.freeze({
    status: 'ready',
    data: cloneValue(data),
    rawData: null,
    error: null,
    migrated,
  });
}

function preferenceResult(status, preferences, rawPreferences = null, error = null) {
  return Object.freeze({
    status,
    preferences: cloneValue(preferences),
    rawPreferences,
    error,
  });
}
