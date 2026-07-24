import { createId } from '../../utils/id.js';
import { createIsoTimestamp } from '../../utils/date.js';
import { validateAppData } from '../validators/app-data-validator.js';
import { normalizeMateriaInput } from '../validators/materia-validator.js';
import { requireMateria } from '../selectors/hierarchy-selectors.js';
import { reorderItems } from './ordering-service.js';

export function createMateria(
  data,
  input,
  { idFactory = createId, nowFactory = createIsoTimestamp } = {},
) {
  const normalizedInput = normalizeMateriaInput(input);
  const timestamp = nowFactory();
  const materia = {
    id: idFactory(),
    ...normalizedInput,
    ordem: data.materias.length,
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };
  const nextData = validateAppData({
    ...data,
    materias: [...data.materias, materia],
  });

  return { data: nextData, materia };
}

export function updateMateria(data, materiaId, input, { nowFactory = createIsoTimestamp } = {}) {
  const current = requireMateria(data, materiaId);
  const normalizedInput = normalizeMateriaInput(input);
  const materia = {
    ...current,
    ...normalizedInput,
    atualizadoEm: nowFactory(),
  };
  const nextData = validateAppData({
    ...data,
    materias: data.materias.map((item) => (item.id === materiaId ? materia : item)),
  });

  return { data: nextData, materia };
}

export function reorderMaterias(data, materiaId, targetIndex) {
  requireMateria(data, materiaId);
  return validateAppData({
    ...data,
    materias: reorderItems(data.materias, materiaId, targetIndex),
  });
}

export function deleteMateriaCascade(data, materiaId) {
  requireMateria(data, materiaId);
  const temaIds = new Set(
    data.temas.filter((tema) => tema.materiaId === materiaId).map(({ id }) => id),
  );
  const removedAssuntos = data.assuntos.filter((assunto) => temaIds.has(assunto.temaId));
  const remainingMaterias = data.materias
    .filter(({ id }) => id !== materiaId)
    .map((materia, ordem) => ({ ...materia, ordem }));
  const nextData = validateAppData({
    ...data,
    materias: remainingMaterias,
    temas: data.temas.filter(({ id }) => !temaIds.has(id)),
    assuntos: data.assuntos.filter(({ temaId }) => !temaIds.has(temaId)),
  });

  return {
    data: nextData,
    removed: {
      materias: 1,
      temas: temaIds.size,
      assuntos: removedAssuntos.length,
    },
  };
}
