# Organizador de Conteúdos

Aplicação web local para construir e acompanhar um mapa de estudos em **Matéria → Tema → Assunto**.

A versão `0.1.0` organiza a hierarquia acadêmica, acompanha pontos de progresso, permite pesquisa e movimentações estruturais e protege os dados por backup e recuperação.

## Estado da versão

O código está preparado como **candidato de release da v0.1.0**. A publicação definitiva depende da execução do roteiro manual do M11 e dos testes de fumaça no GitHub Pages.

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

## Executar localmente

Requisitos: Node.js `20` ou superior e npm.

```bash
npm install
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

Backups válidos gerados durante o desenvolvimento da v0.1 continuam aceitos e passam pelas migrações oficiais antes da restauração.

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
npm run verify:all              # verificações estruturais do M2 ao M11
npm run release:check           # portão técnico completo da release
npm run generate:large-fixture  # gera massa fictícia em reports/
npm run serve                   # servidor local
```

## Publicação

O projeto usa apenas arquivos estáticos e caminhos relativos. A publicação recomendada é pelo branch `main`, pasta raiz, conforme `docs/publicacao-github-pages.md`.

O service worker **não está ativo na v0.1.0**. A aplicação pode ser instalada quando o navegador oferecer essa opção, mas o funcionamento offline completo foi adiado para evitar que um cache antigo esconda novas versões sem um fluxo de atualização validado.

## Documentação

- `docs/manual-do-usuario.md` — uso da aplicação;
- `docs/publicacao-github-pages.md` — publicação e testes de produção;
- `docs/release-v0.1.0.md` — notas e checklist da release;
- `docs/backlog-v0.2.md` — próxima evolução planejada;
- `tests/manual/README.md` — índice dos roteiros de teste;
- `tests/manual/m11.md` — aceite final da v0.1.0.

## Próxima versão

A v0.2 está planejada para adicionar uma **Ficha do Assunto** e **registros metacognitivos por data**, sem misturá-los com o progresso quantitativo. Consulte `docs/backlog-v0.2.md`.

## Autor

Vinícius Sidney
