import { createButton } from '../../ui/components/button.js';
import { createModal } from '../../ui/components/modal.js';

export function createAssuntoDeleteDialog(documentObject, { assunto, onConfirm, overlayManager }) {
  const content = documentObject.createElement('div');
  const warning = documentObject.createElement('div');
  const message = documentObject.createElement('p');
  const preservation = documentObject.createElement('p');
  const backupHint = documentObject.createElement('p');
  const error = documentObject.createElement('p');
  const cancel = createButton(documentObject, { label: 'Cancelar', variant: 'secondary' });
  const confirm = createButton(documentObject, {
    label: 'Excluir assunto',
    variant: 'danger',
    icon: 'trash',
  });
  const footer = documentObject.createElement('div');

  content.className = 'delete-dialog';
  warning.className = 'delete-dialog__warning';
  message.textContent = `O Assunto “${assunto.nome}” e todo o histórico de estudo associado no Study Stack serão apagados permanentemente.`;
  preservation.textContent =
    'Essa ação não poderá ser desfeita. Para preservar os dados e o histórico, arquive o Assunto em vez de excluí-lo.';
  backupHint.textContent =
    'Antes de continuar, considere criar um backup em Configurações caso queira manter uma cópia dos dados atuais.';
  error.className = 'form-general-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  warning.append(message, preservation, backupHint);
  content.append(warning, error);
  footer.className = 'overlay-actions';
  footer.append(cancel, confirm);

  const modalHolder = { current: null };
  const modal = createModal(documentObject, {
    title: 'Excluir este Assunto definitivamente?',
    description:
      'A exclusão também será enviada ao Study Stack pelo identificador interno do Assunto.',
    content,
    footer,
    closeOnBackdrop: false,
    overlayManager,
    onClose: () => globalThis.queueMicrotask(() => modalHolder.current?.destroy()),
  });
  modalHolder.current = modal;

  cancel.addEventListener('click', () => modal.close('cancel'));
  confirm.addEventListener('click', async () => {
    error.hidden = true;
    confirm.disabled = true;
    cancel.disabled = true;

    try {
      await onConfirm();
      modal.close('deleted');
    } catch (caughtError) {
      error.textContent = caughtError?.message || 'Não foi possível excluir o assunto.';
      error.hidden = false;
      confirm.disabled = false;
      cancel.disabled = false;
    }
  });

  return Object.freeze({ open: modal.open, close: modal.close, destroy: modal.destroy });
}
