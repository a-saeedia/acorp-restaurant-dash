/**
 * Tiny static server for the production build.
 *
 * `vite preview` is not used for demos because it auto-increments its port when
 * the default is taken, which makes "open localhost:4173" ambiguous on this
 * machine. This server binds exactly the port it is given and refuses to start
 * otherwise.
 *
 *   node scripts/serve-dist.mjs 4318
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.argv[2] ?? 4318);
const root = resolve(process.cwd(), 'dist');
const indexPath = join(root, 'index.html');

if (!existsSync(indexPath)) {
  console.error('dist/index.html not found — run `pnpm build` first.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://127.0.0.1:${port}`);
  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
  let filePath = join(root, requested);

  if (!filePath.startsWith(root)) {
    response.writeHead(403).end('forbidden');
    return;
  }

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) filePath = indexPath;

  response.writeHead(200, {
    'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`A-Corp dashboard: http://127.0.0.1:${port}/`);
});

server.on('error', (error) => {
  console.error(`cannot bind 127.0.0.1:${port} — ${error.code}`);
  process.exit(1);
});
