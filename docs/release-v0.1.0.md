# Release v0.1.0 — Organizador de Conteúdos

## Resultado

A v0.1.0 entrega um organizador local e funcional para Matérias, Temas e Assuntos, com progresso flexível, pesquisa, movimentações, backup, recuperação, responsividade e acessibilidade.

## Identidade

- aplicação: Organizador de Conteúdos;
- autor: Vinícius Sidney;
- versão do pacote: `0.1.0`;
- versão exibida: `v0.1`;
- tag planejada: `v0.1.0`;
- armazenamento: LocalStorage;
- plataforma: aplicação web estática.

## Compatibilidade de dados

- estrutura atual: schema de dados v2;
- preferências: schema v1;
- backup: formato v1;
- backups de desenvolvimento da v0.1 permanecem aceitos;
- estados legados são migrados para pontos de progresso.

## Decisão sobre cache offline

O service worker não será ativado nesta release. O risco de ocultar uma atualização por cache antigo é maior do que o benefício offline sem uma experiência de atualização já validada.

## Pendências para declarar a versão publicada

- executar `tests/manual/m11.md`;
- confirmar ausência de falhas críticas e altas;
- publicar `main` no GitHub Pages;
- repetir testes de fumaça na URL pública;
- integrar `dev` em `main`;
- criar e enviar a tag `v0.1.0`;
- criar a Release no GitHub com base neste documento e no `CHANGELOG.md`.

## Texto sugerido para a Release

> Primeira versão funcional do Organizador de Conteúdos. Organize Matérias, Temas e Assuntos, acompanhe pontos de progresso, localize conteúdos, mova estruturas e preserve seus dados com backup e recuperação. A aplicação funciona localmente no navegador, sem conta e sem envio de dados acadêmicos.
