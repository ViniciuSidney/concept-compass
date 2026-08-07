import {
  selectAssuntoById,
  selectAssuntosByMateria,
  selectMateriaById,
  selectTemaById,
  selectTemasByMateria,
} from '../../domain/selectors/hierarchy-selectors.js';
import { createStudyStackUrl } from '../../integrations/study-stack-link.js';
import { readStudyStackProgressAggregate } from '../../integrations/study-stack-progress-aggregate.js';
import { createActionMenu } from '../../ui/components/action-menu.js';
import { createButton, createButtonLink } from '../../ui/components/button.js';
import { createPageHeader } from '../../ui/components/page-header.js';
import { createEmptyState } from '../../ui/states/empty-state.js';
import { createErrorState } from '../../ui/states/error-state.js';
import { createAssuntoDeleteDialog } from './assunto-delete-dialog.js';
import { createAssuntoDetailPanel } from './assunto-detail-panel.js';
import { createAssuntoFormModal } from './assunto-form.js';
import { createAssuntoProgressDialog } from './assunto-progress-dialog.js';
import { createAssuntoProgressResetDialog } from './assunto-progress-reset-dialog.js';
import { createMateriaDeleteDialog } from './materia-delete-dialog.js';
import { createMateriaFormModal } from './materia-form.js';
import { createMateriaWorkspaceController } from './materia-workspace-controller.js';
import {
  selectAssuntoDetails,
  selectTemaDeleteImpact,
  selectTemaSections,
} from './materia-workspace-selectors.js';
import { createTemaAccordion } from './tema-accordion.js';
import { createTemaDeleteDialog } from './tema-delete-dialog.js';
import { createTemaFormModal } from './tema-form.js';
import { selectMateriaImpact } from './materias-selectors.js';
import { createStructureMoveDialog } from './structure-move-dialog.js';
import { createStudyProgressIndicator } from './study-progress-indicator.js';
import {
  describeAssuntoOrigin,
  describeTemaOrigin,
  selectAssuntoMoveDestinations,
  selectAssuntoMovePositions,
  selectTemaMoveDestinations,
  selectTemaMovePositions,
} from './structure-move-selectors.js';

export function createMateriaPage(documentObject, route, context) {
  const { store, repository, appShell, overlayManager, windowObject, navigate } = context;
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
  const deepLink = resolveDeepLink(initialData, materiaId, route.query ?? {});
  const expandedTemaIds = new Set(initialTemas.slice(0, 1).map(({ id }) => id));
  if (deepLink.temaId) expandedTemaIds.add(deepLink.temaId);
  let deepLinkHandled = false;

  function render() {
    const data = controller.getData();
    const materia = selectMateriaById(data, materiaId);

    if (!materia) {
      renderNotFound(documentObject, page);
      return;
    }

    const temas = selectTemasByMateria(data, materia.id);
    const assuntos = selectAssuntosByMateria(data, materia.id);
    const materiaArchived = Boolean(materia.arquivado);
    const materiaMenu = createActionMenu(documentObject, {
      label: `Ações da matéria ${materia.nome}`,
      overlayManager,
      items: [
        {
          label: materiaArchived ? 'Restaurar matéria' : 'Arquivar matéria',
          icon: 'inbox',
          onSelect: () =>
            materiaArchived ? restoreMateriaItem(materia) : archiveMateriaItem(materia),
        },
        { label: 'Editar matéria', icon: 'edit', onSelect: () => openEditMateria(materia) },
        {
          label: 'Excluir matéria',
          icon: 'trash',
          danger: true,
          onSelect: () => openDeleteMateria(materia),
        },
      ],
    });
    const actions = [
      createButtonLink(documentObject, {
        label: 'Voltar para Matérias',
        href: '#/materias',
        variant: 'secondary',
        icon: 'arrow-left',
      }),
      materiaArchived
        ? createButton(documentObject, {
            label: 'Restaurar matéria',
            icon: 'inbox',
            variant: 'secondary',
            onClick: () => restoreMateriaItem(materia),
          })
        : createButton(documentObject, {
            label: 'Novo tema',
            icon: 'plus',
            onClick: openCreateTema,
          }),
      materiaMenu.element,
    ];
    const header = createPageHeader(documentObject, {
      breadcrumb: [{ label: 'Matérias', href: '#/materias' }, { label: materia.nome }],
      eyebrow: 'Matéria',
      title: materia.nome,
      description: materia.descricao || 'Sem descrição cadastrada.',
      actions,
    });
    const summary = createMateriaSummary(documentObject, materia, temas.length, assuntos);
    const workspace = documentObject.createElement('section');
    const workspaceHeader = documentObject.createElement('div');
    const workspaceHeading = documentObject.createElement('div');
    const workspaceTitle = documentObject.createElement('h2');
    const workspaceDescription = documentObject.createElement('p');

    page.classList.toggle('is-archived', materiaArchived);
    workspace.className = 'materia-workspace';
    workspaceHeader.className = 'materia-workspace__header';
    workspaceHeading.className = 'materia-workspace__heading';
    workspaceTitle.textContent = 'Temas da matéria';
    workspaceDescription.textContent = materiaArchived
      ? 'Esta Matéria está arquivada. Restaure-a para voltar a adicionar conteúdos e acessar o Study Stack.'
      : 'Expanda um tema para organizar seus assuntos e acompanhar o progresso.';
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
            label: materiaArchived ? 'Restaurar matéria' : 'Criar primeiro tema',
            icon: materiaArchived ? 'inbox' : 'plus',
            variant: materiaArchived ? 'secondary' : 'primary',
            onClick: materiaArchived ? () => restoreMateriaItem(materia) : openCreateTema,
          }),
        }),
      );
    } else {
      const list = documentObject.createElement('div');
      const sections = selectTemaSections(data, materia.id);
      list.className = 'temas-list';
      list.setAttribute('role', 'list');

      for (const section of sections) {
        const { tema } = section;
        list.append(
          createTemaAccordion(documentObject, {
            section,
            expanded: expandedTemaIds.has(tema.id),
            highlighted: deepLink.temaId === tema.id,
            focusedAssuntoId: deepLink.assuntoId,
            materiaArchived,
            onToggle(isExpanded) {
              if (isExpanded) expandedTemaIds.add(tema.id);
              else expandedTemaIds.delete(tema.id);
            },
            onAddAssunto: () => openCreateAssunto(tema),
            onEditTema: () => openEditTema(tema),
            onDeleteTema: () => openDeleteTema(tema),
            onArchiveTema: () => archiveTemaItem(tema),
            onRestoreTema: () => restoreTemaItem(tema),
            onMoveTema: () => openMoveTema(tema),
            onMoveTemaUp: () => moveTema(tema, tema.ordem - 1),
            onMoveTemaDown: () => moveTema(tema, tema.ordem + 1),
            onOpenAssunto: (assunto) => openAssuntoDetails(assunto.id),
            onOpenAssuntoInStudyStack: (assunto) => openAssuntoInStudyStack(assunto.id),
            onEditAssunto: (assunto) => openEditAssunto(assunto),
            onDeleteAssunto: (assunto) => openDeleteAssunto(assunto),
            onArchiveAssunto: (assunto) => archiveAssuntoItem(assunto),
            onRestoreAssunto: (assunto) => restoreAssuntoItem(assunto),
            onMoveAssuntoTo: (assunto) => openMoveAssunto(assunto),
            onMoveAssunto: (assunto, targetIndex) => moveAssunto(assunto, targetIndex),
            onDecreaseAssuntoProgress: (assunto) => changeProgress(assunto, -1),
            onIncreaseAssuntoProgress: (assunto) => changeProgress(assunto, 1),
            onIncreaseAssuntoProgressTotal: (assunto) => increaseProgressTotal(assunto),
            onAdjustAssuntoProgress: (assunto) => openAdjustProgress(assunto),
            onCompleteAssuntoProgress: (assunto) => completeProgress(assunto),
            onResetAssuntoProgress: (assunto) => resetProgress(assunto),
            overlayManager,
          }),
        );
      }

      workspace.append(list);
    }

    page.replaceChildren(header, summary, workspace);

    if (!deepLinkHandled) {
      deepLinkHandled = true;
      if (deepLink.assuntoId) {
        globalThis.queueMicrotask(() => openAssuntoDetails(deepLink.assuntoId));
      }
    }
  }

  function openEditMateria(materia) {
    const current = selectMateriaById(controller.getData(), materia.id);
    if (!current) return;

    const form = createMateriaFormModal(documentObject, {
      materia: current,
      overlayManager,
      windowObject,
      async onSubmit(input) {
        const updated = controller.editMateria(current.id, input);
        render();
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

  function archiveMateriaItem(materia) {
    const current = selectMateriaById(controller.getData(), materia.id);
    if (!current || current.arquivado) return;

    try {
      const updated = controller.archiveMateria(current.id);
      render();
      appShell.showToast({
        tone: 'success',
        title: 'Matéria arquivada',
        message: `${updated.nome} foi arquivada. Sua estrutura e o histórico de estudo permanecem preservados.`,
      });
      appShell.announce(`Matéria ${updated.nome} arquivada.`);
    } catch (error) {
      showOperationError('Não foi possível arquivar a matéria', error);
    }
  }

  function restoreMateriaItem(materia) {
    const current = selectMateriaById(controller.getData(), materia.id);
    if (!current || !current.arquivado) return;

    try {
      const updated = controller.restoreMateria(current.id);
      render();
      appShell.showToast({
        tone: 'success',
        title: 'Matéria restaurada',
        message: `${updated.nome} voltou ao fluxo ativo de estudos.`,
      });
      appShell.announce(`Matéria ${updated.nome} restaurada.`);
    } catch (error) {
      showOperationError('Não foi possível restaurar a matéria', error);
    }
  }

  function openDeleteMateria(materia) {
    const current = selectMateriaById(controller.getData(), materia.id);
    if (!current) return;
    const impact = selectMateriaImpact(controller.getData(), current.id);

    const dialog = createMateriaDeleteDialog(documentObject, {
      materia: current,
      impact,
      overlayManager,
      async onConfirm() {
        const removed = controller.removeMateria(current.id);
        appShell.showToast({
          tone: 'success',
          title: 'Matéria excluída',
          message: `${current.nome}, ${removed.temas} temas e ${removed.assuntos} assuntos foram removidos.`,
        });
        appShell.announce(`Matéria ${current.nome} excluída com sucesso.`);
        navigate('/materias');
      },
    });
    dialog.open();
  }

  function openCreateTema() {
    const currentMateria = selectMateriaById(controller.getData(), materiaId);
    if (!currentMateria || currentMateria.arquivado) return;

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

  function archiveTemaItem(tema) {
    const current = selectTemaById(controller.getData(), tema.id);
    if (!current || current.arquivado) return;

    try {
      const updated = controller.archiveTema(current.id);
      expandedTemaIds.add(updated.id);
      render();
      appShell.showToast({
        tone: 'success',
        title: 'Tema arquivado',
        message: `${updated.nome} foi arquivado. Os Assuntos e o histórico continuam preservados.`,
      });
      appShell.announce(`Tema ${updated.nome} arquivado.`);
    } catch (error) {
      showOperationError('Não foi possível arquivar o tema', error);
    }
  }

  function restoreTemaItem(tema) {
    const current = selectTemaById(controller.getData(), tema.id);
    if (!current || !current.arquivado) return;

    try {
      const updated = controller.restoreTema(current.id);
      expandedTemaIds.add(updated.id);
      render();
      appShell.showToast({
        tone: 'success',
        title: 'Tema restaurado',
        message: `${updated.nome} voltou ao fluxo ativo de estudos.`,
      });
      appShell.announce(`Tema ${updated.nome} restaurado.`);
    } catch (error) {
      showOperationError('Não foi possível restaurar o tema', error);
    }
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

  function openMoveTema(tema) {
    const data = controller.getData();
    const current = selectTemaById(data, tema.id);
    if (!current) return;

    const dialog = createStructureMoveDialog(documentObject, {
      title: 'Mover tema',
      description: 'Transfira o tema inteiro, incluindo todos os assuntos relacionados.',
      entityName: current.nome,
      originLabel: describeTemaOrigin(data, current.id),
      destinationLabel: 'Matéria de destino',
      destinations: selectTemaMoveDestinations(data, current.id),
      initialDestinationId: current.materiaId,
      getPositions: (destinationId) =>
        selectTemaMovePositions(controller.getData(), current.id, destinationId),
      overlayManager,
      windowObject,
      async onConfirm({ destinationId, targetIndex }) {
        if (destinationId === current.materiaId && targetIndex === current.ordem) {
          appShell.showToast({
            tone: 'info',
            title: 'Nenhuma alteração necessária',
            message: `${current.nome} já está nessa posição.`,
          });
          return;
        }

        const moved = controller.moveTemaTo(current.id, destinationId, { targetIndex });
        const destination = selectMateriaById(controller.getData(), destinationId);
        expandedTemaIds.delete(current.id);
        if (destinationId === materiaId) expandedTemaIds.add(current.id);
        render();
        appShell.showToast({
          tone: 'success',
          title: 'Tema movido',
          message: `${moved.nome} agora está em ${destination?.nome ?? 'outra matéria'}.`,
        });
        appShell.announce(`Tema ${moved.nome} movido com sucesso.`);
      },
    });
    dialog.open();
  }

  function openCreateAssunto(tema) {
    const data = controller.getData();
    const current = selectTemaById(data, tema.id);
    const parentMateria = current ? selectMateriaById(data, current.materiaId) : null;
    if (!current || current.arquivado || parentMateria?.arquivado) return;

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

  function archiveAssuntoItem(assunto) {
    const current = selectAssuntoById(controller.getData(), assunto.id);
    if (!current || current.arquivado) return;

    try {
      const updated = controller.archiveAssunto(current.id);
      expandedTemaIds.add(updated.temaId);
      render();
      appShell.showToast({
        tone: 'success',
        title: 'Assunto arquivado',
        message: `${updated.nome} foi arquivado. O histórico do Study Stack permanece preservado.`,
      });
      appShell.announce(`Assunto ${updated.nome} arquivado.`);
    } catch (error) {
      showOperationError('Não foi possível arquivar o assunto', error);
    }
  }

  function restoreAssuntoItem(assunto) {
    const current = selectAssuntoById(controller.getData(), assunto.id);
    if (!current || !current.arquivado) return;

    try {
      const updated = controller.restoreAssunto(current.id);
      expandedTemaIds.add(updated.temaId);
      render();
      appShell.showToast({
        tone: 'success',
        title: 'Assunto restaurado',
        message: `${updated.nome} voltou a permitir acesso ao Study Stack.`,
      });
      appShell.announce(`Assunto ${updated.nome} restaurado.`);
    } catch (error) {
      showOperationError('Não foi possível restaurar o assunto', error);
    }
  }

  function openAdjustProgress(assunto) {
    const current = selectAssuntoById(controller.getData(), assunto.id);
    if (!current) return;

    const dialog = createAssuntoProgressDialog(documentObject, {
      assunto: current,
      overlayManager,
      windowObject,
      async onSubmit(input) {
        applyProgressUpdate(current, () => controller.adjustAssuntoProgress(current.id, input));
      },
    });
    dialog.open();
  }

  function changeProgress(assunto, delta) {
    const current = selectAssuntoById(controller.getData(), assunto.id);
    if (!current) return;
    applyProgressUpdate(current, () => controller.changeProgress(current.id, delta));
  }

  function increaseProgressTotal(assunto) {
    const current = selectAssuntoById(controller.getData(), assunto.id);
    if (!current) return;
    applyProgressUpdate(current, () => controller.increaseProgressTotal(current.id));
  }

  function completeProgress(assunto) {
    const current = selectAssuntoById(controller.getData(), assunto.id);
    if (!current) return;
    applyProgressUpdate(current, () => controller.completeProgress(current.id));
  }

  function resetProgress(assunto) {
    const current = selectAssuntoById(controller.getData(), assunto.id);
    if (!current || current.pontosProgresso === 0) return;

    const dialog = createAssuntoProgressResetDialog(documentObject, {
      assunto: current,
      overlayManager,
      async onConfirm() {
        applyProgressUpdate(current, () => controller.resetProgress(current.id));
      },
    });
    dialog.open();
  }

  function applyProgressUpdate(current, operation) {
    const previous = {
      pontosProgresso: current.pontosProgresso,
      metaPontosProgresso: current.metaPontosProgresso,
      precisaReforco: current.precisaReforco,
    };

    try {
      const updated = operation();
      expandedTemaIds.add(updated.temaId);
      render();
      const percentage = Math.round((updated.pontosProgresso / updated.metaPontosProgresso) * 100);
      appShell.showToast({
        tone: 'success',
        title: 'Progresso atualizado',
        message: `${updated.nome}: ${updated.pontosProgresso}/${updated.metaPontosProgresso} pontos · ${percentage}%.`,
        actionLabel: 'Desfazer',
        onAction() {
          try {
            controller.adjustAssuntoProgress(updated.id, previous);
            expandedTemaIds.add(updated.temaId);
            render();
            appShell.announce(`Alteração de progresso de ${updated.nome} desfeita.`);
          } catch (error) {
            showOperationError('Não foi possível desfazer a alteração', error);
          }
        },
      });
      appShell.announce(
        `Progresso de ${updated.nome} atualizado para ${updated.pontosProgresso} de ${updated.metaPontosProgresso} pontos.`,
      );
    } catch (error) {
      showOperationError('Não foi possível atualizar o progresso', error);
    }
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

  function openMoveAssunto(assunto) {
    const data = controller.getData();
    const current = selectAssuntoById(data, assunto.id);
    if (!current) return;

    const dialog = createStructureMoveDialog(documentObject, {
      title: 'Mover assunto',
      description: 'Transfira o assunto para outro tema ou altere sua posição no tema atual.',
      entityName: current.nome,
      originLabel: describeAssuntoOrigin(data, current.id),
      destinationLabel: 'Tema de destino',
      destinations: selectAssuntoMoveDestinations(data, current.id),
      initialDestinationId: current.temaId,
      getPositions: (destinationId) =>
        selectAssuntoMovePositions(controller.getData(), current.id, destinationId),
      overlayManager,
      windowObject,
      async onConfirm({ destinationId, targetIndex }) {
        if (destinationId === current.temaId && targetIndex === current.ordem) {
          appShell.showToast({
            tone: 'info',
            title: 'Nenhuma alteração necessária',
            message: `${current.nome} já está nessa posição.`,
          });
          return;
        }

        const moved = controller.moveAssuntoTo(current.id, destinationId, { targetIndex });
        const destinationTema = selectTemaById(controller.getData(), destinationId);
        const destinationMateria = destinationTema
          ? selectMateriaById(controller.getData(), destinationTema.materiaId)
          : null;
        const sourceTema = selectTemaById(controller.getData(), current.temaId);
        if (sourceTema?.materiaId === materiaId) expandedTemaIds.add(current.temaId);
        if (destinationTema?.materiaId === materiaId) expandedTemaIds.add(destinationId);
        render();
        appShell.showToast({
          tone: 'success',
          title: 'Assunto movido',
          message: `${moved.nome} agora está em ${destinationMateria?.nome ?? 'outra matéria'} › ${destinationTema?.nome ?? 'outro tema'}.`,
        });
        appShell.announce(`Assunto ${moved.nome} movido com sucesso.`);
      },
    });
    dialog.open();
  }

  function openAssuntoInStudyStack(assuntoId) {
    const data = controller.getData();
    const details = selectAssuntoDetails(data, assuntoId);
    const currentMateria = selectMateriaById(data, materiaId);
    if (!details || !currentMateria) return;

    const archiveContext = details.assunto.arquivado
      ? 'Assunto'
      : details.tema?.arquivado
        ? 'Tema'
        : currentMateria.arquivado
          ? 'Matéria'
          : null;

    if (archiveContext) {
      appShell.showToast({
        tone: 'info',
        title: `${archiveContext} arquivado`,
        message: `Restaure ${archiveContext === 'Matéria' ? 'a' : 'o'} ${archiveContext} antes de abrir o Study Stack.`,
      });
      return;
    }

    const destination = createStudyStackUrl({
      materia: currentMateria,
      tema: details.tema,
      assunto: details.assunto,
      location: windowObject.location,
    });

    if (typeof windowObject.location?.assign === 'function') {
      windowObject.location.assign(destination);
    } else if (windowObject.location) {
      windowObject.location.href = destination;
    }
  }

  function openAssuntoDetails(assuntoId) {
    const details = selectAssuntoDetails(controller.getData(), assuntoId);
    const currentMateria = selectMateriaById(controller.getData(), materiaId);
    if (!details || !currentMateria) return;

    const studyStackUrl = createStudyStackUrl({
      materia: currentMateria,
      tema: details.tema,
      assunto: details.assunto,
      location: windowObject.location,
    });
    const panel = createAssuntoDetailPanel(documentObject, {
      assunto: details.assunto,
      tema: details.tema,
      materia: currentMateria,
      studyStackUrl,
      overlayManager,
      onEdit: () => openEditAssunto(details.assunto),
      onMove: () => openMoveAssunto(details.assunto),
      onDelete: () => openDeleteAssunto(details.assunto),
      onArchive: () => archiveAssuntoItem(details.assunto),
      onRestore: () => restoreAssuntoItem(details.assunto),
      onDecreaseProgress: () => changeProgress(details.assunto, -1),
      onIncreaseProgress: () => changeProgress(details.assunto, 1),
      onIncreaseProgressTotal: () => increaseProgressTotal(details.assunto),
      onAdjustProgress: () => openAdjustProgress(details.assunto),
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

function createMateriaSummary(documentObject, materia, temasCount, assuntos) {
  const summary = documentObject.createElement('section');
  const stats = documentObject.createElement('div');
  const progressCard = documentObject.createElement('div');
  const studyProgress = readStudyStackProgressAggregate(documentObject, assuntos);

  summary.className = `materia-summary materia-summary--${materia.corId}`;
  stats.className = 'materia-summary__stats';
  stats.append(
    createSummaryStat(documentObject, temasCount, 'Temas'),
    createSummaryStat(documentObject, assuntos.length, 'Assuntos'),
  );
  progressCard.className = 'materia-summary__progress';
  progressCard.append(
    createStudyProgressIndicator(documentObject, {
      aggregate: studyProgress,
      label: 'Progresso geral',
      emptyLabel: 'Progresso: sem assuntos',
    }),
  );

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

function resolveDeepLink(data, materiaId, query) {
  const requestedAssunto = query.assunto ? selectAssuntoById(data, query.assunto) : null;
  const assuntoTema = requestedAssunto ? selectTemaById(data, requestedAssunto.temaId) : null;

  if (requestedAssunto && assuntoTema?.materiaId === materiaId) {
    return Object.freeze({ temaId: assuntoTema.id, assuntoId: requestedAssunto.id });
  }

  const requestedTema = query.tema ? selectTemaById(data, query.tema) : null;
  if (requestedTema?.materiaId === materiaId) {
    return Object.freeze({ temaId: requestedTema.id, assuntoId: null });
  }

  return Object.freeze({ temaId: null, assuntoId: null });
}
