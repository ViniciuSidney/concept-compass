import { execFile } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = new URL('../', import.meta.url);
const requiredFiles = [
  '.nojekyll',
  'CHANGELOG.md',
  'README.md',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'docs/backlog-v0.3.md',
  'docs/manual-do-usuario.md',
  'docs/publicacao-github-pages.md',
  'docs/release-v0.1.0.md',
  'docs/release-v0.2.0.md',
  'docs/validacao-v0.2.0.md',
  'docs/validacao-m11.md',
  'scripts/generate-large-fixture.mjs',
  'tests/fixtures/large-data-builder.js',
  'tests/manual/m11.md',
  'tests/unit/release-metadata.test.js',
  'tests/unit/release-performance.test.js',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ arquivos de release, documentação, ícones e testes encontrados\n');

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const lock = JSON.parse(await readFile(new URL('package-lock.json', root), 'utf8'));
if (pkg.version !== '0.2.0' || lock.version !== pkg.version) {
  throw new Error('A versão técnica precisa ser 0.2.0 e coincidir com o lockfile.');
}
if (Object.keys(pkg.dependencies ?? {}).length !== 0) {
  throw new Error('Uma dependência de execução foi adicionada à release.');
}
for (const script of [
  'verify:m11',
  'verify:branding',
  'verify:all',
  'release:check',
  'generate:large-fixture',
]) {
  if (!pkg.scripts?.[script]) throw new Error(`O script ${script} não foi registrado.`);
}
process.stdout.write(
  '✓ versão 0.2.0, scripts de release e zero dependências de execução verificados\n',
);

const config = await readFile(new URL('src/core/config.js', root), 'utf8');
if (!config.includes(`version: '${pkg.version}'`) || !config.includes('productVersion:')) {
  throw new Error('A configuração da aplicação não acompanha a versão técnica atual.');
}

const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', root), 'utf8'));
if (manifest.start_url !== './#/' || manifest.scope !== './' || manifest.lang !== 'pt-BR') {
  throw new Error('O manifesto não está preparado para publicação em subpasta.');
}
const expectedIcons = new Map([
  ['./assets/icons/icon-192.png', 192],
  ['./assets/icons/icon-512.png', 512],
]);
for (const [path, size] of expectedIcons) {
  const icon = manifest.icons?.find(
    (entry) => entry.src === path && entry.sizes === `${size}x${size}`,
  );
  if (!icon || icon.type !== 'image/png') {
    throw new Error(`O manifesto não referencia corretamente o ícone de ${size}px.`);
  }
  await assertPngDimensions(new URL(path.replace('./', ''), root), size, size);
}
await assertPngDimensions(new URL('assets/icons/apple-touch-icon.png', root), 180, 180);
process.stdout.write('✓ manifesto e ícones finais verificados\n');

const index = await readFile(new URL('index.html', root), 'utf8');
const main = await readFile(new URL('src/main.js', root), 'utf8');
const serviceWorker = await readFile(new URL('service-worker.js', root), 'utf8');
if (!index.includes('apple-touch-icon') || !index.includes('manifest.webmanifest')) {
  throw new Error('O documento principal não referencia os metadados finais de instalação.');
}
if (/serviceWorker\s*\.\s*register|navigator\s*\.\s*serviceWorker/.test(`${index}\n${main}`)) {
  throw new Error('O service worker foi registrado apesar da decisão oficial da release.');
}
if (!serviceWorker.includes('service worker não ativado')) {
  throw new Error('A decisão sobre cache offline não está registrada no arquivo reservado.');
}
process.stdout.write(
  '✓ identidade, instalação e decisão de não ativar cache offline verificadas\n',
);

const readme = await readFile(new URL('README.md', root), 'utf8');
const changelog = await readFile(new URL('CHANGELOG.md', root), 'utf8');
const releaseNotes = await readFile(new URL('docs/release-v0.2.0.md', root), 'utf8');
const backlog = await readFile(new URL('docs/backlog-v0.3.md', root), 'utf8');
if (!readme.includes('Concept Compass') || !readme.includes('release:check')) {
  throw new Error('O README não descreve corretamente a identidade e o portão da release.');
}
if (
  !changelog.includes('## [0.1.0] - 2026-07-30') ||
  !changelog.includes('## [0.1.1] - 2026-07-30')
) {
  throw new Error('O CHANGELOG não preserva a v0.1.0 e a atualização v0.1.1.');
}
if (!releaseNotes.includes('tag planejada: `v0.2.0`') || !backlog.includes('metacognitivos')) {
  throw new Error('As notas da release ou o backlog da v0.3 estão incompletos.');
}
process.stdout.write('✓ README, changelog, release e backlog coerentes com o produto\n');

const { stdout: trackedFiles } = await execFileAsync('git', ['ls-files'], {
  cwd: new URL('.', root),
  encoding: 'utf8',
});
const forbiddenTracked = trackedFiles
  .split(/\r?\n/)
  .filter(Boolean)
  .filter(
    (path) =>
      /(?:organizador-conteudos|concept-compass)-backup-.*\.json$/i.test(path) ||
      /\.real-data\.json$/i.test(path) ||
      path.startsWith('reports/'),
  );
if (forbiddenTracked.length) {
  throw new Error(
    `Arquivos de dados ou relatórios não devem ser versionados: ${forbiddenTracked.join(', ')}`,
  );
}
process.stdout.write('✓ nenhum backup real, massa gerada ou relatório foi incluído no Git\n');
process.stdout.write('M11 verificado com sucesso.\n');

async function assertPngDimensions(url, expectedWidth, expectedHeight) {
  const buffer = await readFile(url);
  const signature = buffer.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') throw new Error(`${url.pathname} não é um PNG válido.`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error(
      `${url.pathname} possui ${width}x${height}; esperado ${expectedWidth}x${expectedHeight}.`,
    );
  }
}
