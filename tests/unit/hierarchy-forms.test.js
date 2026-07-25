import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssuntoFormModal } from '../../src/features/materias/assunto-form.js';
import { createTemaFormModal } from '../../src/features/materias/tema-form.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

for (const [name, createForm] of [
  ['tema', createTemaFormModal],
  ['assunto', createAssuntoFormModal],
]) {
  test(`botão de salvar de ${name} permanece associado ao formulário`, () => {
    const { documentObject, windowObject } = createFakeDocument();
    const modal = createForm(documentObject, {
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
}

function collectElements(root) {
  const result = [root];

  for (const child of root.children ?? []) {
    if (typeof child !== 'string') result.push(...collectElements(child));
  }

  return result;
}
