# Validação do M0

Data: 24/07/2026

## Verificações aprovadas neste pacote

- estrutura inicial criada;
- repositório Git inicializado;
- branches `main` e `dev` criadas;
- três commits iniciais separados por responsabilidade;
- branch ativa: `dev`;
- dois testes com `node:test` aprovados;
- sintaxe de todos os arquivos JavaScript verificada com `node --check`;
- arquivos JSON interpretados sem erro;
- servidor HTTP local iniciado;
- `index.html` e `src/main.js` servidos com sucesso;
- zero dependências de execução;
- nenhum dado acadêmico real incluído;
- service worker não registrado.

## Verificação pendente no computador local

O registro npm do ambiente usado para gerar o pacote respondeu com erro temporário 503. Por isso, as dependências de desenvolvimento não foram baixadas e o `package-lock.json` não foi gerado aqui.

As versões estão fixadas no `package.json`. Após extrair a pasta, execute:

```bash
npm install
npm run check
```

Depois de confirmar os comandos, registre o `package-lock.json` no repositório.

## Resultado

A estrutura está pronta para a validação local final do M0. O M1 somente deve começar após `npm install` e `npm run check` passarem no computador de desenvolvimento.
