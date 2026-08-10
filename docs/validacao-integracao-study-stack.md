# Validação final da integração Concept Compass ↔ Study Stack

## Status em 09/08/2026

**Implementação e validação da Etapa 8 aprovadas. Versionamento v0.2.0 aplicado; publicação pendente.**

## Escopo validado automaticamente

A estabilização final cobre:

- schema estrutural v3;
- migração segura v1 → v2 → v3;
- ausência de progresso manual no runtime;
- ausência dos módulos antigos de progresso;
- Study Stack como fonte única dos indicadores;
- Dashboard e Pesquisa usando o resumo sincronizado;
- arquivamento hierárquico;
- exclusão permanente vinculada;
- contratos e estados de sincronização;
- documentação atual coerente com a arquitetura;
- compatibilidade de identidade e backups.

## Resultados automatizados

Executado sobre o projeto consolidado da Etapa 8C.3:

```text
npm run check          OK
203 testes             203 aprovados
eslint                  OK
prettier --check        OK
npm run verify:all      OK
npm run release:check   OK
git diff --check        OK
servidor estático       OK
```

O smoke test do servidor confirmou o carregamento da página principal e da configuração da integração.

## Fronteira do progresso legado

As strings históricas:

```text
pontosProgresso
metaPontosProgresso
precisaReforco
ultimoEstudoEm
```

podem existir em `src/data/migrations/data-migrations.js` para importar dados antigos.

Elas não podem reaparecer no restante de `src/`.

Também devem permanecer ausentes:

```text
src/domain/services/progress-service.js
src/ui/components/segmented-progress.js
```

O teste `tests/unit/legacy-progress-boundary.test.js` protege essa fronteira.

## Correções confirmadas na regressão manual

A primeira execução manual identificou três comportamentos na aba já aberta do Study Stack:

- arquivamento não bloqueava a aba imediatamente;
- renomeação/movimentação exigia F5;
- exclusão caía na tela genérica de vínculo ausente.

As correções foram implementadas no Study Stack com observação ativa de `organizador-conteudos:data`, estados dedicados para arquivamento/exclusão e reconciliação por `storage`, foco e visibilidade.

O primeiro reteste de **I8-T05** revelou que, ao retornar ao Concept Compass na mesma aba do Study Stack, o observador deixava de acompanhar a restauração e o resumo arquivado podia permanecer visível. O fluxo foi corrigido para:

- abrir o retorno ao Concept Compass em nova aba;
- preservar a aba original e seu observador;
- fazer a restauração estrutural prevalecer sobre um resumo arquivado residual;
- flexionar corretamente **O Assunto**, **O Tema** e **A Matéria**;
- remover instruções técnicas sobre atualização por `F5`.

O reteste final confirmou a restauração ao vivo de Assunto, Tema e Matéria. Os casos **I8-T05, I8-T06 e I8-T07** foram aprovados.

## Resultado da regressão manual

A integração real por `localStorage` foi validada em mesma origem, usando duas abas das aplicações.

Resultados confirmados:

- **I8-T01–T04:** abertura, atualização ao voltar, agregação e consolidação aprovadas;
- **I8-T05:** arquivamento e restauração hierárquicos aprovados após o reteste final;
- **I8-T06:** renomeação e movimentação ao vivo aprovadas;
- **I8-T07:** exclusão permanente vinculada e estado próprio aprovados;
- **I8-T08–T09:** migrações antigas e estados de falha protegidos pela cobertura automatizada.

Roteiro:

```text
tests/manual/integracao-study-stack-final.md
```

O ambiente obrigatório usa:

```text
http://localhost:4173/concept-compass/
http://localhost:4173/study-stack/
```

com origem comum `http://localhost:4173`.

## Encerramento técnico da Etapa 8

Os critérios técnicos da Etapa 8 foram atendidos:

1. roteiro manual final executado e aprovado;
2. URL oficial do Study Stack restaurada no `src/core/config.js`;
3. `npm run release:check` aprovado;
4. `git diff --check` aprovado;
5. fronteira do progresso legado confirmada;
6. contratos e estados da integração validados nos dois aplicativos.

Restam como consolidação da release:

1. revisar o estado final do Git nos dois projetos;
2. criar os commits finais da Etapa 8 nas branches `dev`;
3. publicar, criar tags/releases e executar o smoke test público.
