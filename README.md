# Organizador de Conteúdos

Aplicação web local para organizar estudos pela hierarquia:

```text
Matéria
└── Tema
    └── Assunto
```

## Situação atual

Esta pasta representa somente o **M0 — Preparação do repositório** da v0.1.

Ela contém a fundação técnica reproduzível, mas ainda não implementa CRUD, cards, pesquisa, persistência acadêmica ou regras de progresso.

## Onde manter a pasta

Extraia o projeto em uma pasta local que não seja sincronizada pelo Google Drive, OneDrive ou serviço semelhante. Exemplo no Windows:

```text
C:\Projetos\organizador-de-conteudos
```

## Requisitos

- Node.js LTS;
- npm;
- Git;
- navegador moderno.

## Preparação

```bash
npm install
```

## Comandos

```bash
npm run serve
npm test
npm run lint
npm run format
npm run format:check
npm run check
```

O servidor local usa, por padrão:

```text
http://127.0.0.1:4173
```

## Escopo do M0

- estrutura inicial de pastas;
- página mínima;
- módulos ES;
- servidor HTTP local sem dependência externa;
- ESLint;
- Prettier;
- `node:test`;
- Git com branches `main` e `dev`;
- zero dependências de execução;
- nenhum dado real.

## Branches

- `main`: base estável;
- `dev`: desenvolvimento da v0.1;
- `feature/<objetivo>`: funcionalidade isolada;
- `fix/<problema>`: correção isolada.

A pasta é entregue na branch `dev`.

## Próximo marco

Após validar o M0, iniciar o **M1 — Fundação técnica e AppShell mínimo**. Não implementar regras acadêmicas antes da base de domínio e persistência prevista no M2.

## Autor

Vinícius Sidney
