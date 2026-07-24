import { FIELD_LIMITS, MATERIA_COLORS } from '../constants.js';
import { isValidIsoTimestamp } from '../../utils/date.js';
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

export function normalizeMateriaInput(input) {
  const issues = [];
  const source = isPlainObject(input) ? input : {};
  const normalized = {
    nome: normalizeRequiredText(source.nome, 'nome', FIELD_LIMITS.materia.nome, issues),
    descricao: normalizeOptionalText(
      source.descricao,
      'descricao',
      FIELD_LIMITS.materia.descricao,
      issues,
    ),
    corId: validateEnum(source.corId, MATERIA_COLORS, 'corId', issues),
  };

  throwIfIssues(issues, 'A matéria possui dados inválidos.');
  return normalized;
}

export function validateMateriaRecord(value) {
  const issues = [];
  const source = isPlainObject(value) ? value : {};
  const normalized = {
    id: validateIdentifier(source.id, 'id', issues),
    ...normalizeMateriaInputSafely(source, issues),
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

  throwIfIssues(issues, 'O registro de matéria é inválido.');
  return normalized;
}

function normalizeMateriaInputSafely(source, issues) {
  return {
    nome: normalizeRequiredText(source.nome, 'nome', FIELD_LIMITS.materia.nome, issues),
    descricao: normalizeOptionalText(
      source.descricao,
      'descricao',
      FIELD_LIMITS.materia.descricao,
      issues,
    ),
    corId: validateEnum(source.corId, MATERIA_COLORS, 'corId', issues),
  };
}

function validateTimestamp(value, field, issues) {
  if (!isValidIsoTimestamp(value)) {
    issues.push(issue(field, 'Deve ser uma data e hora ISO 8601 válida.', 'timestamp'));
    return '';
  }

  return value;
}
