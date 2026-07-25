import { normalizeSearchText } from '../../utils/text.js';

export const SEARCH_TYPES = Object.freeze({
  ALL: 'tudo',
  MATERIA: 'materia',
  TEMA: 'tema',
  ASSUNTO: 'assunto',
});

export const SEARCH_TYPE_VALUES = Object.freeze(Object.values(SEARCH_TYPES));

export const SEARCH_TYPE_LABELS = Object.freeze({
  [SEARCH_TYPES.ALL]: 'Tudo',
  [SEARCH_TYPES.MATERIA]: 'Matérias',
  [SEARCH_TYPES.TEMA]: 'Temas',
  [SEARCH_TYPES.ASSUNTO]: 'Assuntos',
});

const TYPE_ORDER = Object.freeze({
  [SEARCH_TYPES.MATERIA]: 0,
  [SEARCH_TYPES.TEMA]: 1,
  [SEARCH_TYPES.ASSUNTO]: 2,
});

export function normalizeSearchType(value) {
  return SEARCH_TYPE_VALUES.includes(value) ? value : SEARCH_TYPES.ALL;
}

export function selectSearchResults(data, { query = '', type = SEARCH_TYPES.ALL } = {}) {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedType = normalizeSearchType(type);

  if (!normalizedQuery) return [];

  return createSearchCatalog(data)
    .filter((result) => normalizedType === SEARCH_TYPES.ALL || result.type === normalizedType)
    .map((result) => ({ ...result, matchRank: calculateMatchRank(result, normalizedQuery) }))
    .filter(({ matchRank }) => Number.isFinite(matchRank))
    .toSorted(compareResults)
    .map(
      ({ matchRank: _matchRank, searchTitle: _searchTitle, searchBody: _searchBody, ...result }) =>
        Object.freeze(result),
    );
}

export function selectSearchCounts(data, { query = '' } = {}) {
  const normalizedQuery = normalizeSearchText(query);
  const catalog = createSearchCatalog(data);
  const matching = normalizedQuery
    ? catalog.filter((result) => Number.isFinite(calculateMatchRank(result, normalizedQuery)))
    : catalog;
  const counts = {
    [SEARCH_TYPES.ALL]: matching.length,
    [SEARCH_TYPES.MATERIA]: 0,
    [SEARCH_TYPES.TEMA]: 0,
    [SEARCH_TYPES.ASSUNTO]: 0,
  };

  for (const result of matching) counts[result.type] += 1;
  return Object.freeze(counts);
}

export function createSearchCatalog(data) {
  const materiasById = new Map(data.materias.map((materia) => [materia.id, materia]));
  const temasById = new Map(data.temas.map((tema) => [tema.id, tema]));
  const temasByMateria = groupBy(data.temas, (tema) => tema.materiaId);
  const assuntosByTema = groupBy(data.assuntos, (assunto) => assunto.temaId);
  const catalog = [];

  for (const materia of data.materias) {
    const temas = temasByMateria.get(materia.id) ?? [];
    const assuntosCount = temas.reduce(
      (total, tema) => total + (assuntosByTema.get(tema.id)?.length ?? 0),
      0,
    );
    catalog.push(
      createCatalogEntry({
        id: materia.id,
        type: SEARCH_TYPES.MATERIA,
        title: materia.nome,
        description: materia.descricao,
        materia,
        temasCount: temas.length,
        assuntosCount,
        href: `#/materias/${encodeURIComponent(materia.id)}`,
        searchBody: materia.descricao,
      }),
    );
  }

  for (const tema of data.temas) {
    const materia = materiasById.get(tema.materiaId);
    if (!materia) continue;
    const assuntosCount = assuntosByTema.get(tema.id)?.length ?? 0;
    catalog.push(
      createCatalogEntry({
        id: tema.id,
        type: SEARCH_TYPES.TEMA,
        title: tema.nome,
        description: tema.descricao,
        materia,
        tema,
        assuntosCount,
        href: createMateriaDeepLink(materia.id, { temaId: tema.id }),
        searchBody: tema.descricao,
      }),
    );
  }

  for (const assunto of data.assuntos) {
    const tema = temasById.get(assunto.temaId);
    const materia = tema ? materiasById.get(tema.materiaId) : null;
    if (!tema || !materia) continue;
    catalog.push(
      createCatalogEntry({
        id: assunto.id,
        type: SEARCH_TYPES.ASSUNTO,
        title: assunto.nome,
        description: assunto.descricao,
        materia,
        tema,
        assunto,
        href: createMateriaDeepLink(materia.id, {
          temaId: tema.id,
          assuntoId: assunto.id,
        }),
        searchBody: `${assunto.descricao} ${assunto.observacoes}`,
      }),
    );
  }

  return catalog;
}

function createCatalogEntry(entry) {
  return Object.freeze({
    ...entry,
    description: entry.description || '',
    searchTitle: normalizeSearchText(entry.title),
    searchBody: normalizeSearchText(entry.searchBody),
  });
}

function createMateriaDeepLink(materiaId, { temaId = null, assuntoId = null } = {}) {
  const params = new URLSearchParams();
  if (temaId) params.set('tema', temaId);
  if (assuntoId) params.set('assunto', assuntoId);
  const query = params.toString();
  return `#/materias/${encodeURIComponent(materiaId)}${query ? `?${query}` : ''}`;
}

function calculateMatchRank(result, query) {
  if (result.searchTitle === query) return 0;
  if (result.searchTitle.startsWith(query)) return 1;
  if (result.searchTitle.includes(query)) return 2;
  if (result.searchBody.includes(query)) return 3;
  return Number.POSITIVE_INFINITY;
}

function compareResults(left, right) {
  return (
    left.matchRank - right.matchRank ||
    TYPE_ORDER[left.type] - TYPE_ORDER[right.type] ||
    left.title.localeCompare(right.title, 'pt-BR')
  );
}

function groupBy(items, getKey) {
  const groups = new Map();
  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}
