import {
  selectAssuntoById,
  selectAssuntosByTema,
  selectTemaById,
  selectTemasByMateria,
} from '../../domain/selectors/hierarchy-selectors.js';

export function selectTemaSections(data, materiaId) {
  return selectTemasByMateria(data, materiaId).map((tema, index, temas) =>
    Object.freeze({
      tema,
      assuntos: selectAssuntosByTema(data, tema.id),
      canMoveUp: index > 0,
      canMoveDown: index < temas.length - 1,
    }),
  );
}

export function selectTemaDeleteImpact(data, temaId) {
  const tema = selectTemaById(data, temaId);
  if (!tema) return null;
  return Object.freeze({ tema, assuntos: selectAssuntosByTema(data, temaId).length });
}

export function selectAssuntoDetails(data, assuntoId) {
  const assunto = selectAssuntoById(data, assuntoId);
  if (!assunto) return null;
  const tema = selectTemaById(data, assunto.temaId);
  return Object.freeze({ assunto, tema });
}
