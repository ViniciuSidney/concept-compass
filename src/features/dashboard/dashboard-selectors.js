import { DIFFICULTIES } from '../../domain/constants.js';
import {
  selectAssuntosByMateria,
  selectAssuntosByTema,
  selectMateriaById,
  selectTemaById,
  selectTemasByMateria,
} from '../../domain/selectors/hierarchy-selectors.js';
import { summarizeStudyStackProgress } from '../../integrations/study-stack-progress-aggregate.js';
import {
  STUDY_STACK_SUBJECT_STATES,
  resolveStudyStackSubjectStatus,
  selectStudyStackSubjectState,
} from '../../integrations/study-stack-subject-state.js';

const STATUS_ORDER = Object.freeze([
  STUDY_STACK_SUBJECT_STATES.NOT_STARTED,
  STUDY_STACK_SUBJECT_STATES.IN_PROGRESS,
  STUDY_STACK_SUBJECT_STATES.CONSOLIDATED,
  STUDY_STACK_SUBJECT_STATES.ARCHIVED,
]);

const STATUS_LABELS = Object.freeze({
  [STUDY_STACK_SUBJECT_STATES.NOT_STARTED]: 'Não iniciado',
  [STUDY_STACK_SUBJECT_STATES.IN_PROGRESS]: 'Em andamento',
  [STUDY_STACK_SUBJECT_STATES.CONSOLIDATED]: 'Consolidado',
  [STUDY_STACK_SUBJECT_STATES.ARCHIVED]: 'Arquivado',
});

export function selectDashboardSummary(data, studyStackSnapshot = null) {
  const progressSummary = summarizeStudyStackProgress(data.assuntos, studyStackSnapshot);
  const blocked = isBlockedStudyStatus(progressSummary.status);
  const contexts = blocked
    ? []
    : data.assuntos
        .map((assunto) => createAssuntoContext(data, assunto, studyStackSnapshot))
        .filter(Boolean);
  const statusCounts = countStudyStatuses(contexts);
  const pendenciasCount = contexts.filter(
    (entry) =>
      entry.studyStatus !== STUDY_STACK_SUBJECT_STATES.ARCHIVED && getPendingCount(entry) > 0,
  ).length;
  const atencaoCount = contexts.filter(
    (entry) =>
      entry.studyStatus !== STUDY_STACK_SUBJECT_STATES.ARCHIVED &&
      (entry.studyStatus === STUDY_STACK_SUBJECT_STATES.IN_PROGRESS || getPendingCount(entry) > 0),
  ).length;

  return Object.freeze({
    materiasCount: data.materias.length,
    temasCount: data.temas.length,
    assuntosCount: data.assuntos.length,
    studyStatus: progressSummary.status,
    progress: progressSummary.percentage,
    points: progressSummary.points,
    totalPoints: progressSummary.total,
    emAndamentoCount: statusCounts[STUDY_STACK_SUBJECT_STATES.IN_PROGRESS],
    pendenciasCount,
    atencaoCount,
    consolidadosCount: statusCounts[STUDY_STACK_SUBJECT_STATES.CONSOLIDATED],
    arquivadosCount: statusCounts[STUDY_STACK_SUBJECT_STATES.ARCHIVED],
    materiasSemTemasCount: data.materias.filter(
      ({ id }) => selectTemasByMateria(data, id).length === 0,
    ).length,
    temasSemAssuntosCount: data.temas.filter(
      ({ id }) => selectAssuntosByTema(data, id).length === 0,
    ).length,
  });
}

export function selectProgressDistribution(data, studyStackSnapshot = null) {
  if (isBlockedSnapshot(studyStackSnapshot)) return [];

  const total = data.assuntos.length;
  const contexts = data.assuntos
    .map((assunto) => createAssuntoContext(data, assunto, studyStackSnapshot))
    .filter(Boolean);
  const counts = countStudyStatuses(contexts);

  return STATUS_ORDER.map((status) =>
    Object.freeze({
      status,
      label: STATUS_LABELS[status],
      count: counts[status],
      percentage: total === 0 ? 0 : (counts[status] / total) * 100,
    }),
  );
}

// Alias preservado para consumidores anteriores ao M8.1.
export const selectStateDistribution = selectProgressDistribution;

export function selectStudyPriorities(data, { limit = 6, studyStackSnapshot = null } = {}) {
  if (isBlockedSnapshot(studyStackSnapshot)) return [];

  const candidates = data.assuntos
    .map((assunto) => createAssuntoContext(data, assunto, studyStackSnapshot))
    .filter(Boolean)
    .map((entry) => ({ ...entry, priority: getPriority(entry) }))
    .filter(({ priority }) => priority !== null)
    .toSorted(comparePriorities)
    .slice(0, normalizeLimit(limit));

  return candidates.map(({ priority, ...entry }) =>
    Object.freeze({ ...entry, priorityReason: priority.reason }),
  );
}

export function selectRecentStudies(data, { limit = 5, studyStackSnapshot = null } = {}) {
  if (studyStackSnapshot?.status !== 'ready') return [];

  return data.assuntos
    .map((assunto) => createAssuntoContext(data, assunto, studyStackSnapshot))
    .filter((entry) => Boolean(entry?.studyStackState.subject?.lastActivityAt))
    .map((entry) => ({
      ...entry,
      lastActivityAt: entry.studyStackState.subject.lastActivityAt,
    }))
    .toSorted((left, right) => {
      const byDate = right.lastActivityAt.localeCompare(left.lastActivityAt);
      if (byDate !== 0) return byDate;
      return right.assunto.atualizadoEm.localeCompare(left.assunto.atualizadoEm);
    })
    .slice(0, normalizeLimit(limit))
    .map((entry) => Object.freeze(entry));
}

export function selectMateriaProgressHighlights(
  data,
  { limit = 4, studyStackSnapshot = null } = {},
) {
  return data.materias
    .map((materia) => {
      const assuntos = selectAssuntosByMateria(data, materia.id);
      const progressSummary = summarizeStudyStackProgress(assuntos, studyStackSnapshot);
      return Object.freeze({
        materia,
        assuntosCount: assuntos.length,
        progress: progressSummary.percentage,
        progressSummary,
      });
    })
    .filter(({ assuntosCount }) => assuntosCount > 0)
    .toSorted((left, right) => {
      const leftProgress = left.progress ?? Number.POSITIVE_INFINITY;
      const rightProgress = right.progress ?? Number.POSITIVE_INFINITY;
      if (leftProgress !== rightProgress) return leftProgress - rightProgress;
      return left.materia.ordem - right.materia.ordem;
    })
    .slice(0, normalizeLimit(limit));
}

function countStudyStatuses(contexts) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  for (const entry of contexts) {
    if (Object.hasOwn(counts, entry.studyStatus)) counts[entry.studyStatus] += 1;
  }
  return counts;
}

function createAssuntoContext(data, assunto, studyStackSnapshot) {
  const tema = selectTemaById(data, assunto.temaId);
  if (!tema) return null;
  const materia = selectMateriaById(data, tema.materiaId);
  if (!materia) return null;

  const archiveContext = assunto.arquivado
    ? 'assunto'
    : tema.arquivado
      ? 'tema'
      : materia.arquivado
        ? 'materia'
        : null;
  const studyStackState = selectStudyStackSubjectState(studyStackSnapshot, assunto.id);
  const studyStatus = resolveStudyStackSubjectStatus(studyStackState, {
    archived: Boolean(archiveContext),
  });

  return {
    assunto,
    tema,
    materia,
    archiveContext,
    studyStackState,
    studyStatus,
  };
}

function getPriority(entry) {
  if (
    entry.studyStatus === STUDY_STACK_SUBJECT_STATES.ARCHIVED ||
    entry.studyStatus === STUDY_STACK_SUBJECT_STATES.CONSOLIDATED ||
    entry.studyStatus === STUDY_STACK_SUBJECT_STATES.PENDING ||
    entry.studyStatus === STUDY_STACK_SUBJECT_STATES.UPDATE_REQUIRED
  ) {
    return null;
  }

  const pending = getPendingCount(entry);
  if (pending > 0) {
    return Object.freeze({ rank: 0, reason: 'Pendências no Study Stack' });
  }

  if (entry.studyStatus === STUDY_STACK_SUBJECT_STATES.IN_PROGRESS) {
    return Object.freeze({ rank: 1, reason: 'Estudo em andamento' });
  }

  if (entry.assunto.dificuldade === DIFFICULTIES.DIFICIL) {
    return Object.freeze({ rank: 2, reason: 'Dificuldade alta' });
  }

  const subject = entry.studyStackState.subject;
  const maximum = Number(subject?.maxProgress) || 10;
  const ratio = maximum > 0 ? (Number(subject?.progress) || 0) / maximum : 0;
  if (ratio >= 0.8) {
    return Object.freeze({ rank: 3, reason: 'Próximo da consolidação' });
  }

  return null;
}

function getPendingCount(entry) {
  const subject = entry.studyStackState?.subject;
  if (!subject) return 0;
  return (Number(subject.pendingErrors) || 0) + (Number(subject.pendingReviews) || 0);
}

function comparePriorities(left, right) {
  if (left.priority.rank !== right.priority.rank) return left.priority.rank - right.priority.rank;
  const leftDate = left.studyStackState.subject?.lastActivityAt ?? '';
  const rightDate = right.studyStackState.subject?.lastActivityAt ?? '';
  if (leftDate !== rightDate) return leftDate.localeCompare(rightDate);
  const byMateria = left.materia.ordem - right.materia.ordem;
  if (byMateria !== 0) return byMateria;
  const byTema = left.tema.ordem - right.tema.ordem;
  if (byTema !== 0) return byTema;
  return left.assunto.ordem - right.assunto.ordem;
}

function isBlockedSnapshot(snapshot) {
  return ['pending', 'update_required'].includes(snapshot?.status);
}

function isBlockedStudyStatus(status) {
  return ['pending', 'update_required'].includes(status);
}

function normalizeLimit(limit) {
  const number = Number(limit);
  return Number.isInteger(number) && number >= 0 ? number : 0;
}
