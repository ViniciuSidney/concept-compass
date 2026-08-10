import assert from 'node:assert/strict';
import test from 'node:test';
import { access, readFile, readdir } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const legacyFields = ['pontosProgresso', 'metaPontosProgresso', 'precisaReforco', 'ultimoEstudoEm'];

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
    if (entry.isDirectory()) files.push(...(await collectJavaScriptFiles(url)));
    else if (entry.name.endsWith('.js')) files.push(url);
  }
  return files;
}

test('progresso legado fica confinado à migração histórica e não volta ao runtime', async () => {
  const srcFiles = await collectJavaScriptFiles(new URL('src/', root));
  const allowed = new URL('src/data/migrations/data-migrations.js', root).pathname;
  const violations = [];

  for (const fileUrl of srcFiles) {
    if (fileUrl.pathname === allowed) continue;
    const source = await readFile(fileUrl, 'utf8');
    const found = legacyFields.filter((field) => source.includes(field));
    if (found.length) violations.push(`${fileUrl.pathname}: ${found.join(', ')}`);
  }

  assert.deepEqual(violations, []);
  await assert.rejects(access(new URL('src/domain/services/progress-service.js', root)));
  await assert.rejects(access(new URL('src/ui/components/segmented-progress.js', root)));

  const constants = await readFile(new URL('src/domain/constants.js', root), 'utf8');
  assert.doesNotMatch(constants, /PROGRESS_(?:POINTS|STATUSES|STATUS_VALUES|STATUS_LABELS)/);

  const cssSources = await Promise.all([
    readFile(new URL('src/styles/base.css', root), 'utf8'),
    readFile(new URL('src/styles/pages/materia-workspace.css', root), 'utf8'),
  ]);
  assert.doesNotMatch(
    cssSources.join('\n'),
    /assunto-progress-control|progress-adjust-form|modal--progress-adjust|segmented-progress/,
  );
});

test('documentação atual não orienta o usuário a editar progresso local', async () => {
  const currentDocs = await Promise.all([
    readFile(new URL('README.md', root), 'utf8'),
    readFile(new URL('docs/manual-do-usuario.md', root), 'utf8'),
    readFile(new URL('docs/integracao-study-stack.md', root), 'utf8'),
    readFile(new URL('docs/backlog-v0.3.md', root), 'utf8'),
  ]);
  const source = currentDocs.join('\n');

  for (const staleInstruction of [
    '\\*\\*Retirar ponto\\*\\*',
    '\\*\\*Adicionar ponto\\*\\*',
    '\\*\\*Aumentar meta\\*\\*',
    '\\*\\*Ajustar progresso\\*\\*',
    '\\*\\*Concluir meta\\*\\*',
    '\\*\\*Reiniciar progresso\\*\\*',
    'Ambas as ações abrem o Study Stack na mesma aba',
  ]) {
    assert.doesNotMatch(source, new RegExp(staleInstruction, 'i'));
  }

  assert.match(source, /Study Stack.*fonte única|fonte única.*Study Stack/is);
  assert.match(source, /schema.*v3/is);
  assert.match(source, /nova aba/i);
});
