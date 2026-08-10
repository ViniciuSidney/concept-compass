import assert from 'node:assert/strict';
import test from 'node:test';

import { readFile } from 'node:fs/promises';

import { APP_CONFIG } from '../../src/core/config.js';

const root = new URL('../../', import.meta.url);

test('release usa versão técnica 0.2.0 e identidade Concept Compass', async () => {
  const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  const lock = JSON.parse(await readFile(new URL('package-lock.json', root), 'utf8'));

  assert.equal(pkg.version, '0.2.0');
  assert.equal(lock.version, '0.2.0');
  assert.equal(APP_CONFIG.name, 'Concept Compass');
  assert.equal(APP_CONFIG.version, '0.2.0');
  assert.equal(APP_CONFIG.productVersion, 'v0.2.0');
  assert.deepEqual(APP_CONFIG.legacyNames, ['Organizador de Conteúdos']);
});

test('manifesto final usa caminhos relativos e ícones oficiais', async () => {
  const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', root), 'utf8'));

  assert.equal(manifest.name, 'Concept Compass');
  assert.equal(manifest.short_name, 'Compass');
  assert.equal(manifest.start_url, './#/');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.lang, 'pt-BR');
  assert.deepEqual(
    manifest.icons.map(({ src, sizes, type }) => ({ src, sizes, type })),
    [
      { src: './assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: './assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  );
});

test('service worker permanece conscientemente sem registro na v0.2.0', async () => {
  const index = await readFile(new URL('index.html', root), 'utf8');
  const main = await readFile(new URL('src/main.js', root), 'utf8');
  const reserved = await readFile(new URL('service-worker.js', root), 'utf8');

  assert.doesNotMatch(`${index}\n${main}`, /serviceWorker\s*\.\s*register/);
  assert.match(reserved, /service worker não ativado/i);
});

test('identidade visual usa bússola oficial no favicon, PWA e barra lateral', async () => {
  const favicon = await readFile(new URL('favicon.svg', root), 'utf8');
  const appIcon = await readFile(new URL('assets/icons/app-icon.svg', root), 'utf8');
  const shell = await readFile(new URL('src/ui/components/app-shell.js', root), 'utf8');

  assert.match(favicon, /Bússola conectada a pontos de conhecimento/);
  assert.equal(favicon, appIcon);
  assert.match(shell, /assets\/icons\/app-icon\.svg/);
});
