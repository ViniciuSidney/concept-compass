import { createAppRepository } from '../src/data/repositories/app-repository.js';
import { createMemoryStorageAdapter } from '../src/data/storage/memory-storage-adapter.js';
import { createEmptyData } from '../src/domain/constants.js';
import { createAssunto } from '../src/domain/services/assunto-service.js';
import { createMateria, deleteMateriaCascade } from '../src/domain/services/materia-service.js';
import { createTema } from '../src/domain/services/tema-service.js';

const generatedIds = ['materia-demo', 'tema-demo', 'assunto-a', 'assunto-b'];
const options = {
  idFactory: () => generatedIds.shift(),
  nowFactory: () => '2026-07-24T12:00:00.000Z',
  todayFactory: () => '2026-07-24',
};

let data = createEmptyData();
({ data } = createMateria(data, { nome: 'Matemática', corId: 'roxo' }, options));
({ data } = createTema(data, 'materia-demo', { nome: 'Álgebra' }, options));
({ data } = createAssunto(data, 'tema-demo', { nome: 'Equação' }, options));
({ data } = createAssunto(data, 'tema-demo', { nome: 'Inequação' }, options));

const storage = createMemoryStorageAdapter();
const repository = createAppRepository({ storageAdapter: storage });
repository.saveData(data, { today: '2026-07-24' });
const loaded = repository.loadData({ today: '2026-07-24' });
const removed = deleteMateriaCascade(loaded.data, 'materia-demo');

if (
  loaded.data.schemaVersion !== 3 ||
  loaded.data.assuntos.length !== 2 ||
  removed.data.materias.length !== 0 ||
  removed.removed.assuntos !== 2
) {
  throw new Error('A verificação integrada do M2 produziu um resultado inesperado.');
}

process.stdout.write(
  [
    'M2 verificado com sucesso.',
    'Schema estrutural v3: OK',
    'Persistência em memória: OK',
    'Exclusão em cascata: 1 matéria, 1 tema e 2 assuntos',
  ].join('\n') + '\n',
);
