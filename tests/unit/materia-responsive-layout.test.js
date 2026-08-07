import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('ações do Assunto usam trilho vertical compacto acima de 672px', async () => {
  const css = await readFile(
    new URL('../../src/styles/pages/materia-workspace.css', import.meta.url),
    'utf8',
  );

  assert.match(css, /min-width:\s*42\.0625rem/);
  assert.match(css, /grid-template-columns:\s*minmax\(0, 1fr\) minmax\(3rem, 10%\)/);
  assert.match(css, /\.assunto-row__actions[^}]*flex-direction:\s*column/s);
  assert.match(css, /\.assunto-row__reorder[^}]*flex-direction:\s*column/s);
});

test('ações do cabeçalho da Matéria não herdam base flexível como altura abaixo de 673px', async () => {
  const [workspace, responsive] = await Promise.all([
    readFile(new URL('../../src/styles/pages/materia-workspace.css', import.meta.url), 'utf8'),
    readFile(new URL('../../src/styles/responsive.css', import.meta.url), 'utf8'),
  ]);

  assert.match(
    workspace,
    /\.materia-page \.page-header__actions > \.button,[\s\S]*?flex:\s*0 0 auto/,
  );
  assert.match(
    responsive,
    /@media \(max-width:\s*34rem\)[\s\S]*?\.page-header__actions > \.button,[\s\S]*?flex:\s*0 0 auto/,
  );
});
