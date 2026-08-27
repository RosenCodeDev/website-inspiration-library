#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { artifactManifest, currentEvaluationInputs, hash, RELEASE_CARD_IDS, root } from './inspiration-eval-common.mjs';
import { buildSealedPayload, importPreview, renderVisualPrompt, scanSourceIdentity, validatePreviewTree } from '../skills/design-taste-injection/scripts/visual-contract.mjs';

const syntheticBriefs = [
  { id: 'operations', product: 'Northstar Operations', description: 'A workflow command center for regional service teams.', goal: 'Start a trial', densePage: 'Operations runbook with filters, status rows, owners, and escalation details.' },
  { id: 'research', product: 'Fieldnote Research', description: 'A collaborative evidence workspace for independent research teams.', goal: 'Request access', densePage: 'Research library with citations, metadata, query controls, and a dense document index.' },
];
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
}; };
const integratedPrompt = ({ card, contract, contractFingerprint, brief, kind }) => JSON.stringify({
  task: kind === 'homepage'
    ? 'Build a complete homepage with data-complete-homepage on its main page wrapper.'
    : `Build a dense functional inner page for: ${brief.densePage}. Put data-dense-content-page on its main wrapper. Do not use data-inspiration-hero or repeat landing-page scale or promotional pacing.`,
  selectedCard: { id: card.id, title: card.title }, frozenVisualContract: contract, frozenContractFingerprint: contractFingerprint,
  projectContent: brief,
  constraints: [`Include exactly <meta name="anchor-contract-fingerprint" content="${contractFingerprint}">.`, 'Use project context for copy, information architecture, and function only.', 'Do not change the frozen palette logic, typography, texture, spacing grammar, image treatment, or visual language.', 'Use only local HTML, CSS, optional JavaScript, and the subscription-generated hero asset when provided.', 'Do not reproduce source identity.'],
}, null, 2);
const caseDefinition = async (card, current) => {
  const source = resolve(current.catalog.publicAssetRoot, card.media.detailImage.replace(/^[/\\]+/, '')); const stillHash = await sha256(source);
  const referenceName = `reference${extname(source) || '.png'}`;
  const payload = buildSealedPayload(card, { directionId: `${card.id}-direction`, generationId: `${card.id}-h0`, sha256: stillHash });
  const contract = frozenContract(card); const contractFingerprint = hash(contract); const imagePromptFingerprint = hash(card.imageRecipe);
  return {
    source, referenceName, payload, contract,
    item: { cardId: card.id, reference: `cases/${card.id}/input/${referenceName}`, stillSha256: stillHash, h0: payload.output.h0, geometry: payload.output.geometry, codeNativeMethod: payload.futureHero.permittedMethod ?? null, contractFingerprint, imageRequired: card.imageRecipe.kind !== 'none', imagePromptFingerprint, briefs: syntheticBriefs.map((brief) => brief.id) },
  };
};
const evaluationRoot = (fingerprint) => resolve(root, '.inspiration-eval', `subscription-${fingerprint.slice(0, 16)}`);
const ensureCurrentManifest = async (manifestPath) => {
  const manifest = await readJson(manifestPath); const current = await currentEvaluationInputs();
  if (manifest.schemaVersion !== 2 || manifest.evaluationMode !== 'subscription' || manifest.evaluationFingerprint !== current.evaluationFingerprint) throw new Error('Subscription evaluation manifest is invalid or stale. Run prepare:inspiration-eval again.');
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
    const definition = await caseDefinition(card, current); const { source, referenceName, payload, contract, item } = definition;
    const cardRoot = resolve(destination, 'cases', cardId); const inputRoot = resolve(cardRoot, 'input'); await mkdir(inputRoot, { recursive: true });
    const reference = resolve(inputRoot, referenceName); await cp(source, reference);
    const { contractFingerprint, imagePromptFingerprint } = item;
    await mkdir(resolve(cardRoot, 'h0'), { recursive: true });
    await writeFile(resolve(cardRoot, 'h0', 'PROMPT.md'), `${renderVisualPrompt(payload)}\n`, 'utf8');
    await writeFile(resolve(cardRoot, 'h0', 'payload.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    if (card.imageRecipe.kind !== 'none') {
      await mkdir(resolve(cardRoot, 'image'), { recursive: true });
      await writeFile(resolve(cardRoot, 'image', 'PROMPT.md'), `${card.imageRecipe.prompt}\n\nUse built-in $imagegen with the selected still as visual guidance. Generate a new source-identity-free hero asset that fits the frozen H0 geometry.\n`, 'utf8');
      await writeFile(resolve(cardRoot, 'image', 'image-generation.template.json'), `${JSON.stringify({ provider: 'codex-imagegen', promptFingerprint: imagePromptFingerprint, asset: 'output/assets/generated-hero.png', assetSha256: '<sha256>' }, null, 2)}\n`, 'utf8');
    }
    for (const brief of syntheticBriefs) for (const kind of ['homepage', 'dense']) {
      const pageRoot = resolve(cardRoot, brief.id, kind); await mkdir(pageRoot, { recursive: true });
      await writeFile(resolve(pageRoot, 'PROMPT.md'), `${integratedPrompt({ card, contract, contractFingerprint, brief, kind })}\n`, 'utf8');
    }
    cases.push(item);
  }
  const manifest = { schemaVersion: 2, evaluationMode: 'subscription', createdAt: new Date().toISOString(), evaluationFingerprint: current.evaluationFingerprint, subscriptionRunner: 'codex-cli-chatgpt', imageProvider: 'codex-imagegen', cases };
  const manifestPath = resolve(destination, 'manifest.json'); await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(resolve(destination, 'RUNBOOK.md'), `# Subscription inspiration evaluation\n\nRun every packet in a Codex task signed in with ChatGPT. Do not set OPENAI_API_KEY.\n\n1. For each card, generate the H0 preview into \`h0/output/\` using only its prompt, payload, and staged still.\n2. For image-led cards, invoke built-in \`$imagegen\`, place the generated asset under \`image/output/assets/\`, and replace the receipt template with \`image/image-generation.json\` containing the final relative path and SHA-256.\n3. Build each complete homepage and dense page into its \`output/\` folder. Copy the generated hero into each homepage's local assets when required.\n4. Run \`npm run verify:inspiration-eval -- --manifest "${manifestPath}"\`. Inspect the screenshots, then create the named approval.\n\nThe subscription runner is ephemeral and context-limited; it is not API-isolated.\n`, 'utf8');
  return { destination, manifestPath, evaluationFingerprint: current.evaluationFingerprint, cases: cases.length };
};

const verifyFullPage = async (directory, kind, contractFingerprint, identity) => {
  const tree = await validatePreviewTree(directory); const html = await readFile(resolve(directory, 'index.html'), 'utf8');
  const fingerprintMeta = html.match(/<meta\s+name=["']anchor-contract-fingerprint["']\s+content=["']([a-f0-9]{64})["']\s*\/?\s*>/i)?.[1];
  if (fingerprintMeta !== contractFingerprint) throw new Error('Generated page does not carry the frozen contract fingerprint.');
  if (kind === 'dense' && (!html.includes('data-dense-content-page') || html.includes('data-inspiration-hero'))) throw new Error('Dense page is missing its functional marker or repeats a landing-page hero.');
  if (kind === 'homepage' && !html.includes('data-complete-homepage')) throw new Error('Homepage is missing data-complete-homepage.');
  const identityMatches = scanSourceIdentity(tree.combined, identity); if (identityMatches.length) throw new Error(`Full page leaked source identity: ${identityMatches[0].value}`);
  return tree;
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
  if (receipt.provider !== 'codex-imagegen' || receipt.promptFingerprint !== item.imagePromptFingerprint || typeof receipt.asset !== 'string' || !receipt.asset.startsWith('output/assets/')) throw new Error(`Invalid Codex image-generation receipt for ${item.cardId}.`);
  const assetPath = resolve(cardRoot, 'image', receipt.asset); const imageRoot = resolve(cardRoot, 'image');
  const relativeAsset = relative(imageRoot, assetPath); if (relativeAsset.startsWith('..') || relativeAsset.includes(':')) throw new Error('Image-generation asset escapes its evaluation case.');
  if (!existsSync(assetPath) || !/\.(?:png|jpe?g|webp)$/i.test(assetPath)) throw new Error(`Missing generated image asset for ${item.cardId}.`);
  const actual = await sha256(assetPath); if (receipt.assetSha256 !== actual) throw new Error(`Generated image receipt hash is stale for ${item.cardId}.`);
  return { provider: receipt.provider, assetSha256: actual, promptFingerprint: receipt.promptFingerprint };
};

const verify = async ({ manifestPath } = {}) => {
  if (!manifestPath) throw new Error('Usage: npm run verify:inspiration-eval -- --manifest <manifest.json>');
  const path = resolve(manifestPath); const { manifest, current } = await ensureCurrentManifest(path); const artifactRoot = dirname(path); const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'inspiration-subscription-verify-'));
  const frozenContractFingerprints = {}; const imageGeneration = {}; let generatedH0 = 0; let integratedPages = 0;
  try {
    for (const item of manifest.cases) {
      const card = current.catalog.cards.find((entry) => entry.id === item.cardId); if (!card) throw new Error(`Evaluation card is missing: ${item.cardId}`);
      const cardRoot = resolve(artifactRoot, 'cases', item.cardId); frozenContractFingerprints[item.cardId] = item.contractFingerprint;
      const h0Output = resolve(cardRoot, 'h0', 'output');
      await importPreview(h0Output, temporaryRoot, `${item.cardId}-h0`, { leakSignals: { schemaVersion: 1, signals: [] }, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: item.h0, expectedGeometry: item.geometry, expectedCodeNativeMethod: item.codeNativeMethod, sourceStillInspected: true }); generatedH0 += 1;
      imageGeneration[item.cardId] = await verifyImageReceipt(cardRoot, item);
      for (const briefId of item.briefs) for (const kind of ['homepage', 'dense']) {
        const output = resolve(cardRoot, briefId, kind, 'output'); const tree = await verifyFullPage(output, kind, item.contractFingerprint, card.sourceIdentity);
        if (kind === 'homepage' && imageGeneration[item.cardId]) {
          const localAssetHashes = await Promise.all(tree.files.filter((file) => file.relativePath.startsWith('assets/')).map((file) => sha256(file.path)));
          if (!localAssetHashes.includes(imageGeneration[item.cardId].assetSha256)) throw new Error(`Homepage ${item.cardId}/${briefId} does not include the verified Codex-generated hero asset.`);
        }
        const screenshot = resolve(cardRoot, briefId, `${kind}.png`); await capture(output, screenshot); integratedPages += 1;
      }
    }
    const manifestHashes = await artifactManifest(artifactRoot);
    const report = { schemaVersion: 2, evaluationMode: 'subscription', createdAt: new Date().toISOString(), evaluationFingerprint: current.evaluationFingerprint, machinePassed: true, machineScores: { generatedH0, integratedPages, contextBriefs: syntheticBriefs.length, generatedImages: Object.values(imageGeneration).filter(Boolean).length }, frozenContractFingerprints, imageGeneration, artifactManifest: manifestHashes, humanApprovalRequired: true };
    const reportPath = resolve(artifactRoot, 'report.json'); await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    return { reportPath, report };
  } finally { await rm(temporaryRoot, { recursive: true, force: true }); }
};

const argument = (name) => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : null; };
const main = async () => {
  const command = process.argv[2];
  const result = command === 'prepare' ? await prepare({ outputRoot: argument('--output') }) : command === 'verify' ? await verify({ manifestPath: argument('--manifest') }) : (() => { throw new Error('Usage: inspiration-subscription-eval.mjs prepare [--output <directory>] | verify --manifest <manifest.json>'); })();
  console.log(JSON.stringify(result.report ? { passed: result.report.machinePassed, reportPath: result.reportPath, evaluationFingerprint: result.report.evaluationFingerprint } : result, null, 2));
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Subscription inspiration evaluation: ${error.stack || error.message}`); process.exitCode = 1; });

export { prepare, verify, verifyFullPage, verifyImageReceipt };
