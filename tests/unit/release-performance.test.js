import assert from 'node:assert/strict';
import test from 'node:test';
import { performance } from 'node:perf_hooks';

import { validateAppData } from '../../src/domain/validators/app-data-validator.js';
import {
  selectDashboardSummary,
  selectMateriaProgressHighlights,
  selectProgressDistribution,
  selectRecentStudies,
  selectStudyPriorities,
} from '../../src/features/dashboard/dashboard-selectors.js';
import {
  SEARCH_TYPES,
  selectSearchCounts,
  selectSearchResults,
} from '../../src/features/pesquisa/pesquisa-selectors.js';
import { createLargeData } from '../fixtures/large-data-builder.js';

const MAX_TOTAL_MS = 5_000;

function createStudyStackSnapshot(data) {
  const temasById = new Map(data.temas.map((tema) => [tema.id, tema]));

  const subjects = Object.fromEntries(
    data.assuntos.map((assunto, index) => {
      const tema = temasById.get(assunto.temaId);
      const progress = (index % 10) + 1;
      const consolidated = progress === 10;
      const lastActivityAt = `2026-07-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`;

      return [
        assunto.id,
        {
          subjectId: assunto.id,
          matterId: tema?.materiaId ?? '',
          themeId: assunto.temaId,
          progress,
          maxProgress: 10,
          status: consolidated ? 'consolidated' : 'in_progress',
          sourceArchived: false,
          pendingErrors: index % 11 === 0 ? 1 : 0,
          pendingReviews: index % 17 === 0 ? 1 : 0,
          lastActivityAt,
          consolidated,
        },
      ];
    }),
  );

  return {
    status: 'ready',
    summary: {
      contractVersion: '1.0.0',
      sourceApp: 'study_stack',
      updatedAt: '2026-07-30T12:00:00.000Z',
      subjects,
    },
    fingerprint: 'release-performance-fixture',
    receivedContractVersion: '1.0.0',
    errors: [],
  };
}

test('massa ampliada permanece válida e utilizável nos seletores principais', () => {
  const startedAt = performance.now();
  const source = createLargeData();
  const data = validateAppData(source, { today: '2026-07-30' });
  const studyStackSnapshot = createStudyStackSnapshot(data);

  assert.equal(data.materias.length, 24);
  assert.equal(data.temas.length, 240);
  assert.equal(data.assuntos.length, 2_880);

  const summary = selectDashboardSummary(data, studyStackSnapshot);
  const distribution = selectProgressDistribution(data, studyStackSnapshot);
  const priorities = selectStudyPriorities(data, { limit: 12, studyStackSnapshot });
  const recent = selectRecentStudies(data, { limit: 12, studyStackSnapshot });
  const highlights = selectMateriaProgressHighlights(data, {
    limit: 8,
    studyStackSnapshot,
  });
  const searchResults = selectSearchResults(data, {
    query: 'revisao estrategica',
    type: SEARCH_TYPES.ASSUNTO,
    studyStackSnapshot,
  });
  const searchCounts = selectSearchCounts(data, { query: 'revisao estrategica' });

  assert.equal(summary.assuntosCount, 2_880);
  assert.equal(
    distribution.reduce((total, item) => total + item.count, 0),
    2_880,
  );
  assert.equal(priorities.length, 12);
  assert.equal(recent.length, 12);
  assert.equal(highlights.length, 8);
  assert.ok(searchResults.length > 0);
  assert.equal(searchCounts[SEARCH_TYPES.ASSUNTO], searchResults.length);

  const elapsed = performance.now() - startedAt;
  assert.ok(
    elapsed < MAX_TOTAL_MS,
    `A regressão ampliada levou ${elapsed.toFixed(1)} ms; limite de segurança: ${MAX_TOTAL_MS} ms.`,
  );
});
