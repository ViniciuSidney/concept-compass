import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeOrder, reorderItems } from '../../src/domain/services/ordering-service.js';

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
