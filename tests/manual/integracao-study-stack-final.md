# Regressão manual final — Concept Compass ↔ Study Stack

## Objetivo

Validar a integração real em mesma origem depois das mudanças de schema, remoção do progresso local e atualização documental.

Execute os testes com dados descartáveis ou após exportar backups.

## Ambiente obrigatório

Pare os servidores individuais. Na pasta pai dos dois projetos:

```powershell
cd C:\Projetos
npx http-server . -p 4173 -c-1
```

No Concept Compass, use temporariamente:

```js
url: 'http://localhost:4173/study-stack/',
```

Abra somente:

```text
http://localhost:4173/concept-compass/
http://localhost:4173/study-stack/
```

Confirme `location.origin === "http://localhost:4173"` nas duas abas.

## I8-T01 — Abertura em nova aba

1. Abra um Assunto sem estudo.
2. Use **Iniciar estudo no Study Stack**.

Esperado:

- Study Stack abre em nova aba;
- a aba original do Concept Compass continua aberta;
- Matéria, Tema e Assunto chegam corretos;
- o `subjectId` é o mesmo do Concept Compass.

## I8-T02 — Atualização ao voltar

1. No Study Stack, registre atividade suficiente para deixar o Assunto entre `1/10` e `9/10`.
2. Volte para a aba do Concept Compass sem usar F5.

Esperado:

- a interface atualiza ao recuperar foco;
- o Assunto aparece **Em andamento**;
- o valor `x/10`, etapa e última atividade vêm do Study Stack;
- a ação muda para **Continuar estudo no Study Stack**.

## I8-T03 — Visão Geral e Pesquisa

1. Confira a Visão Geral.
2. Pesquise o mesmo Assunto na Pesquisa Geral.

Esperado:

- os dois locais mostram o mesmo estado sincronizado;
- prioridades e estudos recentes usam pendências/atividade do Study Stack;
- nenhum valor de progresso é editável no Concept Compass.

## I8-T04 — Consolidação

1. No Study Stack, conclua o fluxo até `10/10`.
2. Volte ao Concept Compass.

Esperado:

- aparece **Estudo consolidado**;
- a ação muda para **Ver estudo no Study Stack**;
- agregados de Tema/Matéria são recalculados com dez pontos máximos para esse Assunto.

## I8-T05 — Arquivamento hierárquico em aba já aberta

1. Mantenha o Assunto aberto no Study Stack.
2. Na aba do Concept Compass, arquive o Assunto.
3. Sem usar F5 no Study Stack, confira a aba já aberta.
4. Use **Voltar e restaurar no Concept Compass**, confirme que o retorno abre em uma nova aba e restaure o Assunto.
5. Repita arquivando/restaurando apenas o Tema pai e depois a Matéria pai.

Esperado:

- arquivar o pai não altera a flag própria do filho;
- o histórico e os dados do estudo permanecem preservados;
- a aba aberta muda automaticamente para **Estudo arquivado**;
- criação, edição e mudança de etapa ficam bloqueadas;
- o aviso oferece **Voltar e restaurar no Concept Compass**;
- a descrição usa **O Assunto**, **O Tema** ou **A Matéria**, com a concordância correspondente;
- o link aponta para a Matéria, Tema ou Assunto que originou o bloqueio, em vez de cair apenas na página inicial;
- o link abre o Concept Compass em uma nova aba e mantém a aba original do Study Stack aberta;
- a interface não exibe instruções técnicas sobre `F5`;
- restaurar o conteúdo libera a mesma aba automaticamente, sem F5 e sem recriar IDs.

## I8-T06 — Renomear e mover com atualização ao vivo

1. Mantenha o Assunto aberto no Study Stack.
2. Renomeie o Assunto no Concept Compass.
3. Confira o Study Stack sem F5.
4. Mova o mesmo Assunto para outro Tema ou Matéria.
5. Confira novamente a aba já aberta.

Esperado:

- o `subjectId` permanece estável;
- nome do Assunto, Tema e Matéria são atualizados automaticamente;
- o retorno para o Concept Compass aponta para a nova hierarquia;
- o estudo existente continua associado ao mesmo Assunto;
- nenhuma atualização exige recarregar a página.

## I8-T07 — Exclusão permanente vinculada com estado próprio

Use conteúdo descartável.

1. Crie um Assunto e gere algum dado no Study Stack.
2. Mantenha a aba desse Assunto aberta.
3. Exclua permanentemente o Assunto no Concept Compass.
4. Confira o Study Stack sem F5.

Esperado:

- a exclusão local só acontece depois da preparação do comando;
- o comando chega ao estado pronto para consumo;
- os dados vinculados ao mesmo `subjectId` são removidos pelo Study Stack;
- a aba aberta exibe **Assunto não disponível**, e não a tela genérica **Comece pelo Concept Compass**;
- aparece a ação **Voltar ao Concept Compass**;
- o link aponta para uma rota válida do Concept Compass, sem reaproveitar URL externa ou insegura;
- outros Assuntos permanecem intactos.

Repita, se desejado, excluindo um Tema ou Matéria com mais de um Assunto para validar a cascata.

## I8-T08 — Backup antigo

1. Importe uma cópia de backup válida dos schemas v1 ou v2.
2. Confirme a importação.

Esperado:

- dados estruturais chegam ao schema v3;
- IDs, textos, dificuldade, observações e hierarquia são preservados;
- pontos/meta/reforço/último estudo antigos não aparecem no registro atual;
- nenhum progresso é criado artificialmente no Study Stack.

## I8-T09 — Estados de falha

Cobertura principal automatizada.

Esperado:

- resumo inválido → **Sincronização pendente**;
- contrato incompatível → **Atualização necessária**;
- nenhum caso usa fallback de progresso local.

## Encerramento

Depois da regressão:

1. restaure `src/core/config.js` para `https://viniciusidney.github.io/study-stack/`;
2. execute `npm run release:check`;
3. confirme `git diff --check`;
4. confira `git status --short`;
5. somente então prepare o commit.
