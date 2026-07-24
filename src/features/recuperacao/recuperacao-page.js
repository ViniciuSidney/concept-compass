import { createPagePlaceholder } from '../../ui/states/page-placeholder.js';

export function createRecuperacaoPage(documentObject) {
  return createPagePlaceholder(documentObject, {
    eyebrow: 'Proteção de dados',
    title: 'Recuperação de Dados',
    description: 'Esta rota reservada receberá o fluxo de preservação de dados inválidos no M9.',
    icon: 'settings',
    status: 'Rota interna',
    details: [
      'Rota oficial: #/recuperacao',
      'Não aparece na navegação principal',
      'Nenhum dado é lido ou substituído no M1',
    ],
    action: {
      href: '#/',
      label: 'Voltar à Visão Geral',
    },
  });
}
