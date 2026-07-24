import { InvariantError } from '../core/errors.js';

function bytesToUuid(bytes) {
  const normalized = Uint8Array.from(bytes);
  normalized[6] = (normalized[6] & 0x0f) | 0x40;
  normalized[8] = (normalized[8] & 0x3f) | 0x80;

  const hexadecimal = [...normalized].map((byte) => byte.toString(16).padStart(2, '0'));

  return [
    hexadecimal.slice(0, 4).join(''),
    hexadecimal.slice(4, 6).join(''),
    hexadecimal.slice(6, 8).join(''),
    hexadecimal.slice(8, 10).join(''),
    hexadecimal.slice(10, 16).join(''),
  ].join('-');
}

export function createId(cryptoObject = globalThis.crypto) {
  if (typeof cryptoObject?.randomUUID === 'function') {
    return cryptoObject.randomUUID();
  }

  if (typeof cryptoObject?.getRandomValues === 'function') {
    return bytesToUuid(cryptoObject.getRandomValues(new Uint8Array(16)));
  }

  throw new InvariantError('O navegador não oferece uma fonte segura para gerar identificadores.');
}
