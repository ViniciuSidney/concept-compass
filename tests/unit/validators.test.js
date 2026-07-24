import assert from 'node:assert/strict';
import test from 'node:test';

import { ValidationError } from '../../src/core/errors.js';
import { validateAppData } from '../../src/domain/validators/app-data-validator.js';
import { normalizeAssuntoInput } from '../../src/domain/validators/assunto-validator.js';
import { normalizeMateriaInput } from '../../src/domain/validators/materia-validator.js';
import { validatePreferences } from '../../src/domain/validators/preferences-validator.js';
import { validData, assunto, materia, tema } from '../fixtures/data-builders.js';

test('normaliza entrada válida de matéria', () => {
  assert.deepEqual(
    normalizeMateriaInput({
      nome: '  Matemática  ',
      descricao: '  Base   escolar ',
      corId: 'azul',
    }),
    { nome: 'Matemática', descricao: 'Base escolar', corId: 'azul' },
  );
});

test('rejeita matéria sem nome, cor inválida e limites excedidos', () => {
  assert.throws(
    () => normalizeMateriaInput({ nome: ' ', descricao: 'a'.repeat(301), corId: 'rosa' }),
    (error) => error instanceof ValidationError && error.issues.length === 3,
  );
});

test('assunto aplica padrões oficiais', () => {
  const normalized = normalizeAssuntoInput({ nome: 'Razão', ultimoEstudoEm: null });

  assert.equal(normalized.estado, 'nao_iniciado');
  assert.equal(normalized.dificuldade, 'nao_definida');
  assert.equal(normalized.descricao, '');
  assert.equal(normalized.observacoes, '');
});

test('rejeita estado, dificuldade e data futura', () => {
  assert.throws(
    () =>
      normalizeAssuntoInput(
        {
          nome: 'Razão',
          estado: 'arquivado',
          dificuldade: 'extrema',
          ultimoEstudoEm: '2026-07-25',
        },
        { today: '2026-07-24' },
      ),
    (error) => error instanceof ValidationError && error.issues.length === 3,
  );
});

test('estrutura válida é sanitizada e aceita', () => {
  const data = validData();
  data.extra = 'ignorado';
  data.materias[0].extra = 'ignorado';
  const normalized = validateAppData(data, { today: '2026-07-24' });

  assert.equal('extra' in normalized, false);
  assert.equal('extra' in normalized.materias[0], false);
});

test('rejeita identificadores duplicados em toda a aplicação', () => {
  const data = validData({ temas: [tema({ id: 'materia-1' })] });
  assert.throws(() => validateAppData(data), /estrutura principal/i);
});

test('rejeita tema órfão e assunto órfão', () => {
  const data = validData({
    temas: [tema({ materiaId: 'inexistente' })],
    assuntos: [assunto({ temaId: 'inexistente' })],
  });

  assert.throws(
    () => validateAppData(data),
    (error) => error.issues.some(({ code }) => code === 'orphan'),
  );
});

test('rejeita ordens duplicadas ou com lacunas', () => {
  const data = validData({
    materias: [materia(), materia({ id: 'materia-2', nome: 'História', ordem: 2 })],
  });

  assert.throws(
    () => validateAppData(data),
    (error) => error.issues.some(({ code }) => code === 'order_sequence'),
  );
});

test('rejeita cronologia técnica impossível', () => {
  const data = validData({
    materias: [
      materia({
        criadoEm: '2026-07-24T12:00:00.000Z',
        atualizadoEm: '2026-07-23T12:00:00.000Z',
      }),
    ],
  });

  assert.throws(() => validateAppData(data), /estrutura principal/i);
});

test('preferências aceitam somente tema oficial e cards', () => {
  assert.deepEqual(validatePreferences({ theme: 'dark', viewMode: 'cards', schemaVersion: 1 }), {
    theme: 'dark',
    viewMode: 'cards',
    schemaVersion: 1,
  });
  assert.throws(
    () => validatePreferences({ theme: 'sepia', viewMode: 'lista', schemaVersion: 1 }),
    /preferências armazenadas/i,
  );
});
