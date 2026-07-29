import assert from 'node:assert/strict';
import test from 'node:test';

import { createEmptyData } from '../../src/domain/constants.js';
import {
  changeAssuntoProgress,
  completeAssuntoProgress,
  createAssunto,
  deleteAssunto,
  increaseAssuntoProgressTotal,
  moveAssunto,
  resetAssuntoProgress,
  setAssuntoProgress,
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
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  const result = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  );

  assert.equal(result.assunto.pontosProgresso, 0);
  assert.equal(result.assunto.metaPontosProgresso, 5);
  assert.equal(result.assunto.precisaReforco, false);
  assert.equal(result.assunto.dificuldade, 'nao_definida');
  assert.equal(result.assunto.ultimoEstudoEm, null);
});

test('edições de tema e assunto preservam relações e progresso', () => {
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
      pontosProgresso: 2,
      metaPontosProgresso: 6,
      precisaReforco: true,
      ultimoEstudoEm: '2026-07-24',
    },
    { nowFactory: laterFactory, todayFactory },
  );

  assert.equal(temaResult.tema.materiaId, data.materias[0].id);
  assert.equal(assuntoResult.assunto.temaId, data.temas[0].id);
  assert.equal(assuntoResult.assunto.pontosProgresso, 2);
  assert.equal(assuntoResult.assunto.metaPontosProgresso, 6);
  assert.equal(assuntoResult.assunto.precisaReforco, true);
});

test('operações rápidas de progresso respeitam limites e preservam o assunto', () => {
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
  const id = data.assuntos[0].id;

  ({ data } = changeAssuntoProgress(data, id, 1, { nowFactory: laterFactory, todayFactory }));
  assert.equal(data.assuntos[0].pontosProgresso, 1);
  ({ data } = increaseAssuntoProgressTotal(data, id, { nowFactory: laterFactory, todayFactory }));
  assert.equal(data.assuntos[0].metaPontosProgresso, 6);
  ({ data } = completeAssuntoProgress(data, id, { nowFactory: laterFactory, todayFactory }));
  assert.equal(data.assuntos[0].pontosProgresso, 6);
  ({ data } = resetAssuntoProgress(data, id, { nowFactory: laterFactory, todayFactory }));
  assert.equal(data.assuntos[0].pontosProgresso, 0);
  ({ data } = setAssuntoProgress(
    data,
    id,
    { pontosProgresso: 4, metaPontosProgresso: 8, precisaReforco: true },
    { nowFactory: laterFactory, todayFactory },
  ));
  assert.equal(data.assuntos[0].pontosProgresso, 4);
  assert.equal(data.assuntos[0].metaPontosProgresso, 8);
  assert.equal(data.assuntos[0].precisaReforco, true);
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
