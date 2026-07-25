# Preparação para validação do M6 — Progresso e Visão Geral

## Concluído tecnicamente

- substituição da tela provisória por uma Visão Geral funcional;
- progresso geral calculado pela média dos pesos oficiais dos assuntos;
- contadores de Matérias, Temas e Assuntos;
- indicador de assuntos que precisam de reforço;
- identificação de Matérias sem Temas e Temas sem Assuntos;
- distribuição pelos cinco estados oficiais, com contagens e percentuais;
- prioridades automáticas baseadas em reforço, estudo em andamento e dificuldade alta;
- lista de Matérias com menor progresso;
- estudos recentes derivados do campo Último estudo;
- estados vazios gerais e contextuais;
- links para os workspaces das Matérias;
- adaptação responsiva e aos temas visuais existentes;
- seletores puros independentes do DOM;
- testes automatizados e verificação integrada do marco.

## Regras consolidadas

- o progresso geral é a média simples dos pesos dos Assuntos;
- sem Assuntos, o progresso é ausente, e não `0%`;
- a prioridade automática segue esta ordem: Precisa de reforço, Em estudo e dificuldade Difícil não consolidada;
- assuntos Consolidados não entram nas prioridades;
- Estudos recentes usa apenas o valor atual de Último estudo e não constitui histórico analítico;
- Matérias que pedem avanço exibe somente Matérias com Assuntos e ordena pelo menor progresso.

## Limites preservados

O M6 não implementa Pesquisa Geral, movimentações entre estruturas, backup visual, preferências definitivas, histórico de estudos ou análises temporais avançadas.

## Roteiro de validação

O roteiro está em `tests/manual/m6.md`, com os casos `M6-T01` a `M6-T26`.

## Validação manual

Os casos `M6-T01` a `M6-T26` foram executados e aprovados pelo usuário em 25/07/2026.

## Resultado

**M6 aprovado e oficialmente concluído.** O projeto está autorizado a avançar para o M7 — Pesquisa Geral e filtros.
