import assert from 'node:assert/strict';
import test from 'node:test';

import { createStructureMoveDialog } from '../../src/features/materias/structure-move-dialog.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

function collect(root, output = []) {
  if (!root || typeof root === 'string') return output;
  output.push(root);
  for (const child of root.children ?? []) collect(child, output);
  return output;
}

test('modal de movimentação associa ação ao formulário e atualiza posições pelo destino', () => {
  const { documentObject, windowObject } = createFakeDocument();
  const dialog = createStructureMoveDialog(documentObject, {
    title: 'Mover tema',
    description: 'Descrição',
    entityName: 'Álgebra',
    originLabel: 'Matemática',
    destinationLabel: 'Matéria de destino',
    destinations: [
      { id: 'm1', label: 'Matemática', current: true },
      { id: 'm2', label: 'Física', current: false },
    ],
    initialDestinationId: 'm1',
    getPositions(destinationId) {
      return destinationId === 'm1'
        ? [{ index: 0, label: '1ª posição — único item', current: true }]
        : [
            { index: 0, label: '1ª posição — início', current: false },
            { index: 1, label: '2ª posição — final', current: true },
          ];
    },
    async onConfirm() {},
    overlayManager: null,
    windowObject,
  });
  const elements = collect(dialog.element);
  const form = elements.find(({ tagName }) => tagName === 'FORM');
  const button = elements.find(
    ({ tagName, textContent }) => tagName === 'BUTTON' && textContent.includes('Mover'),
  );
  const selects = elements.filter(({ tagName }) => tagName === 'SELECT');

  assert.ok(form?.id);
  assert.equal(button?.getAttribute('form'), form.id);
  assert.equal(selects.length, 2);
  assert.match(dialog.element.textContent, /IDs, conteúdo e data de criação serão preservados/);

  selects[0].value = 'm2';
  selects[0].dispatch('change');
  assert.equal(selects[1].children.length, 2);
  assert.equal(selects[1].value, '1');
});
