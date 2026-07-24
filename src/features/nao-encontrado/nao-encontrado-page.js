import { createPagePlaceholder } from '../../ui/states/page-placeholder.js';

export function createNaoEncontradoPage(documentObject, route) {
  return createPagePlaceholder(documentObject, {
    eyebrow: 'Navegação',
    title: 'Conteúdo não encontrado',
    description: `A rota “${route.pathname}” não corresponde a uma área válida da aplicação.`,
    icon: 'search',
    status: '404 interno',
    details: [
      'A aplicação continua carregada normalmente',
      'Nenhum erro não tratado foi lançado',
      'Use a navegação para retornar a uma rota válida',
    ],
    action: {
      href: '#/',
      label: 'Ir para a Visão Geral',
    },
  });
}
