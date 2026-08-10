import assert from 'node:assert/strict';
import test from 'node:test';

import { DIFFICULTIES, createEmptyData } from '../../src/domain/constants.js';
import {
  selectDashboardSummary,
  selectMateriaProgressHighlights,
  selectProgressDistribution,
  selectRecentStudies,
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
        dificuldade: DIFFICULTIES.MEDIA,
      }),
      assunto({
        id: 'a2',
        temaId: 't1',
        nome: 'Funções',
        ordem: 1,
        dificuldade: DIFFICULTIES.DIFICIL,
      }),
      assunto({
        id: 'a3',
        temaId: 't2',
        nome: 'Brasil Colônia',
        ordem: 0,
        dificuldade: DIFFICULTIES.FACIL,
      }),
      assunto({
        id: 'a4',
        temaId: 't3',
        nome: 'Revolução Francesa',
        ordem: 0,
        dificuldade: DIFFICULTIES.DIFICIL,
      }),
    ],
  };
}

function subjectSummary({
  id,
  progress = 0,
  status = 'not_started',
  pendingErrors = 0,
  pendingReviews = 0,
  lastActivityAt = null,
  consolidated = status === 'consolidated',
}) {
  return {
    subjectId: id,
    status,
    progress,
    maxProgress: 10,
    sourceArchived: status === 'archived',
    consolidated,
    pendingErrors,
    pendingReviews,
    lastActivityAt,
  };
}

function readySnapshot() {
  return {
    status: 'ready',
    receivedContractVersion: '1.0.0',
    summary: {
      updatedAt: '2026-08-08T05:00:00.000Z',
      subjects: {
        a1: subjectSummary({
          id: 'a1',
          progress: 2,
          status: 'in_progress',
          lastActivityAt: '2026-08-02T12:00:00.000Z',
        }),
        a2: subjectSummary({
          id: 'a2',
          progress: 7,
          status: 'in_progress',
          pendingErrors: 1,
          lastActivityAt: '2026-08-01T12:00:00.000Z',
        }),
        a3: subjectSummary({
          id: 'a3',
          progress: 10,
          status: 'consolidated',
          lastActivityAt: '2026-08-03T12:00:00.000Z',
        }),
      },
    },
  };
}

test('resumo do dashboard usa somente os pontos sincronizados do Study Stack', () => {
  const summary = selectDashboardSummary(dashboardData(), readySnapshot());

  assert.equal(summary.materiasCount, 3);
  assert.equal(summary.temasCount, 3);
  assert.equal(summary.assuntosCount, 4);
  assert.equal(summary.points, 19);
  assert.equal(summary.totalPoints, 40);
  assert.equal(summary.progress, 48);
  assert.equal(summary.emAndamentoCount, 2);
  assert.equal(summary.pendenciasCount, 1);
  assert.equal(summary.consolidadosCount, 1);
  assert.equal(summary.materiasSemTemasCount, 1);
  assert.equal(summary.temasSemAssuntosCount, 0);
});

test('distribuição deriva as situações publicadas pelo Study Stack', () => {
  const distribution = selectProgressDistribution(dashboardData(), readySnapshot());

  assert.equal(distribution.length, 4);
  assert.deepEqual(
    distribution.map(({ count }) => count),
    [1, 2, 1, 0],
  );
  assert.deepEqual(
    distribution.map(({ percentage }) => percentage),
    [25, 50, 25, 0],
  );
});

test('prioridades usam pendências e andamento sincronizados antes da dificuldade local', () => {
  const priorities = selectStudyPriorities(dashboardData(), {
    studyStackSnapshot: readySnapshot(),
  });

  assert.deepEqual(
    priorities.map(({ assunto: item }) => item.id),
    ['a2', 'a1', 'a4'],
  );
  assert.equal(priorities[0].priorityReason, 'Pendências no Study Stack');
  assert.equal(priorities[2].priorityReason, 'Dificuldade alta');
});

test('estudos recentes usam lastActivityAt do Study Stack e ignoram ultimoEstudoEm legado', () => {
  const data = dashboardData();
  data.assuntos[0].ultimoEstudoEm = '2025-01-01';
  const recent = selectRecentStudies(data, {
    studyStackSnapshot: readySnapshot(),
  });

  assert.deepEqual(
    recent.map(({ assunto: item }) => item.id),
    ['a3', 'a1', 'a2'],
  );
  assert.equal(recent[0].lastActivityAt, '2026-08-03T12:00:00.000Z');
});

test('destaques de matérias usam agregação objetiva de dez pontos por Assunto', () => {
  const highlights = selectMateriaProgressHighlights(dashboardData(), {
    studyStackSnapshot: readySnapshot(),
  });

  assert.deepEqual(
    highlights.map(({ materia: item }) => item.id),
    ['m1', 'm2'],
  );
  assert.equal(highlights[0].progress, 45);
  assert.equal(highlights[1].progress, 50);
  assert.equal(highlights[0].progressSummary.points, 9);
  assert.equal(highlights[0].progressSummary.total, 20);
});

test('sincronização pendente bloqueia indicadores sem recorrer ao progresso legado', () => {
  const data = dashboardData();
  Object.assign(data.assuntos[0], {
    pontosProgresso: 5,
    metaPontosProgresso: 5,
    precisaReforco: true,
    ultimoEstudoEm: '2025-01-01',
  });
  const pending = { status: 'pending', summary: null };
  const summary = selectDashboardSummary(data, pending);

  assert.equal(summary.studyStatus, 'pending');
  assert.equal(summary.progress, null);
  assert.equal(summary.points, null);
  assert.deepEqual(selectProgressDistribution(data, pending), []);
  assert.deepEqual(selectStudyPriorities(data, { studyStackSnapshot: pending }), []);
  assert.deepEqual(selectRecentStudies(data, { studyStackSnapshot: pending }), []);
});

test('seletores devolvem estados seguros quando não há dados', () => {
  const empty = createEmptyData();

  assert.equal(selectDashboardSummary(empty).progress, null);
  assert.ok(
    selectProgressDistribution(empty).every(({ count, percentage }) => !count && !percentage),
  );
  assert.deepEqual(selectStudyPriorities(empty), []);
  assert.deepEqual(selectRecentStudies(empty), []);
  assert.deepEqual(selectMateriaProgressHighlights(empty), []);
});
