import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../../src/core/store.js';
import { createDefaultPreferences, createEmptyData } from '../../src/domain/constants.js';
import { createRecuperacaoPage } from '../../src/features/recuperacao/recuperacao-page.js';
import { createOverlayManager } from '../../src/ui/overlays/overlay-manager.js';
import { createThemeController } from '../../src/ui/theme/theme-controller.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

test('Recuperação explica o bloqueio e preserva o texto bruto sem substituição automática', () => {
  const { documentObject, windowObject } = createFakeDocument();
  const rawData = '{"schemaVersion":2';
  const store = createStore({
    data: createEmptyData(),
    preferences: createDefaultPreferences(),
    ui: { route: null },
    status: {
      recovering: true,
      recoveryRawData: rawData,
      lastError: { code: 'VALIDATION_ERROR' },
    },
  });
  const page = createRecuperacaoPage(
    documentObject,
    {},
    {
      store,
      repository: {},
      themeController: createThemeController({ documentObject, windowObject }),
      appShell: { showToast() {}, announce() {} },
      overlayManager: createOverlayManager(),
      windowObject,
      navigate() {},
    },
  );

  assert.match(page.textContent, /Os dados não foram alterados/);
  assert.match(page.textContent, /Salvar dados preservados/);
  assert.match(page.textContent, /Copiar dados brutos/);
  assert.match(page.textContent, /Importar backup válido/);
  assert.match(page.textContent, /schemaVersion/);
  assert.deepEqual(store.getState().data, createEmptyData());
});
