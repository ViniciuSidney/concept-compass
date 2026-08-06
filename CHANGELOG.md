# Changelog

Todas as mudanças relevantes do Concept Compass serão registradas neste arquivo.

## [Não lançado]

### Adicionado

- ação **Abrir no Study Stack** no menu e no painel de detalhes de cada Assunto;
- contrato de integração `1.0.0` com Matéria, Tema, Assunto e URL de retorno profundo;
- nova identidade visual baseada em uma bússola conectada a pontos de conhecimento;
- favicon, marca lateral e ícones PWA atualizados.

### Validação

- testes automatizados do contrato, do retorno profundo e da navegação para o Study Stack;
- verificação dos ícones SVG e PNG nas superfícies oficiais da aplicação.

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
