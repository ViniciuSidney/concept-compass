import { RouteError } from './errors.js';

const ROUTES = Object.freeze([
  Object.freeze({ id: 'dashboard', pattern: /^\/$/, title: 'Visão Geral' }),
  Object.freeze({ id: 'materias', pattern: /^\/materias\/?$/, title: 'Matérias' }),
  Object.freeze({
    id: 'materia',
    pattern: /^\/materias\/([^/]+)\/?$/,
    title: 'Matéria',
    parameterNames: ['materiaId'],
  }),
  Object.freeze({ id: 'pesquisa', pattern: /^\/pesquisa\/?$/, title: 'Pesquisa Geral' }),
  Object.freeze({
    id: 'configuracoes',
    pattern: /^\/configuracoes\/?$/,
    title: 'Configurações',
  }),
  Object.freeze({
    id: 'recuperacao',
    pattern: /^\/recuperacao\/?$/,
    title: 'Recuperação de Dados',
  }),
  Object.freeze({
    id: 'nao-encontrado',
    pattern: /^\/nao-encontrado\/?$/,
    title: 'Conteúdo Não Encontrado',
  }),
]);

function normalizeHash(hashValue) {
  const rawHash = typeof hashValue === 'string' ? hashValue : '';
  const fragment = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
  const normalized = fragment.trim() || '/';

  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function decodeParameter(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    throw new RouteError('A rota contém um identificador inválido.', { cause: error });
  }
}

export function parseRoute(hashValue = '#/') {
  const normalizedHash = normalizeHash(hashValue);
  const [pathnamePart, queryPart = ''] = normalizedHash.split('?');
  const pathname = pathnamePart || '/';
  const query = Object.fromEntries(new URLSearchParams(queryPart));

  for (const routeDefinition of ROUTES) {
    const match = pathname.match(routeDefinition.pattern);

    if (!match) {
      continue;
    }

    const params = {};

    for (const [index, parameterName] of (routeDefinition.parameterNames ?? []).entries()) {
      params[parameterName] = decodeParameter(match[index + 1]);
    }

    return Object.freeze({
      id: routeDefinition.id,
      title: routeDefinition.title,
      pathname,
      query: Object.freeze({ ...query }),
      params: Object.freeze(params),
      isNotFound: false,
    });
  }

  return Object.freeze({
    id: 'nao-encontrado',
    title: 'Conteúdo Não Encontrado',
    pathname,
    query: Object.freeze({ ...query }),
    params: Object.freeze({}),
    isNotFound: true,
  });
}

export function createRouter({ windowObject = window, onRouteChange }) {
  if (typeof onRouteChange !== 'function') {
    throw new TypeError('O roteador exige uma função onRouteChange.');
  }

  let started = false;

  function resolveCurrentRoute() {
    return parseRoute(windowObject.location.hash);
  }

  function notify() {
    onRouteChange(resolveCurrentRoute());
  }

  function start() {
    if (started) {
      return;
    }

    started = true;
    windowObject.addEventListener('hashchange', notify);

    if (!windowObject.location.hash) {
      windowObject.location.replace('#/');
      return;
    }

    notify();
  }

  function stop() {
    if (!started) {
      return;
    }

    windowObject.removeEventListener('hashchange', notify);
    started = false;
  }

  function navigate(href, { replace = false } = {}) {
    const normalizedHref = href.startsWith('#') ? href : `#${href}`;

    if (replace) {
      windowObject.location.replace(normalizedHref);
      return;
    }

    windowObject.location.hash = normalizedHref;
  }

  return Object.freeze({
    start,
    stop,
    navigate,
    resolveCurrentRoute,
  });
}
