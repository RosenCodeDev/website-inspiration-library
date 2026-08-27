#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { artifactManifest, currentEvaluationInputs, hash, RELEASE_CARD_IDS, root } from './inspiration-eval-common.mjs';
import { writeAttestation } from './inspiration-eval-attestation.mjs';
import { buildSealedPayload, importPreview, renderVisualPrompt, scanSourceIdentity, validatePreviewTree } from '../skills/design-taste-injection/scripts/visual-contract.mjs';
import { MAX_STRUCTURED_OUTPUT_BYTES, materializeOutput, outputSchema, runSubscriptionGeneration, sanitizedSubscriptionEnv, subscriptionCodexArgs, subscriptionFeatureStatus, subscriptionLoginStatus } from '../skills/design-taste-injection/scripts/isolation-runner.mjs';

const syntheticBrief = { id: 'operations', product: 'Northstar Operations', description: 'A workflow command center for regional service teams.', goal: 'Start a trial', densePage: 'Operations runbook with filters, status rows, owners, and escalation details.' };
const rubricDimensions = ['visual hierarchy and composition', 'frozen-system fidelity', 'image integration', 'dense-page functional clarity', 'production polish'];
const commandResult = (command, args, options = {}) => spawnSync(command, args, { encoding: 'utf8', timeout: options.timeout ?? 600_000, maxBuffer: 20 * 1024 * 1024, ...options });
const codexExecutable = () => process.env.CODEX_EXECUTABLE ?? (process.platform === 'win32' ? 'codex.exe' : 'codex');
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const sha256 = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
const parseBrief = (brief) => Object.fromEntries(String(brief).split(/\r?\n/).map((line) => { const separator = line.indexOf(':'); return separator > 0 ? [line.slice(0, separator).trim(), line.slice(separator + 1).trim()] : null; }).filter(Boolean));
const frozenContract = (card) => {
  const brief = parseBrief(card.brief);
  return {
    cardId: card.id, typography: brief.Typography, palette: brief.Palette, spacing: brief.Spacing,
    composition: brief.Composition, texture: brief.Texture, hierarchy: brief.Hierarchy,
    imageTreatment: card.imageRecipe.kind === 'none' ? card.imageRecipe.reason : card.imageRecipe.prompt,
    never: brief.Avoid,
  };
};
const integratedPrompt = ({ contract, contractFingerprint, brief, kind, imageRequired }) => JSON.stringify({
  task: kind === 'homepage'
    ? 'Build one complete production-quality homepage. Put data-complete-homepage on its main page wrapper.'
    : `Build one dense functional inner page for: ${brief.densePage}. Put data-dense-content-page on its main wrapper. Do not use data-inspiration-hero or repeat landing-page scale or promotional pacing.`,
  frozenVisualContract: contract, frozenContractFingerprint: contractFingerprint, projectContent: brief,
  constraints: [
    `Include exactly <meta name="anchor-contract-fingerprint" content="${contractFingerprint}">.`,
    'Use project context for copy, information architecture, and function only.',
    'Do not change the frozen palette logic, typography, texture, spacing grammar, image treatment, or visual language.',
    'Use only local HTML, CSS, and optional JavaScript. Do not include HTTP(S), protocol-relative, mailto, tel, file, CDN, remote-font, analytics, or @import URLs. Do not reproduce source identity.',
    ...(kind === 'homepage' && imageRequired ? ['Reference the parent-provided hero asset exactly as assets/generated-hero.png. Do not embed or recreate it.'] : []),
  ],
}, null, 2);
const caseDefinition = async (card, current) => {
  const source = resolve(current.catalog.publicAssetRoot, card.media.detailImage.replace(/^[/\\]+/, '')); const stillHash = await sha256(source);
  const referenceName = `reference${extname(source) || '.png'}`;
  const payload = buildSealedPayload(card, { directionId: `${card.id}-direction`, generationId: `${card.id}-h0`, sha256: stillHash });
  const contract = frozenContract(card); const contractFingerprint = hash(contract); const imagePromptFingerprint = hash(card.imageRecipe);
  return {
    source, referenceName, payload, contract,
    item: { cardId: card.id, reference: `cases/${card.id}/input/${referenceName}`, stillSha256: stillHash, h0: payload.output.h0, geometry: payload.output.geometry, codeNativeMethod: payload.futureHero.permittedMethod ?? null, contractFingerprint, imageRequired: card.imageRecipe.kind !== 'none', imagePromptFingerprint, briefs: [syntheticBrief.id] },
  };
};
const evaluationRoot = (fingerprint) => resolve(root, '.inspiration-eval', `subscription-${fingerprint.slice(0, 16)}`);
const ensureCurrentManifest = async (manifestPath) => {
  const manifest = await readJson(manifestPath); const current = await currentEvaluationInputs();
  if (manifest.schemaVersion !== 3 || manifest.evaluationMode !== 'subscription' || manifest.evaluationFingerprint !== current.evaluationFingerprint) throw new Error('Subscription evaluation manifest is invalid or stale. Run prepare:inspiration-eval again.');
  const expectedCases = [];
  for (const cardId of RELEASE_CARD_IDS) { const card = current.catalog.cards.find((item) => item.id === cardId); if (!card) throw new Error(`Missing release card: ${cardId}`); expectedCases.push((await caseDefinition(card, current)).item); }
  if (hash(manifest.cases) !== hash(expectedCases)) throw new Error('Subscription evaluation cases were modified or are incomplete. Run prepare:inspiration-eval again.');
  return { manifest, current };
};

const prepare = async ({ outputRoot } = {}) => {
  const current = await currentEvaluationInputs(); const destination = outputRoot ? resolve(outputRoot) : evaluationRoot(current.evaluationFingerprint);
  await rm(destination, { recursive: true, force: true }); await mkdir(destination, { recursive: true });
  const cases = [];
  for (const cardId of RELEASE_CARD_IDS) {
    const card = current.catalog.cards.find((item) => item.id === cardId); if (!card) throw new Error(`Missing release card: ${cardId}`);
    const { source, referenceName, payload, contract, item } = await caseDefinition(card, current);
    const cardRoot = resolve(destination, 'cases', cardId); const inputRoot = resolve(cardRoot, 'input'); await mkdir(inputRoot, { recursive: true });
    await cp(source, resolve(inputRoot, referenceName));
    await mkdir(resolve(cardRoot, 'h0'), { recursive: true });
    await writeFile(resolve(cardRoot, 'h0', 'PROMPT.md'), `${renderVisualPrompt(payload)}\n`, 'utf8');
    await writeFile(resolve(cardRoot, 'h0', 'payload.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    if (item.imageRequired) {
      await mkdir(resolve(cardRoot, 'image'), { recursive: true });
      await writeFile(resolve(cardRoot, 'image', 'PROMPT.md'), `${card.imageRecipe.prompt}\n\nUse built-in $imagegen with the selected still as visual guidance. Generate a new source-identity-free hero asset that fits the frozen H0 geometry.\n`, 'utf8');
    }
    for (const kind of ['homepage', 'dense']) {
      const pageRoot = resolve(cardRoot, syntheticBrief.id, kind); await mkdir(pageRoot, { recursive: true });
      await writeFile(resolve(pageRoot, 'PROMPT.md'), `${integratedPrompt({ contract, contractFingerprint: item.contractFingerprint, brief: syntheticBrief, kind, imageRequired: item.imageRequired })}\n`, 'utf8');
    }
    cases.push(item);
  }
  const manifest = { schemaVersion: 3, evaluationMode: 'subscription', createdAt: new Date().toISOString(), evaluationFingerprint: current.evaluationFingerprint, subscriptionRunner: 'codex-cli-chatgpt', imageProvider: 'codex-imagegen', cases };
  const manifestPath = resolve(destination, 'manifest.json'); await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(resolve(destination, 'RUNBOOK.md'), '# Automatic subscription inspiration evaluation\n\nRun `npm run test:inspiration-eval` in a Codex installation actively authenticated with ChatGPT. The command generates and validates one Spade H0, one built-in ImageGen asset, one homepage, one dense page, rendered screenshots, an automatic visual smoke rubric, and a fingerprint-bound machine attestation. `OPENAI_API_KEY` is neither read nor required.\n', 'utf8');
  return { destination, manifestPath, evaluationFingerprint: current.evaluationFingerprint, cases: cases.length };
};

const runStructuredResponse = async ({ workspace, prompt, images, schema, resultName = 'result.json', timeout = 600_000, run = commandResult }) => {
  const schemaPath = resolve(workspace, `${resultName}.schema.json`); const resultPath = resolve(workspace, resultName);
  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8'); await rm(resultPath, { force: true });
  const result = run(codexExecutable(), subscriptionCodexArgs(workspace, images, schemaPath, resultPath), { cwd: workspace, input: prompt, timeout, shell: false, env: sanitizedSubscriptionEnv() });
  if (result.status !== 0) throw new Error(result.stderr?.trim() || result.stdout?.trim() || 'Subscription-backed structured task failed.');
  if (!existsSync(resultPath)) throw new Error('Codex completed without returning structured output.');
  const raw = await readFile(resultPath, 'utf8'); if (Buffer.byteLength(raw) > MAX_STRUCTURED_OUTPUT_BYTES) throw new Error('Structured output exceeds the 2 MiB limit.');
  try { return JSON.parse(raw); } catch { throw new Error('Structured output is not valid JSON.'); }
};
const generateStructuredPage = async ({ prompt, images, outputRoot, expectedStillSha256 }) => {
  const workspace = await mkdtemp(resolve(tmpdir(), 'inspiration-page-eval-')); const inputRoot = resolve(workspace, 'input'); await mkdir(inputRoot, { recursive: true });
  try {
    const staged = [];
    for (const [index, image] of images.entries()) { const target = resolve(inputRoot, `image-${index}${extname(image) || '.png'}`); await cp(image, target); staged.push(target); }
    const basePrompt = `${prompt}\n\nReturn only the strict structured file manifest. Do not use tools or write files. Use local UTF-8 HTML/CSS/JS only. Do not include data URIs or any external/absolute URL scheme, remote font, CDN, @import, mailto, or tel link. Set inspection.stillSha256 to ${expectedStillSha256}.`;
    let lastError; let correction = '';
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const manifest = await runStructuredResponse({ workspace, prompt: attempt ? `${basePrompt}\nCORRECTION: The previous response failed deterministic validation: ${correction}. Return a complete corrected manifest and fix that exact issue.` : basePrompt, images: staged, schema: outputSchema, resultName: `page-${attempt}.json` });
        const materialized = resolve(workspace, 'output'); await materializeOutput(manifest, materialized, expectedStillSha256); await validatePreviewTree(materialized);
        await rm(outputRoot, { recursive: true, force: true }); await mkdir(dirname(outputRoot), { recursive: true }); await cp(materialized, outputRoot, { recursive: true }); return { attempt: attempt + 1 };
      } catch (error) { lastError = error; correction = String(error?.message ?? error).replace(/(?:file:\/\/|[A-Za-z]:[\\/])\S+/g, '[PATH]').slice(0, 800); if (attempt === 1) break; }
    }
    throw new Error(`Integrated page generation failed after two structured attempts: ${lastError?.message ?? 'validation failed'}`);
  } finally { await rm(workspace, { recursive: true, force: true }); }
};
const generateImage = async ({ prompt, reference, destination, promptFingerprint }) => {
  const workspace = await mkdtemp(resolve(tmpdir(), 'inspiration-image-eval-')); const staged = resolve(workspace, `reference${extname(reference) || '.png'}`); const output = resolve(workspace, 'output');
  try {
    await cp(reference, staged); await mkdir(output, { recursive: true });
    const args = ['exec', '--ephemeral', '--ignore-user-config', '--ignore-rules', '--skip-git-repo-check', '-C', workspace, '--approve-for-me', '-i', staged];
    const instruction = `${prompt}\n\nUse the built-in $imagegen skill, not an API or placeholder. Generate one final source-identity-free raster hero, then copy the selected result to output/generated-hero.png. Do not inspect project or library paths.`;
    const result = commandResult(codexExecutable(), args, { cwd: workspace, input: instruction, timeout: 900_000, shell: false, env: sanitizedSubscriptionEnv() });
    if (result.status !== 0 || !existsSync(resolve(output, 'generated-hero.png'))) throw new Error(`Built-in subscription ImageGen is unavailable or failed: ${result.stderr?.trim() || result.stdout?.trim() || 'no generated asset returned'}. No API fallback was attempted.`);
    const assetRoot = resolve(destination, 'output', 'assets'); await mkdir(assetRoot, { recursive: true }); const asset = resolve(assetRoot, 'generated-hero.png'); await cp(resolve(output, 'generated-hero.png'), asset);
    const receipt = { provider: 'codex-imagegen', promptFingerprint, asset: 'output/assets/generated-hero.png', assetSha256: await sha256(asset) };
    await writeFile(resolve(destination, 'image-generation.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8'); return { asset, receipt };
  } finally { await rm(workspace, { recursive: true, force: true }); }
};

const verifyFullPage = async (directory, kind, contractFingerprint, identity) => {
  const tree = await validatePreviewTree(directory); const html = await readFile(resolve(directory, 'index.html'), 'utf8');
  const fingerprintMeta = html.match(/<meta\s+name=["']anchor-contract-fingerprint["']\s+content=["']([a-f0-9]{64})["']\s*\/?\s*>/i)?.[1];
  if (fingerprintMeta !== contractFingerprint) throw new Error('Generated page does not carry the frozen contract fingerprint.');
  if (kind === 'dense' && (!html.includes('data-dense-content-page') || html.includes('data-inspiration-hero'))) throw new Error('Dense page is missing its functional marker or repeats a landing-page hero.');
  if (kind === 'homepage' && !html.includes('data-complete-homepage')) throw new Error('Homepage is missing data-complete-homepage.');
  const identityMatches = scanSourceIdentity(tree.combined, identity); if (identityMatches.length) throw new Error(`Full page leaked source identity: ${identityMatches[0].value}`);
  return { ...tree, html };
};
const capture = async (directory, destination) => {
  const { chromium } = await import('playwright-core'); const { discoverBrowser } = await import('../skills/design-taste-injection/scripts/browser-discovery.mjs');
  const browserPath = discoverBrowser(); if (!browserPath) throw new Error('Subscription evaluation verification requires Chrome, Edge, or Chromium.');
  const browser = await chromium.launch({ executablePath: browserPath, headless: true });
  try { const page = await browser.newPage({ viewportSize: { width: 1440, height: 1100 } }); await page.goto(pathToFileURL(resolve(directory, 'index.html')).href, { waitUntil: 'load' }); await page.screenshot({ path: destination, fullPage: true, animations: 'disabled' }); }
  finally { await browser.close(); }
};
const verifyImageReceipt = async (cardRoot, item) => {
  if (!item.imageRequired) return null;
  const receiptPath = resolve(cardRoot, 'image', 'image-generation.json'); if (!existsSync(receiptPath)) throw new Error(`Missing Codex image-generation receipt for ${item.cardId}.`);
  const receipt = await readJson(receiptPath);
  if (receipt.provider !== 'codex-imagegen' || receipt.promptFingerprint !== item.imagePromptFingerprint || receipt.asset !== 'output/assets/generated-hero.png') throw new Error(`Invalid Codex image-generation receipt for ${item.cardId}.`);
  const imageRoot = resolve(cardRoot, 'image'); const assetPath = resolve(imageRoot, receipt.asset); const relativeAsset = relative(imageRoot, assetPath);
  if (relativeAsset.startsWith('..') || relativeAsset.includes(':') || !existsSync(assetPath)) throw new Error(`Missing or escaping generated image asset for ${item.cardId}.`);
  const actual = await sha256(assetPath); if (receipt.assetSha256 !== actual) throw new Error(`Generated image receipt hash is stale for ${item.cardId}.`);
  return { provider: receipt.provider, assetSha256: actual, promptFingerprint: receipt.promptFingerprint, assetPath };
};
const verify = async ({ manifestPath } = {}) => {
  if (!manifestPath) throw new Error('Usage: npm run verify:inspiration-eval -- --manifest <manifest.json>');
  const path = resolve(manifestPath); const { manifest, current } = await ensureCurrentManifest(path); const artifactRoot = dirname(path); const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'inspiration-subscription-verify-'));
  const frozenContractFingerprints = {}; const imageGeneration = {}; const screenshots = []; let generatedH0 = 0; let integratedPages = 0;
  try {
    for (const item of manifest.cases) {
      const card = current.catalog.cards.find((entry) => entry.id === item.cardId); if (!card) throw new Error(`Evaluation card is missing: ${item.cardId}`);
      const cardRoot = resolve(artifactRoot, 'cases', item.cardId); frozenContractFingerprints[item.cardId] = item.contractFingerprint;
      const h0Output = resolve(cardRoot, 'h0', 'output');
      await rm(resolve(h0Output, 'output-contract.json'), { force: true });
      await importPreview(h0Output, temporaryRoot, `${item.cardId}-h0`, { leakSignals: { schemaVersion: 1, signals: [] }, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: item.h0, expectedGeometry: item.geometry, expectedCodeNativeMethod: item.codeNativeMethod, sourceStillInspected: true }); generatedH0 += 1;
      const h0Screenshot = resolve(cardRoot, 'h0', 'h0.png'); await capture(h0Output, h0Screenshot); screenshots.push(h0Screenshot);
      imageGeneration[item.cardId] = await verifyImageReceipt(cardRoot, item);
      for (const kind of ['homepage', 'dense']) {
        const output = resolve(cardRoot, syntheticBrief.id, kind, 'output'); const tree = await verifyFullPage(output, kind, item.contractFingerprint, card.sourceIdentity);
        if (kind === 'homepage' && imageGeneration[item.cardId]) {
          if (!tree.html.includes('assets/generated-hero.png')) throw new Error(`Homepage ${item.cardId} does not reference the verified Codex-generated hero asset.`);
          if (!existsSync(resolve(output, 'assets', 'generated-hero.png')) || await sha256(resolve(output, 'assets', 'generated-hero.png')) !== imageGeneration[item.cardId].assetSha256) throw new Error(`Homepage ${item.cardId} does not contain the verified Codex-generated hero asset.`);
        }
        const screenshot = resolve(cardRoot, syntheticBrief.id, `${kind}.png`); await capture(output, screenshot); screenshots.push(screenshot); integratedPages += 1;
      }
    }
    const manifestHashes = await artifactManifest(artifactRoot);
    const report = { schemaVersion: 3, evaluationMode: 'subscription', createdAt: new Date().toISOString(), evaluationFingerprint: current.evaluationFingerprint, machinePassed: true, releaseEligible: false, machineScores: { generatedH0, integratedPages, contextBriefs: 1, generatedImages: Object.values(imageGeneration).filter(Boolean).length }, frozenContractFingerprints, imageGeneration: Object.fromEntries(Object.entries(imageGeneration).map(([id, value]) => [id, value && { provider: value.provider, assetSha256: value.assetSha256, promptFingerprint: value.promptFingerprint }])), artifactManifest: manifestHashes, rubric: null, humanApprovalRequired: false };
    const reportPath = resolve(artifactRoot, 'report.json'); await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8'); return { reportPath, report, screenshots };
  } finally { await rm(temporaryRoot, { recursive: true, force: true }); }
};

const evaluateScreenshots = async (artifactRoot, screenshots) => {
  const workspace = await mkdtemp(resolve(tmpdir(), 'inspiration-rubric-eval-')); const staged = [];
  const rubricSchema = { type: 'object', additionalProperties: false, required: ['summary', 'dimensions'], properties: { summary: { type: 'string' }, dimensions: { type: 'array', minItems: 5, maxItems: 5, items: { type: 'object', additionalProperties: false, required: ['name', 'score', 'rationale'], properties: { name: { type: 'string', enum: rubricDimensions }, score: { type: 'integer', minimum: 1, maximum: 5 }, rationale: { type: 'string' } } } } } };
  try {
    for (const [index, screenshot] of screenshots.entries()) { const target = resolve(workspace, `screenshot-${index}.png`); await cp(screenshot, target); staged.push(target); }
    const prompt = `Evaluate the attached rendered H0, homepage, and dense page as a release smoke test. Score exactly these five dimensions from 1 to 5: ${rubricDimensions.join('; ')}. Check visual coherence, hierarchy, frozen-system consistency, image integration, and whether the dense page is genuinely functional rather than another landing hero. Be strict but treat this as smoke QA, not proof of exceptional taste. Return only the structured rubric and do not use tools.`;
    const result = await runStructuredResponse({ workspace, prompt, images: staged, schema: rubricSchema, resultName: 'rubric.json' });
    if (!Array.isArray(result.dimensions) || new Set(result.dimensions.map((item) => item.name)).size !== rubricDimensions.length || rubricDimensions.some((name) => !result.dimensions.some((item) => item.name === name))) throw new Error('Automatic rubric did not return every required dimension exactly once.');
    const scores = result.dimensions.map((item) => item.score); const mean = Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(2)); const minimum = Math.min(...scores);
    const rubric = { ...result, mean, minimum, threshold: { mean: 4, minimum: 3 }, passed: mean >= 4 && minimum >= 3, interpretation: 'Automatic subscription smoke test; not independent or library-level taste certification.' };
    await writeFile(resolve(artifactRoot, 'rubric.json'), `${JSON.stringify(rubric, null, 2)}\n`, 'utf8'); return rubric;
  } finally { await rm(workspace, { recursive: true, force: true }); }
};
const run = async () => {
  const initial = await currentEvaluationInputs(); const existingDestination = evaluationRoot(initial.evaluationFingerprint); const existingManifest = resolve(existingDestination, 'manifest.json');
  let prepared;
  if (existsSync(existingManifest)) {
    try { await ensureCurrentManifest(existingManifest); prepared = { destination: existingDestination, manifestPath: existingManifest, evaluationFingerprint: initial.evaluationFingerprint, cases: RELEASE_CARD_IDS.length }; }
    catch { prepared = await prepare(); }
  } else prepared = await prepare();
  const { manifest, current } = await ensureCurrentManifest(prepared.manifestPath); const auth = subscriptionLoginStatus(); const feature = subscriptionFeatureStatus();
  if (!auth.available || auth.authenticatedWith !== 'chatgpt') throw new Error(`Automatic subscription evaluation requires active ChatGPT authentication: ${auth.detail || 'unavailable'}`);
  for (const item of manifest.cases) {
    const card = current.catalog.cards.find((entry) => entry.id === item.cardId); const cardRoot = resolve(prepared.destination, 'cases', item.cardId); const reference = resolve(prepared.destination, item.reference);
    const payload = await readJson(resolve(cardRoot, 'h0', 'payload.json')); const h0Output = resolve(cardRoot, 'h0', 'output');
    const validationRoot = await mkdtemp(resolve(tmpdir(), 'inspiration-live-h0-')); let h0Valid = false;
    try {
      await rm(resolve(h0Output, 'output-contract.json'), { force: true });
      if (existsSync(resolve(h0Output, 'index.html'))) {
        try { const candidate = resolve(validationRoot, 'existing-candidate'); await cp(h0Output, candidate, { recursive: true }); await importPreview(candidate, validationRoot, `${item.cardId}-existing-h0`, { leakSignals: { schemaVersion: 1, signals: [] }, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: item.h0, expectedGeometry: item.geometry, expectedCodeNativeMethod: item.codeNativeMethod, sourceStillInspected: true }); h0Valid = true; }
        catch { h0Valid = false; }
      }
      if (!h0Valid) await runSubscriptionGeneration(payload, reference, h0Output, { loginStatus: auth, featureStatus: feature, validateAttempt: async (output) => { const candidate = resolve(validationRoot, 'live-candidate'); await rm(candidate, { recursive: true, force: true }); await cp(output, candidate, { recursive: true }); return importPreview(candidate, validationRoot, `${item.cardId}-live-h0`, { leakSignals: { schemaVersion: 1, signals: [] }, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: item.h0, expectedGeometry: item.geometry, expectedCodeNativeMethod: item.codeNativeMethod, sourceStillInspected: true }); } });
    } finally { await rm(validationRoot, { recursive: true, force: true }); }
    let generatedImage = null;
    if (item.imageRequired) {
      try { const existing = await verifyImageReceipt(cardRoot, item); generatedImage = existing && { asset: existing.assetPath, receipt: existing }; }
      catch { generatedImage = await generateImage({ prompt: await readFile(resolve(cardRoot, 'image', 'PROMPT.md'), 'utf8'), reference, destination: resolve(cardRoot, 'image'), promptFingerprint: item.imagePromptFingerprint }); }
    }
    for (const kind of ['homepage', 'dense']) {
      const pageRoot = resolve(cardRoot, syntheticBrief.id, kind); const output = resolve(pageRoot, 'output');
      let pageValid = false;
      if (existsSync(resolve(output, 'index.html'))) {
        try {
          const tree = await verifyFullPage(output, kind, item.contractFingerprint, card.sourceIdentity);
          pageValid = kind !== 'homepage' || !generatedImage || (tree.html.includes('assets/generated-hero.png') && existsSync(resolve(output, 'assets', 'generated-hero.png')) && await sha256(resolve(output, 'assets', 'generated-hero.png')) === generatedImage.receipt.assetSha256);
        } catch { pageValid = false; }
      }
      if (!pageValid) {
        await generateStructuredPage({ prompt: await readFile(resolve(pageRoot, 'PROMPT.md'), 'utf8'), images: [reference, ...(kind === 'homepage' && generatedImage ? [generatedImage.asset] : [])], outputRoot: output, expectedStillSha256: item.stillSha256 });
        if (kind === 'homepage' && generatedImage) { const assets = resolve(output, 'assets'); await mkdir(assets, { recursive: true }); await cp(generatedImage.asset, resolve(assets, 'generated-hero.png')); }
      }
    }
  }
  const verified = await verify({ manifestPath: prepared.manifestPath }); const rubric = await evaluateScreenshots(prepared.destination, verified.screenshots);
  const artifactHashes = await artifactManifest(prepared.destination); const report = { ...verified.report, createdAt: new Date().toISOString(), artifactManifest: artifactHashes, rubric, releaseEligible: rubric.passed };
  await writeFile(verified.reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  if (!rubric.passed) throw new Error(`Automatic visual smoke threshold failed (mean ${rubric.mean}, minimum ${rubric.minimum}).`);
  const attestation = await writeAttestation(verified.reportPath); return { passed: true, reportPath: verified.reportPath, attestationPath: attestation.destination, evaluationFingerprint: report.evaluationFingerprint, rubric: { mean: rubric.mean, minimum: rubric.minimum } };
};

const argument = (name) => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : null; };
const main = async () => {
  const command = process.argv[2];
  const result = command === 'prepare' ? await prepare({ outputRoot: argument('--output') }) : command === 'verify' ? await verify({ manifestPath: argument('--manifest') }) : command === 'run' ? await run() : (() => { throw new Error('Usage: inspiration-subscription-eval.mjs prepare [--output <directory>] | verify --manifest <manifest.json> | run'); })();
  console.log(JSON.stringify(result.report ? { passed: result.report.machinePassed, reportPath: result.reportPath, evaluationFingerprint: result.report.evaluationFingerprint, releaseEligible: result.report.releaseEligible } : result, null, 2));
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Subscription inspiration evaluation: ${error.stack || error.message}`); process.exitCode = 1; });

export { evaluateScreenshots, generateImage, generateStructuredPage, prepare, run, verify, verifyFullPage, verifyImageReceipt };
