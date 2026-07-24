import { createPagePlaceholder } from '../../ui/states/page-placeholder.js';

export function createDashboardPage(documentObject) {
  return createPagePlaceholder(documentObject, {
    eyebrow: 'Visão Geral',
    title: 'Seu mapa de estudos começa aqui',
    description:
      'A estrutura inicial da tela principal já está conectada ao roteador e ao AppShell.',
    icon: 'dashboard',
    details: [
      'Rota oficial: #/',
      'Título da aba atualizado automaticamente',
      'Indicadores e prioridades serão implementados no M6',
    ],
    action: {
      href: '#/materias',
      label: 'Abrir Matérias',
    },
  });
}
