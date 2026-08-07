export const APP_CONFIG = Object.freeze({
  name: 'Concept Compass',
  shortName: 'Compass',
  version: '0.1.1',
  productVersion: 'v0.1.1',
  author: 'Vinícius Sidney',
  defaultTitle: 'Visão Geral',
  tagline: 'Mapeie, organize e acompanhe seu conhecimento.',
  technicalId: 'organizador-de-conteudos',
  legacyNames: Object.freeze(['Organizador de Conteúdos']),
  backupCompatibleVersions: Object.freeze(['v0.1', 'v0.1.0', 'v0.1.1']),
  integrations: Object.freeze({
    studyStack: Object.freeze({
      url: 'https://viniciusidney.github.io/study-stack/',
      route: '/overview',
      contractVersion: '1.0.0',
      summaryKey: 'study-stack:integration:progress:v1',
      supportedSummaryContractVersions: Object.freeze(['1.0.0']),
    }),
  }),
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
