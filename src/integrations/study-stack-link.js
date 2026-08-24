import { APP_CONFIG } from '../core/config.js';

const FALLBACK_LOCATION = 'http://127.0.0.1:4173/#/';

function requireEntity(entity, label) {
  if (!entity || typeof entity !== 'object') {
    throw new TypeError(`${label} é obrigatório para abrir o Study Stack.`);
  }

  for (const field of ['id', 'nome']) {
    if (typeof entity[field] !== 'string' || !entity[field].trim()) {
      throw new TypeError(`${label}.${field} é obrigatório para abrir o Study Stack.`);
    }
  }

  return entity;
}

function resolveLocationHref(location) {
  if (typeof location === 'string' && location.trim()) return location;
  if (typeof location?.href === 'string' && location.href.trim()) return location.href;
  return FALLBACK_LOCATION;
}

function resolveStudyStackDestination({ location, destinationUrl }) {
  if (typeof destinationUrl === 'string' && destinationUrl.trim()) {
    return destinationUrl;
  }

  const currentUrl = new URL(resolveLocationHref(location));
  const localHosts = new Set(['localhost', '127.0.0.1']);

  if (localHosts.has(currentUrl.hostname)) {
    return new URL('/study-stack/', currentUrl.origin).href;
  }

  return APP_CONFIG.integrations.studyStack.url;
}

export function createConceptCompassReturnUrl({ location, materiaId, temaId, assuntoId }) {
  const returnUrl = new URL(resolveLocationHref(location));
  const query = new URLSearchParams({ tema: temaId, assunto: assuntoId });

  returnUrl.search = '';
  returnUrl.hash = `/materias/${encodeURIComponent(materiaId)}?${query.toString()}`;

  return returnUrl.href;
}

export function createStudyStackSubjectContext({
  materia,
  tema,
  assunto,
  returnUrl,
  sentAt = new Date().toISOString(),
}) {
  const safeMateria = requireEntity(materia, 'materia');
  const safeTema = requireEntity(tema, 'tema');
  const safeAssunto = requireEntity(assunto, 'assunto');

  return Object.freeze({
    contractVersion: APP_CONFIG.integrations.studyStack.contractVersion,
    sentAt,
    sourceApp: 'concept_compass',
    subject: Object.freeze({
      matterId: safeMateria.id,
      matterName: safeMateria.nome,
      themeId: safeTema.id,
      themeName: safeTema.nome,
      subjectId: safeAssunto.id,
      subjectName: safeAssunto.nome,
    }),
    sourceArchived: Boolean(safeMateria.arquivado || safeTema.arquivado || safeAssunto.arquivado),
    returnUrl,
    navigationContext: Object.freeze({
      route: 'materia',
      materiaId: safeMateria.id,
      temaId: safeTema.id,
      assuntoId: safeAssunto.id,
    }),
  });
}

export function createStudyStackUrl({
  materia,
  tema,
  assunto,
  location,
  sentAt = new Date().toISOString(),
  destinationUrl,
}) {
  const returnUrl = createConceptCompassReturnUrl({
    location,
    materiaId: materia?.id,
    temaId: tema?.id,
    assuntoId: assunto?.id,
  });
  const context = createStudyStackSubjectContext({
    materia,
    tema,
    assunto,
    returnUrl,
    sentAt,
  });
  const destination = new URL(
    resolveStudyStackDestination({ location, destinationUrl }),
  );

  destination.searchParams.set('subjectContext', JSON.stringify(context));
  destination.hash = APP_CONFIG.integrations.studyStack.route;

  return destination.href;
}
