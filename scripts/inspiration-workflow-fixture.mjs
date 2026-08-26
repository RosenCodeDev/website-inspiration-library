#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync, writeFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './export-workflow-catalog.mjs';
import { createSession } from '../skills/design-taste-injection/scripts/reference-selection.mjs';
import { createRunWorkspace, runIsolationPreflight } from '../skills/design-taste-injection/scripts/isolation-runner.mjs';
import {
  assertNoConstitution, buildLeakSignals, buildSealedPayload, importPreview, renderVisualPrompt,
  resolveEvidence, scanExactSignals, scanSourceIdentity,
} from '../skills/design-taste-injection/scripts/visual-contract.mjs';

const fingerprint = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const contractFor = (cardId, h0Mode) => ({
  schemaVersion: 1,
  scope: 'hero-and-opening-module',
  anchorCardId: cardId,
  supportingCardIds: [],
  sourceStillInspected: true,
  motionMediaUsed: false,
  heroCount: 1,
  openingModuleCount: 1,
  h0Mode,
  decorativeCodeArtUsedAsFutureImage: false,
});
const page = (title, dense = false) => `<!doctype html><html><head><meta charset="utf-8"><style>:root{--paper:#f1eee6;--ink:#181816;--rule:#918b80}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 Arial,sans-serif}main{max-width:1180px;margin:auto;padding:48px}h1,h2{font-family:Georgia,serif;letter-spacing:-.04em}.hero{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center}.slot{aspect-ratio:4/3;background:#d8d4ca;border:1px solid var(--rule)}.module{border-top:1px solid var(--rule);margin-top:40px;padding-top:24px}${dense ? '.hero{display:block}.slot{display:none}.rows{display:grid;gap:8px}.rows div{padding:14px 0;border-bottom:1px solid var(--rule)}' : ''}</style></head><body><main><section class="hero"><div><small>NEUTRAL LABEL</small><h1>${title}</h1><p>Placeholder content stays inside the frozen typographic and spacing envelopes.</p><button>Primary action</button></div><div class="slot" aria-label="Reserved future image"></div></section><section class="module"><h2>${dense ? 'Dense content structure' : 'Opening module'}</h2><div class="rows">${dense ? '<div>Functional row one</div><div>Functional row two</div><div>Functional row three</div>' : '<p>One opening module carries the same visual language.</p>'}</div></section></main></body></html>`;

const runFixture = async (options = {}) => {
  const root = resolve(import.meta.dirname, '..');
  const fixtureRoot = await mkdtemp(resolve(tmpdir(), 'inspiration-workflow-fixture-'));
  const project = resolve(fixtureRoot, 'website-project');
  await mkdir(project, { recursive: true });
  try {
    const catalog = await loadCatalog();
    const category = 'Print-Tech Paper';
    const request = { category, pageUse: 'marketing', seed: 'end-to-end-fixture', pinned: [], excluded: [] };
    const session = createSession(catalog, request);
    if (session.currentSet.supporting.length) throw new Error('Fixture selected supporting cards.');
    const card = catalog.cards.find((item) => item.id === session.currentSet.anchor.id);
    const evidence = await resolveEvidence(catalog, project, card.id);
    const h0Mode = card.imageRecipe.kind === 'none' ? 'follow-reviewed-none-reason' : 'reserved-image-hole-with-flat-stand-in';
    const payload = buildSealedPayload(card, { directionId: 'FIXTURE', generationId: 'FIXTURE-H0', sha256: evidence.record.sha256 });
    const prompt = renderVisualPrompt(payload);
    assertNoConstitution(payload, prompt, catalog.categoryProfiles[category]);
    if (!payload.card.observedBrief.Composition || !payload.card.observedBrief.Avoid) throw new Error('Card-authored Composition or Avoid guidance was lost.');
    const leakSignals = buildLeakSignals({ companyNames: ['PayrollFox'], audiencePhrases: ['regional payroll directors'], brandHexValues: ['#fc1234'] });
    if (scanExactSignals(payload, leakSignals).length || scanExactSignals(prompt, leakSignals).length) throw new Error('Project context entered the sealed visual brief.');
    const preflight = await runIsolationPreflight(project, root, {
      run: (_command, args) => {
        const instruction = args.at(-1);
        const report = instruction.match(/Write (.+?) as strict JSON/)?.[1];
        if (!report) return { status: 1, stdout: '', stderr: 'fixture could not locate preflight report' };
        writeFileSync(report, JSON.stringify({ allowedRead: true, projectRead: false, libraryRead: false, projectEnumerated: false, libraryEnumerated: false, tempWrite: true }));
        return { status: 0, stdout: 'fixture preflight', stderr: '' };
      },
    });
    if (!preflight.available) throw new Error('Fixture isolation preflight failed.');
    const workspace = await createRunWorkspace(evidence.destination, payload);
    await writeFile(resolve(workspace.output, 'index.html'), page('A reference-controlled first pass'), 'utf8');
    await writeFile(resolve(workspace.output, 'output-contract.json'), `${JSON.stringify(contractFor(card.id, h0Mode), null, 2)}\n`, 'utf8');
    const identityMatches = scanSourceIdentity(await readFile(resolve(workspace.output, 'index.html'), 'utf8'), card.sourceIdentity);
    if (identityMatches.length) throw new Error(`Fixture leaked source identity: ${identityMatches[0].value}`);
    const imported = await importPreview(workspace.output, project, 'FIXTURE-H0', { leakSignals, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: h0Mode });
    const anchorSystem = {
      cardId: card.id,
      typography: payload.card.observedBrief.Typography,
      palette: payload.card.observedBrief.Palette,
      spacing: payload.card.observedBrief.Spacing,
      texture: payload.card.observedBrief.Texture,
      never: payload.card.observedBrief.Avoid,
    };
    const complete = resolve(project, '.inspiration', 'fixture-complete-pages');
    await mkdir(complete, { recursive: true });
    await Promise.all([
      writeFile(resolve(complete, 'homepage.html'), page('Complete homepage'), 'utf8'),
      writeFile(resolve(complete, 'dense-content.html'), page('Reference documentation', true), 'utf8'),
      writeFile(resolve(complete, 'anchor-system.json'), `${JSON.stringify(anchorSystem, null, 2)}\n`, 'utf8'),
    ]);
    const result = {
      passed: true,
      project,
      anchor: { id: card.id, name: card.title, category: card.primaryCategory },
      selectionInputKeys: Object.keys(session.request),
      preflight,
      evidence: evidence.record,
      payloadHasComposition: Boolean(payload.card.observedBrief.Composition),
      payloadHasAvoid: Boolean(payload.card.observedBrief.Avoid),
      supportCount: session.currentSet.supporting.length,
      motionMediaUsed: false,
      importedPreview: imported.preview,
      anchorContractFingerprint: fingerprint(anchorSystem),
      pages: ['homepage.html', 'dense-content.html'],
      projectContextLeakMatches: [],
      identityMatches: [],
    };
    if (options.keep) return result;
    return { ...result, project: '(temporary fixture removed)' };
  } finally {
    if (!options.keep) await rm(fixtureRoot, { recursive: true, force: true });
  }
};

const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) runFixture({ keep: process.argv.includes('--keep') }).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });

export { runFixture };
