import {
  createAssunto,
  deleteAssunto,
  reorderAssuntos,
  updateAssunto,
} from '../../domain/services/assunto-service.js';
import {
  createTema,
  deleteTemaCascade,
  reorderTemas,
  updateTema,
} from '../../domain/services/tema-service.js';

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

  function removeTema(temaId) {
    const result = deleteTemaCascade(getData(), temaId);
    persist(result.data);
    return result.removed;
  }

  function reorderTema(temaId, targetIndex) {
    const nextData = reorderTemas(getData(), temaId, targetIndex);
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

  function removeAssunto(assuntoId, options) {
    const nextData = deleteAssunto(getData(), assuntoId, options);
    persist(nextData);
    return { assuntos: 1 };
  }

  function reorderAssunto(assuntoId, targetIndex, options) {
    const nextData = reorderAssuntos(getData(), assuntoId, targetIndex, options);
    persist(nextData);
    return nextData.assuntos.find(({ id }) => id === assuntoId);
  }

  return Object.freeze({
    getData,
    addTema,
    editTema,
    removeTema,
    reorderTema,
    addAssunto,
    editAssunto,
    removeAssunto,
    reorderAssunto,
  });
}
