import {
  selectMateriaById,
  selectAssuntosByMateria,
  selectTemasByMateria,
} from '../../domain/selectors/hierarchy-selectors.js';
import { calculateMateriaProgress } from '../../domain/services/progress-service.js';
import { createButtonLink } from '../../ui/components/button.js';
import { createPageHeader } from '../../ui/components/page-header.js';
import { createProgressBar } from '../../ui/components/progress-bar.js';
import { createEmptyState } from '../../ui/states/empty-state.js';
import { createErrorState } from '../../ui/states/error-state.js';

export function createMateriaPage(documentObject, route, context) {
  const page = documentObject.createElement('div');
  const data = context.store.getState().data;
  const materiaId = route.params.materiaId;
  const materia = selectMateriaById(data, materiaId);

  page.className = 'materia-page';

  if (!materia) {
    page.append(
      createPageHeader(documentObject, {
        breadcrumb: [{ label: 'Matérias', href: '#/materias' }, { label: 'Não encontrada' }],
        eyebrow: 'Matérias',
        title: 'Matéria não encontrada',
        description: 'O registro pode ter sido removido ou o endereço informado não é válido.',
      }),
      createErrorState(documentObject, {
        title: 'Não foi possível abrir esta matéria',
        message: 'Volte à listagem para escolher uma matéria existente.',
        action: createButtonLink(documentObject, {
          label: 'Voltar para Matérias',
          href: '#/materias',
          variant: 'secondary',
        }),
      }),
    );
    return page;
  }

  const temas = selectTemasByMateria(data, materia.id);
  const assuntos = selectAssuntosByMateria(data, materia.id);
  const progress = calculateMateriaProgress(data, materia.id);
  const summary = documentObject.createElement('section');
  const stats = documentObject.createElement('div');
  const progressCard = documentObject.createElement('div');

  page.append(
    createPageHeader(documentObject, {
      breadcrumb: [{ label: 'Matérias', href: '#/materias' }, { label: materia.nome }],
      eyebrow: 'Matéria',
      title: materia.nome,
      description: materia.descricao || 'Sem descrição cadastrada.',
      actions: createButtonLink(documentObject, {
        label: 'Voltar para Matérias',
        href: '#/materias',
        variant: 'secondary',
        icon: 'arrow-left',
      }),
    }),
  );

  summary.className = `materia-summary materia-summary--${materia.corId}`;
  stats.className = 'materia-summary__stats';
  stats.append(
    createSummaryStat(documentObject, temas.length, 'Temas'),
    createSummaryStat(documentObject, assuntos.length, 'Assuntos'),
  );
  progressCard.className = 'materia-summary__progress';
  if (progress === null) {
    const label = documentObject.createElement('p');
    label.textContent = 'Progresso: Sem assuntos';
    progressCard.append(label);
  } else {
    progressCard.append(
      createProgressBar(documentObject, { value: progress, label: 'Progresso geral' }),
    );
  }
  summary.append(stats, progressCard);
  page.append(summary);

  page.append(
    createEmptyState(documentObject, {
      title: 'Estrutura da matéria preparada',
      message:
        'A matéria já pode ser aberta e identificada. O gerenciamento de temas e assuntos será implementado no M5.',
      icon: 'layers',
      compact: true,
    }),
  );

  return page;
}

function createSummaryStat(documentObject, value, label) {
  const item = documentObject.createElement('div');
  const number = documentObject.createElement('strong');
  const text = documentObject.createElement('span');
  number.textContent = String(value);
  text.textContent = label;
  item.append(number, text);
  return item;
}
