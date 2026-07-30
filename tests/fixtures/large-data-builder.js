import { DATA_SCHEMA_VERSION, DIFFICULTIES, MATERIA_COLORS } from '../../src/domain/constants.js';

const CREATED_AT = '2026-07-20T12:00:00.000Z';
const STUDY_DATES = Object.freeze([
  null,
  '2026-07-01',
  '2026-07-05',
  '2026-07-10',
  '2026-07-15',
  '2026-07-20',
]);
const DIFFICULTY_CYCLE = Object.freeze([
  DIFFICULTIES.NAO_DEFINIDA,
  DIFFICULTIES.FACIL,
  DIFFICULTIES.MEDIA,
  DIFFICULTIES.DIFICIL,
]);

export function createLargeData({
  materiasCount = 24,
  temasPerMateria = 10,
  assuntosPerTema = 12,
} = {}) {
  const materias = [];
  const temas = [];
  const assuntos = [];

  for (let materiaIndex = 0; materiaIndex < materiasCount; materiaIndex += 1) {
    const materiaId = `materia-ampliada-${materiaIndex}`;
    materias.push({
      id: materiaId,
      nome: `Matéria ampliada ${String(materiaIndex + 1).padStart(2, '0')}`,
      descricao: `Descrição fictícia da matéria ${materiaIndex + 1} para testes de estabilidade e desempenho.`,
      corId: MATERIA_COLORS[materiaIndex % MATERIA_COLORS.length],
      ordem: materiaIndex,
      criadoEm: CREATED_AT,
      atualizadoEm: CREATED_AT,
    });

    for (let temaIndex = 0; temaIndex < temasPerMateria; temaIndex += 1) {
      const temaId = `tema-ampliado-${materiaIndex}-${temaIndex}`;
      temas.push({
        id: temaId,
        materiaId,
        nome: `Tema ${String(temaIndex + 1).padStart(2, '0')} da matéria ${materiaIndex + 1}`,
        descricao: `Tema fictício preparado para navegação, pesquisa e movimentações repetidas.`,
        ordem: temaIndex,
        criadoEm: CREATED_AT,
        atualizadoEm: CREATED_AT,
      });

      for (let assuntoIndex = 0; assuntoIndex < assuntosPerTema; assuntoIndex += 1) {
        const globalIndex =
          materiaIndex * temasPerMateria * assuntosPerTema +
          temaIndex * assuntosPerTema +
          assuntoIndex;
        const metaPontosProgresso = 5 + (globalIndex % 6);
        const pontosProgresso = globalIndex % (metaPontosProgresso + 1);
        const marker = globalIndex % 97 === 0 ? ' revisão estratégica' : '';

        assuntos.push({
          id: `assunto-ampliado-${materiaIndex}-${temaIndex}-${assuntoIndex}`,
          temaId,
          nome: `Assunto ${String(assuntoIndex + 1).padStart(2, '0')} do tema ${temaIndex + 1}${marker}`,
          descricao: `Descrição fictícia para testar textos, pesquisa, progresso e listagens extensas${marker}.`,
          pontosProgresso,
          metaPontosProgresso,
          precisaReforco: globalIndex % 11 === 0,
          dificuldade: DIFFICULTY_CYCLE[globalIndex % DIFFICULTY_CYCLE.length],
          observacoes: `Observação fictícia ${globalIndex + 1}. Nenhum dado pessoal está presente nesta massa.`,
          ultimoEstudoEm: STUDY_DATES[globalIndex % STUDY_DATES.length],
          ordem: assuntoIndex,
          criadoEm: CREATED_AT,
          atualizadoEm: CREATED_AT,
        });
      }
    }
  }

  return {
    schemaVersion: DATA_SCHEMA_VERSION,
    materias,
    temas,
    assuntos,
  };
}
