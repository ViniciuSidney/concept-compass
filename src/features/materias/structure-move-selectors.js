import {
  requireAssunto,
  requireTema,
  selectAssuntosByTema,
  selectMateriaById,
  selectTemasByMateria,
} from '../../domain/selectors/hierarchy-selectors.js';

export function selectTemaMoveDestinations(data, temaId) {
  const tema = requireTema(data, temaId);

  return data.materias
    .toSorted((left, right) => left.ordem - right.ordem)
    .map((materia) => ({
      id: materia.id,
      label: materia.nome,
      current: materia.id === tema.materiaId,
      itemCount: selectTemasByMateria(data, materia.id).length,
    }));
}

export function selectAssuntoMoveDestinations(data, assuntoId) {
  const assunto = requireAssunto(data, assuntoId);
  const currentTema = requireTema(data, assunto.temaId);
  const materiasById = new Map(data.materias.map((materia) => [materia.id, materia]));

  return data.temas
    .toSorted((left, right) => {
      const leftMateria = materiasById.get(left.materiaId);
      const rightMateria = materiasById.get(right.materiaId);
      const materiaOrder = (leftMateria?.ordem ?? 0) - (rightMateria?.ordem ?? 0);
      return materiaOrder || left.ordem - right.ordem;
    })
    .map((tema) => {
      const materia = materiasById.get(tema.materiaId);
      return {
        id: tema.id,
        label: `${materia?.nome ?? 'Matéria não encontrada'} › ${tema.nome}`,
        current: tema.id === currentTema.id,
        itemCount: selectAssuntosByTema(data, tema.id).length,
      };
    });
}

export function selectTemaMovePositions(data, temaId, destinationMateriaId) {
  const current = requireTema(data, temaId);
  const siblings = selectTemasByMateria(data, destinationMateriaId).filter(
    ({ id }) => id !== current.id,
  );

  return createPositionOptions(siblings, {
    currentIndex: current.materiaId === destinationMateriaId ? current.ordem : siblings.length,
  });
}

export function selectAssuntoMovePositions(data, assuntoId, destinationTemaId) {
  const current = requireAssunto(data, assuntoId);
  const siblings = selectAssuntosByTema(data, destinationTemaId).filter(
    ({ id }) => id !== current.id,
  );

  return createPositionOptions(siblings, {
    currentIndex: current.temaId === destinationTemaId ? current.ordem : siblings.length,
  });
}

export function describeTemaOrigin(data, temaId) {
  const tema = requireTema(data, temaId);
  return selectMateriaById(data, tema.materiaId)?.nome ?? 'Matéria não encontrada';
}

export function describeAssuntoOrigin(data, assuntoId) {
  const assunto = requireAssunto(data, assuntoId);
  const tema = requireTema(data, assunto.temaId);
  const materia = selectMateriaById(data, tema.materiaId);
  return `${materia?.nome ?? 'Matéria não encontrada'} › ${tema.nome}`;
}

function createPositionOptions(siblings, { currentIndex }) {
  const positions = [];

  for (let index = 0; index <= siblings.length; index += 1) {
    positions.push({
      index,
      label: createPositionLabel(siblings, index),
      current: index === currentIndex,
    });
  }

  return positions;
}

function createPositionLabel(siblings, index) {
  const ordinal = `${index + 1}ª posição`;

  if (siblings.length === 0) return `${ordinal} — único item`;
  if (index === 0) return `${ordinal} — início`;
  if (index === siblings.length) return `${ordinal} — final`;

  return `${ordinal} — entre ${siblings[index - 1].nome} e ${siblings[index].nome}`;
}
