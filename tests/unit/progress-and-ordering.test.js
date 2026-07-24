import assert from 'node:assert/strict';
import test from 'node:test';

import { STUDY_STATES } from '../../src/domain/constants.js';
import {
  calculateAssuntosProgress,
  calculateMateriaProgress,
  calculateTemaProgress,
} from '../../src/domain/services/progress-service.js';
import { normalizeOrder, reorderItems } from '../../src/domain/services/ordering-service.js';
import { assunto, validData } from '../fixtures/data-builders.js';

test('progresso vazio retorna ausência de progresso', () => {
  assert.equal(calculateAssuntosProgress([]), null);
});

test('progresso preserva média fracionária internamente', () => {
  const result = calculateAssuntosProgress([
    assunto({ estado: STUDY_STATES.NAO_INICIADO }),
    assunto({ id: 'assunto-2', estado: STUDY_STATES.ESTUDADO }),
  ]);

  assert.equal(result, 37.5);
});

test('progresso de tema e matéria considera os assuntos corretos', () => {
  const data = validData({
    assuntos: [
      assunto({ estado: STUDY_STATES.EM_ESTUDO }),
      assunto({ id: 'assunto-2', ordem: 1, estado: STUDY_STATES.CONSOLIDADO }),
    ],
  });

  assert.equal(calculateTemaProgress(data, 'tema-1'), 62.5);
  assert.equal(calculateMateriaProgress(data, 'materia-1'), 62.5);
});

test('reordenação limita posição e normaliza a sequência', () => {
  const items = [
    { id: 'a', ordem: 0 },
    { id: 'b', ordem: 1 },
    { id: 'c', ordem: 2 },
  ];

  assert.deepEqual(
    reorderItems(items, 'c', -10).map(({ id, ordem }) => [id, ordem]),
    [
      ['c', 0],
      ['a', 1],
      ['b', 2],
    ],
  );
  assert.deepEqual(
    normalizeOrder([
      { id: 'b', ordem: 8 },
      { id: 'a', ordem: 3 },
    ]),
    [
      { id: 'a', ordem: 0 },
      { id: 'b', ordem: 1 },
    ],
  );
});

test('reordenação rejeita identificador ausente e posição não inteira', () => {
  assert.throws(() => reorderItems([{ id: 'a', ordem: 0 }], 'x', 0), /não encontrado/i);
  assert.throws(() => reorderItems([{ id: 'a', ordem: 0 }], 'a', 0.5), /número inteiro/i);
});
