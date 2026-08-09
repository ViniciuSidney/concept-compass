import assert from 'node:assert/strict';
import test from 'node:test';

import { createMateriaCard } from '../../src/features/materias/materia-card.js';
import { createTemaAccordion } from '../../src/features/materias/tema-accordion.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { assunto, materia, tema } from '../fixtures/data-builders.js';

const noop = () => {};

function findElements(root, output = []) {
  if (!root || typeof root === 'string') return output;
  output.push(root);
  for (const child of root.children ?? []) findElements(child, output);
  return output;
}

function findButton(root, label) {
  return findElements(root).find(
    (element) => element.tagName === 'BUTTON' && element.textContent === label,
  );
}

function createTemaCallbacks() {
  return {
    onToggle: noop,
    onAddAssunto: noop,
    onEditTema: noop,
    onDeleteTema: noop,
    onArchiveTema: noop,
    onRestoreTema: noop,
    onMoveTema: noop,
    onMoveTemaUp: noop,
    onMoveTemaDown: noop,
    onOpenAssunto: noop,
    onOpenAssuntoInStudyStack: noop,
    onEditAssunto: noop,
    onDeleteAssunto: noop,
    onArchiveAssunto: noop,
    onRestoreAssunto: noop,
    onMoveAssuntoTo: noop,
    onMoveAssunto: noop,
    overlayManager: null,
  };
}

test('card de Matéria arquivada exibe restauração explícita', () => {
  const { documentObject } = createFakeDocument();
  let restored = 0;
  const card = createMateriaCard(documentObject, {
    summary: {
      materia: materia({ arquivado: true }),
      temasCount: 1,
      assuntosCount: 1,
      assuntos: [assunto()],
    },
    showReorder: false,
    onEdit: noop,
    onArchive: noop,
    onRestore() {
      restored += 1;
    },
    onDelete: noop,
    onMoveUp: noop,
    onMoveDown: noop,
  });

  const restoreButton = findButton(card, 'Restaurar matéria');
  assert.ok(restoreButton);
  assert.equal(card.classList.contains('is-archived'), true);
  assert.match(card.textContent, /Arquivada/);
  restoreButton.dispatch('click');
  assert.equal(restored, 1);
});

test('Tema arquivado exibe restauração explícita e bloqueia novo Assunto', () => {
  const { documentObject } = createFakeDocument();
  let restored = 0;
  const element = createTemaAccordion(documentObject, {
    section: {
      tema: tema({ arquivado: true }),
      assuntos: [assunto()],
      canMoveUp: false,
      canMoveDown: false,
    },
    expanded: true,
    materiaArchived: false,
    ...createTemaCallbacks(),
    onRestoreTema() {
      restored += 1;
    },
  });

  const restoreButton = findButton(element, 'Restaurar tema');
  const newSubjectButton = findButton(element, 'Novo assunto');
  assert.ok(restoreButton);
  assert.equal(element.classList.contains('is-archived'), true);
  assert.equal(newSubjectButton, undefined);
  assert.match(element.textContent, /Restaure o Tema/);
  restoreButton.dispatch('click');
  assert.equal(restored, 1);
});

test('Matéria arquivada bloqueia Study Stack dos Assuntos descendentes', () => {
  const { documentObject } = createFakeDocument();
  const element = createTemaAccordion(documentObject, {
    section: {
      tema: tema(),
      assuntos: [assunto()],
      canMoveUp: false,
      canMoveDown: false,
    },
    expanded: true,
    materiaArchived: true,
    ...createTemaCallbacks(),
  });

  assert.match(element.textContent, /Estudo arquivado/);
  assert.match(element.textContent, /Restaure a Matéria/);
  assert.doesNotMatch(element.textContent, /Iniciar estudo no Study Stack/);
});
