import {
  selectAssuntoById,
  selectMateriaById,
  selectTemaById,
} from '../domain/selectors/hierarchy-selectors.js';

export const STUDY_STACK_DELETION_PROTOCOL = Object.freeze({
  contractVersion: '1.0.0',
  sourceApp: 'concept_compass',
  commandKey: 'study-stack:integration:deletion-commands:v1',
  acknowledgementKey: 'study-stack:integration:deletion-acks:v1',
});

let configuredBridge = null;
let fallbackSequence = 0;

function nowIso() {
  return new Date().toISOString();
}

function fallbackId(subjectId, now) {
  fallbackSequence += 1;
  return `delete-${subjectId}-${Date.parse(now) || Date.now()}-${fallbackSequence}`;
}

function clone(value) {
  return structuredClone(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function emptyQueue(config, updatedAt) {
  return {
    contractVersion: config.contractVersion,
    sourceApp: config.sourceApp,
    updatedAt,
    commands: {},
  };
}

export function buildStudyStackDeletionTargets(data, subjectIds) {
  const uniqueIds = [...new Set(subjectIds)].filter(Boolean);

  return uniqueIds.map((subjectId) => {
    const assunto = selectAssuntoById(data, subjectId);
    if (!assunto) {
      throw new RangeError(`O Assunto ${subjectId} não existe para exclusão vinculada.`);
    }

    const tema = selectTemaById(data, assunto.temaId);
    const materia = tema ? selectMateriaById(data, tema.materiaId) : null;

    if (!tema || !materia) {
      throw new RangeError(`Não foi possível resolver a hierarquia do Assunto ${subjectId}.`);
    }

    return Object.freeze({
      subjectId: assunto.id,
      subjectName: assunto.nome,
      themeId: tema.id,
      themeName: tema.nome,
      matterId: materia.id,
      matterName: materia.nome,
    });
  });
}

export class StudyStackDeletionBridge {
  constructor({
    storage,
    config = STUDY_STACK_DELETION_PROTOCOL,
    nowFactory = nowIso,
    idFactory = fallbackId,
  }) {
    if (!storage?.getItem || !storage?.setItem) {
      throw new TypeError('O armazenamento é obrigatório para a exclusão vinculada.');
    }

    this.storage = storage;
    this.config = config;
    this.nowFactory = nowFactory;
    this.idFactory = idFactory;
  }

  executeCascade({ data, subjectIds, deleteLocal }) {
    if (typeof deleteLocal !== 'function') {
      throw new TypeError('A exclusão vinculada exige a operação local.');
    }

    const targets = buildStudyStackDeletionTargets(data, subjectIds);
    if (targets.length === 0) {
      return deleteLocal();
    }

    const commandIds = this.prepare(targets);
    let localResult;

    try {
      localResult = deleteLocal();
    } catch (error) {
      this.cancel(commandIds);
      throw error;
    }

    try {
      this.commit(commandIds);
    } catch {
      // A fila preparada permanece no armazenamento. Na próxima inicialização,
      // o reconcile() a promove para pronta quando o Assunto já não existir localmente.
    }

    return localResult;
  }

  prepare(targets) {
    const now = this.nowFactory();
    const queue = this.readQueue({ createIfMissing: true, updatedAt: now });
    const commandIds = [];

    for (const target of targets) {
      const commandId = this.idFactory(target.subjectId, now);
      queue.commands[commandId] = {
        contractVersion: this.config.contractVersion,
        commandId,
        type: 'delete_subject',
        status: 'prepared',
        subjectId: target.subjectId,
        matterId: target.matterId,
        themeId: target.themeId,
        requestedAt: now,
        committedAt: null,
        sourceApp: this.config.sourceApp,
        audit: {
          matterName: target.matterName,
          themeName: target.themeName,
          subjectName: target.subjectName,
        },
      };
      commandIds.push(commandId);
    }

    queue.updatedAt = now;
    this.writeQueue(queue);
    return commandIds;
  }

  commit(commandIds) {
    const now = this.nowFactory();
    const queue = this.readQueue({ createIfMissing: false });
    let changed = false;

    for (const commandId of commandIds) {
      const command = queue.commands[commandId];
      if (!command || command.status !== 'prepared') continue;
      queue.commands[commandId] = {
        ...command,
        status: 'ready',
        committedAt: now,
      };
      changed = true;
    }

    if (changed) {
      queue.updatedAt = now;
      this.writeQueue(queue);
    }
  }

  cancel(commandIds) {
    try {
      const queue = this.readQueue({ createIfMissing: false });
      let changed = false;

      for (const commandId of commandIds) {
        if (queue.commands[commandId]?.status !== 'prepared') continue;
        delete queue.commands[commandId];
        changed = true;
      }

      if (changed) {
        queue.updatedAt = this.nowFactory();
        this.writeQueue(queue);
      }
    } catch {
      // Cancelamento é best effort: a fila preparada nunca é processada pelo Study Stack.
    }
  }

  reconcile(data) {
    const existingIds = new Set(data?.assuntos?.map(({ id }) => id) ?? []);
    const queue = this.readQueue({ createIfMissing: false, allowMissing: true });
    if (!queue) return false;

    const now = this.nowFactory();
    let changed = false;

    for (const [commandId, command] of Object.entries(queue.commands)) {
      if (command.status !== 'prepared') continue;
      if (existingIds.has(command.subjectId)) continue;

      queue.commands[commandId] = {
        ...command,
        status: 'ready',
        committedAt: command.committedAt ?? now,
      };
      changed = true;
    }

    if (changed) {
      queue.updatedAt = now;
      this.writeQueue(queue);
    }

    return changed;
  }

  readQueue({ createIfMissing = false, updatedAt = this.nowFactory(), allowMissing = false } = {}) {
    let raw;
    try {
      raw = this.storage.getItem(this.config.commandKey);
    } catch (error) {
      throw new Error('Não foi possível acessar a fila de exclusão do Study Stack.', {
        cause: error,
      });
    }

    if (raw === null) {
      if (allowMissing) return null;
      if (createIfMissing) return emptyQueue(this.config, updatedAt);
      return emptyQueue(this.config, updatedAt);
    }

    let queue;
    try {
      queue = JSON.parse(raw);
    } catch (error) {
      throw new Error('A fila de exclusão vinculada contém JSON inválido.', { cause: error });
    }

    if (
      !isPlainObject(queue) ||
      queue.contractVersion !== this.config.contractVersion ||
      queue.sourceApp !== this.config.sourceApp ||
      !isPlainObject(queue.commands)
    ) {
      throw new Error('A fila de exclusão vinculada é incompatível ou inválida.');
    }

    return clone(queue);
  }

  writeQueue(queue) {
    try {
      this.storage.setItem(this.config.commandKey, JSON.stringify(queue));
    } catch (error) {
      throw new Error('Não foi possível registrar a exclusão vinculada no Study Stack.', {
        cause: error,
      });
    }
  }
}

export function configureStudyStackDeletionBridge(options) {
  configuredBridge = new StudyStackDeletionBridge(options);
  return configuredBridge;
}

export function getConfiguredStudyStackDeletionBridge() {
  return configuredBridge;
}

export function runStudyStackDeletionCascade({ data, subjectIds, deleteLocal }) {
  if (!configuredBridge) {
    return deleteLocal();
  }

  return configuredBridge.executeCascade({ data, subjectIds, deleteLocal });
}
