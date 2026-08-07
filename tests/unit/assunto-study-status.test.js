import assert from 'node:assert/strict';
import test from 'node:test';

import { APP_CONFIG } from '../../src/core/config.js';
import {
  createAssuntoStudyStatus,
  readAssuntoStudyStackState,
} from '../../src/features/materias/assunto-study-status.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

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

function assunto() {
  return { id: 'assunto-1', nome: 'Equação do primeiro grau' };
}

function subject(overrides = {}) {
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
        message: 'Resolver a próxima lista válida.',
      },
      {
        id: 'notice-3',
        stage: 'analysis',
        type: 'pending',
        message: 'Analisar os erros encontrados.',
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
    pendingErrors: 2,
    pendingReviews: 1,
    lastActivityAt: '2026-08-07T10:00:00.000Z',
    consolidated: false,
    ...overrides,
  };
}

function summary(subjectValue = subject()) {
  return {
    contractVersion: '1.0.0',
    updatedAt: '2026-08-07T10:00:00.000Z',
    sourceApp: 'study_stack',
    subjects: { 'assunto-1': subjectValue },
  };
}

function setupWithSummary(subjectValue = subject()) {
  const { documentObject } = createFakeDocument();
  documentObject.defaultView.localStorage = new MemoryStorage({
    [APP_CONFIG.integrations.studyStack.summaryKey]: JSON.stringify(summary(subjectValue)),
  });
  return documentObject;
}

test('assunto sem resumo apresenta início pelo Study Stack sem progresso legado', () => {
  const { documentObject } = createFakeDocument();
  const state = readAssuntoStudyStackState(documentObject, 'assunto-1');
  const view = createAssuntoStudyStatus(documentObject, {
    assunto: assunto(),
    studyStackState: state,
    onOpenStudyStack() {},
  });

  assert.match(view.element.textContent, /Estudo ainda não iniciado/);
  assert.match(view.element.textContent, /Iniciar estudo no Study Stack/);
  assert.doesNotMatch(view.element.textContent, /0\/10/);
});

test('assunto em andamento mostra progresso etapa aviso próxima ação e pendências', () => {
  const documentObject = setupWithSummary();
  const state = readAssuntoStudyStackState(documentObject, 'assunto-1');
  const view = createAssuntoStudyStatus(documentObject, {
    assunto: assunto(),
    studyStackState: state,
    onOpenStudyStack() {},
  });

  assert.match(view.element.textContent, /4\/10/);
  assert.match(view.element.textContent, /Etapa atual: Prática/);
  assert.match(view.element.textContent, /Resolver a próxima lista válida/);
  assert.match(view.element.textContent, /2 de 3/);
  assert.match(view.element.textContent, /Próxima ação: Abrir Test Quest/);
  assert.match(view.element.textContent, /2 erros pendentes/);
  assert.match(view.element.textContent, /1 revisão pendente/);
  assert.match(view.element.textContent, /Sincronizado com o Study Stack/);
  assert.equal(view.actionLabel, 'Continuar estudo no Study Stack');
});

test('carrossel começa no aviso recomendado e navega circularmente', () => {
  const documentObject = setupWithSummary();
  const state = readAssuntoStudyStackState(documentObject, 'assunto-1');
  const view = createAssuntoStudyStatus(documentObject, {
    assunto: assunto(),
    studyStackState: state,
    onOpenStudyStack() {},
  });
  const previous = findElement(
    view.element,
    (element) => element.getAttribute?.('aria-label') === 'Mostrar aviso anterior',
  );
  const next = findElement(
    view.element,
    (element) => element.getAttribute?.('aria-label') === 'Mostrar próximo aviso',
  );

  assert.match(view.element.textContent, /Resolver a próxima lista válida/);
  previous.dispatch('click');
  assert.match(view.element.textContent, /Base concluída/);
  previous.dispatch('click');
  assert.match(view.element.textContent, /Analisar os erros encontrados/);
  next.dispatch('click');
  assert.match(view.element.textContent, /Base concluída/);
});

test('consolidação troca ação e aponta revisão futura no Flashcore', () => {
  const documentObject = setupWithSummary(
    subject({
      progress: 10,
      status: 'consolidated',
      currentStage: 'consolidation',
      recommendedStage: 'consolidation',
      recommendedNoticeId: 'notice-3',
      consolidated: true,
    }),
  );
  const state = readAssuntoStudyStackState(documentObject, 'assunto-1');
  const view = createAssuntoStudyStatus(documentObject, {
    assunto: assunto(),
    studyStackState: state,
    onOpenStudyStack() {},
  });

  assert.match(view.element.textContent, /Estudo consolidado/);
  assert.match(view.element.textContent, /Próxima etapa: revisão no Flashcore/);
  assert.equal(view.actionLabel, 'Ver estudo no Study Stack');
});

test('contrato incompatível bloqueia a ação e não interpreta progresso', () => {
  const { documentObject } = createFakeDocument();
  documentObject.defaultView.localStorage = new MemoryStorage({
    [APP_CONFIG.integrations.studyStack.summaryKey]: JSON.stringify({
      ...summary(),
      contractVersion: '2.0.0',
    }),
  });
  const state = readAssuntoStudyStackState(documentObject, 'assunto-1');
  const view = createAssuntoStudyStatus(documentObject, {
    assunto: assunto(),
    studyStackState: state,
    onOpenStudyStack() {},
  });

  assert.match(view.element.textContent, /Atualização necessária/);
  assert.doesNotMatch(view.element.textContent, /4\/10/);
  assert.equal(view.actionDisabled, true);
});

function findElement(root, predicate) {
  if (!root || typeof root === 'string') return null;
  if (predicate(root)) return root;
  for (const child of root.children ?? []) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return null;
}
