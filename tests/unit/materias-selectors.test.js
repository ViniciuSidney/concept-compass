import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MATERIAS_SORT_MODES,
  selectMateriaImpact,
  selectMateriaSummaries,
} from '../../src/features/materias/materias-selectors.js';
import { assunto, materia, tema, validData } from '../fixtures/data-builders.js';

function dataWithMaterias() {
  return validData({
    materias: [
      materia({ id: 'm1', nome: 'Matemática', descricao: 'Números e álgebra', ordem: 0 }),
      materia({
        id: 'm2',
        nome: 'História',
        descricao: 'Brasil Colônia',
        ordem: 1,
        atualizadoEm: '2026-07-25T12:00:00.000Z',
      }),
    ],
    temas: [tema({ id: 't1', materiaId: 'm1' }), tema({ id: 't2', materiaId: 'm2' })],
    assuntos: [
      assunto({ id: 'a1', temaId: 't1', pontosProgresso: 5 }),
      assunto({ id: 'a2', temaId: 't2', pontosProgresso: 0 }),
    ],
  });
}

test('resume somente estrutura e Assuntos de cada Matéria', () => {
  const summaries = selectMateriaSummaries(dataWithMaterias());
  assert.equal(summaries[0].temasCount, 1);
  assert.equal(summaries[0].assuntosCount, 1);
  assert.deepEqual(
    summaries[0].assuntos.map(({ id }) => id),
    ['a1'],
  );
  assert.equal('progress' in summaries[0], false);
  assert.equal('progressSummary' in summaries[0], false);
});

test('pesquisa matérias ignorando caixa e acentos', () => {
  const summaries = selectMateriaSummaries(dataWithMaterias(), { query: 'matematica' });
  assert.deepEqual(
    summaries.map(({ materia: item }) => item.id),
    ['m1'],
  );
});

test('ordena por nome e atualização sem alterar ordem armazenada', () => {
  const data = dataWithMaterias();
  const byName = selectMateriaSummaries(data, { sortMode: MATERIAS_SORT_MODES.NAME });
  const byRecent = selectMateriaSummaries(data, { sortMode: MATERIAS_SORT_MODES.RECENT });
  assert.deepEqual(
    byName.map(({ materia: item }) => item.id),
    ['m2', 'm1'],
  );
  assert.deepEqual(
    byRecent.map(({ materia: item }) => item.id),
    ['m2', 'm1'],
  );
  assert.deepEqual(
    data.materias.map(({ id }) => id),
    ['m1', 'm2'],
  );
});

test('calcula impacto de exclusão', () => {
  assert.deepEqual(selectMateriaImpact(dataWithMaterias(), 'm1'), { temas: 1, assuntos: 1 });
});
