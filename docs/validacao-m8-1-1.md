# Validação concluída do M8.1.1 — Refinamentos de acompanhamento

## Objetivo

Refinar a leitura e a ergonomia do sistema de pontos já aprovado, sem alterar modelo de dados, regras de cálculo ou escopo funcional do M8.1.

## Ajustes implementados

- progresso de cada Tema visível diretamente em seu cabeçalho, mesmo quando recolhido;
- resumo com pontos reais, meta e porcentagem preservado;
- remoção da barra duplicada do corpo expandido do Tema;
- adaptação do cabeçalho para desktop, larguras intermediárias e celular;
- menu de ações limitado à altura útil da janela;
- rolagem automática da página quando um menu aberto ultrapassa a parte inferior da tela;
- respeito à preferência de movimento reduzido;
- quatro cards inferiores da Visão Geral organizados em duas colunas independentes;
- segundo card de cada coluna começa imediatamente após o card superior daquela coluna;
- ordem lógica preservada quando a galeria passa para uma coluna;
- nenhuma mudança no conteúdo ou na estrutura visual interna dos cards.

## Limites preservados

- nenhum dado acadêmico foi alterado;
- nenhuma nova métrica foi criada;
- não foi adicionado arrastar e soltar;
- os menus continuam navegáveis por teclado;
- o M9 permanece como próximo marco funcional.

## Validação manual

O roteiro está em `tests/manual/m8-1-1.md`, com os casos `M8.1.1-T01` a `M8.1.1-T09`.

## Resultado final

Os casos manuais `M8.1.1-T01` a `M8.1.1-T09` foram aprovados pelo usuário. O marco foi concluído e liberado como base oficial do M9.
