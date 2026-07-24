import { createPagePlaceholder } from '../../ui/states/page-placeholder.js';
import { createM3Showcase } from './m3-showcase.js';
export function createConfiguracoesPage(documentObject, _route, context) {
  const page = createPagePlaceholder(documentObject, {
    eyebrow: 'Preferências e segurança',
    title: 'Configurações',
    description:
      'A estrutura visual está pronta. A persistência das preferências, backups e recuperação será implementada no M9.',
    icon: 'settings',
    status: 'Validação do M3',
    details: [
      'Rota oficial: #/configuracoes',
      'Os temas podem ser visualizados, mas ainda não são persistidos',
      'Autor oficial: Vinícius Sidney',
    ],
  });
  page.append(
    createM3Showcase(documentObject, {
      themeController: context.themeController,
      showToast: context.appShell.showToast,
      overlayManager: context.overlayManager,
    }),
  );
  return page;
}
