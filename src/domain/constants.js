export const DATA_SCHEMA_VERSION = 1;
export const PREFERENCES_SCHEMA_VERSION = 1;

export const STORAGE_KEYS = Object.freeze({
  data: 'organizador-conteudos:data',
  preferences: 'organizador-conteudos:preferences',
  ui: 'organizador-conteudos:ui',
});

export const STUDY_STATES = Object.freeze({
  NAO_INICIADO: 'nao_iniciado',
  EM_ESTUDO: 'em_estudo',
  ESTUDADO: 'estudado',
  PRECISA_REFORCO: 'precisa_reforco',
  CONSOLIDADO: 'consolidado',
});

export const STUDY_STATE_VALUES = Object.freeze(Object.values(STUDY_STATES));

export const STUDY_STATE_LABELS = Object.freeze({
  [STUDY_STATES.NAO_INICIADO]: 'Não iniciado',
  [STUDY_STATES.EM_ESTUDO]: 'Em estudo',
  [STUDY_STATES.ESTUDADO]: 'Estudado',
  [STUDY_STATES.PRECISA_REFORCO]: 'Precisa de reforço',
  [STUDY_STATES.CONSOLIDADO]: 'Consolidado',
});

export const PROGRESS_WEIGHTS = Object.freeze({
  [STUDY_STATES.NAO_INICIADO]: 0,
  [STUDY_STATES.EM_ESTUDO]: 25,
  [STUDY_STATES.PRECISA_REFORCO]: 50,
  [STUDY_STATES.ESTUDADO]: 75,
  [STUDY_STATES.CONSOLIDADO]: 100,
});

export const DIFFICULTIES = Object.freeze({
  NAO_DEFINIDA: 'nao_definida',
  FACIL: 'facil',
  MEDIA: 'media',
  DIFICIL: 'dificil',
});

export const DIFFICULTY_VALUES = Object.freeze(Object.values(DIFFICULTIES));

export const DIFFICULTY_LABELS = Object.freeze({
  [DIFFICULTIES.NAO_DEFINIDA]: 'Não definida',
  [DIFFICULTIES.FACIL]: 'Fácil',
  [DIFFICULTIES.MEDIA]: 'Média',
  [DIFFICULTIES.DIFICIL]: 'Difícil',
});

export const MATERIA_COLORS = Object.freeze([
  'azul',
  'verde',
  'amarelo',
  'vermelho',
  'roxo',
  'laranja',
  'cinza',
]);

export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
});

export const THEME_VALUES = Object.freeze(Object.values(THEMES));
export const VIEW_MODES = Object.freeze({ CARDS: 'cards' });

export const FIELD_LIMITS = Object.freeze({
  materia: Object.freeze({ nome: 60, descricao: 300 }),
  tema: Object.freeze({ nome: 80, descricao: 300 }),
  assunto: Object.freeze({ nome: 100, descricao: 500, observacoes: 1000 }),
});

export function createEmptyData() {
  return {
    schemaVersion: DATA_SCHEMA_VERSION,
    materias: [],
    temas: [],
    assuntos: [],
  };
}

export function createDefaultPreferences() {
  return {
    theme: THEMES.SYSTEM,
    viewMode: VIEW_MODES.CARDS,
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
  };
}
