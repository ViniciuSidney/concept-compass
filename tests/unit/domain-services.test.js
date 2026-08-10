import assert from 'node:assert/strict';
import test from 'node:test';

import { createEmptyData } from '../../src/domain/constants.js';
import {
  archiveAssunto,
  createAssunto,
  deleteAssunto,
  moveAssunto,
  restoreAssunto,
  updateAssunto,
} from '../../src/domain/services/assunto-service.js';
import {
  archiveMateria,
  createMateria,
  deleteMateriaCascade,
  reorderMaterias,
  restoreMateria,
  updateMateria,
} from '../../src/domain/services/materia-service.js';
import {
  archiveTema,
  createTema,
  deleteTemaCascade,
  moveTema,
  restoreTema,
  updateTema,
} from '../../src/domain/services/tema-service.js';

function createFactories() {
  const ids = ['materia-1', 'materia-2', 'tema-1', 'tema-2', 'assunto-1', 'assunto-2'];
  return {
    idFactory: () => ids.shift(),
    nowFactory: () => '2026-07-24T12:00:00.000Z',
    laterFactory: () => '2026-07-24T13:00:00.000Z',
    todayFactory: () => '2026-07-24',
  };
}

test('cria e edita matéria preservando ID e criação', () => {
  const { idFactory, nowFactory, laterFactory } = createFactories();
  const created = createMateria(
    createEmptyData(),
    { nome: 'Matemática', descricao: '', corId: 'roxo' },
    { idFactory, nowFactory },
  );
  const updated = updateMateria(
    created.data,
    created.materia.id,
    { nome: 'Matemática básica', descricao: 'Base', corId: 'azul' },
    { nowFactory: laterFactory },
  );
  assert.equal(updated.materia.id, created.materia.id);
  assert.equal(updated.materia.criadoEm, created.materia.criadoEm);
  assert.equal(updated.materia.atualizadoEm, '2026-07-24T13:00:00.000Z');
});

test('constrói hierarquia completa e aplica padrões estruturais do assunto', () => {
  const { idFactory, nowFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  const result = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  );

  assert.equal(data.materias[0].arquivado, false);
  assert.equal(data.temas[0].arquivado, false);
  assert.equal(result.assunto.arquivado, false);
  assert.equal(result.assunto.dificuldade, 'nao_definida');
  assert.equal(result.assunto.descricao, '');
  assert.equal(result.assunto.observacoes, '');
  assert.equal('pontosProgresso' in result.assunto, false);
  assert.equal('metaPontosProgresso' in result.assunto, false);
  assert.equal('precisaReforco' in result.assunto, false);
  assert.equal('ultimoEstudoEm' in result.assunto, false);
});

test('edições de tema e assunto preservam relações e ignoram progresso legado', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));

  const temaResult = updateTema(
    data,
    data.temas[0].id,
    { nome: 'T2' },
    { nowFactory: laterFactory },
  );
  const assuntoResult = updateAssunto(
    temaResult.data,
    data.assuntos[0].id,
    {
      nome: 'S2',
      descricao: 'Descrição atualizada',
      dificuldade: 'media',
      observacoes: 'Preservar conteúdo',
      pontosProgresso: 2,
      metaPontosProgresso: 6,
      precisaReforco: true,
      ultimoEstudoEm: '2026-07-24',
    },
    { nowFactory: laterFactory, todayFactory },
  );

  assert.equal(temaResult.tema.materiaId, data.materias[0].id);
  assert.equal(assuntoResult.assunto.temaId, data.temas[0].id);
  assert.equal(assuntoResult.assunto.nome, 'S2');
  assert.equal(assuntoResult.assunto.dificuldade, 'media');
  assert.equal(assuntoResult.assunto.observacoes, 'Preservar conteúdo');
  assert.equal('pontosProgresso' in assuntoResult.assunto, false);
  assert.equal('ultimoEstudoEm' in assuntoResult.assunto, false);
});

test('arquiva e restaura matéria preservando hierarquia e IDs dos descendentes', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));
  const originalTemaId = data.temas[0].id;
  const originalAssuntoId = data.assuntos[0].id;

  const archived = archiveMateria(data, data.materias[0].id, { nowFactory: laterFactory });
  assert.equal(archived.materia.arquivado, true);
  assert.equal(archived.data.temas[0].id, originalTemaId);
  assert.equal(archived.data.temas[0].arquivado, false);
  assert.equal(archived.data.assuntos[0].id, originalAssuntoId);
  assert.equal(archived.data.assuntos[0].arquivado, false);

  const restored = restoreMateria(archived.data, archived.materia.id, { nowFactory });
  assert.equal(restored.materia.arquivado, false);
  assert.equal(restored.data.temas[0].id, originalTemaId);
  assert.equal(restored.data.assuntos[0].id, originalAssuntoId);
});

test('arquiva e restaura tema sem alterar estado próprio dos Assuntos', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));

  const archived = archiveTema(data, data.temas[0].id, { nowFactory: laterFactory });
  assert.equal(archived.tema.arquivado, true);
  assert.equal(archived.data.assuntos[0].arquivado, false);

  const restored = restoreTema(archived.data, archived.tema.id, { nowFactory });
  assert.equal(restored.tema.arquivado, false);
  assert.equal(restored.data.assuntos[0].arquivado, false);
});

test('arquiva e restaura assunto preservando vínculo e conteúdo estrutural', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    {
      nome: 'S',
      dificuldade: 'dificil',
      observacoes: 'Preservar',
    },
    { idFactory, nowFactory, todayFactory },
  ));

  const original = data.assuntos[0];
  const archived = archiveAssunto(data, original.id, {
    nowFactory: laterFactory,
    todayFactory,
  });

  assert.equal(archived.assunto.id, original.id);
  assert.equal(archived.assunto.temaId, original.temaId);
  assert.equal(archived.assunto.nome, original.nome);
  assert.equal(archived.assunto.dificuldade, 'dificil');
  assert.equal(archived.assunto.observacoes, 'Preservar');
  assert.equal(archived.assunto.arquivado, true);
  assert.equal(archived.assunto.atualizadoEm, '2026-07-24T13:00:00.000Z');
  assert.equal('pontosProgresso' in archived.assunto, false);

  const restored = restoreAssunto(archived.data, original.id, {
    nowFactory,
    todayFactory,
  });
  assert.equal(restored.assunto.id, original.id);
  assert.equal(restored.assunto.arquivado, false);
});

test('editar assunto arquivado não o restaura implicitamente', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));
  ({ data } = archiveAssunto(data, data.assuntos[0].id, {
    nowFactory: laterFactory,
    todayFactory,
  }));

  const updated = updateAssunto(
    data,
    data.assuntos[0].id,
    { nome: 'S editado' },
    { nowFactory, todayFactory },
  );

  assert.equal(updated.assunto.nome, 'S editado');
  assert.equal(updated.assunto.arquivado, true);
});

test('move tema preservando assuntos e normaliza origem e destino', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createMateria(data, { nome: 'B', corId: 'verde' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));
  const moved = moveTema(data, data.temas[0].id, data.materias[1].id, { nowFactory: laterFactory });
  assert.equal(moved.temas[0].materiaId, data.materias[1].id);
  assert.equal(moved.assuntos[0].temaId, moved.temas[0].id);
  assert.equal(moved.temas[0].ordem, 0);
});

test('move assunto entre temas e normaliza as ordens', () => {
  const { idFactory, nowFactory, laterFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T1' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T2' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));
  const moved = moveAssunto(data, data.assuntos[0].id, data.temas[1].id, {
    nowFactory: laterFactory,
    todayFactory,
  });
  assert.equal(moved.assuntos[0].temaId, data.temas[1].id);
  assert.equal(moved.assuntos[0].ordem, 0);
});

test('exclusões respeitam cascatas e quantidades', () => {
  const { idFactory, nowFactory, todayFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createTema(data, data.materias[0].id, { nome: 'T' }, { idFactory, nowFactory }));
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S' },
    { idFactory, nowFactory, todayFactory },
  ));

  const assuntoRemoved = deleteAssunto(data, data.assuntos[0].id, { today: '2026-07-24' });
  assert.equal(assuntoRemoved.assuntos.length, 0);
  data = assuntoRemoved;
  ({ data } = createAssunto(
    data,
    data.temas[0].id,
    { nome: 'S2' },
    { idFactory, nowFactory, todayFactory },
  ));
  const temaRemoved = deleteTemaCascade(data, data.temas[0].id);
  assert.deepEqual(temaRemoved.removed, { temas: 1, assuntos: 1 });
  const materiaRemoved = deleteMateriaCascade(data, data.materias[0].id);
  assert.deepEqual(materiaRemoved.removed, { materias: 1, temas: 1, assuntos: 1 });
});

test('reordena matérias sem modificar a entrada', () => {
  const { idFactory, nowFactory } = createFactories();
  let data = createEmptyData();
  ({ data } = createMateria(data, { nome: 'A', corId: 'azul' }, { idFactory, nowFactory }));
  ({ data } = createMateria(data, { nome: 'B', corId: 'verde' }, { idFactory, nowFactory }));
  const originalOrder = data.materias.map(({ id }) => id);
  const reordered = reorderMaterias(data, data.materias[1].id, 0);
  assert.deepEqual(
    data.materias.map(({ id }) => id),
    originalOrder,
  );
  assert.equal(reordered.materias[0].id, originalOrder[1]);
});
