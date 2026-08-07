const REQUIRED_STAGE_KEYS = Object.freeze([
  'base',
  'practice',
  'analysis',
  'review',
  'consolidation',
]);

const SUBJECT_STATUS_VALUES = new Set(['not_started', 'in_progress', 'consolidated', 'archived']);

const NOTICE_TYPE_VALUES = new Set(['completed', 'recommended', 'pending']);

function safeClone(value) {
  return value === null || value === undefined ? value : structuredClone(value);
}

function isIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function validateStageProgress(subjectId, stageProgress, errors) {
  if (!isPlainObject(stageProgress)) {
    errors.push(`subjects.${subjectId}.stageProgress inválido.`);
    return;
  }

  for (const stageKey of REQUIRED_STAGE_KEYS) {
    const stage = stageProgress[stageKey];
    if (!isPlainObject(stage)) {
      errors.push(`subjects.${subjectId}.stageProgress.${stageKey} ausente.`);
      continue;
    }

    if (
      !Number.isInteger(stage.current) ||
      !Number.isInteger(stage.maximum) ||
      stage.current < 0 ||
      stage.maximum <= 0 ||
      stage.current > stage.maximum
    ) {
      errors.push(`subjects.${subjectId}.stageProgress.${stageKey} inválido.`);
    }
  }
}

function validateNotices(subjectId, subject, errors) {
  if (!Array.isArray(subject.notices) || subject.notices.length === 0) {
    errors.push(`subjects.${subjectId}.notices inválido.`);
    return;
  }

  const noticeIds = new Set();

  for (const notice of subject.notices) {
    if (!isPlainObject(notice)) {
      errors.push(`subjects.${subjectId}.notices contém item inválido.`);
      continue;
    }
    if (typeof notice.id !== 'string' || !notice.id.trim()) {
      errors.push(`subjects.${subjectId}.notices contém id inválido.`);
    } else if (noticeIds.has(notice.id)) {
      errors.push(`subjects.${subjectId}.notices contém id duplicado.`);
    } else {
      noticeIds.add(notice.id);
    }
    if (!REQUIRED_STAGE_KEYS.includes(notice.stage)) {
      errors.push(`subjects.${subjectId}.notices contém etapa inválida.`);
    }
    if (!NOTICE_TYPE_VALUES.has(notice.type)) {
      errors.push(`subjects.${subjectId}.notices contém tipo inválido.`);
    }
    if (typeof notice.message !== 'string' || !notice.message.trim()) {
      errors.push(`subjects.${subjectId}.notices contém mensagem inválida.`);
    }
  }

  if (
    typeof subject.recommendedNoticeId !== 'string' ||
    !noticeIds.has(subject.recommendedNoticeId)
  ) {
    errors.push(`subjects.${subjectId}.recommendedNoticeId inválido.`);
  }
}

function validateNextAction(subjectId, nextAction, errors) {
  if (!isPlainObject(nextAction)) {
    errors.push(`subjects.${subjectId}.nextAction inválido.`);
    return;
  }

  if (typeof nextAction.type !== 'string' || !nextAction.type.trim()) {
    errors.push(`subjects.${subjectId}.nextAction.type inválido.`);
  }
  if (typeof nextAction.label !== 'string' || !nextAction.label.trim()) {
    errors.push(`subjects.${subjectId}.nextAction.label inválido.`);
  }
  if (
    nextAction.description !== undefined &&
    nextAction.description !== null &&
    typeof nextAction.description !== 'string'
  ) {
    errors.push(`subjects.${subjectId}.nextAction.description inválido.`);
  }
}

function validateSubjectSummary(subjectId, subject, errors) {
  if (!isPlainObject(subject)) {
    errors.push(`subjects.${subjectId} inválido.`);
    return;
  }

  if (subject.subjectId !== subjectId) {
    errors.push(`subjects.${subjectId}.subjectId não corresponde à chave.`);
  }

  for (const key of ['matterId', 'themeId']) {
    if (typeof subject[key] !== 'string' || !subject[key].trim()) {
      errors.push(`subjects.${subjectId}.${key} inválido.`);
    }
  }

  if (!SUBJECT_STATUS_VALUES.has(subject.status)) {
    errors.push(`subjects.${subjectId}.status inválido.`);
  }

  if (
    !Number.isInteger(subject.progress) ||
    !Number.isInteger(subject.maxProgress) ||
    subject.progress < 0 ||
    subject.maxProgress <= 0 ||
    subject.progress > subject.maxProgress
  ) {
    errors.push(`subjects.${subjectId}.progress inválido.`);
  }

  if (!REQUIRED_STAGE_KEYS.includes(subject.currentStage)) {
    errors.push(`subjects.${subjectId}.currentStage inválido.`);
  }
  if (!REQUIRED_STAGE_KEYS.includes(subject.recommendedStage)) {
    errors.push(`subjects.${subjectId}.recommendedStage inválido.`);
  }

  if (typeof subject.sourceArchived !== 'boolean') {
    errors.push(`subjects.${subjectId}.sourceArchived inválido.`);
  }
  if (typeof subject.consolidated !== 'boolean') {
    errors.push(`subjects.${subjectId}.consolidated inválido.`);
  }

  for (const key of ['pendingErrors', 'pendingReviews']) {
    if (!Number.isInteger(subject[key]) || subject[key] < 0) {
      errors.push(`subjects.${subjectId}.${key} inválido.`);
    }
  }

  if (subject.lastActivityAt !== null && !isIsoDate(subject.lastActivityAt)) {
    errors.push(`subjects.${subjectId}.lastActivityAt inválido.`);
  }

  validateStageProgress(subjectId, subject.stageProgress, errors);
  validateNotices(subjectId, subject, errors);
  validateNextAction(subjectId, subject.nextAction, errors);
}

export function validateStudyStackSummary(summary, supportedContractVersions = ['1.0.0']) {
  const errors = [];

  if (!isPlainObject(summary)) {
    return Object.freeze({ valid: false, compatible: false, errors: ['Resumo inválido.'] });
  }

  const compatible = supportedContractVersions.includes(summary.contractVersion);

  if (typeof summary.contractVersion !== 'string' || !summary.contractVersion.trim()) {
    errors.push('contractVersion ausente.');
  }
  if (summary.sourceApp !== 'study_stack') {
    errors.push('sourceApp inválido.');
  }
  if (!isIsoDate(summary.updatedAt)) {
    errors.push('updatedAt inválido.');
  }
  if (!isPlainObject(summary.subjects)) {
    errors.push('subjects inválido.');
  } else if (compatible) {
    for (const [subjectId, subject] of Object.entries(summary.subjects)) {
      validateSubjectSummary(subjectId, subject, errors);
    }
  }

  return Object.freeze({
    valid: compatible && errors.length === 0,
    compatible,
    errors: Object.freeze(errors),
  });
}

export function createStudyStackSummaryReader({ storage, config }) {
  if (!storage || typeof storage.getItem !== 'function') {
    throw new TypeError('Uma implementação de Storage é obrigatória.');
  }
  if (!config?.summaryKey || !Array.isArray(config.supportedSummaryContractVersions)) {
    throw new TypeError('A configuração da integração com o Study Stack é inválida.');
  }

  function read() {
    let raw;

    try {
      raw = storage.getItem(config.summaryKey);
    } catch (error) {
      return Object.freeze({
        status: 'pending',
        summary: null,
        fingerprint: null,
        receivedContractVersion: null,
        errors: Object.freeze([error instanceof Error ? error.message : String(error)]),
      });
    }

    if (raw === null) {
      return Object.freeze({
        status: 'missing',
        summary: null,
        fingerprint: null,
        receivedContractVersion: null,
        errors: Object.freeze([]),
      });
    }

    let summary;

    try {
      summary = JSON.parse(raw);
    } catch {
      return Object.freeze({
        status: 'pending',
        summary: null,
        fingerprint: raw,
        receivedContractVersion: null,
        errors: Object.freeze(['O resumo salvo pelo Study Stack contém JSON inválido.']),
      });
    }

    const validation = validateStudyStackSummary(summary, config.supportedSummaryContractVersions);

    if (!validation.compatible) {
      return Object.freeze({
        status: 'update_required',
        summary: null,
        fingerprint: raw,
        receivedContractVersion: summary?.contractVersion ?? null,
        errors: validation.errors,
      });
    }

    if (!validation.valid) {
      return Object.freeze({
        status: 'pending',
        summary: null,
        fingerprint: raw,
        receivedContractVersion: summary?.contractVersion ?? null,
        errors: validation.errors,
      });
    }

    return Object.freeze({
      status: 'ready',
      summary: safeClone(summary),
      fingerprint: raw,
      receivedContractVersion: summary.contractVersion,
      errors: Object.freeze([]),
    });
  }

  function getSubject(subjectId) {
    const snapshot = read();

    if (snapshot.status !== 'ready') {
      return Object.freeze({
        status: snapshot.status,
        subject: null,
        summaryUpdatedAt: null,
        receivedContractVersion: snapshot.receivedContractVersion,
        errors: snapshot.errors,
      });
    }

    const subject = snapshot.summary.subjects[subjectId] ?? null;

    return Object.freeze({
      status: subject ? 'ready' : 'not_started',
      subject: safeClone(subject),
      summaryUpdatedAt: snapshot.summary.updatedAt,
      receivedContractVersion: snapshot.receivedContractVersion,
      errors: Object.freeze([]),
    });
  }

  return Object.freeze({ read, getSubject });
}
