import assert from 'node:assert/strict';
import test from 'node:test';

import { STUDY_STATES } from '../../src/domain/constants.js';
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
      assunto({ id: 'a1', temaId: 't1', estado: STUDY_STATES.CONSOLIDADO }),
      assunto({ id: 'a2', temaId: 't2', estado: STUDY_STATES.NAO_INICIADO }),
    ],
  });
}

test('resume contagens e progresso de cada matéria', () => {
  const summaries = selectMateriaSummaries(dataWithMaterias());

  assert.equal(summaries[0].temasCount, 1);
  assert.equal(summaries[0].assuntosCount, 1);
  assert.equal(summaries[0].progress, 100);
  assert.equal(summaries[1].progress, 0);
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
  const impact = selectMateriaImpact(dataWithMaterias(), 'm1');

  assert.deepEqual(impact, { temas: 1, assuntos: 1 });
});
