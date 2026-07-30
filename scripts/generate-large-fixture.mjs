import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { createBackupDocument, serializeBackup } from '../src/data/backup/backup-service.js';
import { createDefaultPreferences } from '../src/domain/constants.js';
import { createLargeData } from '../tests/fixtures/large-data-builder.js';

const outputPath = resolve(process.argv[2] ?? 'reports/massa-ampliada-v0.1.json');
const data = createLargeData();
const backup = createBackupDocument({
  data,
  preferences: createDefaultPreferences(),
  now: new Date('2026-07-30T12:00:00.000Z'),
  today: '2026-07-30',
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, serializeBackup(backup), 'utf8');

process.stdout.write(
  `Massa ampliada criada em ${outputPath}\n` +
    `${data.materias.length} matérias · ${data.temas.length} temas · ${data.assuntos.length} assuntos\n`,
);
