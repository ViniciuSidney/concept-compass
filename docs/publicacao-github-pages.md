# Publicação no GitHub Pages — v0.2.0

## Estratégia

A aplicação é estática e não possui etapa de build. A publicação usa a branch `main`, a pasta `/(root)` e a opção **Deploy from a branch**.

O arquivo `.nojekyll`, os caminhos relativos e as rotas por fragmento preservam o funcionamento em subpasta.

## Antes de publicar

Execute nos dois projetos:

```bash
npm ci
npm run release:check # Concept Compass
npm run check         # Study Stack
git diff --check
git status
```

Não inclua backups reais, massa gerada, relatórios ou dependências instaladas no Git.

## Integração da versão

Depois da revisão dos commits em `dev`, integre cada repositório separadamente:

```bash
git switch main
git merge --no-ff dev
git tag -a v0.2.0 -m "v0.2.0"
git push origin main
git push origin v0.2.0
```

Em cada repositório, `main`, tag, GitHub Release e GitHub Pages devem apontar para o mesmo commit publicado.

## Smoke test público integrado

Use as URLs oficiais, que compartilham a mesma origem:

```text
https://viniciusidney.github.io/concept-compass/
https://viniciusidney.github.io/study-stack/
```

Confirme:

- versão `v0.2.0` nas duas aplicações;
- abertura contextual do Study Stack em nova aba;
- publicação e leitura do progresso oficial;
- arquivamento e restauração ao vivo;
- renomeação e movimentação sem F5;
- exclusão vinculada e estado **Assunto não disponível**;
- retorno profundo ao Concept Compass em nova aba;
- criação e importação de backups próprios;
- importação de backup antigo compatível no Concept Compass;
- temas, responsividade, Console e recursos estáticos sem erro.

## Service worker

A v0.2.0 não registra service worker. A decisão evita cache persistente sem uma interface de atualização validada.

## Dados reais

Nunca inclua backups reais no repositório. A conferência manual continua obrigatória.
