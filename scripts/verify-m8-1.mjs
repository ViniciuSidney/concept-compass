import { access, readFile } from 'node:fs/promises';

import { migrateData } from '../src/data/migrations/data-migrations.js';
import { PROGRESS_STATUSES, createEmptyData } from '../src/domain/constants.js';
import {
  changeAssuntoProgress,
  completeAssuntoProgress,
  increaseAssuntoProgressTotal,
  resetAssuntoProgress,
  createAssunto,
} from '../src/domain/services/assunto-service.js';
import {
  deriveProgressStatus,
  summarizeAssuntosProgress,
} from '../src/domain/services/progress-service.js';
import { createMateria } from '../src/domain/services/materia-service.js';
import { createTema } from '../src/domain/services/tema-service.js';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'src/ui/components/segmented-progress.js',
  'src/features/materias/assunto-progress-control.js',
  'src/features/materias/assunto-progress-dialog.js',
  'src/features/materias/assunto-progress-reset-dialog.js',
  'tests/unit/data-migrations.test.js',
  'tests/manual/m8-1.md',
  'docs/validacao-m8-1.md',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ componentes, migração, testes e roteiro do M8.1 encontrados\n');

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
  throw new Error('A migração dos estados antigos para pontos produziu resultado inesperado.');
}
process.stdout.write('✓ migração v1 → v2 preserva dados e converte os estados oficiais\n');

const ids = ['m1', 't1', 'a1', 'a2'];
const options = {
  idFactory: () => ids.shift(),
  nowFactory: () => created,
  todayFactory: () => '2026-07-29',
};
let data = createEmptyData();
({ data } = createMateria(data, { nome: 'Matemática', corId: 'roxo' }, options));
({ data } = createTema(data, 'm1', { nome: 'Álgebra' }, options));
({ data } = createAssunto(
  data,
  't1',
  { nome: 'Equação', pontosProgresso: 3, metaPontosProgresso: 5 },
  options,
));
({ data } = createAssunto(
  data,
  't1',
  { nome: 'Funções', pontosProgresso: 2, metaPontosProgresso: 10 },
  options,
));

const summary = summarizeAssuntosProgress(data.assuntos);
let updated = changeAssuntoProgress(data, 'a1', 1, options).data;
updated = increaseAssuntoProgressTotal(updated, 'a1', options).data;
updated = completeAssuntoProgress(updated, 'a1', options).data;
const completed = updated.assuntos.find(({ id }) => id === 'a1');
updated = resetAssuntoProgress(updated, 'a1', options).data;
const reset = updated.assuntos.find(({ id }) => id === 'a1');

if (
  summary?.points !== 5 ||
  summary?.total !== 15 ||
  completed?.pontosProgresso !== 6 ||
  deriveProgressStatus(completed) !== PROGRESS_STATUSES.COMPLETE ||
  reset?.pontosProgresso !== 0 ||
  reset?.metaPontosProgresso !== 6
) {
  throw new Error('As operações e a agregação de pontos produziram resultado inesperado.');
}
process.stdout.write(
  '✓ soma ponderada, controles rápidos, conclusão e reinício legados verificados\n',
);

const pageSource = await readFile(new URL('src/features/materias/materia-page.js', root), 'utf8');
const dashboardSource = await readFile(
  new URL('src/features/dashboard/dashboard-selectors.js', root),
  'utf8',
);
const searchSource = await readFile(
  new URL('src/features/pesquisa/pesquisa-result-card.js', root),
  'utf8',
);
if (
  !pageSource.includes('Desfazer') ||
  !pageSource.includes('createAssuntoProgressResetDialog') ||
  !dashboardSource.includes('summarizeStudyStackProgress') ||
  !searchSource.includes('getAssuntoStudyPresentation')
) {
  throw new Error(
    'O legado do M8.1 ou a substituição do Dashboard/Pesquisa pelo Study Stack não estão preservados como esperado.',
  );
}
process.stdout.write(
  '✓ legado interno preservado e Dashboard/Pesquisa migrados para o Study Stack verificados\n',
);

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M8.1 verificado com sucesso.\n');
