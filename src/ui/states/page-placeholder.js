import { createIcon } from '../icons/icon.js';

export function createPagePlaceholder(
  documentObject,
  {
    eyebrow,
    title,
    description,
    icon = 'layers',
    status = 'Estrutura provisória do M1',
    details = [],
    action = null,
  },
) {
  const page = documentObject.createElement('section');
  const header = documentObject.createElement('header');
  const headingGroup = documentObject.createElement('div');
  const eyebrowElement = documentObject.createElement('p');
  const titleElement = documentObject.createElement('h1');
  const descriptionElement = documentObject.createElement('p');
  const statusElement = documentObject.createElement('span');
  const card = documentObject.createElement('article');
  const iconWrapper = documentObject.createElement('span');
  const cardContent = documentObject.createElement('div');
  const cardTitle = documentObject.createElement('h2');
  const cardText = documentObject.createElement('p');

  page.className = 'page-placeholder';
  header.className = 'page-header';
  headingGroup.className = 'page-header__content';
  eyebrowElement.className = 'page-header__eyebrow';
  eyebrowElement.textContent = eyebrow;
  titleElement.textContent = title;
  descriptionElement.textContent = description;
  statusElement.className = 'status-chip';
  statusElement.textContent = status;

  headingGroup.append(eyebrowElement, titleElement, descriptionElement);
  header.append(headingGroup, statusElement);

  card.className = 'foundation-card';
  iconWrapper.className = 'foundation-card__icon';
  iconWrapper.append(createIcon(documentObject, icon, { size: 26 }));
  cardContent.className = 'foundation-card__content';
  cardTitle.textContent = 'Fundação preparada';
  cardText.textContent =
    'Esta rota já funciona dentro do AppShell. O conteúdo definitivo será implementado no marco correspondente.';
  cardContent.append(cardTitle, cardText);

  if (details.length > 0) {
    const list = documentObject.createElement('ul');
    list.className = 'foundation-card__list';

    for (const detail of details) {
      const item = documentObject.createElement('li');
      item.textContent = detail;
      list.append(item);
    }

    cardContent.append(list);
  }

  if (action) {
    const actionLink = documentObject.createElement('a');
    actionLink.className = 'button button--primary';
    actionLink.href = action.href;
    actionLink.textContent = action.label;
    actionLink.append(createIcon(documentObject, 'arrow', { size: 18 }));
    cardContent.append(actionLink);
  }

  card.append(iconWrapper, cardContent);
  page.append(header, card);

  return page;
}
