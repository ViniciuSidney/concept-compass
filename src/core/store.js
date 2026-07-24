function cloneValue(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function freezeShallow(value) {
  if (value && typeof value === 'object') {
    return Object.freeze(value);
  }

  return value;
}

export function createStore(initialState) {
  let state = cloneValue(initialState);
  const listeners = new Set();

  function getState() {
    return freezeShallow(cloneValue(state));
  }

  function setState(nextStateOrUpdater) {
    const currentSnapshot = getState();
    const candidate =
      typeof nextStateOrUpdater === 'function'
        ? nextStateOrUpdater(currentSnapshot)
        : nextStateOrUpdater;

    if (!candidate || typeof candidate !== 'object') {
      throw new TypeError('O próximo estado deve ser um objeto.');
    }

    state = cloneValue(candidate);
    const nextSnapshot = getState();

    for (const listener of listeners) {
      listener(nextSnapshot, currentSnapshot);
    }

    return nextSnapshot;
  }

  function updateState(partialStateOrUpdater) {
    return setState((currentState) => {
      const partialState =
        typeof partialStateOrUpdater === 'function'
          ? partialStateOrUpdater(currentState)
          : partialStateOrUpdater;

      if (!partialState || typeof partialState !== 'object') {
        throw new TypeError('A atualização parcial deve ser um objeto.');
      }

      return {
        ...currentState,
        ...partialState,
      };
    });
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('O listener do store deve ser uma função.');
    }

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  return Object.freeze({
    getState,
    setState,
    updateState,
    subscribe,
  });
}
