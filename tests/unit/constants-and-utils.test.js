import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PROGRESS_WEIGHTS,
  STUDY_STATES,
  createDefaultPreferences,
  createEmptyData,
} from '../../src/domain/constants.js';
import { createLocalDate } from '../../src/utils/date.js';
import { createId } from '../../src/utils/id.js';
import { normalizeSearchText, normalizeWhitespace } from '../../src/utils/text.js';

test('estrutura vazia e preferências padrão retornam novas instâncias', () => {
  const firstData = createEmptyData();
  const secondData = createEmptyData();
  const firstPreferences = createDefaultPreferences();

  firstData.materias.push({});

  assert.equal(secondData.materias.length, 0);
  assert.equal(firstPreferences.theme, 'system');
  assert.equal(firstPreferences.viewMode, 'cards');
});

test('pesos de progresso seguem a decisão oficial', () => {
  assert.deepEqual(PROGRESS_WEIGHTS, {
    [STUDY_STATES.NAO_INICIADO]: 0,
    [STUDY_STATES.EM_ESTUDO]: 25,
    [STUDY_STATES.PRECISA_REFORCO]: 50,
    [STUDY_STATES.ESTUDADO]: 75,
    [STUDY_STATES.CONSOLIDADO]: 100,
  });
});

test('data local não depende de corte de ISO UTC', () => {
  assert.equal(createLocalDate(new Date(2026, 6, 24, 23, 59)), '2026-07-24');
});

test('UUID usa alternativa segura baseada em getRandomValues', () => {
  const bytes = Uint8Array.from({ length: 16 }, (_, index) => index);
  const id = createId({ getRandomValues: (target) => (target.set(bytes), target) });

  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('UUID falha quando não existe fonte segura', () => {
  assert.throws(() => createId({}), /fonte segura/i);
});

test('normalização de texto remove excesso de espaço, caixa e acentos', () => {
  assert.equal(normalizeWhitespace('  Razão   e proporção  '), 'Razão e proporção');
  assert.equal(normalizeSearchText('  RAZÃO   e Proporção  '), 'razao e proporcao');
});
