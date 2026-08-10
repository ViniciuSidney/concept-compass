# Release v0.2.0 — Concept Compass

**Status:** candidata aprovada localmente em 09/08/2026; publicação pendente.

## Objetivo

Consolidar o Concept Compass como mapa estrutural do ecossistema de estudos e integrar o acompanhamento de aprendizagem ao Study Stack, que passa a ser a fonte única do progresso oficial.

## Destaques

- integração bidirecional com o Study Stack pelo contrato `1.0.0`;
- progresso oficial de `0–10`, etapas, pendências e atividade lidos do Study Stack;
- agregação por Tema, Matéria e aplicação;
- atualização ao vivo por armazenamento, foco e visibilidade;
- arquivamento hierárquico com bloqueio e restauração sem F5;
- exclusão permanente vinculada por protocolo transacional;
- abertura e retorno entre as aplicações em novas abas com URLs seguras;
- schema estrutural v3 e remoção do progresso manual legado;
- nova identidade visual com bússola conectada a pontos de conhecimento.

## Compatibilidade preservada

- chaves históricas `organizador-conteudos:*` permanecem inalteradas;
- IDs, hierarquia e conteúdo estrutural são preservados;
- backups compatíveis `v0.1`, `v0.1.0` e `v0.1.1` continuam importáveis;
- schemas v1 e v2 são migrados até o schema v3;
- campos antigos de progresso são descartados sem criar evidências artificiais no Study Stack;
- o identificador técnico `organizador-de-conteudos` permanece inalterado.

## Limites desta versão

- dados continuam locais ao navegador;
- não há sincronização em nuvem ou entre dispositivos;
- Flashcore, PWA e funcionamento offline permanecem fora do escopo;
- o service worker continua sem registro para evitar cache persistente sem fluxo de atualização validado.

## Validação concluída

- 203 testes automatizados aprovados;
- ESLint, Prettier e verificações M2–M11 aprovados;
- regressão integrada I8-T01–T09 concluída, com I8-T05–T07 aprovados manualmente;
- `npm run release:check` e `git diff --check` aprovados após aplicar a versão `0.2.0`;
- smoke test público ainda obrigatório depois da publicação.

## Tag planejada

tag planejada: `v0.2.0`
