import { appendContent } from './component-utils.js';
import { createIcon } from '../icons/icon.js';
const ICONS = Object.freeze({
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
});
export function createPersistentAlert(
  documentObject,
  { title, message, tone = 'info', actions = null },
) {
  const alert = documentObject.createElement('section');
  const icon = documentObject.createElement('span');
  const content = documentObject.createElement('div');
  const heading = documentObject.createElement('strong');
  const p = documentObject.createElement('p');
  alert.className = `persistent-alert persistent-alert--${tone}`;
  alert.setAttribute('role', tone === 'danger' ? 'alert' : 'status');
  icon.className = 'persistent-alert__icon';
  icon.append(createIcon(documentObject, ICONS[tone] ?? 'info', { size: 20 }));
  content.className = 'persistent-alert__content';
  heading.textContent = title;
  p.textContent = message;
  content.append(heading, p);
  alert.append(icon, content);
  if (actions) {
    const area = documentObject.createElement('div');
    area.className = 'persistent-alert__actions';
    appendContent(area, actions);
    alert.append(area);
  }
  return alert;
}
