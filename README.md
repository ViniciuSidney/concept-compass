# Organizador de Conteúdos

Aplicação web local para organizar estudos em **Matéria → Tema → Assunto**.

## Situação atual

Esta pasta implementa o **M8.1 — Sistema de Pontos de Progresso**. A hierarquia e as movimentações do M8 permanecem completas, enquanto o acompanhamento dos Assuntos agora utiliza pontos flexíveis em vez de estados escolhidos manualmente.

## Preparação

```bash
npm install
npm run check
npm run verify:m8-1
npm run serve
```

Servidor: `http://127.0.0.1:4173`

## Rotas

- `#/` — Visão Geral com pontos, prioridades e estudos recentes;
- `#/materias` — gerenciamento de Matérias;
- `#/materias/:materiaId` — gerenciamento da hierarquia e do progresso;
- `#/materias/:materiaId?tema=:temaId&assunto=:assuntoId` — navegação profunda;
- `#/pesquisa?q=:termo&tipo=:tipo` — Pesquisa Geral funcional;
- `#/configuracoes` — Configurações e laboratório temporário do M3;
- `#/recuperacao` — Recuperação.

## M8.1

Cada Assunto possui:

- pontos atuais, inicialmente `0`;
- meta total, inicialmente `5` e ajustável de `1` a `20`;
- marcação independente **Precisa de reforço**;
- situação derivada automaticamente: **Não iniciado**, **Em andamento** ou **Meta concluída**.

O usuário pode retirar ou adicionar um ponto, aumentar a meta, ajustar os valores diretamente, concluir a meta, reiniciar o progresso com confirmação e desfazer a última alteração pela mensagem de sucesso.

O progresso de Tema, Matéria e Visão Geral é calculado por:

```text
soma dos pontos atuais ÷ soma das metas totais
```

Dados do esquema anterior são migrados automaticamente para pontos, preservando IDs, conteúdo, dificuldade, observações, datas e hierarquia.

O roteiro manual está em `tests/manual/m8-1.md`.

## Limites

Ainda não existem backup visual, importação pela interface, preferências definitivas, histórico de cada ponto, gráficos temporais, operações em lote ou service worker ativo.

## Autor

Vinícius Sidney
