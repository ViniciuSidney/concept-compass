import assert from 'node:assert/strict';
import test from 'node:test';

import { StorageError } from '../../src/core/errors.js';
import { createLocalStorageAdapter } from '../../src/data/storage/local-storage-adapter.js';

test('adaptador encapsula leitura, gravação e remoção', () => {
  const entries = new Map();
  const adapter = createLocalStorageAdapter({
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  });

  adapter.setItem('a', '1');
  assert.equal(adapter.getItem('a'), '1');
  adapter.removeItem('a');
  assert.equal(adapter.getItem('a'), null);
});

test('adaptador converte falha e limite em StorageError conhecido', () => {
  const quotaError = new Error('quota');
  quotaError.name = 'QuotaExceededError';
  const adapter = createLocalStorageAdapter({
    getItem: () => {
      throw new Error('read');
    },
    setItem: () => {
      throw quotaError;
    },
    removeItem: () => {
      throw new Error('remove');
    },
  });

  assert.throws(() => adapter.getItem('a'), StorageError);
  assert.throws(
    () => adapter.setItem('a', '1'),
    (error) => error.code === 'STORAGE_QUOTA_EXCEEDED' && error.operation === 'write',
  );
  assert.throws(() => adapter.removeItem('a'), StorageError);
});
