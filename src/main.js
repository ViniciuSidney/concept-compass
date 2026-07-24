import { createApp } from './core/app.js';

try {
  const app = createApp();
  app.start();
} catch (error) {
  const root = document.querySelector('#app');

  console.error('Não foi possível iniciar a aplicação.', error);

  if (root) {
    const alert = document.createElement('div');
    const title = document.createElement('h1');
    const message = document.createElement('p');

    alert.className = 'fatal-error';
    alert.setAttribute('role', 'alert');
    title.textContent = 'Não foi possível iniciar a aplicação';
    message.textContent = 'Recarregue a página. Se o problema continuar, consulte o console.';
    alert.append(title, message);
    root.replaceChildren(alert);
  }
}
