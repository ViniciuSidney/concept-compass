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
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  'arrow-up': ['m18 15-6-6-6 6'],
  'arrow-down': ['m6 9 6 6 6-6'],
  'arrow-left': ['m15 18-6-6 6-6'],
  move: ['M5 9h11', 'm13 6 3 3-3 3', 'M19 15H8', 'm11 12-3 3 3 3'],
  'chevron-right': ['m9 18 6-6-6-6'],
  layers: ['m12 2 9 5-9 5-9-5 9-5Z', 'm3 12 9 5 9-5', 'm3 17 9 5 9-5'],
  more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  check: ['m5 12 4 4L19 6'],
  warning: [
    'M10.3 3.7 2.6 17a2 2 0 0 0 1.73 3h15.34a2 2 0 0 0 1.73-3L13.7 3.7a2 2 0 0 0-3.4 0Z',
    'M12 9v4',
    'M12 17h.01',
  ],
  info: ['M12 11v5', 'M12 8h.01', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  inbox: ['M4 4h16v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4Z', 'M4 14h4l2 3h4l2-3h4'],
  edit: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z'],
  trash: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v5', 'M14 11v5'],
  copy: ['M8 8h11v11H8V8Z', 'M5 16H4V5h11v1'],
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'],
  upload: ['M12 21V9', 'm7 14 5-5 5 5', 'M5 3h14'],
  database: [
    'M20 5c0 1.66-3.58 3-8 3s-8-1.34-8-3 3.58-3 8-3 8 1.34 8 3Z',
    'M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5',
    'M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7',
  ],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'm9 12 2 2 4-4'],
  sun: [
    'M12 3v2',
    'M12 19v2',
    'M3 12h2',
    'M19 12h2',
    'm5.64 5.64 1.42 1.42',
    'm16.94 16.94 1.42 1.42',
    'm5.64 18.36 1.42-1.42',
    'm16.94 7.06 1.42-1.42',
    'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  ],
  moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z'],
  monitor: ['M4 4h16v12H4V4Z', 'M8 20h8', 'M12 16v4'],
  panel: ['M4 4h16v16H4V4Z', 'M15 4v16'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
});
export function createIcon(documentObject, name, { size = 20, className = '' } = {}) {
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
  if (className) svg.setAttribute('class', className);
  for (const definition of ICON_PATHS[name] ?? ICON_PATHS.layers) {
    const path = documentObject.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', definition);
    svg.append(path);
  }
  return svg;
}
