# Possibilidades para a v0.3 — Conteúdo e metacognição

## Estado

Este documento registra possibilidades para o próximo ciclo. Ele não constitui escopo aprovado nem compromisso automático de implementação após a v0.2.0.

## Objetivo possível

Evoluir o Concept Compass de mapa estrutural para um registro mais rico do conteúdo e da reflexão do aluno, sem reassumir responsabilidades que pertencem ao Study Stack.

## 1. Ficha do Assunto

Conteúdo estável, sem divisão por data:

- definição;
- ideia central;
- propriedades ou regras;
- exemplos;
- erros comuns.

A ficha responderia: **o que preciso saber sobre este Assunto?**

## 2. Registros metacognitivos

Registros independentes organizados por data:

- o que aprendi;
- o que errei;
- onde preciso reforçar;
- dúvidas;
- próximo passo;
- percepção opcional: Confuso, Inseguro, Razoável ou Confiante.

A listagem mostraria somente datas que possuam conteúdo e permitiria abrir cada data como seção independente.

## 3. Relação com o Study Stack

Salvar ficha ou reflexão **não alteraria progresso automaticamente**.

O Study Stack permanece a fonte única de:

- progresso `0–10`;
- etapas;
- pendências;
- atividade;
- consolidação.

Se uma versão futura quiser usar uma reflexão como evidência de estudo, isso deverá ocorrer por um contrato explícito entre os aplicativos. O Concept Compass não deve recriar botões locais para adicionar pontos, concluir meta ou reiniciar progresso.

## 4. Impactos técnicos previstos

- evolução do schema a partir do v3;
- migração segura dos dados atuais;
- atualização de backup e recuperação;
- novos formulários e painéis do Assunto;
- pesquisa em ficha e registros;
- preservação dos IDs estáveis usados pela integração;
- manutenção da fronteira de responsabilidade com o Study Stack;
- responsividade e acessibilidade;
- testes unitários, integração e aceite.

## 5. Marcos possíveis

- v0.3-M0 — definição funcional e documental;
- v0.3-M1 — modelo de dados e migração;
- v0.3-M2 — Ficha do Assunto;
- v0.3-M3 — metacognição por data;
- v0.3-M4 — pesquisa e navegação;
- v0.3-M5 — estabilização e publicação.
