# Organizador de Conteúdos

Aplicação web local para organizar estudos pela hierarquia:

```text
Matéria
└── Tema
    └── Assunto
```

## Situação atual

Esta pasta implementa o **M2 — Domínio, validação e persistência** da v0.1 e está pronta para validação manual.

A aplicação mantém o AppShell navegável do M1 e agora possui uma camada independente do DOM para criar, validar, transformar, calcular e persistir a estrutura acadêmica com segurança. O CRUD visual ainda não foi iniciado.

## Onde manter a pasta

Mantenha o projeto em uma pasta local que não seja sincronizada pelo Google Drive, OneDrive ou serviço semelhante. Exemplo no Windows:

```text
C:\Projetos\organizador-de-conteudos
```

## Requisitos

- Node.js LTS;
- npm;
- Git;
- navegador moderno.

## Preparação

```bash
npm install
```

## Comandos

```bash
npm run serve
npm run verify:m2
npm test
npm run lint
npm run format
npm run format:check
npm run check
```

O servidor local usa, por padrão:

```text
http://127.0.0.1:4173
```

## Base do M1 preservada

```text
#/                              Visão Geral
#/materias                      Matérias
#/materias/:materiaId           Matéria específica
#/pesquisa?q=:termo             Pesquisa Geral
#/configuracoes                 Configurações
#/recuperacao                   Recuperação de Dados
```

Rotas desconhecidas exibem o estado de Conteúdo Não Encontrado sem derrubar a aplicação.

## Estrutura implementada no M2

- `src/domain/constants.js`: estados, dificuldades, pesos, cores, limites e versões;
- `src/domain/validators`: validação de entidades, preferências e estrutura completa;
- `src/domain/selectors`: relações hierárquicas básicas;
- `src/domain/services`: CRUD puro, progresso, ordenação, movimentação e cascatas;
- `src/data/storage`: adaptadores de `localStorage` e memória;
- `src/data/migrations`: controle inicial do esquema 1;
- `src/data/repositories`: leitura e gravação segura do retrato completo;
- `src/utils`: UUID, datas locais, texto, objetos e clonagem;
- `tests`: 48 testes unitários e de integração, além dos roteiros manuais.

## Proteções já cobertas

- nomes obrigatórios e limites de campos;
- estados, dificuldades e cores permitidos;
- data de último estudo não futura;
- IDs duplicados;
- temas e assuntos órfãos;
- ordem contínua entre itens irmãos;
- progresso calculado sem persistência derivada;
- movimentações e exclusões em cascata;
- JSON corrompido;
- esquema futuro incompatível;
- falha e limite do armazenamento;
- preservação do conteúdo bruto inválido;
- preservação do retrato anterior após falha de gravação.

## Limites do M2

Ainda não existem:

- formulários acadêmicos;
- cards definitivos;
- CRUD visual;
- conexão do AppShell ao repositório;
- pesquisa funcional;
- filtros;
- indicadores definitivos;
- backup em arquivo e importação pela interface;
- service worker ativo.

## Validação

O roteiro manual está em:

```text
tests/manual/m2.md
```

Execute primeiro:

```bash
npm run check
npm run verify:m2
```

## Branches

- `main`: base estável;
- `dev`: integração da v0.1;
- `feature/<objetivo>`: funcionalidade isolada;
- `fix/<problema>`: correção isolada.

A pasta é entregue na branch `dev`.

## Próximo marco

Após validar o M2, iniciar o **M3 — Sistema visual e componentes globais**. Nenhum CRUD visual deverá salvar dados antes que o fluxo entre caso de uso, repositório e store seja integrado no marco correspondente.

## Autor

Vinícius Sidney
