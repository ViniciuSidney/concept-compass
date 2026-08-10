import { DIFFICULTIES, createEmptyData } from '../../src/domain/constants.js';

const CREATED = '2026-07-24T12:00:00.000Z';

export function materia(overrides = {}) {
  return {
    id: 'materia-1',
    nome: 'Matemática',
    descricao: '',
    corId: 'roxo',
    arquivado: false,
    ordem: 0,
    criadoEm: CREATED,
    atualizadoEm: CREATED,
    ...overrides,
  };
}

export function tema(overrides = {}) {
  return {
    id: 'tema-1',
    materiaId: 'materia-1',
    nome: 'Álgebra',
    descricao: '',
    arquivado: false,
    ordem: 0,
    criadoEm: CREATED,
    atualizadoEm: CREATED,
    ...overrides,
  };
}

export function assunto(overrides = {}) {
  return {
    id: 'assunto-1',
    temaId: 'tema-1',
    nome: 'Equação do primeiro grau',
    descricao: '',
    arquivado: false,
    dificuldade: DIFFICULTIES.NAO_DEFINIDA,
    observacoes: '',
    ordem: 0,
    criadoEm: CREATED,
    atualizadoEm: CREATED,
    ...overrides,
  };
}

export function validData(overrides = {}) {
  return {
    ...createEmptyData(),
    materias: [materia()],
    temas: [tema()],
    assuntos: [assunto()],
    ...overrides,
  };
}
