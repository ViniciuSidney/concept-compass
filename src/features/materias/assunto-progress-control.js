import { PROGRESS_POINTS } from '../../domain/constants.js';
import { createIconButton } from '../../ui/components/icon-button.js';
import { createSegmentedProgress } from '../../ui/components/segmented-progress.js';

export function createAssuntoProgressControl(
  documentObject,
  { assunto, onDecrease, onIncrease, onIncreaseTotal, onAdjust = null, compact = false },
) {
  const control = documentObject.createElement('div');
  const decrease = createIconButton(documentObject, {
    icon: 'minus',
    label: `Retirar um ponto de progresso de ${assunto.nome}`,
    size: 'small',
    variant: 'ghost',
    disabled: assunto.pontosProgresso <= 0,
    onClick: onDecrease,
  });
  const increase = createIconButton(documentObject, {
    icon: 'plus',
    label: `Adicionar um ponto de progresso a ${assunto.nome}`,
    size: 'small',
    variant: 'ghost',
    disabled: assunto.pontosProgresso >= assunto.metaPontosProgresso,
    onClick: onIncrease,
  });
  const increaseTotal = createIconButton(documentObject, {
    icon: 'arrow-up',
    label: `Aumentar a meta de progresso de ${assunto.nome}`,
    size: 'small',
    variant: 'ghost',
    disabled: assunto.metaPontosProgresso >= PROGRESS_POINTS.MAX_TOTAL,
    onClick: onIncreaseTotal,
  });

  control.className = `assunto-progress-control${compact ? ' assunto-progress-control--compact' : ''}`;
  control.append(
    decrease,
    createSegmentedProgress(documentObject, {
      current: assunto.pontosProgresso,
      total: assunto.metaPontosProgresso,
      label: `Progresso de ${assunto.nome}`,
      compact,
    }),
    increase,
    increaseTotal,
  );

  if (onAdjust) {
    control.addEventListener('dblclick', onAdjust);
    control.setAttribute('title', 'Clique duas vezes para ajustar os valores diretamente');
  }
  return control;
}
