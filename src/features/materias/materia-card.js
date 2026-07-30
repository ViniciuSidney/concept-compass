import { createActionMenu } from '../../ui/components/action-menu.js';
import { createButtonLink } from '../../ui/components/button.js';
import { createIconButton } from '../../ui/components/icon-button.js';
import { createMateriaIcon } from './materia-icon.js';
import { createProgressBar } from '../../ui/components/progress-bar.js';

export function createMateriaCard(
  documentObject,
  {
    summary,
    canMoveUp = false,
    canMoveDown = false,
    showReorder = true,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown,
  },
) {
  const { materia, temasCount, assuntosCount, progress, progressSummary } = summary;
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
      { label: 'Editar matéria', icon: 'edit', onSelect: onEdit },
      { label: 'Excluir matéria', icon: 'trash', danger: true, onSelect: onDelete },
    ],
  });

  article.className = `materia-card materia-card--${materia.corId}`;
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
  titleGroup.append(title, description);
  identity.append(icon, titleGroup);
  header.append(identity, menu.element);

  stats.className = 'materia-card__stats';
  stats.append(
    createStat(documentObject, 'Temas', temasCount),
    createStat(documentObject, 'Assuntos', assuntosCount),
  );

  progressArea.className = 'materia-card__progress';
  if (progress === null) {
    const emptyProgress = documentObject.createElement('p');
    emptyProgress.className = 'materia-card__no-progress';
    emptyProgress.textContent = 'Sem assuntos';
    progressArea.append(emptyProgress);
  } else {
    progressArea.append(
      createProgressBar(documentObject, {
        value: progress,
        label: `Progresso da matéria · ${progressSummary.points}/${progressSummary.total} pontos`,
        size: 'small',
      }),
    );
  }

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
