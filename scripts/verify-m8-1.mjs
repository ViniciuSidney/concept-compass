import { access, readFile } from 'node:fs/promises';

import { migrateData } from '../src/data/migrations/data-migrations.js';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'tests/unit/data-migrations.test.js',
  'tests/unit/legacy-progress-boundary.test.js',
  'tests/manual/m8-1.md',
  'tests/manual/integracao-study-stack-final.md',
  'docs/validacao-m8-1.md',
  'docs/integracao-study-stack.md',
  'docs/validacao-integracao-study-stack.md',
];

for (const item of requiredFiles) await access(new URL(item, root));
process.stdout.write('✓ migração, fronteiras, documentação e roteiros de integração encontrados\n');

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
  migrated.schemaVersion !== 3 ||
  'estado' in migrated.assuntos[0] ||
  'pontosProgresso' in migrated.assuntos[0] ||
  'metaPontosProgresso' in migrated.assuntos[0] ||
  'precisaReforco' in migrated.assuntos[0] ||
  'ultimoEstudoEm' in migrated.assuntos[0] ||
  migrated.assuntos[0]?.observacoes !== 'Preservar'
) {
  throw new Error('A compatibilidade histórica do M8.1 produziu resultado inesperado.');
}
process.stdout.write('✓ migrações v1/v2 chegam ao schema v3 sem reintroduzir progresso local\n');

const removedFiles = [
  'src/features/materias/assunto-progress-control.js',
  'src/features/materias/assunto-progress-dialog.js',
  'src/features/materias/assunto-progress-reset-dialog.js',
  'src/domain/services/progress-service.js',
  'src/ui/components/segmented-progress.js',
  'tests/unit/progress-and-ordering.test.js',
];

for (const relativePath of removedFiles) {
  try {
    await access(new URL(relativePath, root));
    throw new Error(`Artefato manual legado ainda existe: ${relativePath}`);
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
const constantsSource = await readFile(new URL('src/domain/constants.js', root), 'utf8');
const fieldsSource = await readFile(
  new URL('src/features/materias/entity-form-fields.js', root),
  'utf8',
);
const cssSources = await Promise.all([
  readFile(new URL('src/styles/base.css', root), 'utf8'),
  readFile(new URL('src/styles/pages/materia-workspace.css', root), 'utf8'),
]);
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
if (/PROGRESS_(?:POINTS|STATUSES|STATUS_VALUES|STATUS_LABELS)/.test(constantsSource)) {
  throw new Error('Constantes do progresso manual ainda existem no domínio atual.');
}
if (/create(?:Date|Number|Checkbox)Field/.test(fieldsSource)) {
  throw new Error('Helpers usados somente pelo acompanhamento manual ainda existem.');
}
if (
  /assunto-progress-control|progress-adjust-form|modal--progress-adjust|segmented-progress/.test(
    cssSources.join('\n'),
  )
) {
  throw new Error('CSS do acompanhamento manual ainda existe.');
}
if (
  !dashboardSource.includes('summarizeStudyStackProgress') ||
  !searchSource.includes('getAssuntoStudyPresentation')
) {
  throw new Error('Dashboard ou Pesquisa deixaram de usar o Study Stack como fonte de progresso.');
}

process.stdout.write(
  '✓ runtime, constantes, helpers, testes e CSS do progresso manual removidos; Study Stack segue como fonte exclusiva\n',
);

const readme = await readFile(new URL('README.md', root), 'utf8');
const manual = await readFile(new URL('docs/manual-do-usuario.md', root), 'utf8');
const integration = await readFile(new URL('docs/integracao-study-stack.md', root), 'utf8');
const validationDoc = await readFile(
  new URL('docs/validacao-integracao-study-stack.md', root),
  'utf8',
);
const backlog = await readFile(new URL('docs/backlog-v0.3.md', root), 'utf8');
const changelog = await readFile(new URL('CHANGELOG.md', root), 'utf8');
const currentDocs = `${readme}\n${manual}\n${integration}\n${validationDoc}\n${backlog}`;

for (const staleInstruction of [
  '**Retirar ponto**',
  '**Adicionar ponto**',
  '**Aumentar meta**',
  '**Ajustar progresso**',
  '**Concluir meta**',
  '**Reiniciar progresso**',
  'Ambas as ações abrem o Study Stack na mesma aba',
]) {
  if (
    currentDocs.toLocaleLowerCase('pt-BR').includes(staleInstruction.toLocaleLowerCase('pt-BR'))
  ) {
    throw new Error(`Documentação atual ainda contém instrução obsoleta: ${staleInstruction}`);
  }
}

for (const requiredText of [
  'fonte única',
  'schema v3',
  'nova aba',
  'study-stack:integration:progress:v1',
  'study-stack:integration:deletion-commands:v1',
  'http://localhost:4173/concept-compass/',
  'http://localhost:4173/study-stack/',
]) {
  if (!currentDocs.includes(requiredText)) {
    throw new Error(`Documentação atual não registra a regra obrigatória: ${requiredText}`);
  }
}

if (
  !changelog.includes('Study Stack passou a ser a **fonte única do progresso de estudo**') ||
  !changelog.includes('schema estrutural elevado para `v3`')
) {
  throw new Error('CHANGELOG não registra a arquitetura final da integração.');
}

process.stdout.write(
  '✓ documentação atual e changelog refletem a arquitetura final da integração\n',
);

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M8.1/integracao final verificado com sucesso.\n');
