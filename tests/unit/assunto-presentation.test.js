import assert from 'node:assert/strict';
import test from 'node:test';

import { DIFFICULTIES } from '../../src/domain/constants.js';
import {
  formatLocalDate,
  getDifficultyPresentation,
  getProgressPresentation,
} from '../../src/features/materias/assunto-presentation.js';
import { assunto } from '../fixtures/data-builders.js';

test('apresenta situação derivada, pontos e dificuldade', () => {
  assert.deepEqual(getProgressPresentation(assunto({ pontosProgresso: 3 })), {
    status: 'in_progress',
    label: 'Em andamento',
    tone: 'studying',
    percentage: 60,
    pointsLabel: '3 de 5 pontos',
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
