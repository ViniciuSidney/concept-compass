import assert from 'node:assert/strict';
import test from 'node:test';

import { createRouter } from '../../src/core/router.js';

function createWindowDouble(initialHash = '#/') {
  const listeners = new Map();
  const location = {
    hash: initialHash,
    replace(nextHash) {
      this.hash = nextHash;
    },
  };

  return {
    location,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) {
        listeners.delete(type);
      }
    },
    dispatch(type) {
      listeners.get(type)?.();
    },
    hasListener(type) {
      return listeners.has(type);
    },
  };
}

test('roteador inicia, acompanha hashchange e pode ser encerrado', () => {
  const windowDouble = createWindowDouble('#/materias');
  const receivedRoutes = [];
  const router = createRouter({
    windowObject: windowDouble,
    onRouteChange: (route) => receivedRoutes.push(route.id),
  });

  router.start();
  windowDouble.location.hash = '#/pesquisa';
  windowDouble.dispatch('hashchange');
  router.stop();

  assert.deepEqual(receivedRoutes, ['materias', 'pesquisa']);
  assert.equal(windowDouble.hasListener('hashchange'), false);
});
