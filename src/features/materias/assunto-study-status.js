import { APP_CONFIG } from '../../core/config.js';
import { createStudyStackSummaryReader } from '../../integrations/study-stack-summary-reader.js';
import { createButton, createButtonLink } from '../../ui/components/button.js';
import { createIconButton } from '../../ui/components/icon-button.js';

const STAGE_LABELS = Object.freeze({
  base: 'Base',
  practice: 'Prática',
  analysis: 'Análise',
  review: 'Revisão',
  consolidation: 'Consolidação',
});

const STAGE_ORDER = Object.freeze(['base', 'practice', 'analysis', 'review', 'consolidation']);

function createMissingState(status = 'missing') {
  return Object.freeze({
    status,
    subject: null,
    summaryUpdatedAt: null,
    receivedContractVersion: null,
    errors: Object.freeze([]),
  });
}

export function readAssuntoStudyStackState(documentObject, subjectId) {
  let storage = null;

  try {
    storage = documentObject?.defaultView?.localStorage ?? globalThis.localStorage ?? null;
  } catch {
    return createMissingState('pending');
  }

  if (!storage) return createMissingState();

  try {
    return createStudyStackSummaryReader({
      storage,
      config: APP_CONFIG.integrations.studyStack,
    }).getSubject(subjectId);
  } catch {
    return createMissingState('pending');
  }
}

export function getAssuntoStudyPresentation(
  studyStackState,
  assunto = null,
  { archiveContext = null } = {},
) {
  const locallyArchived = Boolean(assunto?.arquivado);
  const effectiveArchiveContext = locallyArchived ? 'assunto' : archiveContext;
  const status = studyStackState?.status ?? 'missing';
  const subject = studyStackState?.subject ?? null;

  if (effectiveArchiveContext) {
    return createArchivedPresentation(effectiveArchiveContext, status === 'ready');
  }

  if (status === 'update_required') {
    return Object.freeze({
      state: 'update_required',
      title: 'Atualização necessária',
      actionLabel: 'Atualização necessária',
      actionVisible: true,
      actionDisabled: true,
      synchronized: false,
    });
  }

  if (status === 'pending') {
    return Object.freeze({
      state: 'pending',
      title: 'Sincronização pendente',
      actionLabel: 'Abrir no Study Stack',
      actionVisible: true,
      actionDisabled: false,
      synchronized: false,
    });
  }

  if (status !== 'ready' || !subject || subject.status === 'not_started') {
    return Object.freeze({
      state: 'not_started',
      title: 'Estudo ainda não iniciado',
      actionLabel: 'Iniciar estudo no Study Stack',
      actionVisible: true,
      actionDisabled: false,
      synchronized: status === 'ready',
    });
  }

  const consolidated = subject.status === 'consolidated' || subject.consolidated;

  if (consolidated) {
    return Object.freeze({
      state: 'consolidated',
      title: 'Estudo consolidado',
      actionLabel: 'Ver estudo no Study Stack',
      actionVisible: true,
      actionDisabled: false,
      synchronized: true,
    });
  }

  if (
    (subject.status === 'archived' || subject.sourceArchived) &&
    Number(subject.progress) <= 0 &&
    !subject.lastActivityAt
  ) {
    return Object.freeze({
      state: 'not_started',
      title: 'Estudo ainda não iniciado',
      actionLabel: 'Iniciar estudo no Study Stack',
      actionVisible: true,
      actionDisabled: false,
      synchronized: true,
    });
  }

  return Object.freeze({
    state: 'in_progress',
    title: 'Estudo em andamento',
    actionLabel: 'Continuar estudo no Study Stack',
    actionVisible: true,
    actionDisabled: false,
    synchronized: true,
  });
}

function createArchivedPresentation(archiveContext, synchronized) {
  const archiveMessages = {
    assunto: 'Restaure o Assunto para voltar a acessar o Study Stack.',
    tema: 'Restaure o Tema para voltar a acessar o Study Stack.',
    materia: 'Restaure a Matéria para voltar a acessar o Study Stack.',
  };

  return Object.freeze({
    state: 'archived',
    title: 'Estudo arquivado',
    actionLabel: null,
    actionVisible: false,
    actionDisabled: true,
    synchronized,
    archiveContext,
    archiveMessage: archiveMessages[archiveContext] ?? archiveMessages.assunto,
  });
}

export function createAssuntoStudyStatus(
  documentObject,
  { assunto, studyStackState, onOpenStudyStack, archiveContext = null },
) {
  const presentation = getAssuntoStudyPresentation(studyStackState, assunto, { archiveContext });
  const subject = studyStackState?.subject ?? null;
  const section = documentObject.createElement('section');
  const heading = documentObject.createElement('div');
  const eyebrow = documentObject.createElement('span');
  const title = documentObject.createElement('strong');

  section.className = `assunto-study assunto-study--${presentation.state}`;
  section.setAttribute('aria-label', `Situação do estudo de ${assunto.nome}`);
  const noticeCarousel =
    subject &&
    studyStackState?.status === 'ready' &&
    Array.isArray(subject.notices) &&
    subject.notices.length > 0
      ? createNoticeCarousel(documentObject, subject, { header: true })
      : null;

  heading.className = `assunto-study__heading${noticeCarousel ? ' assunto-study__heading--with-carousel' : ''}`;
  eyebrow.className = 'assunto-study__eyebrow';
  eyebrow.textContent = 'Situação do estudo';
  title.className = 'assunto-study__title';
  title.textContent = presentation.title;
  heading.append(eyebrow);
  if (noticeCarousel) heading.append(noticeCarousel);
  heading.append(title);
  section.append(heading);

  appendStudyContent(documentObject, section, {
    subject,
    studyStackState,
    presentation,
    detailed: false,
    skipNotices: Boolean(noticeCarousel),
  });

  if (presentation.actionVisible) {
    section.append(
      createButton(documentObject, {
        label: presentation.actionLabel,
        icon: 'layers',
        size: 'small',
        disabled: presentation.actionDisabled,
        className: 'assunto-study__action',
        onClick: presentation.actionDisabled ? null : onOpenStudyStack,
      }),
    );
  }

  return Object.freeze({
    element: section,
    actionLabel: presentation.actionLabel,
    actionVisible: presentation.actionVisible,
    actionDisabled: presentation.actionDisabled,
  });
}

export function createAssuntoStudyDetail(
  documentObject,
  { assunto, studyStackState, studyStackUrl, archiveContext = null },
) {
  const presentation = getAssuntoStudyPresentation(studyStackState, assunto, { archiveContext });
  const subject = studyStackState?.subject ?? null;
  const section = documentObject.createElement('section');
  const heading = documentObject.createElement('div');
  const eyebrow = documentObject.createElement('span');
  const title = documentObject.createElement('strong');

  section.className = `assunto-study assunto-study-detail assunto-study--${presentation.state}`;
  section.setAttribute('aria-label', `Situação detalhada do estudo de ${assunto.nome}`);
  heading.className = 'assunto-study__heading';
  eyebrow.className = 'assunto-study__eyebrow';
  eyebrow.textContent = 'Situação do estudo';
  title.className = 'assunto-study__title';
  title.textContent = presentation.title;
  heading.append(eyebrow, title);
  section.append(heading);

  appendStudyContent(documentObject, section, {
    subject,
    studyStackState,
    presentation,
    detailed: true,
  });

  if (presentation.actionVisible) {
    if (presentation.actionDisabled) {
      section.append(
        createButton(documentObject, {
          label: presentation.actionLabel,
          icon: 'layers',
          disabled: true,
          className: 'assunto-study__action',
        }),
      );
    } else {
      const studyStackLink = createButtonLink(documentObject, {
        label: presentation.actionLabel,
        href: studyStackUrl,
        icon: 'layers',
        className: 'assunto-study__action',
      });
      studyStackLink.target = '_blank';
      studyStackLink.rel = 'noopener noreferrer';
      section.append(studyStackLink);
    }
  }

  return Object.freeze({
    element: section,
    actionLabel: presentation.actionLabel,
    actionVisible: presentation.actionVisible,
    actionDisabled: presentation.actionDisabled,
  });
}

function appendStudyContent(
  documentObject,
  section,
  { subject, studyStackState, presentation, detailed, skipNotices = false },
) {
  if (subject && studyStackState.status === 'ready') {
    section.append(createStudySummary(documentObject, subject));

    if (detailed) {
      section.append(createStageBreakdown(documentObject, subject.stageProgress));
    }

    if (!skipNotices && Array.isArray(subject.notices) && subject.notices.length > 0) {
      section.append(createNoticeCarousel(documentObject, subject));
    }

    if (subject.nextAction?.label && presentation.state !== 'consolidated') {
      section.append(createNextAction(documentObject, subject.nextAction, detailed));
    }

    const pendingText = createPendingText(subject);
    if (pendingText) {
      const pending = documentObject.createElement('p');
      pending.className = 'assunto-study__pending';
      pending.textContent = pendingText;
      section.append(pending);
    }

    if (presentation.state === 'consolidated') {
      const flashcore = documentObject.createElement('p');
      flashcore.className = 'assunto-study__handoff';
      flashcore.textContent = 'Próxima etapa: revisão no Flashcore';
      section.append(flashcore);
    }

    if (presentation.state === 'archived') {
      const archived = documentObject.createElement('p');
      archived.className = 'assunto-study__notice-text';
      archived.textContent = presentation.archiveMessage;
      section.append(archived);
    }
  } else if (presentation.state === 'archived') {
    section.append(createSupportText(documentObject, presentation.archiveMessage));
  } else if (presentation.state === 'pending') {
    section.append(
      createSupportText(
        documentObject,
        'O resumo do Study Stack não pôde ser confirmado agora. O progresso antigo não será usado como alternativa.',
      ),
    );
  } else if (presentation.state === 'update_required') {
    section.append(
      createSupportText(
        documentObject,
        'A versão recebida não é compatível com o contrato atual da integração.',
      ),
    );
  } else {
    section.append(
      createSupportText(
        documentObject,
        'Comece pelo Concept Compass e registre as evidências no Study Stack.',
      ),
    );
  }

  if (presentation.synchronized) {
    const sync = documentObject.createElement('span');
    sync.className = 'assunto-study__sync';
    sync.textContent = 'Sincronizado com o Study Stack';
    section.append(sync);
  }
}

function createStudySummary(documentObject, subject) {
  const summary = documentObject.createElement('div');
  const progress = documentObject.createElement('strong');
  const stage = documentObject.createElement('span');
  const activity = documentObject.createElement('span');

  summary.className = 'assunto-study__summary';
  progress.className = 'assunto-study__progress';
  progress.textContent = `${subject.progress}/${subject.maxProgress}`;
  stage.className = 'assunto-study__stage';
  stage.textContent = `Etapa atual: ${STAGE_LABELS[subject.currentStage] ?? subject.currentStage}`;
  activity.className = 'assunto-study__activity';
  activity.textContent = subject.lastActivityAt
    ? `Última atividade: ${formatActivityDate(subject.lastActivityAt)}`
    : 'Última atividade: ainda não registrada';
  summary.append(progress, stage, activity);
  return summary;
}

function createStageBreakdown(documentObject, stageProgress) {
  const section = documentObject.createElement('section');
  const title = documentObject.createElement('h3');
  const list = documentObject.createElement('div');

  section.className = 'assunto-study-detail__stages';
  title.className = 'assunto-study-detail__section-title';
  title.textContent = 'Progresso por etapa';
  list.className = 'assunto-study-detail__stage-list';
  list.setAttribute('role', 'list');

  for (const stageKey of STAGE_ORDER) {
    const progress = stageProgress?.[stageKey];
    if (!progress) continue;

    const item = documentObject.createElement('div');
    const label = documentObject.createElement('span');
    const value = documentObject.createElement('strong');

    item.className = 'assunto-study-detail__stage-item';
    item.setAttribute('role', 'listitem');
    label.textContent = STAGE_LABELS[stageKey] ?? stageKey;
    value.textContent = `${progress.current}/${progress.maximum}`;
    item.append(label, value);
    list.append(item);
  }

  section.append(title, list);
  return section;
}

function createNextAction(documentObject, nextAction, detailed) {
  if (!detailed) {
    const paragraph = documentObject.createElement('p');
    paragraph.className = 'assunto-study__next-action';
    paragraph.textContent = `Próxima ação: ${nextAction.label}`;
    return paragraph;
  }

  const section = documentObject.createElement('section');
  const title = documentObject.createElement('span');
  const label = documentObject.createElement('strong');
  const description = documentObject.createElement('p');

  section.className = 'assunto-study-detail__next-action';
  title.className = 'assunto-study__eyebrow';
  title.textContent = 'Próxima ação recomendada';
  label.textContent = nextAction.label;
  description.textContent =
    nextAction.description || 'Continue pelo Study Stack para avançar neste Assunto.';
  section.append(title, label, description);
  return section;
}

function createNoticeCarousel(documentObject, subject, { header = false } = {}) {
  const carousel = documentObject.createElement('div');
  const message = documentObject.createElement('p');
  const position = documentObject.createElement('span');
  const navigation = documentObject.createElement('div');
  const notices = subject.notices;
  const recommendedIndex = Math.max(
    0,
    notices.findIndex((notice) => notice.id === subject.recommendedNoticeId),
  );
  let currentIndex = recommendedIndex;

  const previous = createIconButton(documentObject, {
    icon: 'arrow-left',
    label: 'Mostrar aviso anterior',
    size: 'small',
    variant: 'ghost',
    onClick: () => {
      currentIndex = (currentIndex - 1 + notices.length) % notices.length;
      renderNotice();
    },
  });
  const next = createIconButton(documentObject, {
    icon: 'chevron-right',
    label: 'Mostrar próximo aviso',
    size: 'small',
    variant: 'ghost',
    onClick: () => {
      currentIndex = (currentIndex + 1) % notices.length;
      renderNotice();
    },
  });

  carousel.className = `assunto-study__carousel${header ? ' assunto-study__carousel--header' : ''}`;
  position.className = 'assunto-study__position';
  message.className = 'assunto-study__notice-text';
  message.setAttribute('aria-live', 'polite');
  navigation.className = 'assunto-study__carousel-navigation';
  navigation.setAttribute('role', 'group');
  navigation.setAttribute('aria-label', 'Navegar pelos avisos do Study Stack');
  navigation.append(previous, next);
  carousel.append(position, message, navigation);

  function renderNotice() {
    const notice = notices[currentIndex];
    message.textContent = notice.message;
    message.setAttribute('title', notice.message);
    position.textContent = `${currentIndex + 1}/${notices.length}`;
    position.setAttribute('aria-label', `Aviso ${currentIndex + 1} de ${notices.length}`);
    carousel.classList.remove(
      'assunto-study__carousel--completed',
      'assunto-study__carousel--recommended',
      'assunto-study__carousel--pending',
    );
    carousel.classList.add(`assunto-study__carousel--${notice.type}`);
  }

  renderNotice();
  return carousel;
}

function createPendingText(subject) {
  const parts = [];
  if (subject.pendingErrors > 0) {
    parts.push(
      `${subject.pendingErrors} ${subject.pendingErrors === 1 ? 'erro pendente' : 'erros pendentes'}`,
    );
  }
  if (subject.pendingReviews > 0) {
    parts.push(
      `${subject.pendingReviews} ${subject.pendingReviews === 1 ? 'revisão pendente' : 'revisões pendentes'}`,
    );
  }
  return parts.join(' · ');
}

function createSupportText(documentObject, text) {
  const paragraph = documentObject.createElement('p');
  paragraph.className = 'assunto-study__support';
  paragraph.textContent = text;
  return paragraph;
}

function formatActivityDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
