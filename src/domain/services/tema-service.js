import { createId } from '../../utils/id.js';
import { createIsoTimestamp } from '../../utils/date.js';
import { validateAppData } from '../validators/app-data-validator.js';
import { normalizeTemaInput } from '../validators/tema-validator.js';
import {
  requireMateria,
  requireTema,
  selectTemasByMateria,
} from '../selectors/hierarchy-selectors.js';
import { reorderItems } from './ordering-service.js';

export function createTema(
  data,
  materiaId,
  input,
  { idFactory = createId, nowFactory = createIsoTimestamp } = {},
) {
  requireMateria(data, materiaId);
  const normalizedInput = normalizeTemaInput(input);
  const timestamp = nowFactory();
  const tema = {
    id: idFactory(),
    materiaId,
    ...normalizedInput,
    ordem: selectTemasByMateria(data, materiaId).length,
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };
  const nextData = validateAppData({ ...data, temas: [...data.temas, tema] });

  return { data: nextData, tema };
}

export function updateTema(data, temaId, input, { nowFactory = createIsoTimestamp } = {}) {
  const current = requireTema(data, temaId);
  const normalizedInput = normalizeTemaInput(input);
  const tema = { ...current, ...normalizedInput, atualizadoEm: nowFactory() };
  const nextData = validateAppData({
    ...data,
    temas: data.temas.map((item) => (item.id === temaId ? tema : item)),
  });

  return { data: nextData, tema };
}

export function reorderTemas(data, temaId, targetIndex) {
  const current = requireTema(data, temaId);
  const siblings = selectTemasByMateria(data, current.materiaId);
  const reordered = new Map(
    reorderItems(siblings, temaId, targetIndex).map((item) => [item.id, item]),
  );

  return validateAppData({
    ...data,
    temas: data.temas.map((tema) => reordered.get(tema.id) ?? tema),
  });
}

export function moveTema(
  data,
  temaId,
  destinationMateriaId,
  { targetIndex, nowFactory = createIsoTimestamp } = {},
) {
  const current = requireTema(data, temaId);
  requireMateria(data, destinationMateriaId);

  if (current.materiaId === destinationMateriaId) {
    return reorderTemas(data, temaId, targetIndex ?? current.ordem);
  }

  const sourceSiblings = selectTemasByMateria(data, current.materiaId)
    .filter(({ id }) => id !== temaId)
    .map((tema, ordem) => ({ ...tema, ordem }));
  const destinationSiblings = selectTemasByMateria(data, destinationMateriaId);
  const movedTema = {
    ...current,
    materiaId: destinationMateriaId,
    atualizadoEm: nowFactory(),
    ordem: destinationSiblings.length,
  };
  const destinationWithMoved = reorderItems(
    [...destinationSiblings, movedTema],
    temaId,
    targetIndex ?? destinationSiblings.length,
  );
  const replacements = new Map(
    [...sourceSiblings, ...destinationWithMoved].map((tema) => [tema.id, tema]),
  );

  return validateAppData({
    ...data,
    temas: data.temas.map((tema) => replacements.get(tema.id) ?? tema),
  });
}

export function deleteTemaCascade(data, temaId) {
  const current = requireTema(data, temaId);
  const removedAssuntos = data.assuntos.filter((assunto) => assunto.temaId === temaId);
  const remainingSiblings = selectTemasByMateria(data, current.materiaId)
    .filter(({ id }) => id !== temaId)
    .map((tema, ordem) => ({ ...tema, ordem }));
  const replacements = new Map(remainingSiblings.map((tema) => [tema.id, tema]));
  const nextData = validateAppData({
    ...data,
    temas: data.temas
      .filter(({ id }) => id !== temaId)
      .map((tema) => replacements.get(tema.id) ?? tema),
    assuntos: data.assuntos.filter((assunto) => assunto.temaId !== temaId),
  });

  return {
    data: nextData,
    removed: { temas: 1, assuntos: removedAssuntos.length },
  };
}
