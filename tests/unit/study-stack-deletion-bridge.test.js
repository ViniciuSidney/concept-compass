import assert from 'node:assert/strict';
import test from 'node:test';

import {
  STUDY_STACK_DELETION_PROTOCOL,
  StudyStackDeletionBridge,
  buildStudyStackDeletionTargets,
} from '../../src/integrations/study-stack-deletion-bridge.js';

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    values,
  };
}

function createData() {
  return {
    materias: [{ id: 'm1', nome: 'Matemática' }],
    temas: [{ id: 't1', materiaId: 'm1', nome: 'Funções' }],
    assuntos: [{ id: 'a1', temaId: 't1', nome: 'Função afim' }],
  };
}

test('monta alvos de exclusão somente por IDs estáveis da hierarquia', () => {
  assert.deepEqual(buildStudyStackDeletionTargets(createData(), ['a1']), [
    {
      subjectId: 'a1',
      subjectName: 'Função afim',
      themeId: 't1',
      themeName: 'Funções',
      matterId: 'm1',
      matterName: 'Matemática',
    },
  ]);
});

test('prepara a fila antes da exclusão local e só então libera o comando', () => {
  const storage = createStorage();
  let counter = 0;
  const bridge = new StudyStackDeletionBridge({
    storage,
    nowFactory: () => '2026-08-07T20:00:00.000Z',
    idFactory: () => `cmd-${++counter}`,
  });

  const result = bridge.executeCascade({
    data: createData(),
    subjectIds: ['a1'],
    deleteLocal: () => ({ assuntos: 1 }),
  });

  assert.deepEqual(result, { assuntos: 1 });
  const queue = JSON.parse(storage.getItem(STUDY_STACK_DELETION_PROTOCOL.commandKey));
  assert.equal(queue.commands['cmd-1'].subjectId, 'a1');
  assert.equal(queue.commands['cmd-1'].status, 'ready');
  assert.equal(queue.commands['cmd-1'].audit.subjectName, 'Função afim');
});

test('falha local cancela comando preparado e não envia exclusão ao Study Stack', () => {
  const storage = createStorage();
  const bridge = new StudyStackDeletionBridge({
    storage,
    nowFactory: () => '2026-08-07T20:00:00.000Z',
    idFactory: () => 'cmd-fail',
  });

  assert.throws(
    () =>
      bridge.executeCascade({
        data: createData(),
        subjectIds: ['a1'],
        deleteLocal() {
          throw new Error('falha local');
        },
      }),
    /falha local/,
  );

  const queue = JSON.parse(storage.getItem(STUDY_STACK_DELETION_PROTOCOL.commandKey));
  assert.deepEqual(queue.commands, {});
});

test('reconcile promove exclusão preparada quando o Assunto já não existe localmente', () => {
  const storage = createStorage();
  const bridge = new StudyStackDeletionBridge({
    storage,
    nowFactory: () => '2026-08-07T20:00:00.000Z',
    idFactory: () => 'cmd-recovery',
  });

  bridge.prepare(buildStudyStackDeletionTargets(createData(), ['a1']));
  const changed = bridge.reconcile({ materias: [], temas: [], assuntos: [] });

  assert.equal(changed, true);
  const queue = JSON.parse(storage.getItem(STUDY_STACK_DELETION_PROTOCOL.commandKey));
  assert.equal(queue.commands['cmd-recovery'].status, 'ready');
});

test('fila incompatível bloqueia a exclusão local em vez de sobrescrever dados', () => {
  const storage = createStorage();
  storage.setItem(
    STUDY_STACK_DELETION_PROTOCOL.commandKey,
    JSON.stringify({ contractVersion: '9.0.0', sourceApp: 'concept_compass', commands: {} }),
  );
  const bridge = new StudyStackDeletionBridge({ storage });
  let deleted = false;

  assert.throws(
    () =>
      bridge.executeCascade({
        data: createData(),
        subjectIds: ['a1'],
        deleteLocal() {
          deleted = true;
        },
      }),
    /incompatível|inválida/,
  );
  assert.equal(deleted, false);
});
