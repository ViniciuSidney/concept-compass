import assert from 'node:assert/strict';
import test from 'node:test';

import { StorageError } from '../../src/core/errors.js';
import { createStore } from '../../src/core/store.js';
import { createAppRepository } from '../../src/data/repositories/app-repository.js';
import { createMemoryStorageAdapter } from '../../src/data/storage/memory-storage-adapter.js';
import { createEmptyData } from '../../src/domain/constants.js';
import { createMateriasController } from '../../src/features/materias/materias-controller.js';

function createHarness({ failWrite = false } = {}) {
  const storage = createMemoryStorageAdapter({}, { write: failWrite });
  const repository = createAppRepository({ storageAdapter: storage });
  const store = createStore({
    data: createEmptyData(),
    preferences: {},
    ui: {},
    status: { saving: false, lastError: null },
  });
  const controller = createMateriasController({ store, repository });

  return { storage, repository, store, controller };
}

test('cria, edita, reordena e remove matérias com persistência', () => {
  const { controller, repository, store } = createHarness();
  const first = controller.add(
    { nome: 'Matemática', descricao: '', corId: 'roxo' },
    { idFactory: () => 'm1', nowFactory: () => '2026-07-24T12:00:00.000Z' },
  );
  const second = controller.add(
    { nome: 'História', descricao: '', corId: 'azul' },
    { idFactory: () => 'm2', nowFactory: () => '2026-07-24T13:00:00.000Z' },
  );

  controller.edit(
    first.id,
    { nome: 'Matemática Geral', descricao: 'Base', corId: 'verde' },
    { nowFactory: () => '2026-07-24T14:00:00.000Z' },
  );
  controller.reorder(second.id, 0);

  assert.deepEqual(
    store.getState().data.materias.map(({ id }) => id),
    ['m2', 'm1'],
  );
  assert.equal(store.getState().data.materias[1].nome, 'Matemática Geral');
  assert.deepEqual(repository.loadData().data, store.getState().data);

  controller.remove(first.id);
  assert.deepEqual(
    store.getState().data.materias.map(({ id }) => id),
    ['m2'],
  );
});

test('falha de gravação preserva dados em memória e registra erro', () => {
  const { controller, store } = createHarness({ failWrite: true });

  assert.throws(
    () =>
      controller.add(
        { nome: 'Matemática', descricao: '', corId: 'roxo' },
        { idFactory: () => 'm1', nowFactory: () => '2026-07-24T12:00:00.000Z' },
      ),
    StorageError,
  );
  assert.deepEqual(store.getState().data, createEmptyData());
  assert.equal(store.getState().status.saving, false);
  assert.equal(store.getState().status.lastError.code, 'MEMORY_WRITE_ERROR');
});
