import assert from 'node:assert/strict';
import test from 'node:test';

import { migrateData } from '../../src/data/migrations/data-migrations.js';
const CREATED = '2026-07-24T12:00:00.000Z';

function legacyAssunto(id, estado, ordem) {
  return {
    id,
    temaId: 'tema-1',
    nome: id,
    descricao: '',
    estado,
    dificuldade: 'nao_definida',
    observacoes: '',
    ultimoEstudoEm: null,
    ordem,
    criadoEm: CREATED,
    atualizadoEm: CREATED,
  };
}

function legacyData() {
  return {
    schemaVersion: 1,
    materias: [
      {
        id: 'materia-1',
        nome: 'Matemática',
        descricao: '',
        corId: 'roxo',
        ordem: 0,
        criadoEm: CREATED,
        atualizadoEm: CREATED,
      },
    ],
    temas: [
      {
        id: 'tema-1',
        materiaId: 'materia-1',
        nome: 'Álgebra',
        descricao: '',
        ordem: 0,
        criadoEm: CREATED,
        atualizadoEm: CREATED,
      },
    ],
    assuntos: [
      legacyAssunto('nao-iniciado', 'nao_iniciado', 0),
      legacyAssunto('em-estudo', 'em_estudo', 1),
      legacyAssunto('estudado', 'estudado', 2),
      legacyAssunto('reforco', 'precisa_reforco', 3),
      legacyAssunto('consolidado', 'consolidado', 4),
    ],
  };
}

test('migração v1 converte os cinco estados em pontos sem perder conteúdo', () => {
  const source = legacyData();
  const migrated = migrateData(source);

  assert.equal(migrated.schemaVersion, 2);
  assert.deepEqual(
    migrated.assuntos.map(({ id, pontosProgresso, metaPontosProgresso, precisaReforco }) => ({
      id,
      pontosProgresso,
      metaPontosProgresso,
      precisaReforco,
    })),
    [
      { id: 'nao-iniciado', pontosProgresso: 0, metaPontosProgresso: 5, precisaReforco: false },
      { id: 'em-estudo', pontosProgresso: 1, metaPontosProgresso: 5, precisaReforco: false },
      { id: 'estudado', pontosProgresso: 3, metaPontosProgresso: 5, precisaReforco: false },
      { id: 'reforco', pontosProgresso: 3, metaPontosProgresso: 5, precisaReforco: true },
      { id: 'consolidado', pontosProgresso: 5, metaPontosProgresso: 5, precisaReforco: false },
    ],
  );
  assert.equal(
    migrated.assuntos.some((assunto) => 'estado' in assunto),
    false,
  );
  assert.equal(migrated.assuntos[2].nome, 'estudado');
  assert.equal(source.schemaVersion, 1);
  assert.equal(source.assuntos[0].estado, 'nao_iniciado');
});

test('migração preserva estruturas já atualizadas e rejeita versão futura', () => {
  const migrated = migrateData({ ...legacyData(), schemaVersion: 2, assuntos: [] });
  assert.equal(migrated.schemaVersion, 2);
  assert.deepEqual(migrated.assuntos, []);

  assert.throws(() => migrateData({ ...legacyData(), schemaVersion: 99 }), /mais recente/i);
});
