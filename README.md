# Organizador de Conteúdos

Aplicação web local para organizar estudos em **Matéria → Tema → Assunto**.

## Situação atual

Esta pasta implementa o **M6 — Progresso e Visão Geral**. A aplicação já possui gerenciamento completo de Matérias, Temas e Assuntos, persistência local e um Dashboard funcional com indicadores, progresso, prioridades e estudos recentes.

## Preparação

```bash
npm install
npm run check
npm run verify:m6
npm run serve
```

Servidor: `http://127.0.0.1:4173`

## Rotas

- `#/` — Visão Geral com indicadores e prioridades;
- `#/materias` — gerenciamento de Matérias;
- `#/materias/:materiaId` — gerenciamento de Temas e Assuntos da Matéria;
- `#/pesquisa?q=:termo` — Pesquisa Geral provisória;
- `#/configuracoes` — Configurações e laboratório temporário do M3;
- `#/recuperacao` — Recuperação.

## M6

A Visão Geral apresenta progresso geral, contagens, lacunas da estrutura, distribuição pelos estados de estudo, prioridades automáticas, Matérias com menor progresso e datas recentes registradas nos Assuntos.

O roteiro manual está em `tests/manual/m6.md`.

## Limites

Ainda não existem Pesquisa Geral funcional, movimentações entre estruturas pela interface, backup visual, preferências definitivas, histórico analítico ou service worker ativo.

## Autor

Vinícius Sidney
