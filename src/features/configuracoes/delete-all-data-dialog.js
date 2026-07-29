import { createButton } from '../../ui/components/button.js';
import { createModal } from '../../ui/components/modal.js';

export function createDeleteAllDataDialog(documentObject, { counts, onConfirm, overlayManager }) {
  const content = documentObject.createElement('div');
  const message = documentObject.createElement('p');
  const impact = documentObject.createElement('ul');
  const warning = documentObject.createElement('p');
  const error = documentObject.createElement('p');
  const footer = documentObject.createElement('div');
  const cancelButton = createButton(documentObject, {
    label: 'Cancelar',
    variant: 'secondary',
  });
  const confirmButton = createButton(documentObject, {
    label: 'Apagar todos os dados',
    icon: 'trash',
    variant: 'danger',
  });
  const modalHolder = { current: null };

  content.className = 'delete-all-summary';
  message.textContent = 'Esta ação removerá permanentemente toda a organização acadêmica local:';
  impact.className = 'delete-all-summary__impact';
  impact.append(
    createImpactItem(documentObject, counts.materias, 'matéria', 'matérias'),
    createImpactItem(documentObject, counts.temas, 'tema', 'temas'),
    createImpactItem(documentObject, counts.assuntos, 'assunto', 'assuntos'),
  );
  warning.className = 'delete-all-summary__warning';
  warning.textContent = 'A aparência será preservada. Esta ação não pode ser desfeita.';
  error.className = 'form-general-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  content.append(message, impact, warning, error);

  footer.className = 'overlay-actions';
  footer.append(cancelButton, confirmButton);

  const modal = createModal(documentObject, {
    title: 'Apagar todos os dados?',
    description:
      'Confirme somente depois de exportar um backup, caso queira preservar as informações.',
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
