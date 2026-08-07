import { createButton } from '../../ui/components/button.js';
import { createModal } from '../../ui/components/modal.js';

export function createTemaDeleteDialog(
  documentObject,
  { tema, assuntosCount, onConfirm, overlayManager },
) {
  const content = documentObject.createElement('div');
  const warning = documentObject.createElement('div');
  const message = documentObject.createElement('p');
  const impactList = documentObject.createElement('ul');
  const impactItem = documentObject.createElement('li');
  const preservation = documentObject.createElement('p');
  const backupHint = documentObject.createElement('p');
  const error = documentObject.createElement('p');
  const cancel = createButton(documentObject, { label: 'Cancelar', variant: 'secondary' });
  const confirm = createButton(documentObject, {
    label: 'Excluir tema',
    variant: 'danger',
    icon: 'trash',
  });
  const footer = documentObject.createElement('div');

  content.className = 'delete-dialog';
  warning.className = 'delete-dialog__warning';
  message.textContent = `O Tema “${tema.nome}” será removido permanentemente.`;
  impactItem.textContent = `${assuntosCount} ${assuntosCount === 1 ? 'Assunto terá' : 'Assuntos terão'} o histórico vinculado apagado do Study Stack.`;
  impactList.append(impactItem);
  preservation.textContent =
    'Essa ação não poderá ser desfeita. Para preservar a estrutura e os históricos, arquive o Tema em vez de excluí-lo.';
  backupHint.textContent =
    'Antes de continuar, considere criar um backup em Configurações caso queira manter uma cópia dos dados atuais.';
  error.className = 'form-general-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  warning.append(message, impactList, preservation, backupHint);
  content.append(warning, error);
  footer.className = 'overlay-actions';
  footer.append(cancel, confirm);

  const modalHolder = { current: null };
  const modal = createModal(documentObject, {
    title: 'Excluir este Tema definitivamente?',
    description:
      assuntosCount > 0
        ? 'Todos os Assuntos relacionados serão removidos e suas exclusões serão enviadas ao Study Stack.'
        : 'Essa ação não pode ser desfeita.',
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
      error.textContent = caughtError?.message || 'Não foi possível excluir o tema.';
      error.hidden = false;
      confirm.disabled = false;
      cancel.disabled = false;
    }
  });

  return Object.freeze({ open: modal.open, close: modal.close, destroy: modal.destroy });
}
