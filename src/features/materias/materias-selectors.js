import {
  selectAssuntosByMateria,
  selectTemasByMateria,
} from '../../domain/selectors/hierarchy-selectors.js';
import { summarizeMateriaProgress } from '../../domain/services/progress-service.js';
import { normalizeSearchText } from '../../utils/text.js';

export const MATERIAS_SORT_MODES = Object.freeze({
  MANUAL: 'manual',
  NAME: 'name',
  RECENT: 'recent',
});

export function selectMateriaSummaries(
  data,
  { query = '', sortMode = MATERIAS_SORT_MODES.MANUAL } = {},
) {
  const normalizedQuery = normalizeSearchText(query);
  const summaries = data.materias.map((materia) => {
    const progressSummary = summarizeMateriaProgress(data, materia.id);
    return {
      materia,
      temasCount: selectTemasByMateria(data, materia.id).length,
      assuntosCount: selectAssuntosByMateria(data, materia.id).length,
      progress: progressSummary?.percentage ?? null,
      progressSummary,
    };
  });
  const filtered = normalizedQuery
    ? summaries.filter(({ materia }) =>
        normalizeSearchText(`${materia.nome} ${materia.descricao}`).includes(normalizedQuery),
      )
    : summaries;
  return filtered.toSorted(createComparator(sortMode));
}

export function selectMateriaImpact(data, materiaId) {
  return Object.freeze({
    temas: selectTemasByMateria(data, materiaId).length,
    assuntos: selectAssuntosByMateria(data, materiaId).length,
  });
}

function createComparator(sortMode) {
  if (sortMode === MATERIAS_SORT_MODES.NAME) {
    return (left, right) => left.materia.nome.localeCompare(right.materia.nome, 'pt-BR');
  }
  if (sortMode === MATERIAS_SORT_MODES.RECENT) {
    return (left, right) => right.materia.atualizadoEm.localeCompare(left.materia.atualizadoEm);
  }
  return (left, right) => left.materia.ordem - right.materia.ordem;
}
