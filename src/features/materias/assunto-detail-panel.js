import { createBadge } from '../../ui/components/badge.js';
import { createButton } from '../../ui/components/button.js';
import { createSidePanel } from '../../ui/components/side-panel.js';
import {
  formatIsoDate,
  formatLocalDate,
  getDifficultyPresentation,
  getStatePresentation,
} from './assunto-presentation.js';

export function createAssuntoDetailPanel(
  documentObject,
  { assunto, tema, onEdit, onMove, onDelete, overlayManager },
) {
  const content = documentObject.createElement('div');
  const badges = documentObject.createElement('div');
  const state = getStatePresentation(assunto.estado);
  const difficulty = getDifficultyPresentation(assunto.dificuldade);
  const editButton = createButton(documentObject, {
    label: 'Editar assunto',
    icon: 'edit',
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
    createBadge(documentObject, { label: state.label, tone: state.tone }),
    createBadge(documentObject, { label: difficulty.label, tone: difficulty.tone }),
  );
  content.append(
    badges,
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
      ['Último estudo', formatLocalDate(assunto.ultimoEstudoEm)],
      ['Criado em', formatIsoDate(assunto.criadoEm)],
      ['Atualizado em', formatIsoDate(assunto.atualizadoEm)],
    ]),
  );
  footer.className = 'overlay-actions';
  footer.append(deleteButton, moveButton, editButton);

  const panel = createSidePanel(documentObject, {
    title: assunto.nome,
    description: `Detalhes do assunto em ${tema?.nome ?? 'tema não encontrado'}.`,
    content,
    footer,
    overlayManager,
    onClose: () => globalThis.queueMicrotask(() => panelHolder.current?.destroy()),
  });
  panelHolder.current = panel;

  editButton.addEventListener('click', () => {
    panel.close('edit');
    globalThis.queueMicrotask(onEdit);
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
