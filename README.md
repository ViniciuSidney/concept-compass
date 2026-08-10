# Concept Compass

**Mapeie, organize e acompanhe seu conhecimento.**

O **Concept Compass** é uma aplicação web local-first para organizar conteúdos em **Matéria → Tema → Assunto**. O aplicativo mantém a estrutura do que estudar; o **Study Stack é a fonte única do progresso de estudo**.

> Versão candidata atual: **v0.2.0**

Esta versão consolida a integração bidirecional com o Study Stack e encerra a Etapa 8. A publicação no GitHub Pages e o smoke test público ainda fazem parte da consolidação da release.

## Responsabilidades das aplicações

### Concept Compass

Mantém:

- Matérias, Temas e Assuntos;
- IDs estáveis e relações hierárquicas;
- nomes, descrições, dificuldade e observações;
- ordem, movimentação e arquivamento;
- backup, importação e recuperação dos dados estruturais.

### Study Stack

Mantém:

- progresso objetivo de `0` a `10`;
- etapas **Base, Prática, Análise, Revisão e Consolidação**;
- pendências de erros e revisões;
- próxima ação recomendada;
- última atividade;
- estado consolidado.

O Concept Compass **não calcula, edita nem inventa progresso próprio**.

## Funcionalidades

- criação, edição, exclusão, arquivamento e restauração de Matérias, Temas e Assuntos;
- reordenação e movimentação de Temas entre Matérias e de Assuntos entre Temas;
- acesso contextual ao Study Stack em uma **nova aba**;
- leitura do progresso publicado pelo Study Stack;
- progresso agregado por Tema, Matéria e aplicação a partir da escala oficial de `0–10` por Assunto;
- Visão Geral com distribuição, prioridades e estudos recentes sincronizados;
- Pesquisa Geral com situação, etapa, pendências e última atividade do Study Stack;
- exclusão permanente vinculada ao Study Stack por IDs estáveis;
- aparência Claro, Escuro ou Seguir sistema;
- backup JSON, importação validada, exclusão protegida e recuperação de dados;
- funcionamento responsivo e acessível por teclado;
- armazenamento local, sem conta ou servidor de dados acadêmicos.

## Fluxo oficial de estudo

```text
Concept Compass
      ↓
Matéria → Tema → Assunto
      ↓
Study Stack
      ↓
0–10 + etapas + pendências + atividade
      ↓
Concept Compass apenas lê e apresenta
```

Em um Assunto, a ação varia conforme o estado sincronizado:

- **Iniciar estudo no Study Stack** — ainda não existem registros;
- **Continuar estudo no Study Stack** — estudo em andamento;
- **Ver estudo no Study Stack** — estudo consolidado.

Assuntos arquivados, ou descendentes de Tema/Matéria arquivados, preservam o histórico sincronizado, mas não podem abrir o Study Stack até a restauração.

## Integração com o Study Stack

O envio de contexto usa o contrato `1.0.0`, com os IDs e nomes da Matéria, do Tema e do Assunto, além da URL de retorno profundo.

O resumo de progresso é lido da chave:

```text
study-stack:integration:progress:v1
```

A interface se atualiza ao carregar e também quando detecta mudanças relevantes por `storage`, retorno de foco ou recuperação de visibilidade. Se o resumo estiver inválido, a interface exibe **Sincronização pendente**. Se a versão do contrato for incompatível, exibe **Atualização necessária**. Não existe fallback para o antigo progresso manual.

A exclusão permanente usa uma fila em duas fases (`prepared` → `ready`) para permitir a remoção vinculada no Study Stack sem apagar a estrutura local antes da preparação do comando.

A especificação completa está em `docs/integracao-study-stack.md`.

## Regra de mesma origem

A sincronização usa `localStorage`, portanto os dois aplicativos precisam compartilhar **protocolo, host e porta**.

Em produção, os caminhos oficiais compartilham a origem:

```text
https://viniciusidney.github.io/concept-compass/
https://viniciusidney.github.io/study-stack/
```

Para teste integrado local, use um único servidor a partir da pasta pai dos projetos:

```powershell
cd C:\Projetos
npx http-server . -p 4173 -c-1
```

Abra somente:

```text
http://localhost:4173/concept-compass/
http://localhost:4173/study-stack/
```

Não misture `localhost`, `127.0.0.1`, IP da rede, GitHub Pages ou portas diferentes durante um teste de integração.

O comando `npm run serve` continua útil para desenvolver e testar o Concept Compass isoladamente, mas duas aplicações em origens diferentes não compartilham `localStorage`.

## Dados, schema e backups

O schema estrutural atual é o **v3**. O registro atual de Assunto não contém mais os antigos campos de pontos, meta, reforço ou último estudo.

A migração preserva compatibilidade:

```text
schema v1 (estados antigos)
        ↓
schema v2 (pontos antigos)
        ↓
schema v3 (estrutura do conteúdo)
```

Backups v1/v2 válidos continuam importáveis. Os campos de progresso antigos são descartados durante a migração e **não são convertidos em progresso do Study Stack**, evitando criar evidências de estudo falsas.

O backup do Concept Compass contém somente os dados pertencentes ao Concept Compass. Dados de estudo armazenados pelo Study Stack não fazem parte desse arquivo.

As chaves históricas `organizador-conteudos:*` do `localStorage` continuam preservadas por compatibilidade com instalações anteriores.

## Compatibilidade da renomeação

A identidade **Concept Compass** continua separada da identidade técnica histórica. Por isso:

- o pacote e o repositório mantêm o identificador `organizador-de-conteudos`;
- as chaves `organizador-conteudos:*` não são renomeadas;
- backups identificados como **Organizador de Conteúdos** continuam aceitos quando compatíveis;
- rotas e IDs existentes não são recriados por causa da mudança de marca.

## Executar localmente

Requisitos: Node.js `20` ou superior e npm.

```bash
npm ci
npm run release:check
npm run serve
```

## Dados e segurança

Os dados ficam no `localStorage` do navegador. Eles não acompanham automaticamente outro navegador, perfil ou computador.

Antes de trocar de dispositivo, limpar dados do navegador ou testar operações destrutivas:

1. abra **Configurações**;
2. use **Exportar backup**;
3. guarde o JSON em local seguro;
4. preserve também os dados do Study Stack pelo mecanismo próprio dele, quando necessário;
5. importe o backup do Concept Compass no ambiente de destino.

## Rotas

- `#/` — Visão Geral;
- `#/materias` — Matérias;
- `#/materias/:materiaId` — workspace da Matéria;
- `#/pesquisa?q=:termo&tipo=:tipo` — Pesquisa Geral;
- `#/configuracoes` — aparência, backup, dados e Sobre;
- `#/recuperacao` — recuperação de armazenamento inválido.

## Comandos

```bash
npm run test                    # testes automatizados
npm run lint                    # análise estática
npm run format:check            # conferência de formatação
npm run check                   # testes + lint + formatação
npm run verify:all              # verificações estruturais e de integração
npm run release:check           # portão técnico completo
npm run generate:large-fixture  # gera massa fictícia em reports/
npm run serve                   # servidor isolado do Concept Compass
```

## Publicação

O projeto usa arquivos estáticos e caminhos relativos. A publicação recomendada é pelo branch `main`, pasta raiz, conforme `docs/publicacao-github-pages.md`.

O service worker continua inativo na versão técnica atual para evitar que cache antigo esconda atualizações sem um fluxo visual de renovação validado.

## Documentação

- `docs/manual-do-usuario.md` — uso atual da aplicação;
- `docs/integracao-study-stack.md` — contrato, sincronização, exclusão e ambiente compartilhado;
- `docs/validacao-integracao-study-stack.md` — portão automatizado e estado da regressão final;
- `tests/manual/integracao-study-stack-final.md` — regressão manual final da integração;
- `docs/publicacao-github-pages.md` — publicação e testes de produção;
- `docs/release-v0.2.0.md` — notas da versão candidata atual;
- `docs/validacao-v0.2.0.md` — validação técnica e manual da versão;
- `docs/backlog-v0.3.md` — possibilidades para o próximo ciclo.

Documentos de marcos antigos permanecem no repositório como histórico e podem descrever comportamentos que já foram substituídos.

## Próxima evolução

Depois da publicação da v0.2.0, a evolução deverá ser escolhida com base no uso real. A **Ficha do Assunto** e os **registros metacognitivos** permanecem como possibilidades para a v0.3.0, mantendo o Study Stack como responsável exclusivo pelo progresso de estudo.

## Autor

Vinícius Sidney
