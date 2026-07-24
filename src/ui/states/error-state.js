import { appendContent } from '../components/component-utils.js';
import { createIcon } from '../icons/icon.js';
export function createErrorState(
  documentObject,
  { title = 'Algo deu errado', message, action = null, compact = false },
) {
  const state = documentObject.createElement('section');
  const iconBox = documentObject.createElement('span');
  const h2 = documentObject.createElement('h2');
  const p = documentObject.createElement('p');
  state.className = `state-card error-state${compact ? ' state-card--compact' : ''}`;
  state.setAttribute('role', 'alert');
  iconBox.className = 'state-card__icon';
  iconBox.append(createIcon(documentObject, 'warning', { size: 26 }));
  h2.textContent = title;
  p.textContent = message;
  state.append(iconBox, h2, p);
  if (action) {
    const area = documentObject.createElement('div');
    area.className = 'state-card__action';
    appendContent(area, action);
    state.append(area);
  }
  return state;
}
