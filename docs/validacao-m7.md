# Preparação para validação do M7 — Pesquisa Geral e filtros

## Concluído tecnicamente

- substituição da tela provisória por uma Pesquisa Geral funcional;
- pesquisa unificada em Matérias, Temas e Assuntos;
- correspondência por nome e descrição;
- inclusão das observações no conteúdo pesquisável de Assuntos;
- normalização de caixa, acentos e espaços;
- filtros exclusivos Tudo, Matérias, Temas e Assuntos;
- contagens atualizadas por tipo e pelo termo pesquisado;
- ordenação por relevância, priorizando títulos exatos e iniciais;
- cartões de resultado com tipo, hierarquia, descrição e metadados;
- badges de estado e dificuldade nos Assuntos;
- parâmetros `q` e `tipo` preservados no endereço;
- navegação profunda para Matérias, Temas e Assuntos;
- expansão e destaque do Tema localizado;
- abertura automática do painel de detalhes quando o resultado é um Assunto;
- estados para organização vazia, busca inicial e nenhum resultado;
- responsividade e adaptação aos temas visuais existentes;
- seletores puros independentes do DOM;
- testes automatizados e verificação integrada do marco.

## Regras consolidadas

- a busca não diferencia letras maiúsculas, minúsculas ou acentos;
- Matérias pesquisam nome e descrição;
- Temas pesquisam nome e descrição;
- Assuntos pesquisam nome, descrição e observações;
- nomes dos níveis ancestrais aparecem como contexto, mas não fazem um item corresponder ao termo;
- sem termo, a aplicação apresenta orientação e contagens, sem listar toda a estrutura;
- os únicos filtros globais da v0.1 são Tudo, Matérias, Temas e Assuntos;
- resultados exatos no título aparecem antes de correspondências parciais ou no corpo;
- a pesquisa é somente de leitura e não altera os dados persistidos.

## Limites preservados

O M7 não implementa favoritos, conteúdos como entidade, pesquisas recentes, histórico, filtros por estado ou dificuldade, movimentações entre estruturas, backup visual ou preferências definitivas.

## Validação manual

O roteiro está em `tests/manual/m7.md`, com os casos `M7-T01` a `M7-T28`.

## Validação manual concluída

Os casos `M7-T01` a `M7-T28` foram executados e aprovados pelo usuário em 29/07/2026.

## Resultado

**M7 aprovado e oficialmente concluído.** O projeto está autorizado a avançar para o M8 — Reordenação, movimentação e exclusões completas.
