import {
  archiveAssunto,
  changeAssuntoProgress,
  completeAssuntoProgress,
  createAssunto,
  deleteAssunto,
  increaseAssuntoProgressTotal,
  moveAssunto,
  reorderAssuntos,
  resetAssuntoProgress,
  restoreAssunto,
  setAssuntoProgress,
  updateAssunto,
} from '../../domain/services/assunto-service.js';
import {
  archiveTema,
  createTema,
  deleteTemaCascade,
  moveTema,
  reorderTemas,
  restoreTema,
  updateTema,
} from '../../domain/services/tema-service.js';
import {
  archiveMateria,
  deleteMateriaCascade,
  restoreMateria,
  updateMateria,
} from '../../domain/services/materia-service.js';
import {
  selectAssuntosByMateria,
  selectAssuntosByTema,
} from '../../domain/selectors/hierarchy-selectors.js';
import { runStudyStackDeletionCascade } from '../../integrations/study-stack-deletion-bridge.js';

export function createMateriaWorkspaceController({ store, repository }) {
  if (!store || !repository) {
    throw new TypeError('O controlador da matéria exige store e repositório.');
  }

  function getData() {
    return store.getState().data;
  }

  function persist(nextData) {
    const currentState = store.getState();

    store.updateState({
      status: {
        ...currentState.status,
        saving: true,
        lastError: null,
      },
    });

    try {
      const savedData = repository.saveData(nextData);
      const latestState = store.getState();

      store.updateState({
        data: savedData,
        status: {
          ...latestState.status,
          saving: false,
          lastError: null,
        },
      });

      return savedData;
    } catch (error) {
      const latestState = store.getState();

      store.updateState({
        status: {
          ...latestState.status,
          saving: false,
          lastError: {
            name: error.name,
            message: error.message,
            code: error.code ?? 'APP_ERROR',
          },
        },
      });

      throw error;
    }
  }

  function editMateria(materiaId, input, options) {
    const result = updateMateria(getData(), materiaId, input, options);
    persist(result.data);
    return result.materia;
  }

  function archiveMateriaItem(materiaId, options) {
    const result = archiveMateria(getData(), materiaId, options);
    persist(result.data);
    return result.materia;
  }

  function restoreMateriaItem(materiaId, options) {
    const result = restoreMateria(getData(), materiaId, options);
    persist(result.data);
    return result.materia;
  }

  function removeMateria(materiaId) {
    const currentData = getData();
    const subjectIds = selectAssuntosByMateria(currentData, materiaId).map(({ id }) => id);

    return runStudyStackDeletionCascade({
      data: currentData,
      subjectIds,
      deleteLocal() {
        const result = deleteMateriaCascade(currentData, materiaId);
        persist(result.data);
        return result.removed;
      },
    });
  }

  function addTema(materiaId, input, options) {
    const result = createTema(getData(), materiaId, input, options);
    persist(result.data);
    return result.tema;
  }

  function editTema(temaId, input, options) {
    const result = updateTema(getData(), temaId, input, options);
    persist(result.data);
    return result.tema;
  }

  function archiveTemaItem(temaId, options) {
    const result = archiveTema(getData(), temaId, options);
    persist(result.data);
    return result.tema;
  }

  function restoreTemaItem(temaId, options) {
    const result = restoreTema(getData(), temaId, options);
    persist(result.data);
    return result.tema;
  }

  function removeTema(temaId) {
    const currentData = getData();
    const subjectIds = selectAssuntosByTema(currentData, temaId).map(({ id }) => id);

    return runStudyStackDeletionCascade({
      data: currentData,
      subjectIds,
      deleteLocal() {
        const result = deleteTemaCascade(currentData, temaId);
        persist(result.data);
        return result.removed;
      },
    });
  }

  function reorderTema(temaId, targetIndex) {
    const nextData = reorderTemas(getData(), temaId, targetIndex);
    persist(nextData);
    return nextData.temas.find(({ id }) => id === temaId);
  }

  function moveTemaTo(temaId, destinationMateriaId, options) {
    const nextData = moveTema(getData(), temaId, destinationMateriaId, options);
    persist(nextData);
    return nextData.temas.find(({ id }) => id === temaId);
  }

  function addAssunto(temaId, input, options) {
    const result = createAssunto(getData(), temaId, input, options);
    persist(result.data);
    return result.assunto;
  }

  function editAssunto(assuntoId, input, options) {
    const result = updateAssunto(getData(), assuntoId, input, options);
    persist(result.data);
    return result.assunto;
  }

  function archiveAssuntoItem(assuntoId, options) {
    const result = archiveAssunto(getData(), assuntoId, options);
    persist(result.data);
    return result.assunto;
  }

  function restoreAssuntoItem(assuntoId, options) {
    const result = restoreAssunto(getData(), assuntoId, options);
    persist(result.data);
    return result.assunto;
  }

  function adjustAssuntoProgress(assuntoId, input, options) {
    const result = setAssuntoProgress(getData(), assuntoId, input, options);
    persist(result.data);
    return result.assunto;
  }

  function changeProgress(assuntoId, delta, options) {
    const result = changeAssuntoProgress(getData(), assuntoId, delta, options);
    persist(result.data);
    return result.assunto;
  }

  function increaseProgressTotal(assuntoId, options) {
    const result = increaseAssuntoProgressTotal(getData(), assuntoId, options);
    persist(result.data);
    return result.assunto;
  }

  function completeProgress(assuntoId, options) {
    const result = completeAssuntoProgress(getData(), assuntoId, options);
    persist(result.data);
    return result.assunto;
  }

  function resetProgress(assuntoId, options) {
    const result = resetAssuntoProgress(getData(), assuntoId, options);
    persist(result.data);
    return result.assunto;
  }

  function removeAssunto(assuntoId, options) {
    const currentData = getData();

    return runStudyStackDeletionCascade({
      data: currentData,
      subjectIds: [assuntoId],
      deleteLocal() {
        const nextData = deleteAssunto(currentData, assuntoId, options);
        persist(nextData);
        return { assuntos: 1 };
      },
    });
  }

  function reorderAssunto(assuntoId, targetIndex, options) {
    const nextData = reorderAssuntos(getData(), assuntoId, targetIndex, options);
    persist(nextData);
    return nextData.assuntos.find(({ id }) => id === assuntoId);
  }

  function moveAssuntoTo(assuntoId, destinationTemaId, options) {
    const nextData = moveAssunto(getData(), assuntoId, destinationTemaId, options);
    persist(nextData);
    return nextData.assuntos.find(({ id }) => id === assuntoId);
  }

  return Object.freeze({
    getData,
    editMateria,
    archiveMateria: archiveMateriaItem,
    restoreMateria: restoreMateriaItem,
    removeMateria,
    addTema,
    editTema,
    archiveTema: archiveTemaItem,
    restoreTema: restoreTemaItem,
    removeTema,
    reorderTema,
    moveTemaTo,
    addAssunto,
    editAssunto,
    archiveAssunto: archiveAssuntoItem,
    restoreAssunto: restoreAssuntoItem,
    adjustAssuntoProgress,
    changeProgress,
    increaseProgressTotal,
    completeProgress,
    resetProgress,
    removeAssunto,
    reorderAssunto,
    moveAssuntoTo,
  });
}
