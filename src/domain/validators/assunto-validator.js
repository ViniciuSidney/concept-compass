import { DIFFICULTIES, DIFFICULTY_VALUES, FIELD_LIMITS, PROGRESS_POINTS } from '../constants.js';
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
  validateBoolean,
  validateEnum,
  validateIdentifier,
  validateIntegerRange,
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
  const metaPontosProgresso = validateIntegerRange(
    source.metaPontosProgresso ?? PROGRESS_POINTS.DEFAULT_TOTAL,
    'metaPontosProgresso',
    PROGRESS_POINTS.MIN_TOTAL,
    PROGRESS_POINTS.MAX_TOTAL,
    issues,
  );
  const pontosProgresso = validateIntegerRange(
    source.pontosProgresso ?? PROGRESS_POINTS.MIN_CURRENT,
    'pontosProgresso',
    PROGRESS_POINTS.MIN_CURRENT,
    PROGRESS_POINTS.MAX_TOTAL,
    issues,
  );

  if (pontosProgresso > metaPontosProgresso) {
    issues.push(
      issue(
        'pontosProgresso',
        'Os pontos atuais não podem ultrapassar a meta de progresso.',
        'progress_over_total',
      ),
    );
  }

  return {
    nome: normalizeRequiredText(source.nome, 'nome', FIELD_LIMITS.assunto.nome, issues),
    descricao: normalizeOptionalText(
      source.descricao,
      'descricao',
      FIELD_LIMITS.assunto.descricao,
      issues,
    ),
    pontosProgresso,
    metaPontosProgresso,
    precisaReforco: validateBoolean(source.precisaReforco ?? false, 'precisaReforco', issues),
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
  if (value === null) return null;
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
