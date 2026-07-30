# Preparação para validação do M11 — Estabilização e release v0.1.0

## Estado

**Aprovado manualmente em 30/07/2026.**

O roteiro local do M11 foi executado e aprovado. Não há falhas críticas ou altas abertas, e a versão `0.1.0` está liberada para publicação, testes de fumaça no GitHub Pages e criação da Release oficial.

## Entregas implementadas

- versão técnica `0.1.0` no pacote e na configuração;
- README final orientado ao usuário e à manutenção;
- CHANGELOG e notas da release;
- manual do usuário;
- guia de publicação no GitHub Pages;
- backlog prioritário da v0.2 com Ficha do Assunto e metacognição por data;
- favicon preservado e ícones PNG de 180, 192 e 512 px;
- manifesto final com caminhos relativos;
- `.nojekyll` para publicação estática;
- teste automatizado com 24 Matérias, 240 Temas e 2.880 Assuntos;
- gerador de backup fictício ampliado;
- verificação estrutural do M11;
- roteiro final local e publicado.

## Service worker

Foi avaliado e conscientemente não ativado. Sem um fluxo de aviso e atualização de cache já validado, o cache offline poderia esconder versões novas. A publicação permanece estática, e nenhum dado acadêmico é armazenado fora do LocalStorage.

## Compatibilidade

O identificador funcional de backup continua `v0.1`. Isso preserva backups válidos gerados durante o desenvolvimento da versão. Dados de schema v1 continuam migrados para o schema de pontos atual antes da validação.

## Portão automatizado

```bash
npm install
npm run release:check
```

O comando deve confirmar:

- testes completos;
- lint e formatação;
- verificações do M2 ao M11;
- versão e metadados consistentes;
- ícones e manifesto presentes;
- ausência de service worker registrado;
- zero dependências de execução;
- documentação de release presente.

## Resultado da validação local

- regressão visual e funcional final aprovada;
- massa ampliada verificada;
- console inspecionado sem falhas críticas ou altas;
- `148` testes automatizados aprovados;
- lint aprovado;
- versão `0.1.0` confirmada.

## Pendências de publicação

- publicar ou atualizar o GitHub Pages;
- executar os testes de fumaça na URL pública;
- criar a GitHub Release `v0.1.0` após a fumaça publicada.
