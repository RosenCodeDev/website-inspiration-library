import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { afterAll, describe, expect, it } from 'vitest';
import { PNG } from 'pngjs';

const root = realpathSync(process.cwd());
const skillRoot = resolve(root, 'skills', 'design-taste-injection');
const scratch = mkdtempSync(join(tmpdir(), 'design-taste-test-'));
const rotationPath = resolve(scratch, 'rotation-v1.json');
const env = { DESIGN_TASTE_LIBRARY_ROOT: root, DESIGN_TASTE_ROTATION_PATH: rotationPath };
const runNode = (script: string, args: string[] = [], extraEnv: NodeJS.ProcessEnv = {}) => spawnSync(
  process.execPath,
  [script, ...args],
  { cwd: root, encoding: 'utf8', env: { ...process.env, ...env, ...extraEnv }, maxBuffer: 20 * 1024 * 1024 },
);
const focusedDirectionScope = () => ({ kind: 'focused-category-preview', pageCount: 1, sections: ['hero', 'opening-module'], completeSite: false });
const loadCatalog = () => JSON.parse(runNode(resolve(skillRoot, 'scripts', 'library.mjs'), ['catalog']).stdout);
const makeImpeccableFixture = (folder: string) => {
  mkdirSync(folder, { recursive: true });
  writeFileSync(resolve(folder, 'SKILL.md'), '---\nname: impeccable\ndescription: Project-local frontend polish.\n---\n');
};

afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('inspiration-controlled design workflow', () => {
  it('has a concise project-scoped entrypoint and imports maintained scripts without side effects', () => {
    const skill = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8');
    expect(skill).toContain('name: design-taste-injection');
    expect(skill).toContain('npm run setup:project');
    expect(skill).toContain('`H0`');
    expect(skill).toContain('focused-category-preview');
    expect(skill).toContain('SHOW ANOTHER CARD');
    const files = [
      'scripts/setup-project.mjs', 'scripts/check-project.mjs', 'scripts/doctor-project.mjs',
      'scripts/skill-integrity.mjs', 'scripts/export-workflow-catalog.mjs', 'scripts/validate-skill.mjs',
      'scripts/verify-temp-install.mjs', 'scripts/controlled-clone-fixture.mjs', 'scripts/clone-plumbing-smoke.mjs',
      'skills/design-taste-injection/scripts/library.mjs', 'skills/design-taste-injection/scripts/project-state.mjs',
      'skills/design-taste-injection/scripts/reference-selection.mjs', 'skills/design-taste-injection/scripts/rotation-ledger.mjs',
      'skills/design-taste-injection/scripts/visual-contract.mjs', 'skills/design-taste-injection/scripts/isolation-runner.mjs',
      'skills/design-taste-injection/scripts/clone-runtime.mjs', 'skills/design-taste-injection/scripts/serve-workbench.mjs',
    ].map((file) => pathToFileURL(resolve(root, file)).href);
    const imported = spawnSync(process.execPath, ['-e', `Promise.all(${JSON.stringify(files)}.map((file)=>import(file)))`], { cwd: root, encoding: 'utf8' });
    expect(imported.status, imported.stderr).toBe(0);
    expect(imported.stdout).toBe('');
  }, 20_000);

  it('exports the validated live catalog with reviewed identity metadata', () => {
    const catalog = loadCatalog();
    expect(catalog.schemaVersion).toBe(3);
    expect(catalog.cards).toHaveLength(63);
    expect(catalog.categories).toHaveLength(7);
    for (const card of catalog.cards) {
      expect(card.fingerprint).toMatch(/^[a-f0-9]{16}$/);
      expect(card.sourceIdentity).toEqual(expect.objectContaining({
        sourceNames: expect.any(Array), aliases: expect.any(Array), domains: expect.any(Array), exactCopy: expect.any(Array),
        distinctiveClaims: expect.any(Array), knownMarkAssetIds: expect.any(Array), sourceSpecificExclusions: expect.any(Array),
      }));
    }
  });

  it('selects one context-free anchor from a ten-point quality band and never adds supports', async () => {
    const catalog = loadCatalog();
    const script = resolve(skillRoot, 'scripts', 'reference-selection.mjs');
    const { createSession, baseScore, eligibleQualityBand } = await import(`${pathToFileURL(script).href}?selection=${Date.now()}`);
    const request = {
      category: 'Print-Tech Paper', pageUse: 'marketing', seed: 'review-seed', pinned: [], excluded: [],
      projectName: 'Secret Payroll', audience: 'CFOs', industry: 'finance', brandColors: ['#ff0000'], fitById: { 'site-spade': 0 },
    };
    const session = createSession(catalog, request);
    const band = eligibleQualityBand(catalog, session.request);
    expect(session.request).toEqual({ category: 'Print-Tech Paper', pageUse: 'marketing', seed: 'review-seed', pinned: [], excluded: [] });
    expect(session.currentSet.supporting).toEqual([]);
    expect(session.currentSet.anchor.role).toBe('anchor');
    expect(catalog.cards.find((card: any) => card.id === session.currentSet.anchor.id).primaryCategory).toBe('Print-Tech Paper');
    expect(Math.max(...band.map((item: any) => item.score)) - Math.min(...band.map((item: any) => item.score))).toBeLessThanOrEqual(10);
    expect(session.currentSet.anchor.score).toBe(baseScore(catalog.cards.find((card: any) => card.id === session.currentSet.anchor.id), session.request));
  });

  it('uses a seeded exhaustion-before-repeat shuffle with refresh, pins, and exclusions', async () => {
    const catalog = loadCatalog();
    const script = resolve(skillRoot, 'scripts', 'reference-selection.mjs');
    const { applyAction, createSession, eligibleQualityBand } = await import(`${pathToFileURL(script).href}?rotation=${Date.now()}`);
    const request = { category: 'Print-Tech Paper', pageUse: 'marketing', seed: 'fixed-seed', pinned: [], excluded: [] };
    let session = createSession(catalog, request);
    const bandSize = eligibleQualityBand(catalog, session.request).length;
    const firstCycle: string[] = [];
    for (let index = 0; index < bandSize; index += 1) {
      firstCycle.push(session.currentSet.anchor.id);
      if (index < bandSize - 1) session = applyAction(catalog, session, { type: 'SHOW ANOTHER CARD' });
    }
    expect(new Set(firstCycle).size).toBe(bandSize);
    session = applyAction(catalog, session, { type: 'SHOW ANOTHER CARD' });
    expect(session.rotation.cycle).toBe(1);
    const initial = createSession(catalog, request);
    const pinned = applyAction(catalog, initial, { type: 'PIN THIS CARD', cardId: initial.currentSet.anchor.id });
    expect(() => applyAction(catalog, pinned, { type: 'SHOW ANOTHER CARD' })).toThrow(/Unpin/);
    const excludedId = session.currentSet.anchor.id;
    const replaced = applyAction(catalog, session, { type: 'DO NOT USE THIS CARD', cardId: excludedId });
    expect(replaced.excluded).toContain(excludedId);
    expect(replaced.currentSet.anchor.id).not.toBe(excludedId);
    expect(createSession(catalog, request).currentSet.anchor.id).toBe(initial.currentSet.anchor.id);
  });

  it('keeps reviewed kind:none cards eligible and rejects unusable recipes', async () => {
    const catalog = loadCatalog();
    const { anchorEligible } = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'reference-selection.mjs')).href}?none=${Date.now()}`);
    const card = catalog.cards.find((item: any) => item.imageRecipe.kind === 'none' && item.imageRecipe.reason.length >= 60);
    expect(card).toBeTruthy();
    expect(anchorEligible(card, { category: card.primaryCategory, pageUse: card.workflow.anchorUses[0] })).toBe(true);
    expect(anchorEligible({ ...card, imageRecipe: { kind: 'none', reason: '' } }, { category: card.primaryCategory, pageUse: card.workflow.anchorUses[0] })).toBe(false);
  });

  it('persists only a minimal user-level rotation ledger and reconciles catalog changes', async () => {
    const module = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'rotation-ledger.mjs')).href}?ledger=${Date.now()}`);
    expect(module.ledgerPath(process.env)).toMatch(/website-inspiration-library[\\/]rotation-v1\.json$/);
    let ledger = module.emptyLedger('catalog-a');
    ledger = module.saveBag(ledger, { category: 'Print-Tech Paper', pageRole: 'marketing', seed: 's', cycle: 0, shownIds: ['a', 'b'], updatedAt: new Date().toISOString() });
    await module.writeLedger(rotationPath, ledger);
    const saved = JSON.parse(readFileSync(rotationPath, 'utf8'));
    expect(saved).toEqual(ledger);
    expect(JSON.stringify(saved)).not.toMatch(/projectId|projectName|score|industry|audience|brand/i);
    const changed = await module.readLedger('catalog-b', { path: rotationPath, validIds: new Set(['b', 'c']) });
    expect(changed.ledger.catalogFingerprint).toBe('catalog-b');
    expect(changed.ledger.bags['Print-Tech Paper::marketing'].shownIds).toEqual(['b']);
  });

  it('builds a still-only sealed payload and preserves the canonical recipe verbatim', async () => {
    const catalog = loadCatalog();
    const card = catalog.cards.find((item: any) => item.imageRecipe.kind !== 'none');
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?payload=${Date.now()}`);
    const payload = visual.buildSealedPayload(card, { directionId: 'D01', generationId: 'D01-H0', stillPath: 'input/reference.png', sha256: 'a'.repeat(64) });
    const prompt = visual.renderVisualPrompt(payload);
    expect(payload.futureHero.prompt).toBe(card.imageRecipe.prompt);
    expect(payload.card.observedBrief.Composition).toBeTruthy();
    expect(payload.card.observedBrief.Avoid).toBeTruthy();
    expect(prompt).toContain(card.imageRecipe.prompt);
    expect(prompt).toMatch(/AESTHETIC[\s\S]*REFERENCE[\s\S]*FUTURE HERO[\s\S]*PLACEMENT[\s\S]*OUTPUT CONTRACT/);
    expect(prompt).toContain('Do not inspect any motion media');
    expect(JSON.stringify(payload)).not.toMatch(/categoryProfile|categoryConstitution|motionClip|projectName|audience|brandColors/);
  });

  it('excludes exact constitution sentences by provenance without rejecting card-authored Composition or Avoid', async () => {
    const card = loadCatalog().cards[0];
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?constitution=${Date.now()}`);
    const payload = visual.buildSealedPayload(card);
    expect(() => visual.assertNoConstitution(payload, visual.renderVisualPrompt(payload), { thesis: 'UNIQUE CATEGORY SENTINEL SENTENCE' })).not.toThrow();
    const contaminated = structuredClone(payload);
    contaminated.card.descriptor = 'UNIQUE CATEGORY SENTINEL SENTENCE';
    expect(() => visual.assertNoConstitution(contaminated, visual.renderVisualPrompt(contaminated), { thesis: 'UNIQUE CATEGORY SENTINEL SENTENCE' })).toThrow(/constitution sentence/i);
    expect(Object.keys(payload.card.observedBrief)).toEqual(expect.arrayContaining(['Composition', 'Avoid']));
  });

  it('uses intake-derived and reviewed identity signals as blocking guardrails without heuristics', async () => {
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?scan=${Date.now()}`);
    const signals = visual.buildLeakSignals({ companyNames: ['Acme Ledger'], domains: ['acme.test'], brandHexValues: ['#12ab34'], audiencePhrases: ['regional payroll teams'] });
    expect(visual.scanExactSignals('A neutral preview for Acme Ledger.', signals)[0].value).toBe('Acme Ledger');
    expect(visual.scanExactSignals('A neutral preview.', signals)).toEqual([]);
    const identity = { sourceNames: ['Spade'], aliases: [], domains: ['spade.com'], exactCopy: ['Make it count'], distinctiveClaims: [], knownMarkAssetIds: [], sourceSpecificExclusions: [] };
    expect(visual.scanSourceIdentity('This says Make it count.', identity)[0].value).toBe('Make it count');
    const source = readFileSync(resolve(skillRoot, 'scripts', 'visual-contract.mjs'), 'utf8');
    expect(source).not.toMatch(/ocr|logo.shape|color.*identity|delete.*logo/i);
  });

  it('resolves evidence by stable card ID, fingerprints it, and imports only validated temporary previews', async () => {
    const catalog = loadCatalog();
    const card = catalog.cards[0];
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?evidence=${Date.now()}`);
    const project = resolve(scratch, 'evidence-project');
    const evidence = await visual.resolveEvidence(catalog, project, card.id);
    expect(evidence.record.cardId).toBe(card.id);
    expect(evidence.record.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(existsSync(evidence.destination)).toBe(true);
    expect(evidence.record.inspected).toBe(false);
    const temporary = resolve(scratch, 'temporary-preview');
    mkdirSync(temporary, { recursive: true });
    writeFileSync(resolve(temporary, 'index.html'), '<!doctype html><link rel="stylesheet" href="styles.css"><main>H0</main>');
    writeFileSync(resolve(temporary, 'styles.css'), 'main{display:grid}');
    writeFileSync(resolve(temporary, 'output-contract.json'), JSON.stringify({ schemaVersion: 1, scope: 'hero-and-opening-module', anchorCardId: card.id, supportingCardIds: [], sourceStillInspected: true, motionMediaUsed: false, heroCount: 1, openingModuleCount: 1, h0Mode: 'reserved-image-hole-with-flat-stand-in', decorativeCodeArtUsedAsFutureImage: false }));
    const imported = await visual.importPreview(temporary, project, 'D01-H0', { leakSignals: { schemaVersion: 1, signals: [] }, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: 'reserved-image-hole-with-flat-stand-in' });
    expect(imported.preview).toBe('../previews/D01-H0/index.html');
    expect(existsSync(resolve(project, '.inspiration', 'previews', 'D01-H0', 'index.html'))).toBe(true);
    const unsafe = resolve(scratch, 'unsafe-preview');
    mkdirSync(unsafe, { recursive: true });
    writeFileSync(resolve(unsafe, 'index.html'), '<script src="https://example.com/a.js"></script>');
    await expect(visual.importPreview(unsafe, project, 'D02-H0', { leakSignals: { schemaVersion: 1, signals: [] }, sourceIdentity: card.sourceIdentity })).rejects.toThrow(/external|absolute/i);
  });

  it('defines the isolation ladder and a bounded non-interactive payload-only command', async () => {
    const isolation = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'isolation-runner.mjs')).href}?isolation=${Date.now()}`);
    expect(isolation.codexArgs('PROMPT')).toEqual(expect.arrayContaining(['exec', '--ephemeral', '--sandbox', 'workspace-write', '--ask-for-approval', 'never']));
    expect(isolation.isolationLabel({ freshAgentAvailable: true })).toBe('fresh-agent');
    expect(isolation.isolationLabel({ payloadOnlyPreflight: { available: true } })).toBe('payload-only');
    expect(isolation.isolationLabel({ degradedApproved: true })).toBe('degraded');
    expect(isolation.isolationLabel({})).toBeNull();
    const source = readFileSync(resolve(skillRoot, 'references', 'workflow.md'), 'utf8');
    expect(source).toMatch(/fresh-agent[\s\S]*payload-only[\s\S]*degraded/);
    expect(source.toLowerCase()).toContain('explicit user approval');
  });

  it('initializes schema 6 state, records anchor-only generations, and persists visual controls through events', () => {
    const project = resolve(scratch, 'state-project');
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    expect(runNode(script, ['init', project]).status).toBe(0);
    const card = loadCatalog().cards.find((item: any) => item.primaryCategory === 'Print-Tech Paper');
    const preview = resolve(project, '.inspiration', 'previews', 'D01');
    mkdirSync(preview, { recursive: true });
    writeFileSync(resolve(preview, 'index.html'), '<!doctype html><html><body><main>Direction preview D01</main></body></html>');
    const generationPath = resolve(scratch, 'direction.json');
    writeFileSync(generationPath, JSON.stringify({
      id: 'D01', parent: null, stage: 'direction', status: 'selected', label: 'Direction', category: card.primaryCategory,
      thesis: 'One-card visual direction.', references: [{ id: card.id, role: 'anchor' }], preview: '../previews/D01/index.html',
      previewScope: focusedDirectionScope(), createdAt: new Date().toISOString(),
    }));
    const appended = runNode(script, ['append-generation', project, generationPath]);
    expect(appended.status, appended.stderr).toBe(0);
    const eventPath = resolve(scratch, 'visual-event.json');
    writeFileSync(eventPath, JSON.stringify({ type: 'visual.isolation-recorded', payload: { mode: 'payload-only', preflight: { available: true, version: 1 } } }));
    expect(runNode(script, ['apply-event', project, eventPath]).status).toBe(0);
    writeFileSync(eventPath, JSON.stringify({ type: 'visual.route-conformance-recorded', payload: { route: '/pricing', status: 'passed', checks: ['type', 'palette', 'spacing'] } }));
    expect(runNode(script, ['apply-event', project, eventPath]).status).toBe(0);
    const state = JSON.parse(readFileSync(resolve(project, '.inspiration', 'state.json'), 'utf8'));
    expect(state.schemaVersion).toBe(6);
    expect(state.workbenchVersion).toBe(4);
    expect(state.generations[0].references).toEqual([{ id: card.id, role: 'anchor' }]);
    expect(state.visualControl.isolation.mode).toBe('payload-only');
    expect(state.visualControl.routeConformance[0].route).toBe('/pricing');
    expect(readFileSync(resolve(project, '.inspiration', 'workbench', 'index.html'), 'utf8')).toContain('SHOW ANOTHER CARD');
  }, 20_000);

  it('migrates legacy state without losing history and rejects new direction supports', () => {
    const project = resolve(scratch, 'legacy-state');
    const inspiration = resolve(project, '.inspiration');
    mkdirSync(inspiration, { recursive: true });
    writeFileSync(resolve(inspiration, 'state.json'), JSON.stringify({
      schemaVersion: 1, projectRoot: project, status: 'direction', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      intake: { introduction: 'Legacy', intent: '', audience: '', materialsAndRequirements: '' },
      informationArchitecture: { status: 'pending', pages: [], sections: [], primaryJourney: '' },
      references: { pinned: [], excluded: [], usage: {}, sets: [] },
      generations: [{ id: 'OLD', parent: null, stage: 'direction', status: 'selected', label: 'Legacy', category: 'Print-Tech Paper', thesis: '', references: [], preview: '', createdAt: new Date().toISOString() }],
      decisions: [], heroProvider: 'codex',
    }));
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    expect(runNode(script, ['init', project]).status).toBe(0);
    const state = JSON.parse(readFileSync(resolve(inspiration, 'state.json'), 'utf8'));
    expect(state.schemaVersion).toBe(6);
    expect(state.generations[0].previewScope).toEqual({ kind: 'legacy-unverified' });
    expect(state.visualControl).toBeTruthy();
  });

  it('protects project roots, preview containment, and atomic state replacement', async () => {
    const stateScript = resolve(skillRoot, 'scripts', 'project-state.mjs');
    expect(runNode(stateScript, ['init', resolve(root, 'accidental-project')]).status).not.toBe(0);
    const first = resolve(scratch, 'state-original');
    const second = resolve(scratch, 'state-copy');
    expect(runNode(stateScript, ['init', first]).status).toBe(0);
    cpSync(resolve(first, '.inspiration'), resolve(second, '.inspiration'), { recursive: true });
    expect(runNode(stateScript, ['validate', second]).stderr).toContain('saved projectRoot does not match');
    const path = resolve(scratch, 'atomic-state.json');
    writeFileSync(path, '{"prior":true}\n');
    const { atomicWriteJson } = await import(`${pathToFileURL(stateScript).href}?atomic=${Date.now()}`);
    await expect(atomicWriteJson(path, { prior: false }, { beforeReplace: () => { throw new Error('simulated interruption'); } })).rejects.toThrow();
    expect(readFileSync(path, 'utf8')).toBe('{"prior":true}\n');
  });

  it('installs, checks, and repairs project-local skills with managed rollback boundaries', async () => {
    const project = resolve(scratch, 'website-project');
    const impeccable = resolve(scratch, 'impeccable-fixture');
    mkdirSync(project, { recursive: true });
    writeFileSync(resolve(project, 'package.json'), '{"private":true}');
    makeImpeccableFixture(impeccable);
    const setup = resolve(root, 'scripts', 'setup-project.mjs');
    expect(runNode(setup, [project, '--impeccable-source', impeccable]).status).toBe(0);
    const destination = resolve(project, '.agents', 'skills', 'design-taste-injection');
    expect(existsSync(resolve(destination, 'SKILL.md'))).toBe(true);
    expect(existsSync(resolve(project, '.agents', 'skills', 'impeccable', 'SKILL.md'))).toBe(true);
    const config = JSON.parse(readFileSync(resolve(destination, 'config', 'library.json'), 'utf8'));
    expect(config.scope).toBe('project');
    expect(config.projectRoot).toBe(realpathSync(project));
    expect(runNode(resolve(root, 'scripts', 'check-project.mjs'), [project]).status).toBe(0);
    writeFileSync(resolve(destination, 'scripts', 'reference-selection.mjs'), '// stale');
    expect(runNode(resolve(root, 'scripts', 'check-project.mjs'), [project]).status).not.toBe(0);
    expect(runNode(setup, [project, '--impeccable-source', impeccable]).status).toBe(0);
    expect(runNode(resolve(root, 'scripts', 'check-project.mjs'), [project]).status).toBe(0);
    writeFileSync(resolve(project, '.agents', 'skills', 'impeccable', 'custom-note.txt'), 'preserve me');
    expect(runNode(setup, [project, '--impeccable-source', impeccable]).status).toBe(0);
    expect(readFileSync(resolve(project, '.agents', 'skills', 'impeccable', 'custom-note.txt'), 'utf8')).toBe('preserve me');

    const dest = resolve(scratch, 'rollback-destination');
    const stage = resolve(scratch, 'rollback-staging');
    mkdirSync(dest, { recursive: true }); mkdirSync(stage, { recursive: true });
    writeFileSync(resolve(dest, 'identity.txt'), 'old'); writeFileSync(resolve(stage, 'identity.txt'), 'new');
    const { replaceMany } = await import(`${pathToFileURL(setup).href}?rollback=${Date.now()}`);
    await expect(replaceMany([{ destination: dest, staging: stage }], { afterInstall: () => { throw new Error('interrupted'); } })).rejects.toThrow('interrupted');
    expect(readFileSync(resolve(dest, 'identity.txt'), 'utf8')).toBe('old');
  }, 30_000);

  it('refuses library, installed-skill, and unmanaged project-skill targets', () => {
    const impeccable = resolve(scratch, 'impeccable-refusal');
    makeImpeccableFixture(impeccable);
    const setup = resolve(root, 'scripts', 'setup-project.mjs');
    expect(runNode(setup, [root, '--impeccable-source', impeccable]).status).not.toBe(0);
    expect(runNode(setup, [skillRoot, '--impeccable-source', impeccable]).status).not.toBe(0);
    const project = resolve(scratch, 'unmanaged-project');
    const destination = resolve(project, '.agents', 'skills', 'design-taste-injection');
    mkdirSync(destination, { recursive: true });
    writeFileSync(resolve(destination, 'SKILL.md'), 'unmanaged');
    const refused = runNode(setup, [project, '--impeccable-source', impeccable]);
    expect(refused.status).not.toBe(0);
    expect(refused.stderr).toContain('Refusing to replace unmanaged project skill');
  });

  it('keeps clone QA at exactly three widths', () => {
    const project = resolve(scratch, 'clone-qa-project');
    const impeccable = resolve(scratch, 'clone-qa-impeccable');
    mkdirSync(project, { recursive: true });
    makeImpeccableFixture(impeccable);
    expect(runNode(resolve(root, 'scripts', 'setup-project.mjs'), [project, '--impeccable-source', impeccable]).status).toBe(0);
    const runtime = resolve(project, '.agents', 'skills', 'design-taste-injection', 'scripts', 'clone-runtime.mjs');
    const evidence = resolve(project, '.inspiration', 'clone', 'QA1');
    mkdirSync(evidence, { recursive: true });
    writeFileSync(resolve(evidence, 'preflight.json'), JSON.stringify({ schemaVersion: 2, generationId: 'QA1', cardId: 'site-spade', projectRoot: project, evidenceRoot: evidence, requiredWidths: [1440, 768, 390] }));
    const pairs = [1440, 768, 390].map((width) => {
      const original = resolve(evidence, `original-${width}.png`); const clone = resolve(evidence, `clone-${width}.png`);
      const png = new PNG({ width, height: 2 }); png.data.fill(255); const bytes = PNG.sync.write(png);
      writeFileSync(original, bytes); writeFileSync(clone, bytes); return { width, original, clone, maxDiffRatio: 0 };
    });
    const manifest = resolve(evidence, 'qa-manifest.json');
    writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, generationId: 'QA1', pairs }));
    const verified = runNode(runtime, ['verify', project, 'QA1', manifest]);
    expect(verified.status, verified.stderr).toBe(0);
    const report = JSON.parse(readFileSync(resolve(evidence, 'qa', 'report.json'), 'utf8'));
    expect(report.results.map((item: any) => item.width)).toEqual([1440, 768, 390]);
  });

  it('archives customized workbenches and rejects inspiration-folder junction escapes', () => {
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    const project = resolve(scratch, 'custom-workbench-project');
    expect(runNode(script, ['init', project]).status).toBe(0);
    const statePath = resolve(project, '.inspiration', 'state.json');
    const workbenchPath = resolve(project, '.inspiration', 'workbench', 'index.html');
    writeFileSync(workbenchPath, '<h1>Custom</h1>');
    const state = JSON.parse(readFileSync(statePath, 'utf8')); state.schemaVersion = 5; state.workbenchVersion = 3; writeFileSync(statePath, JSON.stringify(state));
    expect(runNode(script, ['init', project]).status).toBe(0);
    expect(readdirSync(resolve(project, '.inspiration', 'workbench', 'archive')).length).toBeGreaterThan(0);
    expect(readFileSync(workbenchPath, 'utf8')).toContain('content="4"');
    const junction = resolve(scratch, 'junction-project'); const outside = resolve(scratch, 'junction-outside');
    mkdirSync(junction, { recursive: true }); mkdirSync(outside, { recursive: true });
    symlinkSync(outside, resolve(junction, '.inspiration'), process.platform === 'win32' ? 'junction' : 'dir');
    expect(runNode(script, ['init', junction]).stderr).toContain('escapes protected root');
  }, 20_000);

  it('documents only project-scoped setup', () => {
    const guide = readFileSync(resolve(root, 'FIRST-TIME-USER-GUIDE.md'), 'utf8');
    expect(guide).toContain('npm run setup:project -- C:\\path\\to\\website-project');
    expect(guide).toContain('npm run check:project -- C:\\path\\to\\website-project');
    expect(guide).toContain('npm run doctor:project -- C:\\path\\to\\website-project');
    expect(guide).toContain('<website-project>/.agents/skills/');
    expect(guide).not.toMatch(/setup:codex|check:codex|--scope=global|--global --agent codex/);
    expect(readFileSync(resolve(root, 'package.json'), 'utf8')).not.toMatch(/setup:codex|check:codex/);
  });

  it('pins the complete approved clone-remix pipeline with attribution', () => {
    const vendor = resolve(skillRoot, 'vendor', 'site-clone');
    expect(readFileSync(resolve(vendor, 'UPSTREAM.md'), 'utf8')).toContain('f01d396b64afa07870c6fc6757a35b92993791e2');
    expect(readFileSync(resolve(vendor, 'LICENSE'), 'utf8')).toContain('MIT License');
    expect(runNode(resolve(root, 'scripts', 'skill-integrity.mjs'), ['verify-vendor', vendor]).status).toBe(0);
  });
});
