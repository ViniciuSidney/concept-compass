import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createConceptCompassReturnUrl,
  createStudyStackSubjectContext,
  createStudyStackUrl,
} from '../../src/integrations/study-stack-link.js';
import { assunto, materia, tema } from '../fixtures/data-builders.js';

const SENT_AT = '2026-08-06T22:45:00.000Z';
const LOCATION = {
  href: 'https://viniciusidney.github.io/concept-compass/#/materias/materia-1',
};

test('cria retorno para a Matéria, Tema e Assunto exatos do Concept Compass', () => {
  const returnUrl = createConceptCompassReturnUrl({
    location: LOCATION,
    materiaId: 'materia-1',
    temaId: 'tema-1',
    assuntoId: 'assunto-1',
  });

  assert.equal(
    returnUrl,
    'https://viniciusidney.github.io/concept-compass/#/materias/materia-1?tema=tema-1&assunto=assunto-1',
  );
});

test('monta contrato 1.0.0 aceito pelo Study Stack', () => {
  const context = createStudyStackSubjectContext({
    materia: materia(),
    tema: tema(),
    assunto: assunto(),
    returnUrl: 'https://example.test/#/retorno',
    sentAt: SENT_AT,
  });

  assert.deepEqual(context, {
    contractVersion: '1.0.0',
    sentAt: SENT_AT,
    sourceApp: 'concept_compass',
    subject: {
      matterId: 'materia-1',
      matterName: 'Matemática',
      themeId: 'tema-1',
      themeName: 'Álgebra',
      subjectId: 'assunto-1',
      subjectName: 'Equação do primeiro grau',
    },
    sourceArchived: false,
    returnUrl: 'https://example.test/#/retorno',
    navigationContext: {
      route: 'materia',
      materiaId: 'materia-1',
      temaId: 'tema-1',
      assuntoId: 'assunto-1',
    },
  });
});

test('gera URL pública com envelope antes da rota hash do Study Stack', () => {
  const result = createStudyStackUrl({
    materia: materia(),
    tema: tema(),
    assunto: assunto(),
    location: LOCATION,
    sentAt: SENT_AT,
  });
  const url = new URL(result);
  const context = JSON.parse(url.searchParams.get('subjectContext'));

  assert.equal(url.origin, 'https://viniciusidney.github.io');
  assert.equal(url.pathname, '/study-stack/');
  assert.equal(url.hash, '#/overview');
  assert.equal(context.subject.subjectId, 'assunto-1');
  assert.match(context.returnUrl, /tema=tema-1&assunto=assunto-1$/);
});

test('contrato informa quando o Assunto está arquivado no Concept Compass', () => {
  const context = createStudyStackSubjectContext({
    materia: materia(),
    tema: tema(),
    assunto: assunto({ arquivado: true }),
    returnUrl: 'https://example.test/#/retorno',
    sentAt: SENT_AT,
  });

  assert.equal(context.sourceArchived, true);
  assert.equal(context.subject.subjectId, 'assunto-1');
});

test('contrato considera Tema ou Matéria arquivados como origem arquivada', () => {
  const byTema = createStudyStackSubjectContext({
    materia: materia(),
    tema: tema({ arquivado: true }),
    assunto: assunto(),
    returnUrl: 'https://example.test/#/retorno',
    sentAt: SENT_AT,
  });
  const byMateria = createStudyStackSubjectContext({
    materia: materia({ arquivado: true }),
    tema: tema(),
    assunto: assunto(),
    returnUrl: 'https://example.test/#/retorno',
    sentAt: SENT_AT,
  });

  assert.equal(byTema.sourceArchived, true);
  assert.equal(byMateria.sourceArchived, true);
});
