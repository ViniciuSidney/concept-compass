import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssuntoFormModal } from '../../src/features/materias/assunto-form.js';
import { assunto } from '../fixtures/data-builders.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

test('formulário do assunto remove acompanhamento manual e preserva dados legados ao editar', async () => {
  const { documentObject, windowObject } = createFakeDocument();
  const current = assunto({
    pontosProgresso: 3,
    metaPontosProgresso: 8,
    precisaReforco: true,
    ultimoEstudoEm: '2026-08-01',
  });
  let submitted = null;
  const modal = createAssuntoFormModal(documentObject, {
    assunto: current,
    overlayManager: null,
    windowObject,
    async onSubmit(input) {
      submitted = input;
    },
  });

  modal.open();

  assert.doesNotMatch(documentObject.body.textContent, /Pontos atuais/);
  assert.doesNotMatch(documentObject.body.textContent, /Meta de progresso/);
  assert.doesNotMatch(documentObject.body.textContent, /Último estudo/);
  assert.doesNotMatch(documentObject.body.textContent, /precisa de reforço/i);
  assert.match(documentObject.body.textContent, /registrados automaticamente pelo Study Stack/i);

  const form = findElement(documentObject.body, (element) => element.tagName === 'FORM');
  form.dispatch('submit');
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(submitted.pontosProgresso, 3);
  assert.equal(submitted.metaPontosProgresso, 8);
  assert.equal(submitted.precisaReforco, true);
  assert.equal(submitted.ultimoEstudoEm, '2026-08-01');
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
