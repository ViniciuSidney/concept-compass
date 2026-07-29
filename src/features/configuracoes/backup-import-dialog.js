import { createButton } from '../../ui/components/button.js';
import { createModal } from '../../ui/components/modal.js';
import { createBackupSummary } from '../../data/backup/backup-service.js';

const THEME_LABELS = Object.freeze({
  light: 'Claro',
  dark: 'Escuro',
  system: 'Seguir sistema',
});

export function createBackupImportDialog(
  documentObject,
  { backup, onConfirm, onExportCurrent, exportLabel = 'Exportar dados atuais', overlayManager },
) {
  const summary = createBackupSummary(backup);
  const content = documentObject.createElement('div');
  const warning = documentObject.createElement('p');
  const list = documentObject.createElement('dl');
  const error = documentObject.createElement('p');
  const footer = documentObject.createElement('div');
  const exportButton = createButton(documentObject, {
    label: exportLabel,
    icon: 'download',
    variant: 'secondary',
  });
  const cancelButton = createButton(documentObject, {
    label: 'Cancelar',
    variant: 'secondary',
  });
  const confirmButton = createButton(documentObject, {
    label: 'Substituir e importar',
    icon: 'upload',
  });
  const modalHolder = { current: null };

  content.className = 'backup-import-summary';
  warning.className = 'backup-import-summary__warning';
  warning.textContent =
    'A importação substituirá todas as matérias, temas, assuntos e preferências atuais.';
  list.className = 'backup-summary-list';
  appendSummaryItem(documentObject, list, 'Exportado em', formatDateTime(summary.exportedAt));
  appendSummaryItem(documentObject, list, 'Versão', summary.appVersion);
  appendSummaryItem(documentObject, list, 'Matérias', summary.materias);
  appendSummaryItem(documentObject, list, 'Temas', summary.temas);
  appendSummaryItem(documentObject, list, 'Assuntos', summary.assuntos);
  appendSummaryItem(
    documentObject,
    list,
    'Aparência',
    THEME_LABELS[summary.theme] ?? summary.theme,
  );
  error.className = 'form-general-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  content.append(warning, list, error);

  footer.className = 'overlay-actions backup-import-actions';
  footer.append(exportButton, cancelButton, confirmButton);

  const modal = createModal(documentObject, {
    title: 'Revisar importação',
    description: 'O arquivo foi validado. Confira o resumo antes de continuar.',
    content,
    footer,
    modalClassName: 'modal--backup-import',
    overlayManager,
    closeOnBackdrop: false,
    onClose() {
      globalThis.queueMicrotask(() => modalHolder.current?.destroy());
    },
  });
  modalHolder.current = modal;

  exportButton.addEventListener('click', () => {
    try {
      onExportCurrent();
    } catch (caughtError) {
      showError(caughtError);
    }
  });
  cancelButton.addEventListener('click', () => modal.close('cancel'));
  confirmButton.addEventListener('click', async () => {
    setBusy(true);
    error.hidden = true;
    error.textContent = '';
    try {
      await onConfirm(backup);
      modal.close('imported');
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setBusy(false);
    }
  });

  function setBusy(busy) {
    exportButton.disabled = busy;
    cancelButton.disabled = busy;
    confirmButton.disabled = busy;
    confirmButton.setAttribute('aria-busy', String(busy));
  }

  function showError(caughtError) {
    error.textContent = caughtError?.message || 'Não foi possível concluir a importação.';
    error.hidden = false;
  }

  return Object.freeze({
    open: modal.open,
    close: modal.close,
    element: modal.element,
  });
}

function appendSummaryItem(documentObject, list, label, value) {
  const group = documentObject.createElement('div');
  const term = documentObject.createElement('dt');
  const description = documentObject.createElement('dd');
  term.textContent = label;
  description.textContent = String(value);
  group.append(term, description);
  list.append(group);
}

function formatDateTime(value) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}
