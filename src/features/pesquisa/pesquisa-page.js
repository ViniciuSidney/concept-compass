import { createPagePlaceholder } from '../../ui/states/page-placeholder.js';

export function createPesquisaPage(documentObject, route) {
  const termo = route.query.q?.trim();

  return createPagePlaceholder(documentObject, {
    eyebrow: 'Localização',
    title: 'Pesquisa Geral',
    description: termo
      ? `O parâmetro de pesquisa “${termo}” foi preservado na URL.`
      : 'A pesquisa localizará exclusivamente Matérias, Temas e Assuntos.',
    icon: 'search',
    status: termo ? `Busca: ${termo}` : 'Nenhuma busca ativa',
    details: [
      'Rota oficial: #/pesquisa',
      'Parâmetro opcional: ?q=termo',
      'Pesquisa e filtros completos serão implementados no M7',
    ],
  });
}
