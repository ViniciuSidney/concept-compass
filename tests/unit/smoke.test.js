import assert from 'node:assert/strict';
import test from 'node:test';

import { readFile } from 'node:fs/promises';

const packageUrl = new URL('../../package.json', import.meta.url);

test('o projeto não possui dependências de execução', async () => {
  const packageFile = JSON.parse(await readFile(packageUrl, 'utf8'));

  assert.deepEqual(packageFile.dependencies, {});
});

test('a versão técnica está preparada para a release v0.2.0', async () => {
  const packageFile = JSON.parse(await readFile(packageUrl, 'utf8'));

  assert.equal(packageFile.version, '0.2.0');
});
