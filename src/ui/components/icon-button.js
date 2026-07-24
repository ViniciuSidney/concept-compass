import { createIcon } from '../icons/icon.js';

const VARIANTS = new Set(['default', 'ghost', 'danger']);

export function createIconButton(
  documentObject,
  {
    icon,
    label,
    type = 'button',
    variant = 'default',
    size = 'medium',
    disabled = false,
    onClick = null,
    className = '',
  },
) {
  const button = documentObject.createElement('button');
  button.type = type;
  button.disabled = disabled;
  button.className = `icon-button icon-button--${VARIANTS.has(variant) ? variant : 'default'} icon-button--${size}`;
  button.setAttribute('aria-label', label);
  if (className) button.classList.add(...className.split(' ').filter(Boolean));
  button.append(createIcon(documentObject, icon, { size: size === 'small' ? 16 : 20 }));
  if (onClick) button.addEventListener('click', onClick);
  return button;
}
