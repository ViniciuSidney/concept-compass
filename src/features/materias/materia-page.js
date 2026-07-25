import {
  selectAssuntoById,
  selectAssuntosByMateria,
  selectMateriaById,
  selectTemaById,
  selectTemasByMateria,
} from '../../domain/selectors/hierarchy-selectors.js';
import { calculateMateriaProgress } from '../../domain/services/progress-service.js';
import { createButton, createButtonLink } from '../../ui/components/button.js';
import { createPageHeader } from '../../ui/components/page-header.js';
import { createProgressBar } from '../../ui/components/progress-bar.js';
import { createEmptyState } from '../../ui/states/empty-state.js';
import { createErrorState } from '../../ui/states/error-state.js';
import { createAssuntoDeleteDialog } from './assunto-delete-dialog.js';
import { createAssuntoDetailPanel } from './assunto-detail-panel.js';
import { createAssuntoFormModal } from './assunto-form.js';
import { createMateriaWorkspaceController } from './materia-workspace-controller.js';
import {
  selectAssuntoDetails,
  selectTemaDeleteImpact,
  selectTemaSections,
} from './materia-workspace-selectors.js';
import { createTemaAccordion } from './tema-accordion.js';
import { createTemaDeleteDialog } from './tema-delete-dialog.js';
import { createTemaFormModal } from './tema-form.js';

export function createMateriaPage(documentObject, route, context) {
  const { store, repository, appShell, overlayManager, windowObject } = context;
  const materiaId = route.params.materiaId;
  const initialData = store.getState().data;
  const initialMateria = selectMateriaById(initialData, materiaId);
  const page = documentObject.createElement('div');

  page.className = 'materia-page';

  if (!initialMateria) {
    renderNotFound(documentObject, page);
    return page;
  }

  const controller = createMateriaWorkspaceController({ store, repository });
  const initialTemas = selectTemasByMateria(initialData, materiaId);
  const expandedTemaIds = new Set(initialTemas.slice(0, 1).map(({ id }) => id));

  function render() {
    const data = controller.getData();
    const materia = selectMateriaById(data, materiaId);

    if (!materia) {
      renderNotFound(documentObject, page);
      return;
    }

    const temas = selectTemasByMateria(data, materia.id);
    const assuntos = selectAssuntosByMateria(data, materia.id);
    const progress = calculateMateriaProgress(data, materia.id);
    const actions = [
      createButtonLink(documentObject, {
        label: 'Voltar para Matérias',
        href: '#/materias',
        variant: 'secondary',
        icon: 'arrow-left',
      }),
      createButton(documentObject, {
        label: 'Novo tema',
        icon: 'plus',
        onClick: openCreateTema,
      }),
    ];
    const header = createPageHeader(documentObject, {
      breadcrumb: [{ label: 'Matérias', href: '#/materias' }, { label: materia.nome }],
      eyebrow: 'Matéria',
      title: materia.nome,
      description: materia.descricao || 'Sem descrição cadastrada.',
      actions,
    });
    const summary = createMateriaSummary(
      documentObject,
      materia,
      temas.length,
      assuntos.length,
      progress,
    );
    const workspace = documentObject.createElement('section');
    const workspaceHeader = documentObject.createElement('div');
    const workspaceHeading = documentObject.createElement('div');
    const workspaceTitle = documentObject.createElement('h2');
    const workspaceDescription = documentObject.createElement('p');

    workspace.className = 'materia-workspace';
    workspaceHeader.className = 'materia-workspace__header';
    workspaceHeading.className = 'materia-workspace__heading';
    workspaceTitle.textContent = 'Temas da matéria';
    workspaceDescription.textContent =
      'Expanda um tema para organizar seus assuntos e acompanhar o progresso.';
    workspaceHeading.append(workspaceTitle, workspaceDescription);
    workspaceHeader.append(workspaceHeading);
    workspace.append(workspaceHeader);

    if (temas.length === 0) {
      workspace.append(
        createEmptyState(documentObject, {
          title: 'Nenhum tema cadastrado',
          message: 'Crie um tema para dividir esta matéria em grupos de assuntos relacionados.',
          icon: 'layers',
          action: createButton(documentObject, {
            label: 'Criar primeiro tema',
            icon: 'plus',
            onClick: openCreateTema,
          }),
        }),
      );
    } else {
      const list = documentObject.createElement('div');
      const sections = selectTemaSections(data, materia.id);
      list.className = 'temas-list';

      for (const section of sections) {
        const { tema } = section;
        list.append(
          createTemaAccordion(documentObject, {
            section,
            expanded: expandedTemaIds.has(tema.id),
            onToggle(isExpanded) {
              if (isExpanded) expandedTemaIds.add(tema.id);
              else expandedTemaIds.delete(tema.id);
            },
            onAddAssunto: () => openCreateAssunto(tema),
            onEditTema: () => openEditTema(tema),
            onDeleteTema: () => openDeleteTema(tema),
            onMoveTemaUp: () => moveTema(tema, tema.ordem - 1),
            onMoveTemaDown: () => moveTema(tema, tema.ordem + 1),
            onOpenAssunto: (assunto) => openAssuntoDetails(assunto.id),
            onEditAssunto: (assunto) => openEditAssunto(assunto),
            onDeleteAssunto: (assunto) => openDeleteAssunto(assunto),
            onMoveAssunto: (assunto, targetIndex) => moveAssunto(assunto, targetIndex),
            overlayManager,
          }),
        );
      }

      workspace.append(list);
    }

    page.replaceChildren(header, summary, workspace);
  }

  function openCreateTema() {
    const form = createTemaFormModal(documentObject, {
      overlayManager,
      windowObject,
      async onSubmit(input) {
        const tema = controller.addTema(materiaId, input);
        expandedTemaIds.add(tema.id);
        render();
        appShell.showToast({
          tone: 'success',
          title: 'Tema criado',
          message: `${tema.nome} foi adicionado à matéria.`,
        });
        appShell.announce(`Tema ${tema.nome} criado com sucesso.`);
      },
    });
    form.open();
  }

  function openEditTema(tema) {
    const current = selectTemaById(controller.getData(), tema.id);
    if (!current) return;

    const form = createTemaFormModal(documentObject, {
      tema: current,
      overlayManager,
      windowObject,
      async onSubmit(input) {
        const updated = controller.editTema(current.id, input);
        render();
        appShell.showToast({
          tone: 'success',
          title: 'Tema atualizado',
          message: `As alterações em ${updated.nome} foram salvas.`,
        });
        appShell.announce(`Tema ${updated.nome} atualizado com sucesso.`);
      },
    });
    form.open();
  }

  function openDeleteTema(tema) {
    const impact = selectTemaDeleteImpact(controller.getData(), tema.id);
    if (!impact) return;

    const dialog = createTemaDeleteDialog(documentObject, {
      tema: impact.tema,
      assuntosCount: impact.assuntos,
      overlayManager,
      async onConfirm() {
        const removed = controller.removeTema(tema.id);
        expandedTemaIds.delete(tema.id);
        render();
        appShell.showToast({
          tone: 'success',
          title: 'Tema excluído',
          message: `${tema.nome} e seus assuntos relacionados foram removidos.`,
        });
        appShell.announce(`Tema ${tema.nome} excluído. ${removed.assuntos} assuntos removidos.`);
      },
    });
    dialog.open();
  }

  function moveTema(tema, targetIndex) {
    try {
      controller.reorderTema(tema.id, targetIndex);
      render();
      appShell.showToast({
        tone: 'success',
        title: 'Ordem atualizada',
        message: `${tema.nome} foi movido na matéria.`,
        duration: 2500,
      });
      appShell.announce(`A posição do tema ${tema.nome} foi atualizada.`);
    } catch (error) {
      showOperationError('Não foi possível reordenar o tema', error);
    }
  }

  function openCreateAssunto(tema) {
    const current = selectTemaById(controller.getData(), tema.id);
    if (!current) return;

    const form = createAssuntoFormModal(documentObject, {
      overlayManager,
      windowObject,
      async onSubmit(input) {
        const assunto = controller.addAssunto(current.id, input);
        expandedTemaIds.add(current.id);
        render();
        appShell.showToast({
          tone: 'success',
          title: 'Assunto criado',
          message: `${assunto.nome} foi adicionado a ${current.nome}.`,
        });
        appShell.announce(`Assunto ${assunto.nome} criado com sucesso.`);
      },
    });
    form.open();
  }

  function openEditAssunto(assunto) {
    const current = selectAssuntoById(controller.getData(), assunto.id);
    if (!current) return;

    const form = createAssuntoFormModal(documentObject, {
      assunto: current,
      overlayManager,
      windowObject,
      async onSubmit(input) {
        const updated = controller.editAssunto(current.id, input);
        expandedTemaIds.add(updated.temaId);
        render();
        appShell.showToast({
          tone: 'success',
          title: 'Assunto atualizado',
          message: `As alterações em ${updated.nome} foram salvas.`,
        });
        appShell.announce(`Assunto ${updated.nome} atualizado com sucesso.`);
      },
    });
    form.open();
  }

  function openDeleteAssunto(assunto) {
    const current = selectAssuntoById(controller.getData(), assunto.id);
    if (!current) return;

    const dialog = createAssuntoDeleteDialog(documentObject, {
      assunto: current,
      overlayManager,
      async onConfirm() {
        controller.removeAssunto(current.id);
        render();
        appShell.showToast({
          tone: 'success',
          title: 'Assunto excluído',
          message: `${current.nome} foi removido.`,
        });
        appShell.announce(`Assunto ${current.nome} excluído com sucesso.`);
      },
    });
    dialog.open();
  }

  function moveAssunto(assunto, targetIndex) {
    try {
      controller.reorderAssunto(assunto.id, targetIndex);
      expandedTemaIds.add(assunto.temaId);
      render();
      appShell.showToast({
        tone: 'success',
        title: 'Ordem atualizada',
        message: `${assunto.nome} foi movido no tema.`,
        duration: 2500,
      });
      appShell.announce(`A posição do assunto ${assunto.nome} foi atualizada.`);
    } catch (error) {
      showOperationError('Não foi possível reordenar o assunto', error);
    }
  }

  function openAssuntoDetails(assuntoId) {
    const details = selectAssuntoDetails(controller.getData(), assuntoId);
    if (!details) return;

    const panel = createAssuntoDetailPanel(documentObject, {
      assunto: details.assunto,
      tema: details.tema,
      overlayManager,
      onEdit: () => openEditAssunto(details.assunto),
      onDelete: () => openDeleteAssunto(details.assunto),
    });
    panel.open();
  }

  function showOperationError(title, error) {
    appShell.showToast({
      tone: 'danger',
      title,
      message: error?.message || 'Ocorreu uma falha inesperada.',
      duration: 0,
    });
  }

  render();
  return page;
}

function renderNotFound(documentObject, page) {
  page.replaceChildren(
    createPageHeader(documentObject, {
      breadcrumb: [{ label: 'Matérias', href: '#/materias' }, { label: 'Não encontrada' }],
      eyebrow: 'Matérias',
      title: 'Matéria não encontrada',
      description: 'O registro pode ter sido removido ou o endereço informado não é válido.',
    }),
    createErrorState(documentObject, {
      title: 'Não foi possível abrir esta matéria',
      message: 'Volte à listagem para escolher uma matéria existente.',
      action: createButtonLink(documentObject, {
        label: 'Voltar para Matérias',
        href: '#/materias',
        variant: 'secondary',
      }),
    }),
  );
}

function createMateriaSummary(documentObject, materia, temasCount, assuntosCount, progress) {
  const summary = documentObject.createElement('section');
  const stats = documentObject.createElement('div');
  const progressCard = documentObject.createElement('div');

  summary.className = `materia-summary materia-summary--${materia.corId}`;
  stats.className = 'materia-summary__stats';
  stats.append(
    createSummaryStat(documentObject, temasCount, 'Temas'),
    createSummaryStat(documentObject, assuntosCount, 'Assuntos'),
  );
  progressCard.className = 'materia-summary__progress';

  if (progress === null) {
    const label = documentObject.createElement('p');
    label.textContent = 'Progresso: Sem assuntos';
    progressCard.append(label);
  } else {
    progressCard.append(
      createProgressBar(documentObject, { value: progress, label: 'Progresso geral' }),
    );
  }

  summary.append(stats, progressCard);
  return summary;
}

function createSummaryStat(documentObject, value, label) {
  const item = documentObject.createElement('div');
  const number = documentObject.createElement('strong');
  const text = documentObject.createElement('span');
  number.textContent = String(value);
  text.textContent = label;
  item.append(number, text);
  return item;
}
