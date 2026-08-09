import { DIFFICULTIES, DIFFICULTY_LABELS } from '../../domain/constants.js';

const DIFFICULTY_TONES = Object.freeze({
  [DIFFICULTIES.NAO_DEFINIDA]: 'neutral',
  [DIFFICULTIES.FACIL]: 'success',
  [DIFFICULTIES.MEDIA]: 'warning',
  [DIFFICULTIES.DIFICIL]: 'danger',
});

export function getDifficultyPresentation(difficulty) {
  return Object.freeze({
    label: DIFFICULTY_LABELS[difficulty] ?? 'Dificuldade desconhecida',
    tone: DIFFICULTY_TONES[difficulty] ?? 'neutral',
  });
}

export function formatLocalDate(value) {
  if (!value) return 'Não informado';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function formatIsoDate(value) {
  if (!value) return 'Não informado';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
