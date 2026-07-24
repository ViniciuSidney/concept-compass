import assert from 'node:assert/strict';
import test from 'node:test';

import { createMateriaFormModal } from '../../src/features/materias/materia-form.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

test('botão de salvar permanece associado ao formulário no rodapé do modal', () => {
  const { documentObject, windowObject } = createFakeDocument();
  const modal = createMateriaFormModal(documentObject, {
    windowObject,
    overlayManager: null,
    async onSubmit() {},
  });
  const elements = collectElements(modal.element);
  const form = elements.find(({ tagName }) => tagName === 'FORM');
  const submitButton = elements.find(
    ({ tagName, type }) => tagName === 'BUTTON' && type === 'submit',
  );

  assert.ok(form?.id);
  assert.ok(submitButton);
  assert.equal(submitButton.getAttribute('form'), form.id);
});

function collectElements(root) {
  const result = [root];

  for (const child of root.children ?? []) {
    if (typeof child !== 'string') result.push(...collectElements(child));
  }

  return result;
}
