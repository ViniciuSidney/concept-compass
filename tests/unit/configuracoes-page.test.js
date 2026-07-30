import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../../src/core/store.js';
import { createDefaultPreferences, createEmptyData } from '../../src/domain/constants.js';
import { createConfiguracoesPage } from '../../src/features/configuracoes/configuracoes-page.js';
import { createOverlayManager } from '../../src/ui/overlays/overlay-manager.js';
import { createThemeController } from '../../src/ui/theme/theme-controller.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

function createContext(documentObject, windowObject) {
  const preferences = createDefaultPreferences();
  return {
    store: createStore({
      data: createEmptyData(),
      preferences,
      ui: { route: null },
      status: { recovering: false, preferencesFallback: false },
    }),
    repository: {
      savePreferences: (value) => value,
      replaceSnapshot: (value) => value,
      clearData() {},
    },
    themeController: createThemeController({ documentObject, windowObject }),
    appShell: { showToast() {}, announce() {} },
    overlayManager: createOverlayManager(),
    windowObject,
    navigate() {},
  };
}

test('Configurações apresenta as quatro seções oficiais e informações Sobre corretas', () => {
  const { documentObject, windowObject } = createFakeDocument();
  const page = createConfiguracoesPage(
    documentObject,
    {},
    createContext(documentObject, windowObject),
  );

  for (const text of [
    'Aparência',
    'Backup',
    'Dados',
    'Sobre a aplicação',
    'Concept Compass',
    'v0.1.1',
    'Vinícius Sidney',
    'LocalStorage',
    'Matéria → Tema → Assunto',
  ]) {
    assert.match(page.textContent, new RegExp(text));
  }
  assert.equal(page.textContent.includes('versão mais recente'), false);
  assert.equal(page.textContent.includes('guia rápido'), false);
});

test('Configurações mantém uma única ação de restaurar aparência padrão', () => {
  const { documentObject, windowObject } = createFakeDocument();
  const page = createConfiguracoesPage(
    documentObject,
    {},
    createContext(documentObject, windowObject),
  );
  const occurrences = page.textContent.match(/Restaurar aparência padrão/g) ?? [];

  assert.equal(occurrences.length, 1);
});
