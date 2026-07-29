import { parseBackupText } from '../../data/backup/backup-service.js';
import { downloadRawRecoveryData } from '../../data/backup/recovery-download.js';
import { createButton } from '../../ui/components/button.js';
import { createPageHeader } from '../../ui/components/page-header.js';
import { createPersistentAlert } from '../../ui/components/persistent-alert.js';
import { createBackupImportDialog } from '../configuracoes/backup-import-dialog.js';
import { openBackupFilePicker } from '../configuracoes/backup-file-picker.js';

export function createRecuperacaoPage(documentObject, _route, context) {
  const { store, repository, themeController, appShell, overlayManager, windowObject, navigate } =
    context;
  const current = store.getState();
  const rawData = current.status.recoveryRawData;
  const page = documentObject.createElement('div');
  const header = createPageHeader(documentObject, {
    eyebrow: 'Proteção de dados',
    title: 'Recuperação de Dados',
    description:
      'A aplicação encontrou uma estrutura local inválida e interrompeu o carregamento para evitar perda silenciosa.',
  });

  page.className = 'recuperacao-page';
  page.append(header);

  if (!current.status.recovering || rawData === null) {
    page.append(
      createPersistentAlert(documentObject, {
        tone: 'info',
        title: 'Nenhuma recuperação necessária',
        message: 'Os dados locais estão válidos. Você pode voltar à Visão Geral normalmente.',
        actions: createButton(documentObject, {
          label: 'Voltar à Visão Geral',
          onClick: () => navigate('/', { replace: true }),
        }),
      }),
    );
    return page;
  }

  const actions = documentObject.createElement('div');
  const preserveButton = createButton(documentObject, {
    label: 'Salvar dados preservados',
    icon: 'download',
    variant: 'secondary',
    onClick: () => preserveRawData(),
  });
  const copyButton = createButton(documentObject, {
    label: 'Copiar dados brutos',
    icon: 'copy',
    variant: 'secondary',
    onClick: copyRawData,
  });
  const importButton = createButton(documentObject, {
    label: 'Importar backup válido',
    icon: 'upload',
    onClick: openImportPicker,
  });
  actions.className = 'recovery-actions';
  actions.append(preserveButton, copyButton, importButton);

  page.append(
    createPersistentAlert(documentObject, {
      tone: 'danger',
      title: 'Os dados não foram alterados',
      message: createRecoveryMessage(current.status.lastError),
    }),
    createRecoveryGuide(documentObject),
    actions,
    createRawPreview(documentObject, rawData),
  );

  return page;

  function preserveRawData({ rethrow = false } = {}) {
    try {
      const fileName = downloadRawRecoveryData(documentObject, windowObject, rawData);
      appShell.showToast({
        tone: 'success',
        title: 'Dados preservados',
        message: fileName,
      });
      appShell.announce('Cópia dos dados brutos salva com sucesso.');
    } catch (error) {
      presentError('Não foi possível salvar os dados brutos', error);
      if (rethrow) throw error;
      return null;
    }
  }

  async function copyRawData() {
    try {
      if (typeof windowObject.navigator?.clipboard?.writeText !== 'function') {
        throw new Error('A área de transferência não está disponível neste navegador.');
      }
      await windowObject.navigator.clipboard.writeText(rawData);
      appShell.showToast({
        tone: 'success',
        title: 'Dados copiados',
        message: 'Guarde o texto em um local seguro antes de tentar outra recuperação.',
      });
      appShell.announce('Dados brutos copiados para a área de transferência.');
    } catch (error) {
      presentError('Não foi possível copiar os dados', error);
    }
  }

  function openImportPicker() {
    openBackupFilePicker(documentObject, {
      async onFile({ text }) {
        const backup = parseBackupText(text);
        const dialog = createBackupImportDialog(documentObject, {
          backup,
          overlayManager,
          exportLabel: 'Salvar dados preservados',
          onExportCurrent: () => preserveRawData({ rethrow: true }),
          onConfirm: recoverFromBackup,
        });
        dialog.open();
      },
      onError(error) {
        presentError('Backup não importado', error);
      },
    });
  }

  function recoverFromBackup(backup) {
    const restored = repository.replaceSnapshot({
      data: backup.data,
      preferences: backup.preferences,
    });
    store.updateState((state) => ({
      data: restored.data,
      preferences: restored.preferences,
      status: {
        ...state.status,
        recovering: false,
        preferencesFallback: false,
        recoveryRawData: null,
        lastError: null,
      },
    }));
    themeController.setTheme(restored.preferences.theme);
    appShell.showToast({
      tone: 'success',
      title: 'Dados recuperados',
      message: 'O backup válido substituiu a estrutura corrompida.',
    });
    appShell.announce('Dados recuperados com sucesso.');
    navigate('/', { replace: true });
  }

  function presentError(title, error) {
    appShell.showToast({
      tone: 'danger',
      title,
      message: error?.message || 'A operação não pôde ser concluída.',
      duration: 0,
    });
  }
}

function createRecoveryGuide(documentObject) {
  const section = documentObject.createElement('section');
  const title = documentObject.createElement('h2');
  const list = documentObject.createElement('ol');
  section.className = 'recovery-guide settings-card';
  title.textContent = 'Como prosseguir com segurança';
  for (const text of [
    'Salve ou copie os dados brutos preservados.',
    'Selecione um backup JSON válido do Organizador de Conteúdos.',
    'Confira o resumo e confirme a substituição somente quando estiver seguro.',
  ]) {
    const item = documentObject.createElement('li');
    item.textContent = text;
    list.append(item);
  }
  section.append(title, list);
  return section;
}

function createRawPreview(documentObject, rawData) {
  const details = documentObject.createElement('details');
  const summary = documentObject.createElement('summary');
  const pre = documentObject.createElement('pre');
  details.className = 'recovery-raw-preview';
  summary.textContent = 'Visualizar dados brutos preservados';
  pre.textContent = rawData;
  details.append(summary, pre);
  return details;
}

function createRecoveryMessage(error) {
  if (error?.code === 'MIGRATION_ERROR') {
    return 'A versão dos dados locais não é compatível. O conteúdo original continua preservado e não foi substituído por uma estrutura vazia.';
  }
  if (error?.code === 'VALIDATION_ERROR') {
    return 'Foram encontradas informações inválidas ou relações quebradas. O conteúdo original continua preservado.';
  }
  return 'O conteúdo armazenado não pôde ser interpretado como uma estrutura válida. Nada foi apagado ou corrigido automaticamente.';
}
