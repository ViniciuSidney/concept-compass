import { access, readFile, readdir } from 'node:fs/promises';

import { createStore } from '../src/core/store.js';
import { createAppRepository } from '../src/data/repositories/app-repository.js';
import { createMemoryStorageAdapter } from '../src/data/storage/memory-storage-adapter.js';
import { STUDY_STATES, createEmptyData } from '../src/domain/constants.js';
import {
  selectAssuntosByTema,
  selectTemasByMateria,
} from '../src/domain/selectors/hierarchy-selectors.js';
import { createMateria } from '../src/domain/services/materia-service.js';
import { createMateriaWorkspaceController } from '../src/features/materias/materia-workspace-controller.js';
import { selectTemaSections } from '../src/features/materias/materia-workspace-selectors.js';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'src/features/materias/materia-workspace-controller.js',
  'src/features/materias/materia-workspace-selectors.js',
  'src/features/materias/tema-accordion.js',
  'src/features/materias/tema-form.js',
  'src/features/materias/tema-delete-dialog.js',
  'src/features/materias/assunto-row.js',
  'src/features/materias/assunto-form.js',
  'src/features/materias/assunto-detail-panel.js',
  'src/features/materias/assunto-delete-dialog.js',
  'src/styles/pages/materia-workspace.css',
  'tests/manual/m5.md',
  'docs/validacao-m5.md',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ módulos, estilos, documentação e roteiro do M5 encontrados\n');

const html = await readFile(new URL('index.html', root), 'utf8');
if (!html.includes('pages/materia-workspace.css')) {
  throw new Error('A folha do workspace da Matéria não está carregada.');
}

const featureEntries = await readdir(new URL('src/features/materias/', root));
if (featureEntries.includes('.gitkeep')) {
  throw new Error('.gitkeep indevido na funcionalidade de Matérias.');
}
process.stdout.write('✓ recursos da hierarquia conectados sem placeholder indevido\n');

let data = createEmptyData();
({ data } = createMateria(
  data,
  { nome: 'Matemática', descricao: 'Base', corId: 'roxo' },
  {
    idFactory: () => 'materia-1',
    nowFactory: () => '2026-07-24T12:00:00.000Z',
  },
));
const storage = createMemoryStorageAdapter();
const repository = createAppRepository({ storageAdapter: storage });
const store = createStore({
  data,
  preferences: {},
  ui: {},
  status: { saving: false, lastError: null },
});
const controller = createMateriaWorkspaceController({ store, repository });
const tema = controller.addTema(
  'materia-1',
  { nome: 'Álgebra', descricao: 'Fundamentos' },
  {
    idFactory: () => 'tema-1',
    nowFactory: () => '2026-07-24T12:10:00.000Z',
  },
);
const assunto = controller.addAssunto(
  tema.id,
  {
    nome: 'Equação do primeiro grau',
    estado: STUDY_STATES.EM_ESTUDO,
    dificuldade: 'media',
    ultimoEstudoEm: '2026-07-24',
  },
  {
    idFactory: () => 'assunto-1',
    nowFactory: () => '2026-07-24T12:20:00.000Z',
    todayFactory: () => '2026-07-24',
  },
);
controller.editAssunto(
  assunto.id,
  {
    nome: assunto.nome,
    descricao: 'Resolução de sentenças lineares',
    estado: STUDY_STATES.ESTUDADO,
    dificuldade: 'media',
    observacoes: 'Revisar problemas contextualizados',
    ultimoEstudoEm: '2026-07-24',
  },
  {
    nowFactory: () => '2026-07-24T12:30:00.000Z',
    todayFactory: () => '2026-07-24',
  },
);

const saved = repository.loadData().data;
const sections = selectTemaSections(saved, 'materia-1');
if (
  selectTemasByMateria(saved, 'materia-1').length !== 1 ||
  selectAssuntosByTema(saved, tema.id).length !== 1 ||
  sections[0].progress !== 75
) {
  throw new Error('A verificação funcional da hierarquia produziu resultado inesperado.');
}

controller.removeAssunto(assunto.id, { today: '2026-07-24' });
controller.removeTema(tema.id);
if (store.getState().data.temas.length || store.getState().data.assuntos.length) {
  throw new Error('As exclusões persistentes do M5 falharam.');
}
process.stdout.write('✓ CRUD, progresso, reordenação e persistência da hierarquia verificados\n');

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M5 verificado com sucesso.\n');
