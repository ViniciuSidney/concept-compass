import { access, readFile, readdir } from 'node:fs/promises';

import { createEmptyData } from '../src/domain/constants.js';
import {
  SEARCH_TYPES,
  selectSearchCounts,
  selectSearchResults,
} from '../src/features/pesquisa/pesquisa-selectors.js';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'src/features/pesquisa/pesquisa-page.js',
  'src/features/pesquisa/pesquisa-result-card.js',
  'src/features/pesquisa/pesquisa-selectors.js',
  'src/styles/pages/pesquisa.css',
  'tests/unit/pesquisa-page.test.js',
  'tests/unit/pesquisa-selectors.test.js',
  'tests/manual/m7.md',
  'docs/validacao-m7.md',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ módulos, estilos, testes e roteiro do M7 encontrados\n');

const html = await readFile(new URL('index.html', root), 'utf8');
if (!html.includes('pages/pesquisa.css')) {
  throw new Error('A folha da Pesquisa Geral não está carregada.');
}

const entries = await readdir(new URL('src/features/pesquisa/', root));
if (entries.includes('.gitkeep')) {
  throw new Error('.gitkeep indevido na funcionalidade de Pesquisa.');
}
process.stdout.write('✓ Pesquisa Geral definitiva conectada sem placeholder indevido\n');

const created = '2026-07-25T12:00:00.000Z';
const data = {
  ...createEmptyData(),
  materias: [
    {
      id: 'materia-1',
      nome: 'Matemática',
      descricao: 'Ciências exatas',
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
      descricao: 'Expressões e equações',
      ordem: 0,
      criadoEm: created,
      atualizadoEm: created,
    },
  ],
  assuntos: [
    {
      id: 'assunto-1',
      temaId: 'tema-1',
      nome: 'Equação do primeiro grau',
      descricao: 'Resolução de problemas',
      estado: 'em_estudo',
      dificuldade: 'media',
      observacoes: 'Revisar operações inversas',
      ultimoEstudoEm: '2026-07-24',
      ordem: 0,
      criadoEm: created,
      atualizadoEm: created,
    },
  ],
};

const normalized = selectSearchResults(data, { query: 'ALGEBRA' });
const observation = selectSearchResults(data, {
  query: 'operacoes inversas',
  type: SEARCH_TYPES.ASSUNTO,
});
const counts = selectSearchCounts(data);

if (
  normalized[0]?.id !== 'tema-1' ||
  observation[0]?.href !== '#/materias/materia-1?tema=tema-1&assunto=assunto-1' ||
  counts[SEARCH_TYPES.ALL] !== 3
) {
  throw new Error('A verificação funcional da Pesquisa Geral produziu resultado inesperado.');
}
process.stdout.write('✓ normalização, filtros, contagens e navegação profunda verificados\n');

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M7 verificado com sucesso.\n');
