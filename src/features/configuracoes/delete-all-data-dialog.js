import { createButton } from '../../ui/components/button.js';
import { createModal } from '../../ui/components/modal.js';

export function createDeleteAllDataDialog(documentObject, { counts, onConfirm, overlayManager }) {
  const content = documentObject.createElement('div');
  const reviewStep = documentObject.createElement('section');
  const finalStep = documentObject.createElement('section');
  const message = documentObject.createElement('p');
  const impact = documentObject.createElement('ul');
  const warning = documentObject.createElement('p');
  const finalHeading = documentObject.createElement('h3');
  const finalMessage = documentObject.createElement('p');
  const finalWarning = documentObject.createElement('p');
  const error = documentObject.createElement('p');
  const footer = documentObject.createElement('div');
  const cancelButton = createButton(documentObject, {
    label: 'Cancelar',
    variant: 'secondary',
  });
  const continueButton = createButton(documentObject, {
    label: 'Continuar para confirmação final',
    icon: 'warning',
    variant: 'danger',
  });
  const confirmButton = createButton(documentObject, {
    label: 'Apagar definitivamente',
    icon: 'trash',
    variant: 'danger',
  });
  const modalHolder = { current: null };

  content.className = 'delete-all-summary';
  reviewStep.className = 'delete-all-summary__step';
  reviewStep.setAttribute('data-confirmation-step', '1');
  message.textContent = 'Esta ação removerá permanentemente toda a organização acadêmica local:';
  impact.className = 'delete-all-summary__impact';
  impact.append(
    createImpactItem(documentObject, counts.materias, 'matéria', 'matérias'),
    createImpactItem(documentObject, counts.temas, 'tema', 'temas'),
    createImpactItem(documentObject, counts.assuntos, 'assunto', 'assuntos'),
  );
  warning.className = 'delete-all-summary__warning';
  warning.textContent =
    'Primeira confirmação de 2. A aparência será preservada, mas os dados acadêmicos não poderão ser recuperados sem um backup.';
  reviewStep.append(message, impact, warning);

  finalStep.className = 'delete-all-summary__step';
  finalStep.setAttribute('data-confirmation-step', '2');
  finalStep.hidden = true;
  finalHeading.textContent = 'Confirmação final';
  finalMessage.textContent =
    'Você está prestes a apagar definitivamente todas as Matérias, Temas e Assuntos armazenados neste navegador.';
  finalWarning.className = 'delete-all-summary__final-warning';
  finalWarning.textContent =
    'Segunda confirmação de 2. Depois de continuar, esta ação não poderá ser desfeita pela aplicação.';
  finalStep.append(finalHeading, finalMessage, finalWarning);

  error.className = 'form-general-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  content.append(reviewStep, finalStep, error);

  confirmButton.hidden = true;
  footer.className = 'overlay-actions';
  footer.append(cancelButton, continueButton, confirmButton);

  const modal = createModal(documentObject, {
    title: 'Apagar todos os dados?',
    description:
      'Revise o impacto e conclua as duas confirmações somente depois de exportar um backup, caso queira preservar as informações.',
    content,
    footer,
    closeOnBackdrop: false,
    overlayManager,
    onClose() {
      globalThis.queueMicrotask(() => modalHolder.current?.destroy());
    },
  });
  modalHolder.current = modal;

  cancelButton.addEventListener('click', () => modal.close('cancel'));
  continueButton.addEventListener('click', () => {
    reviewStep.hidden = true;
    finalStep.hidden = false;
    continueButton.hidden = true;
    confirmButton.hidden = false;
    confirmButton.focus();
  });
  confirmButton.addEventListener('click', async () => {
    setBusy(true);
    error.hidden = true;
    try {
      await onConfirm();
      modal.close('deleted');
    } catch (caughtError) {
      error.textContent = caughtError?.message || 'Não foi possível apagar os dados.';
      error.hidden = false;
    } finally {
      setBusy(false);
    }
  });

  function setBusy(busy) {
    cancelButton.disabled = busy;
    continueButton.disabled = busy;
    confirmButton.disabled = busy;
    confirmButton.setAttribute('aria-busy', String(busy));
  }

  return Object.freeze({ open: modal.open, close: modal.close, element: modal.element });
}

function createImpactItem(documentObject, count, singular, plural) {
  const item = documentObject.createElement('li');
  item.textContent = `${count} ${count === 1 ? singular : plural}`;
  return item;
}
