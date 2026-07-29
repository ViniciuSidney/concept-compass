import assert from 'node:assert/strict';
import test from 'node:test';

import { createBackupDocument } from '../../src/data/backup/backup-service.js';
import { createDefaultPreferences } from '../../src/domain/constants.js';
import { createBackupImportDialog } from '../../src/features/configuracoes/backup-import-dialog.js';
import { createDeleteAllDataDialog } from '../../src/features/configuracoes/delete-all-data-dialog.js';
import { createOverlayManager } from '../../src/ui/overlays/overlay-manager.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { validData } from '../fixtures/data-builders.js';

test('resumo de importação exige confirmação e oferece exportação dos dados atuais', () => {
  const { documentObject } = createFakeDocument();
  const backup = createBackupDocument({
    data: validData(),
    preferences: createDefaultPreferences(),
    now: new Date('2026-07-29T18:30:00-03:00'),
    today: '2026-07-29',
  });
  const dialog = createBackupImportDialog(documentObject, {
    backup,
    onConfirm() {},
    onExportCurrent() {},
    overlayManager: createOverlayManager(),
  });

  assert.match(dialog.element.textContent, /Revisar importação/);
  assert.match(dialog.element.textContent, /1Matérias|Matérias1/);
  assert.match(dialog.element.textContent, /Exportar dados atuais/);
  assert.match(dialog.element.textContent, /Cancelar/);
  assert.match(dialog.element.textContent, /Substituir e importar/);
});

test('confirmação destrutiva usa somente matérias, temas e assuntos', () => {
  const { documentObject } = createFakeDocument();
  const dialog = createDeleteAllDataDialog(documentObject, {
    counts: { materias: 2, temas: 3, assuntos: 4 },
    onConfirm() {},
    overlayManager: createOverlayManager(),
  });

  assert.match(dialog.element.textContent, /2 matérias/);
  assert.match(dialog.element.textContent, /3 temas/);
  assert.match(dialog.element.textContent, /4 assuntos/);
  assert.equal(dialog.element.textContent.includes('Conteúdo'), false);
});

test('exclusão geral exige duas confirmações antes de apagar', () => {
  const { documentObject } = createFakeDocument();
  let confirmations = 0;
  const dialog = createDeleteAllDataDialog(documentObject, {
    counts: { materias: 2, temas: 3, assuntos: 4 },
    onConfirm() {
      confirmations += 1;
    },
    overlayManager: createOverlayManager(),
  });
  const continueButton = findButton(dialog.element, 'Continuar para confirmação final');
  const finalButton = findButton(dialog.element, 'Apagar definitivamente');

  assert.ok(continueButton);
  assert.ok(finalButton);
  assert.equal(finalButton.hidden, true);

  continueButton.click();

  assert.equal(confirmations, 0);
  assert.equal(continueButton.hidden, true);
  assert.equal(finalButton.hidden, false);
  assert.equal(documentObject.activeElement, finalButton);
  assert.match(dialog.element.textContent, /Confirmação final/);

  finalButton.click();
  assert.equal(confirmations, 1);
});

function findButton(element, label) {
  if (element.tagName === 'BUTTON' && element.textContent.includes(label)) return element;
  for (const child of element.children ?? []) {
    if (typeof child === 'string') continue;
    const match = findButton(child, label);
    if (match) return match;
  }
  return null;
}
