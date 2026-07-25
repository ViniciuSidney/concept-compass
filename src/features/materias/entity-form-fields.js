import { createComponentId } from '../../ui/components/component-utils.js';

export function createTextField(
  documentObject,
  { name, label, value = '', maxLength, required = false, placeholder = '' },
) {
  const group = documentObject.createElement('div');
  const labelElement = documentObject.createElement('label');
  const input = documentObject.createElement('input');
  const support = documentObject.createElement('div');
  const error = documentObject.createElement('p');
  const counter = documentObject.createElement('span');
  const id = createComponentId(name);
  const errorId = `${id}-error`;

  group.className = 'form-field';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  input.id = id;
  input.name = name;
  input.type = 'text';
  input.value = value;
  input.maxLength = maxLength;
  input.required = required;
  input.placeholder = placeholder;
  input.setAttribute('aria-describedby', errorId);
  support.className = 'form-field__support';
  error.id = errorId;
  error.className = 'form-field__error';
  error.hidden = true;
  counter.className = 'form-field__counter';

  function updateCounter() {
    counter.textContent = `${input.value.length}/${maxLength}`;
  }

  input.addEventListener('input', updateCounter);
  updateCounter();
  support.append(error, counter);
  group.append(labelElement, input, support);

  return createFieldController(group, input, error);
}

export function createTextAreaField(
  documentObject,
  { name, label, value = '', maxLength, placeholder = '', rows = 4 },
) {
  const group = documentObject.createElement('div');
  const labelElement = documentObject.createElement('label');
  const textarea = documentObject.createElement('textarea');
  const support = documentObject.createElement('div');
  const error = documentObject.createElement('p');
  const counter = documentObject.createElement('span');
  const id = createComponentId(name);
  const errorId = `${id}-error`;

  group.className = 'form-field';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  textarea.id = id;
  textarea.name = name;
  textarea.value = value;
  textarea.maxLength = maxLength;
  textarea.rows = rows;
  textarea.placeholder = placeholder;
  textarea.setAttribute('aria-describedby', errorId);
  support.className = 'form-field__support';
  error.id = errorId;
  error.className = 'form-field__error';
  error.hidden = true;
  counter.className = 'form-field__counter';

  function updateCounter() {
    counter.textContent = `${textarea.value.length}/${maxLength}`;
  }

  textarea.addEventListener('input', updateCounter);
  updateCounter();
  support.append(error, counter);
  group.append(labelElement, textarea, support);

  return createFieldController(group, textarea, error);
}

export function createSelectField(
  documentObject,
  { name, label, value, options, description = '' },
) {
  const group = documentObject.createElement('div');
  const labelElement = documentObject.createElement('label');
  const select = documentObject.createElement('select');
  const error = documentObject.createElement('p');
  const descriptionElement = documentObject.createElement('p');
  const id = createComponentId(name);
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  group.className = 'form-field';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  select.id = id;
  select.name = name;
  select.value = value;
  select.setAttribute('aria-describedby', description ? `${descriptionId} ${errorId}` : errorId);

  for (const optionData of options) {
    const option = documentObject.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    option.selected = optionData.value === value;
    select.append(option);
  }

  descriptionElement.id = descriptionId;
  descriptionElement.className = 'form-field__description';
  descriptionElement.textContent = description;
  descriptionElement.hidden = !description;
  error.id = errorId;
  error.className = 'form-field__error';
  error.hidden = true;
  group.append(labelElement, select, descriptionElement, error);

  return createFieldController(group, select, error);
}

export function createDateField(
  documentObject,
  { name, label, value = '', max = null, description = '' },
) {
  const group = documentObject.createElement('div');
  const labelElement = documentObject.createElement('label');
  const input = documentObject.createElement('input');
  const error = documentObject.createElement('p');
  const descriptionElement = documentObject.createElement('p');
  const id = createComponentId(name);
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  group.className = 'form-field';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  input.id = id;
  input.name = name;
  input.type = 'date';
  input.value = value;
  if (max) input.max = max;
  input.setAttribute('aria-describedby', description ? `${descriptionId} ${errorId}` : errorId);
  descriptionElement.id = descriptionId;
  descriptionElement.className = 'form-field__description';
  descriptionElement.textContent = description;
  descriptionElement.hidden = !description;
  error.id = errorId;
  error.className = 'form-field__error';
  error.hidden = true;
  group.append(labelElement, input, descriptionElement, error);

  return createFieldController(group, input, error);
}

function createFieldController(element, control, error) {
  return Object.freeze({
    element,
    control,
    setError(message) {
      error.textContent = message;
      error.hidden = !message;
      control.setAttribute('aria-invalid', String(Boolean(message)));
    },
  });
}
