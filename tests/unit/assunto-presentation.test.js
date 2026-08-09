import assert from 'node:assert/strict';
import test from 'node:test';

import { DIFFICULTIES } from '../../src/domain/constants.js';
import {
  formatLocalDate,
  getDifficultyPresentation,
} from '../../src/features/materias/assunto-presentation.js';

test('apresenta dificuldade sem calcular progresso local', () => {
  assert.deepEqual(getDifficultyPresentation(DIFFICULTIES.DIFICIL), {
    label: 'Difícil',
    tone: 'danger',
  });
});

test('formata data local sem deslocamento de fuso', () => {
  assert.equal(formatLocalDate('2026-07-24'), '24/07/2026');
  assert.equal(formatLocalDate(null), 'Não informado');
});
