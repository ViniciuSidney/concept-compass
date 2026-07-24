import { ValidationError } from '../../core/errors.js';
import { FIELD_LIMITS, MATERIA_COLORS } from '../../domain/constants.js';
import { createButton } from '../../ui/components/button.js';
import { createModal } from '../../ui/components/modal.js';
import { createIcon } from '../../ui/icons/icon.js';
import { createComponentId } from '../../ui/components/component-utils.js';

const COLOR_LABELS = Object.freeze({
  azul: 'Azul',
  verde: 'Verde',
  amarelo: 'Amarelo',
  vermelho: 'Vermelho',
  roxo: 'Roxo',
  laranja: 'Laranja',
  cinza: 'Cinza',
});

export function createMateriaFormModal(
  documentObject,
  { materia = null, onSubmit, overlayManager, windowObject = window },
) {
  const editing = Boolean(materia);
  const form = documentObject.createElement('form');
  const generalError = documentObject.createElement('div');
  const nameField = createTextField(documentObject, {
    name: 'nome',
    label: 'Nome da matéria',
    value: materia?.nome ?? '',
    maxLength: FIELD_LIMITS.materia.nome,
    required: true,
    placeholder: 'Ex.: Matemática',
  });
  const descriptionField = createTextAreaField(documentObject, {
    name: 'descricao',
    label: 'Descrição',
    value: materia?.descricao ?? '',
    maxLength: FIELD_LIMITS.materia.descricao,
    placeholder: 'Uma descrição curta para identificar o foco da matéria.',
  });
  const colorField = createColorField(documentObject, materia?.corId ?? 'roxo');
  const cancelButton = createButton(documentObject, {
    label: 'Cancelar',
    variant: 'secondary',
  });
  const submitButton = createButton(documentObject, {
    label: editing ? 'Salvar alterações' : 'Criar matéria',
    type: 'submit',
    icon: editing ? 'check' : 'plus',
  });
  const footer = documentObject.createElement('div');

  form.className = 'entity-form materia-form';
  form.noValidate = true;
  generalError.className = 'form-general-error';
  generalError.setAttribute('role', 'alert');
  generalError.hidden = true;
  form.append(generalError, nameField.element, descriptionField.element, colorField.element);
  footer.className = 'overlay-actions';
  footer.append(cancelButton, submitButton);

  const modalHolder = { current: null };
  const modal = createModal(documentObject, {
    title: editing ? 'Editar matéria' : 'Nova matéria',
    description: editing
      ? 'Atualize a identificação da matéria. Temas e assuntos relacionados serão preservados.'
      : 'Cadastre a primeira camada da sua organização de estudos.',
    content: form,
    footer,
    overlayManager,
    onClose: () => {
      clearErrors();
      globalThis.queueMicrotask(() => modalHolder.current?.destroy());
    },
  });

  modalHolder.current = modal;

  cancelButton.addEventListener('click', () => modal.close('cancel'));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    setBusy(true);

    try {
      await onSubmit({
        nome: nameField.control.value,
        descricao: descriptionField.control.value,
        corId: colorField.getValue(),
      });
      modal.close('saved');
    } catch (error) {
      presentError(error);
    } finally {
      setBusy(false);
    }
  });

  function setBusy(busy) {
    submitButton.disabled = busy;
    cancelButton.disabled = busy;
    submitButton.setAttribute('aria-busy', String(busy));
  }

  function clearErrors() {
    generalError.hidden = true;
    generalError.textContent = '';
    nameField.setError('');
    descriptionField.setError('');
    colorField.setError('');
  }

  function presentError(error) {
    if (error instanceof ValidationError) {
      for (const issue of error.issues) {
        if (issue.field === 'nome') nameField.setError(issue.message);
        else if (issue.field === 'descricao') descriptionField.setError(issue.message);
        else if (issue.field === 'corId') colorField.setError(issue.message);
      }
      const firstInvalid = form.querySelector?.('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    generalError.textContent = error?.message || 'Não foi possível salvar a matéria.';
    generalError.hidden = false;
    generalError.focus?.();
  }

  function open() {
    modal.open();
    windowObject.requestAnimationFrame(() => nameField.control.focus());
  }

  return Object.freeze({
    open,
    close: modal.close,
    destroy: modal.destroy,
    element: modal.element,
  });
}

function createTextField(
  documentObject,
  { name, label, value, maxLength, required = false, placeholder = '' },
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

function createTextAreaField(documentObject, { name, label, value, maxLength, placeholder = '' }) {
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
  textarea.rows = 4;
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

function createColorField(documentObject, selectedColor) {
  const fieldset = documentObject.createElement('fieldset');
  const legend = documentObject.createElement('legend');
  const options = documentObject.createElement('div');
  const error = documentObject.createElement('p');
  const errorId = createComponentId('color-error');
  const inputs = [];

  fieldset.className = 'form-field color-picker';
  legend.textContent = 'Cor de identificação';
  options.className = 'color-picker__options';
  error.id = errorId;
  error.className = 'form-field__error';
  error.hidden = true;

  for (const color of MATERIA_COLORS) {
    const label = documentObject.createElement('label');
    const input = documentObject.createElement('input');
    const swatch = documentObject.createElement('span');
    const text = documentObject.createElement('span');

    label.className = `color-picker__option color-picker__option--${color}`;
    input.type = 'radio';
    input.name = 'corId';
    input.value = color;
    input.checked = color === selectedColor;
    input.setAttribute('aria-describedby', errorId);
    swatch.className = 'color-picker__swatch';
    swatch.append(createIcon(documentObject, 'check', { size: 15 }));
    text.textContent = COLOR_LABELS[color];
    label.append(input, swatch, text);
    options.append(label);
    inputs.push(input);
  }

  fieldset.append(legend, options, error);

  return Object.freeze({
    element: fieldset,
    getValue: () => inputs.find(({ checked }) => checked)?.value ?? '',
    setError(message) {
      error.textContent = message;
      error.hidden = !message;
      for (const input of inputs) input.setAttribute('aria-invalid', String(Boolean(message)));
    },
  });
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
