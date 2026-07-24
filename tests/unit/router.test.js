import assert from 'node:assert/strict';
import test from 'node:test';

import { parseRoute } from '../../src/core/router.js';

test('interpreta as rotas globais oficiais', () => {
  assert.equal(parseRoute('#/').id, 'dashboard');
  assert.equal(parseRoute('#/materias').id, 'materias');
  assert.equal(parseRoute('#/pesquisa').id, 'pesquisa');
  assert.equal(parseRoute('#/configuracoes').id, 'configuracoes');
});

test('extrai o identificador de uma matéria', () => {
  const route = parseRoute('#/materias/materia-123');

  assert.equal(route.id, 'materia');
  assert.equal(route.params.materiaId, 'materia-123');
});

test('preserva parâmetros de pesquisa', () => {
  const route = parseRoute('#/pesquisa?q=raz%C3%A3o%20e%20propor%C3%A7%C3%A3o');

  assert.equal(route.query.q, 'razão e proporção');
});

test('rota desconhecida produz Conteúdo Não Encontrado', () => {
  const route = parseRoute('#/rota-inexistente');

  assert.equal(route.id, 'nao-encontrado');
  assert.equal(route.isNotFound, true);
  assert.equal(route.pathname, '/rota-inexistente');
});
