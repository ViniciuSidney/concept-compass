# Changelog

Todas as mudanças relevantes do Concept Compass serão registradas neste arquivo.

## [Não lançado]

## [0.2.0] - 2026-08-09

### Adicionado

- integração bidirecional com o Study Stack por IDs estáveis;
- leitura do resumo de progresso `study-stack:integration:progress:v1`;
- progresso objetivo `0–10`, etapas, pendências, avisos, próxima ação e última atividade na interface;
- atualização automática ao retornar para a aba, recuperar visibilidade ou receber evento `storage`;
- arquivamento próprio de Matéria, Tema e Assunto com bloqueio hierárquico da ação de estudo;
- exclusão permanente vinculada por fila `prepared → ready`;
- contrato de exclusão `1.0.0` e chaves dedicadas para comandos e confirmações;
- testes de fronteira para impedir a reintrodução do progresso manual no runtime;
- nova identidade visual baseada em uma bússola conectada a pontos de conhecimento;
- favicon, marca lateral e ícones PWA atualizados.

### Alterado

- o Study Stack passou a ser a **fonte única do progresso de estudo**;
- Visão Geral e Pesquisa Geral passaram a consumir exclusivamente o resumo sincronizado;
- ações de Assunto passaram a usar **Iniciar**, **Continuar** ou **Ver estudo no Study Stack**;
- abertura do Study Stack passou a ocorrer em uma **nova aba**;
- progresso agregado de Tema, Matéria e aplicação passou a usar a capacidade objetiva de dez pontos por Assunto;
- schema estrutural elevado para `v3`;
- backups v1/v2 passam pela cadeia de migração até o schema v3;
- documentação de uso, integração e backlog atualizada para a nova divisão de responsabilidades.

### Removido

- controles de aumentar, diminuir, ajustar, concluir e reiniciar progresso no Concept Compass;
- campos atuais de pontos, meta, reforço e último estudo do registro de Assunto;
- serviço de progresso manual e componente segmentado associados ao modelo antigo;
- fallback para progresso legado quando a sincronização com o Study Stack falha.

### Compatibilidade

- backups antigos válidos continuam importáveis;
- campos de progresso dos schemas v1/v2 são descartados na migração e não geram progresso artificial no Study Stack;
- IDs, textos, dificuldade, observações, hierarquia, arquivamento e ordem são preservados;
- chaves históricas `organizador-conteudos:*` do `localStorage` continuam preservadas;
- versões `v0.1`, `v0.1.0` e `v0.1.1` continuam aceitas na importação de backups compatíveis.

### Validação

- testes automatizados dos contratos, estados de sincronização, agregação, arquivamento e exclusão vinculada;
- teste estrutural que proíbe campos e módulos legados fora da migração histórica;
- `npm run release:check` como portão técnico;
- roteiro de regressão compartilhada em `tests/manual/integracao-study-stack-final.md`.

## [0.1.1] - 2026-07-30

### Alterado

- aplicação renomeada de **Organizador de Conteúdos** para **Concept Compass**;
- nome exibido na interface, título, manifesto, descrição, seção Sobre e documentação;
- novos backups passam a usar a marca `Concept Compass` e o prefixo `concept-compass-backup`;
- arquivos de recuperação passam a usar o prefixo `concept-compass-dados-preservados`;
- versão técnica atualizada para `0.1.1`.

### Compatibilidade

- chaves históricas `organizador-conteudos:*` do LocalStorage foram preservadas;
- dados já cadastrados continuam disponíveis após a atualização;
- backups identificados como `Organizador de Conteúdos` e versão `v0.1` continuam aceitos;
- nome técnico do pacote e do repositório permanece `organizador-de-conteudos`.

## [0.1.0] - 2026-07-30

### Adicionado

- hierarquia completa Matéria → Tema → Assunto;
- CRUD, reordenação e movimentação estrutural;
- pontos de progresso flexíveis, metas e reforço independente;
- Visão Geral com progresso agregado, prioridades e estudos recentes;
- Pesquisa Geral com filtros e navegação profunda;
- temas Claro, Escuro e Seguir sistema;
- backup JSON, importação validada e recuperação de dados corrompidos;
- confirmação destrutiva em duas etapas com digitação de `EXCLUIR`;
- responsividade, navegação por teclado e controle de foco;
- manifest, favicon e ícones finais para instalação;
- documentação de uso, publicação, testes e release.

### Alterado

- progresso deixou de usar estados escolhidos manualmente e passou a usar pontos atuais e meta total;
- Tema, Matéria e progresso geral passaram a usar soma de pontos dividida pela soma das metas;
- backups antigos da v0.1 são migrados antes da validação final.

### Decisões

- dados permanecem exclusivamente no LocalStorage;
- service worker não será ativado na v0.1.0;
- ficha de conteúdo e metacognição por data foram direcionadas à v0.2.
