import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../../src/core/store.js';
import { createAppRepository } from '../../src/data/repositories/app-repository.js';
import { createMemoryStorageAdapter } from '../../src/data/storage/memory-storage-adapter.js';
import { createMateriaPage } from '../../src/features/materias/materia-page.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { materia, validData } from '../fixtures/data-builders.js';

function createContext(data) {
  const { documentObject, windowObject } = createFakeDocument();
  const repository = createAppRepository({ storageAdapter: createMemoryStorageAdapter() });
  const store = createStore({
    data,
    preferences: {},
    ui: {},
    status: { saving: false, lastError: null },
  });

  return {
    documentObject,
    context: {
      store,
      repository,
      windowObject,
      overlayManager: null,
      appShell: { showToast() {}, announce() {} },
      navigate() {},
    },
    store,
  };
}

test('matéria sem temas apresenta workspace e ação inicial', () => {
  const data = validData({ materias: [materia()], temas: [], assuntos: [] });
  const { documentObject, context } = createContext(data);
  const page = createMateriaPage(documentObject, { params: { materiaId: 'materia-1' } }, context);

  assert.match(page.textContent, /Temas da matéria/);
  assert.match(page.textContent, /Nenhum tema cadastrado/);
  assert.match(page.textContent, /Criar primeiro tema/);
});

test('matéria com hierarquia apresenta tema, assunto e acompanhamento sincronizado', () => {
  const { documentObject, context } = createContext(validData());
  const page = createMateriaPage(documentObject, { params: { materiaId: 'materia-1' } }, context);

  assert.match(page.textContent, /Álgebra/);
  assert.match(page.textContent, /Equação do primeiro grau/);
  assert.match(page.textContent, /Estudo ainda não iniciado/);
  assert.match(page.textContent, /Não definida/);
  assert.match(page.textContent, /Progresso geral · 0\/10/);
  assert.match(page.textContent, /Progresso do tema · 0\/10/);
});

test('matéria inexistente preserva tratamento de erro do M4', () => {
  const { documentObject, context } = createContext(validData());
  const page = createMateriaPage(documentObject, { params: { materiaId: 'inexistente' } }, context);

  assert.match(page.textContent, /Matéria não encontrada/);
  assert.match(page.textContent, /Voltar para Matérias/);
});

test('link de pesquisa expande o tema solicitado e destaca o destino', () => {
  const { documentObject, context } = createContext(validData());
  const page = createMateriaPage(
    documentObject,
    { params: { materiaId: 'materia-1' }, query: { tema: 'tema-1' } },
    context,
  );
  const target = findElement(
    page,
    (element) => element.getAttribute?.('data-tema-id') === 'tema-1',
  );

  assert.ok(target);
  assert.match(target.className, /is-expanded/);
  assert.match(target.className, /is-search-target/);
});

test('link de pesquisa para assunto abre o painel de detalhes', async () => {
  const { documentObject, context } = createContext(validData());
  createMateriaPage(
    documentObject,
    {
      params: { materiaId: 'materia-1' },
      query: { tema: 'tema-1', assunto: 'assunto-1' },
    },
    context,
  );

  await new Promise((resolve) => globalThis.queueMicrotask(resolve));
  assert.match(documentObject.body.textContent, /Detalhes do assunto em Álgebra/);
  assert.match(documentObject.body.textContent, /Equação do primeiro grau/);
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

test('workspace expõe movimentações estruturais e ações da matéria no M8', () => {
  const { documentObject, context } = createContext(validData());
  const page = createMateriaPage(documentObject, { params: { materiaId: 'materia-1' } }, context);

  assert.match(page.textContent, /Editar matéria/);
  assert.match(page.textContent, /Excluir matéria/);
  assert.match(page.textContent, /Mover tema/);
  assert.match(page.textContent, /Mover assunto/);
});

test('exclusão da Matéria aberta remove a hierarquia e navega para a listagem', async () => {
  const { documentObject, context, store } = createContext(validData());
  let destination = null;
  context.navigate = (href) => {
    destination = href;
  };
  const page = createMateriaPage(documentObject, { params: { materiaId: 'materia-1' } }, context);
  const deleteMenuItem = findElement(
    page,
    (element) => element.tagName === 'BUTTON' && element.textContent === 'Excluir matéria',
  );

  deleteMenuItem.dispatch('click');
  const confirmButton = findElements(documentObject.body).find(
    (element) =>
      element.tagName === 'BUTTON' &&
      element.textContent === 'Excluir matéria' &&
      element !== deleteMenuItem,
  );
  confirmButton.dispatch('click');
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(destination, '/materias');
  assert.equal(store.getState().data.materias.length, 0);
  assert.equal(store.getState().data.temas.length, 0);
  assert.equal(store.getState().data.assuntos.length, 0);
});

function findElements(root, output = []) {
  if (!root || typeof root === 'string') return output;
  output.push(root);
  for (const child of root.children ?? []) findElements(child, output);
  return output;
}

test('ação principal do assunto inicia o Study Stack com contexto e retorno profundo', () => {
  const { documentObject, context } = createContext(validData());
  const page = createMateriaPage(
    documentObject,
    { params: { materiaId: 'materia-1' }, query: {} },
    context,
  );
  const action = findElement(
    page,
    (element) =>
      element.tagName === 'BUTTON' && element.textContent === 'Iniciar estudo no Study Stack',
  );

  assert.ok(action);
  action.dispatch('click');

  const destination = new URL(context.windowObject.location.href);
  const subjectContext = JSON.parse(destination.searchParams.get('subjectContext'));

  assert.equal(destination.pathname, '/study-stack/');
  assert.equal(destination.hash, '#/overview');
  assert.equal(subjectContext.subject.matterName, 'Matemática');
  assert.equal(subjectContext.subject.themeName, 'Álgebra');
  assert.equal(subjectContext.subject.subjectName, 'Equação do primeiro grau');
  assert.equal(
    subjectContext.returnUrl,
    'http://127.0.0.1:4173/#/materias/materia-1?tema=tema-1&assunto=assunto-1',
  );
});
