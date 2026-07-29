import { PROGRESS_POINTS } from '../../domain/constants.js';

export function createSegmentedProgress(
  documentObject,
  { current = 0, total = PROGRESS_POINTS.DEFAULT_TOTAL, label = 'Progresso', compact = false } = {},
) {
  const wrapper = documentObject.createElement('div');
  const segments = documentObject.createElement('div');
  const text = documentObject.createElement('span');
  const safeTotal = Math.max(PROGRESS_POINTS.MIN_TOTAL, Number(total) || 1);
  const safeCurrent = Math.min(safeTotal, Math.max(0, Number(current) || 0));
  const visibleTotal = Math.min(safeTotal, PROGRESS_POINTS.MAX_VISIBLE_SEGMENTS);
  const visibleFilled = Math.round((safeCurrent / safeTotal) * visibleTotal);
  const percentage = (safeCurrent / safeTotal) * 100;

  wrapper.className = `segmented-progress${compact ? ' segmented-progress--compact' : ''}`;
  wrapper.setAttribute('role', 'progressbar');
  wrapper.setAttribute('aria-label', label);
  wrapper.setAttribute('aria-valuemin', '0');
  wrapper.setAttribute('aria-valuemax', String(safeTotal));
  wrapper.setAttribute('aria-valuenow', String(safeCurrent));
  wrapper.setAttribute(
    'aria-valuetext',
    `${safeCurrent} de ${safeTotal} pontos, ${Math.round(percentage)}%`,
  );
  segments.className = 'segmented-progress__segments';

  for (let index = 0; index < visibleTotal; index += 1) {
    const segment = documentObject.createElement('span');
    segment.className = `segmented-progress__segment${index < visibleFilled ? ' is-filled' : ''}`;
    segment.setAttribute('aria-hidden', 'true');
    segments.append(segment);
  }

  text.className = 'segmented-progress__text';
  text.textContent = `${safeCurrent}/${safeTotal} · ${Math.round(percentage)}%`;
  wrapper.append(segments, text);
  return wrapper;
}
