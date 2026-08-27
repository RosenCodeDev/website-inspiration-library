#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { artifactManifest, currentEvaluationInputs, hash, RELEASE_CARD_IDS, RELEASE_MODEL, root } from './inspiration-eval-common.mjs';
import { assertNoConstitution, buildLeakSignals, buildSealedPayload, importPreview, renderVisualPrompt, resolveEvidence, scanSourceIdentity, validatePreviewTree } from '../skills/design-taste-injection/scripts/visual-contract.mjs';
import { materializeOutput, postResponses, runSealedGeneration } from '../skills/design-taste-injection/scripts/isolation-runner.mjs';

const enabled = () => process.env.RUN_PAID_INSPIRATION_EVAL === '1';
const pageOutputSchema = {
  type: 'object', additionalProperties: false, required: ['files', 'contractFingerprint'],
  properties: {
    files: { type: 'array', minItems: 1, maxItems: 20, items: { type: 'object', additionalProperties: false, required: ['path', 'content'], properties: { path: { type: 'string', pattern: '^(index\\.html|styles\\.css|script\\.js|assets/[A-Za-z0-9._/-]+)$' }, content: { type: 'string' } } } },
    contractFingerprint: { type: 'string', pattern: '^[a-f0-9]{64}$' },
  },
};
const rubricSchema = {
  type: 'object', additionalProperties: false, required: ['scores', 'summary'],
  properties: {
    scores: { type: 'object', additionalProperties: false, required: ['anchorSpecificity', 'crossPageCoherence', 'densePageFitness', 'visualHierarchy', 'craft'], properties: Object.fromEntries(['anchorSpecificity', 'crossPageCoherence', 'densePageFitness', 'visualHierarchy', 'craft'].map((name) => [name, { type: 'integer', minimum: 1, maximum: 5 }])) },
    summary: { type: 'string' },
  },
};
const syntheticBriefs = [
  { id: 'operations', product: 'Northstar Operations', description: 'A workflow command center for regional service teams.', goal: 'Start a trial', densePage: 'Operations runbook with filters, status rows, owners, and escalation details.' },
  { id: 'research', product: 'Fieldnote Research', description: 'A collaborative evidence workspace for independent research teams.', goal: 'Request access', densePage: 'Research library with citations, metadata, query controls, and a dense document index.' },
];
const dataUrl = async (path, mime = 'image/png') => `data:${mime};base64,${(await readFile(path)).toString('base64')}`;
const responseRequest = (input, schema, name, images = []) => ({
  model: RELEASE_MODEL, store: false, background: false, stream: false,
  instructions: 'Follow only the supplied evaluation input. Return strict JSON. Do not use tools, external assets, prior context, or markdown.',
  input: [{ role: 'user', content: [{ type: 'input_text', text: input }, ...images.map((image_url) => ({ type: 'input_image', image_url, detail: 'high' }))] }],
  tools: [], tool_choice: 'none', reasoning: { effort: 'high' }, text: { format: { type: 'json_schema', name, strict: true, schema } },
});
const frozenContract = (card) => ({
  cardId: card.id, typography: card.brief.Typography, palette: card.brief.Palette, spacing: card.brief.Spacing,
  composition: card.brief.Composition, texture: card.brief.Texture, hierarchy: card.brief.Hierarchy,
  imageTreatment: card.imageRecipe.kind === 'none' ? card.imageRecipe.reason : card.imageRecipe.prompt,
  never: card.brief.Avoid,
});
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
  const { chromium } = await import('playwright-core');
  const { discoverBrowser } = await import('../skills/design-taste-injection/scripts/browser-discovery.mjs');
  const browserPath = discoverBrowser(); if (!browserPath) throw new Error('Release evaluation requires Chrome, Edge, or Chromium.');
  const browser = await chromium.launch({ executablePath: browserPath, headless: true });
  try { const page = await browser.newPage({ viewportSize: { width: 1440, height: 1100 } }); await page.goto(pathToFileURL(resolve(directory, 'index.html')).href, { waitUntil: 'load' }); await page.screenshot({ path: destination, fullPage: true, animations: 'disabled' }); }
  finally { await browser.close(); }
};
const generateIntegratedPage = async ({ card, stillPath, contract, contractFingerprint, brief, kind, outputRoot }) => {
  const requirement = kind === 'homepage'
    ? 'Build a complete homepage with data-complete-homepage on its main page wrapper.'
    : `Build a dense functional inner page for: ${brief.densePage}. Put data-dense-content-page on its main wrapper. Do not use data-inspiration-hero or repeat landing-page scale or promotional pacing.`;
  const prompt = JSON.stringify({
    task: requirement,
    frozenVisualContract: contract,
    frozenContractFingerprint: contractFingerprint,
    projectContent: brief,
    constraints: [`Include exactly <meta name="anchor-contract-fingerprint" content="${contractFingerprint}">.`, 'Use project context for copy, information architecture, and function only.', 'Do not change the frozen palette logic, typography, texture, spacing grammar, image treatment, or visual language.', 'Use only local HTML, CSS, and optional JavaScript. Do not reproduce source identity.'],
  });
  const request = responseRequest(prompt, pageOutputSchema, `inspiration_${kind}_files`, [await dataUrl(stillPath)]);
  const result = await postResponses(request); if (result.returnedModel !== RELEASE_MODEL) throw new Error(`Integrated page returned unexpected model: ${result.returnedModel}`);
  if (result.output.contractFingerprint !== contractFingerprint) throw new Error('Integrated page response changed the frozen contract fingerprint.');
  await materializeOutput({ files: result.output.files, inspection: { stillSha256: card.sourceIdentity.derived.assetHashes[0] } }, outputRoot, card.sourceIdentity.derived.assetHashes[0]);
  await verifyFullPage(outputRoot, kind, contractFingerprint, card.sourceIdentity);
  return { model: result.returnedModel, response: result.response };
};
const evaluatePair = async ({ homepageScreenshot, denseScreenshot, cardId, briefId }) => {
  const prompt = `Evaluate this homepage and dense inner page pair. The first image is the homepage and the second is the dense page. Score each dimension 1–5: anchor specificity, cross-page coherence, dense-page fitness without landing-page repetition, visual hierarchy, and craft. Judge observable output only. Card ID: ${cardId}. Synthetic brief: ${briefId}.`;
  const result = await postResponses(responseRequest(prompt, rubricSchema, 'inspiration_visual_rubric', [await dataUrl(homepageScreenshot), await dataUrl(denseScreenshot)]));
  if (result.returnedModel !== RELEASE_MODEL) throw new Error(`Evaluator returned unexpected model: ${result.returnedModel}`);
  return { ...result.output, returnedModel: result.returnedModel, response: result.response };
};

const runEvaluation = async () => {
  if (!enabled()) throw new Error('Paid evaluation is disabled. Set RUN_PAID_INSPIRATION_EVAL=1 explicitly.');
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required.');
  const current = await currentEvaluationInputs(); const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${current.evaluationFingerprint.slice(0, 12)}`;
  const artifactRoot = resolve(root, '.inspiration-eval', runId); const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'inspiration-release-eval-'));
  const projectRoot = resolve(temporaryRoot, 'project'); await mkdir(projectRoot, { recursive: true }); await mkdir(artifactRoot, { recursive: true });
  const returnedModels = []; const evaluatorScores = []; const frozenContractFingerprints = {};
  const leakSignals = buildLeakSignals({ productNames: syntheticBriefs.map((brief) => brief.product), distinctiveClaims: syntheticBriefs.map((brief) => brief.description) });
  try {
    for (const cardId of RELEASE_CARD_IDS) {
      const card = current.catalog.cards.find((item) => item.id === cardId); const evidence = await resolveEvidence(current.catalog, projectRoot, cardId);
      const payload = buildSealedPayload(card, { directionId: `${cardId}-direction`, generationId: `${cardId}-h0`, sha256: evidence.record.sha256 });
      if (!payload.card.observedBrief.Composition || !payload.card.observedBrief.Avoid) throw new Error(`Release payload lost card-authored Composition or Avoid for ${cardId}.`);
      assertNoConstitution(payload, renderVisualPrompt(payload), current.catalog.categoryProfiles[card.primaryCategory]);
      const h0Output = resolve(temporaryRoot, 'h0-output', cardId); const expectedH0 = payload.output.h0;
      const h0 = await runSealedGeneration(payload, evidence.destination, h0Output, {
        guards: { projectRoot, libraryRoot: root, leakSignals, sourceIdentity: card.sourceIdentity },
        validateAttempt: async (directory) => importPreview(directory, projectRoot, `${cardId}-h0`, { leakSignals, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0, expectedGeometry: payload.output.geometry, expectedCodeNativeMethod: payload.futureHero.permittedMethod, sourceStillInspected: true }),
      });
      returnedModels.push(h0.returnedModel); await cp(h0Output, resolve(artifactRoot, cardId, 'h0'), { recursive: true }); await writeFile(resolve(artifactRoot, cardId, 'h0-response.json'), `${JSON.stringify(h0.response, null, 2)}\n`, 'utf8');
      const contract = frozenContract(card); const contractFingerprint = hash(contract); frozenContractFingerprints[cardId] = contractFingerprint;
      for (const brief of syntheticBriefs) {
        const pairRoot = resolve(artifactRoot, cardId, brief.id); const homepage = resolve(pairRoot, 'homepage'); const dense = resolve(pairRoot, 'dense'); await mkdir(pairRoot, { recursive: true });
        const homeResult = await generateIntegratedPage({ card, stillPath: evidence.destination, contract, contractFingerprint, brief, kind: 'homepage', outputRoot: homepage }); returnedModels.push(homeResult.model); await writeFile(resolve(pairRoot, 'homepage-response.json'), `${JSON.stringify(homeResult.response, null, 2)}\n`, 'utf8');
        const denseResult = await generateIntegratedPage({ card, stillPath: evidence.destination, contract, contractFingerprint, brief, kind: 'dense', outputRoot: dense }); returnedModels.push(denseResult.model); await writeFile(resolve(pairRoot, 'dense-response.json'), `${JSON.stringify(denseResult.response, null, 2)}\n`, 'utf8');
        const homeShot = resolve(pairRoot, 'homepage.png'); const denseShot = resolve(pairRoot, 'dense.png'); await capture(homepage, homeShot); await capture(dense, denseShot);
        const scored = await evaluatePair({ homepageScreenshot: homeShot, denseScreenshot: denseShot, cardId, briefId: brief.id }); returnedModels.push(scored.returnedModel); evaluatorScores.push({ cardId, briefId: brief.id, scores: scored.scores, summary: scored.summary }); await writeFile(resolve(pairRoot, 'evaluator-response.json'), `${JSON.stringify(scored.response, null, 2)}\n`, 'utf8');
      }
    }
    const values = evaluatorScores.flatMap((item) => Object.values(item.scores)); const mean = values.reduce((sum, value) => sum + value, 0) / values.length; const minimum = Math.min(...values);
    if (mean < 4 || minimum < 3) throw new Error(`Visual rubric failed: mean ${mean.toFixed(2)}, minimum ${minimum}.`);
    if (returnedModels.some((model) => model !== RELEASE_MODEL)) throw new Error('One or more calls returned a non-release model.');
    const manifest = await artifactManifest(artifactRoot);
    const report = {
      schemaVersion: 1, createdAt: new Date().toISOString(), evaluationFingerprint: current.evaluationFingerprint,
      requestedModel: RELEASE_MODEL, returnedModels: [...new Set(returnedModels)], machinePassed: true,
      machineScores: { generatedH0: RELEASE_CARD_IDS.length, integratedPages: RELEASE_CARD_IDS.length * syntheticBriefs.length * 2, contextBriefs: syntheticBriefs.length },
      evaluatorScores, evaluatorSummary: { mean, minimum }, frozenContractFingerprints, artifactManifest: manifest,
      humanApprovalRequired: true,
    };
    const reportPath = resolve(artifactRoot, 'report.json'); await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    return { reportPath, report };
  } finally { await rm(temporaryRoot, { recursive: true, force: true }); }
};

const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) runEvaluation().then(({ reportPath, report }) => console.log(JSON.stringify({ passed: report.machinePassed, reportPath, evaluationFingerprint: report.evaluationFingerprint }, null, 2))).catch((error) => { console.error(`Inspiration evaluation: ${error.stack || error.message}`); process.exitCode = 1; });

export { runEvaluation };
