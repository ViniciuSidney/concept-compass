import { access, readFile } from 'node:fs/promises';

import { migrateData } from '../src/data/migrations/data-migrations.js';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'tests/unit/data-migrations.test.js',
  'tests/manual/m8-1.md',
  'docs/validacao-m8-1.md',
];

for (const item of requiredFiles) await access(new URL(item, root));
process.stdout.write('✓ migração, testes e roteiro histórico do M8.1 encontrados\n');

const created = '2026-07-29T12:00:00.000Z';
const migrated = migrateData({
  schemaVersion: 1,
  materias: [
    {
      id: 'm1',
      nome: 'Matemática',
      descricao: '',
      corId: 'roxo',
      ordem: 0,
      criadoEm: created,
      atualizadoEm: created,
    },
  ],
  temas: [
    {
      id: 't1',
      materiaId: 'm1',
      nome: 'Álgebra',
      descricao: '',
      ordem: 0,
      criadoEm: created,
      atualizadoEm: created,
    },
  ],
  assuntos: [
    {
      id: 'a1',
      temaId: 't1',
      nome: 'Equação',
      descricao: '',
      estado: 'precisa_reforco',
      dificuldade: 'media',
      observacoes: 'Preservar',
      ultimoEstudoEm: '2026-07-29',
      ordem: 0,
      criadoEm: created,
      atualizadoEm: created,
    },
  ],
});

if (
  migrated.schemaVersion !== 2 ||
  migrated.assuntos[0]?.pontosProgresso !== 3 ||
  migrated.assuntos[0]?.metaPontosProgresso !== 5 ||
  migrated.assuntos[0]?.precisaReforco !== true ||
  'estado' in migrated.assuntos[0]
) {
  throw new Error('A compatibilidade histórica do M8.1 produziu resultado inesperado.');
}
process.stdout.write('✓ migração histórica continua preservada para backups anteriores\n');

const removedFiles = [
  'src/features/materias/assunto-progress-control.js',
  'src/features/materias/assunto-progress-dialog.js',
  'src/features/materias/assunto-progress-reset-dialog.js',
];

for (const relativePath of removedFiles) {
  try {
    await access(new URL(relativePath, root));
    throw new Error(`Módulo manual legado ainda existe: ${relativePath}`);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const pageSource = await readFile(new URL('src/features/materias/materia-page.js', root), 'utf8');
const controllerSource = await readFile(
  new URL('src/features/materias/materia-workspace-controller.js', root),
  'utf8',
);
const serviceSource = await readFile(
  new URL('src/domain/services/assunto-service.js', root),
  'utf8',
);
const dashboardSource = await readFile(
  new URL('src/features/dashboard/dashboard-selectors.js', root),
  'utf8',
);
const searchSource = await readFile(
  new URL('src/features/pesquisa/pesquisa-result-card.js', root),
  'utf8',
);

const forbidden = [
  'createAssuntoProgressDialog',
  'createAssuntoProgressResetDialog',
  'setAssuntoProgress',
  'changeAssuntoProgress',
  'increaseAssuntoProgressTotal',
  'completeAssuntoProgress',
  'resetAssuntoProgress',
];

if (forbidden.some((token) => pageSource.includes(token))) {
  throw new Error('A página da Matéria ainda referencia controles manuais de progresso.');
}
if (forbidden.some((token) => controllerSource.includes(token))) {
  throw new Error('O controller ainda expõe operações manuais de progresso.');
}
if (forbidden.some((token) => serviceSource.includes(token))) {
  throw new Error('O serviço de Assunto ainda expõe operações manuais de progresso.');
}
if (
  !dashboardSource.includes('summarizeStudyStackProgress') ||
  !searchSource.includes('getAssuntoStudyPresentation')
) {
  throw new Error('Dashboard ou Pesquisa deixaram de usar o Study Stack como fonte de progresso.');
}

process.stdout.write(
  '✓ controles manuais removidos e Study Stack mantido como fonte exclusiva da interface\n',
);

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M8.1 verificado com sucesso.\n');
