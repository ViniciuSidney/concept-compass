import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssuntoDetailPanel } from '../../src/features/materias/assunto-detail-panel.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { assunto, tema } from '../fixtures/data-builders.js';

test('painel do assunto oferece movimentação além de edição e exclusão', () => {
  const { documentObject } = createFakeDocument();
  const panel = createAssuntoDetailPanel(documentObject, {
    assunto: assunto(),
    tema: tema(),
    onEdit() {},
    onMove() {},
    onDelete() {},
    overlayManager: null,
  });

  panel.open();
  assert.match(documentObject.body.textContent, /Mover assunto/);
  assert.match(documentObject.body.textContent, /Editar assunto/);
  assert.match(documentObject.body.textContent, /Excluir assunto/);
});
