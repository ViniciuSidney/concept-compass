import { createPagePlaceholder } from '../../ui/states/page-placeholder.js';

export function createMateriasPage(documentObject) {
  return createPagePlaceholder(documentObject, {
    eyebrow: 'Organização',
    title: 'Matérias',
    description: 'A listagem e o CRUD de matérias serão construídos sobre esta rota no M4.',
    icon: 'book',
    details: [
      'Rota oficial: #/materias',
      'Navegação ativa identificada com aria-current',
      'Cards e formulários ainda não fazem parte do M1',
    ],
  });
}
