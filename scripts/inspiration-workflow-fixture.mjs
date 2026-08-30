#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './export-workflow-catalog.mjs';
import { applyBatchActions, createAutomaticBatch, preflightCategoryCoverage } from '../skills/design-taste-injection/scripts/reference-selection.mjs';
import { applyEvent, emptyState, statePaths, validateState } from '../skills/design-taste-injection/scripts/project-state.mjs';
import { buildSealedRequest } from '../skills/design-taste-injection/scripts/isolation-runner.mjs';
import { assertNoConstitution, buildLeakSignals, buildSealedPayload, fingerprintProtectedLayout, importPreview, renderVisualPrompt, resolveEvidence, scanExactSignals } from '../skills/design-taste-injection/scripts/visual-contract.mjs';

const fingerprint = (value) => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
const focusedScope = { kind: 'focused-category-preview', pageCount: 1, sections: ['hero', 'opening-module'], completeSite: false };
const fixtureHtml = `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#eef0df;color:#162318;font:16px/1.5 Arial,sans-serif}main{max-width:1200px;margin:auto;padding:48px}[data-inspiration-hero]{min-height:650px;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:40px}[data-future-image-slot]{width:100%;aspect-ratio:16/10;background:#cbd3bd}[data-opening-module]{min-height:220px;border-top:1px solid #162318;padding-top:32px}</style></head><body><main><section data-inspiration-hero><div data-protected-copy-region><small>NEUTRAL LABEL</small><h1>Reference-controlled fixture</h1><p>This deterministic page proves request, validation, and import plumbing—not design taste.</p></div><div data-future-image-slot></div></section><section data-opening-module><h2>Opening module</h2><p>Neutral placeholder content.</p></section></main></body></html>`;
const homepageHtml = (marker, media = '') => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:#eef0df;color:#162318;font:16px/1.5 Arial,sans-serif}main{max-width:1200px;margin:auto;padding:48px}.hero{min-height:650px;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:40px}.slot{width:100%;aspect-ratio:16/10;background:#cbd3bd;overflow:hidden}.slot img{display:block;width:100%;height:100%;object-fit:cover}.section{min-height:240px;border-top:1px solid #162318;padding:32px 0}@media(max-width:700px){main{padding:24px}.hero{grid-template-columns:1fr;min-height:auto}}</style></head><body><main data-inspiration-preview="${marker}"><section class="hero" data-inspiration-hero><div data-protected-copy-region><small>NEUTRAL LABEL</small><h1>Complete homepage fixture</h1><p>Project content enters only after the visual contract is frozen.</p></div><div class="slot" data-future-image-slot>${media}</div></section><section class="section" data-homepage-section><h2>Evidence</h2></section><section class="section" data-homepage-section><h2>Workflow</h2></section><section class="section" data-homepage-section><h2>Closing action</h2></section></main></body></html>`;
const writePreview = async (paths, id, html, asset = null) => {
  const destination = resolve(paths.previews, id); await mkdir(destination, { recursive: true });
  if (asset) { await mkdir(resolve(destination, 'assets'), { recursive: true }); await writeFile(resolve(destination, 'assets', asset.name), asset.bytes); }
  await writeFile(resolve(destination, 'index.html'), html, 'utf8');
};

const runFixture = async (options = {}) => {
  const root = resolve(import.meta.dirname, '..'); process.env.DESIGN_TASTE_LIBRARY_ROOT = root;
  const fixtureRoot = await mkdtemp(resolve(tmpdir(), 'inspiration-plumbing-')); const project = resolve(fixtureRoot, 'project'); await mkdir(project, { recursive: true });
  try {
    const catalog = await loadCatalog(); const coverage = preflightCategoryCoverage(catalog, 'marketing');
    if (coverage.coverage.length !== coverage.categoryCount || coverage.coverage.some((entry) => !entry.eligibleIds.length)) throw new Error('Dynamic category preflight is incomplete.');
    const card = catalog.cards.find((item) => item.id === 'site-spade'); const evidence = await resolveEvidence(catalog, project, card.id);
    const payload = buildSealedPayload(card, { directionId: 'D01-H0', generationId: 'D01-H0', sha256: evidence.record.sha256 }); const prompt = renderVisualPrompt(payload);
    assertNoConstitution(payload, prompt, catalog.categoryProfiles[card.primaryCategory]);
    const leakSignals = buildLeakSignals({ companyNames: ['PayrollFox'], audiencePhrases: ['regional payroll directors'], brandHexValues: ['#fc1234'] });
    if (scanExactSignals(payload, leakSignals).length || scanExactSignals(prompt, leakSignals).length) throw new Error('Project context entered the sealed brief.');
    const request = await buildSealedRequest(payload, evidence.destination, { projectRoot: project, libraryRoot: root, leakSignals });
    const h0Output = resolve(fixtureRoot, 'h0-output'); await mkdir(h0Output, { recursive: true }); await writeFile(resolve(h0Output, 'index.html'), fixtureHtml, 'utf8');
    const imported = await importPreview(h0Output, project, 'D01-H0', { leakSignals, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: payload.output.h0, expectedGeometry: payload.output.geometry, expectedCodeNativeMethod: payload.futureHero.permittedMethod, sourceStillInspected: true });

    const state = emptyState(project); const paths = statePaths(project); await mkdir(paths.inspirationRoot, { recursive: true });
    const apply = (event) => applyEvent(project, paths, state, event, { quiet: true });
    await apply({ type: 'intake.updated', payload: { introduction: 'Kestrel analytics', intent: 'Book a demo with calm confidence', audience: 'Small startup founders', materialsAndRequirements: 'Responsive and accessible' } });
    await apply({ type: 'workflow.status-changed', payload: { status: 'architecture' } });
    await apply({ type: 'architecture.updated', payload: { status: 'approved', pages: ['Home', 'Reports'], sections: ['Hero', 'Evidence', 'Workflow', 'CTA'], primaryJourney: 'Understand the platform and book a demo' } });
    await apply({ type: 'workflow.status-changed', payload: { status: 'directions' } });

    let batch = createAutomaticBatch(catalog, { pageUse: 'marketing', seed: 'tutorial-fixture', excluded: [] });
    const firstSlot = batch.items.find((item) => item.category === card.primaryCategory);
    const customized = applyBatchActions(catalog, batch, [{ type: 'SWAP', slotId: firstSlot.slotId, replacementId: card.id }, { type: 'ACCEPT ALL' }]);
    if (customized.issues.length) throw new Error(customized.issues.map((issue) => issue.message).join('; '));
    batch = customized.batch;
    await apply({ type: 'references.batch-saved', payload: batch });

    for (const [index, item] of batch.items.entries()) {
      const id = `D${String(index + 1).padStart(2, '0')}-H0`; const anchor = catalog.cards.find((candidate) => candidate.id === item.session.currentSet.anchor.id);
      if (id !== 'D01-H0') await writePreview(paths, id, fixtureHtml);
      await apply({ type: 'generation.appended', payload: { id, directionId: id, parent: null, stage: 'direction', status: id === 'D01-H0' ? 'selected' : 'candidate', executionHost: 'sealed-runner', label: `${item.category} direction`, category: item.category, thesis: 'One-card focused direction.', references: [{ id: anchor.id, role: 'anchor' }], preview: `../previews/${id}/index.html`, previewScope: focusedScope, createdAt: new Date().toISOString() } });
      await apply({ type: 'visual.isolation-recorded', payload: { generationId: id, mode: 'subscription-ephemeral', isolated: false, contextLimited: true, authenticatedWith: 'chatgpt', runner: 'codex-cli', outputMode: 'structured-manifest', workspaceFingerprint: fingerprint({ id, card: anchor.id }) } });
    }
    await apply({ type: 'workflow.status-changed', payload: { status: 'references' } });
    const tweakableDecisions = { typography: ['approved-display', 'approved-compact'], lineLength: { min: 42, max: 72 }, spacing: { min: 4, max: 12 }, bodyDensity: ['quiet', 'compact'], accent: ['sage', 'ink'], motion: ['reduced', 'measured'] };
    const contractFingerprint = fingerprint({ cardId: card.id, tweakableDecisions });
    await apply({ type: 'visual.anchor-contract-frozen', payload: { cardId: card.id, fingerprint: contractFingerprint, tweakableDecisions } });
    await apply({ type: 'workflow.status-changed', payload: { status: 'variants' } });

    const batchId = 'D01-V01'; const differencePlan = { A: ['hierarchy', 'body-format', 'navigation'], B: ['rhythm', 'density', 'composition'], C: ['hierarchy', 'rhythm', 'composition'] }; const batchPlanFingerprint = fingerprint(differencePlan);
    for (const ordinal of ['A', 'B', 'C']) {
      const id = `${batchId}-${ordinal}`; await writePreview(paths, id, homepageHtml('homepage-variant'));
      await apply({ type: 'generation.appended', payload: { id, parent: 'D01-H0', stage: 'variant', status: ordinal === 'B' ? 'selected' : 'candidate', executionHost: 'parent-project-codex', batchId, variantOrdinal: ordinal, batchPlanFingerprint, differenceAxes: differencePlan[ordinal], label: `Homepage variant ${ordinal}`, category: card.primaryCategory, thesis: `Complete homepage variant ${ordinal}.`, references: [{ id: card.id, role: 'anchor' }], preview: `../previews/${id}/index.html`, previewScope: { kind: 'complete-homepage-variant', pageCount: 1, completeHomepage: true, includesDensePage: false, futureImageSlot: 'empty-flat' }, createdAt: new Date().toISOString() } });
    }
    await apply({ type: 'workflow.status-changed', payload: { status: 'build-path' } });
    const buildId = `${batchId}-B-O-H0`; await writePreview(paths, buildId, homepageHtml('build-path-shell')); const buildLayout = await fingerprintProtectedLayout(resolve(paths.previews, buildId));
    await apply({ type: 'generation.appended', payload: { id: buildId, parent: `${batchId}-B`, stage: 'build-path', status: 'selected', executionHost: 'parent-project-codex', buildPath: 'original', clonePreflight: null, heroState: 'H0', recipeKind: card.imageRecipe.kind, contractFingerprint, layoutFingerprint: buildLayout.fingerprint, label: 'Original H0 shell', category: card.primaryCategory, thesis: 'Selected variant promoted through Original.', references: [{ id: card.id, role: 'anchor' }], preview: `../previews/${buildId}/index.html`, previewScope: { kind: 'build-path-shell', completeHomepage: true, includesDensePage: false }, createdAt: new Date().toISOString() } });
    await apply({ type: 'workflow.status-changed', payload: { status: 'hero' } });

    const heroBatchId = `${buildId}-HB01`; const recipeFingerprint = fingerprint(card.imageRecipe);
    for (const heroState of ['H1', 'H2', 'H3', 'H4']) {
      const id = `${heroBatchId}-${heroState}`; const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1280"><rect width="2048" height="1280" fill="#b9c7aa"/><path d="M0 ${300 + (Number(heroState.slice(1)) * 80)} Q1024 0 2048 800" fill="none" stroke="#163b27" stroke-width="24"/></svg>`); const asset = { name: `${heroState}.svg`, bytes: svg };
      await writePreview(paths, id, homepageHtml('hero-alternative', `<img data-generated-hero-media src="assets/${asset.name}" alt="Generated abstract contour alternative">`), asset);
      const observedLayout = await fingerprintProtectedLayout(resolve(paths.previews, id)); if (observedLayout.fingerprint !== buildLayout.fingerprint) throw new Error(`${heroState} changed protected layout.`);
      await apply({ type: 'generation.appended', payload: { id, parent: buildId, stage: 'hero', status: heroState === 'H2' ? 'selected' : 'candidate', executionHost: 'parent-project-codex', heroBatchId, heroState, provider: 'codex', recipeKind: card.imageRecipe.kind, recipeFingerprint, assetSha256: fingerprint(svg), assetReceipt: `assets/${asset.name}`, contractFingerprint, layoutFingerprint: observedLayout.fingerprint, label: `Hero ${heroState}`, category: card.primaryCategory, thesis: `Generated hero alternative ${heroState}.`, references: [{ id: card.id, role: 'anchor' }], preview: `../previews/${id}/index.html`, createdAt: new Date().toISOString() } });
    }
    await apply({ type: 'visual.tweak-bar-recorded', payload: { status: 'active', generationId: `${heroBatchId}-H2`, contractFingerprint, controls: ['typography', 'lineLength', 'spacing', 'bodyDensity', 'accent', 'motion'] } });
    await apply({ type: 'workflow.status-changed', payload: { status: 'implementation' } });

    const homepageId = 'D01-IMPLEMENTATION-HOME'; const denseId = 'D01-IMPLEMENTATION-DENSE';
    await writePreview(paths, homepageId, homepageHtml('implementation-homepage', '<img data-generated-hero-media src="../D01-V01-B-O-H0-HB01-H2/assets/H2.svg" alt="Selected generated hero">'));
    await writePreview(paths, denseId, homepageHtml('implementation-dense'));
    await apply({ type: 'generation.appended', payload: { id: homepageId, parent: `${heroBatchId}-H2`, stage: 'implementation', status: 'selected', executionHost: 'parent-project-codex', label: 'Implemented homepage', category: card.primaryCategory, thesis: 'Selected homepage implementation.', references: [{ id: card.id, role: 'anchor' }], preview: `../previews/${homepageId}/index.html`, createdAt: new Date().toISOString() } });
    await apply({ type: 'generation.appended', payload: { id: denseId, parent: `${heroBatchId}-H2`, stage: 'implementation', status: 'candidate', executionHost: 'parent-project-codex', label: 'Representative dense page', category: card.primaryCategory, thesis: 'Dense-page conformance candidate.', references: [{ id: card.id, role: 'anchor' }], preview: `../previews/${denseId}/index.html`, createdAt: new Date().toISOString() } });
    await apply({ type: 'visual.tweak-bar-recorded', payload: { status: 'applied', generationId: homepageId, contractFingerprint, valuesFingerprint: fingerprint({ typography: 'approved-display', bodyDensity: 'quiet' }) } });
    await apply({ type: 'visual.design-gate-recorded', payload: { status: 'passed', homepageGenerationId: homepageId, densePageGenerationId: denseId } });
    await apply({ type: 'workflow.status-changed', payload: { status: 'polish' } });
    const finalId = 'D01-FINAL'; await writePreview(paths, finalId, homepageHtml('final'));
    await apply({ type: 'generation.appended', payload: { id: finalId, parent: homepageId, stage: 'final', status: 'selected', executionHost: 'parent-project-codex', label: 'Production final', category: card.primaryCategory, thesis: 'Polished production result.', references: [{ id: card.id, role: 'anchor' }], preview: `../previews/${finalId}/index.html`, createdAt: new Date().toISOString() } });
    await apply({ type: 'visual.tweak-bar-recorded', payload: { status: 'production-excluded', generationId: finalId, contractFingerprint, productionBuildFingerprint: fingerprint(homepageHtml('final')), markersFound: [] } });
    await apply({ type: 'verification.completed', payload: { checks: ['responsive widths', 'keyboard flow', 'contrast', 'reduced motion', 'production build'] } });
    await apply({ type: 'workflow.status-changed', payload: { status: 'complete' } });
    const validationErrors = validateState(state, project, catalog); if (validationErrors.length) throw new Error(validationErrors.join('; '));
    const designReview = await readFile(paths.designReview, 'utf8');
    if (!designReview.includes(`"id": "${finalId}"`) || !designReview.includes(`"path": "previews/${finalId}/index.html"`)) throw new Error('Consolidated Design Review did not retain the final generation.');
    if (designReview.includes('PayrollFox') || designReview.includes('regional payroll directors') || designReview.includes('#fc1234')) throw new Error('Intake leak signals entered the consolidated Design Review.');

    const result = { passed: true, provesModelQuality: false, schemaVersion: state.schemaVersion, status: state.status, categoryCount: coverage.categoryCount, directionCount: state.generations.filter((item) => item.stage === 'direction').length, variantCount: state.generations.filter((item) => item.stage === 'variant').length, heroCount: state.generations.filter((item) => item.stage === 'hero').length, requestFingerprint: fingerprint(request), requestModel: request.model, importedPreview: imported.preview, protectedLayoutFingerprint: buildLayout.fingerprint, tweakBarStatus: state.visualControl.tweakBar.status };
    return options.keep ? { ...result, project } : result;
  } finally { if (!options.keep) await rm(fixtureRoot, { recursive: true, force: true }); }
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) runFixture({ keep: process.argv.includes('--keep') }).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });

export { runFixture };
