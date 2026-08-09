import assert from 'node:assert/strict';
import test from 'node:test';

import {
  selectAssuntoDetails,
  selectTemaDeleteImpact,
  selectTemaSections,
} from '../../src/features/materias/materia-workspace-selectors.js';
import { assunto, materia, tema, validData } from '../fixtures/data-builders.js';

test('monta seções de tema com Assuntos e limites de reordenação', () => {
  const data = validData({
    materias: [materia()],
    temas: [tema({ id: 't1', ordem: 0 }), tema({ id: 't2', ordem: 1, nome: 'Geometria' })],
    assuntos: [
      assunto({ id: 'a1', temaId: 't1', pontosProgresso: 3, metaPontosProgresso: 5 }),
      assunto({ id: 'a2', temaId: 't1', ordem: 1, pontosProgresso: 5, metaPontosProgresso: 5 }),
    ],
  });

  const sections = selectTemaSections(data, 'materia-1');
  assert.equal(sections.length, 2);
  assert.equal(sections[0].assuntos.length, 2);
  assert.equal('progress' in sections[0], false);
  assert.equal('progressSummary' in sections[0], false);
  assert.equal(sections[0].canMoveUp, false);
  assert.equal(sections[0].canMoveDown, true);
  assert.equal(sections[1].canMoveDown, false);
});

test('calcula impacto de tema e resolve detalhes de assunto', () => {
  const data = validData();
  assert.deepEqual(selectTemaDeleteImpact(data, 'tema-1'), {
    tema: data.temas[0],
    assuntos: 1,
  });
  assert.deepEqual(selectAssuntoDetails(data, 'assunto-1'), {
    assunto: data.assuntos[0],
    tema: data.temas[0],
  });
  assert.equal(selectTemaDeleteImpact(data, 'inexistente'), null);
  assert.equal(selectAssuntoDetails(data, 'inexistente'), null);
});
