import { createIcon } from '../icons/icon.js';

const BUTTON_VARIANTS = new Set(['primary', 'secondary', 'ghost', 'danger']);
const BUTTON_SIZES = new Set(['small', 'medium', 'large']);

function applyContent(documentObject, element, { label, icon, iconPosition }) {
  if (icon && iconPosition === 'start')
    element.append(createIcon(documentObject, icon, { size: 18 }));
  const text = documentObject.createElement('span');
  text.textContent = label;
  element.append(text);
  if (icon && iconPosition === 'end')
    element.append(createIcon(documentObject, icon, { size: 18 }));
}

function applyOptions(documentObject, element, options) {
  const {
    label,
    icon = null,
    iconPosition = 'start',
    variant = 'primary',
    size = 'medium',
    disabled = false,
    className = '',
    ariaLabel = null,
  } = options;
  const safeVariant = BUTTON_VARIANTS.has(variant) ? variant : 'primary';
  const safeSize = BUTTON_SIZES.has(size) ? size : 'medium';
  element.className = `button button--${safeVariant} button--${safeSize}`;
  if (className) element.classList.add(...className.split(' ').filter(Boolean));
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  if (disabled) {
    element.setAttribute('aria-disabled', 'true');
    element.tabIndex = -1;
  }
  applyContent(documentObject, element, { label, icon, iconPosition });
}

export function createButton(
  documentObject,
  { label, type = 'button', onClick = null, disabled = false, ...options },
) {
  const button = documentObject.createElement('button');
  button.type = type;
  button.disabled = disabled;
  applyOptions(documentObject, button, { label, disabled, ...options });
  if (onClick) button.addEventListener('click', onClick);
  return button;
}

export function createButtonLink(documentObject, { label, href, disabled = false, ...options }) {
  const link = documentObject.createElement('a');
  link.href = disabled ? '#' : href;
  applyOptions(documentObject, link, { label, disabled, ...options });
  if (disabled) link.addEventListener('click', (event) => event.preventDefault());
  return link;
}
