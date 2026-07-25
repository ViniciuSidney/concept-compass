import { ValidationError } from '../../core/errors.js';
import { FIELD_LIMITS } from '../../domain/constants.js';
import { createButton } from '../../ui/components/button.js';
import { createComponentId } from '../../ui/components/component-utils.js';
import { createModal } from '../../ui/components/modal.js';
import { createTextAreaField, createTextField } from './entity-form-fields.js';

export function createTemaFormModal(
  documentObject,
  { tema = null, onSubmit, overlayManager, windowObject = window },
) {
  const editing = Boolean(tema);
  const form = documentObject.createElement('form');
  const generalError = documentObject.createElement('div');
  const nameField = createTextField(documentObject, {
    name: 'nome',
    label: 'Nome do tema',
    value: tema?.nome ?? '',
    maxLength: FIELD_LIMITS.tema.nome,
    required: true,
    placeholder: 'Ex.: Álgebra',
  });
  const descriptionField = createTextAreaField(documentObject, {
    name: 'descricao',
    label: 'Descrição',
    value: tema?.descricao ?? '',
    maxLength: FIELD_LIMITS.tema.descricao,
    placeholder: 'Explique brevemente o que será agrupado neste tema.',
  });
  const cancelButton = createButton(documentObject, {
    label: 'Cancelar',
    variant: 'secondary',
  });
  const submitButton = createButton(documentObject, {
    label: editing ? 'Salvar alterações' : 'Criar tema',
    type: 'submit',
    icon: editing ? 'check' : 'plus',
  });
  const footer = documentObject.createElement('div');
  const modalHolder = { current: null };

  form.id = createComponentId('tema-form');
  form.className = 'entity-form tema-form';
  form.noValidate = true;
  generalError.className = 'form-general-error';
  generalError.setAttribute('role', 'alert');
  generalError.hidden = true;
  form.append(generalError, nameField.element, descriptionField.element);
  submitButton.setAttribute('form', form.id);
  footer.className = 'overlay-actions';
  footer.append(cancelButton, submitButton);

  const modal = createModal(documentObject, {
    title: editing ? 'Editar tema' : 'Novo tema',
    description: editing
      ? 'Atualize a organização do tema sem alterar seus assuntos.'
      : 'Crie uma divisão dentro da matéria para agrupar assuntos relacionados.',
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
  }

  function presentError(error) {
    if (error instanceof ValidationError) {
      for (const issue of error.issues) {
        if (issue.field === 'nome') nameField.setError(issue.message);
        else if (issue.field === 'descricao') descriptionField.setError(issue.message);
      }
      form.querySelector?.('[aria-invalid="true"]')?.focus();
      return;
    }

    generalError.textContent = error?.message || 'Não foi possível salvar o tema.';
    generalError.hidden = false;
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
