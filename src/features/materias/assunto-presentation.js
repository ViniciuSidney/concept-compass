import { DIFFICULTIES, DIFFICULTY_LABELS, PROGRESS_STATUS_LABELS } from '../../domain/constants.js';
import {
  calculateAssuntoProgress,
  deriveProgressStatus,
} from '../../domain/services/progress-service.js';

const STATUS_TONES = Object.freeze({
  not_started: 'not-started',
  in_progress: 'studying',
  complete: 'consolidated',
});

const DIFFICULTY_TONES = Object.freeze({
  [DIFFICULTIES.NAO_DEFINIDA]: 'neutral',
  [DIFFICULTIES.FACIL]: 'success',
  [DIFFICULTIES.MEDIA]: 'warning',
  [DIFFICULTIES.DIFICIL]: 'danger',
});

export function getProgressPresentation(assunto) {
  const status = deriveProgressStatus(assunto);
  return Object.freeze({
    status,
    label: PROGRESS_STATUS_LABELS[status],
    tone: STATUS_TONES[status] ?? 'neutral',
    percentage: calculateAssuntoProgress(assunto),
    pointsLabel: `${assunto.pontosProgresso} de ${assunto.metaPontosProgresso} pontos`,
  });
}

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
