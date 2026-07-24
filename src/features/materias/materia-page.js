import { createPagePlaceholder } from '../../ui/states/page-placeholder.js';

export function createMateriaPage(documentObject, route) {
  const materiaId = route.params.materiaId;

  return createPagePlaceholder(documentObject, {
    eyebrow: 'Matérias',
    title: 'Matéria específica',
    description: `O roteador reconheceu o identificador “${materiaId}”. A validação contra dados reais será adicionada após o M2.`,
    icon: 'book',
    status: `ID: ${materiaId}`,
    details: [
      'Parâmetro de rota extraído corretamente',
      'A navegação lateral mantém Matérias como área ativa',
      'Temas e assuntos serão implementados no M5',
    ],
    action: {
      href: '#/materias',
      label: 'Voltar para Matérias',
    },
  });
}
