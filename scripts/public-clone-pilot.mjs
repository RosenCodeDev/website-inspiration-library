#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { homedir, tmpdir } from 'node:os';
import { basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { discoverBrowser } from '../skills/design-taste-injection/scripts/browser-discovery.mjs';

const sourceUrl = 'https://aside.com/';
const cardId = 'site-aside';
const generationId = 'aside-public-pilot';
const widths = [1440, 768, 390];
const heroSelector = '.bg-muted.relative.overflow-hidden.rounded-xl';
const contentTypes = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

const normalizeUrl = (value) => {
  try { const url = new URL(value); url.hash = ''; return url.href; } catch { return value; }
};
const urlKey = (value) => {
  try { const url = new URL(value); url.hash = ''; url.search = ''; return url.href; } catch { return value; }
};
const canUseQuerylessKey = (value) => {
  try { return !new URL(value).pathname.endsWith('/_next/image'); } catch { return true; }
};
const extensionFor = (url, type = '') => {
  const extension = extname(new URL(url).pathname).toLowerCase();
  if (extension && extension.length <= 6) return extension;
  if (/css/.test(type)) return '.css';
  if (/svg/.test(type)) return '.svg';
  if (/webp/.test(type)) return '.webp';
  if (/png/.test(type)) return '.png';
  if (/jpe?g/.test(type)) return '.jpg';
  if (/woff2/.test(type)) return '.woff2';
  if (/woff/.test(type)) return '.woff';
  return '.bin';
};
const close = (server) => new Promise((done, reject) => server.close((error) => error ? reject(error) : done()));
const serve = async (folder) => {
  const server = createServer(async (request, response) => {
    const relative = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.split('?')[0].replace(/^\//, ''));
    const path = resolve(folder, relative);
    if (!path.startsWith(folder) || !existsSync(path)) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'Content-Type': contentTypes[extname(path).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(await readFile(path));
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
};
const run = (script, args, cwd) => {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `${basename(script)} failed`);
  return result.stdout.trim();
};

const main = async () => {
  const browserPath = discoverBrowser();
  if (!browserPath) throw new Error('Public clone pilot needs Chrome, Edge, or Chromium. Set DESIGN_TASTE_BROWSER_PATH when necessary.');
  const installedRoot = resolve(homedir(), '.codex', 'skills', 'design-taste-injection');
  const stateScript = resolve(installedRoot, 'scripts', 'project-state.mjs');
  const cloneScript = resolve(installedRoot, 'scripts', 'clone-runtime.mjs');
  if (!existsSync(stateScript) || !existsSync(cloneScript)) throw new Error('Install the current skill with npm run setup:codex before running the public pilot.');

  const work = await mkdtemp(resolve(tmpdir(), 'dti-public-clone-'));
  const projectRoot = resolve(work, 'aside-clean-room');
  const cloneRoot = resolve(projectRoot, 'source-clone');
  const remixRoot = resolve(projectRoot, 'site');
  const evidenceRoot = resolve(projectRoot, '.inspiration', 'clone', generationId);
  const captureRoot = resolve(evidenceRoot, 'captures');
  await mkdir(projectRoot, { recursive: true });
  run(stateScript, ['init', projectRoot]);
  run(cloneScript, ['preflight', projectRoot, cardId, generationId]);
  await mkdir(resolve(cloneRoot, 'assets'), { recursive: true });

  const browser = await chromium.launch({ executablePath: browserPath, headless: true });
  const captured = new Map();
  const pending = [];
  let sourceHero = '';
  let remixHero = '';
  let htmlClass = '';
  let bodyClass = '';
  let stylesheets = [];
  try {
    for (const width of widths) {
      console.log(`Capturing public source at ${width}px...`);
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      page.on('response', (response) => {
        const type = response.request().resourceType();
        if (!['stylesheet', 'image', 'font'].includes(type) || response.status() !== 200) return;
        pending.push((async () => {
          try {
            const record = { url: normalizeUrl(response.url()), type: response.headers()['content-type'] ?? '', buffer: await response.body() };
            captured.set(record.url, record); if (canUseQuerylessKey(record.url)) captured.set(urlKey(record.url), record);
          } catch { /* A duplicate cached response may no longer expose its body. */ }
        })());
      });
      await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      console.log(`Source DOM ready at ${width}px.`);
      await page.locator(heroSelector).first().waitFor({ state: 'visible', timeout: 30_000 });
      await page.waitForTimeout(4_000);
      await page.evaluate(async (selector) => {
        const timeout = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds));
        await Promise.race([document.fonts.ready, timeout(5_000)]);
        const hero = document.querySelector(selector);
        const images = hero ? [...hero.querySelectorAll('img')] : [];
        await Promise.race([Promise.allSettled(images.map((image) => image.decode?.())), timeout(5_000)]);
        const style = document.createElement('style');
        style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
        document.head.append(style); scrollTo(0, 0);
      }, heroSelector);
      console.log(`Source assets ready at ${width}px.`);
      await page.waitForTimeout(350);
      const hero = page.locator(heroSelector).first();
      if (!await hero.count()) throw new Error(`Could not locate the approved Aside hero at ${width}px.`);
      await page.screenshot({ path: resolve(captureRoot, `original-${width}.png`) });
      console.log(`Source screenshot saved at ${width}px.`);
      if (width === 1440) {
        ({ stylesheets, htmlClass, bodyClass } = await page.evaluate(() => ({
          stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => node.href),
          htmlClass: document.documentElement.className, bodyClass: document.body.className,
        })));
        ({ sourceHero, remixHero } = await hero.evaluate((node) => {
          const root = node.parentElement;
          const source = root.cloneNode(true);
          const remix = root.cloneNode(true);
          source.querySelectorAll('script,iframe').forEach((item) => item.remove());
          remix.querySelectorAll('script,iframe').forEach((item) => item.remove());
          const walker = document.createTreeWalker(remix, NodeFilter.SHOW_TEXT);
          const replacements = [
            [/Aside/g, 'Aster'],
            [/The browser built to do real work for you\.?/gi, 'A focused workspace for deep work.'],
            [/Download Aside/gi, 'Open Aster'],
          ];
          while (walker.nextNode()) for (const [pattern, value] of replacements) walker.currentNode.nodeValue = walker.currentNode.nodeValue.replace(pattern, value);
          const brand = document.createElement('span'); brand.className = 'pilot-brand'; brand.textContent = 'Aster';
          const logo = remix.querySelector('header svg, nav svg'); if (logo) logo.replaceWith(brand);
          return { sourceHero: source.outerHTML, remixHero: remix.outerHTML };
        }));
      }
      await page.close();
    }
    await Promise.allSettled(pending);

    const context = await browser.newContext();
    const acquire = async (url) => {
      const normalized = normalizeUrl(url);
      const existing = captured.get(normalized) ?? (canUseQuerylessKey(normalized) ? captured.get(urlKey(normalized)) : undefined);
      if (existing) return existing;
      const response = await context.request.get(normalized, { timeout: 15_000 });
      if (!response.ok()) throw new Error(`Could not localize ${normalized}: HTTP ${response.status()}`);
      const record = { url: normalized, type: response.headers()['content-type'] ?? '', buffer: await response.body() };
      captured.set(normalized, record); if (canUseQuerylessKey(normalized)) captured.set(urlKey(normalized), record);
      return record;
    };
    for (const url of stylesheets) await acquire(url);
    const assetUrls = new Set();
    for (const match of sourceHero.matchAll(/(?:src|poster)=(['"])([^'"]+)\1/g)) {
      const raw = match[2].replaceAll('&amp;', '&');
      if (!/^(?:data:|#)/.test(raw)) try { assetUrls.add(new URL(raw, sourceUrl).href); } catch { /* Ignore invalid source paths. */ }
    }
    for (const match of sourceHero.matchAll(/url\((['"]?)([^)'"\s]+)\1\)/g)) {
      if (!/^(?:data:|#)/.test(match[2])) try { assetUrls.add(new URL(match[2], sourceUrl).href); } catch { /* Ignore invalid source paths. */ }
    }
    await Promise.allSettled([...assetUrls].map((url) => acquire(url)));
    await context.close();

    const records = [...new Set([...captured.values()])];
    const localByUrl = new Map();
    for (const record of records) {
      const name = `${createHash('sha256').update(record.url).digest('hex').slice(0, 14)}${extensionFor(record.url, record.type)}`;
      localByUrl.set(record.url, name); localByUrl.set(urlKey(record.url), name);
      try { const url = new URL(record.url); localByUrl.set(`${url.pathname}${url.search}`, name); } catch { /* The response URL was already validated. */ }
      if (!/text\/css/.test(record.type) && extensionFor(record.url, record.type) !== '.css') await writeFile(resolve(cloneRoot, 'assets', name), record.buffer);
    }
    const localName = (raw, base) => {
      try { const absolute = new URL(raw, base).href; return localByUrl.get(absolute) ?? localByUrl.get(urlKey(absolute)); } catch { return undefined; }
    };
    const localizedStyles = [];
    for (const [index, url] of stylesheets.entries()) {
      let css = (await acquire(url)).buffer.toString('utf8').replace(/url\((['"]?)([^)'"\s]+)\1\)/g, (whole, quote, raw) => {
        if (/^(?:data:|#)/.test(raw)) return whole;
        const name = localName(raw, url); return name ? `url("assets/${name}")` : 'url("")';
      });
      css = css.replace(/@import\s+(?:url\()?['"]?https?:\/\/[^;'"\)]+['"]?\)?[^;]*;/g, '');
      const name = `source-${index + 1}.css`; await writeFile(resolve(cloneRoot, name), css, 'utf8'); localizedStyles.push(name);
    }
    const localizeHtml = (markup) => {
      let result = markup;
      for (const [url, name] of [...localByUrl.entries()].filter(([url]) => url.length > 5).sort((a, b) => b[0].length - a[0].length)) {
        result = result.replaceAll(url, `assets/${name}`).replaceAll(url.replaceAll('&', '&amp;'), `assets/${name}`);
      }
      return result.replace(/\s(?:src|href|poster)=(['"])https?:\/\/.*?\1/g, '').replace(/\ssrcset=(['"])[\s\S]*?\1/g, '');
    };
    const interaction = `document.querySelectorAll('a,button').forEach((node)=>node.addEventListener('click',(event)=>{event.preventDefault();document.body.dataset.pilotInteraction='verified';}));`;
    const shell = (hero, title) => `<!doctype html><html lang="en" class="${htmlClass}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>${localizedStyles.map((name) => `<link rel="stylesheet" href="${name}">`).join('')}<style>*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.pilot-brand{font:700 1rem/1 sans-serif;letter-spacing:-.02em}</style></head><body class="${bodyClass}">${localizeHtml(hero)}<script src="pilot.js"></script></body></html>`;
    await writeFile(resolve(cloneRoot, 'index.html'), shell(sourceHero, 'Aside clean room clone'), 'utf8');
    await writeFile(resolve(cloneRoot, 'pilot.js'), interaction, 'utf8');
    await cp(cloneRoot, remixRoot, { recursive: true });
    await writeFile(resolve(remixRoot, 'index.html'), shell(remixHero, 'Aster local remix'), 'utf8');
    await writeFile(resolve(remixRoot, 'package.json'), `${JSON.stringify({ name: 'aster-local-remix', private: true, scripts: { build: 'node build.mjs' } }, null, 2)}\n`);
    await writeFile(resolve(remixRoot, 'build.mjs'), `import{cp,mkdir,rm}from'node:fs/promises';await rm('dist',{recursive:true,force:true});await mkdir('dist');for(const p of ['index.html','pilot.js',${localizedStyles.map((name) => `'${name}'`).join(',')},'assets'])await cp(p,'dist/'+p,{recursive:true});\n`);

    const local = await serve(cloneRoot);
    const remix = await serve(remixRoot);
    const external = [];
    const missingLocal = [];
    try {
      for (const width of widths) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
        page.on('request', (request) => { if (!request.url().startsWith(local.url)) external.push(request.url()); });
        page.on('response', (response) => { if (response.url().startsWith(local.url) && response.status() >= 400) missingLocal.push(`${response.status()} ${response.url()}`); });
        await page.goto(local.url, { waitUntil: 'networkidle' });
        await page.screenshot({ path: resolve(captureRoot, `clone-${width}.png`) });
        const action = page.locator('a,button').first();
        if (await action.count()) {
          await action.click();
          if (!await page.evaluate(() => document.body.dataset.pilotInteraction === 'verified')) throw new Error(`Clone interaction failed at ${width}px.`);
        }
        await page.close();
      }
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      page.on('request', (request) => { if (!request.url().startsWith(remix.url)) external.push(request.url()); });
      page.on('response', (response) => { if (response.url().startsWith(remix.url) && response.status() >= 400) missingLocal.push(`${response.status()} ${response.url()}`); });
      await page.goto(remix.url, { waitUntil: 'networkidle' });
      if (/aside/i.test(await page.locator('body').innerText())) throw new Error('Source identity remains visible in the remix.');
      await page.close();
    } finally { await close(local.server); await close(remix.server); }
    if (external.length) throw new Error(`Self-contained clone made external requests: ${[...new Set(external)].join(', ')}`);
    if (missingLocal.length) throw new Error(`Clone requested missing local assets: ${[...new Set(missingLocal)].join(', ')}`);

    const forbidden = /aside\.com|https?:\/\/(?!www\.w3\.org\/)|analytics|segment\.com|googletagmanager/i;
    for (const folder of [cloneRoot, remixRoot]) for (const name of ['index.html', 'pilot.js', ...localizedStyles]) {
      if (forbidden.test(await readFile(resolve(folder, name), 'utf8'))) throw new Error(`External endpoint or analytics remains in ${folder}/${name}.`);
    }
    const manifest = { schemaVersion: 2, generationId, pairs: widths.map((width) => ({
      width, original: resolve(captureRoot, `original-${width}.png`), clone: resolve(captureRoot, `clone-${width}.png`), maxDiffRatio: 0.05,
    })) };
    const manifestPath = resolve(evidenceRoot, 'qa-manifest.json');
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const verification = JSON.parse(run(cloneScript, ['verify', projectRoot, generationId, manifestPath]));
    if (!verification.passed) throw new Error('Installed-skill responsive QA did not pass.');

    run(resolve(remixRoot, 'build.mjs'), [], remixRoot);
    const previewRoot = resolve(projectRoot, '.inspiration', 'previews', generationId);
    await mkdir(previewRoot, { recursive: true });
    await cp(remixRoot, previewRoot, { recursive: true, filter: (source) => basename(source) !== 'dist' });
    const generation = {
      id: generationId, label: 'Aside public pilot remix', stage: 'implementation', parent: null,
      category: 'Print-Tech Paper', status: 'candidate', preview: `../previews/${generationId}/index.html`, referenceIds: [cardId],
      thesis: 'Localize the measured hero system, preserve its hierarchy, and replace the source identity.',
      references: [{ id: cardId, role: 'anchor' }],
      notes: 'Clean-room DOM and CSS reconstruction with localized assets and identity-safe remix.', createdAt: new Date().toISOString(),
    };
    const generationPath = resolve(work, 'generation.json'); await writeFile(generationPath, `${JSON.stringify(generation, null, 2)}\n`);
    run(stateScript, ['append-generation', projectRoot, generationPath]);
    run(stateScript, ['validate', projectRoot]);
    const report = {
      passed: true, source: sourceUrl, cardId, projectRoot, installedSkill: installedRoot, selfContained: true,
      externalRequests: 0, missingLocalAssets: 0, sourceScriptsCopied: false, analyticsCopied: false,
      responsiveQa: verification.results.map(({ width, ratio, threshold, status }) => ({ width, ratio, threshold, status })),
      interactionVerified: true, identitySafeRemix: true, workbenchRegistered: true, productionBuild: resolve(remixRoot, 'dist', 'index.html'),
    };
    const reportPath = resolve(projectRoot, 'PUBLIC-CLONE-PILOT.json');
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({ ...report, reportPath }, null, 2));
  } finally {
    await browser.close();
    if (!process.argv.includes('--keep')) await rm(work, { recursive: true, force: true });
  }
};

const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) main().catch((error) => { console.error(`Public clone pilot failed: ${error.message}`); process.exitCode = 1; });
export { main };
