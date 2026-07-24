const ICON_PATHS = Object.freeze({
  dashboard: ['M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-13h6V4h-6v3Z'],
  book: [
    'M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z',
    'M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21.5v-16Z',
  ],
  search: ['m21 21-4.35-4.35', 'M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z'],
  settings: [
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2.12 2.12-.06-.06A1.65 1.65 0 0 0 15.8 18.6a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.38 1.1V20.5h-4.84v-.2a1.65 1.65 0 0 0-.38-1.1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06-2.12-2.12.06-.06A1.65 1.65 0 0 0 4.6 15.8a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.1-.38H2.7V9.58h.2A1.65 1.65 0 0 0 4 9.2a1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06L6.33 4.2l.06.06A1.65 1.65 0 0 0 8.2 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .38-1.1V2.7h4.84v.2A1.65 1.65 0 0 0 14.8 4a1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06 2.12 2.12-.06.06A1.65 1.65 0 0 0 19.4 8.2a1.65 1.65 0 0 0 .6 1 1.65 1.65 0 0 0 1.1.38h.2v4.84h-.2A1.65 1.65 0 0 0 20 14.8a1.65 1.65 0 0 0-.6.2Z',
  ],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['m6 6 12 12', 'M18 6 6 18'],
  arrow: ['m9 18 6-6-6-6'],
  layers: ['m12 2 9 5-9 5-9-5 9-5Z', 'm3 12 9 5 9-5', 'm3 17 9 5 9-5'],
});

export function createIcon(documentObject, name, { size = 20, className = '' } = {}) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.layers;
  const svg = documentObject.createElementNS('http://www.w3.org/2000/svg', 'svg');

  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  if (className) {
    svg.setAttribute('class', className);
  }

  for (const pathDefinition of paths) {
    const path = documentObject.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathDefinition);
    svg.append(path);
  }

  return svg;
}
