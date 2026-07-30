const documentStates = new WeakMap();

export function setOverlayInteractionState(documentObject, active) {
  if (!documentObject?.body) return;

  const root = documentObject.querySelector?.('#app') ?? null;
  const current = documentStates.get(documentObject) ?? {
    count: 0,
    root,
    previousAriaHidden: null,
    previousInert: false,
  };

  if (active) {
    if (current.count === 0) {
      current.root = root;
      current.previousAriaHidden = root?.getAttribute?.('aria-hidden') ?? null;
      current.previousInert = Boolean(root?.inert);
    }
    current.count += 1;
  } else {
    current.count = Math.max(0, current.count - 1);
  }

  const hasOverlay = current.count > 0;
  documentObject.body.classList.toggle('has-open-overlay', hasOverlay);

  if (current.root) {
    current.root.inert = hasOverlay || current.previousInert;

    if (hasOverlay) {
      current.root.setAttribute('aria-hidden', 'true');
    } else if (current.previousAriaHidden === null) {
      current.root.removeAttribute('aria-hidden');
    } else {
      current.root.setAttribute('aria-hidden', current.previousAriaHidden);
    }
  }

  if (hasOverlay) documentStates.set(documentObject, current);
  else documentStates.delete(documentObject);
}
