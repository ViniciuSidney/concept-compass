# Organizador de Conteúdos

Aplicação web local para organizar estudos em **Matéria → Tema → Assunto**.

## Situação atual

Esta pasta implementa o **M10 — Responsividade, acessibilidade e revisão completa do tema escuro**. Os marcos M0 a M9 foram validados e permanecem preservados.

## Preparação

```bash
npm install
npm run check
npm run verify:m10
npm run serve
```

Servidor: `http://127.0.0.1:4173`

## Rotas

- `#/` — Visão Geral com pontos, prioridades e estudos recentes;
- `#/materias` — gerenciamento de Matérias;
- `#/materias/:materiaId` — gerenciamento da hierarquia e do progresso;
- `#/materias/:materiaId?tema=:temaId&assunto=:assuntoId` — navegação profunda;
- `#/pesquisa?q=:termo&tipo=:tipo` — Pesquisa Geral funcional;
- `#/configuracoes` — aparência, backup, dados e informações da aplicação;
- `#/recuperacao` — preservação e restauração quando os dados locais são inválidos.

## M10

### Responsividade

- AppShell fixo em desktop e navegação sobreposta em tablet/mobile;
- revisão em desktop amplo, desktop comum, tablet, `390 px` e `320 px`;
- grades de Matérias em 3, 2 e 1 coluna;
- Temas, Assuntos, filtros e cabeçalhos adaptáveis;
- modais extensos em tela cheia quando necessário;
- painéis laterais responsivos;
- viewport dinâmica e áreas seguras;
- ausência planejada de rolagem horizontal geral.

### Acessibilidade

- skip link e landmarks preservados;
- navegação móvel, modais e painéis com foco controlado;
- conteúdo ao fundo inerte durante sobreposições;
- menus operáveis por setas, `Home`, `End`, `Esc` e `Tab`;
- retorno de foco após fechamento;
- alvos mínimos de toque;
- suporte a movimento reduzido e cores forçadas;
- fluxo essencial realizável sem mouse.

### Tema escuro

- tokens semânticos de estados e categorias;
- superfícies, campos, menus, modais, painéis e toasts revisados;
- bordas no lugar de sombras excessivas;
- contraste reforçado em foco, feedback, ações destrutivas e progresso;
- tema resolvido antecipadamente, inclusive em Seguir sistema.

O roteiro manual está em `tests/manual/m10.md`.

## Sistema de progresso

Cada Assunto possui pontos atuais, meta total de `1` a `20`, marcação independente de reforço e situação derivada. Tema, Matéria e Visão Geral usam a soma dos pontos atuais dividida pela soma das metas.

## Limites

Ainda falta o **M11 — Estabilização, publicação e fechamento da v0.1**. Não existem contas, nuvem, colaboração, histórico de backups ou service worker ativo.

## Autor

Vinícius Sidney
