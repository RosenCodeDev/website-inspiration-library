#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { discoverBrowser } from '../skills/design-taste-injection/scripts/browser-discovery.mjs';

const root = resolve(import.meta.dirname, '..');
const fixture = resolve(root, 'tests', 'fixtures', 'clone-source');
const widths = [1440, 768, 390];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const serve = async (folder) => {
  const requests = [];
  const server = createServer(async (request, response) => {
    requests.push(request.url);
    const relative = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.replace(/^\//, ''));
    const path = resolve(folder, relative);
    if (!path.startsWith(folder) || !existsSync(path)) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(await readFile(path));
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { server, requests, url: `http://127.0.0.1:${server.address().port}/` };
};
const close = (server) => new Promise((done, reject) => server.close((error) => error ? reject(error) : done()));

const main = async () => {
  const browserPath = discoverBrowser();
  if (!browserPath) throw new Error('Controlled clone fixture needs Chrome, Edge, or Chromium. Set DESIGN_TASTE_BROWSER_PATH when necessary.');
  const work = await mkdtemp(resolve(tmpdir(), 'dti-controlled-clone-'));
  const cloneRoot = resolve(work, 'independent-clone');
  const captures = resolve(work, 'captures');
  await mkdir(captures, { recursive: true });
  const source = await serve(fixture);
  const browser = await chromium.launch({ executablePath: browserPath, headless: true });
  try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(source.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: resolve(captures, `source-${width}.png`) });
    await page.close();
  }
  await cp(fixture, cloneRoot, { recursive: true });
  const clonedHtmlPath = resolve(cloneRoot, 'index.html');
  const clonedHtml = (await readFile(clonedHtmlPath, 'utf8')).replaceAll('Northstar Source', 'Beacon Local').replaceAll('NORTHSTAR', 'BEACON');
  await writeFile(clonedHtmlPath, clonedHtml);
  await close(source.server);

  const local = await serve(cloneRoot);
  const externalRequests = [];
  const qa = [];
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.on('request', (request) => { if (!request.url().startsWith(local.url)) externalRequests.push(request.url()); });
      await page.goto(local.url, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Reveal proof' }).click();
      await page.waitForTimeout(450);
      if (!(await page.locator('#proof').evaluate((node) => getComputedStyle(node).opacity === '1'))) throw new Error(`Interaction failed at ${width}px.`);
      await page.getByRole('button', { name: 'Reveal proof' }).click();
      await page.waitForTimeout(450);
      const cloneShot = resolve(captures, `clone-${width}.png`);
      await page.screenshot({ path: cloneShot });
      const original = PNG.sync.read(await readFile(resolve(captures, `source-${width}.png`)));
      const clone = PNG.sync.read(await readFile(cloneShot));
      const changed = pixelmatch(original.data, clone.data, null, original.width, original.height, { threshold: 0.1 });
      const ratio = changed / (original.width * original.height);
      if (ratio > 0.02) throw new Error(`Responsive QA failed at ${width}px (${(ratio * 100).toFixed(2)}% difference).`);
      qa.push({ width, ratio });
      await page.close();
    }
  } finally { await close(local.server); }
  if (externalRequests.length) throw new Error(`Clone made external requests: ${externalRequests.join(', ')}`);
  const cloneText = await readFile(resolve(cloneRoot, 'index.html'), 'utf8');
  if (/northstar|source server|analytics|https?:\/\//i.test(cloneText)) throw new Error('Source identity, endpoint, or analytics remained in the clone.');
  await mkdir(resolve(cloneRoot, 'dist'), { recursive: true });
  await cp(resolve(cloneRoot, 'index.html'), resolve(cloneRoot, 'dist', 'index.html'));
  console.log(JSON.stringify({ passed: true, selfContained: true, sourceStopped: true, externalRequests: 0, responsiveQa: qa, interactionVerified: true, identitySafe: true, build: 'dist/index.html' }, null, 2));
  } finally {
    if (source.server.listening) await close(source.server);
    await browser.close();
    await rm(work, { recursive: true, force: true });
  }
};
const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) main().catch((error) => { console.error(`Controlled clone fixture failed: ${error.message}`); process.exitCode = 1; });
export { main };
