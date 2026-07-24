# Organizador de Conteúdos

Aplicação web local para organizar estudos em **Matéria → Tema → Assunto**.

## Situação atual

Esta pasta implementa o **M4 — Gerenciamento de Matérias**. O usuário já pode criar, editar, pesquisar, ordenar, reordenar, abrir e excluir matérias com persistência local. Temas e Assuntos continuam reservados ao M5.

## Preparação

```bash
npm install
npm run check
npm run verify:m4
npm run serve
```

Servidor: `http://127.0.0.1:4173`

## Rotas

- `#/` — Visão Geral;
- `#/materias` — gerenciamento de Matérias;
- `#/materias/:materiaId` — abertura de uma Matéria;
- `#/pesquisa?q=:termo` — Pesquisa Geral provisória;
- `#/configuracoes` — Configurações e laboratório temporário do M3;
- `#/recuperacao` — Recuperação.

## M4

A tela de Matérias inclui estado vazio, cards, formulário contextual, cores de identificação, pesquisa, ordenações de visualização, reordenação acessível, exclusão com impacto e persistência pelo `AppRepository`.

O roteiro manual está em `tests/manual/m4.md`.

## Limites

Ainda não existem CRUD visual de Temas e Assuntos, Dashboard definitivo, Pesquisa Geral funcional, backup visual ou service worker ativo.

## Autor

Vinícius Sidney
