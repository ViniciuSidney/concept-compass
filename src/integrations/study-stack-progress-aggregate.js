import { APP_CONFIG } from '../core/config.js';
import { createStudyStackSummaryReader } from './study-stack-summary-reader.js';

export const DEFAULT_SUBJECT_MAX_PROGRESS = 10;

function createResult({
  status,
  points = null,
  total = null,
  percentage = null,
  subjectsCount = 0,
  startedSubjects = 0,
  consolidatedSubjects = 0,
  summaryUpdatedAt = null,
}) {
  return Object.freeze({
    status,
    points,
    total,
    percentage,
    subjectsCount,
    startedSubjects,
    consolidatedSubjects,
    summaryUpdatedAt,
  });
}

export function summarizeStudyStackProgress(assuntos, snapshot) {
  if (!Array.isArray(assuntos)) {
    throw new TypeError('A lista de Assuntos deve ser um array.');
  }

  if (assuntos.length === 0) {
    return createResult({ status: 'empty' });
  }

  if (snapshot?.status === 'update_required') {
    return createResult({ status: 'update_required', subjectsCount: assuntos.length });
  }

  if (snapshot?.status === 'pending') {
    return createResult({ status: 'pending', subjectsCount: assuntos.length });
  }

  if (snapshot?.status !== 'ready' || !snapshot.summary) {
    const total = assuntos.length * DEFAULT_SUBJECT_MAX_PROGRESS;
    return createResult({
      status: 'not_started',
      points: 0,
      total,
      percentage: 0,
      subjectsCount: assuntos.length,
    });
  }

  let points = 0;
  let total = 0;
  let startedSubjects = 0;
  let consolidatedSubjects = 0;

  for (const assunto of assuntos) {
    const subject = snapshot.summary.subjects?.[assunto.id] ?? null;

    if (!subject) {
      total += DEFAULT_SUBJECT_MAX_PROGRESS;
      continue;
    }

    const maximum =
      Number.isInteger(subject.maxProgress) && subject.maxProgress > 0
        ? subject.maxProgress
        : DEFAULT_SUBJECT_MAX_PROGRESS;
    const current = Number.isInteger(subject.progress)
      ? Math.min(maximum, Math.max(0, subject.progress))
      : 0;

    points += current;
    total += maximum;

    if (subject.status !== 'not_started' || current > 0) {
      startedSubjects += 1;
    }
    if (subject.status === 'consolidated' || subject.consolidated) {
      consolidatedSubjects += 1;
    }
  }

  const percentage = total > 0 ? Math.round((points / total) * 100) : 0;
  const allConsolidated = consolidatedSubjects === assuntos.length;

  return createResult({
    status: allConsolidated ? 'consolidated' : startedSubjects > 0 ? 'ready' : 'not_started',
    points,
    total,
    percentage,
    subjectsCount: assuntos.length,
    startedSubjects,
    consolidatedSubjects,
    summaryUpdatedAt: snapshot.summary.updatedAt ?? null,
  });
}

export function readStudyStackProgressAggregate(documentObject, assuntos) {
  if (!Array.isArray(assuntos) || assuntos.length === 0) {
    return summarizeStudyStackProgress(Array.isArray(assuntos) ? assuntos : [], {
      status: 'missing',
      summary: null,
    });
  }

  let storage = null;

  try {
    storage = documentObject?.defaultView?.localStorage ?? globalThis.localStorage ?? null;
  } catch {
    return summarizeStudyStackProgress(assuntos, { status: 'pending', summary: null });
  }

  if (!storage) {
    return summarizeStudyStackProgress(assuntos, { status: 'missing', summary: null });
  }

  try {
    const snapshot = createStudyStackSummaryReader({
      storage,
      config: APP_CONFIG.integrations.studyStack,
    }).read();
    return summarizeStudyStackProgress(assuntos, snapshot);
  } catch {
    return summarizeStudyStackProgress(assuntos, { status: 'pending', summary: null });
  }
}
