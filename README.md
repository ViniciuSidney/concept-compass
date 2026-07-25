# Organizador de Conteúdos

Aplicação web local para organizar estudos em **Matéria → Tema → Assunto**.

## Situação atual

Esta pasta implementa o **M5 — Gerenciamento de Temas e Assuntos**. O usuário pode administrar a hierarquia completa dentro de cada matéria, acompanhar estado, dificuldade e progresso, abrir detalhes em painel lateral e manter tudo no armazenamento local.

## Preparação

```bash
npm install
npm run check
npm run verify:m5
npm run serve
```

Servidor: `http://127.0.0.1:4173`

## Rotas

- `#/` — Visão Geral;
- `#/materias` — gerenciamento de Matérias;
- `#/materias/:materiaId` — gerenciamento de Temas e Assuntos da Matéria;
- `#/pesquisa?q=:termo` — Pesquisa Geral provisória;
- `#/configuracoes` — Configurações e laboratório temporário do M3;
- `#/recuperacao` — Recuperação.

## M5

A página de uma Matéria inclui resumo dinâmico, acordeões de Temas, formulários validados, assuntos com estado e dificuldade, reordenação acessível, exclusões confirmadas, progresso e painel lateral de detalhes.

O roteiro manual está em `tests/manual/m5.md`.

## Limites

Ainda não existem movimentações entre estruturas pela interface, Dashboard definitivo, Pesquisa Geral funcional, backup visual, preferências definitivas ou service worker ativo.

## Autor

Vinícius Sidney
