import { createActionMenu } from '../../ui/components/action-menu.js';
import { createBadge } from '../../ui/components/badge.js';
import { createIconButton } from '../../ui/components/icon-button.js';
import { getDifficultyPresentation } from './assunto-presentation.js';
import { createAssuntoStudyStatus, readAssuntoStudyStackState } from './assunto-study-status.js';

export function createAssuntoRow(
  documentObject,
  {
    assunto,
    index,
    total,
    onOpen,
    onOpenStudyStack,
    onEdit,
    onDelete,
    onMove,
    onMoveUp,
    onMoveDown,
    overlayManager,
    highlighted = false,
  },
) {
  const row = documentObject.createElement('article');
  const openButton = documentObject.createElement('button');
  const content = documentObject.createElement('div');
  const title = documentObject.createElement('span');
  const description = documentObject.createElement('p');
  const meta = documentObject.createElement('div');
  const actions = documentObject.createElement('div');
  const reorder = documentObject.createElement('div');
  const difficulty = getDifficultyPresentation(assunto.dificuldade);
  const studyStackState = readAssuntoStudyStackState(documentObject, assunto.id);
  const studyStatus = createAssuntoStudyStatus(documentObject, {
    assunto,
    studyStackState,
    onOpenStudyStack,
  });
  const moveUp = createIconButton(documentObject, {
    icon: 'arrow-up',
    label: `Mover ${assunto.nome} para cima`,
    size: 'small',
    variant: 'ghost',
    disabled: index === 0,
    onClick: onMoveUp,
  });
  const moveDown = createIconButton(documentObject, {
    icon: 'arrow-down',
    label: `Mover ${assunto.nome} para baixo`,
    size: 'small',
    variant: 'ghost',
    disabled: index === total - 1,
    onClick: onMoveDown,
  });
  const menuItems = [];

  if (studyStatus.actionVisible) {
    menuItems.push({
      label: studyStatus.actionLabel,
      icon: 'layers',
      disabled: studyStatus.actionDisabled,
      onSelect: onOpenStudyStack,
    });
  }

  menuItems.push(
    { label: 'Editar assunto', icon: 'edit', onSelect: onEdit },
    { label: 'Mover assunto', icon: 'move', onSelect: onMove },
    { label: 'Excluir assunto', icon: 'trash', danger: true, onSelect: onDelete },
  );

  const menu = createActionMenu(documentObject, {
    label: `Ações de ${assunto.nome}`,
    overlayManager,
    items: menuItems,
  });

  row.className = `assunto-row${highlighted ? ' is-search-target' : ''}`;
  row.setAttribute('role', 'listitem');
  row.setAttribute('data-assunto-id', assunto.id);
  openButton.type = 'button';
  openButton.className = 'assunto-row__open';
  openButton.setAttribute('aria-label', `Abrir detalhes de ${assunto.nome}`);
  openButton.addEventListener('click', onOpen);
  content.className = 'assunto-row__content';
  title.className = 'assunto-row__title';
  title.textContent = assunto.nome;
  openButton.append(title);
  description.className = 'assunto-row__description';
  description.textContent = assunto.descricao || 'Sem descrição cadastrada.';
  meta.className = 'assunto-row__meta';
  meta.append(createBadge(documentObject, { label: difficulty.label, tone: difficulty.tone }));
  content.append(openButton, studyStatus.element, description, meta);
  reorder.className = 'assunto-row__reorder';
  reorder.setAttribute('role', 'group');
  reorder.setAttribute('aria-label', `Reordenar ${assunto.nome}`);
  reorder.append(moveUp, moveDown);
  actions.className = 'assunto-row__actions';
  actions.append(reorder, menu.element);
  row.append(content, actions);

  return row;
}
