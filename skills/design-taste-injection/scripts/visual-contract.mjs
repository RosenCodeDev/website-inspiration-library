#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertContainedPath, canonicalPath } from './path-safety.mjs';

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
const sourceIdentitySignals = (sourceIdentity) => unique([
  ...(sourceIdentity?.sourceNames ?? []),
  ...(sourceIdentity?.aliases ?? []),
  ...(sourceIdentity?.domains ?? []),
  ...(sourceIdentity?.exactCopy ?? []),
  ...(sourceIdentity?.distinctiveClaims ?? []),
  ...(sourceIdentity?.sourceSpecificExclusions ?? []),
]);

const buildSealedPayload = (card, options = {}) => {
  if (!card || typeof card !== 'object') throw new Error('A selected card record is required.');
  const directionId = safeId(options.directionId ?? 'D01', 'directionId');
  const generationId = safeId(options.generationId ?? `${directionId}-H0`, 'generationId');
  const observedBrief = parseBrief(card.brief);
  const futureHero = card.imageRecipe.kind === 'none'
    ? { kind: 'none', reason: card.imageRecipe.reason }
    : { kind: card.imageRecipe.kind, prompt: card.imageRecipe.prompt };
  const payload = {
    schemaVersion: 1,
    directionId,
    generationId,
    card: {
      id: card.id,
      name: card.title,
      category: card.primaryCategory,
      descriptor: card.cardDescriptor,
      styleDescriptor: card.styleDescriptor,
      tags: [...card.tags],
      observedBrief,
    },
    reference: {
      stillPath: options.stillPath ?? `input/reference${extname(card.media.detailImage) || '.png'}`,
      sha256: options.sha256 ?? null,
      width: card.quality.width,
      height: card.quality.height,
      qualityTier: card.quality.tier,
      reliableFor: [...card.quality.reliableFor],
    },
    futureHero,
    placement: {
      composition: observedBrief.Composition ?? '',
      spacing: observedBrief.Spacing ?? '',
      protectedRegions: futureHero.kind === 'none' ? futureHero.reason : futureHero.prompt,
    },
    copyEnvelopes: {
      label: { min: 0, max: 24 },
      headline: { min: 18, max: 56 },
      body: { min: 60, max: 180 },
      primaryAction: { min: 4, max: 20 },
    },
    identityExclusions: {
      exactSignals: sourceIdentitySignals(card.sourceIdentity),
      knownMarkAssetIds: [...(card.sourceIdentity?.knownMarkAssetIds ?? [])],
    },
    output: {
      scope: 'hero-and-opening-module',
      viewport: options.viewport ?? { width: 1440, height: 1000 },
      directory: 'output',
      entry: 'index.html',
      manifest: 'output-contract.json',
      h0: futureHero.kind === 'none' ? 'follow-reviewed-none-reason' : 'reserved-image-hole-with-flat-stand-in',
      permittedFiles: ['index.html', 'styles.css', 'script.js', 'output-contract.json', 'assets/*'],
    },
  };
  const serialized = JSON.stringify(payload);
  for (const forbidden of ['categoryProfile', 'categoryConstitution', 'projectName', 'productName', 'industry', 'audience', 'brandColors', 'motionClip', 'motionNotes']) {
    if (serialized.includes(`"${forbidden}"`)) throw new Error(`Sealed payload contains forbidden field: ${forbidden}`);
  }
  return payload;
};
const renderVisualPrompt = (payload) => {
  const briefLines = Object.entries(payload.card.observedBrief).map(([key, value]) => `${key}: ${value}`).join('\n');
  const hero = payload.futureHero.kind === 'none'
    ? `Build or reserve media exactly as reviewed: ${payload.futureHero.reason}`
    : payload.futureHero.prompt;
  return [
    'AESTHETIC',
    `${payload.card.descriptor}\n${payload.card.styleDescriptor}\nTags: ${payload.card.tags.join(', ')}\n${briefLines}`,
    '',
    'REFERENCE',
    `Inspect ${payload.reference.stillPath}. Match its visual relationships and feel, not its content or identity. Do not inspect any motion media.`,
    '',
    'FUTURE HERO',
    hero,
    '',
    'PLACEMENT',
    `Composition: ${payload.placement.composition}\nSpacing: ${payload.placement.spacing}\nProtected regions and crop: ${payload.placement.protectedRegions}`,
    '',
    'OUTPUT CONTRACT',
    `Build exactly one polished hero and one opening module at ${payload.output.viewport.width}×${payload.output.viewport.height}. Write only permitted local files under ${payload.output.directory}/. Include ${payload.output.manifest} recording one anchor (${payload.card.id}), no supporting cards, sourceStillInspected=true, motionMediaUsed=false, heroCount=1, openingModuleCount=1, h0Mode=${payload.output.h0}, and decorativeCodeArtUsedAsFutureImage=false.`,
    payload.output.h0 === 'reserved-image-hole-with-flat-stand-in'
      ? 'H0 must reserve the future image geometry with a flat quiet stand-in. Do not replace the missing image with CSS, SVG, canvas scenery, fog, crop marks, dithering, gradients, or decorative code art.'
      : 'Follow the reviewed kind:none reason. Build code-native geometry only when it calls for code; otherwise reserve a neutral correctly proportioned media slot.',
    `Use neutral placeholder copy within these character envelopes: ${JSON.stringify(payload.copyEnvelopes)}.`,
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
    const [group, normalized] = key.split('\0');
    const source = signals.find((item) => item.group === group && item.normalized === normalized);
    return { group, value: source.value, normalized };
  }) };
};
const scanExactSignals = (value, signalDocument) => {
  const haystack = normalizeText(typeof value === 'string' ? value : JSON.stringify(value));
  return (signalDocument?.signals ?? []).filter((signal) => signal.normalized && haystack.includes(signal.normalized));
};
const scanSourceIdentity = (value, sourceIdentity) => scanExactSignals(value, {
  signals: sourceIdentitySignals(sourceIdentity).map((signal) => ({ group: 'sourceIdentity', value: signal, normalized: normalizeText(signal) })),
});
const resolveEvidence = async (catalog, projectRoot, cardId) => {
  const card = catalog.cards.find((item) => item.id === cardId);
  if (!card) throw new Error(`Unknown card: ${cardId}`);
  if (!stillUsableCard(card)) throw new Error(`Card has no usable canonical still: ${cardId}`);
  const libraryRoot = canonicalPath(catalog.libraryRoot);
  const project = canonicalPath(projectRoot);
  if (project === libraryRoot) throw new Error('Evidence cannot be written into the inspiration-library repository.');
  const source = resolve(catalog.publicAssetRoot, card.media.detailImage.replace(/^[/\\]+/, ''));
  assertContainedPath(source, catalog.publicAssetRoot);
  if (!existsSync(source) || !(await stat(source)).isFile()) throw new Error(`Canonical still is missing: ${card.media.detailImage}`);
  const bytes = await readFile(source);
  const sha256 = hashBytes(bytes);
  const evidenceRoot = resolve(project, '.inspiration', 'evidence');
  assertContainedPath(evidenceRoot, project);
  await mkdir(evidenceRoot, { recursive: true });
  const extension = extname(source).toLowerCase() || '.png';
  const destination = resolve(evidenceRoot, `${card.id}-${sha256.slice(0, 16)}${extension}`);
  assertContainedPath(destination, evidenceRoot);
  if (!existsSync(destination)) await writeFile(destination, bytes);
  const record = {
    schemaVersion: 1,
    cardId: card.id,
    cardName: card.title,
    file: basename(destination),
    sha256,
    width: card.quality.width,
    height: card.quality.height,
    qualityTier: card.quality.tier,
    inspected: false,
    resolvedAt: new Date().toISOString(),
  };
  await writeFile(resolve(evidenceRoot, `${card.id}-${sha256.slice(0, 16)}.json`), `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return { card, source, destination, record };
};
const stillUsableCard = (card) => Boolean(card?.media?.detailImage && card?.quality?.width > 0 && card?.quality?.height > 0);
const walk = async (root, directory = root, output = []) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(root, path, output);
    else if (entry.isFile()) output.push({ path, relativePath: relative(root, path).replaceAll('\\', '/') });
  }
  return output;
};
const validatePreviewTree = async (outputRoot) => {
  const root = canonicalPath(outputRoot);
  const entry = resolve(root, 'index.html');
  assertContainedPath(entry, root);
  if (!existsSync(entry) || !(await stat(entry)).isFile()) throw new Error('Isolated output is missing index.html.');
  const files = await walk(root);
  const allowed = /^(?:index\.html|styles\.css|script\.js|output-contract\.json|assets\/[A-Za-z0-9._/-]+)$/;
  for (const file of files) if (!allowed.test(file.relativePath) || file.relativePath.includes('..')) throw new Error(`Unexpected preview output: ${file.relativePath}`);
  const textFiles = files.filter((file) => file.relativePath !== 'output-contract.json' && /\.(?:html|css|js|json|svg)$/i.test(file.relativePath));
  const combined = (await Promise.all(textFiles.map((file) => readFile(file.path, 'utf8')))).join('\n');
  if (/(?:file:\/\/|[A-Za-z]:\\|https?:\/\/)/i.test(combined)) throw new Error('Preview contains an absolute filesystem path or external URL.');
  const manifestPath = resolve(root, 'output-contract.json');
  if (!existsSync(manifestPath)) throw new Error('Isolated output is missing output-contract.json.');
  const contract = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (contract?.schemaVersion !== 1 || contract.scope !== 'hero-and-opening-module'
    || typeof contract.anchorCardId !== 'string' || !contract.anchorCardId
    || !Array.isArray(contract.supportingCardIds) || contract.supportingCardIds.length !== 0
    || contract.sourceStillInspected !== true || contract.motionMediaUsed !== false
    || contract.heroCount !== 1 || contract.openingModuleCount !== 1
    || !['reserved-image-hole-with-flat-stand-in', 'follow-reviewed-none-reason'].includes(contract.h0Mode)
    || contract.decorativeCodeArtUsedAsFutureImage !== false) {
    throw new Error('Preview output contract does not satisfy the anchor-only H0 schema.');
  }
  return { entry, files, combined, contract };
};
const importPreview = async (temporaryOutputRoot, projectRoot, generationId, guards = {}) => {
  safeId(generationId, 'generationId');
  const validated = await validatePreviewTree(temporaryOutputRoot);
  if (guards.anchorCardId && validated.contract.anchorCardId !== guards.anchorCardId) throw new Error('Preview output contract does not match the selected anchor card.');
  if (guards.expectedH0 && validated.contract.h0Mode !== guards.expectedH0) throw new Error('Preview output contract does not match the required H0 mode.');
  const intakeMatches = scanExactSignals(validated.combined, guards.leakSignals);
  if (intakeMatches.length) throw new Error(`Preview contains intake leak signal: ${intakeMatches[0].value}`);
  const identityMatches = scanSourceIdentity(validated.combined, guards.sourceIdentity);
  if (identityMatches.length) throw new Error(`Preview contains source identity signal: ${identityMatches[0].value}`);
  const previewsRoot = resolve(canonicalPath(projectRoot), '.inspiration', 'previews');
  const destination = resolve(previewsRoot, generationId);
  assertContainedPath(destination, previewsRoot);
  if (existsSync(destination)) throw new Error(`Preview destination already exists: ${generationId}`);
  await mkdir(previewsRoot, { recursive: true });
  const staging = `${destination}.importing-${process.pid}-${Date.now()}`;
  await cp(temporaryOutputRoot, staging, { recursive: true, force: false, errorOnExist: true });
  try { await rename(staging, destination); }
  catch (error) { await rm(staging, { recursive: true, force: true }); throw error; }
  return { destination, preview: `../previews/${generationId}/index.html`, files: validated.files.map((file) => file.relativePath) };
};

const main = async () => {
  const [command, first, second, third] = process.argv.slice(2);
  if (command === 'leak-signals') {
    const intake = JSON.parse(await readFile(resolve(first), 'utf8'));
    await writeFile(resolve(second), `${JSON.stringify(buildLeakSignals(intake), null, 2)}\n`, 'utf8');
    return;
  }
  if (command === 'validate-preview') return console.log(JSON.stringify(await validatePreviewTree(resolve(first)), null, 2));
  if (command === 'import-preview') return console.log(JSON.stringify(await importPreview(resolve(first), resolve(second), third), null, 2));
  throw new Error('Usage: visual-contract.mjs leak-signals <intake.json> <output.json> | validate-preview <output-root> | import-preview <output-root> <project-root> <generation-id>');
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Visual contract: ${error.message}`); process.exitCode = 1; });

export { assertNoConstitution, buildLeakSignals, buildSealedPayload, importPreview, normalizeText, parseBrief, renderVisualPrompt, resolveEvidence, scanExactSignals, scanSourceIdentity, validatePreviewTree };
