import { createButton } from '../../ui/components/button.js';
import { createPageHeader } from '../../ui/components/page-header.js';
import { createSearchField } from '../../ui/components/search-field.js';
import { createEmptyState } from '../../ui/states/empty-state.js';
import { createMateriaCard } from './materia-card.js';
import { createMateriaDeleteDialog } from './materia-delete-dialog.js';
import { createMateriaFormModal } from './materia-form.js';
import { createMateriasController } from './materias-controller.js';
import {
  MATERIAS_SORT_MODES,
  selectMateriaImpact,
  selectMateriaSummaries,
} from './materias-selectors.js';

export function createMateriasPage(documentObject, _route, context) {
  const { store, repository, appShell, overlayManager, windowObject } = context;
  const controller = createMateriasController({ store, repository });
  const page = documentObject.createElement('div');
  const createButtonElement = createButton(documentObject, {
    label: 'Nova matéria',
    icon: 'plus',
    onClick: openCreateForm,
  });
  const header = createPageHeader(documentObject, {
    eyebrow: 'Organização',
    title: 'Matérias',
    description: 'Organize as grandes áreas dos seus estudos e acompanhe o avanço de cada uma.',
    actions: createButtonElement,
  });
  const toolbar = documentObject.createElement('section');
  const search = createSearchField(documentObject, {
    label: 'Pesquisar matérias',
    placeholder: 'Pesquisar por nome ou descrição…',
    onInput(value) {
      viewState.query = value;
      renderResults();
    },
  });
  const sortGroup = documentObject.createElement('label');
  const sortLabel = documentObject.createElement('span');
  const sortSelect = documentObject.createElement('select');
  const resultSummary = documentObject.createElement('p');
  const results = documentObject.createElement('div');
  const viewState = {
    query: '',
    sortMode: MATERIAS_SORT_MODES.MANUAL,
  };

  page.className = 'materias-page';
  toolbar.className = 'materias-toolbar';
  toolbar.setAttribute('aria-label', 'Ferramentas de matérias');
  search.element.classList.add('materias-toolbar__search');
  sortGroup.className = 'materias-toolbar__sort';
  sortLabel.textContent = 'Ordenar por';
  sortSelect.setAttribute('aria-label', 'Ordenar matérias');
  appendOption(documentObject, sortSelect, MATERIAS_SORT_MODES.MANUAL, 'Ordem personalizada');
  appendOption(documentObject, sortSelect, MATERIAS_SORT_MODES.NAME, 'Nome de A a Z');
  appendOption(documentObject, sortSelect, MATERIAS_SORT_MODES.RECENT, 'Atualizadas recentemente');
  sortGroup.append(sortLabel, sortSelect);
  resultSummary.className = 'materias-toolbar__summary';
  resultSummary.setAttribute('aria-live', 'polite');
  toolbar.append(search.element, sortGroup, resultSummary);
  results.className = 'materias-results';
  page.append(header, toolbar, results);

  sortSelect.addEventListener('change', () => {
    viewState.sortMode = sortSelect.value;
    renderResults();
  });

  function renderResults() {
    const data = controller.getData();
    const summaries = selectMateriaSummaries(data, viewState);
    const total = data.materias.length;
    const manualReorderAvailable =
      viewState.sortMode === MATERIAS_SORT_MODES.MANUAL && viewState.query.trim() === '';

    resultSummary.textContent = createResultSummary(summaries.length, total, viewState.query);
    results.replaceChildren();

    if (total === 0) {
      results.append(
        createEmptyState(documentObject, {
          title: 'Nenhuma matéria cadastrada',
          message:
            'Crie sua primeira matéria para começar a estruturar os temas e assuntos que deseja estudar.',
          icon: 'book',
          action: createButton(documentObject, {
            label: 'Criar primeira matéria',
            icon: 'plus',
            onClick: openCreateForm,
          }),
        }),
      );
      return;
    }

    if (summaries.length === 0) {
      results.append(
        createEmptyState(documentObject, {
          title: 'Nenhuma matéria encontrada',
          message: 'Tente outro termo ou limpe a pesquisa para visualizar todas as matérias.',
          icon: 'search',
          compact: true,
          action: createButton(documentObject, {
            label: 'Limpar pesquisa',
            variant: 'secondary',
            onClick() {
              viewState.query = '';
              search.clear();
              renderResults();
              search.focus();
            },
          }),
        }),
      );
      return;
    }

    const grid = documentObject.createElement('div');
    grid.className = 'materias-grid';
    grid.setAttribute('role', 'list');

    for (const summary of summaries) {
      const { materia } = summary;
      grid.append(
        createMateriaCard(documentObject, {
          summary,
          showReorder: manualReorderAvailable,
          canMoveUp: materia.ordem > 0,
          canMoveDown: materia.ordem < total - 1,
          onEdit: () => openEditForm(materia),
          onDelete: () => openDeleteDialog(materia),
          onMoveUp: () => moveMateria(materia, materia.ordem - 1),
          onMoveDown: () => moveMateria(materia, materia.ordem + 1),
        }),
      );
    }

    results.append(grid);
  }

  function openCreateForm() {
    const form = createMateriaFormModal(documentObject, {
      overlayManager,
      windowObject,
      async onSubmit(input) {
        const materia = controller.add(input);
        renderResults();
        appShell.showToast({
          tone: 'success',
          title: 'Matéria criada',
          message: `${materia.nome} foi adicionada à sua organização.`,
        });
        appShell.announce(`Matéria ${materia.nome} criada com sucesso.`);
      },
    });
    form.open();
  }

  function openEditForm(materia) {
    const form = createMateriaFormModal(documentObject, {
      materia,
      overlayManager,
      windowObject,
      async onSubmit(input) {
        const updated = controller.edit(materia.id, input);
        renderResults();
        appShell.showToast({
          tone: 'success',
          title: 'Matéria atualizada',
          message: `As alterações em ${updated.nome} foram salvas.`,
        });
        appShell.announce(`Matéria ${updated.nome} atualizada com sucesso.`);
      },
    });
    form.open();
  }

  function openDeleteDialog(materia) {
    const data = controller.getData();
    const impact = selectMateriaImpact(data, materia.id);
    const dialog = createMateriaDeleteDialog(documentObject, {
      materia,
      impact,
      overlayManager,
      async onConfirm() {
        const removed = controller.remove(materia.id);
        renderResults();
        appShell.showToast({
          tone: 'success',
          title: 'Matéria excluída',
          message: `${materia.nome} e sua estrutura relacionada foram removidas.`,
        });
        appShell.announce(
          `Matéria ${materia.nome} excluída. ${removed.temas} temas e ${removed.assuntos} assuntos removidos.`,
        );
      },
    });
    dialog.open();
  }

  function moveMateria(materia, targetIndex) {
    try {
      controller.reorder(materia.id, targetIndex);
      renderResults();
      appShell.showToast({
        tone: 'success',
        title: 'Ordem atualizada',
        message: `${materia.nome} foi movida na lista.`,
        duration: 2800,
      });
      appShell.announce(`A posição de ${materia.nome} foi atualizada.`);
    } catch (error) {
      appShell.showToast({
        tone: 'danger',
        title: 'Não foi possível reordenar',
        message: error.message,
        duration: 0,
      });
    }
  }

  renderResults();
  return page;
}

function appendOption(documentObject, select, value, label) {
  const option = documentObject.createElement('option');
  option.value = value;
  option.textContent = label;
  select.append(option);
}

function createResultSummary(visible, total, query) {
  if (query.trim()) {
    return `${visible} de ${total} ${total === 1 ? 'matéria' : 'matérias'}`;
  }

  return `${total} ${total === 1 ? 'matéria cadastrada' : 'matérias cadastradas'}`;
}
