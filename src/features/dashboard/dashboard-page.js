import { DIFFICULTIES } from '../../domain/constants.js';
import { createBadge } from '../../ui/components/badge.js';
import { createButtonLink } from '../../ui/components/button.js';
import { createPageHeader } from '../../ui/components/page-header.js';
import { createProgressBar } from '../../ui/components/progress-bar.js';
import { createIcon } from '../../ui/icons/icon.js';
import { createEmptyState } from '../../ui/states/empty-state.js';
import {
  getDifficultyPresentation,
  getProgressPresentation,
  formatLocalDate,
} from '../materias/assunto-presentation.js';
import {
  selectDashboardSummary,
  selectMateriaProgressHighlights,
  selectRecentStudies,
  selectProgressDistribution,
  selectStudyPriorities,
} from './dashboard-selectors.js';

export function createDashboardPage(documentObject, _route, context) {
  const data = context.store.getState().data;
  const summary = selectDashboardSummary(data);
  const page = documentObject.createElement('div');
  const header = createPageHeader(documentObject, {
    eyebrow: 'Visão Geral',
    title: 'Seu mapa de estudos',
    description:
      'Acompanhe o avanço da sua organização e identifique rapidamente o que merece atenção.',
    actions: createButtonLink(documentObject, {
      label: data.materias.length ? 'Abrir matérias' : 'Criar matéria',
      href: '#/materias',
      icon: data.materias.length ? 'book' : 'plus',
    }),
  });

  page.className = 'dashboard-page';
  page.append(header);

  if (data.materias.length === 0) {
    page.append(
      createEmptyState(documentObject, {
        title: 'Sua organização ainda está vazia',
        message:
          'Crie a primeira matéria e depois adicione temas e assuntos para liberar os indicadores de progresso.',
        icon: 'dashboard',
        action: createButtonLink(documentObject, {
          label: 'Criar primeira matéria',
          href: '#/materias',
          icon: 'plus',
        }),
      }),
    );
    return page;
  }

  page.append(
    createOverview(documentObject, summary),
    createMetrics(documentObject, summary),
    createPrimaryGrid(documentObject, data),
    createSecondaryGrid(documentObject, data),
  );

  return page;
}

function createOverview(documentObject, summary) {
  const section = documentObject.createElement('section');
  const content = documentObject.createElement('div');
  const eyebrow = documentObject.createElement('p');
  const title = documentObject.createElement('h2');
  const description = documentObject.createElement('p');
  const progressArea = documentObject.createElement('div');
  const value = documentObject.createElement('strong');
  const label = documentObject.createElement('span');
  const structure = documentObject.createElement('div');

  section.className = 'dashboard-overview';
  content.className = 'dashboard-overview__content';
  eyebrow.className = 'dashboard-overview__eyebrow';
  eyebrow.textContent = 'Progresso geral';
  title.textContent = createProgressTitle(summary);
  description.textContent = createProgressDescription(summary);
  content.append(eyebrow, title, description);

  progressArea.className = 'dashboard-overview__progress';
  value.className = 'dashboard-overview__value';
  value.textContent = summary.progress === null ? '—' : `${Math.round(summary.progress)}%`;
  label.textContent =
    summary.progress === null
      ? 'Sem assuntos avaliáveis'
      : `${summary.points} de ${summary.totalPoints} pontos`;
  progressArea.append(value, label);
  if (summary.progress !== null) {
    progressArea.append(
      createProgressBar(documentObject, {
        value: summary.progress,
        label: 'Progresso geral dos assuntos',
        showValue: false,
      }),
    );
  }

  structure.className = 'dashboard-overview__structure';
  structure.append(
    createStructureNote(
      documentObject,
      summary.materiasSemTemasCount,
      'matéria sem temas',
      'matérias sem temas',
    ),
    createStructureNote(
      documentObject,
      summary.temasSemAssuntosCount,
      'tema sem assuntos',
      'temas sem assuntos',
    ),
  );

  section.append(content, progressArea, structure);
  return section;
}

function createMetrics(documentObject, summary) {
  const section = documentObject.createElement('section');
  const title = documentObject.createElement('h2');
  const grid = documentObject.createElement('div');

  section.className = 'dashboard-section dashboard-metrics-section';
  title.className = 'visually-hidden';
  title.textContent = 'Indicadores gerais';
  grid.className = 'dashboard-metrics';
  grid.append(
    createMetricCard(documentObject, {
      label: 'Matérias',
      value: summary.materiasCount,
      note: 'Grandes áreas organizadas',
      icon: 'book',
    }),
    createMetricCard(documentObject, {
      label: 'Temas',
      value: summary.temasCount,
      note: 'Divisões de conteúdo',
      icon: 'layers',
    }),
    createMetricCard(documentObject, {
      label: 'Assuntos',
      value: summary.assuntosCount,
      note: 'Unidades específicas',
      icon: 'dashboard',
    }),
    createMetricCard(documentObject, {
      label: 'Precisam de reforço',
      value: summary.reforcoCount,
      note: summary.reforcoCount ? 'Pedem atenção prioritária' : 'Nenhuma pendência marcada',
      icon: 'warning',
      tone: summary.reforcoCount ? 'warning' : 'success',
    }),
  );

  section.append(title, grid);
  return section;
}

function createPrimaryGrid(documentObject, data) {
  const grid = documentObject.createElement('div');
  grid.className = 'dashboard-grid dashboard-grid--primary';
  grid.append(
    createProgressDistributionSection(documentObject, data),
    createPrioritiesSection(documentObject, data),
  );
  return grid;
}

function createSecondaryGrid(documentObject, data) {
  const grid = documentObject.createElement('div');
  grid.className = 'dashboard-grid dashboard-grid--secondary';
  grid.append(
    createMateriaHighlightsSection(documentObject, data),
    createRecentStudiesSection(documentObject, data),
  );
  return grid;
}

function createProgressDistributionSection(documentObject, data) {
  const section = createDashboardCard(documentObject, {
    title: 'Situação do progresso',
    description: 'Distribuição entre assuntos não iniciados, em andamento e com a meta concluída.',
  });
  const distribution = selectProgressDistribution(data);
  const list = documentObject.createElement('div');
  list.className = 'dashboard-state-list';

  if (data.assuntos.length === 0) {
    section.body.append(
      createInlineEmpty(documentObject, 'Nenhum assunto cadastrado para calcular a distribuição.'),
    );
    return section.element;
  }

  for (const entry of distribution) {
    const row = documentObject.createElement('div');
    const header = documentObject.createElement('div');
    const count = documentObject.createElement('span');
    const track = documentObject.createElement('div');
    const fill = documentObject.createElement('span');
    const presentation = {
      label: entry.label,
      tone:
        entry.status === 'complete'
          ? 'consolidated'
          : entry.status === 'in_progress'
            ? 'studying'
            : 'not-started',
    };

    row.className = 'dashboard-state-row';
    header.className = 'dashboard-state-row__header';
    count.textContent = `${entry.count} · ${Math.round(entry.percentage)}%`;
    track.className = 'dashboard-state-row__track';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-label', `${entry.label}: ${entry.count} assuntos`);
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-valuenow', String(entry.percentage));
    fill.className = `dashboard-state-row__fill dashboard-state-row__fill--${presentation.tone}`;
    fill.style.setProperty('--state-percentage', `${entry.percentage}%`);
    track.append(fill);
    header.append(createBadge(documentObject, presentation), count);
    row.append(header, track);
    list.append(row);
  }

  section.body.append(list);
  return section.element;
}

function createPrioritiesSection(documentObject, data) {
  const section = createDashboardCard(documentObject, {
    title: 'Prioridades de estudo',
    description: 'Reforços, progresso em andamento e assuntos difíceis aparecem primeiro.',
    action: createButtonLink(documentObject, {
      label: 'Ver matérias',
      href: '#/materias',
      variant: 'ghost',
      size: 'small',
      icon: 'chevron-right',
      iconPosition: 'end',
    }),
  });
  const priorities = selectStudyPriorities(data);

  if (priorities.length === 0) {
    section.body.append(
      createInlineEmpty(
        documentObject,
        data.assuntos.length
          ? 'Nenhum assunto está marcado como prioridade automática.'
          : 'Cadastre assuntos para começar a receber prioridades.',
      ),
    );
    return section.element;
  }

  const list = documentObject.createElement('ul');
  list.className = 'dashboard-item-list';
  for (const entry of priorities) list.append(createAssuntoItem(documentObject, entry));
  section.body.append(list);
  return section.element;
}

function createMateriaHighlightsSection(documentObject, data) {
  const section = createDashboardCard(documentObject, {
    title: 'Matérias que pedem avanço',
    description: 'Matérias com assuntos, ordenadas do menor para o maior progresso.',
  });
  const highlights = selectMateriaProgressHighlights(data);

  if (highlights.length === 0) {
    section.body.append(
      createInlineEmpty(documentObject, 'Adicione assuntos às matérias para comparar o progresso.'),
    );
    return section.element;
  }

  const list = documentObject.createElement('div');
  list.className = 'dashboard-materia-list';
  for (const item of highlights) {
    const row = documentObject.createElement('article');
    const heading = documentObject.createElement('div');
    const link = documentObject.createElement('a');
    const count = documentObject.createElement('span');

    row.className = 'dashboard-materia-row';
    heading.className = 'dashboard-materia-row__heading';
    link.href = `#/materias/${encodeURIComponent(item.materia.id)}`;
    link.textContent = item.materia.nome;
    count.textContent = `${item.assuntosCount} ${item.assuntosCount === 1 ? 'assunto' : 'assuntos'}`;
    heading.append(link, count);
    row.append(
      heading,
      createProgressBar(documentObject, {
        value: item.progress ?? 0,
        label: `Progresso de ${item.materia.nome} · ${item.progressSummary.points}/${item.progressSummary.total} pontos`,
        size: 'small',
      }),
    );
    list.append(row);
  }

  section.body.append(list);
  return section.element;
}

function createRecentStudiesSection(documentObject, data) {
  const section = createDashboardCard(documentObject, {
    title: 'Estudos recentes',
    description: 'Últimas datas registradas nos assuntos.',
  });
  const recent = selectRecentStudies(data);

  if (recent.length === 0) {
    section.body.append(
      createInlineEmpty(documentObject, 'Nenhuma data de último estudo foi registrada ainda.'),
    );
    return section.element;
  }

  const list = documentObject.createElement('ul');
  list.className = 'dashboard-item-list dashboard-item-list--recent';
  for (const entry of recent) {
    const item = createAssuntoItem(documentObject, entry, { showDifficulty: false });
    const date = documentObject.createElement('time');
    date.className = 'dashboard-item__date';
    date.dateTime = entry.assunto.ultimoEstudoEm;
    date.textContent = formatLocalDate(entry.assunto.ultimoEstudoEm);
    item.append(date);
    list.append(item);
  }
  section.body.append(list);
  return section.element;
}

function createMetricCard(documentObject, { label, value, note, icon, tone = 'primary' }) {
  const article = documentObject.createElement('article');
  const iconArea = documentObject.createElement('span');
  const content = documentObject.createElement('div');
  const number = documentObject.createElement('strong');
  const title = documentObject.createElement('span');
  const description = documentObject.createElement('p');

  article.className = `dashboard-metric dashboard-metric--${tone}`;
  iconArea.className = 'dashboard-metric__icon';
  iconArea.append(createIcon(documentObject, icon, { size: 22 }));
  content.className = 'dashboard-metric__content';
  number.textContent = String(value);
  title.textContent = label;
  description.textContent = note;
  content.append(number, title, description);
  article.append(iconArea, content);
  return article;
}

function createDashboardCard(documentObject, { title, description, action = null }) {
  const element = documentObject.createElement('section');
  const header = documentObject.createElement('header');
  const heading = documentObject.createElement('div');
  const h2 = documentObject.createElement('h2');
  const p = documentObject.createElement('p');
  const body = documentObject.createElement('div');

  element.className = 'dashboard-card';
  header.className = 'dashboard-card__header';
  heading.className = 'dashboard-card__heading';
  h2.textContent = title;
  p.textContent = description;
  heading.append(h2, p);
  header.append(heading);
  if (action) header.append(action);
  body.className = 'dashboard-card__body';
  element.append(header, body);
  return { element, body };
}

function createAssuntoItem(documentObject, entry, { showDifficulty = true } = {}) {
  const item = documentObject.createElement('li');
  const content = documentObject.createElement('div');
  const title = documentObject.createElement('a');
  const context = documentObject.createElement('p');
  const badges = documentObject.createElement('div');
  const progress = getProgressPresentation(entry.assunto);
  const difficulty = getDifficultyPresentation(entry.assunto.dificuldade);

  item.className = 'dashboard-item';
  content.className = 'dashboard-item__content';
  title.className = 'dashboard-item__title';
  title.href = `#/materias/${encodeURIComponent(entry.materia.id)}`;
  title.textContent = entry.assunto.nome;
  context.textContent = `${entry.materia.nome} · ${entry.tema.nome}`;
  badges.className = 'dashboard-item__badges';
  badges.append(createBadge(documentObject, progress));
  if (entry.assunto.precisaReforco) {
    badges.append(
      createBadge(documentObject, { label: 'Precisa de reforço', tone: 'reinforcement' }),
    );
  }
  if (showDifficulty && entry.assunto.dificuldade !== DIFFICULTIES.NAO_DEFINIDA) {
    badges.append(createBadge(documentObject, difficulty));
  }
  content.append(title, context, badges);
  item.append(content);
  return item;
}

function createInlineEmpty(documentObject, message) {
  const p = documentObject.createElement('p');
  p.className = 'dashboard-inline-empty';
  p.textContent = message;
  return p;
}

function createStructureNote(documentObject, count, singular, plural) {
  const span = documentObject.createElement('span');
  span.className = count ? 'dashboard-structure-note is-pending' : 'dashboard-structure-note';
  span.append(
    createIcon(documentObject, count ? 'warning' : 'check', { size: 16 }),
    `${count} ${count === 1 ? singular : plural}`,
  );
  return span;
}

function createProgressTitle(summary) {
  if (summary.assuntosCount === 0) return 'A estrutura está pronta para receber assuntos';
  if (summary.progress >= 75) return 'Seu mapa de estudos está avançando bem';
  if (summary.progress >= 40) return 'Você já construiu uma base de progresso';
  return 'Há bastante espaço para avançar';
}

function createProgressDescription(summary) {
  if (summary.assuntosCount === 0) {
    return 'Adicione assuntos aos temas para começar a calcular o progresso geral.';
  }

  const active = summary.emAndamentoCount + summary.reforcoCount;
  if (active === 0) {
    return `${summary.assuntosCount} ${summary.assuntosCount === 1 ? 'assunto organizado' : 'assuntos organizados'}, sem itens em andamento ou marcados para reforço.`;
  }

  return `${active} ${active === 1 ? 'assunto pede' : 'assuntos pedem'} acompanhamento neste momento.`;
}
