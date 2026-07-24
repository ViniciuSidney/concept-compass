import { InvariantError, NotFoundError } from '../../core/errors.js';

export function normalizeOrder(items) {
  return items
    .toSorted((left, right) => left.ordem - right.ordem)
    .map((item, ordem) => ({ ...item, ordem }));
}

export function reorderItems(items, itemId, targetIndex) {
  if (!Number.isInteger(targetIndex)) {
    throw new InvariantError('A posição de destino deve ser um número inteiro.');
  }

  const ordered = items.toSorted((left, right) => left.ordem - right.ordem);
  const currentIndex = ordered.findIndex(({ id }) => id === itemId);

  if (currentIndex < 0) {
    throw new NotFoundError('Item', itemId);
  }

  const boundedIndex = Math.max(0, Math.min(targetIndex, ordered.length - 1));
  const [movedItem] = ordered.splice(currentIndex, 1);
  ordered.splice(boundedIndex, 0, movedItem);

  return ordered.map((item, ordem) => ({ ...item, ordem }));
}

export function appendOrder(items) {
  return items.length;
}
