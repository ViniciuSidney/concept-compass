# Integração Concept Compass ↔ Study Stack

## 1. Objetivo e fronteira de responsabilidade

A integração conecta a estrutura acadêmica do Concept Compass ao fluxo de estudo do Study Stack sem duplicar responsabilidades.

**Concept Compass** é responsável por Matéria, Tema, Assunto, IDs, relações, dificuldade, observações, ordem e arquivamento.

**Study Stack** é responsável por progresso `0–10`, etapas, pendências, próxima ação, atividade e consolidação.

Regra principal:

> O Concept Compass lê e apresenta o progresso publicado pelo Study Stack; ele não calcula, edita nem usa progresso local como fallback.

## 2. Fluxo oficial

```text
Concept Compass
      ↓
Matéria → Tema → Assunto
      ↓
Study Stack
      ↓
Base → Prática → Análise → Revisão → Consolidação
      ↓
resumo 0–10 + pendências + atividade
      ↓
Concept Compass
```

## 3. Pontos de entrada e navegação

O Study Stack pode ser aberto:

- pela ação principal da linha do Assunto;
- pelo painel de detalhes do Assunto.

A navegação ocorre em uma **nova aba**. A aba original do Concept Compass permanece aberta para receber a atualização quando o usuário voltar.

Os rótulos são contextuais:

- **Iniciar estudo no Study Stack** — sem registro;
- **Continuar estudo no Study Stack** — em andamento;
- **Ver estudo no Study Stack** — consolidado.

Assuntos efetivamente arquivados não oferecem a ação até serem restaurados.

## 4. Contrato Concept Compass → Study Stack

Versão atual: `1.0.0`.

Destino oficial:

```text
https://viniciusidney.github.io/study-stack/?subjectContext=...#/overview
```

O parâmetro `subjectContext` contém JSON codificado na URL:

```json
{
  "contractVersion": "1.0.0",
  "sentAt": "data e hora ISO 8601",
  "sourceApp": "concept_compass",
  "subject": {
    "matterId": "identificador da matéria",
    "matterName": "nome da matéria",
    "themeId": "identificador do tema",
    "themeName": "nome do tema",
    "subjectId": "identificador do assunto",
    "subjectName": "nome do assunto"
  },
  "sourceArchived": false,
  "returnUrl": "URL profunda do assunto no Concept Compass",
  "navigationContext": {
    "route": "materia",
    "materiaId": "identificador da matéria",
    "temaId": "identificador do tema",
    "assuntoId": "identificador do assunto"
  }
}
```

Os IDs são a identidade durável da integração. Renomear ou mover estruturas não deve gerar um novo `subjectId`.

## 5. Retorno profundo

A URL de retorno usa:

```text
#/materias/:materiaId?tema=:temaId&assunto=:assuntoId
```

Ao seguir esse retorno, o Concept Compass abre a Matéria, expande o Tema solicitado, destaca o Assunto e abre seu painel de detalhes.

## 6. Contrato Study Stack → Concept Compass

O Study Stack publica um resumo no `localStorage`:

```text
study-stack:integration:progress:v1
```

Versão de contrato aceita atualmente:

```text
1.0.0
```

O envelope deve informar `sourceApp: "study_stack"`, `updatedAt` em ISO 8601 e um mapa `subjects`.

Para cada `subjectId`, o Concept Compass valida, entre outros campos:

- `matterId` e `themeId`;
- `status`: `not_started`, `in_progress`, `consolidated` ou `archived`;
- `progress` e `maxProgress`;
- `currentStage` e `recommendedStage`;
- `sourceArchived` e `consolidated`;
- `pendingErrors` e `pendingReviews`;
- `lastActivityAt`;
- progresso das cinco etapas;
- avisos e aviso recomendado;
- próxima ação.

As etapas oficiais são:

```text
base
practice
analysis
review
consolidation
```

Na interface: **Base, Prática, Análise, Revisão e Consolidação**.

## 7. Atualização automática

O resumo é lido na inicialização/renderização e verificado novamente quando:

- outra aba dispara evento `storage` para a chave do resumo;
- a aba do Concept Compass recupera o foco;
- o documento volta a ficar visível.

A atualização usa uma impressão do conteúdo salvo para evitar renderizações desnecessárias quando nada mudou.

## 8. Estados de falha

A leitura pode resultar em:

- `missing` — nenhum resumo global publicado ainda;
- `ready` — contrato válido;
- `pending` — erro de acesso, JSON inválido ou contrato estruturalmente inválido;
- `update_required` — versão do contrato incompatível.

Na interface:

- `pending` → **Sincronização pendente**;
- `update_required` → **Atualização necessária**.

Nenhum desses estados pode recorrer ao progresso manual removido do Concept Compass.

## 9. Arquivamento hierárquico

Matéria, Tema e Assunto possuem flags próprias de arquivamento.

A efetividade é hierárquica: um Assunto fica indisponível para abertura no Study Stack se ele próprio, seu Tema ou sua Matéria estiver arquivado.

Arquivar um pai não modifica as flags dos filhos. Restaurar o pai preserva os estados próprios dos descendentes.

O resumo sincronizado permanece visível quando útil, mas a ação de abrir o Study Stack fica bloqueada enquanto a origem estiver efetivamente arquivada.

## 10. Exclusão permanente vinculada

A exclusão usa IDs estáveis e uma fila de comandos em:

```text
study-stack:integration:deletion-commands:v1
```

Contrato atual: `1.0.0`.

O Concept Compass usa duas fases:

```text
prepared → ready
```

1. resolve todos os Assuntos que serão atingidos;
2. grava comandos `prepared`;
3. executa a exclusão local;
4. promove os comandos para `ready`;
5. se a promoção falhar após a exclusão local, `reconcile()` pode recuperá-la na próxima inicialização/foco.

Se a exclusão local falhar, os comandos ainda `prepared` são cancelados em melhor esforço e não devem ser consumidos como exclusões prontas.

A chave contratada para confirmações do consumidor é:

```text
study-stack:integration:deletion-acks:v1
```

A implementação atual do bridge do Concept Compass publica e reconcilia a fila de comandos; o tratamento interno dos dados removidos pertence ao Study Stack.

## 11. Regra de mesma origem

A comunicação de progresso e exclusão usa `localStorage`. Por isso, ambos os aplicativos precisam possuir o mesmo:

- protocolo;
- host;
- porta.

Caminhos diferentes não quebram a origem.

### Produção

```text
https://viniciusidney.github.io/concept-compass/
https://viniciusidney.github.io/study-stack/
```

Origem comum:

```text
https://viniciusidney.github.io
```

### Teste integrado local

Pare servidores individuais e inicie um único servidor a partir de `C:\Projetos`:

```powershell
cd C:\Projetos
npx http-server . -p 4173 -c-1
```

Durante o teste integrado, o destino configurado no Concept Compass deve apontar temporariamente para:

```text
http://localhost:4173/study-stack/
```

Abra somente:

```text
http://localhost:4173/concept-compass/
http://localhost:4173/study-stack/
```

Confirme no DevTools das duas abas:

```js
location.origin;
```

Resultado esperado nas duas:

```text
http://localhost:4173
```

Não misture `localhost`, `127.0.0.1`, IP local, Tailscale, GitHub Pages ou portas diferentes.

Depois dos testes, restaure `src/core/config.js` para a URL oficial antes do commit.

## 12. Schema e backups

O schema atual do Concept Compass é o **v3** e não contém os antigos campos locais de progresso.

A cadeia de compatibilidade é:

```text
v1 (estados) → v2 (pontos) → v3 (estrutura)
```

Backups antigos válidos continuam importáveis, mas progresso antigo é removido durante a migração. Esses valores não são convertidos em progresso do Study Stack.

O backup do Concept Compass não é backup do Study Stack.

## 13. Arquivos principais

- `src/core/config.js` — URLs, versões e chaves da integração;
- `src/integrations/study-stack-link.js` — contexto e URL de abertura;
- `src/integrations/study-stack-summary-reader.js` — validação e leitura do resumo;
- `src/integrations/study-stack-subject-state.js` — resolução segura do estado por Assunto;
- `src/integrations/study-stack-progress-aggregate.js` — agregação objetiva;
- `src/integrations/study-stack-deletion-bridge.js` — exclusão vinculada;
- `src/features/materias/assunto-study-status.js` — apresentação na interface.

## 14. Regressão mínima

O roteiro final está em:

```text
tests/manual/integracao-study-stack-final.md
```

Antes de publicar uma mudança na integração, execute também:

```bash
npm run release:check
```
