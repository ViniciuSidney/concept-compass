import { access, readFile, readdir } from 'node:fs/promises';

import { createStore } from '../src/core/store.js';
import { createAppRepository } from '../src/data/repositories/app-repository.js';
import { createMemoryStorageAdapter } from '../src/data/storage/memory-storage-adapter.js';
import { createEmptyData } from '../src/domain/constants.js';
import { createMateriasController } from '../src/features/materias/materias-controller.js';
import {
  MATERIAS_SORT_MODES,
  selectMateriaSummaries,
} from '../src/features/materias/materias-selectors.js';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'src/features/materias/materias-page.js',
  'src/features/materias/materia-page.js',
  'src/features/materias/materia-card.js',
  'src/features/materias/materia-icon.js',
  'src/features/materias/materia-form.js',
  'src/features/materias/materia-delete-dialog.js',
  'src/features/materias/materias-controller.js',
  'src/features/materias/materias-selectors.js',
  'src/styles/pages/materias.css',
  'tests/manual/m4.md',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ módulos, estilos e roteiro do M4 encontrados\n');

const html = await readFile(new URL('index.html', root), 'utf8');
if (!html.includes('pages/materias.css'))
  throw new Error('A folha de Matérias não está carregada.');

const featureEntries = await readdir(new URL('src/features/materias/', root));
if (featureEntries.includes('.gitkeep')) throw new Error('.gitkeep indevido em Matérias.');
process.stdout.write('✓ recursos da interface conectados sem placeholder indevido\n');

const storage = createMemoryStorageAdapter();
const repository = createAppRepository({ storageAdapter: storage });
const store = createStore({
  data: createEmptyData(),
  preferences: {},
  ui: {},
  status: { saving: false, lastError: null },
});
const controller = createMateriasController({ store, repository });
const ids = ['matematica', 'historia'];
const times = ['2026-07-24T12:00:00.000Z', '2026-07-24T13:00:00.000Z'];

controller.add(
  { nome: 'Matemática', descricao: 'Números e álgebra', corId: 'roxo' },
  { idFactory: () => ids.shift(), nowFactory: () => times.shift() },
);
controller.add(
  { nome: 'História', descricao: 'Brasil Colônia', corId: 'azul' },
  { idFactory: () => ids.shift(), nowFactory: () => times.shift() },
);
controller.reorder('historia', 0);
controller.edit(
  'matematica',
  { nome: 'Matemática Geral', descricao: 'Base numérica', corId: 'verde' },
  { nowFactory: () => '2026-07-24T14:00:00.000Z' },
);

const data = store.getState().data;
const search = selectMateriaSummaries(data, { query: 'matematica' });
const alphabetical = selectMateriaSummaries(data, { sortMode: MATERIAS_SORT_MODES.NAME });

if (
  data.materias[0].id !== 'historia' ||
  search.length !== 1 ||
  search[0].materia.nome !== 'Matemática Geral' ||
  alphabetical[0].materia.id !== 'historia'
) {
  throw new Error('A verificação funcional do M4 produziu um resultado inesperado.');
}

controller.remove('historia');
if (repository.loadData().data.materias.length !== 1) {
  throw new Error('A exclusão persistente do M4 falhou.');
}
process.stdout.write('✓ CRUD, pesquisa, ordenação, reordenação e persistência verificados\n');

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M4 verificado com sucesso.\n');
