import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssuntoProgressResetDialog } from '../../src/features/materias/assunto-progress-reset-dialog.js';
import { createFakeDocument } from '../helpers/fake-dom.js';

test('confirmação de reinício informa impacto e não altera a meta', () => {
  const { documentObject } = createFakeDocument();
  const dialog = createAssuntoProgressResetDialog(documentObject, {
    assunto: {
      id: 'assunto-1',
      nome: 'Equação',
      pontosProgresso: 3,
      metaPontosProgresso: 8,
      precisaReforco: true,
    },
    async onConfirm() {},
    overlayManager: null,
  });

  assert.match(dialog.element.textContent, /3\/8/);
  assert.match(dialog.element.textContent, /0\/8/);
  assert.match(dialog.element.textContent, /meta total e a marcação de reforço serão preservadas/i);
  assert.match(dialog.element.textContent, /Reiniciar progresso/);
});
