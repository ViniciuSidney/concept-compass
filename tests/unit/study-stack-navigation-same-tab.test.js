import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

async function read(relative) {
  return readFile(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
}

test('abertura do Study Stack permanece na mesma aba em todos os acessos do Assunto', async () => {
  const materiaPage = await read('../../src/features/materias/materia-page.js');
  const studyStatus = await read('../../src/features/materias/assunto-study-status.js');

  assert.doesNotMatch(
    materiaPage,
    /windowObject\.open\(destination,\s*['_"]_blank['_"]/, 
  );
  assert.match(materiaPage, /windowObject\.location\.assign\(destination\)/);

  assert.doesNotMatch(studyStatus, /studyStackLink\.target\s*=\s*['_"]_blank['_"]/);
  assert.doesNotMatch(studyStatus, /target\s*=\s*['_"]_blank['_"]/);
  assert.match(studyStatus, /href:\s*studyStackUrl/);
});
