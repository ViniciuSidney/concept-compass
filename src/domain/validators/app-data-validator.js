import { ValidationError } from '../../core/errors.js';
import { DATA_SCHEMA_VERSION } from '../constants.js';
import { createLocalDate } from '../../utils/date.js';
import { isPlainObject } from '../../utils/object.js';
import { validateAssuntoRecord } from './assunto-validator.js';
import { validateMateriaRecord } from './materia-validator.js';
import { validateTemaRecord } from './tema-validator.js';
import { issue, throwIfIssues } from './validation-utils.js';

export function validateAppData(value, { today = createLocalDate() } = {}) {
  const issues = [];
  const source = isPlainObject(value) ? value : {};

  if (source.schemaVersion !== DATA_SCHEMA_VERSION) {
    issues.push(issue('schemaVersion', 'A versão da estrutura não é suportada.', 'schema'));
  }

  const materias = validateCollection(source.materias, 'materias', validateMateriaRecord, issues);
  const temas = validateCollection(source.temas, 'temas', validateTemaRecord, issues);
  const assuntos = validateCollection(
    source.assuntos,
    'assuntos',
    (record) => validateAssuntoRecord(record, { today }),
    issues,
  );

  validateUniqueIds(materias, temas, assuntos, issues);
  validateRelationships(materias, temas, assuntos, issues);
  validateOrders(materias, temas, assuntos, issues);

  throwIfIssues(issues, 'A estrutura principal dos dados é inválida.');

  return {
    schemaVersion: DATA_SCHEMA_VERSION,
    materias,
    temas,
    assuntos,
  };
}

function validateCollection(value, field, validator, issues) {
  if (!Array.isArray(value)) {
    issues.push(issue(field, 'Deve ser uma lista.', 'type'));
    return [];
  }

  return value
    .map((record, index) => {
      try {
        return validator(record);
      } catch (error) {
        if (!(error instanceof ValidationError)) {
          throw error;
        }

        for (const childIssue of error.issues) {
          issues.push({ ...childIssue, field: `${field}[${index}].${childIssue.field}` });
        }
        return null;
      }
    })
    .filter(Boolean);
}

function validateUniqueIds(materias, temas, assuntos, issues) {
  const seen = new Set();

  for (const [collectionName, collection] of [
    ['materias', materias],
    ['temas', temas],
    ['assuntos', assuntos],
  ]) {
    for (const item of collection) {
      if (seen.has(item.id)) {
        issues.push(
          issue(`${collectionName}.${item.id}`, 'O identificador está duplicado.', 'duplicate_id'),
        );
      }
      seen.add(item.id);
    }
  }
}

function validateRelationships(materias, temas, assuntos, issues) {
  const materiaIds = new Set(materias.map(({ id }) => id));
  const temaIds = new Set(temas.map(({ id }) => id));

  for (const tema of temas) {
    if (!materiaIds.has(tema.materiaId)) {
      issues.push(
        issue(`temas.${tema.id}.materiaId`, 'A matéria relacionada não existe.', 'orphan'),
      );
    }
  }

  for (const assunto of assuntos) {
    if (!temaIds.has(assunto.temaId)) {
      issues.push(
        issue(`assuntos.${assunto.id}.temaId`, 'O tema relacionado não existe.', 'orphan'),
      );
    }
  }
}

function validateOrders(materias, temas, assuntos, issues) {
  validateOrderGroup(materias, 'materias', issues);

  for (const materia of materias) {
    validateOrderGroup(
      temas.filter(({ materiaId }) => materiaId === materia.id),
      `temas:${materia.id}`,
      issues,
    );
  }

  for (const tema of temas) {
    validateOrderGroup(
      assuntos.filter(({ temaId }) => temaId === tema.id),
      `assuntos:${tema.id}`,
      issues,
    );
  }
}

function validateOrderGroup(items, field, issues) {
  const sortedOrders = items.map(({ ordem }) => ordem).sort((left, right) => left - right);

  for (const [index, order] of sortedOrders.entries()) {
    if (order !== index) {
      issues.push(
        issue(field, 'A ordem dos itens deve ser contínua e iniciar em zero.', 'order_sequence'),
      );
      return;
    }
  }
}
