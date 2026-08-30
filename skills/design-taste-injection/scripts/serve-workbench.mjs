#!/usr/bin/env node
import { createReadStream, existsSync, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertContainedPath, canonicalPath } from './path-safety.mjs';

const host = '127.0.0.1';
const contentType = {
  '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8',
};
const sendText = (response, status, message) => {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(message);
};
const parseRange = (value, size) => {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value ?? '');
  if (!match) return null;
  let start = match[1] ? Number(match[1]) : null;
  let end = match[2] ? Number(match[2]) : null;
  if (start === null && end !== null) { start = Math.max(0, size - end); end = size - 1; }
  else { start ??= 0; end ??= size - 1; }
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
};

const createWorkbenchServer = (projectRoot) => {
  const canonicalProject = canonicalPath(projectRoot);
  const workbenchRoot = assertContainedPath(resolve(canonicalProject, '.inspiration'), canonicalProject);
  if (!existsSync(resolve(workbenchRoot, 'workbench', 'index.html'))) throw new Error('Design Workbench is missing. Run project-state.mjs init first.');
  if (!existsSync(resolve(workbenchRoot, 'Design Review.html'))) throw new Error('Design Review is missing. Run project-state.mjs init first.');
  const server = createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method ?? 'GET')) { sendText(response, 405, 'Method not allowed'); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${host}`).pathname); }
    catch { sendText(response, 400, 'Malformed request path'); return; }
    const relativePath = pathname === '/' ? 'workbench/index.html' : pathname.replace(/^\/+/, '');
    let filePath;
    try { filePath = assertContainedPath(resolve(workbenchRoot, relativePath), workbenchRoot); }
    catch { sendText(response, 404, 'Not found'); return; }
    if (!existsSync(filePath) || !statSync(filePath).isFile()) { sendText(response, 404, 'Not found'); return; }
    const stats = statSync(filePath);
    const headers = {
      'Content-Type': contentType[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; frame-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Accept-Ranges': 'bytes',
    };
    const range = request.headers.range ? parseRange(request.headers.range, stats.size) : null;
    if (request.headers.range && !range) { response.writeHead(416, { ...headers, 'Content-Range': `bytes */${stats.size}` }); response.end(); return; }
    if (range) {
      response.writeHead(206, { ...headers, 'Content-Length': range.end - range.start + 1, 'Content-Range': `bytes ${range.start}-${range.end}/${stats.size}` });
      if (request.method === 'HEAD') response.end(); else createReadStream(filePath, range).pipe(response);
      return;
    }
    response.writeHead(200, { ...headers, 'Content-Length': stats.size });
    if (request.method === 'HEAD') response.end(); else createReadStream(filePath).pipe(response);
  });
  server.on('clientError', (_error, socket) => { if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'); });
  return server;
};

const listenOnce = (server, port) => new Promise((resolveListen, reject) => {
  const onError = (error) => { server.off('listening', onListening); reject(error); };
  const onListening = () => { server.off('error', onError); resolveListen(server.address().port); };
  server.once('error', onError);
  server.once('listening', onListening);
  server.listen(port, host);
});
const listenWithFallback = async (projectRoot, requestedPort, attempts = 11) => {
  const validAttempts = requestedPort === 0 ? [0] : Array.from({ length: attempts }, (_, offset) => requestedPort + offset).filter((port) => port <= 65535);
  for (const port of validAttempts) {
    const server = createWorkbenchServer(projectRoot);
    try { return { server, port: await listenOnce(server, port) }; }
    catch (error) {
      server.close();
      if (error.code !== 'EADDRINUSE' || requestedPort === 0) throw error;
    }
  }
  const server = createWorkbenchServer(projectRoot);
  return { server, port: await listenOnce(server, 0) };
};

const main = async () => {
  const projectRoot = resolve(process.argv[2] ?? process.cwd());
  const requestedPort = Number(process.argv[3] ?? 4317);
  if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) throw new Error('Workbench port must be an integer from 0 to 65535.');
  const result = await listenWithFallback(projectRoot, requestedPort);
  console.log(`Design Review: http://${host}:${result.port}/Design%20Review.html`);
  console.log(`Design Workbench: http://${host}:${result.port}/`);
};

const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) {
  main().catch((error) => { console.error(`Design Workbench failed: ${error.message}`); process.exitCode = 1; });
}

export { createWorkbenchServer, listenWithFallback, parseRange };
