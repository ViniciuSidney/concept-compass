import assert from 'node:assert/strict';
import test from 'node:test';

import {
  readStudyStackProgressAggregate,
  summarizeStudyStackProgress,
} from '../../src/integrations/study-stack-progress-aggregate.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

function assuntos() {
  return [
    { id: 'assunto-1', nome: 'A' },
    { id: 'assunto-2', nome: 'B' },
  ];
}

function snapshot(subjects) {
  return {
    status: 'ready',
    summary: {
      updatedAt: '2026-08-07T10:00:00.000Z',
      subjects,
    },
  };
}

function subject(overrides = {}) {
  return {
    progress: 4,
    maxProgress: 10,
    status: 'in_progress',
    consolidated: false,
    ...overrides,
  };
}

test('agregado vazio não inventa progresso', () => {
  assert.deepEqual(summarizeStudyStackProgress([], { status: 'missing' }), {
    status: 'empty',
    points: null,
    total: null,
    percentage: null,
    subjectsCount: 0,
    startedSubjects: 0,
    consolidatedSubjects: 0,
    summaryUpdatedAt: null,
  });
});

test('ausência do resumo considera capacidade oficial de dez por Assunto', () => {
  const result = summarizeStudyStackProgress(assuntos(), { status: 'missing', summary: null });

  assert.equal(result.status, 'not_started');
  assert.equal(result.points, 0);
  assert.equal(result.total, 20);
  assert.equal(result.percentage, 0);
});

test('soma somente Assuntos existentes no Concept Compass e mantém não iniciados em zero', () => {
  const result = summarizeStudyStackProgress(
    assuntos(),
    snapshot({
      'assunto-1': subject(),
      'assunto-fora': subject({ progress: 10, status: 'consolidated', consolidated: true }),
    }),
  );

  assert.equal(result.points, 4);
  assert.equal(result.total, 20);
  assert.equal(result.percentage, 20);
  assert.equal(result.startedSubjects, 1);
  assert.equal(result.consolidatedSubjects, 0);
});

test('agregado soma progresso sincronizado e reconhece consolidação completa', () => {
  const result = summarizeStudyStackProgress(
    assuntos(),
    snapshot({
      'assunto-1': subject({ progress: 10, status: 'consolidated', consolidated: true }),
      'assunto-2': subject({ progress: 10, status: 'consolidated', consolidated: true }),
    }),
  );

  assert.equal(result.status, 'consolidated');
  assert.equal(result.points, 20);
  assert.equal(result.total, 20);
  assert.equal(result.percentage, 100);
  assert.equal(result.consolidatedSubjects, 2);
});

test('Assunto arquivado preserva seu progresso no agregado', () => {
  const result = summarizeStudyStackProgress(
    assuntos(),
    snapshot({
      'assunto-1': subject({ status: 'archived', progress: 7 }),
    }),
  );

  assert.equal(result.points, 7);
  assert.equal(result.total, 20);
  assert.equal(result.percentage, 35);
  assert.equal(result.startedSubjects, 1);
});

test('falhas de sincronização bloqueiam cálculo sem recorrer ao progresso legado', () => {
  const pending = summarizeStudyStackProgress(assuntos(), { status: 'pending', summary: null });
  const updateRequired = summarizeStudyStackProgress(assuntos(), {
    status: 'update_required',
    summary: null,
  });

  assert.equal(pending.points, null);
  assert.equal(pending.percentage, null);
  assert.equal(updateRequired.points, null);
  assert.equal(updateRequired.percentage, null);
});

test('leitura sem localStorage disponível resulta em estudo ainda não iniciado', () => {
  const { documentObject } = createFakeDocument();
  const result = readStudyStackProgressAggregate(documentObject, assuntos());

  assert.equal(result.status, 'not_started');
  assert.equal(result.points, 0);
  assert.equal(result.total, 20);
});
