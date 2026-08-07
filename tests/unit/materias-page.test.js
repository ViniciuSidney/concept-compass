import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../../src/core/store.js';
import { createAppRepository } from '../../src/data/repositories/app-repository.js';
import { createMemoryStorageAdapter } from '../../src/data/storage/memory-storage-adapter.js';
import { createEmptyData } from '../../src/domain/constants.js';
import { createMateriasPage } from '../../src/features/materias/materias-page.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { validData } from '../fixtures/data-builders.js';

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
    },
  };
}

test('tela de Matérias apresenta estado vazio e ação de criação', () => {
  const { documentObject, context } = createContext(createEmptyData());
  const page = createMateriasPage(documentObject, {}, context);

  assert.match(page.textContent, /Nenhuma matéria cadastrada/);
  assert.match(page.textContent, /Criar primeira matéria/);
});

test('tela de Matérias apresenta card com contagens e abertura', () => {
  const { documentObject, context } = createContext(validData());
  const page = createMateriasPage(documentObject, {}, context);

  assert.match(page.textContent, /Matemática/);
  assert.match(page.textContent, /1Temas/);
  assert.match(page.textContent, /1Assuntos/);
  assert.match(page.textContent, /Progresso da matéria · 0\/10/);
  assert.match(page.textContent, /Abrir matéria/);
});
