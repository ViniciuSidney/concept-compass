import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssuntoDetailPanel } from '../../src/features/materias/assunto-detail-panel.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { assunto, tema } from '../fixtures/data-builders.js';

test('painel do assunto mantém ações estruturais e remove progresso manual', () => {
  const { documentObject } = createFakeDocument();
  const panel = createAssuntoDetailPanel(documentObject, {
    assunto: assunto(),
    tema: tema(),
    studyStackUrl: 'https://example.test/study-stack/#/overview',
    onEdit() {},
    onMove() {},
    onDelete() {},
    overlayManager: null,
  });

  panel.open();
  assert.match(documentObject.body.textContent, /Mover assunto/);
  assert.match(documentObject.body.textContent, /Editar assunto/);
  assert.match(documentObject.body.textContent, /Excluir assunto/);
  assert.match(documentObject.body.textContent, /Iniciar estudo no Study Stack/);
  assert.match(documentObject.body.textContent, /Situação do estudo/);
  assert.doesNotMatch(documentObject.body.textContent, /Ajustar progresso/);
  assert.doesNotMatch(documentObject.body.textContent, /Pontos de progresso/);
  assert.doesNotMatch(documentObject.body.textContent, /Progresso percentual/);
});
