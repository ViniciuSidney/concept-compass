import { createActionMenu } from '../../ui/components/action-menu.js';
import { createBadge } from '../../ui/components/badge.js';
import { createButton } from '../../ui/components/button.js';
import { createFilterChip } from '../../ui/components/filter-chip.js';
import { createModal } from '../../ui/components/modal.js';
import { createPersistentAlert } from '../../ui/components/persistent-alert.js';
import { createProgressBar } from '../../ui/components/progress-bar.js';
import { createSearchField } from '../../ui/components/search-field.js';
import { createSidePanel } from '../../ui/components/side-panel.js';
import { createEmptyState } from '../../ui/states/empty-state.js';
import { createErrorState } from '../../ui/states/error-state.js';
import { createLoadingState } from '../../ui/states/loading-state.js';
function sectionHeader(documentObject, title, description) {
  const header = documentObject.createElement('header');
  const h2 = documentObject.createElement('h2');
  const p = documentObject.createElement('p');
  header.className = 'showcase-section__header';
  h2.textContent = title;
  p.textContent = description;
  header.append(h2, p);
  return header;
}
function themePreview(documentObject, controller) {
  const card = documentObject.createElement('section');
  const controls = documentObject.createElement('div');
  const status = documentObject.createElement('p');
  const buttons = new Map();
  const options = [
    { value: 'light', label: 'Claro', icon: 'sun' },
    { value: 'dark', label: 'Escuro', icon: 'moon' },
    { value: 'system', label: 'Seguir sistema', icon: 'monitor' },
  ];
  card.className = 'showcase-card showcase-card--wide';
  controls.className = 'theme-preview';
  controls.setAttribute('aria-label', 'Prévia temporária de aparência');
  status.className = 'theme-preview__status';
  status.setAttribute('aria-live', 'polite');
  function update(state) {
    for (const [value, button] of buttons) {
      const active = value === state.choice;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-selected', active);
    }
    const label = options.find((option) => option.value === state.choice)?.label;
    status.textContent = `Modo escolhido: ${label}. Tema aplicado: ${state.resolved === 'dark' ? 'escuro' : 'claro'}.`;
  }
  for (const option of options) {
    const button = createButton(documentObject, {
      label: option.label,
      icon: option.icon,
      variant: 'secondary',
      onClick: () => update(controller.setTheme(option.value)),
    });
    button.classList.add('theme-preview__option');
    controls.append(button);
    buttons.set(option.value, button);
  }
  update(controller.getState());
  card.append(
    sectionHeader(
      documentObject,
      'Aparência',
      'Prévia temporária dos três modos visuais. A persistência será implementada no M9.',
    ),
    controls,
    status,
  );
  return card;
}
function controlsPreview(documentObject, notify, overlayManager) {
  const card = documentObject.createElement('section');
  const result = documentObject.createElement('p');
  const search = createSearchField(documentObject, {
    label: 'Pesquisar componente de exemplo',
    placeholder: 'Digite para testar o campo…',
    onInput: (value) => {
      result.textContent = value ? `Texto reconhecido: “${value}”` : 'Nenhum texto digitado.';
    },
  });
  const chips = documentObject.createElement('div');
  const badges = documentObject.createElement('div');
  const menu = createActionMenu(documentObject, {
    label: 'Abrir ações de exemplo',
    overlayManager,
    items: [
      {
        label: 'Editar exemplo',
        icon: 'edit',
        onSelect: () => notify({ title: 'Ação de exemplo', message: 'Editar foi selecionado.' }),
      },
      {
        label: 'Duplicar exemplo',
        icon: 'copy',
        onSelect: () => notify({ title: 'Ação de exemplo', message: 'Duplicar foi selecionado.' }),
      },
      {
        label: 'Excluir exemplo',
        icon: 'trash',
        danger: true,
        onSelect: () =>
          notify({
            title: 'Ação destrutiva de exemplo',
            message: 'Nenhum dado real foi alterado.',
            tone: 'danger',
          }),
      },
    ],
  });
  card.className = 'showcase-card showcase-card--wide';
  result.className = 'showcase-helper';
  result.textContent = 'Nenhum texto digitado.';
  chips.className = 'showcase-inline-list';
  badges.className = 'showcase-inline-list';
  for (const label of ['Tudo', 'Matérias', 'Temas', 'Assuntos'])
    chips.append(createFilterChip(documentObject, { label, selected: label === 'Tudo' }).element);
  for (const [label, tone] of [
    ['Não iniciado', 'not-started'],
    ['Em andamento', 'studying'],
    ['Meta concluída', 'consolidated'],
    ['Precisa de reforço', 'reinforcement'],
  ])
    badges.append(createBadge(documentObject, { label, tone }));
  const row = documentObject.createElement('div');
  const label = documentObject.createElement('span');
  row.className = 'showcase-menu-row';
  label.textContent = 'Menu de ações acessível';
  row.append(label, menu.element);
  card.append(
    sectionHeader(
      documentObject,
      'Controles e indicadores',
      'Componentes globais preparados para pesquisa, filtros, estados e ações.',
    ),
    search.element,
    result,
    chips,
    badges,
    createProgressBar(documentObject, { value: 72, label: 'Progresso de demonstração' }),
    row,
  );
  return card;
}
function overlayPreview(documentObject, notify, overlayManager) {
  const card = documentObject.createElement('section');
  const actions = documentObject.createElement('div');
  const modalText = documentObject.createElement('p');
  const panelText = documentObject.createElement('p');
  const modalFooter = documentObject.createElement('div');
  const panelFooter = documentObject.createElement('div');
  modalText.textContent =
    'Este modal demonstra título, descrição, foco preso, fechamento por Esc e retorno de foco.';
  panelText.textContent =
    'Este painel lateral usa o mesmo tratamento de foco e será reutilizado nos detalhes de Assunto.';
  modalFooter.className = 'overlay-actions';
  panelFooter.className = 'overlay-actions';
  const modal = createModal(documentObject, {
    title: 'Modal de demonstração',
    description: 'Nenhuma informação acadêmica será alterada.',
    content: modalText,
    footer: modalFooter,
    overlayManager,
  });
  const panel = createSidePanel(documentObject, {
    title: 'Painel lateral de demonstração',
    description: 'Componente estrutural preparado para os próximos marcos.',
    content: panelText,
    footer: panelFooter,
    overlayManager,
  });
  modalFooter.append(
    createButton(documentObject, {
      label: 'Cancelar',
      variant: 'secondary',
      onClick: () => modal.close('cancel'),
    }),
    createButton(documentObject, {
      label: 'Confirmar exemplo',
      onClick: () => {
        modal.close('confirm');
        notify({ title: 'Exemplo confirmado', tone: 'success' });
      },
    }),
  );
  panelFooter.append(
    createButton(documentObject, {
      label: 'Fechar painel',
      variant: 'secondary',
      onClick: () => panel.close('footer'),
    }),
  );
  actions.className = 'showcase-actions';
  actions.append(
    createButton(documentObject, {
      label: 'Abrir modal',
      icon: 'layers',
      onClick: () => modal.open(),
    }),
    createButton(documentObject, {
      label: 'Abrir painel',
      icon: 'panel',
      variant: 'secondary',
      onClick: () => panel.open(),
    }),
    createButton(documentObject, {
      label: 'Mostrar mensagem',
      icon: 'bell',
      variant: 'ghost',
      onClick: () =>
        notify({
          title: 'Componente Toast funcionando',
          message: 'A mensagem desaparece sem interromper a navegação.',
          tone: 'success',
        }),
    }),
  );
  card.className = 'showcase-card';
  card.append(
    sectionHeader(
      documentObject,
      'Sobreposições e feedback',
      'Modal, painel e mensagens seguem um comportamento comum e acessível.',
    ),
    actions,
  );
  return card;
}
function statesPreview(documentObject) {
  const card = documentObject.createElement('section');
  const grid = documentObject.createElement('div');
  card.className = 'showcase-card showcase-card--wide';
  grid.className = 'showcase-state-grid';
  grid.append(
    createEmptyState(documentObject, {
      title: 'Estado vazio',
      message: 'Nenhum item disponível para exibir.',
      compact: true,
    }),
    createLoadingState(documentObject, { compact: true }),
    createErrorState(documentObject, {
      title: 'Estado de erro',
      message: 'Uma orientação clara será apresentada ao usuário.',
      compact: true,
    }),
  );
  card.append(
    sectionHeader(
      documentObject,
      'Estados de interface',
      'Vazio, carregamento e erro possuem estruturas padronizadas.',
    ),
    grid,
  );
  return card;
}
export function createM3Showcase(documentObject, { themeController, showToast, overlayManager }) {
  const showcase = documentObject.createElement('section');
  const intro = createPersistentAlert(documentObject, {
    title: 'Validação visual temporária do M3',
    message:
      'Este laboratório existe apenas durante o desenvolvimento para testar componentes globais. Ele não adiciona funcionalidades ao escopo da v0.1.',
    tone: 'info',
  });
  const heading = documentObject.createElement('div');
  const h2 = documentObject.createElement('h2');
  const p = documentObject.createElement('p');
  const grid = documentObject.createElement('div');
  showcase.className = 'm3-showcase';
  showcase.setAttribute('aria-labelledby', 'm3-showcase-title');
  heading.className = 'm3-showcase__heading';
  h2.id = 'm3-showcase-title';
  h2.textContent = 'Sistema visual e componentes globais';
  p.textContent =
    'Use os exemplos abaixo para validar estados visuais, teclado, foco e comportamento responsivo.';
  heading.append(h2, p);
  grid.className = 'm3-showcase__grid';
  const notify = (options) => showToast(options);
  grid.append(
    themePreview(documentObject, themeController),
    controlsPreview(documentObject, notify, overlayManager),
    overlayPreview(documentObject, notify, overlayManager),
    statesPreview(documentObject),
  );
  showcase.append(intro, heading, grid);
  return showcase;
}
