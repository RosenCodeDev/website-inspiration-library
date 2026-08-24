#!/usr/bin/env node
import { createRequire } from 'node:module';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { discoverBrowser } from './browser-discovery.mjs';
import { assertContainedPath, assertIndependentPath } from './path-safety.mjs';

const scriptRoot = resolve(import.meta.dirname, '..');
const configPath = resolve(scriptRoot, 'config', 'library.json');
const requiredWidths = [1440, 768, 390];
const automaticThresholdCap = 0.05;
const maximumThreshold = 0.1;
const maximumMaskRatio = 0.25;

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const safeGenerationId = (value) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value);

const installedConfig = async () => {
  if (!existsSync(configPath)) throw new Error('Missing installed library configuration. Run npm run setup:codex from the library repository.');
  return readJson(configPath);
};

const catalog = async () => {
  const config = await installedConfig();
  const result = spawnSync(process.execPath, [resolve(scriptRoot, 'scripts', 'library.mjs'), 'catalog'], {
    encoding: 'utf8', maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Could not read the library catalog.');
  return { config, value: JSON.parse(result.stdout) };
};

const preflight = async (projectArg, cardId, generationId) => {
  if (!projectArg || !cardId || !generationId) throw new Error('Usage: clone-runtime.mjs preflight <project-root> <card-id> <generation-id>');
  if (!safeGenerationId(generationId)) throw new Error('generation-id contains unsupported characters');
  const { config, value } = await catalog();
  const libraryRoot = resolve(config.libraryRoot);
  const projectRoot = assertIndependentPath(projectArg, [libraryRoot, scriptRoot]);
  const card = value.cards.find((entry) => entry.id === cardId);
  if (!card) throw new Error(`Unknown reference: ${cardId}`);
  if (card.workflow.cloneMode !== 'verified-clone-remix') throw new Error(`${card.title} is ${card.workflow.cloneMode}, not verified-clone-remix.`);
  if (!card.source.url) throw new Error('Verified clone reference has no source URL.');
  const browser = discoverBrowser();
  if (!browser) throw new Error('No supported Chrome, Edge, or Chromium browser was found. Set DESIGN_TASTE_BROWSER_PATH if it is installed in a nonstandard location.');

  const root = resolve(projectRoot, '.inspiration', 'clone', generationId);
  assertContainedPath(root, resolve(projectRoot, '.inspiration'));
  for (const folder of ['captures', 'effects', 'qa']) await mkdir(resolve(root, folder), { recursive: true });
  await mkdir(resolve(projectRoot, '.inspiration', 'previews', generationId), { recursive: true });
  const result = {
    schemaVersion: 2,
    generationId,
    cardId,
    title: card.title,
    url: card.source.url,
    cloneMode: card.workflow.cloneMode,
    cloneReason: card.workflow.cloneReason,
    projectRoot,
    evidenceRoot: root,
    preview: `../previews/${generationId}/index.html`,
    browser,
    requiredWidths,
    createdAt: new Date().toISOString(),
  };
  await writeFile(resolve(root, 'preflight.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
  return result;
};

const validatePreflight = async (preflightPath, projectRoot, evidenceRoot, generationId) => {
  if (!existsSync(preflightPath)) throw new Error('Matching clone preflight record is required before QA.');
  const record = await readJson(preflightPath);
  if (record.schemaVersion !== 2 || record.generationId !== generationId
    || resolve(record.projectRoot ?? '') !== projectRoot || resolve(record.evidenceRoot ?? '') !== evidenceRoot
    || JSON.stringify(record.requiredWidths) !== JSON.stringify(requiredWidths)) {
    throw new Error('Clone preflight record does not match this project and generation.');
  }
  return record;
};

const validateMaskRects = (rects, width, height) => {
  if (rects === undefined) return [];
  if (!Array.isArray(rects)) throw new Error(`QA pair ${width} maskRects must be an array.`);
  return rects.map((rect, index) => {
    if (!rect || ![rect.x, rect.y, rect.width, rect.height].every(finite)
      || rect.x < 0 || rect.y < 0 || rect.width <= 0 || rect.height <= 0
      || rect.x + rect.width > width || rect.y + rect.height > height
      || typeof rect.reason !== 'string' || !rect.reason.trim()) {
      throw new Error(`QA pair ${width} mask ${index + 1} is invalid or lacks a reason.`);
    }
    return rect;
  });
};

const buildMask = (width, height, rects) => {
  const pixels = new Uint8Array(width * height);
  for (const rect of rects) {
    const left = Math.floor(rect.x);
    const top = Math.floor(rect.y);
    const right = Math.ceil(rect.x + rect.width);
    const bottom = Math.ceil(rect.y + rect.height);
    for (let y = top; y < bottom; y += 1) pixels.fill(1, (y * width) + left, (y * width) + right);
  }
  let maskedPixels = 0;
  for (const value of pixels) maskedPixels += value;
  return { pixels, maskedPixels };
};

const validateManifest = (manifest, generationId) => {
  if (!manifest || manifest.schemaVersion !== 2 || manifest.generationId !== generationId || !Array.isArray(manifest.pairs)) {
    throw new Error('QA manifest must use schemaVersion 2 and match the generation ID.');
  }
  if (manifest.pairs.length !== requiredWidths.length) throw new Error(`QA manifest requires exactly ${requiredWidths.length} pairs.`);
  const widths = manifest.pairs.map((pair) => pair.width);
  if (new Set(widths).size !== widths.length || JSON.stringify([...widths].sort((a, b) => b - a)) !== JSON.stringify(requiredWidths)) {
    throw new Error(`QA pairs must contain exactly one record for each of ${requiredWidths.join(', ')} pixels.`);
  }
  for (const pair of manifest.pairs) {
    if (!finite(pair.maxDiffRatio ?? 0.02) || (pair.maxDiffRatio ?? 0.02) < 0 || (pair.maxDiffRatio ?? 0.02) > maximumThreshold) {
      throw new Error(`QA pair ${pair.width} threshold must be between 0 and ${maximumThreshold}.`);
    }
    if (typeof pair.original !== 'string' || typeof pair.clone !== 'string') throw new Error(`QA pair ${pair.width} paths are required.`);
  }
};

const verify = async (projectArg, generationId, manifestArg) => {
  if (!projectArg || !generationId || !manifestArg) throw new Error('Usage: clone-runtime.mjs verify <project-root> <generation-id> <manifest.json>');
  if (!safeGenerationId(generationId)) throw new Error('generation-id contains unsupported characters');
  const projectRoot = resolve(projectArg);
  const evidenceRoot = resolve(projectRoot, '.inspiration', 'clone', generationId);
  const qaRoot = resolve(evidenceRoot, 'qa');
  const manifestPath = resolve(manifestArg);
  try { assertContainedPath(manifestPath, evidenceRoot); } catch { throw new Error('QA manifest must remain inside the generation evidence folder.'); }
  const [manifest, preflightRecord] = await Promise.all([
    readJson(manifestPath),
    validatePreflight(resolve(evidenceRoot, 'preflight.json'), projectRoot, evidenceRoot, generationId),
  ]);
  validateManifest(manifest, generationId);

  const config = await installedConfig();
  const requireFromLibrary = createRequire(resolve(config.libraryRoot, 'package.json'));
  const pixelmatchPath = requireFromLibrary.resolve('pixelmatch');
  const pixelmatch = (await import(pathToFileURL(pixelmatchPath).href)).default;
  const { PNG } = requireFromLibrary('pngjs');
  await mkdir(qaRoot, { recursive: true });
  const results = [];

  for (const pair of manifest.pairs) {
    const originalPath = resolve(pair.original);
    const clonePath = resolve(pair.clone);
    try { assertContainedPath(originalPath, evidenceRoot); assertContainedPath(clonePath, evidenceRoot); } catch { throw new Error('QA images must remain inside the generation evidence folder.'); }
    if (!existsSync(originalPath) || !existsSync(clonePath)) throw new Error(`QA pair ${pair.width} image is missing.`);
    const original = PNG.sync.read(await readFile(originalPath));
    const clone = PNG.sync.read(await readFile(clonePath));
    if (original.width !== pair.width || clone.width !== pair.width) throw new Error(`QA pair ${pair.width} has the wrong width.`);
    if (original.height !== clone.height || original.height < 1) throw new Error(`QA pair ${pair.width} has different or invalid section heights.`);
    if (original.height > 20_000 || (original.width * original.height) > 40_000_000) throw new Error(`QA pair ${pair.width} exceeds safe image dimensions.`);
    const rects = validateMaskRects(pair.maskRects, original.width, original.height);
    const pixelMask = buildMask(original.width, original.height, rects);
    const totalPixels = original.width * original.height;
    const maskedRatio = pixelMask.maskedPixels / totalPixels;
    if (maskedRatio > maximumMaskRatio) throw new Error(`QA pair ${pair.width} masks ${(maskedRatio * 100).toFixed(2)}%; maximum is 25%.`);

    const diff = new PNG({ width: original.width, height: original.height });
    const originalPixels = Buffer.from(original.data);
    const clonePixels = Buffer.from(clone.data);
    for (let index = 0; index < totalPixels; index += 1) {
      const offset = index * 4;
      if (pixelMask.pixels[index]) clonePixels.set(originalPixels.subarray(offset, offset + 4), offset);
    }
    const changedPixels = pixelmatch(originalPixels, clonePixels, diff.data, original.width, original.height, { threshold: 0.1 });
    for (let index = 0; index < totalPixels; index += 1) if (pixelMask.pixels[index]) diff.data.set([245, 235, 221, 255], index * 4);
    const comparedPixels = totalPixels - pixelMask.maskedPixels;
    if (!comparedPixels) throw new Error(`QA pair ${pair.width} has no unmasked pixels.`);
    const ratio = changedPixels / comparedPixels;
    const threshold = pair.maxDiffRatio ?? 0.02;
    const automaticEligible = threshold <= automaticThresholdCap;
    const passed = automaticEligible && ratio <= threshold;
    const status = !automaticEligible ? 'inconclusive' : passed ? 'passed' : 'failed';
    const passReason = !automaticEligible
      ? `Threshold ${threshold} exceeds the automatic-pass cap ${automaticThresholdCap}; manual review is required.`
      : passed ? `Unmasked difference ${ratio} is within threshold ${threshold}.` : `Unmasked difference ${ratio} exceeds threshold ${threshold}.`;
    const diffPath = resolve(qaRoot, `diff-${pair.width}.png`);
    await writeFile(diffPath, PNG.sync.write(diff));
    results.push({
      width: pair.width, changedPixels, maskedPixels: pixelMask.maskedPixels, maskedRatio,
      comparedPixels, ratio, threshold, status, passed, passReason, masks: rects, diff: diffPath,
    });
  }

  const report = {
    schemaVersion: 2,
    generationId,
    cardId: preflightRecord.cardId,
    passed: results.every((result) => result.passed),
    status: results.some((result) => result.status === 'inconclusive') ? 'inconclusive'
      : results.every((result) => result.passed) ? 'passed' : 'failed',
    results,
    verifiedAt: new Date().toISOString(),
  };
  await writeFile(resolve(qaRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = report.status === 'inconclusive' ? 3 : 2;
  return report;
};

const main = async () => {
  const [command, projectRoot, value, extra] = process.argv.slice(2);
  if (command === 'preflight') return preflight(projectRoot, value, extra);
  if (command === 'verify') return verify(projectRoot, value, extra);
  throw new Error('Usage: clone-runtime.mjs preflight|verify ...');
};

const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) {
  main().catch((error) => {
    console.error(`Design Taste Injection: ${error.message}`);
    process.exitCode = 1;
  });
}

export { preflight, validateManifest, validateMaskRects, verify };
