import { ValidationError } from '../../core/errors.js';
import { normalizeWhitespace } from '../../utils/text.js';

export function issue(field, message, code = 'invalid') {
  return Object.freeze({ field, message, code });
}

export function throwIfIssues(issues, message = 'Os dados informados são inválidos.') {
  if (issues.length > 0) {
    throw new ValidationError(message, { issues });
  }
}

export function normalizeRequiredText(value, field, maximumLength, issues) {
  if (typeof value !== 'string') {
    issues.push(issue(field, 'Deve ser um texto.', 'type'));
    return '';
  }

  const normalized = normalizeWhitespace(value);

  if (!normalized) {
    issues.push(issue(field, 'É obrigatório.', 'required'));
  }

  if (normalized.length > maximumLength) {
    issues.push(issue(field, `Deve possuir no máximo ${maximumLength} caracteres.`, 'max_length'));
  }

  return normalized;
}

export function normalizeOptionalText(value, field, maximumLength, issues) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (typeof value !== 'string') {
    issues.push(issue(field, 'Deve ser um texto.', 'type'));
    return '';
  }

  const normalized = normalizeWhitespace(value);

  if (normalized.length > maximumLength) {
    issues.push(issue(field, `Deve possuir no máximo ${maximumLength} caracteres.`, 'max_length'));
  }

  return normalized;
}

export function validateIdentifier(value, field, issues) {
  if (typeof value !== 'string' || !value.trim()) {
    issues.push(issue(field, 'Deve possuir um identificador válido.', 'identifier'));
    return '';
  }

  return value.trim();
}

export function validateOrder(value, field, issues) {
  if (!Number.isInteger(value) || value < 0) {
    issues.push(issue(field, 'Deve ser um número inteiro maior ou igual a zero.', 'order'));
    return 0;
  }

  return value;
}

export function validateEnum(value, allowedValues, field, issues) {
  if (!allowedValues.includes(value)) {
    issues.push(issue(field, 'Possui um valor não permitido.', 'enum'));
  }

  return value;
}
