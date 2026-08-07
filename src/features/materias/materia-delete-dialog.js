import { createButton } from '../../ui/components/button.js';
import { createModal } from '../../ui/components/modal.js';

export function createMateriaDeleteDialog(
  documentObject,
  { materia, impact, onConfirm, overlayManager },
) {
  const content = documentObject.createElement('div');
  const warning = documentObject.createElement('div');
  const message = documentObject.createElement('p');
  const impactList = documentObject.createElement('ul');
  const preservation = documentObject.createElement('p');
  const backupHint = documentObject.createElement('p');
  const error = documentObject.createElement('p');
  const cancel = createButton(documentObject, { label: 'Cancelar', variant: 'secondary' });
  const confirm = createButton(documentObject, {
    label: 'Excluir matéria',
    variant: 'danger',
    icon: 'trash',
  });
  const footer = documentObject.createElement('div');

  content.className = 'delete-dialog';
  warning.className = 'delete-dialog__warning';
  message.textContent = `A Matéria “${materia.nome}” será removida permanentemente.`;
  impactList.append(
    createImpactItem(documentObject, impact.temas, 'tema', 'temas'),
    createImpactItem(
      documentObject,
      impact.assuntos,
      'Assunto com histórico no Study Stack',
      'Assuntos com históricos no Study Stack',
    ),
  );
  preservation.textContent =
    'Essa ação não poderá ser desfeita. Para preservar a estrutura e os históricos, arquive a Matéria em vez de excluí-la.';
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
    title: 'Excluir esta Matéria definitivamente?',
    description:
      'Toda a estrutura relacionada será removida e cada Assunto será excluído do Study Stack pelo identificador interno correspondente.',
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
      error.textContent = caughtError?.message || 'Não foi possível excluir a matéria.';
      error.hidden = false;
      confirm.disabled = false;
      cancel.disabled = false;
    }
  });

  return Object.freeze({ open: modal.open, close: modal.close, destroy: modal.destroy });
}

function createImpactItem(documentObject, value, singular, plural) {
  const item = documentObject.createElement('li');
  item.textContent = `${value} ${value === 1 ? singular : plural}`;
  return item;
}
