import { ValidationError } from '../../core/errors.js';
import { PROGRESS_POINTS } from '../../domain/constants.js';
import { createButton } from '../../ui/components/button.js';
import { createComponentId } from '../../ui/components/component-utils.js';
import { createModal } from '../../ui/components/modal.js';
import { createCheckboxField, createNumberField } from './entity-form-fields.js';

export function createAssuntoProgressDialog(
  documentObject,
  { assunto, onSubmit, overlayManager, windowObject = window },
) {
  const form = documentObject.createElement('form');
  const fields = documentObject.createElement('div');
  const generalError = documentObject.createElement('p');
  const currentField = createNumberField(documentObject, {
    name: 'pontosProgresso',
    label: 'Pontos atuais',
    value: assunto.pontosProgresso,
    min: PROGRESS_POINTS.MIN_CURRENT,
    max: PROGRESS_POINTS.MAX_TOTAL,
    description: 'O valor não pode ultrapassar a meta.',
  });
  const totalField = createNumberField(documentObject, {
    name: 'metaPontosProgresso',
    label: 'Meta total',
    value: assunto.metaPontosProgresso,
    min: PROGRESS_POINTS.MIN_TOTAL,
    max: PROGRESS_POINTS.MAX_TOTAL,
    description: 'Representa a quantidade estimada de etapas ou esforço.',
  });
  const reinforcementField = createCheckboxField(documentObject, {
    name: 'precisaReforco',
    label: 'Precisa de reforço',
    checked: assunto.precisaReforco,
    description: 'Essa marcação é independente da porcentagem concluída.',
  });
  const cancelButton = createButton(documentObject, { label: 'Cancelar', variant: 'secondary' });
  const submitButton = createButton(documentObject, {
    label: 'Salvar progresso',
    icon: 'check',
    type: 'submit',
  });
  const footer = documentObject.createElement('div');
  const holder = { current: null };

  form.id = createComponentId('progress-form');
  form.className = 'entity-form progress-adjust-form';
  form.noValidate = true;
  fields.className = 'progress-adjust-form__grid';
  generalError.className = 'form-general-error';
  generalError.hidden = true;
  fields.append(currentField.element, totalField.element);
  form.append(generalError, fields, reinforcementField.element);
  submitButton.setAttribute('form', form.id);
  footer.className = 'overlay-actions';
  footer.append(cancelButton, submitButton);

  const modal = createModal(documentObject, {
    title: 'Ajustar progresso',
    description: `${assunto.nome}: corrija os pontos, a meta e a necessidade de reforço.`,
    content: form,
    footer,
    modalClassName: 'modal--progress-adjust',
    overlayManager,
    onClose: () => globalThis.queueMicrotask(() => holder.current?.destroy()),
  });
  holder.current = modal;

  cancelButton.addEventListener('click', () => modal.close('cancel'));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    const current = Number(currentField.control.value);
    const total = Number(totalField.control.value);

    if (current > total) {
      currentField.setError('Os pontos atuais não podem ultrapassar a meta total.');
      currentField.control.focus();
      return;
    }

    setBusy(true);
    try {
      await onSubmit({
        pontosProgresso: current,
        metaPontosProgresso: total,
        precisaReforco: Boolean(reinforcementField.control.checked),
      });
      modal.close('saved');
    } catch (error) {
      presentError(error);
    } finally {
      setBusy(false);
    }
  });

  function clearErrors() {
    generalError.hidden = true;
    generalError.textContent = '';
    currentField.setError('');
    totalField.setError('');
    reinforcementField.setError('');
  }

  function presentError(error) {
    if (error instanceof ValidationError) {
      for (const issue of error.issues) {
        if (issue.field === 'pontosProgresso') currentField.setError(issue.message);
        if (issue.field === 'metaPontosProgresso') totalField.setError(issue.message);
        if (issue.field === 'precisaReforco') reinforcementField.setError(issue.message);
      }
      return;
    }
    generalError.textContent = error?.message || 'Não foi possível ajustar o progresso.';
    generalError.hidden = false;
  }

  function setBusy(busy) {
    cancelButton.disabled = busy;
    submitButton.disabled = busy;
    submitButton.setAttribute('aria-busy', String(busy));
  }

  function open() {
    modal.open();
    windowObject.requestAnimationFrame(() => currentField.control.focus());
  }

  return Object.freeze({
    open,
    close: modal.close,
    destroy: modal.destroy,
    element: modal.element,
  });
}
