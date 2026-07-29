# Preparação para validação do M8 — Reordenação, movimentação e exclusões completas

## Concluído tecnicamente

- movimentação de Temas entre Matérias;
- movimentação de Assuntos entre Temas da mesma Matéria ou de outra Matéria;
- escolha explícita da posição no destino;
- reordenação para início, meio e fim pela mesma interface de movimentação;
- preservação de IDs, conteúdo e data de criação;
- normalização das ordens tanto na origem quanto no destino;
- preservação de todos os Assuntos ao mover um Tema;
- tratamento seguro quando o destino é a própria origem;
- cancelamento sem persistir alterações;
- ações de movimentação nos menus de Tema e Assunto;
- ação de movimentação no painel de detalhes do Assunto;
- edição e exclusão da Matéria diretamente em seu workspace;
- redirecionamento seguro após excluir a Matéria aberta;
- fechamento do painel do Assunto antes de editar, mover ou excluir;
- feedbacks de sucesso, nenhuma alteração e falha;
- atualização imediata de contadores, progresso, Pesquisa Geral e Visão Geral;
- persistência antes da confirmação visual;
- falha de gravação sem alterar o retrato confirmado;
- operação integral por teclado, sem depender de arrastar;
- testes automatizados e verificação integrada do marco.

## Regras consolidadas

- mover um Tema altera apenas seu `materiaId`, sua posição e `atualizadoEm`;
- os Assuntos relacionados permanecem ligados ao mesmo Tema movido;
- mover um Assunto altera apenas seu `temaId`, sua posição e `atualizadoEm`;
- IDs, `criadoEm`, pontos, meta, reforço, dificuldade, descrições, observações e último estudo são preservados;
- origem e destino sempre terminam com ordens contínuas iniciadas em zero;
- selecionar a origem e a posição atuais não duplica nem altera o registro;
- a posição é escolhida por controle nativo acessível;
- exclusões continuam usando confirmação explícita e impacto em cascata;
- nenhuma operação essencial exige ponteiro, gesto ou drag-and-drop.

## Limites preservados

O M8 não implementa arrastar e soltar, seleção múltipla, operações em lote, lixeira, histórico estrutural, backup visual ou preferências definitivas. Esses recursos não pertencem ao marco atual.

## Validação manual

O roteiro está em `tests/manual/m8.md`, com os casos `M8-T01` a `M8-T30`.

## Resultado da validação manual

Os casos `M8-T01` a `M8-T30` foram executados e aprovados pelo usuário. O M8 foi oficialmente concluído antes do início do M8.1.
