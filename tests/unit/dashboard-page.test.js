import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../../src/core/store.js';
import { createEmptyData, DIFFICULTIES } from '../../src/domain/constants.js';
import { createDashboardPage } from '../../src/features/dashboard/dashboard-page.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { assunto, materia, tema } from '../fixtures/data-builders.js';

function createContext(data, studyStackSnapshot = null) {
  const { documentObject } = createFakeDocument();
  const store = createStore({ data, preferences: {}, ui: {}, status: {} });
  const studyStackSummaryReader = studyStackSnapshot
    ? { read: () => studyStackSnapshot }
    : undefined;
  return { documentObject, context: { store, studyStackSummaryReader } };
}

function readySnapshot(subjects) {
  return {
    status: 'ready',
    receivedContractVersion: '1.0.0',
    summary: {
      updatedAt: '2026-08-08T05:00:00.000Z',
      subjects,
    },
  };
}

test('Visão Geral vazia orienta a criação da primeira matéria', () => {
  const { documentObject, context } = createContext(createEmptyData());
  const page = createDashboardPage(documentObject, {}, context);
  assert.match(page.textContent, /Sua organização ainda está vazia/);
  assert.match(page.textContent, /Criar primeira matéria/);
});

test('Visão Geral preenchida apresenta progresso, pendências e atividade do Study Stack', () => {
  const data = {
    ...createEmptyData(),
    materias: [materia({ id: 'm1' })],
    temas: [tema({ id: 't1', materiaId: 'm1' })],
    assuntos: [
      assunto({
        id: 'a1',
        temaId: 't1',
        dificuldade: DIFFICULTIES.DIFICIL,
      }),
    ],
  };
  const snapshot = readySnapshot({
    a1: {
      subjectId: 'a1',
      status: 'in_progress',
      progress: 6,
      maxProgress: 10,
      sourceArchived: false,
      consolidated: false,
      pendingErrors: 1,
      pendingReviews: 0,
      lastActivityAt: '2026-08-08T03:00:00.000Z',
    },
  });
  const { documentObject, context } = createContext(data, snapshot);
  const page = createDashboardPage(documentObject, {}, context);

  assert.match(page.textContent, /Progresso geral/);
  assert.match(page.textContent, /6 de 10 pontos/);
  assert.doesNotMatch(page.textContent, /3 de 5 pontos/);
  assert.match(page.textContent, /Situação do progresso/);
  assert.match(page.textContent, /Prioridades de estudo/);
  assert.match(page.textContent, /Pendências no Study Stack/);
  assert.match(page.textContent, /1 pendência/);
  assert.match(page.textContent, /Estudos recentes/);
  assert.match(page.textContent, /08\/08\/2026/);

  const gallery = page.children.at(-1);
  assert.equal(gallery.classList.contains('dashboard-gallery'), true);
  assert.equal(gallery.children.length, 2);
  assert.equal(
    gallery.children[0].children[0].classList.contains('dashboard-card--distribution'),
    true,
  );
  assert.equal(
    gallery.children[0].children[1].classList.contains('dashboard-card--materias'),
    true,
  );
  assert.equal(
    gallery.children[1].children[0].classList.contains('dashboard-card--priorities'),
    true,
  );
  assert.equal(gallery.children[1].children[1].classList.contains('dashboard-card--recent'), true);
});

test('Visão Geral com matéria sem assuntos preserva estados informativos', () => {
  const data = {
    ...createEmptyData(),
    materias: [materia({ id: 'm1' })],
    temas: [tema({ id: 't1', materiaId: 'm1' })],
    assuntos: [],
  };
  const { documentObject, context } = createContext(data);
  const page = createDashboardPage(documentObject, {}, context);

  assert.match(page.textContent, /A estrutura está pronta para receber assuntos/);
  assert.match(page.textContent, /Nenhum assunto cadastrado/);
  assert.match(page.textContent, /Adicione assuntos às matérias/);
});

test('Visão Geral explicita sincronização pendente sem mostrar progresso legado', () => {
  const data = {
    ...createEmptyData(),
    materias: [materia({ id: 'm1' })],
    temas: [tema({ id: 't1', materiaId: 'm1' })],
    assuntos: [
      assunto({
        id: 'a1',
        temaId: 't1',
        pontosProgresso: 5,
        metaPontosProgresso: 5,
      }),
    ],
  };
  const { documentObject, context } = createContext(data, {
    status: 'pending',
    summary: null,
    errors: ['indisponível'],
  });
  const page = createDashboardPage(documentObject, {}, context);

  assert.match(page.textContent, /sincronização do Study Stack está pendente/i);
  assert.match(page.textContent, /Sincronização pendente com o Study Stack/);
  assert.doesNotMatch(page.textContent, /5 de 5 pontos/);
});
