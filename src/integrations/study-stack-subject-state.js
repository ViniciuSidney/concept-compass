export const STUDY_STACK_SUBJECT_STATES = Object.freeze({
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  CONSOLIDATED: 'consolidated',
  ARCHIVED: 'archived',
  PENDING: 'pending',
  UPDATE_REQUIRED: 'update_required',
});

function safeClone(value) {
  return value === null || value === undefined ? value : structuredClone(value);
}

function createState({
  status,
  subject = null,
  summaryUpdatedAt = null,
  receivedContractVersion = null,
  errors = [],
}) {
  return Object.freeze({
    status,
    subject: safeClone(subject),
    summaryUpdatedAt,
    receivedContractVersion,
    errors: Object.freeze([...errors]),
  });
}

export function readStudyStackSnapshot(reader) {
  if (!reader || typeof reader.read !== 'function') {
    return Object.freeze({
      status: 'missing',
      summary: null,
      fingerprint: null,
      receivedContractVersion: null,
      errors: Object.freeze([]),
    });
  }

  try {
    return reader.read();
  } catch (error) {
    return Object.freeze({
      status: 'pending',
      summary: null,
      fingerprint: null,
      receivedContractVersion: null,
      errors: Object.freeze([error instanceof Error ? error.message : String(error)]),
    });
  }
}

export function selectStudyStackSubjectState(snapshot, subjectId) {
  if (snapshot?.status === STUDY_STACK_SUBJECT_STATES.UPDATE_REQUIRED) {
    return createState({
      status: STUDY_STACK_SUBJECT_STATES.UPDATE_REQUIRED,
      receivedContractVersion: snapshot.receivedContractVersion ?? null,
      errors: snapshot.errors ?? [],
    });
  }

  if (snapshot?.status === STUDY_STACK_SUBJECT_STATES.PENDING) {
    return createState({
      status: STUDY_STACK_SUBJECT_STATES.PENDING,
      receivedContractVersion: snapshot.receivedContractVersion ?? null,
      errors: snapshot.errors ?? [],
    });
  }

  if (snapshot?.status !== 'ready' || !snapshot.summary) {
    return createState({ status: STUDY_STACK_SUBJECT_STATES.NOT_STARTED });
  }

  const subject = snapshot.summary.subjects?.[subjectId] ?? null;

  return createState({
    status: subject ? 'ready' : STUDY_STACK_SUBJECT_STATES.NOT_STARTED,
    subject,
    summaryUpdatedAt: snapshot.summary.updatedAt ?? null,
    receivedContractVersion: snapshot.receivedContractVersion ?? null,
  });
}

export function resolveStudyStackSubjectStatus(studyStackState, { archived = false } = {}) {
  if (archived) return STUDY_STACK_SUBJECT_STATES.ARCHIVED;

  if (studyStackState?.status === STUDY_STACK_SUBJECT_STATES.UPDATE_REQUIRED) {
    return STUDY_STACK_SUBJECT_STATES.UPDATE_REQUIRED;
  }

  if (studyStackState?.status === STUDY_STACK_SUBJECT_STATES.PENDING) {
    return STUDY_STACK_SUBJECT_STATES.PENDING;
  }

  const subject = studyStackState?.subject ?? null;
  if (!subject) return STUDY_STACK_SUBJECT_STATES.NOT_STARTED;

  if (subject.status === STUDY_STACK_SUBJECT_STATES.CONSOLIDATED || subject.consolidated) {
    return STUDY_STACK_SUBJECT_STATES.CONSOLIDATED;
  }

  if (
    subject.status === STUDY_STACK_SUBJECT_STATES.IN_PROGRESS ||
    Number(subject.progress) > 0 ||
    Boolean(subject.lastActivityAt)
  ) {
    return STUDY_STACK_SUBJECT_STATES.IN_PROGRESS;
  }

  return STUDY_STACK_SUBJECT_STATES.NOT_STARTED;
}
