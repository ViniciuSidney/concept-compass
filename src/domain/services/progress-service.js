import { PROGRESS_WEIGHTS } from '../constants.js';
import {
  requireMateria,
  requireTema,
  selectAssuntosByMateria,
  selectAssuntosByTema,
} from '../selectors/hierarchy-selectors.js';
import { InvariantError } from '../../core/errors.js';

export function getStateWeight(state) {
  const weight = PROGRESS_WEIGHTS[state];

  if (weight === undefined) {
    throw new InvariantError('Não existe peso de progresso para o estado informado.', {
      details: { state },
    });
  }

  return weight;
}

export function calculateAssuntosProgress(assuntos) {
  if (assuntos.length === 0) {
    return null;
  }

  const total = assuntos.reduce((sum, assunto) => sum + getStateWeight(assunto.estado), 0);
  return total / assuntos.length;
}

export function calculateTemaProgress(data, temaId) {
  requireTema(data, temaId);
  return calculateAssuntosProgress(selectAssuntosByTema(data, temaId));
}

export function calculateMateriaProgress(data, materiaId) {
  requireMateria(data, materiaId);
  return calculateAssuntosProgress(selectAssuntosByMateria(data, materiaId));
}
