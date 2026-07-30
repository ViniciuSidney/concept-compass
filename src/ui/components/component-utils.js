let componentIdSequence = 0;

export function createComponentId(prefix = 'component') {
  componentIdSequence += 1;
  return `${prefix}-${componentIdSequence}`;
}

export function appendContent(element, content) {
  if (content === null || content === undefined || content === false) return element;
  if (Array.isArray(content)) {
    for (const item of content) appendContent(element, item);
    return element;
  }
  if (typeof content === 'string' || typeof content === 'number') {
    element.append(String(content));
    return element;
  }
  element.append(content);
  return element;
}

export function getFocusableElements(container) {
  if (typeof container?.querySelectorAll !== 'function') return [];

  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => {
    if (element.hidden || element.disabled || element.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    const hiddenAncestor = element.closest?.('[hidden], [aria-hidden="true"], [inert]');
    return !hiddenAncestor;
  });
}
