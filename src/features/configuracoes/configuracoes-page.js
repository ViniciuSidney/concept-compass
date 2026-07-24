import { createPagePlaceholder } from '../../ui/states/page-placeholder.js';

export function createConfiguracoesPage(documentObject) {
  return createPagePlaceholder(documentObject, {
    eyebrow: 'Preferências e segurança',
    title: 'Configurações',
    description:
      'A aparência, os backups e a recuperação de dados serão implementados de forma segura no M9.',
    icon: 'settings',
    details: [
      'Rota oficial: #/configuracoes',
      'Nenhuma preferência é persistida ainda',
      'Autor oficial: Vinícius Sidney',
    ],
  });
}
