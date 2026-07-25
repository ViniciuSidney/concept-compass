import { DIFFICULTIES, STUDY_STATES, STUDY_STATE_LABELS } from '../../domain/constants.js';
import {
  selectAssuntosByMateria,
  selectAssuntosByTema,
  selectMateriaById,
  selectTemaById,
  selectTemasByMateria,
} from '../../domain/selectors/hierarchy-selectors.js';
import { calculateAssuntosProgress } from '../../domain/services/progress-service.js';

const STATE_ORDER = Object.freeze([
  STUDY_STATES.NAO_INICIADO,
  STUDY_STATES.EM_ESTUDO,
  STUDY_STATES.ESTUDADO,
  STUDY_STATES.PRECISA_REFORCO,
  STUDY_STATES.CONSOLIDADO,
]);

export function selectDashboardSummary(data) {
  const stateCounts = countStates(data.assuntos);

  return Object.freeze({
    materiasCount: data.materias.length,
    temasCount: data.temas.length,
    assuntosCount: data.assuntos.length,
    progress: calculateAssuntosProgress(data.assuntos),
    emEstudoCount: stateCounts[STUDY_STATES.EM_ESTUDO],
    reforcoCount: stateCounts[STUDY_STATES.PRECISA_REFORCO],
    consolidadosCount: stateCounts[STUDY_STATES.CONSOLIDADO],
    materiasSemTemasCount: data.materias.filter(
      ({ id }) => selectTemasByMateria(data, id).length === 0,
    ).length,
    temasSemAssuntosCount: data.temas.filter(
      ({ id }) => selectAssuntosByTema(data, id).length === 0,
    ).length,
  });
}

export function selectStateDistribution(data) {
  const total = data.assuntos.length;
  const counts = countStates(data.assuntos);

  return STATE_ORDER.map((state) =>
    Object.freeze({
      state,
      label: STUDY_STATE_LABELS[state],
      count: counts[state],
      percentage: total === 0 ? 0 : (counts[state] / total) * 100,
    }),
  );
}

export function selectStudyPriorities(data, { limit = 6 } = {}) {
  const candidates = data.assuntos
    .map((assunto) => createAssuntoContext(data, assunto))
    .filter(Boolean)
    .map((entry) => ({ ...entry, priority: getPriority(entry.assunto) }))
    .filter(({ priority }) => priority !== null)
    .toSorted(comparePriorities)
    .slice(0, normalizeLimit(limit));

  return candidates.map(({ priority: _priority, ...entry }) => Object.freeze(entry));
}

export function selectRecentStudies(data, { limit = 5 } = {}) {
  return data.assuntos
    .filter(({ ultimoEstudoEm }) => Boolean(ultimoEstudoEm))
    .map((assunto) => createAssuntoContext(data, assunto))
    .filter(Boolean)
    .toSorted((left, right) => {
      const byDate = right.assunto.ultimoEstudoEm.localeCompare(left.assunto.ultimoEstudoEm);
      if (byDate !== 0) return byDate;
      return right.assunto.atualizadoEm.localeCompare(left.assunto.atualizadoEm);
    })
    .slice(0, normalizeLimit(limit))
    .map((entry) => Object.freeze(entry));
}

export function selectMateriaProgressHighlights(data, { limit = 4 } = {}) {
  return data.materias
    .map((materia) => {
      const assuntos = selectAssuntosByMateria(data, materia.id);
      return Object.freeze({
        materia,
        assuntosCount: assuntos.length,
        progress: calculateAssuntosProgress(assuntos),
      });
    })
    .filter(({ assuntosCount }) => assuntosCount > 0)
    .toSorted((left, right) => {
      const leftProgress = left.progress ?? 0;
      const rightProgress = right.progress ?? 0;
      if (leftProgress !== rightProgress) return leftProgress - rightProgress;
      return left.materia.ordem - right.materia.ordem;
    })
    .slice(0, normalizeLimit(limit));
}

function countStates(assuntos) {
  const counts = Object.fromEntries(STATE_ORDER.map((state) => [state, 0]));
  for (const assunto of assuntos) {
    if (Object.hasOwn(counts, assunto.estado)) counts[assunto.estado] += 1;
  }
  return counts;
}

function createAssuntoContext(data, assunto) {
  const tema = selectTemaById(data, assunto.temaId);
  if (!tema) return null;
  const materia = selectMateriaById(data, tema.materiaId);
  if (!materia) return null;
  return { assunto, tema, materia };
}

function getPriority(assunto) {
  if (assunto.estado === STUDY_STATES.PRECISA_REFORCO) {
    return Object.freeze({ rank: 0, reason: 'Reforço necessário' });
  }

  if (assunto.estado === STUDY_STATES.EM_ESTUDO) {
    return Object.freeze({ rank: 1, reason: 'Estudo em andamento' });
  }

  if (assunto.dificuldade === DIFFICULTIES.DIFICIL && assunto.estado !== STUDY_STATES.CONSOLIDADO) {
    return Object.freeze({ rank: 2, reason: 'Dificuldade alta' });
  }

  return null;
}

function comparePriorities(left, right) {
  if (left.priority.rank !== right.priority.rank) {
    return left.priority.rank - right.priority.rank;
  }

  const leftDate = left.assunto.ultimoEstudoEm ?? '';
  const rightDate = right.assunto.ultimoEstudoEm ?? '';
  if (leftDate !== rightDate) return leftDate.localeCompare(rightDate);

  const byMateria = left.materia.ordem - right.materia.ordem;
  if (byMateria !== 0) return byMateria;

  const byTema = left.tema.ordem - right.tema.ordem;
  if (byTema !== 0) return byTema;

  return left.assunto.ordem - right.assunto.ordem;
}

function normalizeLimit(limit) {
  const number = Number(limit);
  return Number.isInteger(number) && number >= 0 ? number : 0;
}
