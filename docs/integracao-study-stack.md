# Integração Concept Compass → Study Stack

## Objetivo

Permitir que um Assunto do Concept Compass seja aberto no Study Stack sem recriação manual de contexto e com retorno ao mesmo ponto de origem.

## Pontos de entrada

- menu de ações da linha do Assunto;
- painel de detalhes do Assunto.

Ambas as ações abrem o Study Stack na mesma aba.

## Destino

```text
https://viniciusidney.github.io/study-stack/?subjectContext=...#/overview
```

O parâmetro `subjectContext` contém JSON codificado pela própria URL.

## Contrato 1.0.0

```json
{
  "contractVersion": "1.0.0",
  "sentAt": "data e hora ISO 8601",
  "sourceApp": "concept_compass",
  "subject": {
    "matterId": "identificador da matéria",
    "matterName": "nome da matéria",
    "themeId": "identificador do tema",
    "themeName": "nome do tema",
    "subjectId": "identificador do assunto",
    "subjectName": "nome do assunto"
  },
  "sourceArchived": false,
  "returnUrl": "URL profunda do assunto no Concept Compass",
  "navigationContext": {
    "route": "materia",
    "materiaId": "identificador da matéria",
    "temaId": "identificador do tema",
    "assuntoId": "identificador do assunto"
  }
}
```

## Retorno profundo

O retorno usa a rota:

```text
#/materias/:materiaId?tema=:temaId&assunto=:assuntoId
```

Essa rota expande o Tema, destaca o Assunto e abre novamente seu painel de detalhes.

## Desenvolvimento local

Use o servidor oficial do projeto:

```bash
npm run serve
```

O endereço `http://127.0.0.1:4173` é aceito pelo Study Stack como origem de retorno durante os testes locais.

## Teste manual mínimo

1. abra uma Matéria com pelo menos um Tema e um Assunto;
2. abra o painel de detalhes do Assunto;
3. confirme a presença da ação **Abrir no Study Stack**;
4. acione o botão e confira Matéria, Tema e Assunto no Study Stack;
5. use **Voltar ao Concept Compass**;
6. confirme que o mesmo Assunto foi reaberto;
7. repita o fluxo usando a ação disponível no menu da linha do Assunto.
