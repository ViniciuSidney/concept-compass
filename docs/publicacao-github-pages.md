# Publicação no GitHub Pages — v0.1.0

## Estratégia escolhida

A aplicação é estática e não possui etapa de build. A publicação recomendada usa:

- branch: `main`;
- pasta: `/(root)`;
- fonte: **Deploy from a branch**.

O arquivo `.nojekyll` impede processamento desnecessário do conteúdo estático. Todos os caminhos da aplicação são relativos e as rotas usam fragmentos (`#`), mantendo compatibilidade com subpastas do GitHub Pages.

## Antes de publicar

```bash
npm install
npm run release:check
```

Confirme também:

```bash
git status
git log --oneline --decorate -5
```

Nenhuma alteração pendente deve existir.

## Integração da versão

Depois que todos os casos do M11 estiverem aprovados:

```bash
git switch main
git merge --no-ff dev
git tag -a v0.1.0 -m "Organizador de Conteúdos v0.1.0"
git push origin main
git push origin v0.1.0
```

A tag deve apontar para o mesmo commit publicado em `main`.

## Configuração no GitHub

No repositório:

1. abra **Settings**;
2. acesse **Pages**;
3. em **Build and deployment**, escolha **Deploy from a branch**;
4. selecione `main`;
5. selecione `/(root)`;
6. salve.

## Testes na versão publicada

Execute pelo menos:

- abrir Visão Geral, Matérias, Pesquisa e Configurações;
- recarregar cada rota com fragmento;
- criar Matéria, Tema e Assunto fictícios;
- ajustar progresso;
- exportar e importar backup;
- alternar aparência;
- testar em desktop e celular;
- verificar console e manifesto;
- confirmar que uma atualização publicada aparece após recarregar.

## Service worker

A v0.1.0 não registra service worker. Essa decisão evita cache persistente sem uma interface de atualização validada. O arquivo reservado não interfere no funcionamento nem na publicação.

## Dados reais

Nunca inclua backups reais no repositório. O `.gitignore` bloqueia os nomes oficiais de backup, mas a conferência manual continua obrigatória.
