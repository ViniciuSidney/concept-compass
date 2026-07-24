import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../../src/core/store.js';

test('store retorna cópia e impede mutação externa do estado interno', () => {
  const store = createStore({ count: 1, nested: { value: 'original' } });
  const snapshot = store.getState();

  snapshot.nested.value = 'alterado';

  assert.equal(store.getState().nested.value, 'original');
});

test('store atualiza estado e notifica listeners com os retratos correto', () => {
  const store = createStore({ count: 1 });
  const events = [];
  const unsubscribe = store.subscribe((nextState, previousState) => {
    events.push({ nextState, previousState });
  });

  store.updateState({ count: 2 });
  unsubscribe();
  store.updateState({ count: 3 });

  assert.equal(store.getState().count, 3);
  assert.equal(events.length, 1);
  assert.equal(events[0].previousState.count, 1);
  assert.equal(events[0].nextState.count, 2);
});

test('store rejeita atualizações que não produzem objeto', () => {
  const store = createStore({ count: 1 });

  assert.throws(() => store.setState(null), /próximo estado deve ser um objeto/i);
  assert.throws(() => store.updateState('inválido'), /atualização parcial deve ser um objeto/i);
});
