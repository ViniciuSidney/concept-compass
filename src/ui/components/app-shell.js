import { APP_CONFIG } from '../../core/config.js';
import { createIconButton } from './icon-button.js';
import { createNavigation } from './navigation.js';
import { createToastManager } from './toast.js';
import { createFocusTrap } from '../overlays/focus-trap.js';
export function createAppShell(documentObject, { windowObject = window } = {}) {
  const shell = documentObject.createElement('div');
  const sidebar = documentObject.createElement('aside');
  const sidebarHeader = documentObject.createElement('div');
  const brandMark = documentObject.createElement('span');
  const brandIcon = documentObject.createElement('img');
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
  const navigationTrap = createFocusTrap(documentObject, sidebar);
  const mobileNavigationMaxWidth = 54 * 16;
  let navigationIsMobile = false;
  let desktopSidebarCollapsed = false;
  shell.className = 'app-shell';
  sidebar.className = 'app-sidebar';
  sidebar.id = 'app-sidebar';
  sidebar.setAttribute('aria-label', 'Menu de navegação');
  sidebarHeader.className = 'app-sidebar__header';
  brandMark.className = 'app-brand__mark';
  brandMark.setAttribute('aria-hidden', 'true');
  brandIcon.src = './assets/icons/app-icon.svg';
  brandIcon.alt = '';
  brandIcon.width = 44;
  brandIcon.height = 44;
  brandMark.append(brandIcon);
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
  function updateMenuButtonState() {
    if (navigationIsMobile) {
      const open = shell.classList.contains('is-navigation-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute(
        'aria-label',
        open ? 'Fechar menu de navegação' : 'Abrir menu de navegação',
      );
      return;
    }

    menuButton.setAttribute('aria-expanded', String(!desktopSidebarCollapsed));
    menuButton.setAttribute(
      'aria-label',
      desktopSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral',
    );
  }

  function syncNavigationAccessibility() {
    const mobileOpen = navigationIsMobile && shell.classList.contains('is-navigation-open');

    backdrop.hidden = !mobileOpen;
    documentObject.body.classList.toggle('has-open-navigation', mobileOpen);

    if (navigationIsMobile) {
      sidebar.inert = !mobileOpen;
      sidebar.setAttribute('aria-hidden', String(!mobileOpen));
      content.inert = mobileOpen;
      if (mobileOpen) content.setAttribute('aria-hidden', 'true');
      else content.removeAttribute('aria-hidden');
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', String(mobileOpen));
    } else {
      sidebar.inert = desktopSidebarCollapsed;
      if (desktopSidebarCollapsed) sidebar.setAttribute('aria-hidden', 'true');
      else sidebar.removeAttribute('aria-hidden');
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      content.inert = false;
      content.removeAttribute('aria-hidden');
    }

    updateMenuButtonState();
  }

  function setNavigationOpen(open, { restoreFocus = false } = {}) {
    const shouldOpen = Boolean(open && navigationIsMobile);
    const wasOpen = shell.classList.contains('is-navigation-open');

    shell.classList.toggle('is-navigation-open', shouldOpen);
    syncNavigationAccessibility();

    if (shouldOpen && !wasOpen) {
      navigationTrap.activate(navigation.getActiveLink() ?? navigation.getFirstLink());
    } else if (!shouldOpen && wasOpen) {
      navigationTrap.deactivate({ restoreFocus: false });
      if (restoreFocus) menuButton.focus();
    }
  }

  function setSidebarCollapsed(collapsed) {
    desktopSidebarCollapsed = Boolean(collapsed);
    shell.classList.toggle('is-sidebar-collapsed', desktopSidebarCollapsed);
    syncNavigationAccessibility();
  }

  function syncNavigationMode() {
    const nextMobile = Number(windowObject.innerWidth) <= mobileNavigationMaxWidth;
    if (nextMobile === navigationIsMobile) {
      syncNavigationAccessibility();
      return;
    }
    navigationIsMobile = nextMobile;
    setNavigationOpen(false);
  }
  menuButton.addEventListener('click', () => {
    if (navigationIsMobile) {
      setNavigationOpen(!shell.classList.contains('is-navigation-open'));
      return;
    }
    setSidebarCollapsed(!desktopSidebarCollapsed);
  });
  backdrop.addEventListener('click', () => {
    setNavigationOpen(false, { restoreFocus: true });
  });
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a') && navigationIsMobile) setNavigationOpen(false);
  });
  documentObject.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && shell.classList.contains('is-navigation-open')) {
      setNavigationOpen(false, { restoreFocus: true });
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
  windowObject.addEventListener?.('resize', syncNavigationMode);
  syncNavigationMode();
  return Object.freeze({
    element: shell,
    renderPage,
    announce,
    showToast: (options) => toastManager.show(options),
    clearToasts: toastManager.clear,
    closeNavigation: () => setNavigationOpen(false),
    isNavigationMobile: () => navigationIsMobile,
    isNavigationOpen: () => shell.classList.contains('is-navigation-open'),
    isSidebarCollapsed: () => desktopSidebarCollapsed,
    destroy() {
      setNavigationOpen(false);
      navigationTrap.deactivate({ restoreFocus: false });
      windowObject.removeEventListener?.('resize', syncNavigationMode);
    },
  });
}
