import { MigrationError } from '../../core/errors.js';
import { DATA_SCHEMA_VERSION } from '../../domain/constants.js';
import { cloneValue } from '../../utils/clone.js';
import { isPlainObject } from '../../utils/object.js';

const LEGACY_PROGRESS_TOTAL = 5;
const LEGACY_STUDY_STATES = Object.freeze({
  NAO_INICIADO: 'nao_iniciado',
  EM_ESTUDO: 'em_estudo',
  ESTUDADO: 'estudado',
  PRECISA_REFORCO: 'precisa_reforco',
  CONSOLIDADO: 'consolidado',
});

export function migrateData(value) {
  if (!isPlainObject(value) || !Number.isInteger(value.schemaVersion)) {
    throw new MigrationError('Não foi possível identificar a versão da estrutura dos dados.');
  }
  if (value.schemaVersion > DATA_SCHEMA_VERSION) {
    throw new MigrationError(
      'O arquivo utiliza uma versão de dados mais recente que a aplicação.',
      {
        details: { received: value.schemaVersion, supported: DATA_SCHEMA_VERSION },
      },
    );
  }
  if (value.schemaVersion < 1) {
    throw new MigrationError('A versão da estrutura dos dados não pode ser migrada.');
  }

  let migrated = cloneValue(value);
  while (migrated.schemaVersion < DATA_SCHEMA_VERSION) {
    const migration = DATA_MIGRATIONS.get(migrated.schemaVersion);
    if (!migration) {
      throw new MigrationError('Não existe uma sequência segura de migração para esses dados.');
    }
    migrated = migration(migrated);
  }
  return migrated;
}

function migrateV1ToV2(data) {
  return {
    ...data,
    schemaVersion: 2,
    assuntos: data.assuntos.map((assunto) => {
      const { estado, ...preserved } = assunto;
      const converted = convertLegacyState(estado);
      return { ...preserved, ...converted };
    }),
  };
}

function migrateV2ToV3(data) {
  return {
    ...data,
    schemaVersion: 3,
    assuntos: data.assuntos.map((assunto) => {
      const preserved = { ...assunto };
      delete preserved.pontosProgresso;
      delete preserved.metaPontosProgresso;
      delete preserved.precisaReforco;
      delete preserved.ultimoEstudoEm;
      return preserved;
    }),
  };
}

export function convertLegacyState(state) {
  if (state === LEGACY_STUDY_STATES.EM_ESTUDO) {
    return {
      pontosProgresso: 1,
      metaPontosProgresso: LEGACY_PROGRESS_TOTAL,
      precisaReforco: false,
    };
  }
  if (state === LEGACY_STUDY_STATES.ESTUDADO) {
    return {
      pontosProgresso: 3,
      metaPontosProgresso: LEGACY_PROGRESS_TOTAL,
      precisaReforco: false,
    };
  }
  if (state === LEGACY_STUDY_STATES.PRECISA_REFORCO) {
    return {
      pontosProgresso: 3,
      metaPontosProgresso: LEGACY_PROGRESS_TOTAL,
      precisaReforco: true,
    };
  }
  if (state === LEGACY_STUDY_STATES.CONSOLIDADO) {
    return {
      pontosProgresso: LEGACY_PROGRESS_TOTAL,
      metaPontosProgresso: LEGACY_PROGRESS_TOTAL,
      precisaReforco: false,
    };
  }
  return {
    pontosProgresso: 0,
    metaPontosProgresso: LEGACY_PROGRESS_TOTAL,
    precisaReforco: false,
  };
}

const DATA_MIGRATIONS = new Map([
  [1, migrateV1ToV2],
  [2, migrateV2ToV3],
]);
