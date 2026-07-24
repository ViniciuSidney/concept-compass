export function clampProgress(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, number));
}

export function createProgressBar(
  documentObject,
  { value = 0, label = 'Progresso', showValue = true, size = 'medium' } = {},
) {
  const wrapper = documentObject.createElement('div');
  const header = documentObject.createElement('div');
  const labelElement = documentObject.createElement('span');
  const valueElement = documentObject.createElement('span');
  const track = documentObject.createElement('div');
  const fill = documentObject.createElement('span');
  const safeValue = clampProgress(value);
  wrapper.className = `progress progress--${size}`;
  header.className = 'progress__header';
  labelElement.className = 'progress__label';
  labelElement.textContent = label;
  valueElement.className = 'progress__value';
  valueElement.textContent = `${Math.round(safeValue)}%`;
  track.className = 'progress__track';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-label', label);
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '100');
  track.setAttribute('aria-valuenow', String(safeValue));
  fill.className = 'progress__fill';
  fill.style.setProperty('--progress-value', `${safeValue}%`);
  header.append(labelElement);
  if (showValue) header.append(valueElement);
  track.append(fill);
  wrapper.append(header, track);
  return wrapper;
}
