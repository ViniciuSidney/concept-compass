import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createAppShell } from '../../src/ui/components/app-shell.js';
import { createActionMenu } from '../../src/ui/components/action-menu.js';
import { createModal } from '../../src/ui/components/modal.js';
import { createSidePanel } from '../../src/ui/components/side-panel.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

test('navegação móvel fica fora da árvore quando fechada e prende foco quando aberta', () => {
  const { documentObject, windowObject } = createFakeDocument();
  windowObject.innerWidth = 390;
  const shell = createAppShell(documentObject, { windowObject });
  documentObject.body.append(shell.element);

  const sidebar = findByClass(shell.element, 'app-sidebar');
  const content = findByClass(shell.element, 'app-content');
  const menuButton = findByClass(shell.element, 'app-topbar__menu-button');

  assert.equal(shell.isNavigationMobile(), true);
  assert.equal(sidebar.inert, true);
  assert.equal(sidebar.getAttribute('aria-hidden'), 'true');

  menuButton.click();

  assert.equal(shell.isNavigationOpen(), true);
  assert.equal(sidebar.inert, false);
  assert.equal(sidebar.getAttribute('aria-modal'), 'true');
  assert.equal(content.inert, true);
  assert.equal(content.getAttribute('aria-hidden'), 'true');
  assert.equal(documentObject.body.classList.contains('has-open-navigation'), true);

  documentObject.dispatch('keydown', { key: 'Escape' });

  assert.equal(shell.isNavigationOpen(), false);
  assert.equal(content.inert, false);
  assert.equal(documentObject.activeElement, menuButton);
});

test('modal e painel descrevem conteúdo e isolam a aplicação ao abrir', () => {
  const { documentObject } = createFakeDocument();
  const root = documentObject.createElement('div');
  root.id = 'app';
  documentObject.body.append(root);

  const modal = createModal(documentObject, {
    title: 'Teste de modal',
    description: 'Descrição do modal',
  });
  modal.open();

  assert.equal(root.inert, true);
  assert.equal(root.getAttribute('aria-hidden'), 'true');
  assert.ok(modal.dialog.getAttribute('aria-describedby'));

  modal.close();
  assert.equal(root.inert, false);
  assert.equal(root.getAttribute('aria-hidden'), null);

  const panel = createSidePanel(documentObject, {
    title: 'Teste de painel',
    description: 'Descrição do painel',
  });
  panel.open();

  assert.ok(panel.panel.getAttribute('aria-describedby'));
  assert.equal(root.inert, true);

  panel.close();
  assert.equal(root.inert, false);
});

test('menu de ações oferece navegação completa por setas e Escape', () => {
  const { documentObject } = createFakeDocument();
  const menu = createActionMenu(documentObject, {
    items: [{ label: 'Editar' }, { label: 'Mover' }, { label: 'Excluir', danger: true }],
  });
  menu.menu.querySelectorAll = () => menu.menu.children.filter(({ disabled }) => !disabled);

  menu.trigger.dispatch('keydown', { key: 'ArrowDown' });
  assert.equal(menu.isOpen(), true);
  assert.equal(documentObject.activeElement, menu.menu.children[0]);

  menu.menu.dispatch('keydown', { key: 'ArrowDown' });
  assert.equal(documentObject.activeElement, menu.menu.children[1]);

  menu.menu.dispatch('keydown', { key: 'End' });
  assert.equal(documentObject.activeElement, menu.menu.children[2]);

  menu.menu.dispatch('keydown', { key: 'Escape' });
  assert.equal(menu.isOpen(), false);
  assert.equal(documentObject.activeElement, menu.trigger);
});

test('folhas de estilo do M10 cobrem largura mínima, toque, contraste e tema escuro', async () => {
  const [base, responsive, themes, tokens, overlays] = await Promise.all([
    readFile(new URL('../../src/styles/base.css', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles/responsive.css', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles/themes.css', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles/components/overlays.css', import.meta.url), 'utf8'),
  ]);

  assert.match(base, /forced-colors:\s*active/);
  assert.match(responsive, /max-width:\s*34rem/);
  assert.match(responsive, /max-height:\s*34rem/);
  assert.match(responsive, /safe-area-bottom/);
  assert.match(tokens, /--touch-target-min:\s*2\.75rem/);
  assert.match(tokens, /--color-accent-blue-soft/);
  assert.match(themes, /data-resolved-theme='dark'/);
  assert.match(overlays, /100dvh/);
});

function findByClass(element, className) {
  if (element.classList?.contains(className)) return element;
  for (const child of element.children ?? []) {
    if (typeof child === 'string') continue;
    const match = findByClass(child, className);
    if (match) return match;
  }
  return null;
}
