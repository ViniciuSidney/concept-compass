import {
  archiveMateria,
  deleteMateriaCascade,
  createMateria,
  reorderMaterias,
  restoreMateria,
  updateMateria,
} from '../../domain/services/materia-service.js';
import { selectAssuntosByMateria } from '../../domain/selectors/hierarchy-selectors.js';
import { runStudyStackDeletionCascade } from '../../integrations/study-stack-deletion-bridge.js';

export function createMateriasController({ store, repository }) {
  if (!store || !repository) {
    throw new TypeError('O controlador de matérias exige store e repositório.');
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

  function add(input, options) {
    const result = createMateria(getData(), input, options);
    persist(result.data);
    return result.materia;
  }

  function edit(materiaId, input, options) {
    const result = updateMateria(getData(), materiaId, input, options);
    persist(result.data);
    return result.materia;
  }

  function archive(materiaId, options) {
    const result = archiveMateria(getData(), materiaId, options);
    persist(result.data);
    return result.materia;
  }

  function restore(materiaId, options) {
    const result = restoreMateria(getData(), materiaId, options);
    persist(result.data);
    return result.materia;
  }

  function remove(materiaId) {
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

  function reorder(materiaId, targetIndex) {
    const nextData = reorderMaterias(getData(), materiaId, targetIndex);
    persist(nextData);
    return nextData.materias.find(({ id }) => id === materiaId);
  }

  return Object.freeze({ getData, add, edit, archive, restore, remove, reorder });
}
