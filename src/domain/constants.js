export const DATA_SCHEMA_VERSION = 3;
export const PREFERENCES_SCHEMA_VERSION = 1;

export const STORAGE_KEYS = Object.freeze({
  data: 'organizador-conteudos:data',
  preferences: 'organizador-conteudos:preferences',
  ui: 'organizador-conteudos:ui',
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

export const THEMES = Object.freeze({ LIGHT: 'light', DARK: 'dark', SYSTEM: 'system' });
export const THEME_VALUES = Object.freeze(Object.values(THEMES));
export const VIEW_MODES = Object.freeze({ CARDS: 'cards' });

export const FIELD_LIMITS = Object.freeze({
  materia: Object.freeze({ nome: 60, descricao: 300 }),
  tema: Object.freeze({ nome: 80, descricao: 300 }),
  assunto: Object.freeze({ nome: 100, descricao: 500, observacoes: 1000 }),
});

export function createEmptyData() {
  return { schemaVersion: DATA_SCHEMA_VERSION, materias: [], temas: [], assuntos: [] };
}

export function createDefaultPreferences() {
  return {
    theme: THEMES.SYSTEM,
    viewMode: VIEW_MODES.CARDS,
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
  };
}
