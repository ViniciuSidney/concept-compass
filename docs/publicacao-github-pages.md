# Publicação no GitHub Pages — v0.1.1

## Estratégia escolhida

A aplicação é estática e não possui etapa de build. A publicação usa:

- branch: `main`;
- pasta: `/(root)`;
- fonte: **Deploy from a branch**.

O arquivo `.nojekyll` evita processamento desnecessário. Todos os caminhos são relativos e as rotas usam fragmentos (`#`), mantendo compatibilidade com subpastas do GitHub Pages.

## Antes de publicar

```bash
npm ci
npm run release:check
git status
```

Nenhuma alteração pendente deve existir.

## Integração da versão

Depois que a atualização estiver aprovada:

```bash
git switch main
git merge --no-ff feat/renomeacao-concept-compass
git tag -a v0.1.1 -m "Concept Compass v0.1.1"
git push origin main
git push origin v0.1.1
```

A tag deve apontar para o mesmo commit publicado em `main`.

## Testes na versão publicada

Execute pelo menos:

- confirmar **Concept Compass** na interface, título e manifesto;
- conferir que dados anteriores continuam disponíveis;
- criar Matéria, Tema e Assunto fictícios;
- ajustar progresso e pesquisar;
- exportar um backup com o novo nome;
- importar um backup antigo do Organizador de Conteúdos;
- alternar aparência;
- testar em desktop e celular;
- verificar console e manifesto.

## Service worker

A v0.1.1 não registra service worker. A decisão evita cache persistente sem uma interface de atualização validada.

## Dados reais

Nunca inclua backups reais no repositório. A conferência manual continua obrigatória.
