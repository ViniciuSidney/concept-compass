import { MigrationError } from '../../core/errors.js';
import { DATA_SCHEMA_VERSION, PROGRESS_POINTS } from '../../domain/constants.js';
import { cloneValue } from '../../utils/clone.js';
import { isPlainObject } from '../../utils/object.js';

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

export function convertLegacyState(state) {
  const total = PROGRESS_POINTS.DEFAULT_TOTAL;
  if (state === LEGACY_STUDY_STATES.EM_ESTUDO) {
    return { pontosProgresso: 1, metaPontosProgresso: total, precisaReforco: false };
  }
  if (state === LEGACY_STUDY_STATES.ESTUDADO) {
    return { pontosProgresso: 3, metaPontosProgresso: total, precisaReforco: false };
  }
  if (state === LEGACY_STUDY_STATES.PRECISA_REFORCO) {
    return { pontosProgresso: 3, metaPontosProgresso: total, precisaReforco: true };
  }
  if (state === LEGACY_STUDY_STATES.CONSOLIDADO) {
    return { pontosProgresso: total, metaPontosProgresso: total, precisaReforco: false };
  }
  return { pontosProgresso: 0, metaPontosProgresso: total, precisaReforco: false };
}

const DATA_MIGRATIONS = new Map([[1, migrateV1ToV2]]);
