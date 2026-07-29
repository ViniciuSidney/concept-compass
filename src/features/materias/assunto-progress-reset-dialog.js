import { createButton } from '../../ui/components/button.js';
import { createModal } from '../../ui/components/modal.js';

export function createAssuntoProgressResetDialog(
  documentObject,
  { assunto, onConfirm, overlayManager },
) {
  const content = documentObject.createElement('div');
  const warning = documentObject.createElement('div');
  const message = documentObject.createElement('p');
  const details = documentObject.createElement('p');
  const error = documentObject.createElement('p');
  const cancel = createButton(documentObject, { label: 'Cancelar', variant: 'secondary' });
  const confirm = createButton(documentObject, {
    label: 'Reiniciar progresso',
    variant: 'danger',
    icon: 'warning',
  });
  const footer = documentObject.createElement('div');

  content.className = 'delete-dialog';
  warning.className = 'delete-dialog__warning';
  message.textContent = `O progresso de “${assunto.nome}” voltará de ${assunto.pontosProgresso}/${assunto.metaPontosProgresso} para 0/${assunto.metaPontosProgresso}.`;
  details.textContent = 'A meta total e a marcação de reforço serão preservadas.';
  error.className = 'form-general-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  warning.append(message, details);
  content.append(warning, error);
  footer.className = 'overlay-actions';
  footer.append(cancel, confirm);

  const holder = { current: null };
  const modal = createModal(documentObject, {
    title: 'Reiniciar progresso?',
    description: 'Essa alteração poderá ser desfeita pela mensagem exibida após a confirmação.',
    content,
    footer,
    closeOnBackdrop: false,
    overlayManager,
    onClose: () => globalThis.queueMicrotask(() => holder.current?.destroy()),
  });
  holder.current = modal;

  cancel.addEventListener('click', () => modal.close('cancel'));
  confirm.addEventListener('click', async () => {
    error.hidden = true;
    confirm.disabled = true;
    cancel.disabled = true;

    try {
      await onConfirm();
      modal.close('reset');
    } catch (caughtError) {
      error.textContent = caughtError?.message || 'Não foi possível reiniciar o progresso.';
      error.hidden = false;
      confirm.disabled = false;
      cancel.disabled = false;
    }
  });

  return Object.freeze({
    open: modal.open,
    close: modal.close,
    destroy: modal.destroy,
    element: modal.element,
  });
}
