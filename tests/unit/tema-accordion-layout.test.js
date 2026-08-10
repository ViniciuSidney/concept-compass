import assert from 'node:assert/strict';
import test from 'node:test';

import { createTemaAccordion } from '../../src/features/materias/tema-accordion.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
import { assunto, tema } from '../fixtures/data-builders.js';

const noop = () => {};

test('cabeçalho do tema mantém o progresso sincronizado visível mesmo com o acordeão fechado', () => {
  const { documentObject } = createFakeDocument();
  const element = createTemaAccordion(documentObject, {
    section: {
      tema: tema({ id: 't1', nome: 'Gramática' }),
      assuntos: [assunto({ id: 'a1', temaId: 't1' })],
      canMoveUp: false,
      canMoveDown: false,
    },
    expanded: false,
    materiaArchived: false,
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
  });

  const header = element.children[0];
  const body = element.children[1];
  const headerProgress = header.children[1];

  assert.equal(headerProgress.classList.contains('tema-accordion__progress--header'), true);
  assert.match(headerProgress.textContent, /0\/10/);
  assert.doesNotMatch(headerProgress.textContent, /3\/5/);
  assert.equal(body.hidden, true);
  assert.equal(
    body.children.some((child) => child.classList?.contains('tema-accordion__progress')),
    false,
  );
});
