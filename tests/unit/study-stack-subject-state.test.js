import assert from 'node:assert/strict';
import test from 'node:test';

import {
  STUDY_STACK_SUBJECT_STATES,
  readStudyStackSnapshot,
  resolveStudyStackSubjectStatus,
  selectStudyStackSubjectState,
} from '../../src/integrations/study-stack-subject-state.js';

test('snapshot ausente trata o Assunto como estudo ainda não iniciado', () => {
  const state = selectStudyStackSubjectState(null, 'a1');

  assert.equal(state.status, STUDY_STACK_SUBJECT_STATES.NOT_STARTED);
  assert.equal(state.subject, null);
});

test('snapshot pronto devolve somente o resumo sincronizado do Subject solicitado', () => {
  const snapshot = {
    status: 'ready',
    receivedContractVersion: '1.0.0',
    summary: {
      updatedAt: '2026-08-08T05:00:00.000Z',
      subjects: {
        a1: {
          subjectId: 'a1',
          status: 'in_progress',
          progress: 6,
          maxProgress: 10,
          sourceArchived: false,
          consolidated: false,
          lastActivityAt: '2026-08-08T04:00:00.000Z',
        },
      },
    },
  };

  const state = selectStudyStackSubjectState(snapshot, 'a1');

  assert.equal(state.status, 'ready');
  assert.equal(state.subject.progress, 6);
  assert.equal(resolveStudyStackSubjectStatus(state), STUDY_STACK_SUBJECT_STATES.IN_PROGRESS);
});

test('arquivamento local prevalece e leitura insegura vira sincronização pendente', () => {
  const reader = {
    read() {
      throw new Error('storage indisponível');
    },
  };
  const snapshot = readStudyStackSnapshot(reader);
  const state = selectStudyStackSubjectState(snapshot, 'a1');

  assert.equal(snapshot.status, STUDY_STACK_SUBJECT_STATES.PENDING);
  assert.equal(
    resolveStudyStackSubjectStatus(state, { archived: true }),
    STUDY_STACK_SUBJECT_STATES.ARCHIVED,
  );
});

test('resumo residual não mantém o conteúdo restaurado como arquivado', () => {
  const state = selectStudyStackSubjectState(
    {
      status: 'ready',
      receivedContractVersion: '1.0.0',
      summary: {
        updatedAt: '2026-08-09T12:00:00.000Z',
        subjects: {
          a1: {
            subjectId: 'a1',
            status: 'archived',
            progress: 4,
            maxProgress: 10,
            sourceArchived: true,
            consolidated: false,
            lastActivityAt: '2026-08-09T11:00:00.000Z',
          },
        },
      },
    },
    'a1',
  );

  assert.equal(
    resolveStudyStackSubjectStatus(state, { archived: false }),
    STUDY_STACK_SUBJECT_STATES.IN_PROGRESS,
  );
});
