import { NotFoundError } from '../../core/errors.js';

function byOrder(left, right) {
  return left.ordem - right.ordem;
}

export function selectMateriaById(data, materiaId) {
  return data.materias.find(({ id }) => id === materiaId) ?? null;
}

export function selectTemaById(data, temaId) {
  return data.temas.find(({ id }) => id === temaId) ?? null;
}

export function selectAssuntoById(data, assuntoId) {
  return data.assuntos.find(({ id }) => id === assuntoId) ?? null;
}

export function requireMateria(data, materiaId) {
  const materia = selectMateriaById(data, materiaId);
  if (!materia) throw new NotFoundError('Matéria', materiaId);
  return materia;
}

export function requireTema(data, temaId) {
  const tema = selectTemaById(data, temaId);
  if (!tema) throw new NotFoundError('Tema', temaId);
  return tema;
}

export function requireAssunto(data, assuntoId) {
  const assunto = selectAssuntoById(data, assuntoId);
  if (!assunto) throw new NotFoundError('Assunto', assuntoId);
  return assunto;
}

export function selectTemasByMateria(data, materiaId) {
  return data.temas.filter((tema) => tema.materiaId === materiaId).toSorted(byOrder);
}

export function selectAssuntosByTema(data, temaId) {
  return data.assuntos.filter((assunto) => assunto.temaId === temaId).toSorted(byOrder);
}

export function selectAssuntosByMateria(data, materiaId) {
  const temaIds = new Set(selectTemasByMateria(data, materiaId).map(({ id }) => id));
  return data.assuntos.filter(({ temaId }) => temaIds.has(temaId));
}
