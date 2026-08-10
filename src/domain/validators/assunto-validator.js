import { DIFFICULTIES, DIFFICULTY_VALUES, FIELD_LIMITS } from '../constants.js';
import { isValidIsoTimestamp } from '../../utils/date.js';
import { isPlainObject } from '../../utils/object.js';
import {
  issue,
  normalizeOptionalText,
  normalizeRequiredText,
  throwIfIssues,
  validateBoolean,
  validateEnum,
  validateIdentifier,
  validateOrder,
} from './validation-utils.js';

export function normalizeAssuntoInput(input) {
  const issues = [];
  const source = isPlainObject(input) ? input : {};
  const normalized = normalizeFields(source, issues);
  throwIfIssues(issues, 'O assunto possui dados inválidos.');
  return normalized;
}

export function validateAssuntoRecord(value) {
  const issues = [];
  const source = isPlainObject(value) ? value : {};
  const normalized = {
    id: validateIdentifier(source.id, 'id', issues),
    temaId: validateIdentifier(source.temaId, 'temaId', issues),
    ...normalizeFields(source, issues),
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

function normalizeFields(source, issues) {
  return {
    nome: normalizeRequiredText(source.nome, 'nome', FIELD_LIMITS.assunto.nome, issues),
    descricao: normalizeOptionalText(
      source.descricao,
      'descricao',
      FIELD_LIMITS.assunto.descricao,
      issues,
    ),
    arquivado: validateBoolean(source.arquivado ?? false, 'arquivado', issues),
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
  };
}

function validateTimestamp(value, field, issues) {
  if (!isValidIsoTimestamp(value)) {
    issues.push(issue(field, 'Deve ser uma data e hora ISO 8601 válida.', 'timestamp'));
    return '';
  }
  return value;
}
