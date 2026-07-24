import { APP_CONFIG } from '../../core/config.js';
import { createIcon } from '../icons/icon.js';
import { createNavigation } from './navigation.js';

export function createAppShell(documentObject) {
  const shell = documentObject.createElement('div');
  const sidebar = documentObject.createElement('aside');
  const sidebarHeader = documentObject.createElement('div');
  const brandMark = documentObject.createElement('span');
  const brandText = documentObject.createElement('div');
  const brandName = documentObject.createElement('strong');
  const brandSubtitle = documentObject.createElement('span');
  const sidebarFooter = documentObject.createElement('div');
  const sidebarFooterTitle = documentObject.createElement('strong');
  const sidebarFooterText = documentObject.createElement('p');
  const backdrop = documentObject.createElement('button');
  const content = documentObject.createElement('div');
  const topbar = documentObject.createElement('header');
  const menuButton = documentObject.createElement('button');
  const topbarIdentity = documentObject.createElement('div');
  const topbarEyebrow = documentObject.createElement('span');
  const topbarTitle = documentObject.createElement('strong');
  const main = documentObject.createElement('main');
  const notificationRegion = documentObject.createElement('div');
  const navigation = createNavigation(documentObject);

  shell.className = 'app-shell';
  sidebar.className = 'app-sidebar';
  sidebar.id = 'app-sidebar';
  sidebarHeader.className = 'app-sidebar__header';

  brandMark.className = 'app-brand__mark';
  brandMark.append(createIcon(documentObject, 'layers', { size: 24 }));
  brandText.className = 'app-brand__text';
  brandName.textContent = APP_CONFIG.name;
  brandSubtitle.textContent = APP_CONFIG.productVersion;
  brandText.append(brandName, brandSubtitle);
  sidebarHeader.append(brandMark, brandText);

  sidebarFooter.className = 'app-sidebar__footer-card';
  sidebarFooterTitle.textContent = 'Base bem definida';
  sidebarFooterText.textContent = 'Cada marco avança somente após validação.';
  sidebarFooter.append(sidebarFooterTitle, sidebarFooterText);

  sidebar.append(sidebarHeader, navigation.element, sidebarFooter);

  backdrop.className = 'app-sidebar-backdrop';
  backdrop.type = 'button';
  backdrop.setAttribute('aria-label', 'Fechar menu de navegação');
  backdrop.hidden = true;

  content.className = 'app-content';
  topbar.className = 'app-topbar';

  menuButton.className = 'app-topbar__menu-button';
  menuButton.type = 'button';
  menuButton.setAttribute('aria-controls', sidebar.id);
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu de navegação');
  menuButton.append(createIcon(documentObject, 'menu', { size: 22 }));

  topbarIdentity.className = 'app-topbar__identity';
  topbarEyebrow.textContent = 'Organizador de Conteúdos';
  topbarTitle.textContent = APP_CONFIG.defaultTitle;
  topbarIdentity.append(topbarEyebrow, topbarTitle);
  topbar.append(menuButton, topbarIdentity);

  main.className = 'app-main';
  main.id = 'main-content';
  main.tabIndex = -1;

  notificationRegion.className = 'app-notifications';
  notificationRegion.id = 'app-notifications';
  notificationRegion.setAttribute('aria-live', 'polite');
  notificationRegion.setAttribute('aria-atomic', 'true');

  content.append(topbar, main);
  shell.append(sidebar, backdrop, content, notificationRegion);

  function setNavigationOpen(isOpen) {
    shell.classList.toggle('is-navigation-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute(
      'aria-label',
      isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação',
    );
    backdrop.hidden = !isOpen;
  }

  menuButton.addEventListener('click', () => {
    setNavigationOpen(!shell.classList.contains('is-navigation-open'));
  });

  backdrop.addEventListener('click', () => {
    setNavigationOpen(false);
    menuButton.focus();
  });

  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setNavigationOpen(false);
    }
  });

  documentObject.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && shell.classList.contains('is-navigation-open')) {
      setNavigationOpen(false);
      menuButton.focus();
    }
  });

  function renderPage(pageElement, route) {
    navigation.setActiveRoute(route.id);
    topbarTitle.textContent = route.title;
    main.replaceChildren(pageElement);
    setNavigationOpen(false);

    window.requestAnimationFrame(() => {
      main.focus({ preventScroll: true });
    });
  }

  function announce(message) {
    notificationRegion.textContent = '';
    window.requestAnimationFrame(() => {
      notificationRegion.textContent = message;
    });
  }

  return Object.freeze({
    element: shell,
    renderPage,
    announce,
    closeNavigation: () => setNavigationOpen(false),
  });
}
