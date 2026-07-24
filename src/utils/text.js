export function normalizeWhitespace(value) {
  return String(value).trim().replace(/\s+/g, ' ');
}

export function normalizeSearchText(value) {
  return normalizeWhitespace(value)
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
