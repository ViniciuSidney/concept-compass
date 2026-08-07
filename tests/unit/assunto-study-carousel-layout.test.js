import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  createAssuntoStudyDetail,
  createAssuntoStudyStatus,
} from '../../src/features/materias/assunto-study-status.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

function createSubject() {
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
    recommendedNoticeId: 'notice-2',
    notices: [
      { id: 'notice-1', stage: 'base', type: 'completed', message: 'Base concluída.' },
      {
        id: 'notice-2',
        stage: 'practice',
        type: 'recommended',
        message: 'Resolver uma nova lista válida no Test Quest.',
      },
      {
        id: 'notice-3',
        stage: 'analysis',
        type: 'pending',
        message: 'Analisar os erros encontrados.',
      },
    ],
    nextAction: { type: 'practice', label: 'Abrir Test Quest' },
    stageProgress: {
      base: { current: 2, maximum: 2 },
      practice: { current: 2, maximum: 3 },
      analysis: { current: 0, maximum: 2 },
      review: { current: 0, maximum: 2 },
      consolidation: { current: 0, maximum: 1 },
    },
    pendingErrors: 3,
    pendingReviews: 1,
    lastActivityAt: '2026-08-07T10:00:00.000Z',
    consolidated: false,
  };
}

function createReadyState() {
  return {
    status: 'ready',
    subject: createSubject(),
    summaryUpdatedAt: '2026-08-07T10:00:00.000Z',
    receivedContractVersion: '1.0.0',
    errors: [],
  };
}

test('card posiciona o carrossel entre Situação do estudo e o status', () => {
  const { documentObject } = createFakeDocument();
  const view = createAssuntoStudyStatus(documentObject, {
    assunto: { id: 'assunto-1', nome: 'Função' },
    studyStackState: createReadyState(),
    onOpenStudyStack() {},
  });
  const heading = view.element.children[0];
  const [eyebrow, carousel, title] = heading.children;

  assert.equal(heading.classList.contains('assunto-study__heading--with-carousel'), true);
  assert.equal(eyebrow.textContent, 'Situação do estudo');
  assert.equal(carousel.classList.contains('assunto-study__carousel--header'), true);
  assert.equal(title.textContent, 'Estudo em andamento');
  assert.match(carousel.textContent, /Resolver uma nova lista válida no Test Quest/);
  assert.equal(
    view.element.children.some((child) => child.classList?.contains('assunto-study__carousel')),
    false,
  );
});

test('painel detalhado mantém o carrossel no fluxo vertical', () => {
  const { documentObject } = createFakeDocument();
  const view = createAssuntoStudyDetail(documentObject, {
    assunto: { id: 'assunto-1', nome: 'Função' },
    studyStackState: createReadyState(),
    studyStackUrl: 'https://example.test/study-stack/#/overview',
  });
  const heading = view.element.children[0];

  assert.equal(heading.classList.contains('assunto-study__heading--with-carousel'), false);
  assert.equal(heading.children.length, 2);
  assert.equal(
    view.element.children.some((child) => child.classList?.contains('assunto-study__carousel')),
    true,
  );
});

test('carrossel diferencia concluído, recomendado e pendente por estado visual', () => {
  const { documentObject } = createFakeDocument();
  const view = createAssuntoStudyStatus(documentObject, {
    assunto: { id: 'assunto-1', nome: 'Função' },
    studyStackState: createReadyState(),
    onOpenStudyStack() {},
  });
  const carousel = view.element.children[0].children[1];
  const navigation = carousel.children[2];
  const previous = navigation.children[0];
  const next = navigation.children[1];

  assert.equal(carousel.classList.contains('assunto-study__carousel--recommended'), true);

  previous.click();
  assert.equal(carousel.classList.contains('assunto-study__carousel--completed'), true);

  next.click();
  next.click();
  assert.equal(carousel.classList.contains('assunto-study__carousel--pending'), true);
});

test('layout antecipa a quebra do cabeçalho antes da faixa problemática de 1160px', async () => {
  const css = await readFile(
    new URL('../../src/styles/pages/materia-study-status.css', import.meta.url),
    'utf8',
  );

  assert.match(css, /@media \(max-width: 72\.5rem\)/);
  assert.match(css, /grid-template-areas:\s*'eyebrow title'\s*'carousel carousel'/);
});
