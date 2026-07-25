import assert from 'node:assert/strict';
import test from 'node:test';

import { DIFFICULTIES, STUDY_STATES } from '../../src/domain/constants.js';
import {
  formatLocalDate,
  getDifficultyPresentation,
  getStatePresentation,
} from '../../src/features/materias/assunto-presentation.js';

test('apresenta rótulos e tons oficiais de estado e dificuldade', () => {
  assert.deepEqual(getStatePresentation(STUDY_STATES.PRECISA_REFORCO), {
    label: 'Precisa de reforço',
    tone: 'reinforcement',
  });
  assert.deepEqual(getDifficultyPresentation(DIFFICULTIES.DIFICIL), {
    label: 'Difícil',
    tone: 'danger',
  });
});

test('formata data local sem deslocamento de fuso', () => {
  assert.equal(formatLocalDate('2026-07-24'), '24/07/2026');
  assert.equal(formatLocalDate(null), 'Não informado');
});
