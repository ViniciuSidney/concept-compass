import {
  DIFFICULTIES,
  DIFFICULTY_VALUES,
  FIELD_LIMITS,
  STUDY_STATES,
  STUDY_STATE_VALUES,
} from '../constants.js';
import {
  createLocalDate,
  isFutureLocalDate,
  isValidIsoTimestamp,
  isValidLocalDate,
} from '../../utils/date.js';
import { isPlainObject } from '../../utils/object.js';
import {
  issue,
  normalizeOptionalText,
  normalizeRequiredText,
  throwIfIssues,
  validateEnum,
  validateIdentifier,
  validateOrder,
} from './validation-utils.js';

export function normalizeAssuntoInput(input, { today = createLocalDate() } = {}) {
  const issues = [];
  const source = isPlainObject(input) ? input : {};
  const normalized = normalizeFields(source, issues, today);

  throwIfIssues(issues, 'O assunto possui dados inválidos.');
  return normalized;
}

export function validateAssuntoRecord(value, { today = createLocalDate() } = {}) {
  const issues = [];
  const source = isPlainObject(value) ? value : {};
  const normalized = {
    id: validateIdentifier(source.id, 'id', issues),
    temaId: validateIdentifier(source.temaId, 'temaId', issues),
    ...normalizeFields(source, issues, today),
    ordem: validateOrder(source.ordem, 'ordem', issues),
    criadoEm: validateTimestamp(source.criadoEm, 'criadoEm', issues),
    atualizadoEm: validateTimestamp(source.atualizadoEm, 'atualizadoEm', issues),
  };

  if (
    normalized.criadoEm &&
    normalized.atualizadoEm &&
    normalized.atualizadoEm < normalized.criadoEm
  ) {
    issues.push(issue('atualizadoEm', 'Não pode ser anterior à criação.', 'chronology'));
  }

  throwIfIssues(issues, 'O registro de assunto é inválido.');
  return normalized;
}

function normalizeFields(source, issues, today) {
  return {
    nome: normalizeRequiredText(source.nome, 'nome', FIELD_LIMITS.assunto.nome, issues),
    descricao: normalizeOptionalText(
      source.descricao,
      'descricao',
      FIELD_LIMITS.assunto.descricao,
      issues,
    ),
    estado: validateEnum(
      source.estado ?? STUDY_STATES.NAO_INICIADO,
      STUDY_STATE_VALUES,
      'estado',
      issues,
    ),
    dificuldade: validateEnum(
      source.dificuldade ?? DIFFICULTIES.NAO_DEFINIDA,
      DIFFICULTY_VALUES,
      'dificuldade',
      issues,
    ),
    observacoes: normalizeOptionalText(
      source.observacoes,
      'observacoes',
      FIELD_LIMITS.assunto.observacoes,
      issues,
    ),
    ultimoEstudoEm: validateLastStudyDate(source.ultimoEstudoEm ?? null, issues, today),
  };
}

function validateLastStudyDate(value, issues, today) {
  if (value === null) {
    return null;
  }

  if (!isValidLocalDate(value)) {
    issues.push(
      issue('ultimoEstudoEm', 'Deve usar uma data válida no formato AAAA-MM-DD.', 'date'),
    );
    return null;
  }

  if (isFutureLocalDate(value, today)) {
    issues.push(issue('ultimoEstudoEm', 'Não pode estar no futuro.', 'future_date'));
  }

  return value;
}

function validateTimestamp(value, field, issues) {
  if (!isValidIsoTimestamp(value)) {
    issues.push(issue(field, 'Deve ser uma data e hora ISO 8601 válida.', 'timestamp'));
    return '';
  }

  return value;
}
