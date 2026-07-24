import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const port = Number.parseInt(process.env.PORT ?? '4173', 10);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
]);

function resolveRequestPath(requestUrl = '/') {
  const pathname = decodeURIComponent(new URL(requestUrl, `http://localhost:${port}`).pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const normalizedPath = normalize(relativePath);
  const absolutePath = resolve(join(root, normalizedPath));

  if (absolutePath !== root && !absolutePath.startsWith(`${root}${sep}`)) {
    return null;
  }

  return absolutePath;
}

const server = createServer((request, response) => {
  const filePath = resolveRequestPath(request.url);

  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Arquivo não encontrado.');
    return;
  }

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.warn(`Servidor local: http://127.0.0.1:${port}`);
});
