import { createBadge } from '../../ui/components/badge.js';
import { createButtonLink } from '../../ui/components/button.js';
import { createIcon } from '../../ui/icons/icon.js';
import {
  formatLocalDate,
  getDifficultyPresentation,
  getProgressPresentation,
} from '../materias/assunto-presentation.js';
import { SEARCH_TYPES } from './pesquisa-selectors.js';

const TYPE_PRESENTATION = Object.freeze({
  [SEARCH_TYPES.MATERIA]: Object.freeze({ label: 'Matéria', icon: 'book' }),
  [SEARCH_TYPES.TEMA]: Object.freeze({ label: 'Tema', icon: 'layers' }),
  [SEARCH_TYPES.ASSUNTO]: Object.freeze({ label: 'Assunto', icon: 'dashboard' }),
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

  const progress = getProgressPresentation(result.assunto);
  const difficulty = getDifficultyPresentation(result.assunto.dificuldade);
  meta.append(
    createBadge(documentObject, { label: progress.label, tone: progress.tone }),
    createBadge(documentObject, { label: difficulty.label, tone: difficulty.tone }),
    createMetaText(
      documentObject,
      `${result.assunto.pontosProgresso}/${result.assunto.metaPontosProgresso} pontos · ${Math.round(progress.percentage)}%`,
    ),
  );
  if (result.assunto.precisaReforco) {
    meta.append(
      createBadge(documentObject, { label: 'Precisa de reforço', tone: 'reinforcement' }),
    );
  }
  if (result.assunto.ultimoEstudoEm) {
    meta.append(
      createMetaText(
        documentObject,
        `Último estudo: ${formatLocalDate(result.assunto.ultimoEstudoEm)}`,
      ),
    );
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
