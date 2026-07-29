import { DIFFICULTIES, PROGRESS_STATUS_LABELS, PROGRESS_STATUSES } from '../../domain/constants.js';
import {
  selectAssuntosByMateria,
  selectAssuntosByTema,
  selectMateriaById,
  selectTemaById,
  selectTemasByMateria,
} from '../../domain/selectors/hierarchy-selectors.js';
import {
  deriveProgressStatus,
  summarizeAssuntosProgress,
} from '../../domain/services/progress-service.js';

const STATUS_ORDER = Object.freeze([
  PROGRESS_STATUSES.NOT_STARTED,
  PROGRESS_STATUSES.IN_PROGRESS,
  PROGRESS_STATUSES.COMPLETE,
]);

export function selectDashboardSummary(data) {
  const progressSummary = summarizeAssuntosProgress(data.assuntos);
  const statusCounts = countProgressStatuses(data.assuntos);

  return Object.freeze({
    materiasCount: data.materias.length,
    temasCount: data.temas.length,
    assuntosCount: data.assuntos.length,
    progress: progressSummary?.percentage ?? null,
    points: progressSummary?.points ?? 0,
    totalPoints: progressSummary?.total ?? 0,
    emAndamentoCount: statusCounts[PROGRESS_STATUSES.IN_PROGRESS],
    reforcoCount: data.assuntos.filter(({ precisaReforco }) => precisaReforco).length,
    concluidosCount: statusCounts[PROGRESS_STATUSES.COMPLETE],
    materiasSemTemasCount: data.materias.filter(
      ({ id }) => selectTemasByMateria(data, id).length === 0,
    ).length,
    temasSemAssuntosCount: data.temas.filter(
      ({ id }) => selectAssuntosByTema(data, id).length === 0,
    ).length,
  });
}

export function selectProgressDistribution(data) {
  const total = data.assuntos.length;
  const counts = countProgressStatuses(data.assuntos);
  return STATUS_ORDER.map((status) =>
    Object.freeze({
      status,
      label: PROGRESS_STATUS_LABELS[status],
      count: counts[status],
      percentage: total === 0 ? 0 : (counts[status] / total) * 100,
    }),
  );
}

// Alias temporário para consumidores anteriores ao M8.1.
export const selectStateDistribution = selectProgressDistribution;

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
      const progressSummary = summarizeAssuntosProgress(assuntos);
      return Object.freeze({
        materia,
        assuntosCount: assuntos.length,
        progress: progressSummary?.percentage ?? null,
        progressSummary,
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

function countProgressStatuses(assuntos) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  for (const assunto of assuntos) counts[deriveProgressStatus(assunto)] += 1;
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
  const status = deriveProgressStatus(assunto);
  const ratio = assunto.pontosProgresso / assunto.metaPontosProgresso;

  if (assunto.precisaReforco) {
    return Object.freeze({ rank: 0, reason: 'Reforço necessário' });
  }
  if (status === PROGRESS_STATUSES.IN_PROGRESS) {
    return Object.freeze({ rank: 1, reason: 'Progresso em andamento' });
  }
  if (assunto.dificuldade === DIFFICULTIES.DIFICIL && status !== PROGRESS_STATUSES.COMPLETE) {
    return Object.freeze({ rank: 2, reason: 'Dificuldade alta' });
  }
  if (ratio >= 0.8 && status !== PROGRESS_STATUSES.COMPLETE) {
    return Object.freeze({ rank: 3, reason: 'Próximo da meta' });
  }
  return null;
}

function comparePriorities(left, right) {
  if (left.priority.rank !== right.priority.rank) return left.priority.rank - right.priority.rank;
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
