import { InvariantError } from '../../core/errors.js';
import { PROGRESS_STATUSES } from '../constants.js';
import {
  requireMateria,
  requireTema,
  selectAssuntosByMateria,
  selectAssuntosByTema,
} from '../selectors/hierarchy-selectors.js';

export function calculateAssuntoProgress(assunto) {
  validateProgressRecord(assunto);
  return (assunto.pontosProgresso / assunto.metaPontosProgresso) * 100;
}

export function deriveProgressStatus(assunto) {
  validateProgressRecord(assunto);
  if (assunto.pontosProgresso === 0) return PROGRESS_STATUSES.NOT_STARTED;
  if (assunto.pontosProgresso >= assunto.metaPontosProgresso) return PROGRESS_STATUSES.COMPLETE;
  return PROGRESS_STATUSES.IN_PROGRESS;
}

export function summarizeAssuntosProgress(assuntos) {
  if (assuntos.length === 0) return null;
  let points = 0;
  let total = 0;
  for (const assunto of assuntos) {
    validateProgressRecord(assunto);
    points += assunto.pontosProgresso;
    total += assunto.metaPontosProgresso;
  }
  if (total <= 0) return null;
  return Object.freeze({ points, total, percentage: (points / total) * 100 });
}

export function calculateAssuntosProgress(assuntos) {
  return summarizeAssuntosProgress(assuntos)?.percentage ?? null;
}

export function summarizeTemaProgress(data, temaId) {
  requireTema(data, temaId);
  return summarizeAssuntosProgress(selectAssuntosByTema(data, temaId));
}

export function summarizeMateriaProgress(data, materiaId) {
  requireMateria(data, materiaId);
  return summarizeAssuntosProgress(selectAssuntosByMateria(data, materiaId));
}

export function calculateTemaProgress(data, temaId) {
  return summarizeTemaProgress(data, temaId)?.percentage ?? null;
}

export function calculateMateriaProgress(data, materiaId) {
  return summarizeMateriaProgress(data, materiaId)?.percentage ?? null;
}

function validateProgressRecord(assunto) {
  if (
    !Number.isInteger(assunto?.pontosProgresso) ||
    !Number.isInteger(assunto?.metaPontosProgresso) ||
    assunto.metaPontosProgresso < 1 ||
    assunto.pontosProgresso < 0 ||
    assunto.pontosProgresso > assunto.metaPontosProgresso
  ) {
    throw new InvariantError('O assunto possui uma pontuação de progresso inválida.', {
      details: { assuntoId: assunto?.id ?? null },
    });
  }
}
