import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createThemeController,
  normalizeThemeChoice,
} from '../../src/ui/theme/theme-controller.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
test('normaliza temas oficiais', () => {
  assert.equal(normalizeThemeChoice('light'), 'light');
  assert.equal(normalizeThemeChoice('dark'), 'dark');
  assert.equal(normalizeThemeChoice('system'), 'system');
  assert.equal(normalizeThemeChoice('sepia'), 'system');
});
test('tema sistema resolve navegador sem atributo explícito', () => {
  const { documentObject, windowObject } = createFakeDocument({ prefersDark: true });
  const controller = createThemeController({ documentObject, windowObject });
  assert.deepEqual(controller.getState(), { choice: 'system', resolved: 'dark' });
  assert.equal(documentObject.documentElement.getAttribute('data-theme'), null);
  assert.equal(documentObject.themeColorMeta.getAttribute('content'), '#10111b');
});
test('tema explícito atualiza raiz e assinantes', () => {
  const { documentObject, windowObject } = createFakeDocument();
  const controller = createThemeController({ documentObject, windowObject });
  const states = [];
  controller.subscribe((state) => states.push(state));
  controller.setTheme('dark');
  controller.setTheme('light');
  assert.equal(documentObject.documentElement.getAttribute('data-theme'), 'light');
  assert.deepEqual(states, [
    { choice: 'dark', resolved: 'dark' },
    { choice: 'light', resolved: 'light' },
  ]);
});

test('modo sistema reage a mudanças do dispositivo sem alterar a escolha armazenada', () => {
  const { documentObject, windowObject, mediaQuery } = createFakeDocument({ prefersDark: false });
  const controller = createThemeController({ documentObject, windowObject });
  const states = [];
  controller.subscribe((state) => states.push(state));

  mediaQuery.setMatches(true);

  assert.deepEqual(controller.getState(), { choice: 'system', resolved: 'dark' });
  assert.equal(documentObject.documentElement.getAttribute('data-theme'), null);
  assert.deepEqual(states.at(-1), { choice: 'system', resolved: 'dark' });
});
