# Organizador de Conteúdos

Aplicação web local para organizar estudos em **Matéria → Tema → Assunto**.

## Situação atual

Esta pasta implementa o **M8 — Reordenação, movimentação e exclusões completas**. A aplicação já possui gerenciamento integral da hierarquia, persistência local, Visão Geral, Pesquisa Geral e organização estrutural entre Matérias e Temas.

## Preparação

```bash
npm install
npm run check
npm run verify:m8
npm run serve
```

Servidor: `http://127.0.0.1:4173`

## Rotas

- `#/` — Visão Geral com indicadores e prioridades;
- `#/materias` — gerenciamento de Matérias;
- `#/materias/:materiaId` — gerenciamento, movimentação e exclusão da hierarquia;
- `#/materias/:materiaId?tema=:temaId&assunto=:assuntoId` — navegação profunda;
- `#/pesquisa?q=:termo&tipo=:tipo` — Pesquisa Geral funcional;
- `#/configuracoes` — Configurações e laboratório temporário do M3;
- `#/recuperacao` — Recuperação.

## M8

Temas podem ser movidos entre Matérias, e Assuntos podem ser movidos entre Temas da mesma ou de outra Matéria. O usuário escolhe a posição exata no destino, enquanto IDs, conteúdo e datas de criação são preservados. Todas as operações essenciais funcionam por teclado, sem exigir arrastar e soltar.

O workspace também permite editar ou excluir a Matéria aberta, e o painel do Assunto oferece edição, movimentação e exclusão seguras.

O roteiro manual está em `tests/manual/m8.md`.

## Limites

Ainda não existem backup visual, importação pela interface, preferências definitivas, operações em lote, desfazer, histórico analítico ou service worker ativo.

## Autor

Vinícius Sidney
