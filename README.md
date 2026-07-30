# Concept Compass

**Mapeie, organize e acompanhe seu conhecimento.**

Aplicação web local para construir e acompanhar um mapa de estudos em **Matéria → Tema → Assunto**.

A versão `0.1.1` adota a identidade **Concept Compass** sem alterar os dados, as rotas ou a estrutura funcional consolidada na v0.1.0.

## Estado da versão

A v0.1.1 é uma atualização de identidade e compatibilidade. Ela preserva os dados já armazenados pelo Organizador de Conteúdos e continua aceitando backups gerados com a marca anterior.

## Funcionalidades

- criação, edição, exclusão e reordenação de Matérias, Temas e Assuntos;
- movimentação de Temas entre Matérias e de Assuntos entre Temas;
- pontos de progresso flexíveis com meta de `1` a `20`;
- marcação independente **Precisa de reforço**;
- cálculo agregado de progresso por Tema, Matéria e aplicação;
- Visão Geral com indicadores, prioridades e estudos recentes;
- Pesquisa Geral com filtros para Matérias, Temas e Assuntos;
- aparência Claro, Escuro ou Seguir sistema;
- exportação, importação, exclusão protegida e recuperação de dados;
- funcionamento responsivo e acessível por teclado;
- armazenamento local, sem conta, servidor ou envio de dados acadêmicos.

## Compatibilidade da renomeação

A mudança para **Concept Compass** não altera:

- as chaves `organizador-conteudos:*` do LocalStorage;
- a estrutura ou os identificadores dos dados;
- os schemas de dados e preferências;
- as rotas por fragmento;
- o nome técnico do repositório e do pacote;
- a URL atual do GitHub Pages.

Novos backups usam a marca e o prefixo `concept-compass-backup`. Backups antigos identificados como **Organizador de Conteúdos** continuam aceitos e são normalizados durante a importação.

## Executar localmente

Requisitos: Node.js `20` ou superior e npm.

```bash
npm ci
npm run release:check
npm run serve
```

Abra `http://127.0.0.1:4173`.

## Dados e segurança

Os dados ficam no `LocalStorage` do navegador. Eles não acompanham automaticamente outro navegador, perfil ou computador.

Antes de trocar de dispositivo, limpar dados do navegador ou testar operações destrutivas:

1. abra **Configurações**;
2. use **Exportar backup**;
3. guarde o arquivo JSON em local seguro;
4. importe-o no outro ambiente.

## Rotas

- `#/` — Visão Geral;
- `#/materias` — Matérias;
- `#/materias/:materiaId` — workspace da Matéria;
- `#/pesquisa?q=:termo&tipo=:tipo` — Pesquisa Geral;
- `#/configuracoes` — aparência, backup, dados e Sobre;
- `#/recuperacao` — recuperação de armazenamento inválido.

## Comandos

```bash
npm run test                    # testes automatizados
npm run lint                    # análise estática
npm run format:check            # conferência de formatação
npm run check                   # testes + lint + formatação
npm run verify:all              # verificações estruturais e da identidade atual
npm run release:check           # portão técnico completo da release
npm run generate:large-fixture  # gera massa fictícia em reports/
npm run serve                   # servidor local
```

## Publicação

O projeto usa apenas arquivos estáticos e caminhos relativos. A publicação recomendada é pelo branch `main`, pasta raiz, conforme `docs/publicacao-github-pages.md`.

O service worker continua inativo na v0.1.1 para evitar que cache antigo esconda atualizações sem um fluxo visual de renovação validado.

## Documentação

- `docs/manual-do-usuario.md` — uso da aplicação;
- `docs/publicacao-github-pages.md` — publicação e testes de produção;
- `docs/release-v0.1.1.md` — notas e checklist da atualização;
- `docs/validacao-v0.1.1.md` — estado da validação;
- `docs/backlog-v0.2.md` — próxima evolução planejada;
- `tests/manual/v0.1.1.md` — roteiro manual da renomeação.

## Próxima versão

A v0.2 está planejada para adicionar uma **Ficha do Assunto** e **registros metacognitivos por data**, sem misturá-los com o progresso quantitativo.

## Autor

Vinícius Sidney
