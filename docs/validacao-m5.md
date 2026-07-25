# Preparação para validação do M5 — Gerenciamento de Temas e Assuntos

## Concluído tecnicamente

- página definitiva da Matéria;
- resumo dinâmico de temas, assuntos e progresso;
- criação, edição, reordenação e exclusão de Temas;
- acordeões acessíveis para expandir e recolher Temas;
- exclusão de Tema com impacto e cascata;
- estados vazios gerais e contextuais;
- criação, edição, reordenação e exclusão de Assuntos;
- campos de estado, dificuldade, descrição, observações e último estudo;
- validação de limites e impedimento de data futura;
- badges oficiais de estado e dificuldade;
- painel lateral de detalhes do Assunto;
- atualização dos contadores e cálculos já consumidos pelo M4;
- persistência antes da confirmação visual;
- tratamento de falhas sem mutar o estado confirmado;
- responsividade e adaptação aos temas visuais existentes;
- testes automatizados e `npm run verify:m5`.

## Limites preservados

O M5 não implementa movimentação de Temas entre Matérias, movimentação de Assuntos entre Temas pela interface, Pesquisa Geral funcional, Dashboard definitivo, backup visual ou histórico analítico.

## Critério pendente

A aprovação depende da execução dos casos `M5-T01` a `M5-T34` em `tests/manual/m5.md`.
