import { createBackupDocument, createBackupFileName, serializeBackup } from './backup-service.js';
import { downloadTextFile } from './file-download.js';

export function downloadBackup(documentObject, windowObject, snapshot, { now = new Date() } = {}) {
  const backup = createBackupDocument({ ...snapshot, now });
  const fileName = createBackupFileName(now);
  downloadTextFile(documentObject, windowObject, {
    content: serializeBackup(backup),
    fileName,
    mimeType: 'application/json;charset=utf-8',
  });
  return Object.freeze({ backup, fileName });
}
