import { appendContent, createComponentId } from './component-utils.js';
import { createIconButton } from './icon-button.js';
import { createFocusTrap } from '../overlays/focus-trap.js';
export function createSidePanel(
  documentObject,
  {
    title,
    description = null,
    content = null,
    footer = null,
    onClose = null,
    overlayManager = null,
  },
) {
  const overlay = documentObject.createElement('div');
  const panel = documentObject.createElement('aside');
  const header = documentObject.createElement('header');
  const heading = documentObject.createElement('div');
  const titleElement = documentObject.createElement('h2');
  const titleId = createComponentId('panel-title');
  const closeButton = createIconButton(documentObject, {
    icon: 'close',
    label: 'Fechar painel',
    variant: 'ghost',
  });
  const body = documentObject.createElement('div');
  const trap = createFocusTrap(documentObject, panel);
  let isOpen = false;
  let unregister = () => {};
  overlay.className = 'overlay side-panel-overlay';
  overlay.hidden = true;
  panel.className = 'side-panel';
  panel.tabIndex = -1;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', titleId);
  header.className = 'side-panel__header';
  heading.className = 'side-panel__heading';
  titleElement.id = titleId;
  titleElement.textContent = title;
  heading.append(titleElement);
  if (description) {
    const desc = documentObject.createElement('p');
    desc.textContent = description;
    heading.append(desc);
  }
  header.append(heading, closeButton);
  body.className = 'side-panel__body';
  appendContent(body, content);
  panel.append(header, body);
  if (footer) {
    const footerElement = documentObject.createElement('footer');
    footerElement.className = 'side-panel__footer';
    appendContent(footerElement, footer);
    panel.append(footerElement);
  }
  overlay.append(panel);
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
    if (event.target === overlay) close('backdrop');
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close('escape');
    }
  });
  const controller = Object.freeze({
    element: overlay,
    panel,
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
