export const APP_CONFIG = Object.freeze({
  name: 'Organizador de Conteúdos',
  shortName: 'Organizador',
  version: '0.1.0',
  productVersion: 'v0.1',
  author: 'Vinícius Sidney',
  defaultTitle: 'Visão Geral',
});

export const NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({
    id: 'dashboard',
    label: 'Visão Geral',
    href: '#/',
    icon: 'dashboard',
  }),
  Object.freeze({
    id: 'materias',
    label: 'Matérias',
    href: '#/materias',
    icon: 'book',
  }),
  Object.freeze({
    id: 'pesquisa',
    label: 'Pesquisa Geral',
    href: '#/pesquisa',
    icon: 'search',
  }),
  Object.freeze({
    id: 'configuracoes',
    label: 'Configurações',
    href: '#/configuracoes',
    icon: 'settings',
  }),
]);
