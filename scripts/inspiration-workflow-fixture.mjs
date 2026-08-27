#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './export-workflow-catalog.mjs';
import { createSession } from '../skills/design-taste-injection/scripts/reference-selection.mjs';
import { buildSealedRequest } from '../skills/design-taste-injection/scripts/isolation-runner.mjs';
import { assertNoConstitution, buildLeakSignals, buildSealedPayload, importPreview, renderVisualPrompt, resolveEvidence, scanExactSignals } from '../skills/design-taste-injection/scripts/visual-contract.mjs';

const fingerprint = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fixtureHtml = `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#eef0df;color:#162318;font:16px/1.5 Arial,sans-serif}main{max-width:1200px;margin:auto;padding:48px}[data-inspiration-hero]{min-height:650px;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:40px}[data-future-image-slot]{width:100%;aspect-ratio:16/10;background:#cbd3bd}[data-opening-module]{min-height:220px;border-top:1px solid #162318;padding-top:32px}</style></head><body><main><section data-inspiration-hero><div data-protected-copy-region><small>NEUTRAL LABEL</small><h1>Reference-controlled fixture</h1><p>This deterministic page proves request, validation, and import plumbing—not design taste.</p></div><div data-future-image-slot></div></section><section data-opening-module><h2>Opening module</h2><p>Neutral placeholder content.</p></section></main></body></html>`;

const runFixture = async (options = {}) => {
  const root = resolve(import.meta.dirname, '..'); const fixtureRoot = await mkdtemp(resolve(tmpdir(), 'inspiration-plumbing-')); const project = resolve(fixtureRoot, 'project'); await mkdir(project, { recursive: true });
  try {
    const catalog = await loadCatalog();
    const session = createSession(catalog, { category: 'Print-Tech Paper', pageUse: 'marketing', seed: 'plumbing-fixture', pinned: [{ id: 'site-spade', role: 'anchor' }], excluded: [] });
    const card = catalog.cards.find((item) => item.id === session.currentSet.anchor.id); const evidence = await resolveEvidence(catalog, project, card.id);
    const payload = buildSealedPayload(card, { directionId: 'FIXTURE', generationId: 'FIXTURE-H0', sha256: evidence.record.sha256 }); const prompt = renderVisualPrompt(payload);
    assertNoConstitution(payload, prompt, catalog.categoryProfiles[card.primaryCategory]);
    const leakSignals = buildLeakSignals({ companyNames: ['PayrollFox'], audiencePhrases: ['regional payroll directors'], brandHexValues: ['#fc1234'] });
    if (scanExactSignals(payload, leakSignals).length || scanExactSignals(prompt, leakSignals).length) throw new Error('Project context entered the sealed brief.');
    const request = await buildSealedRequest(payload, evidence.destination, { projectRoot: project, libraryRoot: root, leakSignals });
    const output = resolve(fixtureRoot, 'output'); await mkdir(output, { recursive: true }); await writeFile(resolve(output, 'index.html'), fixtureHtml, 'utf8');
    const imported = await importPreview(output, project, 'FIXTURE-H0', { leakSignals, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: payload.output.h0, expectedGeometry: payload.output.geometry, expectedCodeNativeMethod: payload.futureHero.permittedMethod, sourceStillInspected: true });
    const result = { passed: true, provesModelQuality: false, cardId: card.id, requestFingerprint: fingerprint(request), requestModel: request.model, supportingCards: session.currentSet.supporting.length, importedPreview: imported.preview, coordinatorContract: imported.contract };
    return options.keep ? { ...result, project } : result;
  } finally { if (!options.keep) await rm(fixtureRoot, { recursive: true, force: true }); }
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) runFixture({ keep: process.argv.includes('--keep') }).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });

export { runFixture };
