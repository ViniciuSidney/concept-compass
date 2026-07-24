import { createIcon } from '../icons/icon.js';
export function createBreadcrumb(documentObject, { items = [], label = 'Navegação estrutural' }) {
  const nav = documentObject.createElement('nav');
  const list = documentObject.createElement('ol');
  nav.className = 'breadcrumb';
  nav.setAttribute('aria-label', label);
  list.className = 'breadcrumb__list';
  items.forEach((item, index) => {
    const li = documentObject.createElement('li');
    const last = index === items.length - 1;
    li.className = 'breadcrumb__item';
    if (item.href && !last) {
      const a = documentObject.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.append(a);
    } else {
      const span = documentObject.createElement('span');
      span.textContent = item.label;
      if (last) span.setAttribute('aria-current', 'page');
      li.append(span);
    }
    if (!last) {
      const sep = documentObject.createElement('span');
      sep.className = 'breadcrumb__separator';
      sep.setAttribute('aria-hidden', 'true');
      sep.append(createIcon(documentObject, 'chevron-right', { size: 14 }));
      li.append(sep);
    }
    list.append(li);
  });
  nav.append(list);
  return nav;
}
