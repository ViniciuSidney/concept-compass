import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'tests/unit/tema-accordion-layout.test.js',
  'tests/manual/m8-1-1.md',
  'docs/validacao-m8-1-1.md',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ testes e documentação do M8.1.1 encontrados\n');

const temaSource = await readFile(new URL('src/features/materias/tema-accordion.js', root), 'utf8');
const menuSource = await readFile(new URL('src/ui/components/action-menu.js', root), 'utf8');
const dashboardSource = await readFile(
  new URL('src/features/dashboard/dashboard-page.js', root),
  'utf8',
);
const dashboardCss = await readFile(new URL('src/styles/pages/dashboard.css', root), 'utf8');

if (!temaSource.includes('tema-accordion__progress--header')) {
  throw new Error('O progresso do Tema não está conectado ao cabeçalho.');
}
if (!menuSource.includes('keepMenuInsideViewport') || !menuSource.includes('scrollBy')) {
  throw new Error('O menu de ações não possui ajuste automático de visibilidade.');
}
if (
  !dashboardSource.includes('dashboard-gallery__column') ||
  !dashboardCss.includes('.dashboard-gallery__column')
) {
  throw new Error('A Visão Geral não utiliza colunas independentes.');
}
process.stdout.write(
  '✓ progresso no cabeçalho, menus visíveis e galeria independente verificados\n',
);

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M8.1.1 verificado com sucesso.\n');
