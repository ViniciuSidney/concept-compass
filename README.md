# Organizador de Conteúdos

Aplicação web local para organizar estudos pela hierarquia:

```text
Matéria
└── Tema
    └── Assunto
```

## Situação atual

Esta pasta implementa o **M1 — Fundação técnica e AppShell mínimo** da v0.1 e está pronta para validação manual.

A aplicação já possui núcleo modular, store, roteamento por fragmento, AppShell responsivo e páginas provisórias. CRUD acadêmico, persistência de dados e regras de progresso ainda não foram implementados.

## Onde manter a pasta

Mantenha o projeto em uma pasta local que não seja sincronizada pelo Google Drive, OneDrive ou serviço semelhante. Exemplo no Windows:

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

## Rotas do M1

```text
#/                              Visão Geral
#/materias                      Matérias
#/materias/:materiaId           Matéria específica
#/pesquisa?q=:termo             Pesquisa Geral
#/configuracoes                 Configurações
#/recuperacao                   Recuperação de Dados
```

Rotas desconhecidas exibem o estado de Conteúdo Não Encontrado sem derrubar a aplicação.

## Estrutura implementada

- `src/core`: inicialização, configuração, erros, store e roteador;
- `src/features`: páginas provisórias por funcionalidade;
- `src/ui`: AppShell, navegação, ícones e estados reutilizáveis;
- `src/styles`: tokens, base, layout, componentes, páginas e responsividade;
- `tests`: testes unitários e de integração.

## Limites do M1

Ainda não existem:

- Matérias, Temas ou Assuntos persistidos;
- formulários acadêmicos;
- pesquisa funcional;
- filtros;
- progresso;
- backup;
- service worker ativo.

## Branches

- `main`: base estável;
- `dev`: integração da v0.1;
- `feature/<objetivo>`: funcionalidade isolada;
- `fix/<problema>`: correção isolada.

A pasta é entregue na branch `dev`.

## Próximo marco

Após validar o M1, iniciar o **M2 — Domínio, validação e persistência**. Nenhum CRUD visual deverá salvar dados antes da conclusão do repositório e dos validadores.

## Autor

Vinícius Sidney
