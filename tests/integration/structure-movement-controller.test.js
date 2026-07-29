import assert from 'node:assert/strict';
import test from 'node:test';

import { StorageError } from '../../src/core/errors.js';
import { createStore } from '../../src/core/store.js';
import { createAppRepository } from '../../src/data/repositories/app-repository.js';
import { createMemoryStorageAdapter } from '../../src/data/storage/memory-storage-adapter.js';
import {
  selectAssuntosByTema,
  selectTemasByMateria,
} from '../../src/domain/selectors/hierarchy-selectors.js';
import { createMateriaWorkspaceController } from '../../src/features/materias/materia-workspace-controller.js';
import { assunto, materia, tema, validData } from '../fixtures/data-builders.js';

function createMovementData() {
  return validData({
    materias: [
      materia({ id: 'materia-1', nome: 'Matemática', ordem: 0 }),
      materia({ id: 'materia-2', nome: 'Física', corId: 'azul', ordem: 1 }),
    ],
    temas: [
      tema({ id: 'tema-1', materiaId: 'materia-1', nome: 'Álgebra', ordem: 0 }),
      tema({ id: 'tema-2', materiaId: 'materia-1', nome: 'Geometria', ordem: 1 }),
      tema({ id: 'tema-3', materiaId: 'materia-2', nome: 'Mecânica', ordem: 0 }),
    ],
    assuntos: [
      assunto({ id: 'assunto-1', temaId: 'tema-1', nome: 'Equação', ordem: 0 }),
      assunto({
        id: 'assunto-2',
        temaId: 'tema-1',
        nome: 'Função',
        descricao: 'Conteúdo preservado',
        ordem: 1,
      }),
      assunto({ id: 'assunto-3', temaId: 'tema-3', nome: 'Velocidade', ordem: 0 }),
    ],
  });
}

function createHarness({ failWrite = false } = {}) {
  const storage = createMemoryStorageAdapter({}, { write: failWrite });
  const repository = createAppRepository({ storageAdapter: storage });
  const store = createStore({
    data: createMovementData(),
    preferences: {},
    ui: {},
    status: { saving: false, lastError: null },
  });
  const controller = createMateriaWorkspaceController({ store, repository });
  return { controller, repository, store };
}

test('move tema entre matérias preservando assuntos e normalizando as duas origens', () => {
  const { controller, store, repository } = createHarness();
  const before = store.getState().data.temas.find(({ id }) => id === 'tema-1');

  const moved = controller.moveTemaTo('tema-1', 'materia-2', {
    targetIndex: 0,
    nowFactory: () => '2026-07-29T12:00:00.000Z',
  });

  assert.deepEqual(
    selectTemasByMateria(store.getState().data, 'materia-1').map(({ id, ordem }) => [id, ordem]),
    [['tema-2', 0]],
  );
  assert.deepEqual(
    selectTemasByMateria(store.getState().data, 'materia-2').map(({ id, ordem }) => [id, ordem]),
    [
      ['tema-1', 0],
      ['tema-3', 1],
    ],
  );
  assert.equal(moved.id, before.id);
  assert.equal(moved.criadoEm, before.criadoEm);
  assert.deepEqual(
    store
      .getState()
      .data.assuntos.filter(({ temaId }) => temaId === 'tema-1')
      .map(({ id }) => id),
    ['assunto-1', 'assunto-2'],
  );
  assert.deepEqual(repository.loadData().data, store.getState().data);
});

test('move assunto para tema de outra matéria preservando conteúdo e normalizando ordens', () => {
  const { controller, store } = createHarness();
  const before = store.getState().data.assuntos.find(({ id }) => id === 'assunto-2');

  const moved = controller.moveAssuntoTo('assunto-2', 'tema-3', {
    targetIndex: 1,
    nowFactory: () => '2026-07-29T12:00:00.000Z',
    todayFactory: () => '2026-07-29',
  });

  assert.deepEqual(
    selectAssuntosByTema(store.getState().data, 'tema-1').map(({ id, ordem }) => [id, ordem]),
    [['assunto-1', 0]],
  );
  assert.deepEqual(
    selectAssuntosByTema(store.getState().data, 'tema-3').map(({ id, ordem }) => [id, ordem]),
    [
      ['assunto-3', 0],
      ['assunto-2', 1],
    ],
  );
  assert.equal(moved.id, before.id);
  assert.equal(moved.criadoEm, before.criadoEm);
  assert.equal(moved.descricao, 'Conteúdo preservado');
});

test('movimentação na mesma origem funciona como reordenação sem duplicar registros', () => {
  const { controller, store } = createHarness();

  controller.moveAssuntoTo('assunto-2', 'tema-1', {
    targetIndex: 0,
    todayFactory: () => '2026-07-29',
  });

  assert.deepEqual(
    selectAssuntosByTema(store.getState().data, 'tema-1').map(({ id, ordem }) => [id, ordem]),
    [
      ['assunto-2', 0],
      ['assunto-1', 1],
    ],
  );
  assert.equal(store.getState().data.assuntos.filter(({ id }) => id === 'assunto-2').length, 1);
});

test('falha de gravação durante movimentação preserva o retrato anterior', () => {
  const { controller, store } = createHarness({ failWrite: true });
  const before = store.getState().data;

  assert.throws(
    () => controller.moveTemaTo('tema-1', 'materia-2', { targetIndex: 0 }),
    StorageError,
  );
  assert.deepEqual(store.getState().data, before);
  assert.equal(store.getState().status.lastError.code, 'MEMORY_WRITE_ERROR');
});
