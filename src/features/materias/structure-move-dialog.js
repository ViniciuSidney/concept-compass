import { createButton } from '../../ui/components/button.js';
import { createComponentId } from '../../ui/components/component-utils.js';
import { createModal } from '../../ui/components/modal.js';

export function createStructureMoveDialog(
  documentObject,
  {
    title,
    description,
    entityName,
    originLabel,
    destinationLabel,
    destinations,
    initialDestinationId,
    getPositions,
    onConfirm,
    overlayManager,
    windowObject = window,
  },
) {
  const form = documentObject.createElement('form');
  const context = documentObject.createElement('div');
  const contextLabel = documentObject.createElement('span');
  const contextValue = documentObject.createElement('strong');
  const destinationField = createSelectControl(documentObject, {
    name: 'destination',
    label: destinationLabel,
    options: destinations.map((destination) => ({
      value: destination.id,
      label: `${destination.label}${destination.current ? ' — atual' : ''}`,
    })),
    value: initialDestinationId,
  });
  const positionField = createSelectControl(documentObject, {
    name: 'position',
    label: 'Posição no destino',
    options: [],
    value: '',
  });
  const hint = documentObject.createElement('p');
  const error = documentObject.createElement('p');
  const cancelButton = createButton(documentObject, {
    label: 'Cancelar',
    variant: 'secondary',
  });
  const confirmButton = createButton(documentObject, {
    label: 'Mover',
    icon: 'move',
    type: 'submit',
  });
  const footer = documentObject.createElement('div');
  const modalHolder = { current: null };

  form.id = createComponentId('structure-move-form');
  form.className = 'entity-form structure-move-form';
  form.noValidate = true;
  context.className = 'structure-move-form__origin';
  contextValue.className = 'structure-move-form__item';
  contextValue.textContent = entityName;
  contextLabel.className = 'structure-move-form__path';
  contextLabel.textContent = `Origem: ${originLabel}`;
  context.append(contextValue, contextLabel);
  hint.className = 'form-field__description';
  hint.textContent =
    'Escolha a estrutura de destino e a posição. IDs, conteúdo e data de criação serão preservados.';
  error.className = 'form-general-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  form.append(context, destinationField.element, positionField.element, hint, error);
  confirmButton.setAttribute('form', form.id);
  footer.className = 'overlay-actions';
  footer.append(cancelButton, confirmButton);

  const modal = createModal(documentObject, {
    title,
    description,
    content: form,
    footer,
    modalClassName: 'modal--structure-move',
    closeOnBackdrop: false,
    overlayManager,
    onClose: () => globalThis.queueMicrotask(() => modalHolder.current?.destroy()),
  });
  modalHolder.current = modal;

  refreshPositions();
  destinationField.control.addEventListener('change', refreshPositions);
  cancelButton.addEventListener('click', () => modal.close('cancel'));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    setBusy(true);

    try {
      await onConfirm({
        destinationId: destinationField.control.value,
        targetIndex: Number(positionField.control.value),
      });
      modal.close('moved');
    } catch (caughtError) {
      error.textContent = caughtError?.message || 'Não foi possível concluir a movimentação.';
      error.hidden = false;
      setBusy(false);
    }
  });

  function refreshPositions() {
    const positions = getPositions(destinationField.control.value);
    const selected = positions.find(({ current }) => current) ?? positions.at(-1);
    positionField.setOptions(
      positions.map(({ index, label }) => ({ value: String(index), label })),
      String(selected?.index ?? 0),
    );
  }

  function setBusy(busy) {
    destinationField.control.disabled = busy;
    positionField.control.disabled = busy;
    cancelButton.disabled = busy;
    confirmButton.disabled = busy;
    confirmButton.setAttribute('aria-busy', String(busy));
  }

  function open() {
    modal.open();
    windowObject.requestAnimationFrame(() => destinationField.control.focus());
  }

  return Object.freeze({
    open,
    close: modal.close,
    destroy: modal.destroy,
    element: modal.element,
  });
}

function createSelectControl(documentObject, { name, label, options, value }) {
  const field = documentObject.createElement('div');
  const labelElement = documentObject.createElement('label');
  const select = documentObject.createElement('select');
  const id = createComponentId(name);

  field.className = 'form-field';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  select.id = id;
  select.name = name;
  field.append(labelElement, select);

  function setOptions(nextOptions, nextValue) {
    select.replaceChildren();
    for (const optionData of nextOptions) {
      const option = documentObject.createElement('option');
      option.value = optionData.value;
      option.textContent = optionData.label;
      option.selected = optionData.value === nextValue;
      select.append(option);
    }
    select.value = nextValue;
  }

  setOptions(options, value);
  return Object.freeze({ element: field, control: select, setOptions });
}
