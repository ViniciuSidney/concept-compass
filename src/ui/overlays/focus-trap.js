import { getFocusableElements } from '../components/component-utils.js';
export function createFocusTrap(documentObject, container) {
  let previouslyFocused = null;
  let active = false;
  function handleKeydown(event) {
    if (!active || event.key !== 'Tab') return;
    const items = getFocusableElements(container);
    if (items.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && documentObject.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && documentObject.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  function activate(initialFocus = null) {
    if (active) return;
    active = true;
    previouslyFocused = documentObject.activeElement;
    documentObject.addEventListener('keydown', handleKeydown);
    (initialFocus ?? getFocusableElements(container)[0] ?? container).focus();
  }
  function deactivate({ restoreFocus = true } = {}) {
    if (!active) return;
    active = false;
    documentObject.removeEventListener('keydown', handleKeydown);
    if (restoreFocus && previouslyFocused?.focus) previouslyFocused.focus();
  }
  return Object.freeze({ activate, deactivate });
}
