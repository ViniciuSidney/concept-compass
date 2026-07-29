import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'src/data/backup/backup-service.js',
  'src/data/backup/backup-download.js',
  'src/data/backup/recovery-download.js',
  'src/features/configuracoes/backup-import-dialog.js',
  'src/features/configuracoes/delete-all-data-dialog.js',
  'src/features/configuracoes/configuracoes-page.js',
  'src/features/recuperacao/recuperacao-page.js',
  'src/styles/pages/configuracoes.css',
  'tests/unit/backup-service.test.js',
  'tests/unit/configuracoes-page.test.js',
  'tests/unit/recuperacao-page.test.js',
  'tests/manual/m9.md',
  'docs/validacao-m9.md',
];

for (const path of requiredFiles) await access(new URL(path, root));
process.stdout.write('✓ módulos, testes e documentação do M9 encontrados\n');

const index = await readFile(new URL('index.html', root), 'utf8');
const configSource = await readFile(
  new URL('src/features/configuracoes/configuracoes-page.js', root),
  'utf8',
);
const recoverySource = await readFile(
  new URL('src/features/recuperacao/recuperacao-page.js', root),
  'utf8',
);
const backupSource = await readFile(new URL('src/data/backup/backup-service.js', root), 'utf8');
const repositorySource = await readFile(
  new URL('src/data/repositories/app-repository.js', root),
  'utf8',
);

if (
  !index.includes('organizador-conteudos:preferences') ||
  !index.includes('prefers-color-scheme: dark') ||
  !index.includes('dataset.themeChoice')
) {
  throw new Error('A preferência de aparência não é aplicada cedo na inicialização.');
}
if (
  !configSource.includes('Restaurar aparência padrão') ||
  !configSource.includes('Exportar backup') ||
  !configSource.includes('Importar backup') ||
  !configSource.includes('Apagar todos os dados')
) {
  throw new Error('A página de Configurações não contém todas as áreas oficiais do M9.');
}
if (
  !backupSource.includes('BACKUP_FORMAT_VERSION') ||
  !backupSource.includes('parseBackupText') ||
  !repositorySource.includes('replaceSnapshot')
) {
  throw new Error('O fluxo validado e transacional de backup não está completo.');
}
if (
  !recoverySource.includes('Salvar dados preservados') ||
  !recoverySource.includes('Copiar dados brutos') ||
  !recoverySource.includes('Importar backup válido')
) {
  throw new Error('A tela de recuperação não oferece todas as ações de preservação.');
}
process.stdout.write('✓ aparência, backup transacional, exclusão e recuperação verificados\n');

const configOccurrences = configSource.match(/Restaurar aparência padrão/g) ?? [];
if (configOccurrences.length !== 1) {
  throw new Error('A ação Restaurar aparência padrão deve existir uma única vez.');
}
if (configSource.includes('versão mais recente') || configSource.includes('guia rápido')) {
  throw new Error('A seção Sobre contém afirmação não aprovada.');
}
process.stdout.write('✓ textos e limites oficiais de Configurações preservados\n');

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (Object.keys(pkg.dependencies ?? {}).length) {
  throw new Error('Uma dependência de execução foi adicionada.');
}
process.stdout.write('✓ zero dependências de execução preservadas\n');
process.stdout.write('M9 verificado com sucesso.\n');
