export function createLoadingState(
  documentObject,
  { label = 'Carregando…', lines = 3, compact = false } = {},
) {
  const state = documentObject.createElement('section');
  const status = documentObject.createElement('span');
  const skeleton = documentObject.createElement('div');
  state.className = `state-card loading-state${compact ? ' state-card--compact' : ''}`;
  state.setAttribute('role', 'status');
  state.setAttribute('aria-live', 'polite');
  status.className = 'visually-hidden';
  status.textContent = label;
  skeleton.className = 'loading-state__skeleton';
  for (let i = 0; i < lines; i += 1) {
    const line = documentObject.createElement('span');
    line.className = 'loading-state__line';
    line.style.setProperty('--skeleton-width', `${Math.max(42, 92 - i * 17)}%`);
    skeleton.append(line);
  }
  state.append(status, skeleton);
  return state;
}
