import { StorageError } from '../../core/errors.js';

export function createMemoryStorageAdapter(initialEntries = {}, failureOptions = {}) {
  const entries = new Map(Object.entries(initialEntries));

  function assertOperation(operation, key) {
    if (failureOptions[operation]) {
      throw new StorageError(`Falha simulada de ${operation}.`, {
        operation,
        key,
        code: `MEMORY_${operation.toUpperCase()}_ERROR`,
      });
    }
  }

  return Object.freeze({
    getItem(key) {
      assertOperation('read', key);
      return entries.has(key) ? entries.get(key) : null;
    },
    setItem(key, value) {
      assertOperation('write', key);
      entries.set(key, String(value));
    },
    removeItem(key) {
      assertOperation('remove', key);
      entries.delete(key);
    },
    dump() {
      return Object.fromEntries(entries);
    },
  });
}
