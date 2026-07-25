import { ValidationError } from '../../core/errors.js';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  DIFFICULTY_VALUES,
  FIELD_LIMITS,
  STUDY_STATES,
  STUDY_STATE_LABELS,
  STUDY_STATE_VALUES,
} from '../../domain/constants.js';
import { createLocalDate } from '../../utils/date.js';
import { createButton } from '../../ui/components/button.js';
import { createComponentId } from '../../ui/components/component-utils.js';
import { createModal } from '../../ui/components/modal.js';
import {
  createDateField,
  createSelectField,
  createTextAreaField,
  createTextField,
} from './entity-form-fields.js';

export function createAssuntoFormModal(
  documentObject,
  { assunto = null, onSubmit, overlayManager, windowObject = window },
) {
  const editing = Boolean(assunto);
  const today = createLocalDate();
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
  const stateField = createSelectField(documentObject, {
    name: 'estado',
    label: 'Estado de estudo',
    value: assunto?.estado ?? STUDY_STATES.NAO_INICIADO,
    options: STUDY_STATE_VALUES.map((value) => ({
      value,
      label: STUDY_STATE_LABELS[value],
    })),
    description: 'O estado participa do cálculo de progresso do tema e da matéria.',
  });
  const difficultyField = createSelectField(documentObject, {
    name: 'dificuldade',
    label: 'Dificuldade',
    value: assunto?.dificuldade ?? DIFFICULTIES.NAO_DEFINIDA,
    options: DIFFICULTY_VALUES.map((value) => ({
      value,
      label: DIFFICULTY_LABELS[value],
    })),
  });
  const observationsField = createTextAreaField(documentObject, {
    name: 'observacoes',
    label: 'Observações',
    value: assunto?.observacoes ?? '',
    maxLength: FIELD_LIMITS.assunto.observacoes,
    placeholder: 'Dúvidas, cuidados, materiais ou próximos passos.',
    rows: 4,
  });
  const lastStudyField = createDateField(documentObject, {
    name: 'ultimoEstudoEm',
    label: 'Último estudo',
    value: assunto?.ultimoEstudoEm ?? '',
    max: today,
    description: 'Opcional. Datas futuras não são aceitas.',
  });
  const fields = Object.freeze({
    nome: nameField,
    descricao: descriptionField,
    estado: stateField,
    dificuldade: difficultyField,
    observacoes: observationsField,
    ultimoEstudoEm: lastStudyField,
  });
  const grid = documentObject.createElement('div');
  const cancelButton = createButton(documentObject, {
    label: 'Cancelar',
    variant: 'secondary',
  });
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
  grid.className = 'assunto-form__grid';
  grid.append(stateField.element, difficultyField.element);
  form.append(
    generalError,
    nameField.element,
    descriptionField.element,
    grid,
    observationsField.element,
    lastStudyField.element,
  );
  submitButton.setAttribute('form', form.id);
  footer.className = 'overlay-actions';
  footer.append(cancelButton, submitButton);

  const modal = createModal(documentObject, {
    title: editing ? 'Editar assunto' : 'Novo assunto',
    description: editing
      ? 'Atualize o conteúdo e o acompanhamento do estudo.'
      : 'Cadastre a unidade mais específica da organização.',
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
        estado: stateField.control.value,
        dificuldade: difficultyField.control.value,
        observacoes: observationsField.control.value,
        ultimoEstudoEm: lastStudyField.control.value || null,
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
