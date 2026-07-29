import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../../src/core/store.js';
import { createEmptyData, DIFFICULTIES } from '../../src/domain/constants.js';
import { createDashboardPage } from '../../src/features/dashboard/dashboard-page.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { assunto, materia, tema } from '../fixtures/data-builders.js';

function createContext(data) {
  const { documentObject } = createFakeDocument();
  const store = createStore({ data, preferences: {}, ui: {}, status: {} });
  return { documentObject, context: { store } };
}

test('Visão Geral vazia orienta a criação da primeira matéria', () => {
  const { documentObject, context } = createContext(createEmptyData());
  const page = createDashboardPage(documentObject, {}, context);
  assert.match(page.textContent, /Sua organização ainda está vazia/);
  assert.match(page.textContent, /Criar primeira matéria/);
});

test('Visão Geral preenchida apresenta pontos, prioridades e estudos recentes', () => {
  const data = {
    ...createEmptyData(),
    materias: [materia({ id: 'm1' })],
    temas: [tema({ id: 't1', materiaId: 'm1' })],
    assuntos: [
      assunto({
        id: 'a1',
        temaId: 't1',
        pontosProgresso: 3,
        metaPontosProgresso: 5,
        precisaReforco: true,
        dificuldade: DIFFICULTIES.DIFICIL,
        ultimoEstudoEm: '2026-07-24',
      }),
    ],
  };
  const { documentObject, context } = createContext(data);
  const page = createDashboardPage(documentObject, {}, context);

  assert.match(page.textContent, /Progresso geral/);
  assert.match(page.textContent, /3 de 5 pontos/);
  assert.match(page.textContent, /Situação do progresso/);
  assert.match(page.textContent, /Prioridades de estudo/);
  assert.match(page.textContent, /Precisa de reforço/);
  assert.match(page.textContent, /Estudos recentes/);
  assert.match(page.textContent, /24\/07\/2026/);
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
