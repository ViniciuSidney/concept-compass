# Organizador de Conteúdos

Aplicação web local para organizar estudos em **Matéria → Tema → Assunto**.

## Situação atual

Esta pasta implementa o **M3 — Sistema visual e componentes globais**. O domínio e a persistência do M2 continuam preservados, mas ainda não há CRUD visual.

## Preparação

```bash
npm install
npm run check
npm run verify:m3
npm run serve
```

Servidor: `http://127.0.0.1:4173`

## Rotas

- `#/` — Visão Geral;
- `#/materias` — Matérias;
- `#/materias/:materiaId` — Matéria específica;
- `#/pesquisa?q=:termo` — Pesquisa Geral;
- `#/configuracoes` — Configurações e laboratório temporário do M3;
- `#/recuperacao` — Recuperação.

## M3

Foram adicionados tokens, temas, componentes de controles, cabeçalhos, breadcrumbs, feedbacks, estados, modal, painel lateral, menu de ações e comportamento responsivo. A prévia de tema não é persistida; isso pertence ao M9.

O roteiro manual está em `tests/manual/m3.md`.

## Limites

Ainda não existem matérias reais, formulários acadêmicos, CRUD visual, pesquisa funcional, backup visual ou service worker ativo.

## Autor

Vinícius Sidney
