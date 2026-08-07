import { createProgressBar } from '../../ui/components/progress-bar.js';

const STATE_LABELS = Object.freeze({
  pending: 'Sincronização pendente',
  update_required: 'Atualização necessária',
});

export function createStudyProgressIndicator(
  documentObject,
  { aggregate, label, size = 'medium', emptyLabel = 'Progresso: sem assuntos' },
) {
  if (!aggregate || aggregate.status === 'empty') {
    return createStateText(documentObject, emptyLabel, 'empty');
  }

  if (aggregate.status === 'pending' || aggregate.status === 'update_required') {
    return createStateText(documentObject, STATE_LABELS[aggregate.status], aggregate.status);
  }

  return createProgressBar(documentObject, {
    value: aggregate.percentage ?? 0,
    label: `${label} · ${aggregate.points}/${aggregate.total}`,
    size,
  });
}

function createStateText(documentObject, text, state) {
  const paragraph = documentObject.createElement('p');
  paragraph.className = `study-progress-state study-progress-state--${state}`;
  paragraph.textContent = text;
  return paragraph;
}
