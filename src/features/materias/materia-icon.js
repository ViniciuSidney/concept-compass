import { MATERIA_COLORS } from '../../domain/constants.js';
import { createIcon } from '../../ui/icons/icon.js';

export function createMateriaIcon(documentObject, { corId = 'roxo', size = 'medium' } = {}) {
  const safeColor = MATERIA_COLORS.includes(corId) ? corId : 'roxo';
  const element = documentObject.createElement('span');
  const iconSize = size === 'large' ? 26 : size === 'small' ? 18 : 22;

  element.className = `materia-icon materia-icon--${safeColor} materia-icon--${size}`;
  element.setAttribute('aria-hidden', 'true');
  element.append(createIcon(documentObject, 'book', { size: iconSize }));

  return element;
}
