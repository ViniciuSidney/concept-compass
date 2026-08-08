import { createBadge } from '../../ui/components/badge.js';
import { createButtonLink } from '../../ui/components/button.js';
import { createIcon } from '../../ui/icons/icon.js';
import { formatIsoDate, getDifficultyPresentation } from '../materias/assunto-presentation.js';
import { getAssuntoStudyPresentation } from '../materias/assunto-study-status.js';
import { SEARCH_TYPES } from './pesquisa-selectors.js';

const TYPE_PRESENTATION = Object.freeze({
  [SEARCH_TYPES.MATERIA]: Object.freeze({ label: 'Matéria', icon: 'book' }),
  [SEARCH_TYPES.TEMA]: Object.freeze({ label: 'Tema', icon: 'layers' }),
  [SEARCH_TYPES.ASSUNTO]: Object.freeze({ label: 'Assunto', icon: 'dashboard' }),
});

const STUDY_STATE_TONES = Object.freeze({
  not_started: 'not-started',
  in_progress: 'studying',
  consolidated: 'consolidated',
  archived: 'neutral',
  pending: 'warning',
  update_required: 'warning',
});

const STAGE_LABELS = Object.freeze({
  base: 'Base',
  practice: 'Prática',
  analysis: 'Análise',
  review: 'Revisão',
  consolidation: 'Consolidação',
});

export function createPesquisaResultCard(documentObject, result) {
  const article = documentObject.createElement('article');
  const header = documentObject.createElement('header');
  const iconArea = documentObject.createElement('div');
  const heading = documentObject.createElement('div');
  const breadcrumb = documentObject.createElement('p');
  const title = documentObject.createElement('h2');
  const titleLink = documentObject.createElement('a');
  const description = documentObject.createElement('p');
  const meta = documentObject.createElement('div');
  const footer = documentObject.createElement('footer');
  const presentation = TYPE_PRESENTATION[result.type];

  article.className = `pesquisa-result pesquisa-result--${result.type} pesquisa-result--${result.materia.corId}`;
  article.setAttribute('role', 'listitem');
  header.className = 'pesquisa-result__header';
  iconArea.className = 'pesquisa-result__icon';
  iconArea.append(createIcon(documentObject, presentation.icon, { size: 22 }));
  heading.className = 'pesquisa-result__heading';
  breadcrumb.className = 'pesquisa-result__breadcrumb';
  breadcrumb.textContent = createBreadcrumbText(result);
  title.className = 'pesquisa-result__title';
  titleLink.href = result.href;
  titleLink.textContent = result.title;
  title.append(titleLink);
  heading.append(breadcrumb, title);
  header.append(iconArea, heading, createBadge(documentObject, { label: presentation.label }));

  description.className = 'pesquisa-result__description';
  description.textContent = result.description || createFallbackDescription(result.type);
  meta.className = 'pesquisa-result__meta';
  appendMetadata(documentObject, meta, result);

  footer.className = 'pesquisa-result__footer';
  footer.append(
    createButtonLink(documentObject, {
      label: createActionLabel(result.type),
      href: result.href,
      variant: 'secondary',
      size: 'small',
      icon: 'arrow',
      iconPosition: 'end',
    }),
  );

  article.append(header, description, meta, footer);
  return article;
}

function appendMetadata(documentObject, meta, result) {
  if (result.type === SEARCH_TYPES.MATERIA) {
    meta.append(
      createMetaText(
        documentObject,
        `${result.temasCount} ${result.temasCount === 1 ? 'tema' : 'temas'}`,
      ),
      createMetaText(
        documentObject,
        `${result.assuntosCount} ${result.assuntosCount === 1 ? 'assunto' : 'assuntos'}`,
      ),
    );
    return;
  }

  if (result.type === SEARCH_TYPES.TEMA) {
    meta.append(
      createMetaText(
        documentObject,
        `${result.assuntosCount} ${result.assuntosCount === 1 ? 'assunto' : 'assuntos'}`,
      ),
    );
    return;
  }

  const study = getAssuntoStudyPresentation(result.studyStackState, result.assunto, {
    archiveContext: result.archiveContext,
  });
  const subject = result.studyStackState?.subject ?? null;
  const difficulty = getDifficultyPresentation(result.assunto.dificuldade);

  meta.append(
    createBadge(documentObject, {
      label: study.title,
      tone: STUDY_STATE_TONES[study.state] ?? 'neutral',
    }),
    createBadge(documentObject, { label: difficulty.label, tone: difficulty.tone }),
  );

  if (subject && result.studyStackState?.status === 'ready') {
    const maximum = Number(subject.maxProgress) || 10;
    const current = Math.min(maximum, Math.max(0, Number(subject.progress) || 0));
    const percentage = maximum > 0 ? Math.round((current / maximum) * 100) : 0;
    const pending = (Number(subject.pendingErrors) || 0) + (Number(subject.pendingReviews) || 0);

    meta.append(
      createMetaText(documentObject, `${current}/${maximum} pontos · ${percentage}%`),
      createMetaText(
        documentObject,
        `Etapa atual: ${STAGE_LABELS[subject.currentStage] ?? subject.currentStage}`,
      ),
    );

    if (pending > 0) {
      meta.append(
        createBadge(documentObject, {
          label: `${pending} ${pending === 1 ? 'pendência' : 'pendências'}`,
          tone: 'warning',
        }),
      );
    }

    if (subject.lastActivityAt) {
      meta.append(
        createMetaText(
          documentObject,
          `Última atividade: ${formatIsoDate(subject.lastActivityAt)}`,
        ),
      );
    }
    return;
  }

  if (study.state === 'not_started') {
    meta.append(createMetaText(documentObject, '0/10 pontos · 0%'));
  }
}

function createMetaText(documentObject, value) {
  const text = documentObject.createElement('span');
  text.className = 'pesquisa-result__meta-text';
  text.textContent = value;
  return text;
}

function createBreadcrumbText(result) {
  if (result.type === SEARCH_TYPES.MATERIA) return 'Organização geral';
  if (result.type === SEARCH_TYPES.TEMA) return result.materia.nome;
  return `${result.materia.nome} › ${result.tema.nome}`;
}

function createFallbackDescription(type) {
  if (type === SEARCH_TYPES.MATERIA) return 'Matéria sem descrição cadastrada.';
  if (type === SEARCH_TYPES.TEMA) return 'Tema sem descrição cadastrada.';
  return 'Assunto sem descrição cadastrada.';
}

function createActionLabel(type) {
  if (type === SEARCH_TYPES.MATERIA) return 'Abrir matéria';
  if (type === SEARCH_TYPES.TEMA) return 'Abrir tema';
  return 'Abrir assunto';
}
