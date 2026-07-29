import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateAssuntosProgress,
  calculateMateriaProgress,
  calculateTemaProgress,
  deriveProgressStatus,
  summarizeAssuntosProgress,
} from '../../src/domain/services/progress-service.js';
import { normalizeOrder, reorderItems } from '../../src/domain/services/ordering-service.js';
import { assunto, validData } from '../fixtures/data-builders.js';

test('progresso vazio retorna ausência de progresso', () => {
  assert.equal(calculateAssuntosProgress([]), null);
  assert.equal(summarizeAssuntosProgress([]), null);
});

test('progresso usa soma de pontos e metas, não média simples das porcentagens', () => {
  const result = summarizeAssuntosProgress([
    assunto({ pontosProgresso: 3, metaPontosProgresso: 5 }),
    assunto({ id: 'assunto-2', pontosProgresso: 2, metaPontosProgresso: 10 }),
  ]);

  assert.deepEqual(result, { points: 5, total: 15, percentage: 33.33333333333333 });
  assert.equal(
    calculateAssuntosProgress([
      assunto({ pontosProgresso: 3, metaPontosProgresso: 5 }),
      assunto({ id: 'assunto-2', pontosProgresso: 2, metaPontosProgresso: 10 }),
    ]),
    33.33333333333333,
  );
});

test('progresso de tema e matéria considera os assuntos corretos', () => {
  const data = validData({
    assuntos: [
      assunto({ pontosProgresso: 1, metaPontosProgresso: 5 }),
      assunto({ id: 'assunto-2', ordem: 1, pontosProgresso: 5, metaPontosProgresso: 5 }),
    ],
  });

  assert.equal(calculateTemaProgress(data, 'tema-1'), 60);
  assert.equal(calculateMateriaProgress(data, 'materia-1'), 60);
});

test('situação é derivada dos pontos atuais', () => {
  assert.equal(deriveProgressStatus(assunto()), 'not_started');
  assert.equal(deriveProgressStatus(assunto({ pontosProgresso: 2 })), 'in_progress');
  assert.equal(deriveProgressStatus(assunto({ pontosProgresso: 5 })), 'complete');
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
