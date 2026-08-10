# Validação concluída do M2 — Domínio, validação e persistência

> **Documento histórico.** O M2 descreve a primeira arquitetura de domínio. O progresso local citado abaixo foi removido na integração posterior; o schema atual é v3 e o Study Stack é a fonte única do progresso.

## Status

**Aprovado pelo usuário.** Os testes manuais do M2 foram concluídos com resultado OK e o avanço ao M3 foi autorizado.

## Escopo concluído

- constantes oficiais de dificuldade, pontos de progresso, cores, chaves e limites;
- estrutura vazia e preferências padrão;
- UUID com alternativa segura;
- data local e datas técnicas;
- normalização de texto;
- validadores de Matéria, Tema, Assunto, preferências e estrutura completa;
- integridade de IDs, relações e ordens;
- seletores hierárquicos básicos;
- cálculo de progresso sem persistir dados derivados;
- criação e edição puras de Matéria, Tema e Assunto;
- reordenação e movimentação entre origens e destinos;
- exclusões isoladas e em cascata;
- `LocalStorageAdapter` como único acesso direto ao armazenamento;
- adaptador de memória para testes;
- migrações preparadas para o esquema 1;
- `AppRepository` com leitura, gravação, recuperação e preferências;
- preservação de dados brutos inválidos;
- tratamento de falhas e limite de armazenamento;
- verificação integrada executável por `npm run verify:m2`.

## Limites mantidos

O M2 não implementa:

- CRUD visual;
- formulários;
- cards definitivos;
- carregamento do repositório no AppShell;
- backup em arquivo;
- importação pela interface;
- recuperação visual definitiva;
- indicadores do Dashboard;
- pesquisa real;
- service worker ativo.

## Critério de conclusão

É possível criar, validar, transformar, salvar e recarregar dados inteiramente por módulos e testes, sem DOM, preservando integridade e mantendo o retrato anterior quando uma gravação falha.

## Roteiro manual

O roteiro `tests/manual/m2.md` foi concluído e o portão de avanço foi atendido.
