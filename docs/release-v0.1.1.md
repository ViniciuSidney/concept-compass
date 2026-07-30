# Release v0.1.1 — Concept Compass

## Objetivo

Adotar a nova identidade **Concept Compass** sem alterar o funcionamento consolidado da v0.1.0 e sem interromper dados ou backups existentes.

## Alterações

- nome visível, título, metadados, manifesto e seção Sobre atualizados;
- versão técnica atualizada para `0.1.1`;
- novos backups identificados como `Concept Compass`;
- novos nomes de arquivo usam `concept-compass-backup`;
- documentação atualizada para a nova marca.

## Compatibilidade preservada

- LocalStorage continua usando `organizador-conteudos:data`, `organizador-conteudos:preferences` e `organizador-conteudos:ui`;
- schemas de dados e preferências permanecem inalterados;
- backups antigos com `app: "Organizador de Conteúdos"` e `appVersion: "v0.1"` continuam aceitos;
- nome técnico do pacote e do repositório permanece inalterado;
- rotas e URL pública permanecem inalteradas.

## Tag planejada

`v0.1.1`

## Critério de aprovação

A atualização está pronta quando a identidade nova aparecer em todos os pontos atuais, os dados anteriores permanecerem acessíveis, backups novos e antigos funcionarem e o portão `npm run release:check` passar.
