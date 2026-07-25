import assert from 'node:assert/strict';
import test from 'node:test';

import { StorageError } from '../../src/core/errors.js';
import { createStore } from '../../src/core/store.js';
import { createAppRepository } from '../../src/data/repositories/app-repository.js';
import { createMemoryStorageAdapter } from '../../src/data/storage/memory-storage-adapter.js';
import { STUDY_STATES } from '../../src/domain/constants.js';
import {
  selectAssuntosByTema,
  selectTemasByMateria,
} from '../../src/domain/selectors/hierarchy-selectors.js';
import { createMateriaWorkspaceController } from '../../src/features/materias/materia-workspace-controller.js';
import { materia, validData } from '../fixtures/data-builders.js';

function createHarness({ failWrite = false } = {}) {
  const storage = createMemoryStorageAdapter({}, { write: failWrite });
  const repository = createAppRepository({ storageAdapter: storage });
  const store = createStore({
    data: validData({ materias: [materia()], temas: [], assuntos: [] }),
    preferences: {},
    ui: {},
    status: { saving: false, lastError: null },
  });
  const controller = createMateriaWorkspaceController({ store, repository });

  return { storage, repository, store, controller };
}

const firstTime = () => '2026-07-24T12:00:00.000Z';
const secondTime = () => '2026-07-24T13:00:00.000Z';
const today = () => '2026-07-24';

test('cria, edita e reordena temas com persistência', () => {
  const { controller, repository, store } = createHarness();
  const algebra = controller.addTema(
    'materia-1',
    { nome: 'Álgebra', descricao: '' },
    { idFactory: () => 'tema-a', nowFactory: firstTime },
  );
  const geometria = controller.addTema(
    'materia-1',
    { nome: 'Geometria', descricao: '' },
    { idFactory: () => 'tema-b', nowFactory: secondTime },
  );

  controller.editTema(
    algebra.id,
    { nome: 'Álgebra básica', descricao: 'Fundamentos' },
    { nowFactory: secondTime },
  );
  controller.reorderTema(geometria.id, 0);

  assert.deepEqual(
    selectTemasByMateria(store.getState().data, 'materia-1').map(({ id }) => id),
    ['tema-b', 'tema-a'],
  );
  assert.equal(selectTemasByMateria(store.getState().data, 'materia-1')[1].nome, 'Álgebra básica');
  assert.deepEqual(repository.loadData().data, store.getState().data);
});

test('cria, edita, reordena e remove assuntos com persistência', () => {
  const { controller, repository, store } = createHarness();
  const tema = controller.addTema(
    'materia-1',
    { nome: 'Álgebra', descricao: '' },
    { idFactory: () => 'tema-a', nowFactory: firstTime },
  );
  const equacao = controller.addAssunto(
    tema.id,
    { nome: 'Equação', estado: STUDY_STATES.NAO_INICIADO },
    { idFactory: () => 'assunto-a', nowFactory: firstTime, todayFactory: today },
  );
  const funcao = controller.addAssunto(
    tema.id,
    { nome: 'Função', estado: STUDY_STATES.EM_ESTUDO },
    { idFactory: () => 'assunto-b', nowFactory: secondTime, todayFactory: today },
  );

  controller.editAssunto(
    equacao.id,
    {
      nome: 'Equação do primeiro grau',
      descricao: 'Base algébrica',
      estado: STUDY_STATES.ESTUDADO,
      dificuldade: 'media',
      observacoes: 'Revisar problemas',
      ultimoEstudoEm: '2026-07-23',
    },
    { nowFactory: secondTime, todayFactory: today },
  );
  controller.reorderAssunto(funcao.id, 0, { today: '2026-07-24' });

  assert.deepEqual(
    selectAssuntosByTema(store.getState().data, tema.id).map(({ id }) => id),
    ['assunto-b', 'assunto-a'],
  );
  assert.equal(
    selectAssuntosByTema(store.getState().data, tema.id)[1].estado,
    STUDY_STATES.ESTUDADO,
  );
  assert.deepEqual(repository.loadData().data, store.getState().data);

  controller.removeAssunto(funcao.id, { today: '2026-07-24' });
  assert.deepEqual(
    store.getState().data.assuntos.map(({ id }) => id),
    ['assunto-a'],
  );
});

test('exclusão de tema remove assuntos relacionados e normaliza a ordem', () => {
  const { controller, store } = createHarness();
  const first = controller.addTema(
    'materia-1',
    { nome: 'Álgebra' },
    { idFactory: () => 'tema-a', nowFactory: firstTime },
  );
  const second = controller.addTema(
    'materia-1',
    { nome: 'Geometria' },
    { idFactory: () => 'tema-b', nowFactory: secondTime },
  );
  controller.addAssunto(
    first.id,
    { nome: 'Equação' },
    { idFactory: () => 'assunto-a', nowFactory: firstTime, todayFactory: today },
  );

  const removed = controller.removeTema(first.id);

  assert.deepEqual(removed, { temas: 1, assuntos: 1 });
  assert.deepEqual(store.getState().data.temas, [{ ...second, ordem: 0 }]);
  assert.deepEqual(store.getState().data.assuntos, []);
});

test('falha de gravação preserva o retrato anterior e registra erro', () => {
  const { controller, store } = createHarness({ failWrite: true });
  const before = store.getState().data;

  assert.throws(
    () =>
      controller.addTema(
        'materia-1',
        { nome: 'Álgebra' },
        { idFactory: () => 'tema-a', nowFactory: firstTime },
      ),
    StorageError,
  );
  assert.deepEqual(store.getState().data, before);
  assert.equal(store.getState().status.saving, false);
  assert.equal(store.getState().status.lastError.code, 'MEMORY_WRITE_ERROR');
});
