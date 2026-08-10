import { access, readFile } from 'node:fs/promises';

import { createEmptyData } from '../src/domain/constants.js';
import { moveAssunto } from '../src/domain/services/assunto-service.js';
import { moveTema } from '../src/domain/services/tema-service.js';
import {
  selectAssuntoMoveDestinations,
  selectTemaMovePositions,
} from '../src/features/materias/structure-move-selectors.js';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'src/features/materias/structure-move-dialog.js',
  'src/features/materias/structure-move-selectors.js',
  'tests/integration/structure-movement-controller.test.js',
  'tests/unit/structure-move-dialog.test.js',
  'tests/unit/structure-move-selectors.test.js',
  'tests/manual/m8.md',
  'docs/validacao-m8.md',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ módulos, testes, documentação e roteiro do M8 encontrados\n');

const created = '2026-07-29T12:00:00.000Z';
const data = {
  ...createEmptyData(),
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
    {
      id: 'm2',
      nome: 'Física',
      descricao: '',
      corId: 'azul',
      ordem: 1,
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
    {
      id: 't2',
      materiaId: 'm2',
      nome: 'Mecânica',
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
      descricao: 'Conteúdo preservado',
      dificuldade: 'media',
      observacoes: 'Revisar',
      ordem: 0,
      criadoEm: created,
      atualizadoEm: created,
    },
  ],
};

const themePositions = selectTemaMovePositions(data, 't1', 'm2');
const destinations = selectAssuntoMoveDestinations(data, 'a1');
const themeMoved = moveTema(data, 't1', 'm2', {
  targetIndex: 0,
  nowFactory: () => '2026-07-29T13:00:00.000Z',
});
const subjectMoved = moveAssunto(data, 'a1', 't2', {
  targetIndex: 0,
  nowFactory: () => '2026-07-29T13:00:00.000Z',
  todayFactory: () => '2026-07-29',
});

if (
  themePositions.length !== 2 ||
  destinations[1]?.label !== 'Física › Mecânica' ||
  themeMoved.temas.find(({ id }) => id === 't1')?.materiaId !== 'm2' ||
  themeMoved.assuntos[0]?.temaId !== 't1' ||
  subjectMoved.assuntos[0]?.temaId !== 't2' ||
  subjectMoved.assuntos[0]?.descricao !== 'Conteúdo preservado'
) {
  throw new Error('A verificação funcional de movimentação produziu resultado inesperado.');
}
process.stdout.write('✓ destinos, posições, preservação e movimentações verificados\n');

const pageSource = await readFile(new URL('src/features/materias/materia-page.js', root), 'utf8');
const detailSource = await readFile(
  new URL('src/features/materias/assunto-detail-panel.js', root),
  'utf8',
);
if (
  !pageSource.includes('Mover tema') ||
  !pageSource.includes('Editar matéria') ||
  !detailSource.includes('Mover assunto')
) {
  throw new Error('As ações estruturais do M8 não estão conectadas à interface.');
}
process.stdout.write('✓ ações de workspace, Tema e Assunto conectadas\n');

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M8 verificado com sucesso.\n');
