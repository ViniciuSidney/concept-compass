import { createBadge } from '../components/badge.js';
import { createButtonLink } from '../components/button.js';
import { createPageHeader } from '../components/page-header.js';
import { createIcon } from '../icons/icon.js';
export function createPagePlaceholder(
  documentObject,
  {
    eyebrow,
    title,
    description,
    icon = 'layers',
    status = 'Estrutura provisória',
    details = [],
    action = null,
    breadcrumb = null,
  },
) {
  const page = documentObject.createElement('section');
  const header = createPageHeader(documentObject, {
    eyebrow,
    title,
    description,
    breadcrumb,
    actions: createBadge(documentObject, { label: status, tone: 'primary' }),
  });
  const card = documentObject.createElement('article');
  const iconBox = documentObject.createElement('span');
  const content = documentObject.createElement('div');
  const h2 = documentObject.createElement('h2');
  const p = documentObject.createElement('p');
  page.className = 'page-placeholder';
  card.className = 'surface-card foundation-card';
  iconBox.className = 'foundation-card__icon';
  iconBox.append(createIcon(documentObject, icon, { size: 26 }));
  content.className = 'foundation-card__content';
  h2.textContent = 'Fundação preparada';
  p.textContent =
    'Esta rota funciona dentro do AppShell e já utiliza os componentes globais do M3. O conteúdo definitivo será implementado no marco correspondente.';
  content.append(h2, p);
  if (details.length) {
    const list = documentObject.createElement('ul');
    list.className = 'foundation-card__list';
    for (const detail of details) {
      const li = documentObject.createElement('li');
      li.textContent = detail;
      list.append(li);
    }
    content.append(list);
  }
  if (action)
    content.append(
      createButtonLink(documentObject, {
        href: action.href,
        label: action.label,
        icon: 'arrow',
        iconPosition: 'end',
      }),
    );
  card.append(iconBox, content);
  page.append(header, card);
  return page;
}
