import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'docs/release-v0.2.0.md',
  'docs/validacao-v0.2.0.md',
  'tests/manual/integracao-study-stack-final.md',
  'tests/unit/backup-service.test.js',
  'tests/unit/release-metadata.test.js',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ documentação e testes da identidade encontrados\n');

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const lock = JSON.parse(await readFile(new URL('package-lock.json', root), 'utf8'));
if (pkg.name !== 'organizador-de-conteudos') {
  throw new Error('O nome técnico do pacote não deve mudar nesta atualização.');
}
if (pkg.version !== '0.2.0' || lock.version !== '0.2.0') {
  throw new Error('Pacote e lockfile precisam usar a versão 0.2.0.');
}

const config = await readFile(new URL('src/core/config.js', root), 'utf8');
if (
  !config.includes("name: 'Concept Compass'") ||
  !config.includes("technicalId: 'organizador-de-conteudos'") ||
  !config.includes("legacyNames: Object.freeze(['Organizador de Conteúdos'])")
) {
  throw new Error('A configuração não separa corretamente marca atual e identidade técnica.');
}

const constants = await readFile(new URL('src/domain/constants.js', root), 'utf8');
for (const key of [
  'organizador-conteudos:data',
  'organizador-conteudos:preferences',
  'organizador-conteudos:ui',
]) {
  if (!constants.includes(key)) throw new Error(`A chave histórica ${key} foi alterada.`);
}
process.stdout.write('✓ identidade técnica e chaves históricas preservadas\n');

const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', root), 'utf8'));
const index = await readFile(new URL('index.html', root), 'utf8');
if (manifest.name !== 'Concept Compass' || manifest.short_name !== 'Compass') {
  throw new Error('O manifesto não usa a identidade Concept Compass.');
}
if (
  !index.includes('Visão Geral — Concept Compass') ||
  !index.includes('Carregando o Concept Compass')
) {
  throw new Error('O documento principal não usa a identidade Concept Compass.');
}

const backup = await readFile(new URL('src/data/backup/backup-service.js', root), 'utf8');
const recovery = await readFile(new URL('src/data/backup/recovery-download.js', root), 'utf8');
if (
  !backup.includes("BACKUP_FILE_PREFIX = 'concept-compass-backup'") ||
  !backup.includes('BACKUP_LEGACY_APP_NAMES') ||
  !backup.includes('BACKUP_ACCEPTED_APP_VERSIONS')
) {
  throw new Error('O backup não preserva marca atual e compatibilidade anterior.');
}
if (!recovery.includes('concept-compass-dados-preservados')) {
  throw new Error('O arquivo de recuperação não usa o novo prefixo.');
}
process.stdout.write('✓ identidade visual e compatibilidade de backups verificadas\n');

const readme = await readFile(new URL('README.md', root), 'utf8');
const changelog = await readFile(new URL('CHANGELOG.md', root), 'utf8');
if (!readme.startsWith('# Concept Compass') || !readme.includes('Compatibilidade da renomeação')) {
  throw new Error('O README não documenta corretamente a nova identidade.');
}
if (!changelog.includes('## [0.1.1] - 2026-07-30')) {
  throw new Error('O CHANGELOG não contém a atualização v0.1.1.');
}
if (!changelog.includes('## [0.2.0] - 2026-08-09')) {
  throw new Error('O CHANGELOG não contém a integração v0.2.0.');
}
process.stdout.write('✓ documentação atualizada para Concept Compass\n');
process.stdout.write('Identidade e release v0.2.0 verificadas com sucesso.\n');
