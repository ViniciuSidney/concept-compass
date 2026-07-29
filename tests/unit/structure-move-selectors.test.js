import assert from 'node:assert/strict';
import test from 'node:test';

import {
  describeAssuntoOrigin,
  describeTemaOrigin,
  selectAssuntoMoveDestinations,
  selectAssuntoMovePositions,
  selectTemaMoveDestinations,
  selectTemaMovePositions,
} from '../../src/features/materias/structure-move-selectors.js';
import { assunto, materia, tema, validData } from '../fixtures/data-builders.js';

const data = validData({
  materias: [
    materia({ id: 'm1', nome: 'Matemática', ordem: 0 }),
    materia({ id: 'm2', nome: 'Física', ordem: 1 }),
  ],
  temas: [
    tema({ id: 't1', materiaId: 'm1', nome: 'Álgebra', ordem: 0 }),
    tema({ id: 't2', materiaId: 'm1', nome: 'Geometria', ordem: 1 }),
    tema({ id: 't3', materiaId: 'm2', nome: 'Mecânica', ordem: 0 }),
  ],
  assuntos: [
    assunto({ id: 'a1', temaId: 't1', nome: 'Equação', ordem: 0 }),
    assunto({ id: 'a2', temaId: 't1', nome: 'Função', ordem: 1 }),
    assunto({ id: 'a3', temaId: 't3', nome: 'Velocidade', ordem: 0 }),
  ],
});

test('destinos de tema seguem a ordem das matérias e identificam a origem', () => {
  assert.deepEqual(selectTemaMoveDestinations(data, 't1'), [
    { id: 'm1', label: 'Matemática', current: true, itemCount: 2 },
    { id: 'm2', label: 'Física', current: false, itemCount: 1 },
  ]);
  assert.equal(describeTemaOrigin(data, 't1'), 'Matemática');
});

test('destinos de assunto exibem caminho hierárquico completo', () => {
  const destinations = selectAssuntoMoveDestinations(data, 'a1');
  assert.deepEqual(
    destinations.map(({ id, label, current }) => [id, label, current]),
    [
      ['t1', 'Matemática › Álgebra', true],
      ['t2', 'Matemática › Geometria', false],
      ['t3', 'Física › Mecânica', false],
    ],
  );
  assert.equal(describeAssuntoOrigin(data, 'a1'), 'Matemática › Álgebra');
});

test('posições consideram remoção do item atual e inserção no destino', () => {
  assert.deepEqual(
    selectTemaMovePositions(data, 't1', 'm1').map(({ index, current }) => [index, current]),
    [
      [0, true],
      [1, false],
    ],
  );
  assert.deepEqual(
    selectTemaMovePositions(data, 't1', 'm2').map(({ index, label }) => [index, label]),
    [
      [0, '1ª posição — início'],
      [1, '2ª posição — final'],
    ],
  );
  assert.deepEqual(
    selectAssuntoMovePositions(data, 'a2', 't3').map(({ index }) => index),
    [0, 1],
  );
});
