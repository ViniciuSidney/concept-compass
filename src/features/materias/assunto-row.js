import { createActionMenu } from '../../ui/components/action-menu.js';
import { createBadge } from '../../ui/components/badge.js';
import { createIconButton } from '../../ui/components/icon-button.js';
import {
  formatLocalDate,
  getDifficultyPresentation,
  getStatePresentation,
} from './assunto-presentation.js';

export function createAssuntoRow(
  documentObject,
  {
    assunto,
    index,
    total,
    onOpen,
    onEdit,
    onDelete,
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
  const date = documentObject.createElement('span');
  const actions = documentObject.createElement('div');
  const reorder = documentObject.createElement('div');
  const state = getStatePresentation(assunto.estado);
  const difficulty = getDifficultyPresentation(assunto.dificuldade);
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
  const menu = createActionMenu(documentObject, {
    label: `Ações de ${assunto.nome}`,
    overlayManager,
    items: [
      { label: 'Editar assunto', icon: 'edit', onSelect: onEdit },
      { label: 'Excluir assunto', icon: 'trash', danger: true, onSelect: onDelete },
    ],
  });

  row.className = `assunto-row${highlighted ? ' is-search-target' : ''}`;
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
  meta.append(
    createBadge(documentObject, { label: state.label, tone: state.tone }),
    createBadge(documentObject, { label: difficulty.label, tone: difficulty.tone }),
  );
  date.className = 'assunto-row__date';
  date.textContent = assunto.ultimoEstudoEm
    ? `Último estudo: ${formatLocalDate(assunto.ultimoEstudoEm)}`
    : 'Último estudo não informado';
  content.append(openButton, description, meta, date);
  reorder.className = 'assunto-row__reorder';
  reorder.setAttribute('aria-label', `Reordenar ${assunto.nome}`);
  reorder.append(moveUp, moveDown);
  actions.className = 'assunto-row__actions';
  actions.append(reorder, menu.element);
  row.append(content, actions);

  return row;
}
