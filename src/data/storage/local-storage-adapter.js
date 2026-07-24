import { StorageError } from '../../core/errors.js';

export function createLocalStorageAdapter(storage = globalThis.localStorage) {
  if (
    !storage ||
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function' ||
    typeof storage.removeItem !== 'function'
  ) {
    throw new TypeError('O adaptador exige uma implementação compatível com Storage.');
  }

  function getItem(key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      throw createStorageError('Não foi possível ler os dados locais.', 'read', key, error);
    }
  }

  function setItem(key, value) {
    try {
      storage.setItem(key, value);
    } catch (error) {
      const isQuotaError = error?.name === 'QuotaExceededError';
      throw createStorageError(
        isQuotaError
          ? 'O armazenamento local atingiu o limite disponível.'
          : 'Não foi possível salvar os dados locais.',
        'write',
        key,
        error,
        isQuotaError ? 'STORAGE_QUOTA_EXCEEDED' : 'STORAGE_WRITE_ERROR',
      );
    }
  }

  function removeItem(key) {
    try {
      storage.removeItem(key);
    } catch (error) {
      throw createStorageError('Não foi possível remover os dados locais.', 'remove', key, error);
    }
  }

  return Object.freeze({ getItem, setItem, removeItem });
}

function createStorageError(message, operation, key, cause, code) {
  return new StorageError(message, { cause, operation, key, code });
}
