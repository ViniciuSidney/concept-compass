import { createActionMenu } from '../../ui/components/action-menu.js';
import { createButton } from '../../ui/components/button.js';
import { createComponentId } from '../../ui/components/component-utils.js';
import { createIconButton } from '../../ui/components/icon-button.js';
import { createProgressBar } from '../../ui/components/progress-bar.js';
import { createIcon } from '../../ui/icons/icon.js';
import { createAssuntoRow } from './assunto-row.js';

export function createTemaAccordion(
  documentObject,
  {
    section,
    expanded,
    highlighted = false,
    focusedAssuntoId = null,
    onToggle,
    onAddAssunto,
    onEditTema,
    onDeleteTema,
    onMoveTema,
    onMoveTemaUp,
    onMoveTemaDown,
    onOpenAssunto,
    onEditAssunto,
    onDeleteAssunto,
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
  const { tema, assuntos, progress, progressSummary, canMoveUp, canMoveDown } = section;
  const article = documentObject.createElement('article');
  const header = documentObject.createElement('header');
  const toggle = documentObject.createElement('button');
  const toggleIcon = documentObject.createElement('span');
  const identity = documentObject.createElement('span');
  const title = documentObject.createElement('strong');
  const description = documentObject.createElement('span');
  const summary = documentObject.createElement('span');
  const headerProgress = createTemaProgress(
    documentObject,
    progress,
    progressSummary,
    assuntos.length,
  );
  const headerActions = documentObject.createElement('div');
  const reorder = documentObject.createElement('div');
  const body = documentObject.createElement('div');
  const bodyId = createComponentId('tema-content');
  const addButton = createButton(documentObject, {
    label: 'Novo assunto',
    icon: 'plus',
    size: 'small',
    onClick: onAddAssunto,
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
      { label: 'Editar tema', icon: 'edit', onSelect: onEditTema },
      { label: 'Mover tema', icon: 'move', onSelect: onMoveTema },
      { label: 'Excluir tema', icon: 'trash', danger: true, onSelect: onDeleteTema },
    ],
  });

  article.className = `tema-accordion${expanded ? ' is-expanded' : ''}${highlighted ? ' is-search-target' : ''}`;
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
  toggle.append(toggleIcon, identity);
  reorder.className = 'tema-accordion__reorder';
  reorder.setAttribute('role', 'group');
  reorder.setAttribute('aria-label', `Reordenar tema ${tema.nome}`);
  reorder.append(moveUp, moveDown);
  headerActions.className = 'tema-accordion__actions';
  headerActions.append(addButton, reorder, menu.element);
  header.append(toggle, headerProgress, headerActions);

  body.id = bodyId;
  body.className = 'tema-accordion__body';
  body.hidden = !expanded;

  if (assuntos.length === 0) {
    body.append(createInlineEmptyState(documentObject, tema.nome, onAddAssunto));
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
          onEdit: () => onEditAssunto(assunto),
          onDelete: () => onDeleteAssunto(assunto),
          onMove: () => onMoveAssuntoTo(assunto),
          onMoveUp: () => onMoveAssunto(assunto, index - 1),
          onMoveDown: () => onMoveAssunto(assunto, index + 1),
          onDecreaseProgress: () => onDecreaseAssuntoProgress(assunto),
          onIncreaseProgress: () => onIncreaseAssuntoProgress(assunto),
          onIncreaseProgressTotal: () => onIncreaseAssuntoProgressTotal(assunto),
          onAdjustProgress: () => onAdjustAssuntoProgress(assunto),
          onCompleteProgress: () => onCompleteAssuntoProgress(assunto),
          onResetProgress: () => onResetAssuntoProgress(assunto),
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

function createTemaProgress(documentObject, progress, progressSummary, assuntosCount) {
  const area = documentObject.createElement('div');
  area.className = 'tema-accordion__progress tema-accordion__progress--header';

  if (progress === null) {
    const text = documentObject.createElement('p');
    text.textContent = assuntosCount === 0 ? 'Progresso: sem assuntos' : 'Progresso indisponível';
    area.append(text);
    return area;
  }

  area.append(
    createProgressBar(documentObject, {
      value: progress,
      label: `Progresso do tema · ${progressSummary.points}/${progressSummary.total} pontos`,
      size: 'small',
    }),
  );
  return area;
}

function createInlineEmptyState(documentObject, temaNome, onAddAssunto) {
  const state = documentObject.createElement('div');
  const text = documentObject.createElement('div');
  const title = documentObject.createElement('strong');
  const description = documentObject.createElement('p');
  const button = createButton(documentObject, {
    label: 'Criar primeiro assunto',
    icon: 'plus',
    variant: 'secondary',
    size: 'small',
    onClick: onAddAssunto,
  });

  state.className = 'tema-empty-state';
  title.textContent = `Nenhum assunto em ${temaNome}`;
  description.textContent = 'Adicione conteúdos específicos para acompanhar pontos e dificuldade.';
  text.append(title, description);
  state.append(text, button);
  return state;
}
