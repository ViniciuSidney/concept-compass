# Manual do usuário — Concept Compass

## 1. Finalidade

O Concept Compass organiza o que estudar por meio da hierarquia:

**Matéria → Tema → Assunto**

Ele mantém a estrutura do conteúdo. O **Study Stack** registra o estudo realizado e é a fonte única de progresso, etapas, pendências e atividade.

## 2. Criando a estrutura

1. Abra **Matérias**.
2. Crie uma Matéria, por exemplo `Matemática`.
3. Abra a Matéria e crie um Tema, por exemplo `Probabilidade`.
4. Expanda o Tema e crie Assuntos, por exemplo `Probabilidade condicional`.
5. Se desejar, defina dificuldade, descrição e observações do Assunto.

Renomear ou mover um item não recria seu histórico: a integração usa IDs estáveis.

## 3. Iniciando e continuando um estudo

Cada Assunto possui uma ação contextual para o Study Stack:

- **Iniciar estudo no Study Stack** — ainda não há registro sincronizado;
- **Continuar estudo no Study Stack** — existe estudo em andamento;
- **Ver estudo no Study Stack** — o estudo está consolidado.

A ação abre o Study Stack em uma **nova aba**, mantendo o Concept Compass aberto na aba original.

Ao retornar ao Concept Compass, não é necessário atualizar a página manualmente: a aplicação verifica novamente o resumo do Study Stack quando recupera o foco ou a visibilidade.

## 4. Como o progresso aparece

O progresso exibido pelo Concept Compass vem do Study Stack e usa uma escala objetiva de `0` a `10`.

Também podem aparecer:

- etapa atual: **Base, Prática, Análise, Revisão ou Consolidação**;
- próxima ação recomendada;
- erros pendentes;
- revisões pendentes;
- última atividade;
- avisos do estudo;
- indicação **Estudo consolidado** ao chegar a `10/10`.

O Concept Compass não possui controles para aumentar, diminuir, ajustar, concluir ou reiniciar progresso.

## 5. Visão Geral

A Visão Geral usa exclusivamente dados sincronizados do Study Stack para apresentar:

- progresso geral;
- destaques por Matéria;
- distribuição entre Não iniciado, Em andamento, Consolidado e Arquivado;
- prioridades de estudo;
- estudos recentes.

Se a sincronização estiver indisponível, a aplicação não substitui o valor por dados antigos.

## 6. Pesquisa Geral

A Pesquisa localiza nomes, descrições e observações. Os filtros disponíveis são:

- Tudo;
- Matérias;
- Temas;
- Assuntos.

Nos resultados de Assunto, o estado de estudo pode incluir progresso `x/10`, etapa, pendências e última atividade sincronizada.

Abrir um Tema ou Assunto pela Pesquisa leva ao contexto correto dentro da Matéria.

## 7. Arquivamento

Matéria, Tema e Assunto possuem estado próprio de arquivamento.

Arquivar um item pai não altera o campo `arquivado` dos filhos. Ao restaurar o pai, os estados próprios dos descendentes continuam como estavam.

Enquanto um Assunto estiver efetivamente arquivado — por ele mesmo ou por um ancestral — a ação do Study Stack fica indisponível. O resumo sincronizado é preservado e volta a ser acessível após a restauração.

## 8. Organização estrutural

- use as setas para reordenar itens irmãos;
- use **Mover tema** para trocar a Matéria pai;
- use **Mover assunto** para trocar o Tema pai;
- escolha a posição no destino;
- IDs, relações e ordens são preservados ou normalizados automaticamente.

## 9. Exclusão permanente

Exclusão permanente é diferente de arquivamento.

Ao excluir um Assunto, Tema ou Matéria, o Concept Compass prepara comandos de exclusão para todos os Assuntos envolvidos antes de concluir a remoção local. O Study Stack pode então apagar os dados vinculados aos mesmos `subjectId`.

Se você apenas quer ocultar conteúdo sem perder o vínculo histórico, prefira **Arquivar**.

Antes de exclusões amplas, é recomendável exportar um backup.

## 10. Estados de sincronização

Podem aparecer dois estados especiais:

- **Sincronização pendente** — o resumo não pôde ser lido ou validado;
- **Atualização necessária** — a versão do contrato publicada pelo Study Stack não é compatível.

Nesses casos, o Concept Compass não usa o antigo progresso manual como substituto.

## 11. Backup e compatibilidade

O backup do Concept Compass guarda a estrutura do Concept Compass, não os registros internos do Study Stack.

O schema atual dos dados é o **v3**. Backups antigos válidos dos schemas v1 e v2 continuam importáveis. Durante a migração, os antigos campos de progresso são descartados e não são enviados ao Study Stack.

Para trocar de computador ou perfil:

1. exporte o backup do Concept Compass;
2. preserve separadamente os dados do Study Stack quando necessário;
3. copie os arquivos para o ambiente de destino;
4. importe e confira o resumo antes de confirmar a substituição.

## 12. Aparência

Em **Configurações → Aparência**, escolha:

- Claro;
- Escuro;
- Seguir sistema.

A preferência fica salva no navegador.

## 13. Recuperação

Se o armazenamento do Concept Compass estiver corrompido, a aplicação abre a tela de Recuperação e preserva o texto bruto. Nessa tela é possível baixar ou copiar o conteúdo preservado e importar um backup válido.

A aplicação não substitui silenciosamente dados inválidos por uma estrutura vazia.

## 14. Limites atuais

Não existem contas, sincronização em nuvem, colaboração, anexos, banco de questões, flashcards, cronômetro ou metacognição por data dentro do Concept Compass.

A sincronização com o Study Stack depende de ambos estarem na mesma origem do navegador. Dados de um aplicativo não são automaticamente incluídos no backup do outro.
