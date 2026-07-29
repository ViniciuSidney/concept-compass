# Preparação para validação do M9 — Configurações, backup e recuperação

## Objetivo

Entregar controle persistente de aparência e proteção completa dos dados locais, permitindo exportar, importar, excluir e recuperar sem substituição silenciosa ou parcial.

## Implementação

### Aparência

- opções Claro, Escuro e Seguir sistema;
- preferência salva separadamente dos dados acadêmicos;
- aplicação antecipada no `index.html` para reduzir exibição do tema incorreto;
- reação à mudança do sistema enquanto a escolha permanece em modo sistema;
- uma única ação Restaurar aparência padrão;
- alerta controlado quando uma preferência anterior é inválida.

### Backup

- formato JSON oficial com aplicação, versão do produto, versão do formato e data de exportação;
- dados acadêmicos e preferências permitidas validados antes da geração;
- nome de arquivo com data local;
- importação limitada a arquivos JSON de até 5 MB;
- mensagens específicas para JSON malformado, aplicação incorreta, formato incompatível, versão incompatível e conteúdo inválido;
- resumo obrigatório antes da substituição;
- possibilidade de exportar os dados atuais sem fechar o resumo;
- substituição conjunta de dados e preferências;
- tentativa de restauração do retrato anterior quando uma gravação falha.

### Dados

- resumo das quantidades atuais;
- duas confirmações destrutivas consecutivas;
- exclusão somente de Matérias, Temas e Assuntos;
- preservação da preferência de aparência;
- retorno à Visão Geral vazia.

### Recuperação

- redirecionamento obrigatório quando os dados locais são inválidos;
- conteúdo bruto preservado em memória;
- download do conteúdo bruto em `.txt`;
- cópia para a área de transferência quando disponível;
- visualização textual segura;
- importação validada de backup;
- saída da recuperação somente após gravação bem-sucedida;
- nenhuma correção parcial ou substituição automática por estrutura vazia.

### Sobre

- aplicação: Organizador de Conteúdos;
- versão atual: v0.1;
- autor: Vinícius Sidney;
- armazenamento: LocalStorage;
- hierarquia: Matéria → Tema → Assunto;
- ausência de afirmação sobre “versão mais recente” e de guia rápido inexistente.

## Evidências automatizadas

A cobertura inclui:

- geração, serialização, nome e resumo do backup;
- migração de dados antigos válidos;
- rejeição de arquivos inválidos e relações quebradas;
- substituição validada e restauração após falha;
- carregamento de preferência inválida com fallback;
- reação do tema ao sistema;
- estrutura oficial da página de Configurações;
- confirmação de importação e dupla confirmação da exclusão geral;
- preservação do conteúdo bruto na tela de recuperação;
- regressão dos marcos anteriores.

## Validação manual

O roteiro está em `tests/manual/m9.md`, com os casos `M9-T01` a `M9-T39`.

## Limites preservados

- nenhum login, conta ou sincronização em nuvem;
- nenhuma importação mesclada: o backup válido substitui o retrato atual após confirmação;
- nenhuma preferência visual além de aparência e modo de visualização já aprovado;
- nenhum histórico de backups dentro da aplicação;
- nenhum service worker ativado;
- responsividade e auditoria final de acessibilidade permanecem no M10.
