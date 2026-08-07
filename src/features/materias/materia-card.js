import { createActionMenu } from '../../ui/components/action-menu.js';
import { createBadge } from '../../ui/components/badge.js';
import { createButton, createButtonLink } from '../../ui/components/button.js';
import { createIconButton } from '../../ui/components/icon-button.js';
import { readStudyStackProgressAggregate } from '../../integrations/study-stack-progress-aggregate.js';
import { createMateriaIcon } from './materia-icon.js';
import { createStudyProgressIndicator } from './study-progress-indicator.js';

export function createMateriaCard(
  documentObject,
  {
    summary,
    canMoveUp = false,
    canMoveDown = false,
    showReorder = true,
    onEdit,
    onArchive,
    onRestore,
    onDelete,
    onMoveUp,
    onMoveDown,
  },
) {
  const { materia, temasCount, assuntosCount, assuntos = [] } = summary;
  const archived = Boolean(materia.arquivado);
  const studyProgress = readStudyStackProgressAggregate(documentObject, assuntos);
  const article = documentObject.createElement('article');
  const header = documentObject.createElement('header');
  const identity = documentObject.createElement('div');
  const icon = createMateriaIcon(documentObject, { corId: materia.corId });
  const titleGroup = documentObject.createElement('div');
  const title = documentObject.createElement('h2');
  const titleLink = documentObject.createElement('a');
  const description = documentObject.createElement('p');
  const stats = documentObject.createElement('dl');
  const progressArea = documentObject.createElement('div');
  const footer = documentObject.createElement('footer');
  const reorder = documentObject.createElement('div');
  const actions = documentObject.createElement('div');
  const menu = createActionMenu(documentObject, {
    label: `Ações de ${materia.nome}`,
    items: [
      {
        label: archived ? 'Restaurar matéria' : 'Arquivar matéria',
        icon: 'inbox',
        onSelect: archived ? onRestore : onArchive,
      },
      { label: 'Editar matéria', icon: 'edit', onSelect: onEdit },
      { label: 'Excluir matéria', icon: 'trash', danger: true, onSelect: onDelete },
    ],
  });

  article.className = `materia-card materia-card--${materia.corId}${archived ? ' is-archived' : ''}`;
  article.setAttribute('role', 'listitem');
  header.className = 'materia-card__header';
  identity.className = 'materia-card__identity';
  icon.classList.add('materia-card__icon');
  titleGroup.className = 'materia-card__title-group';
  title.className = 'materia-card__title';
  titleLink.href = `#/materias/${encodeURIComponent(materia.id)}`;
  titleLink.textContent = materia.nome;
  title.append(titleLink);
  description.className = 'materia-card__description';
  description.textContent = materia.descricao || 'Sem descrição cadastrada.';
  titleGroup.append(title);
  if (archived) {
    titleGroup.append(createBadge(documentObject, { label: 'Arquivada', tone: 'neutral' }));
  }
  titleGroup.append(description);
  identity.append(icon, titleGroup);
  header.append(identity, menu.element);

  stats.className = 'materia-card__stats';
  stats.append(
    createStat(documentObject, 'Temas', temasCount),
    createStat(documentObject, 'Assuntos', assuntosCount),
  );

  progressArea.className = 'materia-card__progress';
  progressArea.append(
    createStudyProgressIndicator(documentObject, {
      aggregate: studyProgress,
      label: 'Progresso da matéria',
      size: 'small',
      emptyLabel: 'Sem assuntos',
    }),
  );

  footer.className = 'materia-card__footer';
  reorder.className = 'materia-card__reorder';
  reorder.setAttribute('role', 'group');
  reorder.setAttribute('aria-label', `Reordenar ${materia.nome}`);
  if (showReorder) {
    reorder.append(
      createIconButton(documentObject, {
        icon: 'arrow-up',
        label: `Mover ${materia.nome} para cima`,
        size: 'small',
        variant: 'ghost',
        disabled: !canMoveUp,
        onClick: onMoveUp,
      }),
      createIconButton(documentObject, {
        icon: 'arrow-down',
        label: `Mover ${materia.nome} para baixo`,
        size: 'small',
        variant: 'ghost',
        disabled: !canMoveDown,
        onClick: onMoveDown,
      }),
    );
  }
  actions.className = 'materia-card__actions';
  if (archived) {
    actions.append(
      createButton(documentObject, {
        label: 'Restaurar matéria',
        icon: 'inbox',
        variant: 'secondary',
        size: 'small',
        className: 'materia-card__restore',
        onClick: onRestore,
      }),
    );
  }
  actions.append(
    createButtonLink(documentObject, {
      label: 'Abrir matéria',
      href: `#/materias/${encodeURIComponent(materia.id)}`,
      variant: 'secondary',
      size: 'small',
      icon: 'chevron-right',
      iconPosition: 'end',
    }),
  );
  footer.append(reorder, actions);
  article.append(header, stats, progressArea, footer);

  return article;
}

function createStat(documentObject, label, value) {
  const group = documentObject.createElement('div');
  const number = documentObject.createElement('dd');
  const term = documentObject.createElement('dt');
  group.className = 'materia-card__stat';
  number.textContent = String(value);
  term.textContent = label;
  group.append(number, term);
  return group;
}
