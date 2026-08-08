import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../../src/core/store.js';
import { createEmptyData } from '../../src/domain/constants.js';
import { createPesquisaPage } from '../../src/features/pesquisa/pesquisa-page.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { validData } from '../fixtures/data-builders.js';

function createContext(data, studyStackSnapshot = null) {
  const { documentObject, windowObject } = createFakeDocument();
  windowObject.location = { hash: '#/pesquisa' };
  windowObject.history = {
    replaceState(_state, _title, hash) {
      windowObject.location.hash = hash;
    },
  };
  return {
    documentObject,
    context: {
      store: createStore({ data, preferences: {}, ui: {}, status: {} }),
      windowObject,
      studyStackSummaryReader: studyStackSnapshot ? { read: () => studyStackSnapshot } : undefined,
    },
  };
}

function readySnapshot(subjectId) {
  return {
    status: 'ready',
    receivedContractVersion: '1.0.0',
    summary: {
      updatedAt: '2026-08-08T05:00:00.000Z',
      subjects: {
        [subjectId]: {
          subjectId,
          status: 'in_progress',
          progress: 6,
          maxProgress: 10,
          sourceArchived: false,
          consolidated: false,
          currentStage: 'practice',
          pendingErrors: 1,
          pendingReviews: 0,
          lastActivityAt: '2026-08-08T03:00:00.000Z',
        },
      },
    },
  };
}

test('Pesquisa Geral vazia orienta a criação da primeira matéria', () => {
  const { documentObject, context } = createContext(createEmptyData());
  const page = createPesquisaPage(documentObject, { query: {} }, context);

  assert.match(page.textContent, /Ainda não há conteúdos para pesquisar/);
  assert.match(page.textContent, /Criar primeira matéria/);
});

test('Pesquisa Geral sem termo apresenta orientação e contagens dos filtros', () => {
  const { documentObject, context } = createContext(validData());
  const page = createPesquisaPage(documentObject, { query: {} }, context);

  assert.match(page.textContent, /Pesquise sua organização/);
  assert.match(page.textContent, /Tudo3/);
  assert.match(page.textContent, /Matérias1/);
  assert.match(page.textContent, /Temas1/);
  assert.match(page.textContent, /Assuntos1/);
});

test('Pesquisa Geral renderiza situação e progresso sincronizados do Assunto', () => {
  const data = validData();
  data.assuntos[0].descricao = 'Problemas e operações';
  data.assuntos[0].pontosProgresso = 5;
  data.assuntos[0].metaPontosProgresso = 5;
  data.assuntos[0].precisaReforco = true;
  data.assuntos[0].ultimoEstudoEm = '2025-01-01';
  const subjectId = data.assuntos[0].id;
  const { documentObject, context } = createContext(data, readySnapshot(subjectId));
  const page = createPesquisaPage(documentObject, { query: { q: 'equação' } }, context);

  assert.match(page.textContent, /Resultados encontrados/);
  assert.match(page.textContent, /Matemática › Álgebra/);
  assert.match(page.textContent, /Equação do primeiro grau/);
  assert.match(page.textContent, /Estudo em andamento/);
  assert.match(page.textContent, /6\/10 pontos · 60%/);
  assert.match(page.textContent, /Etapa atual: Prática/);
  assert.match(page.textContent, /1 pendência/);
  assert.match(page.textContent, /08\/08\/2026/);
  assert.doesNotMatch(page.textContent, /5\/5 pontos/);
  assert.doesNotMatch(page.textContent, /Precisa de reforço/);
  assert.match(page.textContent, /Abrir assunto/);
  assert.ok(findElements(page, (element) => element.href?.includes('assunto=assunto-1')).length);
});

test('Pesquisa Geral sem resumo do Study Stack trata Assunto como não iniciado', () => {
  const data = validData();
  data.assuntos[0].pontosProgresso = 5;
  data.assuntos[0].metaPontosProgresso = 5;
  const { documentObject, context } = createContext(data);
  const page = createPesquisaPage(documentObject, { query: { q: 'equação' } }, context);

  assert.match(page.textContent, /Estudo ainda não iniciado/);
  assert.match(page.textContent, /0\/10 pontos · 0%/);
  assert.doesNotMatch(page.textContent, /5\/5 pontos/);
});

test('filtro vindo da URL restringe a tela e termo inexistente gera estado seguro', () => {
  const { documentObject, context } = createContext(validData());
  const filtered = createPesquisaPage(
    documentObject,
    { query: { q: 'matemática', tipo: 'assunto' } },
    context,
  );
  const noResults = createPesquisaPage(documentObject, { query: { q: 'inexistente' } }, context);

  assert.match(filtered.textContent, /Nenhum resultado encontrado/);
  assert.match(noResults.textContent, /Nenhum resultado encontrado/);
  assert.match(noResults.textContent, /Limpar pesquisa/);
});

function findElements(root, predicate) {
  const matches = [];
  visit(root);
  return matches;

  function visit(node) {
    if (!node || typeof node === 'string') return;
    if (predicate(node)) matches.push(node);
    for (const child of node.children ?? []) visit(child);
  }
}
