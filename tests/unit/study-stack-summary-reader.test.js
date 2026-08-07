import assert from 'node:assert/strict';
import test from 'node:test';

import { APP_CONFIG } from '../../src/core/config.js';
import {
  createStudyStackSummaryReader,
  validateStudyStackSummary,
} from '../../src/integrations/study-stack-summary-reader.js';

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

function createSubject(overrides = {}) {
  return {
    subjectId: 'assunto-1',
    matterId: 'materia-1',
    themeId: 'tema-1',
    progress: 4,
    maxProgress: 10,
    status: 'in_progress',
    sourceArchived: false,
    currentStage: 'practice',
    recommendedStage: 'practice',
    recommendedNoticeId: 'assunto-1:practice',
    notices: [
      {
        id: 'assunto-1:base',
        stage: 'base',
        type: 'completed',
        message: 'Base concluída.',
      },
      {
        id: 'assunto-1:practice',
        stage: 'practice',
        type: 'recommended',
        message: 'Importar mais listas válidas.',
      },
    ],
    nextAction: {
      type: 'open_test_quest',
      label: 'Abrir Test Quest',
      description: 'Faltam listas válidas.',
    },
    stageProgress: {
      base: { current: 2, maximum: 2 },
      practice: { current: 2, maximum: 3 },
      analysis: { current: 0, maximum: 2 },
      review: { current: 0, maximum: 2 },
      consolidation: { current: 0, maximum: 1 },
    },
    pendingErrors: 0,
    pendingReviews: 0,
    lastActivityAt: '2026-08-07T10:00:00.000Z',
    consolidated: false,
    ...overrides,
  };
}

function createSummary(overrides = {}) {
  return {
    contractVersion: '1.0.0',
    updatedAt: '2026-08-07T10:00:00.000Z',
    sourceApp: 'study_stack',
    subjects: {
      'assunto-1': createSubject(),
    },
    ...overrides,
  };
}

test('valida o contrato publicado pelo Study Stack', () => {
  const result = validateStudyStackSummary(
    createSummary(),
    APP_CONFIG.integrations.studyStack.supportedSummaryContractVersions,
  );

  assert.equal(result.compatible, true);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('contrato incompatível exige atualização sem interpretar os assuntos', () => {
  const storage = new MemoryStorage({
    [APP_CONFIG.integrations.studyStack.summaryKey]: JSON.stringify(
      createSummary({ contractVersion: '2.0.0' }),
    ),
  });
  const reader = createStudyStackSummaryReader({
    storage,
    config: APP_CONFIG.integrations.studyStack,
  });

  const snapshot = reader.read();
  const subject = reader.getSubject('assunto-1');

  assert.equal(snapshot.status, 'update_required');
  assert.equal(snapshot.summary, null);
  assert.equal(snapshot.receivedContractVersion, '2.0.0');
  assert.equal(subject.status, 'update_required');
  assert.equal(subject.subject, null);
});

test('JSON inválido resulta em sincronização pendente', () => {
  const storage = new MemoryStorage({
    [APP_CONFIG.integrations.studyStack.summaryKey]: '{invalido',
  });
  const reader = createStudyStackSummaryReader({
    storage,
    config: APP_CONFIG.integrations.studyStack,
  });

  const snapshot = reader.read();

  assert.equal(snapshot.status, 'pending');
  assert.equal(snapshot.summary, null);
  assert.match(snapshot.errors.join(' '), /JSON inválido/);
});

test('ausência global do resumo é distinguida de assunto ainda não iniciado', () => {
  const emptyReader = createStudyStackSummaryReader({
    storage: new MemoryStorage(),
    config: APP_CONFIG.integrations.studyStack,
  });
  const readyReader = createStudyStackSummaryReader({
    storage: new MemoryStorage({
      [APP_CONFIG.integrations.studyStack.summaryKey]: JSON.stringify(
        createSummary({ subjects: {} }),
      ),
    }),
    config: APP_CONFIG.integrations.studyStack,
  });

  assert.equal(emptyReader.getSubject('assunto-1').status, 'missing');
  assert.equal(readyReader.getSubject('assunto-1').status, 'not_started');
});

test('retorna uma cópia segura do resumo do assunto', () => {
  const storage = new MemoryStorage({
    [APP_CONFIG.integrations.studyStack.summaryKey]: JSON.stringify(createSummary()),
  });
  const reader = createStudyStackSummaryReader({
    storage,
    config: APP_CONFIG.integrations.studyStack,
  });

  const first = reader.getSubject('assunto-1');
  first.subject.progress = 9;
  const second = reader.getSubject('assunto-1');

  assert.equal(second.status, 'ready');
  assert.equal(second.subject.progress, 4);
});
