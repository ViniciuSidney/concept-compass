import { createButton, createButtonLink } from '../../ui/components/button.js';
import { createFilterChip } from '../../ui/components/filter-chip.js';
import { createPageHeader } from '../../ui/components/page-header.js';
import { createSearchField } from '../../ui/components/search-field.js';
import { createEmptyState } from '../../ui/states/empty-state.js';
import { createPesquisaResultCard } from './pesquisa-result-card.js';
import {
  SEARCH_TYPE_LABELS,
  SEARCH_TYPE_VALUES,
  SEARCH_TYPES,
  normalizeSearchType,
  selectSearchCounts,
  selectSearchResults,
} from './pesquisa-selectors.js';

export function createPesquisaPage(documentObject, route, context) {
  const { store, windowObject } = context;
  const data = store.getState().data;
  const page = documentObject.createElement('div');
  const header = createPageHeader(documentObject, {
    eyebrow: 'Localização',
    title: 'Pesquisa Geral',
    description: 'Encontre Matérias, Temas e Assuntos em toda a sua organização.',
  });
  const searchArea = documentObject.createElement('section');
  const search = createSearchField(documentObject, {
    label: 'Pesquisar na organização',
    placeholder: 'Pesquisar por matéria, tema ou assunto…',
    value: route.query.q ?? '',
    onInput(value) {
      viewState.query = value;
      syncUrl();
      renderResults();
    },
    onSubmit(value) {
      viewState.query = value;
      syncUrl();
      renderResults();
    },
  });
  const filters = documentObject.createElement('div');
  const resultSummary = documentObject.createElement('p');
  const results = documentObject.createElement('section');
  const viewState = {
    query: route.query.q ?? '',
    type: normalizeSearchType(route.query.tipo),
  };

  page.className = 'pesquisa-page';
  searchArea.className = 'pesquisa-toolbar';
  search.element.classList.add('pesquisa-toolbar__search');
  filters.className = 'pesquisa-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filtrar resultados por tipo');
  resultSummary.className = 'pesquisa-summary';
  resultSummary.setAttribute('aria-live', 'polite');
  results.className = 'pesquisa-results';
  results.setAttribute('aria-label', 'Resultados da pesquisa');
  searchArea.append(search.element, filters, resultSummary);
  page.append(header, searchArea, results);

  function renderResults() {
    const counts = selectSearchCounts(data, { query: viewState.query });
    const matching = selectSearchResults(data, viewState);
    renderFilters(counts);
    results.replaceChildren();

    if (data.materias.length === 0) {
      resultSummary.textContent = 'Organização vazia';
      results.append(
        createEmptyState(documentObject, {
          title: 'Ainda não há conteúdos para pesquisar',
          message: 'Crie uma matéria, depois adicione temas e assuntos para usar a Pesquisa Geral.',
          icon: 'search',
          action: createButtonLink(documentObject, {
            label: 'Criar primeira matéria',
            href: '#/materias',
            icon: 'plus',
          }),
        }),
      );
      return;
    }

    if (!viewState.query.trim()) {
      resultSummary.textContent = createAvailableSummary(counts[viewState.type], viewState.type);
      results.append(
        createEmptyState(documentObject, {
          title: 'Pesquise sua organização',
          message:
            'Digite um nome, descrição ou observação para localizar Matérias, Temas e Assuntos.',
          icon: 'search',
          compact: true,
        }),
      );
      return;
    }

    resultSummary.textContent = createResultSummary(matching.length, viewState.type);

    if (matching.length === 0) {
      results.append(
        createEmptyState(documentObject, {
          title: 'Nenhum resultado encontrado',
          message: 'Tente outro termo, altere o filtro selecionado ou limpe a pesquisa.',
          icon: 'search',
          compact: true,
          action: createButton(documentObject, {
            label: 'Limpar pesquisa',
            variant: 'secondary',
            onClick() {
              viewState.query = '';
              viewState.type = SEARCH_TYPES.ALL;
              search.clear();
              syncUrl();
              renderResults();
              search.focus();
            },
          }),
        }),
      );
      return;
    }

    const heading = documentObject.createElement('div');
    const title = documentObject.createElement('h2');
    const description = documentObject.createElement('p');
    const grid = documentObject.createElement('div');
    heading.className = 'pesquisa-results__heading';
    title.id = 'pesquisa-resultados-titulo';
    title.textContent = 'Resultados encontrados';
    description.textContent = createResultDescription(matching.length, viewState.type);
    heading.append(title, description);
    grid.className = 'pesquisa-results__grid';
    grid.setAttribute('role', 'list');
    matching.forEach((result) => grid.append(createPesquisaResultCard(documentObject, result)));
    results.append(heading, grid);
  }

  function renderFilters(counts) {
    filters.replaceChildren();
    for (const type of SEARCH_TYPE_VALUES) {
      const chip = createFilterChip(documentObject, {
        label: SEARCH_TYPE_LABELS[type],
        count: counts[type],
        selected: viewState.type === type,
        onChange() {
          viewState.type = type;
          syncUrl();
          renderResults();
        },
      });
      filters.append(chip.element);
    }
  }

  function syncUrl() {
    const params = new URLSearchParams();
    const query = viewState.query.trim();
    if (query) params.set('q', query);
    if (viewState.type !== SEARCH_TYPES.ALL) params.set('tipo', viewState.type);
    const queryString = params.toString();
    const hash = `#/pesquisa${queryString ? `?${queryString}` : ''}`;

    if (windowObject?.location?.hash === hash) return;
    windowObject?.history?.replaceState?.(null, '', hash);
  }

  renderResults();
  return page;
}

function createResultSummary(count, type) {
  if (type === SEARCH_TYPES.ALL) return `${count} ${count === 1 ? 'resultado' : 'resultados'}`;
  return `${count} ${createTypeNoun(type, count)}`;
}

function createAvailableSummary(count, type) {
  if (type === SEARCH_TYPES.ALL)
    return `${count} ${count === 1 ? 'item disponível' : 'itens disponíveis'}`;
  return `${count} ${createTypeNoun(type, count)} ${count === 1 ? 'disponível' : 'disponíveis'}`;
}

function createTypeNoun(type, count) {
  const singular = {
    [SEARCH_TYPES.MATERIA]: 'matéria',
    [SEARCH_TYPES.TEMA]: 'tema',
    [SEARCH_TYPES.ASSUNTO]: 'assunto',
  };
  return count === 1 ? singular[type] : SEARCH_TYPE_LABELS[type].toLowerCase();
}

function createResultDescription(count, type) {
  const scope =
    type === SEARCH_TYPES.ALL ? 'em toda a organização' : `em ${SEARCH_TYPE_LABELS[type]}`;
  return `${count} ${count === 1 ? 'correspondência encontrada' : 'correspondências encontradas'} ${scope}.`;
}
