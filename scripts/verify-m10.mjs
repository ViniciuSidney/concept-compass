import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'src/ui/accessibility/background-interaction.js',
  'src/ui/components/action-menu.js',
  'src/ui/components/app-shell.js',
  'src/ui/components/modal.js',
  'src/ui/components/side-panel.js',
  'src/styles/responsive.css',
  'src/styles/themes.css',
  'src/styles/tokens.css',
  'tests/unit/m10-accessibility.test.js',
  'tests/manual/m10.md',
  'docs/validacao-m10.md',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ módulos, testes e documentação do M10 encontrados\n');

const responsive = await readFile(new URL('src/styles/responsive.css', root), 'utf8');
const themes = await readFile(new URL('src/styles/themes.css', root), 'utf8');
const tokens = await readFile(new URL('src/styles/tokens.css', root), 'utf8');
const appShell = await readFile(new URL('src/ui/components/app-shell.js', root), 'utf8');
const actionMenu = await readFile(new URL('src/ui/components/action-menu.js', root), 'utf8');
const background = await readFile(
  new URL('src/ui/accessibility/background-interaction.js', root),
  'utf8',
);

const requiredResponsiveSignals = [
  '@media (max-width: 76rem)',
  '@media (max-width: 54rem)',
  '@media (max-width: 34rem)',
  '100dvh',
  'var(--safe-area-bottom)',
  '.modal--assunto-form',
  '.side-panel',
];
for (const signal of requiredResponsiveSignals) {
  if (!responsive.includes(signal)) {
    throw new Error(`A revisão responsiva não contém o requisito: ${signal}`);
  }
}
process.stdout.write('✓ breakpoints, áreas seguras e sobreposições responsivas verificados\n');

if (
  !themes.includes("data-resolved-theme='dark'") ||
  !themes.includes('box-shadow: none') ||
  !tokens.includes('--color-accent-green') ||
  !tokens.includes('--touch-target-min')
) {
  throw new Error('O tema escuro e os tokens semânticos do M10 estão incompletos.');
}
process.stdout.write('✓ tema escuro semântico, contraste e alvos de toque verificados\n');

if (
  !appShell.includes('sidebar.inert') ||
  !appShell.includes('content.inert') ||
  !appShell.includes('createFocusTrap') ||
  !background.includes('setOverlayInteractionState') ||
  !actionMenu.includes("event.key === 'ArrowDown'") ||
  !actionMenu.includes("event.key === 'Escape'")
) {
  throw new Error('Os fluxos essenciais de foco, isolamento e teclado estão incompletos.');
}
process.stdout.write('✓ foco, navegação móvel, menus e isolamento de sobreposições verificados\n');

const index = await readFile(new URL('index.html', root), 'utf8');
if (
  !index.includes('skip-link') ||
  !index.includes('dataset.resolvedTheme') ||
  !index.includes('viewport')
) {
  throw new Error('A inicialização acessível e responsiva não está completa.');
}

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
if (!pkg.scripts?.['verify:m10']) {
  throw new Error('O comando verify:m10 não foi registrado.');
}
process.stdout.write('✓ inicialização, scripts e zero dependências de execução preservados\n');
process.stdout.write('M10 verificado com sucesso.\n');
