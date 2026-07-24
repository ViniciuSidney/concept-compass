import { createIcon } from '../icons/icon.js';
export function createFilterChip(
  documentObject,
  { label, selected = false, count = null, onChange = null, removable = false },
) {
  const button = documentObject.createElement('button');
  const text = documentObject.createElement('span');
  button.type = 'button';
  button.className = 'filter-chip';
  button.setAttribute('aria-pressed', String(selected));
  text.textContent = label;
  button.append(text);
  if (count !== null) {
    const countElement = documentObject.createElement('span');
    countElement.className = 'filter-chip__count';
    countElement.textContent = String(count);
    button.append(countElement);
  }
  if (removable) {
    button.append(createIcon(documentObject, 'close', { size: 14 }));
    button.setAttribute('aria-label', `Remover filtro ${label}`);
  }
  function setSelected(nextSelected) {
    selected = Boolean(nextSelected);
    button.setAttribute('aria-pressed', String(selected));
  }
  button.addEventListener('click', () => {
    const nextSelected = removable ? false : !selected;
    setSelected(nextSelected);
    onChange?.(nextSelected);
  });
  return Object.freeze({ element: button, setSelected, isSelected: () => selected });
}
