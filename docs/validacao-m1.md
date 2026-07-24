# Preparação para validação do M1 — Fundação técnica e AppShell mínimo

## Escopo concluído

- configuração central da aplicação;
- hierarquia inicial de erros;
- store em memória com inscrição e prevenção de mutação externa;
- roteamento por fragmento de URL;
- extração de parâmetros de rota e consulta;
- AppShell com navegação lateral;
- menu móvel sobreposto;
- região global de notificações;
- páginas provisórias para todas as rotas oficiais;
- atualização do título da aba;
- identificação da rota ativa com `aria-current`;
- preservação dos botões voltar e avançar pelo hash routing;
- estado de Conteúdo Não Encontrado;
- testes unitários e de integração do núcleo.

## Rotas disponíveis

- `#/`;
- `#/materias`;
- `#/materias/:materiaId`;
- `#/pesquisa?q=:termo`;
- `#/configuracoes`;
- `#/recuperacao`;
- rota desconhecida encaminhada para o estado interno de não encontrado.

## Limites mantidos

O M1 não implementa:

- CRUD de Matérias, Temas ou Assuntos;
- persistência acadêmica;
- cálculo de progresso;
- pesquisa real;
- filtros;
- backups;
- temas explícitos Claro e Escuro;
- service worker ativo.

## Critério de conclusão

Todas as rotas oficiais devem abrir no mesmo AppShell, sem recarregamento completo, com navegação por hash, título correto e ausência de erros no console.

## Verificações automatizadas executadas

- `npm test`: 10 testes aprovados;
- `npm run lint`: aprovado;
- `npm run format:check`: aprovado;
- arquivos principais carregados pelo servidor HTTP local;
- nenhuma dependência de execução adicionada.

A conclusão oficial do M1 depende da execução do roteiro manual em `tests/manual/m1.md`.
