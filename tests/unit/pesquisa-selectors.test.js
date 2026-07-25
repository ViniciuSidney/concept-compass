import assert from 'node:assert/strict';
import test from 'node:test';

import { DIFFICULTIES, STUDY_STATES, createEmptyData } from '../../src/domain/constants.js';
import {
  SEARCH_TYPES,
  normalizeSearchType,
  selectSearchCounts,
  selectSearchResults,
} from '../../src/features/pesquisa/pesquisa-selectors.js';
import { assunto, materia, tema } from '../fixtures/data-builders.js';

function createData() {
  return {
    ...createEmptyData(),
    materias: [
      materia({ id: 'm1', nome: 'Matemática', descricao: 'Ciências exatas', ordem: 0 }),
      materia({ id: 'm2', nome: 'História', descricao: 'Sociedade e tempo', ordem: 1 }),
    ],
    temas: [
      tema({ id: 't1', materiaId: 'm1', nome: 'Álgebra', descricao: 'Expressões', ordem: 0 }),
      tema({ id: 't2', materiaId: 'm2', nome: 'Brasil Colônia', descricao: '', ordem: 0 }),
    ],
    assuntos: [
      assunto({
        id: 'a1',
        temaId: 't1',
        nome: 'Equação do primeiro grau',
        descricao: 'Resolução de problemas',
        observacoes: 'Revisar operações inversas',
        estado: STUDY_STATES.EM_ESTUDO,
        dificuldade: DIFFICULTIES.MEDIA,
        ordem: 0,
      }),
      assunto({
        id: 'a2',
        temaId: 't2',
        nome: 'Economia açucareira',
        descricao: 'Produção colonial',
        ordem: 0,
      }),
    ],
  };
}

test('Pesquisa Geral ignora caixa e acentos em nomes e descrições', () => {
  const data = createData();

  assert.equal(selectSearchResults(data, { query: 'ALGEBRA' })[0].id, 't1');
  assert.equal(selectSearchResults(data, { query: 'producao colonial' })[0].id, 'a2');
  assert.equal(selectSearchResults(data, { query: 'ciencias exatas' })[0].id, 'm1');
});

test('Pesquisa Geral inclui observações dos assuntos sem pesquisar ancestrais', () => {
  const data = createData();
  const observations = selectSearchResults(data, { query: 'operações inversas' });
  const ancestorOnly = selectSearchResults(data, { query: 'Matemática' });

  assert.deepEqual(
    observations.map(({ id }) => id),
    ['a1'],
  );
  assert.deepEqual(
    ancestorOnly.map(({ id }) => id),
    ['m1'],
  );
});

test('filtro limita resultados ao tipo selecionado', () => {
  const data = createData();
  const all = selectSearchResults(data, { query: 'a' });
  const assuntos = selectSearchResults(data, { query: 'a', type: SEARCH_TYPES.ASSUNTO });

  assert.ok(all.length > assuntos.length);
  assert.ok(assuntos.every(({ type }) => type === SEARCH_TYPES.ASSUNTO));
  assert.equal(normalizeSearchType('inexistente'), SEARCH_TYPES.ALL);
});

test('contagens refletem o termo sem depender do filtro ativo', () => {
  const counts = selectSearchCounts(createData(), { query: 'colonia' });

  assert.equal(counts[SEARCH_TYPES.ALL], 2);
  assert.equal(counts[SEARCH_TYPES.MATERIA], 0);
  assert.equal(counts[SEARCH_TYPES.TEMA], 1);
  assert.equal(counts[SEARCH_TYPES.ASSUNTO], 1);
});

test('resultados geram navegação profunda para tema e assunto', () => {
  const data = createData();
  const theme = selectSearchResults(data, { query: 'álgebra' })[0];
  const subject = selectSearchResults(data, { query: 'equação' })[0];

  assert.equal(theme.href, '#/materias/m1?tema=t1');
  assert.equal(subject.href, '#/materias/m1?tema=t1&assunto=a1');
  assert.equal(subject.materia.nome, 'Matemática');
  assert.equal(subject.tema.nome, 'Álgebra');
});

test('título exato aparece antes de correspondência em descrição', () => {
  const data = createData();
  data.materias[1].descricao = 'Álgebra e sociedade';
  const results = selectSearchResults(data, { query: 'álgebra' });

  assert.equal(results[0].id, 't1');
  assert.equal(results[1].id, 'm2');
});

test('termo vazio não devolve listagem massiva, mas contagens continuam disponíveis', () => {
  const data = createData();

  assert.deepEqual(selectSearchResults(data), []);
  assert.deepEqual(selectSearchCounts(data), {
    tudo: 6,
    materia: 2,
    tema: 2,
    assunto: 2,
  });
});
