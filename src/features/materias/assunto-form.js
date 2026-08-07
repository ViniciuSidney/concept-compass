import { ValidationError } from '../../core/errors.js';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  DIFFICULTY_VALUES,
  FIELD_LIMITS,
  PROGRESS_POINTS,
} from '../../domain/constants.js';
import { createButton } from '../../ui/components/button.js';
import { createComponentId } from '../../ui/components/component-utils.js';
import { createModal } from '../../ui/components/modal.js';
import { createSelectField, createTextAreaField, createTextField } from './entity-form-fields.js';

export function createAssuntoFormModal(
  documentObject,
  { assunto = null, onSubmit, overlayManager, windowObject = window },
) {
  const editing = Boolean(assunto);
  const form = documentObject.createElement('form');
  const generalError = documentObject.createElement('div');
  const nameField = createTextField(documentObject, {
    name: 'nome',
    label: 'Nome do assunto',
    value: assunto?.nome ?? '',
    maxLength: FIELD_LIMITS.assunto.nome,
    required: true,
    placeholder: 'Ex.: Equação do primeiro grau',
  });
  const descriptionField = createTextAreaField(documentObject, {
    name: 'descricao',
    label: 'Descrição',
    value: assunto?.descricao ?? '',
    maxLength: FIELD_LIMITS.assunto.descricao,
    placeholder: 'Registre o foco ou os limites deste assunto.',
    rows: 3,
  });
  const observationsField = createTextAreaField(documentObject, {
    name: 'observacoes',
    label: 'Observações',
    value: assunto?.observacoes ?? '',
    maxLength: FIELD_LIMITS.assunto.observacoes,
    placeholder: 'Dúvidas, cuidados, materiais ou próximos passos.',
    rows: 3,
  });
  const difficultyField = createSelectField(documentObject, {
    name: 'dificuldade',
    label: 'Dificuldade',
    value: assunto?.dificuldade ?? DIFFICULTIES.NAO_DEFINIDA,
    options: DIFFICULTY_VALUES.map((value) => ({ value, label: DIFFICULTY_LABELS[value] })),
  });
  const fields = Object.freeze({
    nome: nameField,
    descricao: descriptionField,
    dificuldade: difficultyField,
    observacoes: observationsField,
  });
  const contentGrid = documentObject.createElement('div');
  const trackingGrid = documentObject.createElement('div');
  const studyNote = documentObject.createElement('p');
  const cancelButton = createButton(documentObject, { label: 'Cancelar', variant: 'secondary' });
  const submitButton = createButton(documentObject, {
    label: editing ? 'Salvar alterações' : 'Criar assunto',
    type: 'submit',
    icon: editing ? 'check' : 'plus',
  });
  const footer = documentObject.createElement('div');
  const modalHolder = { current: null };

  form.id = createComponentId('assunto-form');
  form.className = 'entity-form assunto-form';
  form.noValidate = true;
  generalError.className = 'form-general-error';
  generalError.setAttribute('role', 'alert');
  generalError.hidden = true;
  contentGrid.className = 'assunto-form__grid assunto-form__content-grid';
  trackingGrid.className = 'assunto-form__tracking-grid assunto-form__tracking-grid--points';
  studyNote.className = 'assunto-form__study-note';
  studyNote.textContent =
    'Progresso, etapas e evidências são registrados automaticamente pelo Study Stack.';
  contentGrid.append(descriptionField.element, observationsField.element);
  trackingGrid.append(difficultyField.element);
  form.append(generalError, nameField.element, contentGrid, trackingGrid, studyNote);
  submitButton.setAttribute('form', form.id);
  footer.className = 'overlay-actions';
  footer.append(cancelButton, submitButton);

  const modal = createModal(documentObject, {
    title: editing ? 'Editar assunto' : 'Novo assunto',
    description: editing
      ? 'Atualize o conteúdo e a organização deste Assunto.'
      : 'Cadastre a unidade mais específica da organização.',
    content: form,
    footer,
    modalClassName: 'modal--assunto-form',
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
        dificuldade: difficultyField.control.value,
        observacoes: observationsField.control.value,
        // Compatibilidade temporária: os campos legados permanecem preservados
        // no registro, mas não podem mais ser editados pela interface.
        pontosProgresso: assunto?.pontosProgresso ?? PROGRESS_POINTS.MIN_CURRENT,
        metaPontosProgresso: assunto?.metaPontosProgresso ?? PROGRESS_POINTS.DEFAULT_TOTAL,
        precisaReforco: assunto?.precisaReforco ?? false,
        ultimoEstudoEm: assunto?.ultimoEstudoEm ?? null,
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
    for (const field of Object.values(fields)) field.setError('');
  }

  function presentError(error) {
    if (error instanceof ValidationError) {
      for (const issue of error.issues) fields[issue.field]?.setError(issue.message);
      form.querySelector?.('[aria-invalid="true"]')?.focus();
      return;
    }
    generalError.textContent = error?.message || 'Não foi possível salvar o assunto.';
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
