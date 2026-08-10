# Preparação para validação do M8.1 — Sistema de Pontos de Progresso

> **Documento histórico.** Este arquivo registra o M8.1 original, quando o Concept Compass ainda possuía pontos manuais. Esse mecanismo foi removido. A arquitetura atual usa schema v3 e o Study Stack como fonte única do progresso. Consulte `docs/integracao-study-stack.md` para as regras vigentes.

## Objetivo

Substituir os estados de progresso escolhidos manualmente por um acompanhamento gradual, flexível e consistente em toda a hierarquia, antes da implementação de backup e importação do M9.

## Concluído tecnicamente

- esquema de dados elevado da versão 1 para a versão 2;
- migração automática dos cinco estados antigos para pontos;
- preservação de IDs, textos, dificuldade, observações, datas, ordem e relações;
- `pontosProgresso` com mínimo zero;
- `metaPontosProgresso` com padrão cinco, mínimo um e máximo vinte;
- `precisaReforco` independente da pontuação;
- situações derivadas automaticamente: Não iniciado, Em andamento e Meta concluída;
- cálculo de Tema, Matéria e aplicação pela soma de pontos e metas;
- barra segmentada com valores reais até dez segmentos e representação normalizada acima disso;
- controles rápidos para retirar ponto, adicionar ponto e aumentar meta;
- ajuste direto dos pontos, meta e reforço;
- ações para concluir meta e reiniciar progresso;
- confirmação antes do reinício;
- ação Desfazer após alterações de progresso;
- limites e controles desabilitados nos extremos;
- atualização da criação e edição de Assuntos;
- atualização das linhas, painel de detalhes, cards de Matéria, Visão Geral e Pesquisa Geral;
- prioridades adaptadas para reforço, andamento e dificuldade;
- preservação das movimentações e exclusões do M8;
- testes automatizados, roteiro manual e verificação integrada próprios.

## Conversão automática

| Estado anterior    | Conversão               |
| ------------------ | ----------------------- |
| Não iniciado       | `0/5`                   |
| Em estudo          | `1/5`                   |
| Estudado           | `3/5`                   |
| Precisa de reforço | `3/5` e reforço ativado |
| Consolidado        | `5/5`                   |

A propriedade antiga `estado` é removida depois da migração.

## Regras consolidadas

- `0 ≤ pontosProgresso ≤ metaPontosProgresso`;
- `1 ≤ metaPontosProgresso ≤ 20`;
- aumentar a meta preserva os pontos atuais e pode reduzir a porcentagem;
- reduzir a meta abaixo dos pontos atuais é rejeitado até que os dois valores sejam corrigidos explicitamente;
- concluir define os pontos atuais como iguais à meta;
- reiniciar volta os pontos atuais para zero e preserva meta e reforço;
- sem Assuntos, o progresso continua ausente, e não `0/0`;
- porcentagens são arredondadas somente na apresentação;
- assuntos maiores possuem peso proporcionalmente maior nos agregados;
- completar a meta não remove automaticamente a marcação de reforço;
- nenhuma situação derivada é armazenada no Assunto.

## Limites preservados

O M8.1 não cria histórico de cada clique, gráficos de evolução, pontos nomeados, ciclos de revisão, integração automática com outras aplicações ou metas recorrentes. Essas possibilidades ficam para versões posteriores após uso real.

## Validação manual

O roteiro está em `tests/manual/m8-1.md`, com os casos `M8.1-T01` a `M8.1-T30`.

## Aprovação manual

Em 29/07/2026, os casos `M8.1-T01` a `M8.1-T30` foram executados e aprovados pelo usuário. O M8.1 foi oficialmente concluído antes da abertura do refinamento visual M8.1.1.
