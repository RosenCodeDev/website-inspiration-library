#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const projectRoot = resolve(process.argv[2] ?? process.cwd());
const port = Number(process.argv[3] ?? 4317);
const host = '127.0.0.1';
const workbenchRoot = resolve(projectRoot, '.inspiration');

if (!existsSync(resolve(workbenchRoot, 'workbench', 'index.html'))) {
  console.error('Design Workbench is missing. Run project-state.mjs init first.');
  process.exit(1);
}

const contentType = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${host}`).pathname);
  const relativePath = pathname === '/' ? 'workbench/index.html' : pathname.replace(/^\/+/, '');
  const filePath = resolve(workbenchRoot, relativePath);
  if (!(filePath === workbenchRoot || filePath.startsWith(`${workbenchRoot}${sep}`)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': contentType[extname(filePath).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => console.log(`Design Workbench: http://${host}:${port}/`));
