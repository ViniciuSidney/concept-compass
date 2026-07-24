import { createIcon } from '../icons/icon.js';
import { createIconButton } from './icon-button.js';
import { createComponentId } from './component-utils.js';
export function createSearchField(
  documentObject,
  {
    label = 'Pesquisar',
    placeholder = 'Pesquisar…',
    value = '',
    name = 'search',
    onInput = null,
    onSubmit = null,
  } = {},
) {
  const form = documentObject.createElement('form');
  const labelElement = documentObject.createElement('label');
  const field = documentObject.createElement('div');
  const input = documentObject.createElement('input');
  const inputId = createComponentId('search');
  const clearButton = createIconButton(documentObject, {
    icon: 'close',
    label: 'Limpar pesquisa',
    size: 'small',
    variant: 'ghost',
  });
  form.className = 'search-field';
  form.setAttribute('role', 'search');
  labelElement.className = 'visually-hidden';
  labelElement.htmlFor = inputId;
  labelElement.textContent = label;
  field.className = 'search-field__control';
  field.append(createIcon(documentObject, 'search', { size: 19 }));
  Object.assign(input, {
    id: inputId,
    name,
    type: 'search',
    placeholder,
    autocomplete: 'off',
    value,
  });
  clearButton.classList.add('search-field__clear');
  field.append(input, clearButton);
  form.append(labelElement, field);
  function updateClearButton() {
    clearButton.hidden = input.value.length === 0;
  }
  input.addEventListener('input', () => {
    updateClearButton();
    onInput?.(input.value);
  });
  clearButton.addEventListener('click', () => {
    input.value = '';
    updateClearButton();
    onInput?.('');
    input.focus();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit?.(input.value);
  });
  updateClearButton();
  return Object.freeze({
    element: form,
    input,
    clear() {
      input.value = '';
      updateClearButton();
    },
    setValue(nextValue) {
      input.value = String(nextValue ?? '');
      updateClearButton();
    },
    getValue: () => input.value,
    focus: () => input.focus(),
  });
}
