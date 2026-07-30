import { APP_CONFIG } from '../../core/config.js';
import { parseBackupText } from '../../data/backup/backup-service.js';
import { downloadBackup } from '../../data/backup/backup-download.js';
import { THEMES, createEmptyData } from '../../domain/constants.js';
import { createButton } from '../../ui/components/button.js';
import { createPageHeader } from '../../ui/components/page-header.js';
import { createPersistentAlert } from '../../ui/components/persistent-alert.js';
import { createIcon } from '../../ui/icons/icon.js';
import { createBackupImportDialog } from './backup-import-dialog.js';
import { createDeleteAllDataDialog } from './delete-all-data-dialog.js';
import { openBackupFilePicker } from './backup-file-picker.js';

const THEME_OPTIONS = Object.freeze([
  Object.freeze({
    value: THEMES.LIGHT,
    label: 'Claro',
    icon: 'sun',
    description: 'Usa superfícies claras em toda a aplicação.',
  }),
  Object.freeze({
    value: THEMES.DARK,
    label: 'Escuro',
    icon: 'moon',
    description: 'Usa superfícies escuras em toda a aplicação.',
  }),
  Object.freeze({
    value: THEMES.SYSTEM,
    label: 'Seguir sistema',
    icon: 'monitor',
    description: 'Acompanha a aparência definida no dispositivo.',
  }),
]);

export function createConfiguracoesPage(documentObject, _route, context) {
  const { store, repository, themeController, appShell, overlayManager, windowObject, navigate } =
    context;
  const page = documentObject.createElement('div');
  const header = createPageHeader(documentObject, {
    eyebrow: 'Preferências e segurança',
    title: 'Configurações',
    description:
      'Controle a aparência da aplicação e proteja os dados armazenados neste navegador.',
  });
  const grid = documentObject.createElement('div');

  page.className = 'configuracoes-page';
  grid.className = 'configuracoes-grid';
  page.append(header);

  const state = store.getState();
  if (state.status.preferencesFallback) {
    page.append(
      createPersistentAlert(documentObject, {
        tone: 'warning',
        title: 'Preferência anterior ignorada',
        message:
          'A preferência de aparência armazenada era inválida. O modo padrão foi aplicado sem alterar seus dados acadêmicos.',
      }),
    );
  }

  grid.append(
    createAppearanceSection(),
    createBackupSection(),
    createDataSection(),
    createAboutSection(),
  );
  page.append(grid);
  return page;

  function createAppearanceSection() {
    const section = createSettingsCard(documentObject, {
      icon: 'sun',
      title: 'Aparência',
      description: `Escolha como o ${APP_CONFIG.name} deve ser exibido.`,
      className: 'settings-card--wide',
    });
    const options = documentObject.createElement('div');
    const status = documentObject.createElement('p');
    const restoreButton = createButton(documentObject, {
      label: 'Restaurar aparência padrão',
      icon: 'monitor',
      variant: 'secondary',
      onClick: () => persistTheme(THEMES.SYSTEM),
    });
    const buttons = new Map();

    options.className = 'appearance-options';
    options.setAttribute('role', 'group');
    options.setAttribute('aria-label', 'Escolher aparência');
    status.className = 'appearance-status';
    status.setAttribute('aria-live', 'polite');

    for (const option of THEME_OPTIONS) {
      const button = documentObject.createElement('button');
      const icon = documentObject.createElement('span');
      const content = documentObject.createElement('span');
      const title = documentObject.createElement('strong');
      const description = documentObject.createElement('span');
      button.type = 'button';
      button.className = 'appearance-option';
      icon.className = 'appearance-option__icon';
      icon.append(createIcon(documentObject, option.icon, { size: 22 }));
      content.className = 'appearance-option__content';
      title.textContent = option.label;
      description.textContent = option.description;
      content.append(title, description);
      button.append(icon, content);
      button.addEventListener('click', () => persistTheme(option.value));
      options.append(button);
      buttons.set(option.value, button);
    }

    updateThemeControls(themeController.getState());
    const unsubscribe = themeController.subscribe(updateThemeControls);
    const handleRouteExit = () => {
      if (!windowObject.location?.hash?.startsWith('#/configuracoes')) {
        unsubscribe();
        windowObject.removeEventListener?.('hashchange', handleRouteExit);
      }
    };
    windowObject.addEventListener?.('hashchange', handleRouteExit);

    section.body.append(options, status, restoreButton);
    return section.element;

    function updateThemeControls(themeState) {
      for (const [value, button] of buttons) {
        const selected = value === themeState.choice;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      }
      const choiceLabel = THEME_OPTIONS.find(({ value }) => value === themeState.choice)?.label;
      const resolvedLabel = themeState.resolved === THEMES.DARK ? 'escuro' : 'claro';
      status.textContent = `Modo escolhido: ${choiceLabel}. Tema aplicado: ${resolvedLabel}.`;
      const isDefault = themeState.choice === THEMES.SYSTEM;
      restoreButton.disabled = isDefault;
      restoreButton.setAttribute('aria-disabled', String(isDefault));
    }
  }

  function persistTheme(theme) {
    const current = store.getState();
    const nextPreferences = { ...current.preferences, theme };

    try {
      const saved = repository.savePreferences(nextPreferences);
      store.updateState((state) => ({
        preferences: saved,
        status: { ...state.status, preferencesFallback: false },
      }));
      themeController.setTheme(saved.theme);
      appShell.showToast({
        tone: 'success',
        title: 'Aparência atualizada',
        message: 'A preferência foi salva neste navegador.',
      });
      appShell.announce('Preferência de aparência atualizada.');
    } catch (error) {
      appShell.showToast({
        tone: 'danger',
        title: 'Não foi possível salvar a aparência',
        message: error?.message,
        duration: 0,
      });
    }
  }

  function createBackupSection() {
    const section = createSettingsCard(documentObject, {
      icon: 'shield',
      title: 'Backup',
      description: 'Exporte uma cópia completa ou restaure um arquivo validado.',
    });
    const actions = documentObject.createElement('div');
    const note = documentObject.createElement('p');
    const exportButton = createButton(documentObject, {
      label: 'Exportar backup',
      icon: 'download',
      onClick: () => exportCurrentBackup(),
    });
    const importButton = createButton(documentObject, {
      label: 'Importar backup',
      icon: 'upload',
      variant: 'secondary',
      onClick: openImportPicker,
    });
    actions.className = 'settings-actions';
    note.className = 'settings-note';
    note.textContent =
      'A importação é validada primeiro e somente substitui os dados após sua confirmação.';
    actions.append(exportButton, importButton);
    section.body.append(actions, note);
    return section.element;
  }

  function exportCurrentBackup({ rethrow = false } = {}) {
    try {
      const current = store.getState();
      const result = downloadBackup(documentObject, windowObject, {
        data: current.data,
        preferences: current.preferences,
      });
      appShell.showToast({
        tone: 'success',
        title: 'Backup exportado',
        message: result.fileName,
      });
      appShell.announce('Backup exportado com sucesso.');
      return result;
    } catch (error) {
      appShell.showToast({
        tone: 'danger',
        title: 'Não foi possível exportar o backup',
        message: error?.message,
        duration: 0,
      });
      if (rethrow) throw error;
      return null;
    }
  }

  function openImportPicker() {
    openBackupFilePicker(documentObject, {
      async onFile({ text }) {
        const backup = parseBackupText(text);
        const dialog = createBackupImportDialog(documentObject, {
          backup,
          overlayManager,
          onExportCurrent: () => exportCurrentBackup({ rethrow: true }),
          onConfirm: importBackup,
        });
        dialog.open();
      },
      onError: presentImportError,
    });
  }

  function importBackup(backup) {
    const restored = repository.replaceSnapshot({
      data: backup.data,
      preferences: backup.preferences,
    });
    store.updateState((current) => ({
      data: restored.data,
      preferences: restored.preferences,
      status: {
        ...current.status,
        recovering: false,
        preferencesFallback: false,
        recoveryRawData: null,
        lastError: null,
      },
    }));
    themeController.setTheme(restored.preferences.theme);
    appShell.showToast({
      tone: 'success',
      title: 'Backup importado',
      message: 'Os dados e a aparência foram restaurados com segurança.',
    });
    appShell.announce('Backup importado com sucesso.');
    navigate('/', { replace: true });
  }

  function presentImportError(error) {
    appShell.showToast({
      tone: 'danger',
      title: 'Backup não importado',
      message: error?.message || 'O arquivo selecionado não pôde ser validado.',
      duration: 0,
    });
  }

  function createDataSection() {
    const currentData = store.getState().data;
    const section = createSettingsCard(documentObject, {
      icon: 'database',
      title: 'Dados',
      description: 'Remova toda a organização acadêmica armazenada localmente.',
      tone: 'danger',
    });
    const summary = documentObject.createElement('p');
    const button = createButton(documentObject, {
      label: 'Apagar todos os dados',
      icon: 'trash',
      variant: 'danger',
      disabled:
        currentData.materias.length === 0 &&
        currentData.temas.length === 0 &&
        currentData.assuntos.length === 0,
      onClick: openDeleteDialog,
    });
    summary.className = 'settings-data-summary';
    summary.textContent = `${currentData.materias.length} matérias · ${currentData.temas.length} temas · ${currentData.assuntos.length} assuntos`;
    section.body.append(summary, button);
    return section.element;
  }

  function openDeleteDialog() {
    const data = store.getState().data;
    const dialog = createDeleteAllDataDialog(documentObject, {
      counts: {
        materias: data.materias.length,
        temas: data.temas.length,
        assuntos: data.assuntos.length,
      },
      overlayManager,
      onConfirm() {
        repository.clearData();
        store.updateState({ data: createEmptyData() });
        appShell.showToast({
          tone: 'success',
          title: 'Dados apagados',
          message: 'Matérias, temas e assuntos foram removidos. A aparência foi preservada.',
        });
        appShell.announce('Todos os dados acadêmicos foram apagados.');
        navigate('/', { replace: true });
      },
    });
    dialog.open();
  }

  function createAboutSection() {
    const section = createSettingsCard(documentObject, {
      icon: 'info',
      title: 'Sobre a aplicação',
      description: 'Informações da versão atual instalada neste navegador.',
    });
    const list = documentObject.createElement('dl');
    list.className = 'about-list';
    appendAboutItem(documentObject, list, 'Aplicação', APP_CONFIG.name);
    appendAboutItem(documentObject, list, 'Versão atual', APP_CONFIG.productVersion);
    appendAboutItem(documentObject, list, 'Autor', APP_CONFIG.author);
    appendAboutItem(documentObject, list, 'Armazenamento', 'LocalStorage');
    appendAboutItem(documentObject, list, 'Organização', 'Matéria → Tema → Assunto');
    section.body.append(list);
    return section.element;
  }
}

function createSettingsCard(
  documentObject,
  { icon, title, description, className = '', tone = '' },
) {
  const element = documentObject.createElement('section');
  const header = documentObject.createElement('header');
  const iconBox = documentObject.createElement('span');
  const heading = documentObject.createElement('div');
  const titleElement = documentObject.createElement('h2');
  const descriptionElement = documentObject.createElement('p');
  const body = documentObject.createElement('div');

  element.className = ['settings-card', className, tone ? `settings-card--${tone}` : '']
    .filter(Boolean)
    .join(' ');
  header.className = 'settings-card__header';
  iconBox.className = 'settings-card__icon';
  iconBox.append(createIcon(documentObject, icon, { size: 21 }));
  heading.className = 'settings-card__heading';
  titleElement.textContent = title;
  descriptionElement.textContent = description;
  heading.append(titleElement, descriptionElement);
  header.append(iconBox, heading);
  body.className = 'settings-card__body';
  element.append(header, body);
  return Object.freeze({ element, body });
}

function appendAboutItem(documentObject, list, label, value) {
  const group = documentObject.createElement('div');
  const term = documentObject.createElement('dt');
  const description = documentObject.createElement('dd');
  term.textContent = label;
  description.textContent = value;
  group.append(term, description);
  list.append(group);
}
