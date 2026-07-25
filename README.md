# Organizador de Conteúdos

Aplicação web local para organizar estudos em **Matéria → Tema → Assunto**.

## Situação atual

Esta pasta implementa o **M7 — Pesquisa Geral e filtros**. A aplicação já possui gerenciamento completo da hierarquia, persistência local, Visão Geral com indicadores e pesquisa unificada em Matérias, Temas e Assuntos.

## Preparação

```bash
npm install
npm run check
npm run verify:m7
npm run serve
```

Servidor: `http://127.0.0.1:4173`

## Rotas

- `#/` — Visão Geral com indicadores e prioridades;
- `#/materias` — gerenciamento de Matérias;
- `#/materias/:materiaId` — gerenciamento de Temas e Assuntos da Matéria;
- `#/materias/:materiaId?tema=:temaId&assunto=:assuntoId` — navegação profunda;
- `#/pesquisa?q=:termo&tipo=:tipo` — Pesquisa Geral funcional;
- `#/configuracoes` — Configurações e laboratório temporário do M3;
- `#/recuperacao` — Recuperação.

## M7

A Pesquisa Geral localiza nomes, descrições e observações, ignora caixa e acentos, oferece filtros por nível e abre diretamente a Matéria, o Tema ou o Assunto correspondente.

O roteiro manual está em `tests/manual/m7.md`.

## Limites

Ainda não existem movimentações entre estruturas pela interface, backup visual, preferências definitivas, histórico analítico ou service worker ativo.

## Autor

Vinícius Sidney
