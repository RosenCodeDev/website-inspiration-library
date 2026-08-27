#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, realpathSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { discoverBrowser } from './browser-discovery.mjs';
import { assertContainedPath, canonicalPath } from './path-safety.mjs';

const H0_THRESHOLDS = Object.freeze({ inset: 4, maxQuantizedColors: 12, maxEdgeDensity: 0.02, maxLuminanceStdDev: 12 });
const hashBytes = (bytes) => createHash('sha256').update(bytes).digest('hex');
const unique = (values) => [...new Set(values.filter(Boolean))];
const normalizeText = (value) => String(value ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
const parseBrief = (brief) => Object.fromEntries(String(brief).split(/\r?\n/).map((line) => {
  const separator = line.indexOf(':');
  return separator > 0 ? [line.slice(0, separator).trim(), line.slice(separator + 1).trim()] : null;
}).filter(Boolean).filter(([key]) => key.toLowerCase() !== 'motion'));
const safeId = (value, label) => {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) throw new Error(`${label} is invalid`);
  return value;
};
const assertExactKeys = (value, keys, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  const actual = Object.keys(value).sort(); const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label} contains unexpected or missing fields.`);
};
const assertStringArray = (value, label) => { if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw new Error(`${label} must be a string array.`); };
const assertSealedPayload = (payload, options = {}) => {
  assertExactKeys(payload, ['schemaVersion', 'directionId', 'generationId', 'card', 'reference', 'futureHero', 'placement', 'copyEnvelopes', 'identityExclusions', 'output'], 'sealed payload');
  if (payload.schemaVersion !== 2) throw new Error('Sealed payload schemaVersion must be 2.'); safeId(payload.directionId, 'directionId'); safeId(payload.generationId, 'generationId');
  assertExactKeys(payload.card, ['id', 'name', 'category', 'descriptor', 'styleDescriptor', 'tags', 'observedBrief'], 'sealed payload card');
  for (const key of ['id', 'name', 'category', 'descriptor', 'styleDescriptor']) if (typeof payload.card[key] !== 'string') throw new Error(`sealed payload card.${key} must be a string.`);
  assertStringArray(payload.card.tags, 'sealed payload card.tags'); if (!payload.card.observedBrief || Object.values(payload.card.observedBrief).some((value) => typeof value !== 'string')) throw new Error('sealed payload observedBrief must contain only strings.');
  assertExactKeys(payload.reference, ['stillPath', 'sha256', 'width', 'height', 'qualityTier', 'reliableFor'], 'sealed payload reference');
  if (typeof payload.reference.stillPath !== 'string' || !/^(?:input\/)?reference\.(?:png|jpe?g|webp)$/i.test(payload.reference.stillPath) || !Number.isFinite(payload.reference.width) || !Number.isFinite(payload.reference.height) || payload.reference.width <= 0 || payload.reference.height <= 0 || !['canonical', 'usable'].includes(payload.reference.qualityTier)) throw new Error('Sealed payload reference is invalid.');
  if (options.requireChecksum && !/^[a-f0-9]{64}$/.test(payload.reference.sha256 ?? '')) throw new Error('Sealed payload requires a still checksum.');
  assertStringArray(payload.reference.reliableFor, 'sealed payload reference.reliableFor');
  const futureKeys = payload.futureHero.kind === 'none' ? ['kind', 'noneMode', 'permittedMethod', 'reason'] : ['kind', 'prompt']; assertExactKeys(payload.futureHero, futureKeys, 'sealed payload futureHero');
  if (payload.futureHero.kind === 'none' ? !['code-native', 'authorized-media'].includes(payload.futureHero.noneMode) || typeof payload.futureHero.permittedMethod !== 'string' || typeof payload.futureHero.reason !== 'string' : !['primary', 'supporting'].includes(payload.futureHero.kind) || typeof payload.futureHero.prompt !== 'string') throw new Error('Sealed payload futureHero is invalid.');
  assertExactKeys(payload.placement, ['composition', 'spacing', 'protectedRegions'], 'sealed payload placement');
  if (Object.values(payload.placement).some((value) => typeof value !== 'string')) throw new Error('Sealed payload placement must contain strings.');
  assertExactKeys(payload.copyEnvelopes, ['label', 'headline', 'body', 'primaryAction'], 'sealed payload copyEnvelopes');
  for (const key of Object.keys(payload.copyEnvelopes)) { assertExactKeys(payload.copyEnvelopes[key], ['min', 'max'], `sealed payload copyEnvelopes.${key}`); if (!Number.isInteger(payload.copyEnvelopes[key].min) || !Number.isInteger(payload.copyEnvelopes[key].max) || payload.copyEnvelopes[key].min < 0 || payload.copyEnvelopes[key].max < payload.copyEnvelopes[key].min) throw new Error(`sealed payload copyEnvelopes.${key} is invalid.`); }
  assertExactKeys(payload.identityExclusions, ['exactSignals', 'derivedSignals', 'reviewedSignals', 'knownMarkAssetIds', 'knownAssetHashes', 'reviewFingerprint'], 'sealed payload identityExclusions');
  for (const key of ['exactSignals', 'derivedSignals', 'reviewedSignals', 'knownMarkAssetIds', 'knownAssetHashes']) assertStringArray(payload.identityExclusions[key], `sealed payload identityExclusions.${key}`);
  if (!/^[a-f0-9]{64}$/.test(payload.identityExclusions.reviewFingerprint ?? '') || payload.identityExclusions.knownAssetHashes.some((value) => !/^[a-f0-9]{64}$/.test(value))) throw new Error('Sealed payload identity fingerprints are invalid.');
  assertExactKeys(payload.output, ['scope', 'viewport', 'directory', 'entry', 'h0', 'geometry', 'permittedFiles'], 'sealed payload output'); assertExactKeys(payload.output.viewport, ['width', 'height'], 'sealed payload viewport'); assertStringArray(payload.output.permittedFiles, 'sealed payload permittedFiles');
  if (payload.output.scope !== 'hero-and-opening-module' || payload.output.directory !== 'output' || payload.output.entry !== 'index.html' || JSON.stringify(payload.output.permittedFiles) !== JSON.stringify(['index.html', 'styles.css', 'script.js', 'assets/*']) || !['code-native', 'reserved-image-hole-with-flat-stand-in'].includes(payload.output.h0) || payload.output.viewport.width <= 0 || payload.output.viewport.height <= 0) throw new Error('Sealed payload output contract is invalid.');
  if (payload.output.geometry) { assertExactKeys(payload.output.geometry, ['aspectRatio', 'aspectTolerance', 'alignment', 'minWidthRatio', 'minHeightRatio'], 'sealed payload geometry'); if (!['left', 'center', 'right', 'full', 'unconstrained'].includes(payload.output.geometry.alignment) || Object.entries(payload.output.geometry).filter(([key]) => key !== 'alignment').some(([, value]) => !Number.isFinite(value) || value <= 0)) throw new Error('Sealed payload geometry is invalid.'); }
  return true;
};
const sourceIdentitySignals = (identity) => unique([
  ...(identity?.derived?.sourceNames ?? []), ...(identity?.derived?.aliases ?? []), ...(identity?.derived?.domains ?? []),
  ...(identity?.reviewed?.exactCopy ?? []), ...(identity?.reviewed?.distinctiveClaims ?? []), ...(identity?.reviewed?.characters ?? []),
  ...(identity?.reviewed?.products ?? []), ...(identity?.reviewed?.people ?? []), ...(identity?.reviewed?.packaging ?? []),
  ...(identity?.reviewed?.interfaceFragments ?? []), ...(identity?.reviewed?.sourceSpecificExclusions ?? []),
]);
const sourceIdentityReviewedSignals = (identity) => unique(Object.values(identity?.reviewed ?? {}).flat().filter((value) => typeof value === 'string'));
const sourceIdentityScanSignals = (identity) => sourceIdentitySignals(identity).filter((value) => {
  const normalized = normalizeText(value); return normalized.includes('.') || normalized.split(/\s+/).filter(Boolean).length >= 2;
});
const assertReviewedIdentity = (card) => {
  if (card?.sourceIdentity?.review?.reviewStatus !== 'reviewed') throw new Error(`Card identity inventory is not reviewed: ${card?.id ?? '(missing)'}`);
  if (card.identityReviewFresh !== true || card.sourceIdentity.review.reviewFingerprint !== card.identityReviewFingerprint) throw new Error(`Card identity review is stale: ${card.id}`);
};
const geometryFromCard = (card, futureHero) => {
  const guidance = `${futureHero.prompt ?? futureHero.reason ?? ''} ${card.brief ?? ''}`.toLowerCase();
  const ratioMatch = guidance.match(/\b(\d{1,2})\s*:\s*(\d{1,2})\b/);
  const aspectRatio = ratioMatch ? Number(ratioMatch[1]) / Number(ratioMatch[2]) : card.quality.width / card.quality.height;
  const alignment = /full[- ]bleed|fills? the (?:entire|whole) (?:hero|field|viewport)/.test(guidance) ? 'full'
    : /right[- ]half|center[- ]right|lower right|right side|to the right/.test(guidance) ? 'right'
      : /left[- ]half|center[- ]left|lower left|left side|to the left/.test(guidance) ? 'left'
        : /\bcenter(?:ed| it)?\b|lower-middle|upper-middle/.test(guidance) ? 'center' : 'unconstrained';
  return { aspectRatio: Number(aspectRatio.toFixed(4)), aspectTolerance: 0.18, alignment, minWidthRatio: alignment === 'full' ? 0.75 : 0.28, minHeightRatio: 0.2 };
};

const buildSealedPayload = (card, options = {}) => {
  if (!card || typeof card !== 'object') throw new Error('A selected card record is required.');
  assertReviewedIdentity(card);
  const directionId = safeId(options.directionId ?? 'D01', 'directionId');
  const generationId = safeId(options.generationId ?? `${directionId}-H0`, 'generationId');
  const observedBrief = parseBrief(card.brief);
  const futureHero = card.imageRecipe.kind === 'none'
    ? { kind: 'none', noneMode: card.imageRecipe.noneMode, permittedMethod: card.imageRecipe.permittedMethod, reason: card.imageRecipe.reason }
    : { kind: card.imageRecipe.kind, prompt: card.imageRecipe.prompt };
  const h0 = futureHero.kind === 'none' && futureHero.noneMode === 'code-native' ? 'code-native' : 'reserved-image-hole-with-flat-stand-in';
  const payload = {
    schemaVersion: 2, directionId, generationId,
    card: { id: card.id, name: card.title, category: card.primaryCategory, descriptor: card.cardDescriptor, styleDescriptor: card.styleDescriptor, tags: [...card.tags], observedBrief },
    reference: { stillPath: options.stillPath ?? `reference${extname(card.media.detailImage) || '.png'}`, sha256: options.sha256 ?? null, width: card.quality.width, height: card.quality.height, qualityTier: card.quality.tier, reliableFor: [...card.quality.reliableFor] },
    futureHero,
    placement: { composition: observedBrief.Composition ?? '', spacing: observedBrief.Spacing ?? '', protectedRegions: futureHero.kind === 'none' ? futureHero.reason : futureHero.prompt },
    copyEnvelopes: { label: { min: 0, max: 24 }, headline: { min: 18, max: 56 }, body: { min: 60, max: 180 }, primaryAction: { min: 4, max: 20 } },
    identityExclusions: {
      exactSignals: sourceIdentitySignals(card.sourceIdentity), derivedSignals: unique([...card.sourceIdentity.derived.sourceNames, ...card.sourceIdentity.derived.aliases, ...card.sourceIdentity.derived.domains]), reviewedSignals: sourceIdentityReviewedSignals(card.sourceIdentity), knownMarkAssetIds: [...card.sourceIdentity.reviewed.knownMarkAssetIds],
      knownAssetHashes: unique([...card.sourceIdentity.derived.assetHashes, ...card.sourceIdentity.reviewed.knownMarkAssetHashes]), reviewFingerprint: card.identityReviewFingerprint,
    },
    output: { scope: 'hero-and-opening-module', viewport: options.viewport ?? { width: 1440, height: 1000 }, directory: 'output', entry: 'index.html', h0, geometry: h0 === 'code-native' ? null : geometryFromCard(card, futureHero), permittedFiles: ['index.html', 'styles.css', 'script.js', 'assets/*'] },
  };
  const serialized = JSON.stringify(payload);
  for (const forbidden of ['categoryProfile', 'categoryConstitution', 'projectName', 'productName', 'industry', 'audience', 'brandColors', 'motionClip', 'motionNotes']) if (serialized.includes(`"${forbidden}"`)) throw new Error(`Sealed payload contains forbidden field: ${forbidden}`);
  assertSealedPayload(payload); return payload;
};
const renderVisualPrompt = (payload) => {
  const briefLines = Object.entries(payload.card.observedBrief).map(([key, value]) => `${key}: ${value}`).join('\n');
  const hero = payload.futureHero.kind === 'none' ? `Build or reserve media exactly as reviewed: ${payload.futureHero.reason}` : payload.futureHero.prompt;
  const h0Instruction = payload.output.h0 === 'code-native'
    ? `Mark the defining reviewed code-native visual with data-code-native-hero="${payload.futureHero.permittedMethod}" and use only that reviewed method. Do not invent protected products, interfaces, people, packaging, or source identity.`
    : 'Mark the hero with data-inspiration-hero, put copy in a sibling data-protected-copy-region, and create one empty data-future-image-slot with an opaque flat stand-in. The copy may overlap geometrically but may not be nested in the slot. Do not use CSS, SVG, canvas, fog, dithering, gradients, crop marks, or decorative code art as the missing image.';
  return [
    'AESTHETIC', `${payload.card.descriptor}\n${payload.card.styleDescriptor}\nTags: ${payload.card.tags.join(', ')}\n${briefLines}`, '',
    'REFERENCE', `Inspect the attached canonical still for ${payload.card.id}. Match its visual relationships and feel, not its content or identity. Do not inspect any motion media.`, '',
    'FUTURE HERO', hero, '',
    'PLACEMENT', `Composition: ${payload.placement.composition}\nSpacing: ${payload.placement.spacing}\nProtected regions and crop: ${payload.placement.protectedRegions}`, '',
    'OUTPUT CONTRACT', `Build exactly one polished hero and one opening module at ${payload.output.viewport.width}×${payload.output.viewport.height}. Mark them data-inspiration-hero and data-opening-module. Return only permitted local files under ${payload.output.directory}/. Do not create output-contract.json; the coordinator owns validation evidence.`,
    h0Instruction, payload.output.geometry ? `Reserved-slot geometry contract: ${JSON.stringify(payload.output.geometry)}.` : '', `Use neutral placeholder copy within these character envelopes: ${JSON.stringify(payload.copyEnvelopes)}.`,
    `Exclude these reviewed source identities exactly: ${payload.identityExclusions.exactSignals.join(' | ') || 'none recorded'}. Do not reproduce known source marks or assets.`,
  ].join('\n');
};
const constitutionSentences = (profile) => Object.values(profile ?? {}).filter((value) => typeof value === 'string' && value.trim());
const assertNoConstitution = (payload, prompt, profile) => {
  const serialized = `${JSON.stringify(payload)}\n${prompt}`;
  if (Object.hasOwn(payload, 'categoryProfile') || Object.hasOwn(payload, 'categoryConstitution')) throw new Error('Sealed payload contains a category constitution object.');
  for (const sentence of constitutionSentences(profile)) if (normalizeText(serialized).includes(normalizeText(sentence))) throw new Error(`Sealed visual brief contains an exact category-constitution sentence: ${sentence}`);
  return true;
};
const buildLeakSignals = (intake) => {
  const groups = ['companyNames', 'productNames', 'audiencePhrases', 'domains', 'urls', 'distinctiveClaims', 'slogans', 'brandColorNames', 'brandHexValues'];
  const signals = [];
  for (const group of groups) for (const value of intake?.[group] ?? []) if (typeof value === 'string' && value.trim()) signals.push({ group, value: value.trim(), normalized: normalizeText(value) });
  return { schemaVersion: 1, signals: unique(signals.map((item) => `${item.group}\0${item.normalized}`)).map((key) => {
    const [group, normalized] = key.split('\0'); const source = signals.find((item) => item.group === group && item.normalized === normalized); return { group, value: source.value, normalized };
  }) };
};
const scanExactSignals = (value, signalDocument) => {
  const haystack = normalizeText(typeof value === 'string' ? value : JSON.stringify(value));
  return (signalDocument?.signals ?? []).filter((signal) => signal.normalized && haystack.includes(signal.normalized));
};
const scanSourceIdentity = (value, identity) => scanExactSignals(value, { signals: sourceIdentityScanSignals(identity).map((signal) => ({ group: 'sourceIdentity', value: signal, normalized: normalizeText(signal) })) });

const resolveEvidence = async (catalog, projectRoot, cardId) => {
  const card = catalog.cards.find((item) => item.id === cardId);
  if (!card) throw new Error(`Unknown card: ${cardId}`);
  assertReviewedIdentity(card);
  if (!card.media?.detailImage || card.quality?.width <= 0 || card.quality?.height <= 0) throw new Error(`Card has no usable canonical still: ${cardId}`);
  const libraryRoot = canonicalPath(catalog.libraryRoot); const project = canonicalPath(projectRoot);
  if (project === libraryRoot) throw new Error('Evidence cannot be written into the inspiration-library repository.');
  const source = resolve(catalog.publicAssetRoot, card.media.detailImage.replace(/^[/\\]+/, ''));
  assertContainedPath(source, catalog.publicAssetRoot);
  if (!existsSync(source) || !(await stat(source)).isFile()) throw new Error(`Canonical still is missing: ${card.media.detailImage}`);
  const bytes = await readFile(source); const sha256 = hashBytes(bytes);
  if (!card.sourceIdentity.derived.assetHashes.includes(sha256)) throw new Error(`Canonical still hash is not represented in reviewed identity metadata: ${cardId}`);
  const evidenceRoot = resolve(project, '.inspiration', 'evidence'); assertContainedPath(evidenceRoot, project); await mkdir(evidenceRoot, { recursive: true });
  const extension = extname(source).toLowerCase() || '.png'; const destination = resolve(evidenceRoot, `${card.id}-${sha256.slice(0, 16)}${extension}`); assertContainedPath(destination, evidenceRoot);
  if (!existsSync(destination)) await writeFile(destination, bytes);
  const record = { schemaVersion: 2, cardId: card.id, cardName: card.title, file: basename(destination), sha256, width: card.quality.width, height: card.quality.height, qualityTier: card.quality.tier, identityReviewFingerprint: card.identityReviewFingerprint, inspected: false, resolvedAt: new Date().toISOString() };
  await writeFile(resolve(evidenceRoot, `${card.id}-${sha256.slice(0, 16)}.json`), `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return { card, source, destination, record };
};
const walk = async (root, directory = root, output = []) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) { const path = resolve(directory, entry.name); if (entry.isDirectory()) await walk(root, path, output); else if (entry.isFile()) output.push({ path, relativePath: relative(root, path).replaceAll('\\', '/') }); }
  return output;
};
const validatePreviewTree = async (outputRoot) => {
  const root = canonicalPath(outputRoot); const entry = resolve(root, 'index.html'); assertContainedPath(entry, root);
  if (!existsSync(entry) || !(await stat(entry)).isFile()) throw new Error('Isolated output is missing index.html.');
  const files = await walk(root); const allowed = /^(?:index\.html|styles\.css|script\.js|assets\/[A-Za-z0-9._/-]+)$/;
  for (const file of files) {
    if (file.relativePath === 'output-contract.json') throw new Error('Generated output may not supply coordinator-owned output-contract.json.');
    if (!allowed.test(file.relativePath) || file.relativePath.includes('..')) throw new Error(`Unexpected preview output: ${file.relativePath}`);
  }
  const textFiles = files.filter((file) => /\.(?:html|css|js|json|svg)$/i.test(file.relativePath));
  const combined = (await Promise.all(textFiles.map((file) => readFile(file.path, 'utf8')))).join('\n');
  if (/(?:file:\/\/|[A-Za-z]:\\|https?:\/\/)/i.test(combined)) throw new Error('Preview contains an absolute filesystem path or external URL.');
  return { root, entry, files, combined };
};
const loadRuntimePackage = async (name) => {
  try { return await import(name); } catch (initialError) {
    try { return createRequire(import.meta.url)(name); } catch {
      const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
      const configPath = resolve(skillRoot, 'config', 'library.json');
      const configuredRoot = process.env.DESIGN_TASTE_LIBRARY_ROOT
        ?? (existsSync(configPath) ? JSON.parse(await readFile(configPath, 'utf8')).libraryRoot : null);
      if (!configuredRoot) throw initialError;
      return createRequire(resolve(configuredRoot, 'package.json'))(name);
    }
  }
};
const pixelMetrics = async (buffer) => {
  const pngModule = await loadRuntimePackage('pngjs'); const PNG = pngModule.PNG ?? pngModule.default?.PNG; const image = PNG.sync.read(buffer);
  const luminance = new Float64Array(image.width * image.height); const colors = new Set(); let sum = 0;
  for (let index = 0, pixel = 0; index < image.data.length; index += 4, pixel += 1) {
    const r = image.data[index]; const g = image.data[index + 1]; const b = image.data[index + 2]; const y = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
    luminance[pixel] = y; sum += y; colors.add(`${Math.round(r / 16)},${Math.round(g / 16)},${Math.round(b / 16)}`);
  }
  const mean = sum / luminance.length; let variance = 0; let edges = 0; let tested = 0;
  for (let y = 1; y < image.height - 1; y += 1) for (let x = 1; x < image.width - 1; x += 1) {
    const at = (dx, dy) => luminance[((y + dy) * image.width) + x + dx];
    const gx = -at(-1, -1) + at(1, -1) - (2 * at(-1, 0)) + (2 * at(1, 0)) - at(-1, 1) + at(1, 1);
    const gy = -at(-1, -1) - (2 * at(0, -1)) - at(1, -1) + at(-1, 1) + (2 * at(0, 1)) + at(1, 1);
    if (Math.hypot(gx, gy) > 30) edges += 1; tested += 1;
  }
  for (const value of luminance) variance += (value - mean) ** 2;
  return { width: image.width, height: image.height, quantizedColors: colors.size, edgeDensity: tested ? edges / tested : 0, luminanceStdDev: Math.sqrt(variance / luminance.length) };
};
const assertFlatMetrics = (metrics) => {
  if (metrics.quantizedColors > H0_THRESHOLDS.maxQuantizedColors) throw new Error(`Future image slot is too visually complex: ${metrics.quantizedColors} quantized colors.`);
  if (metrics.edgeDensity > H0_THRESHOLDS.maxEdgeDensity) throw new Error(`Future image slot contains code-art edges: ${(metrics.edgeDensity * 100).toFixed(2)}%.`);
  if (metrics.luminanceStdDev > H0_THRESHOLDS.maxLuminanceStdDev) throw new Error(`Future image slot luminance variation is too high: ${metrics.luminanceStdDev.toFixed(2)}.`);
};
const validateRenderedH0 = async (outputRoot, options = {}) => {
  const root = canonicalPath(outputRoot); const browserPath = options.browserPath ?? discoverBrowser();
  if (!browserPath) throw new Error('H0 validation requires Chrome, Edge, or Chromium. Set DESIGN_TASTE_BROWSER_PATH.');
  const playwright = await loadRuntimePackage('playwright-core'); const chromium = playwright.chromium ?? playwright.default?.chromium; const viewport = options.viewport ?? { width: 1440, height: 1000 };
  const browser = await chromium.launch({ executablePath: browserPath, headless: true });
  try {
    const page = await browser.newPage({ viewportSize: viewport, deviceScaleFactor: 1 }); await page.goto(pathToFileURL(resolve(root, 'index.html')).href, { waitUntil: 'load' });
    const observed = await page.evaluate((expectedH0) => {
      const heroes = [...document.querySelectorAll('[data-inspiration-hero]')]; const openings = [...document.querySelectorAll('[data-opening-module]')];
      const slots = [...document.querySelectorAll('[data-future-image-slot]')]; const codeNative = [...document.querySelectorAll('[data-code-native-hero]')];
      if (heroes.length !== 1) throw new Error('H0 requires exactly one data-inspiration-hero.'); if (openings.length !== 1) throw new Error('H0 requires exactly one data-opening-module.');
      if (expectedH0 === 'code-native') {
        if (codeNative.length !== 1 || !heroes[0].contains(codeNative[0])) throw new Error('Code-native H0 requires one data-code-native-hero inside the hero.');
        const node = codeNative[0]; const rect = node.getBoundingClientRect(); const style = getComputedStyle(node);
        if (!node.getAttribute('data-code-native-hero') || rect.width < 240 || rect.height < 160) throw new Error('Code-native H0 must identify a visible defining visual and reviewed method.');
        if (!node.children.length && !node.textContent.trim() && ['transparent', 'rgba(0, 0, 0, 0)'].includes(style.backgroundColor) && style.backgroundImage === 'none') throw new Error('Code-native H0 marker does not contain a defining visual.');
        return { heroCount: 1, openingModuleCount: 1, slotCount: slots.length, codeNativeCount: 1, codeNativeMethod: node.getAttribute('data-code-native-hero') };
      }
      if (slots.length !== 1 || !heroes[0].contains(slots[0])) throw new Error('Image-led H0 requires exactly one data-future-image-slot inside the hero.');
      const slot = slots[0]; if (slot.children.length || slot.textContent.trim()) throw new Error('The future image slot must be empty.');
      if (slot.querySelector('img,picture,video,svg,canvas,iframe,object,embed')) throw new Error('The future image slot contains forbidden media or code art.');
      const copyRegions = [...heroes[0].querySelectorAll('[data-protected-copy-region]')]; if (!copyRegions.length) throw new Error('Image-led H0 requires a sibling data-protected-copy-region.');
      if (copyRegions.some((copy) => slot.contains(copy) || copy.contains(slot))) throw new Error('Protected copy and future image slot must be siblings, not nested.');
      const style = getComputedStyle(slot); const before = getComputedStyle(slot, '::before'); const after = getComputedStyle(slot, '::after'); const rect = slot.getBoundingClientRect();
      const opaque = !/rgba\([^)]*,\s*0(?:\.0+)?\s*\)/i.test(style.backgroundColor) && style.backgroundColor !== 'transparent';
      const absent = (value) => !value || value === 'none';
      const noImage = [style, before, after].every((item) => absent(item.backgroundImage) && absent(item.maskImage) && absent(item.webkitMaskImage));
      const noEffects = absent(style.filter) && absent(style.backdropFilter) && absent(style.webkitBackdropFilter) && absent(style.animationName) && Number(style.opacity) === 1;
      const pseudoEmpty = [before, after].every((item) => ['none', 'normal', '""'].includes(item.content));
      if (!opaque || !noImage || !noEffects || !pseudoEmpty) throw new Error('Future image slot computed styles are not an opaque flat stand-in.');
      if (rect.width < 240 || rect.height < 160) throw new Error('Future image slot is too small to preserve intended media geometry.');
      return { heroCount: 1, openingModuleCount: 1, slotCount: 1, codeNativeCount: codeNative.length, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } };
    }, options.expectedH0 ?? 'reserved-image-hole-with-flat-stand-in');
    if ((options.expectedH0 ?? 'reserved-image-hole-with-flat-stand-in') === 'code-native' && (!options.expectedCodeNativeMethod || observed.codeNativeMethod !== options.expectedCodeNativeMethod)) throw new Error('Code-native H0 does not match the reviewed permitted method.');
    let slotMetrics = null; let geometry = null;
    if ((options.expectedH0 ?? 'reserved-image-hole-with-flat-stand-in') !== 'code-native') {
      await page.evaluate(() => document.querySelectorAll('[data-protected-copy-region]').forEach((node) => { node.dataset.validationVisibility = node.style.visibility; node.style.visibility = 'hidden'; }));
      const rect = observed.rect; const inset = H0_THRESHOLDS.inset;
      const buffer = await page.screenshot({ clip: { x: rect.x + inset, y: rect.y + inset, width: rect.width - (inset * 2), height: rect.height - (inset * 2) }, animations: 'disabled' });
      await page.evaluate(() => document.querySelectorAll('[data-protected-copy-region]').forEach((node) => { node.style.visibility = node.dataset.validationVisibility ?? ''; delete node.dataset.validationVisibility; }));
      slotMetrics = await pixelMetrics(buffer); assertFlatMetrics(slotMetrics);
      if (options.expectedGeometry) {
        const expected = options.expectedGeometry; const actualRatio = rect.width / rect.height; const center = (rect.x + (rect.width / 2)) / viewport.width;
        geometry = { expected, observed: { aspectRatio: actualRatio, widthRatio: rect.width / viewport.width, heightRatio: rect.height / viewport.height, horizontalCenterRatio: center } };
        if (Math.abs(actualRatio - expected.aspectRatio) / expected.aspectRatio > expected.aspectTolerance) throw new Error(`Future image slot aspect ratio ${actualRatio.toFixed(3)} does not match recipe-derived ratio ${expected.aspectRatio}.`);
        if (geometry.observed.widthRatio < expected.minWidthRatio || geometry.observed.heightRatio < expected.minHeightRatio) throw new Error('Future image slot does not meet recipe-derived viewport-relative dimensions.');
        if (expected.alignment === 'right' && center < 0.52) throw new Error('Future image slot does not occupy the recipe-derived right side.');
        if (expected.alignment === 'left' && center > 0.48) throw new Error('Future image slot does not occupy the recipe-derived left side.');
        if (expected.alignment === 'center' && (center < 0.35 || center > 0.65)) throw new Error('Future image slot is not centered as required by the recipe.');
        if (expected.alignment === 'full' && geometry.observed.widthRatio < 0.75) throw new Error('Future image slot is not full-bleed as required by the recipe.');
      }
    }
    const finalScreenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
    return { observed, slotMetrics, geometry, finalScreenshot, thresholds: H0_THRESHOLDS };
  } finally { await browser.close(); }
};
const scanKnownAssetHashes = async (files, identity) => {
  const forbidden = new Set([...(identity?.derived?.assetHashes ?? []), ...(identity?.reviewed?.knownMarkAssetHashes ?? [])]); const matches = [];
  for (const file of files) { const sha256 = hashBytes(await readFile(file.path)); if (forbidden.has(sha256)) matches.push({ path: file.relativePath, sha256 }); }
  return matches;
};
const importPreview = async (temporaryOutputRoot, projectRoot, generationId, guards = {}) => {
  safeId(generationId, 'generationId'); if (!guards.anchorCardId || !guards.expectedH0) throw new Error('Preview import requires coordinator-owned anchorCardId and expectedH0.');
  if (guards.expectedH0 !== 'code-native' && !guards.expectedGeometry) throw new Error('Image-led preview import requires coordinator-owned recipe geometry.');
  if (guards.expectedH0 === 'code-native' && !guards.expectedCodeNativeMethod) throw new Error('Code-native preview import requires the reviewed permitted method.');
  const validated = await validatePreviewTree(temporaryOutputRoot); const intakeMatches = scanExactSignals(validated.combined, guards.leakSignals);
  if (intakeMatches.length) throw new Error(`Preview contains intake leak signal: ${intakeMatches[0].value}`);
  const identityMatches = scanSourceIdentity(validated.combined, guards.sourceIdentity); if (identityMatches.length) throw new Error(`Preview contains source identity signal: ${identityMatches[0].value}`);
  const assetMatches = await scanKnownAssetHashes(validated.files, guards.sourceIdentity); if (assetMatches.length) throw new Error(`Preview contains a reviewed source asset hash: ${assetMatches[0].path}`);
  const rendered = await validateRenderedH0(temporaryOutputRoot, { expectedH0: guards.expectedH0, expectedGeometry: guards.expectedGeometry, expectedCodeNativeMethod: guards.expectedCodeNativeMethod, viewport: guards.viewport, browserPath: guards.browserPath });
  const contract = { schemaVersion: 2, scope: 'hero-and-opening-module', anchorCardId: guards.anchorCardId, supportingCardIds: [], sourceStillInspected: guards.sourceStillInspected === true, motionMediaUsed: false, heroCount: rendered.observed.heroCount, openingModuleCount: rendered.observed.openingModuleCount, h0Mode: guards.expectedH0, validator: { thresholds: rendered.thresholds, slotMetrics: rendered.slotMetrics, geometry: rendered.geometry, observed: rendered.observed } };
  if (!contract.sourceStillInspected) throw new Error('Coordinator evidence does not prove the selected still was inspected.');
  await writeFile(resolve(validated.root, 'output-contract.json'), `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
  const previewsRoot = resolve(canonicalPath(projectRoot), '.inspiration', 'previews'); const destination = resolve(previewsRoot, generationId); assertContainedPath(destination, previewsRoot);
  if (existsSync(destination)) throw new Error(`Preview destination already exists: ${generationId}`); await mkdir(previewsRoot, { recursive: true });
  const staging = `${destination}.importing-${process.pid}-${Date.now()}`; await cp(temporaryOutputRoot, staging, { recursive: true, force: false, errorOnExist: true });
  try { await rename(staging, destination); } catch (error) { await rm(staging, { recursive: true, force: true }); throw error; }
  return { destination, preview: `../previews/${generationId}/index.html`, files: [...validated.files.map((file) => file.relativePath), 'output-contract.json'], contract };
};

const main = async () => {
  const [command, first, second] = process.argv.slice(2);
  if (command === 'leak-signals') { const intake = JSON.parse(await readFile(resolve(first), 'utf8')); await writeFile(resolve(second), `${JSON.stringify(buildLeakSignals(intake), null, 2)}\n`, 'utf8'); return; }
  if (command === 'validate-preview') return console.log(JSON.stringify(await validatePreviewTree(resolve(first)), null, 2));
  if (command === 'validate-h0') return console.log(JSON.stringify(await validateRenderedH0(resolve(first), { expectedH0: second }), (key, value) => key === 'finalScreenshot' ? undefined : value, 2));
  throw new Error('Usage: visual-contract.mjs leak-signals <intake.json> <output.json> | validate-preview <output-root> | validate-h0 <output-root> <h0-mode>');
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Visual contract: ${error.message}`); process.exitCode = 1; });

export { H0_THRESHOLDS, assertNoConstitution, assertReviewedIdentity, assertSealedPayload, buildLeakSignals, buildSealedPayload, importPreview, normalizeText, parseBrief, pixelMetrics, renderVisualPrompt, resolveEvidence, scanExactSignals, scanSourceIdentity, sourceIdentityScanSignals, sourceIdentitySignals, validatePreviewTree, validateRenderedH0 };
