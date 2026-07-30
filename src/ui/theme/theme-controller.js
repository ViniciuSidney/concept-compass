const THEME_CHOICES = Object.freeze(['system', 'light', 'dark']);

export function normalizeThemeChoice(value) {
  return THEME_CHOICES.includes(value) ? value : 'system';
}

export function createThemeController({ documentObject = document, windowObject = window } = {}) {
  const root = documentObject.documentElement;
  const themeColor = documentObject.querySelector('meta[name="theme-color"]');
  const mediaQuery = windowObject.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
  const listeners = new Set();
  let themeChoice = 'system';

  function getResolvedTheme() {
    if (themeChoice !== 'system') return themeChoice;
    return mediaQuery?.matches ? 'dark' : 'light';
  }

  function getState() {
    return Object.freeze({ choice: themeChoice, resolved: getResolvedTheme() });
  }

  function applyTheme() {
    const resolvedTheme = getResolvedTheme();
    if (themeChoice === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', themeChoice);
    root.setAttribute('data-theme-choice', themeChoice);
    root.setAttribute('data-resolved-theme', resolvedTheme);
    root.style.colorScheme = resolvedTheme;
    themeColor?.setAttribute('content', resolvedTheme === 'dark' ? '#10111b' : '#f5f6fb');
    for (const listener of listeners) listener(getState());
  }

  function setTheme(nextTheme) {
    themeChoice = normalizeThemeChoice(nextTheme);
    applyTheme();
    return getState();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function handleSystemThemeChange() {
    if (themeChoice === 'system') applyTheme();
  }

  mediaQuery?.addEventListener?.('change', handleSystemThemeChange);
  applyTheme();

  return Object.freeze({
    setTheme,
    getState,
    subscribe,
    destroy() {
      mediaQuery?.removeEventListener?.('change', handleSystemThemeChange);
      listeners.clear();
    },
  });
}
