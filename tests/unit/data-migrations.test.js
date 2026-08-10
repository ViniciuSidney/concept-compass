import assert from 'node:assert/strict';
import test from 'node:test';

import { migrateData } from '../../src/data/migrations/data-migrations.js';

const CREATED = '2026-07-24T12:00:00.000Z';

function materia() {
  return {
    id: 'materia-1',
    nome: 'Matemática',
    descricao: '',
    corId: 'roxo',
    arquivado: false,
    ordem: 0,
    criadoEm: CREATED,
    atualizadoEm: CREATED,
  };
}

function tema() {
  return {
    id: 'tema-1',
    materiaId: 'materia-1',
    nome: 'Álgebra',
    descricao: '',
    arquivado: false,
    ordem: 0,
    criadoEm: CREATED,
    atualizadoEm: CREATED,
  };
}

function assuntoV1(id, estado, ordem) {
  return {
    id,
    temaId: 'tema-1',
    nome: id,
    descricao: '',
    estado,
    dificuldade: 'media',
    observacoes: `Observação ${id}`,
    ultimoEstudoEm: '2026-07-24',
    ordem,
    criadoEm: CREATED,
    atualizadoEm: CREATED,
  };
}

function assuntoV2(overrides = {}) {
  return {
    id: 'assunto-v2',
    temaId: 'tema-1',
    nome: 'Assunto v2',
    descricao: 'Conteúdo preservado',
    pontosProgresso: 4,
    metaPontosProgresso: 8,
    precisaReforco: true,
    arquivado: false,
    dificuldade: 'dificil',
    observacoes: 'Preservar observação',
    ultimoEstudoEm: '2026-07-24',
    ordem: 0,
    criadoEm: CREATED,
    atualizadoEm: CREATED,
    ...overrides,
  };
}

test('migração v1 percorre a cadeia histórica e termina no schema v3', () => {
  const source = {
    schemaVersion: 1,
    materias: [materia()],
    temas: [tema()],
    assuntos: [
      assuntoV1('nao-iniciado', 'nao_iniciado', 0),
      assuntoV1('em-estudo', 'em_estudo', 1),
      assuntoV1('estudado', 'estudado', 2),
      assuntoV1('reforco', 'precisa_reforco', 3),
      assuntoV1('consolidado', 'consolidado', 4),
    ],
  };

  const migrated = migrateData(source);

  assert.equal(migrated.schemaVersion, 3);
  assert.deepEqual(
    migrated.assuntos.map(({ id }) => id),
    ['nao-iniciado', 'em-estudo', 'estudado', 'reforco', 'consolidado'],
  );
  for (const item of migrated.assuntos) {
    assert.equal('estado' in item, false);
    assert.equal('pontosProgresso' in item, false);
    assert.equal('metaPontosProgresso' in item, false);
    assert.equal('precisaReforco' in item, false);
    assert.equal('ultimoEstudoEm' in item, false);
    assert.equal(item.dificuldade, 'media');
    assert.match(item.observacoes, /^Observação /);
  }

  assert.equal(source.schemaVersion, 1);
  assert.equal(source.assuntos[0].estado, 'nao_iniciado');
});

test('migração v2 remove somente os campos de acompanhamento legado', () => {
  const source = {
    schemaVersion: 2,
    materias: [materia()],
    temas: [tema()],
    assuntos: [assuntoV2()],
  };

  const migrated = migrateData(source);
  const item = migrated.assuntos[0];

  assert.equal(migrated.schemaVersion, 3);
  assert.equal(item.id, 'assunto-v2');
  assert.equal(item.temaId, 'tema-1');
  assert.equal(item.nome, 'Assunto v2');
  assert.equal(item.descricao, 'Conteúdo preservado');
  assert.equal(item.arquivado, false);
  assert.equal(item.dificuldade, 'dificil');
  assert.equal(item.observacoes, 'Preservar observação');
  assert.equal('pontosProgresso' in item, false);
  assert.equal('metaPontosProgresso' in item, false);
  assert.equal('precisaReforco' in item, false);
  assert.equal('ultimoEstudoEm' in item, false);
});

test('schema v3 é preservado e versão futura continua rejeitada', () => {
  const current = {
    schemaVersion: 3,
    materias: [materia()],
    temas: [tema()],
    assuntos: [
      {
        id: 'assunto-v3',
        temaId: 'tema-1',
        nome: 'Assunto v3',
        descricao: '',
        arquivado: false,
        dificuldade: 'facil',
        observacoes: '',
        ordem: 0,
        criadoEm: CREATED,
        atualizadoEm: CREATED,
      },
    ],
  };

  assert.deepEqual(migrateData(current), current);
  assert.throws(() => migrateData({ ...current, schemaVersion: 99 }), /mais recente/i);
});
