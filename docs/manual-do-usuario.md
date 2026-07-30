# Manual do usuário — Concept Compass v0.1.1

## 1. Finalidade

O Concept Compass serve para mapear o que estudar e acompanhar o avanço por meio da hierarquia:

**Matéria → Tema → Assunto**

Ele não substitui agenda, cronômetro, banco de questões ou flashcards. Seu papel é manter a estrutura do conteúdo e o retrato atual do progresso.

## 2. Começando

1. Abra **Matérias**.
2. Crie uma Matéria, por exemplo `Matemática`.
3. Abra a Matéria e crie um Tema, por exemplo `Probabilidade`.
4. Expanda o Tema e crie Assuntos, por exemplo `Probabilidade condicional`.
5. Use os controles do Assunto para registrar o avanço.

## 3. Pontos de progresso

Cada Assunto começa em `0/5`.

- **Retirar ponto** diminui os pontos atuais;
- **Adicionar ponto** aumenta os pontos atuais;
- **Aumentar meta** aumenta o esforço total estimado;
- **Ajustar progresso** permite editar pontos, meta e reforço;
- **Concluir meta** iguala os pontos atuais à meta;
- **Reiniciar progresso** volta os pontos atuais para zero.

A porcentagem é calculada por `pontos atuais ÷ meta total`.

Temas e Matérias somam os pontos de todos os Assuntos relacionados. Por isso, um Assunto com meta maior possui peso maior no resultado agregado.

## 4. Precisa de reforço

A marcação **Precisa de reforço** é independente dos pontos. Um Assunto pode estar concluído e ainda precisar de revisão.

## 5. Organização estrutural

- use as setas para reordenar itens irmãos;
- use **Mover tema** para trocar a Matéria pai;
- use **Mover assunto** para trocar o Tema pai;
- escolha a posição no destino;
- as relações e ordens são normalizadas automaticamente.

## 6. Pesquisa Geral

A Pesquisa localiza nomes, descrições e observações. Os filtros disponíveis são:

- Tudo;
- Matérias;
- Temas;
- Assuntos.

Abrir um Tema ou Assunto pela Pesquisa leva ao contexto correto dentro da Matéria.

## 7. Aparência

Em **Configurações → Aparência**, escolha:

- Claro;
- Escuro;
- Seguir sistema.

A preferência fica salva no navegador.

## 8. Backup e troca de computador

Os dados não saem automaticamente do navegador atual.

Para transferi-los:

1. exporte um backup no computador de origem;
2. copie o arquivo JSON;
3. abra a aplicação no computador de destino;
4. importe o backup;
5. confira o resumo e confirme a substituição.

## 9. Exclusão geral

A exclusão geral exige:

1. revisão das quantidades;
2. avanço para a confirmação final;
3. digitação exata de `EXCLUIR`;
4. clique em **Apagar definitivamente**.

A aparência é preservada, mas Matérias, Temas e Assuntos são removidos.

## 10. Recuperação

Se o armazenamento estiver corrompido, a aplicação abre a tela de Recuperação e preserva o texto bruto. Nessa tela é possível:

- baixar o conteúdo preservado;
- copiar o conteúdo;
- importar um backup válido.

A aplicação não substitui silenciosamente dados inválidos por uma estrutura vazia.

## 11. Limites da v0.1

Não existem contas, sincronização em nuvem, colaboração, anexos, questões, flashcards, cronômetro, histórico de progresso ou metacognição por data.
