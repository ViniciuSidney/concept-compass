import { APP_CONFIG } from './config.js';
import { createRouter } from './router.js';
import { createStore } from './store.js';
import { createAppRepository } from '../data/repositories/app-repository.js';
import { createLocalStorageAdapter } from '../data/storage/local-storage-adapter.js';
import { createDefaultPreferences, createEmptyData } from '../domain/constants.js';
import { createConfiguracoesPage } from '../features/configuracoes/configuracoes-page.js';
import { createDashboardPage } from '../features/dashboard/dashboard-page.js';
import { createMateriaPage } from '../features/materias/materia-page.js';
import { createMateriasPage } from '../features/materias/materias-page.js';
import { createNaoEncontradoPage } from '../features/nao-encontrado/nao-encontrado-page.js';
import { createPesquisaPage } from '../features/pesquisa/pesquisa-page.js';
import { createRecuperacaoPage } from '../features/recuperacao/recuperacao-page.js';
import { configureStudyStackDeletionBridge } from '../integrations/study-stack-deletion-bridge.js';
import { createStudyStackSummaryReader } from '../integrations/study-stack-summary-reader.js';
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

  const storageAdapter = createLocalStorageAdapter(windowObject.localStorage);
  const repository = createAppRepository({ storageAdapter });
  const studyStackSummaryReader = createStudyStackSummaryReader({
    storage: windowObject.localStorage,
    config: APP_CONFIG.integrations.studyStack,
  });
  const studyStackDeletionBridge = configureStudyStackDeletionBridge({
    storage: windowObject.localStorage,
    config: Object.freeze({
      contractVersion: APP_CONFIG.integrations.studyStack.deletionContractVersion,
      sourceApp: 'concept_compass',
      commandKey: APP_CONFIG.integrations.studyStack.deletionCommandKey,
      acknowledgementKey: APP_CONFIG.integrations.studyStack.deletionAcknowledgementKey,
    }),
  });
  let studyStackFingerprint = studyStackSummaryReader.read().fingerprint;
  const dataResult = repository.loadData();
  if (dataResult.status === 'ready' && dataResult.migrated) {
    try {
      repository.saveData(dataResult.data);
    } catch {
      // A migração permanece disponível em memória mesmo se o navegador bloquear a gravação.
    }
  }
  const preferencesResult = repository.loadPreferences();
  const preferences = preferencesResult.preferences ?? createDefaultPreferences();
  const store = createStore({
    data: dataResult.data ?? createEmptyData(),
    preferences,
    ui: {
      route: null,
    },
    status: {
      initializing: true,
      saving: false,
      recovering: dataResult.status === 'recovery',
      recoveryRawData: dataResult.rawData ?? null,
      lastError: serializeAppError(dataResult.error),
      preferencesFallback: preferencesResult.status === 'fallback',
    },
  });
  const themeController = createThemeController({ documentObject, windowObject });
  const overlayManager = createOverlayManager();
  const appShell = createAppShell(documentObject, { windowObject });
  let router = null;
  let integrationListenersInstalled = false;

  reconcileStudyStackDeletions();
  themeController.setTheme(preferences.theme);
  root.replaceChildren(appShell.element);
  root.removeAttribute('aria-busy');

  function updateDocumentTitle(route) {
    documentObject.title = `${route.title} — ${APP_CONFIG.name}`;
  }

  function renderRoute(route) {
    if (store.getState().status.recovering && route.id !== 'recuperacao') {
      router?.navigate('/recuperacao', { replace: true });
      return;
    }

    overlayManager.reset('route-change');
    const pageFactory = PAGE_FACTORIES[route.id] ?? createNaoEncontradoPage;
    const pageContext = Object.freeze({
      appShell,
      themeController,
      overlayManager,
      store,
      repository,
      studyStackSummaryReader,
      studyStackDeletionBridge,
      windowObject,
      navigate: (href, options) => router?.navigate(href, options),
    });
    const page = pageFactory(documentObject, route, pageContext);

    store.updateState((currentState) => ({
      ui: {
        ...currentState.ui,
        route,
      },
      status: {
        ...currentState.status,
        initializing: false,
      },
    }));

    updateDocumentTitle(route);
    appShell.renderPage(page, route);
  }

  function reconcileStudyStackDeletions() {
    try {
      return studyStackDeletionBridge.reconcile(store.getState().data);
    } catch {
      return false;
    }
  }

  function syncStudyStackSummary() {
    const snapshot = studyStackSummaryReader.read();
    if (snapshot.fingerprint === studyStackFingerprint) return false;

    studyStackFingerprint = snapshot.fingerprint;
    const currentRoute = store.getState().ui.route;
    if (currentRoute) renderRoute(currentRoute);
    return true;
  }

  function onStorage(event) {
    if (event?.key === APP_CONFIG.integrations.studyStack.summaryKey) {
      syncStudyStackSummary();
    }
  }

  function onFocus() {
    reconcileStudyStackDeletions();
    syncStudyStackSummary();
  }

  function onVisibilityChange() {
    if (documentObject.visibilityState !== 'hidden') {
      reconcileStudyStackDeletions();
      syncStudyStackSummary();
    }
  }

  function installIntegrationListeners() {
    if (integrationListenersInstalled) return;
    windowObject.addEventListener('storage', onStorage);
    windowObject.addEventListener('focus', onFocus);
    documentObject.addEventListener('visibilitychange', onVisibilityChange);
    integrationListenersInstalled = true;
  }

  function removeIntegrationListeners() {
    if (!integrationListenersInstalled) return;
    windowObject.removeEventListener('storage', onStorage);
    windowObject.removeEventListener('focus', onFocus);
    documentObject.removeEventListener('visibilitychange', onVisibilityChange);
    integrationListenersInstalled = false;
  }

  router = createRouter({
    windowObject,
    onRouteChange: renderRoute,
  });

  function start() {
    if (dataResult.status === 'recovery' && windowObject.location.hash !== '#/recuperacao') {
      router.navigate('/recuperacao', { replace: true });
    }

    installIntegrationListeners();
    router.start();
  }

  function stop() {
    removeIntegrationListeners();
    router.stop();
    overlayManager.reset('app-stop');
    appShell.destroy();
    themeController.destroy();
  }

  return Object.freeze({
    start,
    stop,
    store,
    router,
    repository,
    studyStackSummaryReader,
    studyStackDeletionBridge,
    themeController,
    overlayManager,
  });
}

function serializeAppError(error) {
  if (!error) return null;
  return Object.freeze({
    name: error.name ?? 'Error',
    message: error.message ?? 'Erro desconhecido.',
    code: error.code ?? null,
    details: error.details ?? null,
  });
}
