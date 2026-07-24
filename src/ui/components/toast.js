import { createIcon } from '../icons/icon.js';
import { createIconButton } from './icon-button.js';
const ICONS = Object.freeze({
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
});
export function createToast(
  documentObject,
  { title, message = null, tone = 'info', duration = 4500, onDismiss = null },
) {
  const toast = documentObject.createElement('article');
  const icon = documentObject.createElement('span');
  const content = documentObject.createElement('div');
  const heading = documentObject.createElement('strong');
  const close = createIconButton(documentObject, {
    icon: 'close',
    label: 'Fechar mensagem',
    variant: 'ghost',
    size: 'small',
  });
  let timer = null;
  toast.className = `toast toast--${tone}`;
  toast.setAttribute('role', tone === 'danger' ? 'alert' : 'status');
  icon.className = 'toast__icon';
  icon.append(createIcon(documentObject, ICONS[tone] ?? 'info', { size: 19 }));
  content.className = 'toast__content';
  heading.textContent = title;
  content.append(heading);
  if (message) {
    const p = documentObject.createElement('p');
    p.textContent = message;
    content.append(p);
  }
  toast.append(icon, content, close);
  function dismiss(reason = 'dismiss') {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    toast.classList.add('is-leaving');
    const remove = () => {
      toast.remove();
      onDismiss?.(reason);
    };
    if (documentObject.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
      remove();
    else setTimeout(remove, 180);
  }
  close.addEventListener('click', () => dismiss('close-button'));
  if (duration > 0) timer = setTimeout(() => dismiss('timeout'), duration);
  return Object.freeze({ element: toast, dismiss });
}
export function createToastManager(documentObject, region) {
  return Object.freeze({
    show(options) {
      const toast = createToast(documentObject, options);
      region.append(toast.element);
      return toast;
    },
    clear: () => region.replaceChildren(),
  });
}
