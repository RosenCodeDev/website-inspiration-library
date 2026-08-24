import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { chromium } from 'playwright-core';

const root = realpathSync(process.cwd());
const skillRoot = resolve(root, 'skills', 'design-taste-injection');
const scratch = mkdtempSync(join(tmpdir(), 'design-taste-probes-'));

afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('clone reconnaissance probes', () => {
  it('constructs a callable bundle and classifies DOM, motion, and canvas on a controlled page', async () => {
    const { discoverBrowser } = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'browser-discovery.mjs')).href}?browser=${Date.now()}`);
    const browserPath = discoverBrowser();
    expect(browserPath).toBeTruthy();
    const { buildProbeBundle } = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'build-probe-bundle.mjs')).href}?test=${Date.now()}`);
    const bundle = await buildProbeBundle(resolve(scratch, 'probes.bundle.js'));
    expect(bundle).toContain('Object.assign');
    expect(bundle).toContain('surfaceMap');
    expect(bundle).toContain('motionSummary');
    expect(bundle).toContain('tokensProbe');
    expect(readFileSync(resolve(scratch, 'probes.bundle.js'), 'utf8')).toBe(bundle);

    const browser = await chromium.launch({ executablePath: browserPath, headless: true });
    try {
      const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
      await context.addInitScript({ content: bundle });
      await context.addInitScript({ content: 'window.instrumentGetContext(); window.instrumentMotion();' });
      const page = await context.newPage();
      await page.goto(pathToFileURL(resolve(root, 'tests', 'fixtures', 'probe-page.html')).href);
      const result = await page.evaluate(() => ({
        surface: (window as unknown as { surfaceMap: () => unknown }).surfaceMap(),
        motion: (window as unknown as { motionSummary: () => unknown }).motionSummary(),
        tokens: (window as unknown as { tokensProbe: (options: { minCount: number }) => unknown }).tokensProbe({ minCount: 1 }),
      })) as {
        surface: { counts: { canvas: number }; surfaces: Array<{ surface: string }> };
        motion: { topTransitions: unknown[] };
        tokens: { colors: unknown[]; fonts: unknown[]; page: { scrollHeight: number } };
      };
      expect(result.surface.counts.canvas).toBe(1);
      expect(result.surface.surfaces.some((surface) => surface.surface === 'CANVAS2D')).toBe(true);
      expect(result.surface.surfaces.some((surface) => surface.surface === 'SVG_ANIMATED')).toBe(true);
      expect(result.motion.topTransitions.length).toBeGreaterThan(0);
      expect(result.tokens.colors.length).toBeGreaterThan(0);
      expect(result.tokens.fonts.length).toBeGreaterThan(0);
      expect(result.tokens.page.scrollHeight).toBeGreaterThan(0);
      await context.close();
    } finally {
      await browser.close();
    }
  }, 30_000);

  it('honors an explicit browser override before platform defaults', async () => {
    const fake = resolve(scratch, process.platform === 'win32' ? 'browser.exe' : 'browser');
    writeFileSync(fake, 'fixture');
    const prior = process.env.DESIGN_TASTE_BROWSER_PATH;
    process.env.DESIGN_TASTE_BROWSER_PATH = fake;
    try {
      const { discoverBrowser } = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'browser-discovery.mjs')).href}?override=${Date.now()}`);
      expect(discoverBrowser()).toBe(fake);
    } finally {
      if (prior === undefined) delete process.env.DESIGN_TASTE_BROWSER_PATH; else process.env.DESIGN_TASTE_BROWSER_PATH = prior;
    }
  });
});
