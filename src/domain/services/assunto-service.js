import { createId } from '../../utils/id.js';
import { createIsoTimestamp, createLocalDate } from '../../utils/date.js';
import { validateAppData } from '../validators/app-data-validator.js';
import { normalizeAssuntoInput } from '../validators/assunto-validator.js';
import {
  requireAssunto,
  requireTema,
  selectAssuntosByTema,
} from '../selectors/hierarchy-selectors.js';
import { reorderItems } from './ordering-service.js';

export function createAssunto(
  data,
  temaId,
  input,
  { idFactory = createId, nowFactory = createIsoTimestamp, todayFactory = createLocalDate } = {},
) {
  requireTema(data, temaId);
  const today = todayFactory();
  const normalizedInput = normalizeAssuntoInput(input, { today });
  const timestamp = nowFactory();
  const assunto = {
    id: idFactory(),
    temaId,
    ...normalizedInput,
    ordem: selectAssuntosByTema(data, temaId).length,
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };
  const nextData = validateAppData({ ...data, assuntos: [...data.assuntos, assunto] }, { today });

  return { data: nextData, assunto };
}

export function updateAssunto(
  data,
  assuntoId,
  input,
  { nowFactory = createIsoTimestamp, todayFactory = createLocalDate } = {},
) {
  const current = requireAssunto(data, assuntoId);
  const today = todayFactory();
  const normalizedInput = normalizeAssuntoInput(input, { today });
  const assunto = {
    ...current,
    ...normalizedInput,
    arquivado: Boolean(current.arquivado),
    atualizadoEm: nowFactory(),
  };
  const nextData = validateAppData(
    {
      ...data,
      assuntos: data.assuntos.map((item) => (item.id === assuntoId ? assunto : item)),
    },
    { today },
  );

  return { data: nextData, assunto };
}

export function setAssuntoArchived(
  data,
  assuntoId,
  arquivado,
  { nowFactory = createIsoTimestamp, todayFactory = createLocalDate } = {},
) {
  const current = requireAssunto(data, assuntoId);
  const today = todayFactory();
  const assunto = {
    ...current,
    arquivado: Boolean(arquivado),
    atualizadoEm: nowFactory(),
  };
  const nextData = validateAppData(
    {
      ...data,
      assuntos: data.assuntos.map((item) => (item.id === assuntoId ? assunto : item)),
    },
    { today },
  );

  return { data: nextData, assunto: nextData.assuntos.find(({ id }) => id === assuntoId) };
}

export function archiveAssunto(data, assuntoId, options = {}) {
  return setAssuntoArchived(data, assuntoId, true, options);
}

export function restoreAssunto(data, assuntoId, options = {}) {
  return setAssuntoArchived(data, assuntoId, false, options);
}

export function reorderAssuntos(data, assuntoId, targetIndex, { today = createLocalDate() } = {}) {
  const current = requireAssunto(data, assuntoId);
  const siblings = selectAssuntosByTema(data, current.temaId);
  const reordered = new Map(
    reorderItems(siblings, assuntoId, targetIndex).map((item) => [item.id, item]),
  );

  return validateAppData(
    {
      ...data,
      assuntos: data.assuntos.map((assunto) => reordered.get(assunto.id) ?? assunto),
    },
    { today },
  );
}

export function moveAssunto(
  data,
  assuntoId,
  destinationTemaId,
  { targetIndex, nowFactory = createIsoTimestamp, todayFactory = createLocalDate } = {},
) {
  const current = requireAssunto(data, assuntoId);
  requireTema(data, destinationTemaId);
  const today = todayFactory();

  if (current.temaId === destinationTemaId) {
    return reorderAssuntos(data, assuntoId, targetIndex ?? current.ordem, { today });
  }

  const sourceSiblings = selectAssuntosByTema(data, current.temaId)
    .filter(({ id }) => id !== assuntoId)
    .map((assunto, ordem) => ({ ...assunto, ordem }));
  const destinationSiblings = selectAssuntosByTema(data, destinationTemaId);
  const movedAssunto = {
    ...current,
    temaId: destinationTemaId,
    atualizadoEm: nowFactory(),
    ordem: destinationSiblings.length,
  };
  const destinationWithMoved = reorderItems(
    [...destinationSiblings, movedAssunto],
    assuntoId,
    targetIndex ?? destinationSiblings.length,
  );
  const replacements = new Map(
    [...sourceSiblings, ...destinationWithMoved].map((assunto) => [assunto.id, assunto]),
  );

  return validateAppData(
    {
      ...data,
      assuntos: data.assuntos.map((assunto) => replacements.get(assunto.id) ?? assunto),
    },
    { today },
  );
}

export function deleteAssunto(data, assuntoId, { today = createLocalDate() } = {}) {
  const current = requireAssunto(data, assuntoId);
  const remainingSiblings = selectAssuntosByTema(data, current.temaId)
    .filter(({ id }) => id !== assuntoId)
    .map((assunto, ordem) => ({ ...assunto, ordem }));
  const replacements = new Map(remainingSiblings.map((assunto) => [assunto.id, assunto]));

  return validateAppData(
    {
      ...data,
      assuntos: data.assuntos
        .filter(({ id }) => id !== assuntoId)
        .map((assunto) => replacements.get(assunto.id) ?? assunto),
    },
    { today },
  );
}
