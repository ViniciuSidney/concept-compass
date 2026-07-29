import assert from 'node:assert/strict';
import test from 'node:test';
import { createBadge } from '../../src/ui/components/badge.js';
import { createButton, createButtonLink } from '../../src/ui/components/button.js';
import { createFilterChip } from '../../src/ui/components/filter-chip.js';
import { clampProgress, createProgressBar } from '../../src/ui/components/progress-bar.js';
import { createSearchField } from '../../src/ui/components/search-field.js';
import { createSegmentedProgress } from '../../src/ui/components/segmented-progress.js';
import { createFakeDocument } from '../helpers/fake-dom.js';
test('botão aplica variante tamanho ícone e rótulo', () => {
  const { documentObject } = createFakeDocument();
  const button = createButton(documentObject, {
    label: 'Salvar',
    icon: 'check',
    variant: 'secondary',
    size: 'large',
    ariaLabel: 'Salvar exemplo',
  });
  assert.equal(button.classList.contains('button--secondary'), true);
  assert.equal(button.classList.contains('button--large'), true);
  assert.equal(button.getAttribute('aria-label'), 'Salvar exemplo');
  assert.equal(button.textContent, 'Salvar');
});
test('link desabilitado sai da tabulação', () => {
  const { documentObject } = createFakeDocument();
  const link = createButtonLink(documentObject, {
    label: 'Indisponível',
    href: '#/materias',
    disabled: true,
  });
  assert.equal(link.getAttribute('aria-disabled'), 'true');
  assert.equal(link.tabIndex, -1);
  assert.equal(link.href, '#');
});
test('badge normaliza tom desconhecido', () => {
  const { documentObject } = createFakeDocument();
  assert.equal(
    createBadge(documentObject, { label: 'Em andamento', tone: 'studying' }).classList.contains(
      'badge--studying',
    ),
    true,
  );
  assert.equal(
    createBadge(documentObject, { label: 'Outro', tone: 'x' }).classList.contains('badge--neutral'),
    true,
  );
});
test('progresso limita valores e expõe aria', () => {
  const { documentObject } = createFakeDocument();
  const progress = createProgressBar(documentObject, { value: 135, label: 'Progresso geral' });
  const track = progress.children[1];
  assert.equal(clampProgress(-20), 0);
  assert.equal(clampProgress(120), 100);
  assert.equal(track.getAttribute('aria-valuenow'), '100');
  assert.equal(track.children[0].style.getPropertyValue('--progress-value'), '100%');
});
test('filter chip alterna aria-pressed', () => {
  const { documentObject } = createFakeDocument();
  const changes = [];
  const chip = createFilterChip(documentObject, {
    label: 'Matérias',
    onChange: (value) => changes.push(value),
  });
  chip.element.dispatch('click');
  chip.element.dispatch('click');
  assert.deepEqual(changes, [true, false]);
  assert.equal(chip.element.getAttribute('aria-pressed'), 'false');
});
test('campo de pesquisa limpa valor', () => {
  const { documentObject } = createFakeDocument();
  const values = [];
  const search = createSearchField(documentObject, { onInput: (value) => values.push(value) });
  const clear = search.element.children[1].children[2];
  assert.equal(clear.hidden, true);
  search.input.value = 'Álgebra';
  search.input.dispatch('input');
  assert.equal(clear.hidden, false);
  clear.dispatch('click');
  assert.equal(search.getValue(), '');
  assert.deepEqual(values, ['Álgebra', '']);
});

test('progresso segmentado usa pontos reais até dez e normaliza metas maiores', () => {
  const { documentObject } = createFakeDocument();
  const direct = createSegmentedProgress(documentObject, { current: 3, total: 5 });
  const normalized = createSegmentedProgress(documentObject, { current: 12, total: 20 });

  assert.equal(direct.children[0].children.length, 5);
  assert.equal(
    direct.children[0].children.filter(({ classList }) => classList.contains('is-filled')).length,
    3,
  );
  assert.equal(direct.getAttribute('aria-valuetext'), '3 de 5 pontos, 60%');
  assert.equal(normalized.children[0].children.length, 10);
  assert.equal(
    normalized.children[0].children.filter(({ classList }) => classList.contains('is-filled'))
      .length,
    6,
  );
  assert.equal(normalized.children[1].textContent, '12/20 · 60%');
});
