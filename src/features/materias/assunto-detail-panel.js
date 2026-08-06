import { createBadge } from '../../ui/components/badge.js';
import { createButton, createButtonLink } from '../../ui/components/button.js';
import { createSidePanel } from '../../ui/components/side-panel.js';
import { createAssuntoProgressControl } from './assunto-progress-control.js';
import {
  formatIsoDate,
  formatLocalDate,
  getDifficultyPresentation,
  getProgressPresentation,
} from './assunto-presentation.js';

export function createAssuntoDetailPanel(
  documentObject,
  {
    assunto,
    tema,
    studyStackUrl,
    onEdit,
    onMove,
    onDelete,
    onDecreaseProgress,
    onIncreaseProgress,
    onIncreaseProgressTotal,
    onAdjustProgress,
    overlayManager,
  },
) {
  const content = documentObject.createElement('div');
  const badges = documentObject.createElement('div');
  const progress = getProgressPresentation(assunto);
  const difficulty = getDifficultyPresentation(assunto.dificuldade);
  const editButton = createButton(documentObject, {
    label: 'Editar assunto',
    icon: 'edit',
    variant: 'secondary',
  });
  const adjustButton = createButton(documentObject, {
    label: 'Ajustar progresso',
    icon: 'settings',
    variant: 'secondary',
  });
  const moveButton = createButton(documentObject, {
    label: 'Mover assunto',
    icon: 'move',
    variant: 'secondary',
  });
  const deleteButton = createButton(documentObject, {
    label: 'Excluir assunto',
    icon: 'trash',
    variant: 'danger',
  });
  const footer = documentObject.createElement('div');
  const panelHolder = { current: null };

  content.className = 'assunto-detail';
  badges.className = 'assunto-detail__badges';
  badges.append(
    createBadge(documentObject, { label: progress.label, tone: progress.tone }),
    createBadge(documentObject, { label: difficulty.label, tone: difficulty.tone }),
  );
  if (assunto.precisaReforco) {
    badges.append(
      createBadge(documentObject, { label: 'Precisa de reforço', tone: 'reinforcement' }),
    );
  }
  content.append(
    badges,
    createStudyStackCallout(documentObject, studyStackUrl),
    createAssuntoProgressControl(documentObject, {
      assunto,
      onDecrease: () => runProgressAction('decrease-progress', onDecreaseProgress),
      onIncrease: () => runProgressAction('increase-progress', onIncreaseProgress),
      onIncreaseTotal: () => runProgressAction('increase-total', onIncreaseProgressTotal),
      onAdjust: () => runProgressAction('adjust-progress', onAdjustProgress),
    }),
    createDetailSection(
      documentObject,
      'Descrição',
      assunto.descricao || 'Nenhuma descrição cadastrada.',
    ),
    createDetailSection(
      documentObject,
      'Observações',
      assunto.observacoes || 'Nenhuma observação cadastrada.',
    ),
    createDetailGrid(documentObject, [
      ['Tema', tema?.nome ?? 'Tema não encontrado'],
      ['Pontos de progresso', `${assunto.pontosProgresso} de ${assunto.metaPontosProgresso}`],
      ['Progresso percentual', `${Math.round(progress.percentage)}%`],
      ['Último estudo', formatLocalDate(assunto.ultimoEstudoEm)],
      ['Criado em', formatIsoDate(assunto.criadoEm)],
      ['Atualizado em', formatIsoDate(assunto.atualizadoEm)],
    ]),
  );
  footer.className = 'overlay-actions';
  footer.append(deleteButton, moveButton, adjustButton, editButton);

  const panel = createSidePanel(documentObject, {
    title: assunto.nome,
    description: `Detalhes do assunto em ${tema?.nome ?? 'tema não encontrado'}.`,
    content,
    footer,
    overlayManager,
    onClose: () => globalThis.queueMicrotask(() => panelHolder.current?.destroy()),
  });
  panelHolder.current = panel;

  function runProgressAction(reason, action) {
    panel.close(reason);
    globalThis.queueMicrotask(action);
  }

  editButton.addEventListener('click', () => {
    panel.close('edit');
    globalThis.queueMicrotask(onEdit);
  });
  adjustButton.addEventListener('click', () => {
    panel.close('adjust-progress');
    globalThis.queueMicrotask(onAdjustProgress);
  });
  moveButton.addEventListener('click', () => {
    panel.close('move');
    globalThis.queueMicrotask(onMove);
  });
  deleteButton.addEventListener('click', () => {
    panel.close('delete');
    globalThis.queueMicrotask(onDelete);
  });

  return Object.freeze({ open: panel.open, close: panel.close, destroy: panel.destroy });
}

function createDetailSection(documentObject, title, text) {
  const section = documentObject.createElement('section');
  const heading = documentObject.createElement('h3');
  const paragraph = documentObject.createElement('p');
  section.className = 'assunto-detail__section';
  heading.textContent = title;
  paragraph.textContent = text;
  section.append(heading, paragraph);
  return section;
}

function createDetailGrid(documentObject, items) {
  const list = documentObject.createElement('dl');
  list.className = 'assunto-detail__grid';
  for (const [label, value] of items) {
    const item = documentObject.createElement('div');
    const term = documentObject.createElement('dt');
    const description = documentObject.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    item.append(term, description);
    list.append(item);
  }
  return list;
}

function createStudyStackCallout(documentObject, href) {
  const section = documentObject.createElement('section');
  const heading = documentObject.createElement('strong');
  const description = documentObject.createElement('p');
  const link = createButtonLink(documentObject, {
    label: 'Abrir no Study Stack',
    href,
    icon: 'layers',
    className: 'assunto-detail__study-stack-button',
  });

  section.className = 'assunto-detail__study-stack';
  heading.textContent = 'Continue o estudo no seu caderno conectado';
  description.textContent =
    'Leve esta Matéria, Tema e Assunto para registrar a base teórica, práticas e evidências de aprendizagem.';
  section.append(heading, description, link);
  return section;
}
