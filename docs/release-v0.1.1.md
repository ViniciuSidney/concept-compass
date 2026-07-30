# Release v0.1.1 — Concept Compass

**Status:** aprovada para publicação em 30/07/2026.

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

## Validação concluída

- 149 testes automatizados aprovados;
- roteiro manual CC-T01 a CC-T10 aprovado;
- dados anteriores preservados;
- backups novos e antigos validados;
- responsividade, manifesto, recuperação e regressão funcional aprovados;
- portão `npm run release:check` aprovado.
