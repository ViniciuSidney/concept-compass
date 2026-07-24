import { APP_CONFIG } from './config.js';
import { createRouter } from './router.js';
import { createStore } from './store.js';
import { createConfiguracoesPage } from '../features/configuracoes/configuracoes-page.js';
import { createDashboardPage } from '../features/dashboard/dashboard-page.js';
import { createMateriaPage } from '../features/materias/materia-page.js';
import { createMateriasPage } from '../features/materias/materias-page.js';
import { createNaoEncontradoPage } from '../features/nao-encontrado/nao-encontrado-page.js';
import { createPesquisaPage } from '../features/pesquisa/pesquisa-page.js';
import { createRecuperacaoPage } from '../features/recuperacao/recuperacao-page.js';
import { createAppShell } from '../ui/components/app-shell.js';
import { createOverlayManager } from '../ui/overlays/overlay-manager.js';
import { createThemeController } from '../ui/theme/theme-controller.js';

const PAGE_FACTORIES = Object.freeze({
  dashboard: createDashboardPage,
  materias: createMateriasPage,
  materia: createMateriaPage,
  pesquisa: createPesquisaPage,
  configuracoes: createConfiguracoesPage,
  recuperacao: createRecuperacaoPage,
  'nao-encontrado': createNaoEncontradoPage,
});

export function createApp({ documentObject = document, windowObject = window } = {}) {
  const root = documentObject.querySelector('#app');

  if (!root) {
    throw new Error('A região raiz #app não foi encontrada.');
  }

  const store = createStore({
    ui: {
      route: null,
    },
    status: {
      initializing: true,
      lastError: null,
    },
  });
  const themeController = createThemeController({ documentObject, windowObject });
  const overlayManager = createOverlayManager();
  const appShell = createAppShell(documentObject, { windowObject });
  const pageContext = Object.freeze({ appShell, themeController, overlayManager });

  root.replaceChildren(appShell.element);

  function updateDocumentTitle(route) {
    documentObject.title = `${route.title} — ${APP_CONFIG.name}`;
  }

  function renderRoute(route) {
    overlayManager.reset('route-change');
    const pageFactory = PAGE_FACTORIES[route.id] ?? createNaoEncontradoPage;
    const page = pageFactory(documentObject, route, pageContext);

    store.updateState((currentState) => ({
      ui: {
        ...currentState.ui,
        route,
      },
      status: {
        ...currentState.status,
        initializing: false,
        lastError: null,
      },
    }));

    updateDocumentTitle(route);
    appShell.renderPage(page, route);
  }

  const router = createRouter({
    windowObject,
    onRouteChange: renderRoute,
  });

  function start() {
    router.start();
  }

  function stop() {
    router.stop();
    overlayManager.reset('app-stop');
    themeController.destroy();
  }

  return Object.freeze({
    start,
    stop,
    store,
    router,
    themeController,
    overlayManager,
  });
}
