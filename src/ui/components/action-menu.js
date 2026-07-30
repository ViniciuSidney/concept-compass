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
  menu.setAttribute('aria-label', label);
  menu.setAttribute('aria-orientation', 'vertical');
  menu.tabIndex = -1;
  menu.hidden = true;

  for (const item of items) {
    const button = documentObject.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    button.className = `action-menu__item${item.danger ? ' action-menu__item--danger' : ''}`;
    button.setAttribute('role', 'menuitem');
    button.disabled = Boolean(item.disabled);
    if (button.disabled) button.setAttribute('aria-disabled', 'true');
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
    if (typeof menu.querySelectorAll !== 'function') return [];
    return [...menu.querySelectorAll('[role="menuitem"]:not([disabled])')];
  }

  function focusItem(index) {
    const menuItems = enabledItems();
    if (menuItems.length === 0) {
      menu.focus();
      return;
    }
    menuItems[(index + menuItems.length) % menuItems.length].focus();
  }

  function handleOutside(event) {
    if (isOpen && !wrapper.contains(event.target)) close({ restoreFocus: false });
  }

  function keepMenuInsideViewport() {
    const windowObject = documentObject.defaultView;
    const rect = menu.getBoundingClientRect?.();
    const viewportHeight =
      windowObject?.innerHeight ?? documentObject.documentElement?.clientHeight ?? 0;

    if (!rect || !viewportHeight || typeof windowObject?.scrollBy !== 'function') return;

    const margin = 16;
    const bottomOverflow = rect.bottom - (viewportHeight - margin);
    const topOverflow = rect.top - margin;
    const offset = bottomOverflow > 0 ? bottomOverflow : topOverflow < 0 ? topOverflow : 0;

    if (!offset) return;

    const reducedMotion = windowObject.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    windowObject.scrollBy({
      top: offset,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }

  function open({ focus = 'first' } = {}) {
    if (isOpen) return;
    isOpen = true;
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    documentObject.addEventListener('pointerdown', handleOutside);
    focusItem(focus === 'last' ? -1 : 0);
    const schedule =
      documentObject.defaultView?.requestAnimationFrame ?? globalThis.requestAnimationFrame;
    if (typeof schedule === 'function') schedule(keepMenuInsideViewport);
    else keepMenuInsideViewport();
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
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) open({ focus: event.key === 'ArrowUp' ? 'last' : 'first' });
      else focusItem(event.key === 'ArrowUp' ? -1 : 0);
    }
  });

  menu.addEventListener('keydown', (event) => {
    const menuItems = enabledItems();
    const current = menuItems.indexOf(documentObject.activeElement);
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
      focusItem(menuItems.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close({ restoreFocus: false });
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
