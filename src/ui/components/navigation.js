import { NAVIGATION_ITEMS } from '../../core/config.js';
import { createIcon } from '../icons/icon.js';

export function createNavigation(documentObject) {
  const navigation = documentObject.createElement('nav');
  const list = documentObject.createElement('ul');
  const links = new Map();

  navigation.className = 'app-navigation';
  navigation.setAttribute('aria-label', 'Navegação principal');
  list.className = 'app-navigation__list';

  for (const item of NAVIGATION_ITEMS) {
    const listItem = documentObject.createElement('li');
    const link = documentObject.createElement('a');
    const label = documentObject.createElement('span');

    link.className = 'app-navigation__link';
    link.href = item.href;
    link.dataset.routeId = item.id;
    link.append(createIcon(documentObject, item.icon));

    label.textContent = item.label;
    link.append(label);
    listItem.append(link);
    list.append(listItem);
    links.set(item.id, link);
  }

  navigation.append(list);

  let activeLink = null;

  function setActiveRoute(routeId) {
    activeLink = null;
    for (const [itemId, link] of links) {
      if (itemId === routeId || (routeId === 'materia' && itemId === 'materias')) {
        link.setAttribute('aria-current', 'page');
        activeLink = link;
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  return Object.freeze({
    element: navigation,
    setActiveRoute,
    getActiveLink: () => activeLink,
    getFirstLink: () => links.values().next().value ?? null,
  });
}
