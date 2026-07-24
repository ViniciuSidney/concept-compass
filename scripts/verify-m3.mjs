import { access, readFile, readdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const modules = [
  'src/ui/components/button.js',
  'src/ui/components/icon-button.js',
  'src/ui/components/search-field.js',
  'src/ui/components/filter-chip.js',
  'src/ui/components/badge.js',
  'src/ui/components/progress-bar.js',
  'src/ui/components/action-menu.js',
  'src/ui/components/modal.js',
  'src/ui/components/side-panel.js',
  'src/ui/components/toast.js',
  'src/ui/components/persistent-alert.js',
  'src/ui/components/page-header.js',
  'src/ui/components/breadcrumb.js',
  'src/ui/states/empty-state.js',
  'src/ui/states/loading-state.js',
  'src/ui/states/error-state.js',
  'src/ui/theme/theme-controller.js',
];
for (const path of modules) await access(new URL(path, root));
process.stdout.write('✓ componentes e controlador de tema encontrados\n');
const html = await readFile(new URL('index.html', root), 'utf8');
for (const css of [
  'controls.css',
  'content.css',
  'feedback.css',
  'overlays.css',
  'm3-showcase.css',
])
  if (!html.includes(css)) throw new Error(`Folha ausente: ${css}`);
process.stdout.write('✓ folhas de estilo do M3 carregadas\n');
for (const directory of [
  'src/styles/components',
  'src/styles/pages',
  'src/ui/icons',
  'src/ui/overlays',
])
  if ((await readdir(new URL(`${directory}/`, root))).includes('.gitkeep'))
    throw new Error(`.gitkeep indevido em ${directory}`);
process.stdout.write('✓ pastas preenchidas sem .gitkeep\n');
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length)
  throw new Error('Dependência de execução adicionada');
process.stdout.write('✓ zero dependências de execução preservadas\n');
