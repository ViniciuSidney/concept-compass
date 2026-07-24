import { createIcon } from '../icons/icon.js';
import { createIconButton } from './icon-button.js';
import { createComponentId } from './component-utils.js';
export function createActionMenu(
  documentObject,
  { label = 'Abrir menu de ações', items = [], align = 'end', overlayManager = null } = {},
) {
  const wrapper = documentObject.createElement('div');
  const menuId = createComponentId('action-menu');
  const trigger = createIconButton(documentObject, { icon: 'more', label, variant: 'ghost' });
  const menu = documentObject.createElement('div');
  let isOpen = false;
  let unregister = () => {};
  wrapper.className = 'action-menu';
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-controls', menuId);
  trigger.setAttribute('aria-expanded', 'false');
  menu.id = menuId;
  menu.className = `action-menu__menu action-menu__menu--${align}`;
  menu.setAttribute('role', 'menu');
  menu.hidden = true;
  for (const item of items) {
    const button = documentObject.createElement('button');
    button.type = 'button';
    button.className = `action-menu__item${item.danger ? ' action-menu__item--danger' : ''}`;
    button.setAttribute('role', 'menuitem');
    button.disabled = Boolean(item.disabled);
    if (item.icon) button.append(createIcon(documentObject, item.icon, { size: 17 }));
    const text = documentObject.createElement('span');
    text.textContent = item.label;
    button.append(text);
    button.addEventListener('click', () => {
      close();
      item.onSelect?.();
    });
    menu.append(button);
  }
  wrapper.append(trigger, menu);
  function enabledItems() {
    return [...menu.querySelectorAll('[role="menuitem"]:not([disabled])')];
  }
  function focusItem(index) {
    const items = enabledItems();
    if (items.length) items[(index + items.length) % items.length].focus();
  }
  function handleOutside(event) {
    if (isOpen && !wrapper.contains(event.target)) close({ restoreFocus: false });
  }
  function open() {
    if (isOpen) return;
    isOpen = true;
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    documentObject.addEventListener('pointerdown', handleOutside);
    focusItem(0);
  }
  function close({ restoreFocus = true } = {}) {
    if (!isOpen) return;
    isOpen = false;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    documentObject.removeEventListener('pointerdown', handleOutside);
    if (restoreFocus) trigger.focus();
  }
  trigger.addEventListener('click', () => (isOpen ? close() : open()));
  menu.addEventListener('keydown', (event) => {
    const items = enabledItems();
    const current = items.indexOf(documentObject.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(current + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusItem(items.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  });
  const controller = Object.freeze({
    element: wrapper,
    trigger,
    menu,
    open,
    close,
    isOpen: () => isOpen,
    destroy() {
      close({ restoreFocus: false });
      unregister();
    },
  });
  unregister = overlayManager?.register(controller) ?? unregister;
  return controller;
}
