import { readStudyStackProgressAggregate } from '../../integrations/study-stack-progress-aggregate.js';
import { createActionMenu } from '../../ui/components/action-menu.js';
import { createBadge } from '../../ui/components/badge.js';
import { createButton } from '../../ui/components/button.js';
import { createComponentId } from '../../ui/components/component-utils.js';
import { createIconButton } from '../../ui/components/icon-button.js';
import { createIcon } from '../../ui/icons/icon.js';
import { createAssuntoRow } from './assunto-row.js';
import { createStudyProgressIndicator } from './study-progress-indicator.js';

export function createTemaAccordion(
  documentObject,
  {
    section,
    expanded,
    highlighted = false,
    focusedAssuntoId = null,
    materiaArchived = false,
    onToggle,
    onAddAssunto,
    onEditTema,
    onDeleteTema,
    onArchiveTema,
    onRestoreTema,
    onMoveTema,
    onMoveTemaUp,
    onMoveTemaDown,
    onOpenAssunto,
    onOpenAssuntoInStudyStack,
    onEditAssunto,
    onDeleteAssunto,
    onArchiveAssunto,
    onRestoreAssunto,
    onMoveAssuntoTo,
    onMoveAssunto,
    onDecreaseAssuntoProgress,
    onIncreaseAssuntoProgress,
    onIncreaseAssuntoProgressTotal,
    onAdjustAssuntoProgress,
    onCompleteAssuntoProgress,
    onResetAssuntoProgress,
    overlayManager,
  },
) {
  const { tema, assuntos, canMoveUp, canMoveDown } = section;
  const archived = Boolean(tema.arquivado);
  const effectivelyArchived = archived || Boolean(materiaArchived);
  const article = documentObject.createElement('article');
  const header = documentObject.createElement('header');
  const toggle = documentObject.createElement('button');
  const toggleIcon = documentObject.createElement('span');
  const identity = documentObject.createElement('span');
  const title = documentObject.createElement('strong');
  const description = documentObject.createElement('span');
  const summary = documentObject.createElement('span');
  const headerProgress = createTemaProgress(documentObject, assuntos);
  const headerActions = documentObject.createElement('div');
  const reorder = documentObject.createElement('div');
  const body = documentObject.createElement('div');
  const bodyId = createComponentId('tema-content');
  const addButton = createButton(documentObject, {
    label: 'Novo assunto',
    icon: 'plus',
    size: 'small',
    disabled: effectivelyArchived,
    onClick: effectivelyArchived ? null : onAddAssunto,
  });
  const moveUp = createIconButton(documentObject, {
    icon: 'arrow-up',
    label: `Mover ${tema.nome} para cima`,
    size: 'small',
    variant: 'ghost',
    disabled: !canMoveUp,
    onClick: onMoveTemaUp,
  });
  const moveDown = createIconButton(documentObject, {
    icon: 'arrow-down',
    label: `Mover ${tema.nome} para baixo`,
    size: 'small',
    variant: 'ghost',
    disabled: !canMoveDown,
    onClick: onMoveTemaDown,
  });
  const menu = createActionMenu(documentObject, {
    label: `Ações do tema ${tema.nome}`,
    overlayManager,
    items: [
      {
        label: archived ? 'Restaurar tema' : 'Arquivar tema',
        icon: 'inbox',
        onSelect: archived ? onRestoreTema : onArchiveTema,
      },
      { label: 'Editar tema', icon: 'edit', onSelect: onEditTema },
      { label: 'Mover tema', icon: 'move', onSelect: onMoveTema },
      { label: 'Excluir tema', icon: 'trash', danger: true, onSelect: onDeleteTema },
    ],
  });

  article.className = `tema-accordion${expanded ? ' is-expanded' : ''}${highlighted ? ' is-search-target' : ''}${archived ? ' is-archived' : ''}`;
  article.setAttribute('role', 'listitem');
  article.setAttribute('data-tema-id', tema.id);
  header.className = 'tema-accordion__header';
  toggle.type = 'button';
  toggle.className = 'tema-accordion__toggle';
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.setAttribute('aria-controls', bodyId);
  let currentExpanded = expanded;
  toggle.addEventListener('click', () => {
    currentExpanded = !currentExpanded;
    article.classList.toggle('is-expanded', currentExpanded);
    toggle.setAttribute('aria-expanded', String(currentExpanded));
    body.hidden = !currentExpanded;
    onToggle(currentExpanded);
  });
  toggleIcon.className = 'tema-accordion__toggle-icon';
  toggleIcon.append(createIcon(documentObject, 'arrow', { size: 18 }));
  identity.className = 'tema-accordion__identity';
  title.className = 'tema-accordion__title';
  title.textContent = tema.nome;
  description.className = 'tema-accordion__description';
  description.textContent = tema.descricao || 'Sem descrição cadastrada.';
  summary.className = 'tema-accordion__summary';
  summary.textContent = `${assuntos.length} ${assuntos.length === 1 ? 'assunto' : 'assuntos'}`;
  identity.append(title, description, summary);
  if (archived) {
    identity.append(createBadge(documentObject, { label: 'Arquivado', tone: 'neutral' }));
  }
  toggle.append(toggleIcon, identity);
  reorder.className = 'tema-accordion__reorder';
  reorder.setAttribute('role', 'group');
  reorder.setAttribute('aria-label', `Reordenar tema ${tema.nome}`);
  reorder.append(moveUp, moveDown);
  headerActions.className = 'tema-accordion__actions';
  if (archived) {
    headerActions.append(
      createButton(documentObject, {
        label: 'Restaurar tema',
        icon: 'inbox',
        variant: 'secondary',
        size: 'small',
        className: 'tema-accordion__restore',
        onClick: onRestoreTema,
      }),
    );
  } else {
    headerActions.append(addButton);
  }
  headerActions.append(reorder, menu.element);
  header.append(toggle, headerProgress, headerActions);

  body.id = bodyId;
  body.className = 'tema-accordion__body';
  body.hidden = !expanded;

  if (assuntos.length === 0) {
    body.append(
      createInlineEmptyState(documentObject, tema.nome, onAddAssunto, effectivelyArchived),
    );
  } else {
    const list = documentObject.createElement('div');
    list.className = 'assuntos-list';
    list.setAttribute('role', 'list');
    assuntos.forEach((assunto, index) => {
      list.append(
        createAssuntoRow(documentObject, {
          assunto,
          index,
          total: assuntos.length,
          onOpen: () => onOpenAssunto(assunto),
          onOpenStudyStack: () => onOpenAssuntoInStudyStack(assunto),
          onEdit: () => onEditAssunto(assunto),
          onDelete: () => onDeleteAssunto(assunto),
          onArchive: () => onArchiveAssunto(assunto),
          onRestore: () => onRestoreAssunto(assunto),
          onMove: () => onMoveAssuntoTo(assunto),
          onMoveUp: () => onMoveAssunto(assunto, index - 1),
          onMoveDown: () => onMoveAssunto(assunto, index + 1),
          onDecreaseProgress: () => onDecreaseAssuntoProgress(assunto),
          onIncreaseProgress: () => onIncreaseAssuntoProgress(assunto),
          onIncreaseProgressTotal: () => onIncreaseAssuntoProgressTotal(assunto),
          onAdjustProgress: () => onAdjustAssuntoProgress(assunto),
          onCompleteProgress: () => onCompleteAssuntoProgress(assunto),
          onResetProgress: () => onResetAssuntoProgress(assunto),
          archiveContext: assunto.arquivado
            ? 'assunto'
            : archived
              ? 'tema'
              : materiaArchived
                ? 'materia'
                : null,
          overlayManager,
          highlighted: focusedAssuntoId === assunto.id,
        }),
      );
    });
    body.append(list);
  }

  article.append(header, body);
  return article;
}

function createTemaProgress(documentObject, assuntos) {
  const area = documentObject.createElement('div');
  const studyProgress = readStudyStackProgressAggregate(documentObject, assuntos);
  area.className = 'tema-accordion__progress tema-accordion__progress--header';
  area.append(
    createStudyProgressIndicator(documentObject, {
      aggregate: studyProgress,
      label: 'Progresso do tema',
      size: 'small',
      emptyLabel: 'Progresso: sem assuntos',
    }),
  );
  return area;
}

function createInlineEmptyState(documentObject, temaNome, onAddAssunto, archived = false) {
  const state = documentObject.createElement('div');
  const text = documentObject.createElement('div');
  const title = documentObject.createElement('strong');
  const description = documentObject.createElement('p');
  const button = createButton(documentObject, {
    label: archived ? 'Conteúdo arquivado' : 'Criar primeiro assunto',
    icon: archived ? 'inbox' : 'plus',
    variant: 'secondary',
    size: 'small',
    disabled: archived,
    onClick: archived ? null : onAddAssunto,
  });

  state.className = 'tema-empty-state';
  title.textContent = `Nenhum assunto em ${temaNome}`;
  description.textContent = archived
    ? 'Restaure este conteúdo para voltar a adicionar Assuntos.'
    : 'Adicione conteúdos específicos para acompanhar pontos e dificuldade.';
  text.append(title, description);
  state.append(text, button);
  return state;
}
