const MAX_BACKUP_SIZE = 5 * 1024 * 1024;

export function openBackupFilePicker(documentObject, { onFile, onError }) {
  const input = documentObject.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.hidden = true;

  input.addEventListener('change', async () => {
    const file = input.files?.[0] ?? null;
    if (!file) {
      input.remove();
      return;
    }

    try {
      if (file.size > MAX_BACKUP_SIZE) {
        throw new Error('O arquivo ultrapassa o limite de 5 MB permitido para importação.');
      }
      const text = await file.text();
      await onFile({ file, text });
    } catch (error) {
      onError?.(error);
    } finally {
      input.remove();
    }
  });

  documentObject.body.append(input);
  input.click();
  return input;
}
