export function downloadTextFile(
  documentObject,
  windowObject,
  { content, fileName, mimeType = 'text/plain;charset=utf-8' },
) {
  const BlobConstructor = windowObject.Blob ?? globalThis.Blob;
  const urlApi = windowObject.URL ?? globalThis.URL;

  if (!BlobConstructor || typeof urlApi?.createObjectURL !== 'function') {
    throw new Error('Este navegador não permite gerar o arquivo para download.');
  }

  const blob = new BlobConstructor([content], { type: mimeType });
  const url = urlApi.createObjectURL(blob);
  const link = documentObject.createElement('a');

  link.href = url;
  link.download = fileName;
  link.hidden = true;
  documentObject.body.append(link);

  try {
    link.click();
  } finally {
    link.remove();
    windowObject.setTimeout?.(() => urlApi.revokeObjectURL(url), 0);
  }
}
