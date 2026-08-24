import test from 'node:test';
import assert from 'node:assert/strict';

import { APP_CONFIG } from '../../src/core/config.js';
import { createStudyStackUrl } from '../../src/integrations/study-stack-link.js';

const materia = Object.freeze({ id: 'materia-1', nome: 'Língua Portuguesa' });
const tema = Object.freeze({ id: 'tema-1', nome: 'Gramática' });
const assunto = Object.freeze({ id: 'assunto-1', nome: 'Crase' });

function createUrl(location, destinationUrl) {
  return new URL(
    createStudyStackUrl({
      materia,
      tema,
      assunto,
      location,
      sentAt: '2026-08-24T12:00:00.000Z',
      destinationUrl,
    }),
  );
}

test('Concept Compass local abre o Study Stack na mesma origem', () => {
  const url = createUrl(
    'http://localhost:4173/concept-compass/#/materias/materia-1?tema=tema-1&assunto=assunto-1',
  );

  assert.equal(url.origin, 'http://localhost:4173');
  assert.equal(url.pathname, '/study-stack/');
  assert.equal(url.hash, '#/overview');

  const context = JSON.parse(url.searchParams.get('subjectContext'));
  assert.equal(context.returnUrl.startsWith('http://localhost:4173/concept-compass/'), true);
  assert.equal(context.subject.subjectId, 'assunto-1');
});

test('127.0.0.1 local preserva host, porta e mesma origem', () => {
  const url = createUrl('http://127.0.0.1:4173/concept-compass/#/');

  assert.equal(url.origin, 'http://127.0.0.1:4173');
  assert.equal(url.pathname, '/study-stack/');
});

test('Concept Compass publicado continua abrindo o Study Stack do GitHub Pages', () => {
  const url = createUrl('https://viniciusidney.github.io/concept-compass/#/');
  const configured = new URL(APP_CONFIG.integrations.studyStack.url);

  assert.equal(url.origin, configured.origin);
  assert.equal(url.pathname, configured.pathname);
});

test('destinationUrl explícito continua tendo prioridade', () => {
  const url = createUrl(
    'http://localhost:4173/concept-compass/#/',
    'http://localhost:9999/study-stack-test/',
  );

  assert.equal(url.origin, 'http://localhost:9999');
  assert.equal(url.pathname, '/study-stack-test/');
});
