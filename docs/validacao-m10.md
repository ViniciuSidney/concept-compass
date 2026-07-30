# Preparação para validação do M10 — Responsividade, acessibilidade e tema escuro

## Objetivo

Revisar a aplicação completa em diferentes larguras, preferências visuais e formas de interação, sem criar implementações paralelas nem alterar o escopo funcional já aprovado.

## Implementação

### Responsividade

- AppShell com navegação fixa em desktop e diálogo sobreposto em tablet/mobile;
- adaptação em desktop amplo, desktop comum, tablet, `390 px` e largura mínima de `320 px`;
- suporte a viewport dinâmica e áreas seguras do dispositivo;
- grades de Matérias em 3, 2 e 1 coluna;
- cabeçalhos, filtros e ações empilhados conforme o espaço disponível;
- Temas e Assuntos reorganizados sem rolagem horizontal geral;
- painéis laterais ocupando a largura disponível em mobile;
- modais extensos em tela cheia em larguras ou alturas reduzidas;
- cabeçalhos e rodapés de modal preservados enquanto o corpo rola;
- cards e textos longos preparados para quebra segura.

### Acessibilidade

- navegação móvel com foco preso, fechamento por `Esc` e retorno de foco;
- conteúdo ao fundo marcado como inerte durante sidebar móvel, modal ou painel;
- descrições acessíveis em painéis;
- menus de ações operáveis por setas, `Home`, `End`, `Esc`, `Tab` e `Shift+Tab`;
- listas e grupos de reordenação com semântica explícita;
- skip link e foco do conteúdo principal preservados;
- controles com alvos mínimos de toque;
- foco visível reforçado;
- campos, erros e mensagens mantendo rótulos e regiões de anúncio;
- suporte a movimento reduzido e cores forçadas;
- nenhuma operação essencial depende de arrastar e soltar.

### Tema escuro

- aplicação baseada no tema efetivamente resolvido, incluindo Seguir sistema;
- tokens semânticos para categorias, estados e feedback;
- superfícies escuras consistentes em páginas, cards, menus, modais, painéis e toasts;
- bordas semânticas no lugar de sombras excessivas;
- campos nativos, opções e placeholders adaptados;
- contraste reforçado para textos, badges, ações destrutivas, foco e progresso;
- aplicação antecipada da aparência preservada no carregamento inicial.

## Evidências automatizadas

A cobertura inclui:

- isolamento do conteúdo ao abrir sidebar móvel, modal e painel;
- restauração da interação após fechamento;
- foco inicial e fechamento da navegação móvel por `Esc`;
- navegação dos menus por setas e retorno ao gatilho;
- presença dos breakpoints, áreas seguras e variantes de sobreposição;
- presença dos tokens semânticos e regras do tema escuro;
- regressão integral dos marcos M2 a M9;
- ausência de dependências de execução.

## Validação manual

O roteiro está em `tests/manual/m10.md`, com os casos `M10-T01` a `M10-T50`.

A conferência visual e interativa deve ser realizada no navegador local porque o navegador headless do ambiente de geração bloqueou a navegação até mesmo para endereços locais. As verificações automatizadas, estruturais e pelo servidor não substituem essa etapa manual.

## Limites preservados

- nenhuma nova funcionalidade acadêmica;
- nenhuma segunda versão da interface para mobile;
- nenhum leitor de tela incorporado;
- nenhuma biblioteca visual ou dependência de execução;
- nenhum service worker ativado;
- publicação, cache, desempenho ampliado e fechamento da v0.1 permanecem no M11.

## Resultado manual

O usuário concluiu o roteiro do M10 e informou aprovação integral antes do início do M11. O marco está oficialmente concluído.
