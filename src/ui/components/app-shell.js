import { APP_CONFIG } from '../../core/config.js';
import { createIcon } from '../icons/icon.js';
import { createIconButton } from './icon-button.js';
import { createNavigation } from './navigation.js';
import { createToastManager } from './toast.js';
export function createAppShell(documentObject, { windowObject = window } = {}) {
  const shell = documentObject.createElement('div');
  const sidebar = documentObject.createElement('aside');
  const sidebarHeader = documentObject.createElement('div');
  const brandMark = documentObject.createElement('span');
  const brandText = documentObject.createElement('div');
  const brandName = documentObject.createElement('strong');
  const brandSubtitle = documentObject.createElement('span');
  const footer = documentObject.createElement('div');
  const footerTitle = documentObject.createElement('strong');
  const footerText = documentObject.createElement('p');
  const backdrop = documentObject.createElement('button');
  const content = documentObject.createElement('div');
  const topbar = documentObject.createElement('header');
  const menuButton = createIconButton(documentObject, {
    icon: 'menu',
    label: 'Abrir menu de navegação',
    className: 'app-topbar__menu-button',
  });
  const identity = documentObject.createElement('div');
  const eyebrow = documentObject.createElement('span');
  const title = documentObject.createElement('strong');
  const main = documentObject.createElement('main');
  const notifications = documentObject.createElement('div');
  const announcements = documentObject.createElement('div');
  const navigation = createNavigation(documentObject);
  const toastManager = createToastManager(documentObject, notifications);
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
  footer.className = 'app-sidebar__footer-card';
  footerTitle.textContent = 'Base bem definida';
  footerText.textContent = 'Cada marco avança somente após validação.';
  footer.append(footerTitle, footerText);
  sidebar.append(sidebarHeader, navigation.element, footer);
  backdrop.className = 'app-sidebar-backdrop';
  backdrop.type = 'button';
  backdrop.setAttribute('aria-label', 'Fechar menu de navegação');
  backdrop.hidden = true;
  content.className = 'app-content';
  topbar.className = 'app-topbar';
  menuButton.setAttribute('aria-controls', sidebar.id);
  menuButton.setAttribute('aria-expanded', 'false');
  identity.className = 'app-topbar__identity';
  eyebrow.textContent = APP_CONFIG.name;
  title.textContent = APP_CONFIG.defaultTitle;
  identity.append(eyebrow, title);
  topbar.append(menuButton, identity);
  main.className = 'app-main';
  main.id = 'main-content';
  main.tabIndex = -1;
  notifications.className = 'app-notifications';
  notifications.id = 'app-notifications';
  notifications.setAttribute('aria-label', 'Mensagens da aplicação');
  announcements.className = 'visually-hidden';
  announcements.id = 'app-announcements';
  announcements.setAttribute('aria-live', 'polite');
  announcements.setAttribute('aria-atomic', 'true');
  content.append(topbar, main);
  shell.append(sidebar, backdrop, content, notifications, announcements);
  function setNavigationOpen(open) {
    shell.classList.toggle('is-navigation-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute(
      'aria-label',
      open ? 'Fechar menu de navegação' : 'Abrir menu de navegação',
    );
    backdrop.hidden = !open;
    documentObject.body.classList.toggle('has-open-navigation', open);
  }
  menuButton.addEventListener('click', () =>
    setNavigationOpen(!shell.classList.contains('is-navigation-open')),
  );
  backdrop.addEventListener('click', () => {
    setNavigationOpen(false);
    menuButton.focus();
  });
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a')) setNavigationOpen(false);
  });
  documentObject.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && shell.classList.contains('is-navigation-open')) {
      setNavigationOpen(false);
      menuButton.focus();
    }
  });
  function renderPage(page, route) {
    navigation.setActiveRoute(route.id);
    title.textContent = route.title;
    main.replaceChildren(page);
    setNavigationOpen(false);
    windowObject.requestAnimationFrame(() => main.focus({ preventScroll: true }));
  }
  function announce(message) {
    announcements.textContent = '';
    windowObject.requestAnimationFrame(() => {
      announcements.textContent = message;
    });
  }
  return Object.freeze({
    element: shell,
    renderPage,
    announce,
    showToast: (options) => toastManager.show(options),
    clearToasts: toastManager.clear,
    closeNavigation: () => setNavigationOpen(false),
  });
}
