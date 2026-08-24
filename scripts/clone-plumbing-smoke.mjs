#!/usr/bin/env node
// Optional public plumbing test. It checks capture, probes, QA wiring, workbench
// registration, and build output. It does not prove a self-contained reconstruction.
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { discoverBrowser } from '../skills/design-taste-injection/scripts/browser-discovery.mjs';

const widths = [1440, 768, 390];
const valueAfter = (flag) => { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : null; };
const run = (script, args, cwd) => {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `${script} failed`);
  return result.stdout;
};
const stablePage = async (page) => {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await Promise.all([...document.images].slice(0, 80).map((image) => image.complete ? Promise.resolve() : new Promise((done) => { image.addEventListener('load', done, { once: true }); image.addEventListener('error', done, { once: true }); setTimeout(done, 5000); })));
  });
  await page.waitForTimeout(1200);
};
const freezeCss = `*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}::-webkit-scrollbar{display:none!important}`;
const startStaticServer = async (root) => {
  const server = createServer(async (request, response) => {
    const name = request.url === '/' ? 'reconstruction.html' : request.url.replace(/^\//, '');
    const file = resolve(root, name);
    if (!file.startsWith(root) || !existsSync(file)) { response.writeHead(404); response.end(); return; }
    const bytes = await readFile(file);
    response.writeHead(200, { 'Content-Type': name.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(bytes);
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
};

const main = async () => {
  const projectRoot = resolve(valueAfter('--project') ?? '');
  const skillRoot = resolve(valueAfter('--skill-root') ?? '');
  if (!valueAfter('--project') || !valueAfter('--skill-root')) throw new Error('Usage: clone-plumbing-smoke.mjs --project <independent-folder> --skill-root <installed-skill-folder>');
  const browserPath = discoverBrowser();
  if (!browserPath) throw new Error('Chrome, Edge, or Chromium is required. Set DESIGN_TASTE_BROWSER_PATH when necessary.');
  await mkdir(projectRoot, { recursive: true });
  const cloneRuntime = resolve(skillRoot, 'scripts', 'clone-runtime.mjs');
  const stateRuntime = resolve(skillRoot, 'scripts', 'project-state.mjs');
  const probeBuilder = resolve(skillRoot, 'scripts', 'build-probe-bundle.mjs');
  const preflight = JSON.parse(run(cloneRuntime, ['preflight', projectRoot, 'site-spade', 'FORWARD1'], projectRoot));
  const evidence = resolve(preflight.evidenceRoot);
  const captures = resolve(evidence, 'captures');
  const previewRoot = resolve(projectRoot, '.inspiration', 'previews');
  const bundlePath = resolve(evidence, 'probes.bundle.js');
  run(probeBuilder, [bundlePath], projectRoot);
  const bundle = await readFile(bundlePath, 'utf8');

  const browser = await chromium.launch({ executablePath: browserPath, headless: true });
  let reconstruction;
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      await context.addInitScript({ content: bundle });
      await context.addInitScript({ content: 'window.instrumentGetContext();window.instrumentMotion();' });
      const page = await context.newPage();
      await page.goto(preflight.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await stablePage(page);
      await page.addStyleTag({ content: freezeCss });
      await page.waitForTimeout(200);
      const probes = await page.evaluate(() => ({ surface: window.surfaceMap(), motion: window.motionProbe(), tokens: window.tokensProbe({ minCount: 1 }) }));
      await writeFile(resolve(evidence, `surface-map-${width}.json`), `${JSON.stringify(probes.surface, null, 2)}\n`);
      await writeFile(resolve(evidence, `motion-${width}.json`), `${JSON.stringify(probes.motion, null, 2)}\n`);
      await writeFile(resolve(evidence, `tokens-${width}.json`), `${JSON.stringify(probes.tokens, null, 2)}\n`);
      await page.screenshot({ path: resolve(captures, `original-${width}.png`) });
      if (width === 1440) reconstruction = await page.evaluate((sourceUrl) => {
        document.querySelectorAll('script, meta[http-equiv]').forEach((node) => node.remove());
        const base = document.createElement('base'); base.href = sourceUrl; document.head.prepend(base);
        return `<!doctype html>${document.documentElement.outerHTML}`;
      }, preflight.url);
      await context.close();
    }

    if (!reconstruction) throw new Error('Measured reconstruction was not produced.');
    const reconstructionPath = resolve(evidence, 'reconstruction.html');
    await writeFile(reconstructionPath, reconstruction);
    const local = await startStaticServer(evidence);
    try {
      for (const width of widths) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
        const page = await context.newPage();
        await page.goto(local.url, { waitUntil: 'domcontentloaded' });
        await stablePage(page);
        await page.screenshot({ path: resolve(captures, `clone-${width}.png`) });
        await context.close();
      }
    } finally { await new Promise((done) => local.server.close(done)); }
  } finally { await browser.close(); }

  await writeFile(resolve(evidence, 'TEARDOWN.md'), '# Spade plumbing test\n\nCONFIRMED: Public marketing page. OBSERVED: DOM/CSS shell with animated visual surfaces. This disposable artifact validates capture and QA plumbing only; it is not a self-contained production clone.\n');
  await writeFile(resolve(evidence, 'ROUTING.md'), '# Routing\n\nDOM/CSS: measured shell. Motion and canvas: evidence retained for specialist handling. Identity removal occurs before the remix preview.\n');
  const pairs = widths.map((width) => ({ width, original: resolve(captures, `original-${width}.png`), clone: resolve(captures, `clone-${width}.png`), maxDiffRatio: 0.05 }));
  const manifest = resolve(evidence, 'qa-manifest.json');
  await writeFile(manifest, `${JSON.stringify({ schemaVersion: 2, generationId: 'FORWARD1', pairs }, null, 2)}\n`);
  run(cloneRuntime, ['verify', projectRoot, 'FORWARD1', manifest], projectRoot);

  const remix = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ledgerline directions</title><style>body{margin:0;background:#f3ebdd;color:#171612;font-family:Arial,sans-serif}header{padding:28px;border-bottom:2px solid}main{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding:28px}.direction{min-height:420px;border:2px solid;padding:22px;display:flex;flex-direction:column;justify-content:space-between}.b{background:#171612;color:#f3ebdd}.c{background:#dce4da}@media(max-width:800px){main{grid-template-columns:1fr}}h1,h2{margin:0}p{max-width:34ch}button{border:2px solid currentColor;background:transparent;color:inherit;padding:10px 14px}</style><header><strong>LEDGERLINE</strong></header><main><section class="direction"><h2>Evidence Grid</h2><p>Structured transaction intelligence with visible proof and quiet editorial hierarchy.</p><button>Request access</button></section><section class="direction b"><h2>Signal Field</h2><p>A high-contrast data surface built around speed, accuracy, and direct action.</p><button>Request access</button></section><section class="direction c"><h2>Clear Ledger</h2><p>A calm operational system that turns messy records into useful decisions.</p><button>Request access</button></section></main></html>`;
  for (const id of ['FORWARD1-O', 'FORWARD1-R']) {
    const folder = resolve(previewRoot, id); await mkdir(folder, { recursive: true });
    await writeFile(resolve(folder, 'index.html'), id.endsWith('-R') ? remix : reconstruction);
  }
  run(stateRuntime, ['init', projectRoot], projectRoot);
  for (const record of [
    { id: 'FORWARD1-O', parent: null, stage: 'direction', status: 'superseded', label: 'Measured plumbing artifact', category: 'Print-Tech Paper', thesis: 'Measured source structure before identity removal.', references: [{ id: 'site-spade', role: 'anchor' }], preview: '../previews/FORWARD1-O/index.html', createdAt: new Date().toISOString() },
    { id: 'FORWARD1-R', parent: 'FORWARD1-O', stage: 'variant', status: 'candidate', label: 'Identity-safe remix', category: 'Print-Tech Paper', thesis: 'Three original directions with source identity removed.', references: [{ id: 'site-spade', role: 'anchor' }], preview: '../previews/FORWARD1-R/index.html', createdAt: new Date().toISOString() },
  ]) {
    const recordPath = resolve(projectRoot, `${record.id}.json`); await writeFile(recordPath, JSON.stringify(record));
    run(stateRuntime, ['append-generation', projectRoot, recordPath], projectRoot);
  }
  await writeFile(resolve(projectRoot, 'package.json'), '{"name":"design-taste-forward-test","private":true,"scripts":{"build":"node build.mjs"}}\n');
  await writeFile(resolve(projectRoot, 'build.mjs'), "import{cp,mkdir}from'node:fs/promises';await mkdir('dist',{recursive:true});await cp('.inspiration/previews/FORWARD1-R/index.html','dist/index.html');\n");
  const build = process.platform === 'win32'
    ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npm run build'], { cwd: projectRoot, encoding: 'utf8' })
    : spawnSync('npm', ['run', 'build'], { cwd: projectRoot, encoding: 'utf8' });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout || 'Forward-test project build failed.');
  await writeFile(resolve(evidence, 'plumbing-report.json'), `${JSON.stringify({ passed: true, provesReconstruction: false, source: preflight.url, generationId: 'FORWARD1', qa: resolve(evidence, 'qa', 'report.json'), remix: resolve(previewRoot, 'FORWARD1-R', 'index.html'), build: resolve(projectRoot, 'dist', 'index.html'), completedAt: new Date().toISOString() }, null, 2)}\n`);
  console.log(JSON.stringify({ passed: true, projectRoot, evidence }, null, 2));
};

const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) main().catch((error) => { console.error(`Clone plumbing test failed: ${error.message}`); process.exitCode = 1; });
export { main };
