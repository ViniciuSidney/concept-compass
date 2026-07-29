# Organizador de Conteúdos

Aplicação web local para organizar estudos em **Matéria → Tema → Assunto**.

## Situação atual

Esta pasta implementa o **M9 — Configurações, backup e recuperação**. Os marcos M0 a M8.1.1 foram validados e permanecem preservados.

## Preparação

```bash
npm install
npm run check
npm run verify:m9
npm run serve
```

Servidor: `http://127.0.0.1:4173`

## Rotas

- `#/` — Visão Geral com pontos, prioridades e estudos recentes;
- `#/materias` — gerenciamento de Matérias;
- `#/materias/:materiaId` — gerenciamento da hierarquia e do progresso;
- `#/materias/:materiaId?tema=:temaId&assunto=:assuntoId` — navegação profunda;
- `#/pesquisa?q=:termo&tipo=:tipo` — Pesquisa Geral funcional;
- `#/configuracoes` — aparência, backup, dados e informações da aplicação;
- `#/recuperacao` — preservação e restauração quando os dados locais são inválidos.

## M9

### Aparência

- Claro, Escuro e Seguir sistema;
- preferência persistida no navegador;
- reação à mudança do sistema;
- aplicação antecipada para reduzir flashes de tema incorreto;
- restauração única ao padrão Seguir sistema.

### Backup

- exportação JSON com metadados, dados e preferências permitidas;
- arquivo `organizador-conteudos-backup-AAAA-MM-DD.json`;
- validação completa antes da importação;
- resumo e confirmação antes da substituição;
- opção de exportar os dados atuais durante o fluxo;
- substituição conjunta com preservação do retrato anterior em caso de falha.

### Dados e recuperação

- exclusão geral confirmada de Matérias, Temas e Assuntos, preservando aparência;
- detecção de conteúdo local inválido;
- redirecionamento seguro para Recuperação;
- download, cópia e visualização do texto bruto preservado;
- restauração por backup válido sem correção silenciosa.

O roteiro manual está em `tests/manual/m9.md`.

## Sistema de progresso

Cada Assunto possui pontos atuais, meta total de `1` a `20`, marcação independente de reforço e situação derivada. Tema, Matéria e Visão Geral usam a soma dos pontos atuais dividida pela soma das metas.

## Limites

Ainda faltam a auditoria completa de responsividade, acessibilidade e tema escuro do M10, além da estabilização, publicação e fechamento da v0.1 no M11. Não existem contas, nuvem, colaboração, histórico de backups ou service worker ativo.

## Autor

Vinícius Sidney
