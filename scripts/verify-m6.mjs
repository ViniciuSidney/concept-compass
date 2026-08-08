import { access, readFile, readdir } from 'node:fs/promises';

import { DIFFICULTIES, createEmptyData } from '../src/domain/constants.js';
import {
  selectDashboardSummary,
  selectProgressDistribution,
  selectRecentStudies,
  selectStudyPriorities,
} from '../src/features/dashboard/dashboard-selectors.js';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'src/features/dashboard/dashboard-page.js',
  'src/features/dashboard/dashboard-selectors.js',
  'src/integrations/study-stack-subject-state.js',
  'src/styles/pages/dashboard.css',
  'tests/unit/dashboard-page.test.js',
  'tests/unit/dashboard-selectors.test.js',
  'tests/manual/m6.md',
  'docs/validacao-m6.md',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ módulos, estilos, testes e roteiro do M6 encontrados\n');

const html = await readFile(new URL('index.html', root), 'utf8');
if (!html.includes('pages/dashboard.css')) {
  throw new Error('A folha da Visão Geral não está carregada.');
}

const dashboardEntries = await readdir(new URL('src/features/dashboard/', root));
if (dashboardEntries.includes('.gitkeep')) {
  throw new Error('.gitkeep indevido na funcionalidade de Dashboard.');
}
process.stdout.write('✓ Dashboard definitivo conectado sem placeholder indevido\n');

const created = '2026-07-25T12:00:00.000Z';
const data = {
  ...createEmptyData(),
  materias: [
    {
      id: 'materia-1',
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
      id: 'tema-1',
      materiaId: 'materia-1',
      nome: 'Álgebra',
      descricao: '',
      ordem: 0,
      criadoEm: created,
      atualizadoEm: created,
    },
  ],
  assuntos: [
    {
      id: 'assunto-1',
      temaId: 'tema-1',
      nome: 'Equações',
      descricao: '',
      pontosProgresso: 5,
      metaPontosProgresso: 5,
      precisaReforco: false,
      dificuldade: DIFFICULTIES.DIFICIL,
      observacoes: '',
      ultimoEstudoEm: '2025-01-01',
      ordem: 0,
      criadoEm: created,
      atualizadoEm: created,
    },
    {
      id: 'assunto-2',
      temaId: 'tema-1',
      nome: 'Funções',
      descricao: '',
      pontosProgresso: 0,
      metaPontosProgresso: 5,
      precisaReforco: true,
      dificuldade: DIFFICULTIES.MEDIA,
      observacoes: '',
      ultimoEstudoEm: '2025-01-02',
      ordem: 1,
      criadoEm: created,
      atualizadoEm: created,
    },
  ],
};
const studyStackSnapshot = {
  status: 'ready',
  receivedContractVersion: '1.0.0',
  summary: {
    updatedAt: '2026-08-08T05:00:00.000Z',
    subjects: {
      'assunto-1': {
        subjectId: 'assunto-1',
        status: 'in_progress',
        progress: 4,
        maxProgress: 10,
        sourceArchived: false,
        consolidated: false,
        pendingErrors: 1,
        pendingReviews: 0,
        lastActivityAt: '2026-08-07T12:00:00.000Z',
      },
      'assunto-2': {
        subjectId: 'assunto-2',
        status: 'consolidated',
        progress: 10,
        maxProgress: 10,
        sourceArchived: false,
        consolidated: true,
        pendingErrors: 0,
        pendingReviews: 0,
        lastActivityAt: '2026-08-08T12:00:00.000Z',
      },
    },
  },
};

const summary = selectDashboardSummary(data, studyStackSnapshot);
const distribution = selectProgressDistribution(data, studyStackSnapshot);
const priorities = selectStudyPriorities(data, { studyStackSnapshot });
const recent = selectRecentStudies(data, { studyStackSnapshot });

if (
  summary.progress !== 70 ||
  summary.points !== 14 ||
  summary.pendenciasCount !== 1 ||
  distribution.find(({ status }) => status === 'consolidated')?.count !== 1 ||
  priorities[0]?.assunto.id !== 'assunto-1' ||
  recent[0]?.assunto.id !== 'assunto-2'
) {
  throw new Error(
    'A verificação funcional sincronizada dos indicadores do M6 produziu resultado inesperado.',
  );
}
process.stdout.write(
  '✓ progresso, distribuição, prioridades e estudos recentes do Study Stack verificados\n',
);

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M6 verificado com sucesso.\n');
