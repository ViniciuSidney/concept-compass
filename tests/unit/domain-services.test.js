import assert from 'node:assert/strict';
import test from 'node:test';

import { STUDY_STATES, createEmptyData } from '../../src/domain/constants.js';
import {
  createAssunto,
  deleteAssunto,
  moveAssunto,
  updateAssunto,
} from '../../src/domain/services/assunto-service.js';
import {
  createMateria,
  deleteMateriaCascade,
  reorderMaterias,
  updateMateria,
} from '../../src/domain/services/materia-service.js';
import {
  createTema,
  deleteTemaCascade,
  moveTema,
  updateTema,
} from '../../src/domain/services/tema-service.js';

function createFactories() {
  const ids = ['materia-1', 'materia-2', 'tema-1', 'tema-2', 'assunto-1', 'assunto-2'];

  return {
    idFactory: () => ids.shift(),
    nowFactory: () => '2026-07-24T12:00:00.000Z',
    laterFactory: () => '2026-07-24T13:00:00.000Z',
    todayFactory: () => '2026-07-24',
  };
}

test('cria e edita matéria preservando ID e criação', () => {
  const { idFactory, nowFactory, laterFactory } = createFactories();
  const created = createMateria(
    createEmptyData(),
    { nome: 'Matemática', descricao: '', corId: 'roxo' },
    { idFactory, nowFactory },
  );
  const updated = updateMateria(
    created.data,
    created.materia.id,
    { nome: 'Matemática básica', descricao: 'Base', corId: 'azul' },
    { nowFactory: laterFactory },
  );

  assert.equal(updated.materia.id, created.materia.id);
  assert.equal(updated.materia.criadoEm, created.materia.criadoEm);
  assert.equal(updated.materia.atualizadoEm, '2026-07-24T13:00:00.000Z');
});

test('constrói hierarquia completa e aplica padrões do assunto', () => {
  const { idFactory, nowFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  const materiaId = data.materias[0].id;
  ({ data } = createTema(data, materiaId, { nome: 'T' }, { idFactory, nowFactory }));
  const temaId = data.temas[0].id;
  const result = createAssunto(
    data,
    temaId,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  );

  assert.equal(result.assunto.estado, 'nao_iniciado');
  assert.equal(result.assunto.dificuldade, 'nao_definida');
  assert.equal(result.assunto.ultimoEstudoEm, null);
});

test('edições de tema e assunto preservam relações', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));

  const temaResult = updateTema(
    data,
    data.temas[0].id,
    { nome: 'T2' },
    { nowFactory: laterFactory },
  );
  const assuntoResult = updateAssunto(
    temaResult.data,
    data.assuntos[0].id,
    {
      nome: 'S2',
      estado: STUDY_STATES.EM_ESTUDO,
      ultimoEstudoEm: '2026-07-24',
    },
    { nowFactory: laterFactory, todayFactory },
  );

  assert.equal(temaResult.tema.materiaId, data.materias[0].id);
  assert.equal(assuntoResult.assunto.temaId, data.temas[0].id);
  assert.equal(assuntoResult.assunto.estado, 'em_estudo');
});

test('move tema preservando assuntos e normaliza origem e destino', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createMateria(data, { nome: 'B', corId: 'verde' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));

  const moved = moveTema(data, data.temas[0].id, data.materias[1].id, { nowFactory: laterFactory });

  assert.equal(moved.temas[0].materiaId, data.materias[1].id);
  assert.equal(moved.assuntos[0].temaId, moved.temas[0].id);
  assert.equal(moved.temas[0].ordem, 0);
});

test('move assunto entre temas e normaliza as ordens', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T1' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T2' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));

  const moved = moveAssunto(data, data.assuntos[0].id, data.temas[1].id, {
    nowFactory: laterFactory,
    todayFactory,
  });

  assert.equal(moved.assuntos[0].temaId, data.temas[1].id);
  assert.equal(moved.assuntos[0].ordem, 0);
});

test('exclusões respeitam cascatas e quantidades', () => {
  const { idFactory, nowFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));

  const assuntoRemoved = deleteAssunto(data, data.assuntos[0].id, { today: '2026-07-24' });
  assert.equal(assuntoRemoved.assuntos.length, 0);

  data = assuntoRemoved;
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S2' },
    { idFactory, nowFactory, todayFactory },
  ));
  const temaRemoved = deleteTemaCascade(data, data.temas[0].id);
  assert.deepEqual(temaRemoved.removed, { temas: 1, assuntos: 1 });

  const materiaRemoved = deleteMateriaCascade(data, data.materias[0].id);
  assert.deepEqual(materiaRemoved.removed, { materias: 1, temas: 1, assuntos: 1 });
});

test('reordena matérias sem modificar a entrada', () => {
  const { idFactory, nowFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createMateria(data, { nome: 'B', corId: 'verde' }, { idFactory, nowFactory }));
  const originalOrder = data.materias.map(({ id }) => id);
  const reordered = reorderMaterias(data, data.materias[1].id, 0);

  assert.deepEqual(
    data.materias.map(({ id }) => id),
    originalOrder,
  );
  assert.equal(reordered.materias[0].id, originalOrder[1]);
});
