import { appendContent, createComponentId } from './component-utils.js';
import { createIconButton } from './icon-button.js';
import { createFocusTrap } from '../overlays/focus-trap.js';
export function createModal(
  documentObject,
  {
    title,
    description = null,
    content = null,
    footer = null,
    closeLabel = 'Fechar modal',
    closeOnBackdrop = true,
    onClose = null,
    overlayManager = null,
  },
) {
  const overlay = documentObject.createElement('div');
  const dialog = documentObject.createElement('section');
  const header = documentObject.createElement('header');
  const heading = documentObject.createElement('div');
  const titleElement = documentObject.createElement('h2');
  const titleId = createComponentId('modal-title');
  const closeButton = createIconButton(documentObject, {
    icon: 'close',
    label: closeLabel,
    variant: 'ghost',
  });
  const body = documentObject.createElement('div');
  const trap = createFocusTrap(documentObject, dialog);
  let isOpen = false;
  let unregister = () => {};
  overlay.className = 'overlay modal-overlay';
  overlay.hidden = true;
  dialog.className = 'modal';
  dialog.tabIndex = -1;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', titleId);
  header.className = 'modal__header';
  heading.className = 'modal__heading';
  titleElement.id = titleId;
  titleElement.textContent = title;
  heading.append(titleElement);
  if (description) {
    const desc = documentObject.createElement('p');
    const id = createComponentId('modal-description');
    desc.id = id;
    desc.textContent = description;
    dialog.setAttribute('aria-describedby', id);
    heading.append(desc);
  }
  header.append(heading, closeButton);
  body.className = 'modal__body';
  appendContent(body, content);
  dialog.append(header, body);
  if (footer) {
    const footerElement = documentObject.createElement('footer');
    footerElement.className = 'modal__footer';
    appendContent(footerElement, footer);
    dialog.append(footerElement);
  }
  overlay.append(dialog);
  function close(reason = 'dismiss') {
    if (!isOpen) return;
    isOpen = false;
    overlay.hidden = true;
    documentObject.body.classList.remove('has-open-overlay');
    trap.deactivate();
    onClose?.(reason);
  }
  function open() {
    if (isOpen) return;
    if (!overlay.isConnected) documentObject.body.append(overlay);
    isOpen = true;
    overlay.hidden = false;
    documentObject.body.classList.add('has-open-overlay');
    trap.activate(closeButton);
  }
  closeButton.addEventListener('click', () => close('close-button'));
  overlay.addEventListener('mousedown', (event) => {
    if (closeOnBackdrop && event.target === overlay) close('backdrop');
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close('escape');
    }
  });
  const controller = Object.freeze({
    element: overlay,
    dialog,
    body,
    open,
    close,
    isOpen: () => isOpen,
    destroy() {
      close('destroy');
      trap.deactivate({ restoreFocus: false });
      unregister();
      overlay.remove();
    },
  });
  unregister = overlayManager?.register(controller) ?? unregister;
  return controller;
}
