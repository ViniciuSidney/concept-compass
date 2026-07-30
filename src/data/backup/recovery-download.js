import { createLocalDate } from '../../utils/date.js';
import { downloadTextFile } from './file-download.js';

export function downloadRawRecoveryData(
  documentObject,
  windowObject,
  rawData,
  { now = new Date() } = {},
) {
  const fileName = `concept-compass-dados-preservados-${createLocalDate(now)}.txt`;
  downloadTextFile(documentObject, windowObject, {
    content: String(rawData ?? ''),
    fileName,
  });
  return fileName;
}
