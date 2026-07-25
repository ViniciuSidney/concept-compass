import assert from 'node:assert/strict';
import test from 'node:test';

import { DIFFICULTIES, STUDY_STATES, createEmptyData } from '../../src/domain/constants.js';
import {
  selectDashboardSummary,
  selectMateriaProgressHighlights,
  selectRecentStudies,
  selectStateDistribution,
  selectStudyPriorities,
} from '../../src/features/dashboard/dashboard-selectors.js';
import { assunto, materia, tema } from '../fixtures/data-builders.js';

function dashboardData() {
  return {
    ...createEmptyData(),
    materias: [
      materia({ id: 'm1', nome: 'Matemática', ordem: 0 }),
      materia({ id: 'm2', nome: 'História', ordem: 1 }),
      materia({ id: 'm3', nome: 'Física', ordem: 2 }),
    ],
    temas: [
      tema({ id: 't1', materiaId: 'm1', nome: 'Álgebra', ordem: 0 }),
      tema({ id: 't2', materiaId: 'm2', nome: 'Brasil', ordem: 0 }),
      tema({ id: 't3', materiaId: 'm2', nome: 'Mundo', ordem: 1 }),
    ],
    assuntos: [
      assunto({
        id: 'a1',
        temaId: 't1',
        nome: 'Equações',
        ordem: 0,
        estado: STUDY_STATES.EM_ESTUDO,
        dificuldade: DIFFICULTIES.MEDIA,
        ultimoEstudoEm: '2026-07-20',
      }),
      assunto({
        id: 'a2',
        temaId: 't1',
        nome: 'Funções',
        ordem: 1,
        estado: STUDY_STATES.PRECISA_REFORCO,
        dificuldade: DIFFICULTIES.DIFICIL,
        ultimoEstudoEm: '2026-07-18',
      }),
      assunto({
        id: 'a3',
        temaId: 't2',
        nome: 'Brasil Colônia',
        ordem: 0,
        estado: STUDY_STATES.CONSOLIDADO,
        dificuldade: DIFFICULTIES.FACIL,
        ultimoEstudoEm: '2026-07-22',
      }),
      assunto({
        id: 'a4',
        temaId: 't3',
        nome: 'Revolução Francesa',
        ordem: 0,
        estado: STUDY_STATES.NAO_INICIADO,
        dificuldade: DIFFICULTIES.DIFICIL,
        ultimoEstudoEm: null,
      }),
    ],
  };
}

test('resumo do dashboard calcula contagens, progresso e lacunas estruturais', () => {
  const summary = selectDashboardSummary(dashboardData());

  assert.equal(summary.materiasCount, 3);
  assert.equal(summary.temasCount, 3);
  assert.equal(summary.assuntosCount, 4);
  assert.equal(summary.progress, 43.75);
  assert.equal(summary.emEstudoCount, 1);
  assert.equal(summary.reforcoCount, 1);
  assert.equal(summary.consolidadosCount, 1);
  assert.equal(summary.materiasSemTemasCount, 1);
  assert.equal(summary.temasSemAssuntosCount, 0);
});

test('distribuição mantém os cinco estados oficiais e percentuais', () => {
  const distribution = selectStateDistribution(dashboardData());

  assert.equal(distribution.length, 5);
  assert.deepEqual(
    distribution.map(({ count }) => count),
    [1, 1, 0, 1, 1],
  );
  assert.deepEqual(
    distribution.map(({ percentage }) => percentage),
    [25, 25, 0, 25, 25],
  );
});

test('prioridades colocam reforço antes de andamento e dificuldade alta', () => {
  const priorities = selectStudyPriorities(dashboardData());

  assert.deepEqual(
    priorities.map(({ assunto: item }) => item.id),
    ['a2', 'a1', 'a4'],
  );
  assert.equal(priorities[0].materia.nome, 'Matemática');
  assert.equal(priorities[2].tema.nome, 'Mundo');
});

test('estudos recentes são ordenados pela última data registrada', () => {
  const recent = selectRecentStudies(dashboardData());

  assert.deepEqual(
    recent.map(({ assunto: item }) => item.id),
    ['a3', 'a1', 'a2'],
  );
});

test('destaques de matérias priorizam o menor progresso com assuntos', () => {
  const highlights = selectMateriaProgressHighlights(dashboardData());

  assert.deepEqual(
    highlights.map(({ materia: item }) => item.id),
    ['m1', 'm2'],
  );
  assert.equal(highlights[0].progress, 37.5);
  assert.equal(highlights[1].progress, 50);
});

test('seletores devolvem estados seguros quando não há dados', () => {
  const empty = createEmptyData();

  assert.equal(selectDashboardSummary(empty).progress, null);
  assert.ok(selectStateDistribution(empty).every(({ count, percentage }) => !count && !percentage));
  assert.deepEqual(selectStudyPriorities(empty), []);
  assert.deepEqual(selectRecentStudies(empty), []);
  assert.deepEqual(selectMateriaProgressHighlights(empty), []);
});
