# Preparação para validação do M4 — Gerenciamento de Matérias

## Concluído tecnicamente

- carregamento real dos dados e preferências pelo repositório;
- store inicial com dados persistidos;
- tela definitiva de Matérias;
- estado vazio e estado sem resultados;
- cards com nome, descrição, cor, contagens e progresso;
- criação e edição com validação;
- pesquisa por nome e descrição sem distinção de caixa ou acentos;
- ordenação por ordem personalizada, nome e atualização;
- reordenação acessível por controles explícitos;
- abertura de matéria existente;
- tratamento de matéria inexistente;
- exclusão com impacto e cascata;
- feedbacks de sucesso e falha;
- persistência antes da confirmação visual;
- testes automatizados e `npm run verify:m4`.

## Limites preservados

O M4 não implementa CRUD de Temas ou Assuntos, Pesquisa Geral funcional, Dashboard definitivo, backup visual ou preferências definitivas.

## Critério pendente

A aprovação depende da execução dos casos `M4-T01` a `M4-T23` em `tests/manual/m4.md`.
