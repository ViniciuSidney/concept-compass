import { appendContent } from './component-utils.js';
import { createBreadcrumb } from './breadcrumb.js';
export function createPageHeader(
  documentObject,
  { eyebrow = null, title, description = null, breadcrumb = null, actions = null, meta = null },
) {
  const header = documentObject.createElement('header');
  const main = documentObject.createElement('div');
  const group = documentObject.createElement('div');
  const h1 = documentObject.createElement('h1');
  header.className = 'page-header';
  main.className = 'page-header__main';
  group.className = 'page-header__content';
  if (breadcrumb?.length) main.append(createBreadcrumb(documentObject, { items: breadcrumb }));
  if (eyebrow) {
    const p = documentObject.createElement('p');
    p.className = 'page-header__eyebrow';
    p.textContent = eyebrow;
    group.append(p);
  }
  h1.textContent = title;
  group.append(h1);
  if (description) {
    const p = documentObject.createElement('p');
    p.className = 'page-header__description';
    p.textContent = description;
    group.append(p);
  }
  if (meta) {
    const area = documentObject.createElement('div');
    area.className = 'page-header__meta';
    appendContent(area, meta);
    group.append(area);
  }
  main.append(group);
  header.append(main);
  if (actions) {
    const area = documentObject.createElement('div');
    area.className = 'page-header__actions';
    appendContent(area, actions);
    header.append(area);
  }
  return header;
}
