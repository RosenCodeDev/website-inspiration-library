import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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
      'skills/design-taste-injection/scripts/design-review.mjs',
      'skills/design-taste-injection/scripts/reference-selection.mjs', 'skills/design-taste-injection/scripts/reference-review.mjs', 'skills/design-taste-injection/scripts/rotation-ledger.mjs',
      'skills/design-taste-injection/scripts/visual-contract.mjs', 'skills/design-taste-injection/scripts/isolation-runner.mjs',
      'skills/design-taste-injection/scripts/clone-runtime.mjs', 'skills/design-taste-injection/scripts/serve-workbench.mjs',
    ].map((file) => pathToFileURL(resolve(root, file)).href);
    const imported = spawnSync(process.execPath, ['-e', `Promise.all(${JSON.stringify(files)}.map((file)=>import(file)))`], { cwd: root, encoding: 'utf8' });
    expect(imported.status, imported.stderr).toBe(0);
    expect(imported.stdout).toBe('');
  }, 20_000);

  it('exports the validated live catalog with explicit identity provenance', () => {
    const catalog = loadCatalog();
    expect(catalog.schemaVersion).toBe(4);
    expect(catalog.cards).toHaveLength(63);
    expect(catalog.categories).toHaveLength(7);
    for (const card of catalog.cards) {
      expect(card.fingerprint).toMatch(/^[a-f0-9]{16}$/);
      expect(card.sourceIdentity.derived).toEqual(expect.objectContaining({ sourceNames: expect.any(Array), aliases: expect.any(Array), domains: expect.any(Array), assetHashes: expect.any(Array) }));
      expect(card.sourceIdentity.reviewed).toEqual(expect.objectContaining({ exactCopy: expect.any(Array), distinctiveClaims: expect.any(Array), knownMarkAssetIds: expect.any(Array), knownMarkAssetHashes: expect.any(Array), sourceSpecificExclusions: expect.any(Array) }));
    }
    const reviewedMarketingBand = catalog.cards.filter((card: any) => card.sourceIdentity.review.reviewStatus === 'reviewed');
    expect(reviewedMarketingBand).toHaveLength(34);
    expect(reviewedMarketingBand.every((card: any) => card.identityReviewFresh)).toBe(true);
    expect(reviewedMarketingBand.every((card: any) => card.sourceIdentity.review.reviewOrigin === 'codex-drafted')).toBe(true);
    expect(reviewedMarketingBand.every((card: any) => /not independent human, legal, or QA review/i.test(card.sourceIdentity.review.reviewBasis))).toBe(true);
  });

  it('returns and stages one selected card without returning the catalog', () => {
    const library = resolve(skillRoot, 'scripts', 'library.mjs');
    const one = runNode(library, ['card', 'site-spade', '--json']);
    expect(one.status, one.stderr).toBe(0);
    const record = JSON.parse(one.stdout);
    expect(record.card.id).toBe('site-spade');
    expect(record.cards).toBeUndefined();
    expect(record.categoryProfiles).toBeUndefined();
    const project = resolve(scratch, 'single-card-stage'); mkdirSync(project, { recursive: true });
    const staged = runNode(library, ['stage', 'site-spade', project]);
    expect(staged.status, staged.stderr).toBe(0);
    const stagedRecord = JSON.parse(staged.stdout);
    expect(stagedRecord.card.id).toBe('site-spade');
    expect(stagedRecord.evidence.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(stagedRecord.cards).toBeUndefined();
  }, 20_000);

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

  it('preflights every category and permits explicit eligible pins outside the automatic band', async () => {
    const catalog = loadCatalog();
    const script = resolve(skillRoot, 'scripts', 'reference-selection.mjs');
    const selection = await import(`${pathToFileURL(script).href}?coverage=${Date.now()}`);
    const coverage = selection.preflightCategoryCoverage(catalog, 'marketing');
    expect(coverage.categoryCount).toBe(catalog.categories.length);
    expect(coverage.coverage.every((entry: any) => entry.eligibleIds.length > 0)).toBe(true);
    expect(() => selection.preflightCategoryCoverage(catalog, 'campaign')).toThrow(/all-category|no safe exact-category/i);

    const request = { category: 'Print-Tech Paper', pageUse: 'marketing', seed: 'explicit-pin', pinned: [], excluded: [] };
    const source = catalog.cards.find((card: any) => selection.anchorEligible(card, request));
    const synthetic = { ...structuredClone(source), id: 'eligible-outside-band', title: 'Explicit eligible override', workflow: { ...source.workflow, anchorStrength: 1 }, quality: { ...source.quality, tier: 'usable', confidence: 0.25 } };
    const extended = { ...catalog, cards: [...catalog.cards, synthetic] };
    expect(selection.eligibleQualityBand(extended, request).some((entry: any) => entry.card.id === synthetic.id)).toBe(false);
    const session = selection.createSession(extended, { ...request, pinned: [{ id: synthetic.id, role: 'anchor' }] });
    expect(session.currentSet.anchor.id).toBe(synthetic.id);
    expect(session.currentSet.supporting).toEqual([]);
  });

  it('creates one seven-slot review batch and applies mixed per-slot actions without cross-slot mutation', async () => {
    const catalog = loadCatalog();
    const selection = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'reference-selection.mjs')).href}?batch=${Date.now()}`);
    const batch = selection.createAutomaticBatch(catalog, { pageUse: 'marketing', seed: 'all-categories', excluded: [] });
    expect(batch.items).toHaveLength(catalog.categories.length);
    expect(batch.items.map((item: any) => item.category)).toEqual(catalog.categories);
    expect(batch.items.map((item: any) => item.slotId)).toEqual(['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07']);
    expect(batch.items.every((item: any) => item.session.currentSet.supporting.length === 0)).toBe(true);
    const before = batch.items.map((item: any) => item.session.currentSet.anchor.id);
    const result = selection.applyBatchActions(catalog, batch, [
      { type: 'ACCEPT', slotId: 'R01' },
      { type: 'SHOW ANOTHER CARD', slotId: 'R02' },
      { type: 'PIN THIS CARD', slotId: 'R03' },
      { type: 'ACCEPT', slotId: 'R99' },
    ]);
    expect(result.issues).toHaveLength(1);
    expect(result.batch.items[0].reviewStatus).toBe('accepted');
    expect(result.batch.items[1].session.currentSet.anchor.id).not.toBe(before[1]);
    expect(result.batch.items[1].reviewStatus).toBe('pending');
    expect(result.batch.items[2].session.pinned).toEqual([{ id: before[2], role: 'anchor' }]);
    expect(result.batch.items.slice(3).map((item: any) => item.session.currentSet.anchor.id)).toEqual(before.slice(3));
    expect(result.batch.accepted).toBe(false);
  });

  it('supports ordered uncapped custom batches, same-category cards, soft overrides, and hard evidence gates', async () => {
    const catalog = loadCatalog();
    const selection = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'reference-selection.mjs')).href}?custom=${Date.now()}`);
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?custom=${Date.now()}`);
    const eligible = catalog.cards.filter((card: any) => selection.customCardEligible(card));
    const overTwenty = eligible.slice(0, 23);
    const large = selection.createCustomBatch(catalog, { pageUse: 'marketing', identifiers: overTwenty.map((card: any) => card.id) });
    expect(large.items).toHaveLength(23);
    expect(large.items.map((item: any) => item.session.currentSet.anchor.id)).toEqual(overTwenty.map((card: any) => card.id));
    const one = selection.createCustomBatch(catalog, { pageUse: 'marketing', identifiers: [eligible[0].title] });
    expect(one.items).toHaveLength(1);
    const urlEligible = eligible.filter((card: any) => typeof card.source?.url === 'string');
    const urlCategory = urlEligible.find((card: any) => urlEligible.filter((candidate: any) => candidate.primaryCategory === card.primaryCategory).length >= 3).primaryCategory;
    const sameCategory = urlEligible.filter((card: any) => card.primaryCategory === urlCategory).slice(0, 3);
    const same = selection.createCustomBatch(catalog, { pageUse: 'marketing', identifiers: sameCategory.map((card: any) => card.source.url) });
    expect(same.items.map((item: any) => item.session.currentSet.anchor.id)).toEqual(sameCategory.map((card: any) => card.id));

    const source = structuredClone(eligible[0]);
    const staleLimited = { ...source, id: 'custom-stale-limited', title: 'Custom Stale Limited', identityReviewFresh: false, quality: { ...source.quality, tier: 'limited' } };
    const extended = { ...catalog, cards: [...catalog.cards, staleLimited] };
    const custom = selection.createCustomBatch(extended, { pageUse: 'marketing', identifiers: [staleLimited.id] });
    expect(custom.items[0]).toEqual(expect.objectContaining({ requiresIdentityQa: true, identityQaStatus: 'required' }));
    expect(custom.items[0].warnings.join(' ')).toMatch(/limited.*identity qa|required/i);
    expect(() => visual.buildSealedPayload(staleLimited)).toThrow(/stale/i);
    expect(() => visual.buildSealedPayload(staleLimited, { allowIdentityWarning: true })).not.toThrow();
    const noRecipe = { ...source, id: 'custom-no-recipe', imageRecipe: null };
    expect(() => selection.createCustomBatch({ ...catalog, cards: [...catalog.cards, noRecipe] }, { pageUse: 'marketing', identifiers: [noRecipe.id] })).toThrow(/recipe|method/i);
    expect(() => selection.resolveCardIdentifier(catalog, `${eligible[0].title.slice(0, 5)}`)).toThrow(/resolve exactly/i);
  });

  it('renders every batch slot as deterministic inline image Markdown', async () => {
    const catalog = loadCatalog();
    const selection = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'reference-selection.mjs')).href}?reviewBatch=${Date.now()}`);
    const review = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'reference-review.mjs')).href}?review=${Date.now()}`);
    const batch = selection.createAutomaticBatch(catalog, { pageUse: 'marketing', seed: 'review-images', excluded: [] });
    const evidence = Object.fromEntries(batch.items.map((item: any) => {
      const card = catalog.cards.find((candidate: any) => candidate.id === item.session.currentSet.anchor.id);
      return [item.slotId, { destination: resolve(catalog.publicAssetRoot, card.media.detailImage.replace(/^[/\\]+/, '')), warnings: [] }];
    }));
    const markdown = review.renderReviewMarkdown(catalog, batch, evidence);
    expect([...markdown.matchAll(/!\[(?:\\.|[^\]])*\]\(<[^>]+>\)/g)]).toHaveLength(7);
    expect(markdown).not.toContain('```');
    expect(() => review.assertReviewMarkdown(markdown, batch, evidence)).not.toThrow();
    expect(() => review.assertReviewMarkdown(markdown.replace(/!\[(?:\\.|[^\]])*\]\(<[^>]+>\)/, 'C:/plain/path.png'), batch, evidence)).toThrow(/exactly 7 inline images/i);
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
    expect(card.imageRecipe.noneMode).toMatch(/code-native|authorized-media/);
    expect(card.imageRecipe.permittedMethod).toEqual(expect.any(String));
    expect(anchorEligible({ ...card, imageRecipe: { kind: 'none', reason: '', noneMode: card.imageRecipe.noneMode, permittedMethod: card.imageRecipe.permittedMethod } }, { category: card.primaryCategory, pageUse: card.workflow.anchorUses[0] })).toBe(false);
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
    expect(() => visual.assertSealedPayload({ ...payload, secretProjectBrief: 'hidden' })).toThrow(/unexpected or missing fields/i);
    const completeHomepage = structuredClone(payload); completeHomepage.output.scope = 'complete-homepage';
    expect(() => visual.assertSealedPayload(completeHomepage)).toThrow(/output contract/i);
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
    const identity = { derived: { sourceNames: ['Spade'], aliases: [], domains: ['spade.com'], assetHashes: [] }, reviewed: { exactCopy: ['Make it count'], distinctiveClaims: [], knownMarkAssetIds: [], knownMarkAssetHashes: [], characters: [], products: [], people: [], packaging: [], interfaceFragments: [], sourceSpecificExclusions: [] } };
    expect(visual.scanSourceIdentity('This says Make it count.', identity)[0].value).toBe('Make it count');
    const source = readFileSync(resolve(skillRoot, 'scripts', 'visual-contract.mjs'), 'utf8');
    expect(source).not.toMatch(/ocr|logo.shape|color.*identity|delete.*logo/i);
  });

  it('resolves evidence by stable card ID, fingerprints it, and imports only validated temporary previews', async () => {
    const catalog = loadCatalog();
    const card = catalog.cards.find((item: any) => item.id === 'site-spade');
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?evidence=${Date.now()}`);
    const project = resolve(scratch, 'evidence-project');
    const evidence = await visual.resolveEvidence(catalog, project, card.id);
    expect(evidence.record.cardId).toBe(card.id);
    expect(evidence.record.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(existsSync(evidence.destination)).toBe(true);
    expect(evidence.record.inspected).toBe(false);
    const temporary = resolve(scratch, 'temporary-preview');
    mkdirSync(temporary, { recursive: true });
    writeFileSync(resolve(temporary, 'index.html'), '<!doctype html><link rel="stylesheet" href="styles.css"><main><section data-inspiration-hero><div data-protected-copy-region>Neutral heading</div><div data-future-image-slot></div></section><section data-opening-module>Opening module</section></main>');
    writeFileSync(resolve(temporary, 'styles.css'), 'body{margin:0} [data-inspiration-hero]{display:grid;grid-template-columns:1fr 1fr;min-height:600px}[data-future-image-slot]{width:620px;aspect-ratio:4/3;background:#d8d4ca}[data-opening-module]{min-height:200px}');
    const imported = await visual.importPreview(temporary, project, 'D01-H0', { leakSignals: { schemaVersion: 1, signals: [] }, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: 'reserved-image-hole-with-flat-stand-in', expectedGeometry: { aspectRatio: 4 / 3, aspectTolerance: 0.18, alignment: 'right', minWidthRatio: 0.28, minHeightRatio: 0.2 }, sourceStillInspected: true });
    expect(imported.preview).toBe('../previews/D01-H0/index.html');
    expect(existsSync(resolve(project, '.inspiration', 'previews', 'D01-H0', 'index.html'))).toBe(true);
    const observedContract = JSON.parse(readFileSync(resolve(project, '.inspiration', 'previews', 'D01-H0', 'output-contract.json'), 'utf8'));
    expect(observedContract.schemaVersion).toBe(2);
    expect(observedContract.validator.slotMetrics.quantizedColors).toBeLessThanOrEqual(12);
    const unsafe = resolve(scratch, 'unsafe-preview');
    mkdirSync(unsafe, { recursive: true });
    writeFileSync(resolve(unsafe, 'index.html'), '<script src="https://example.com/a.js"></script>');
    await expect(visual.importPreview(unsafe, project, 'D02-H0', { leakSignals: { schemaVersion: 1, signals: [] }, sourceIdentity: card.sourceIdentity, anchorCardId: card.id, expectedH0: 'reserved-image-hole-with-flat-stand-in', expectedGeometry: { aspectRatio: 4 / 3, aspectTolerance: 0.18, alignment: 'right', minWidthRatio: 0.28, minHeightRatio: 0.2 }, sourceStillInspected: true })).rejects.toThrow(/external|absolute/i);
  }, 30_000);

  it('pins H0 pixel thresholds with passing and failing golden fixtures', async () => {
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?goldens=${Date.now()}`);
    const fixtureRoot = resolve(root, 'tests', 'fixtures', 'h0');
    for (const name of ['good-flat.html', 'good-overlap.html', 'good-outside-texture.html']) {
      const folder = resolve(scratch, `h0-${name}`); mkdirSync(folder, { recursive: true }); cpSync(resolve(fixtureRoot, name), resolve(folder, 'index.html'));
      await expect(visual.validateRenderedH0(folder, { expectedH0: 'reserved-image-hole-with-flat-stand-in' })).resolves.toEqual(expect.objectContaining({ slotMetrics: expect.any(Object) }));
    }
    for (const name of ['bad-gradient.html', 'bad-fog.html', 'bad-dither.html', 'bad-svg.html', 'bad-transparent-parent.html']) {
      const folder = resolve(scratch, `h0-${name}`); mkdirSync(folder, { recursive: true }); cpSync(resolve(fixtureRoot, name), resolve(folder, 'index.html'));
      await expect(visual.validateRenderedH0(folder, { expectedH0: 'reserved-image-hole-with-flat-stand-in' })).rejects.toThrow();
    }
    const codeNative = resolve(scratch, 'h0-good-code-native'); mkdirSync(codeNative, { recursive: true }); cpSync(resolve(fixtureRoot, 'good-code-native.html'), resolve(codeNative, 'index.html'));
    await expect(visual.validateRenderedH0(codeNative, { expectedH0: 'code-native', expectedCodeNativeMethod: 'css-pixel-field' })).resolves.toEqual(expect.objectContaining({ observed: expect.objectContaining({ codeNativeMethod: 'css-pixel-field' }) }));
    await expect(visual.validateRenderedH0(codeNative, { expectedH0: 'code-native', expectedCodeNativeMethod: 'canvas-field' })).rejects.toThrow(/permitted method/i);
  }, 60_000);

  it('rejects stale identity reviews from automatic generation', async () => {
    const catalog = loadCatalog(); const card = catalog.cards.find((item: any) => item.id === 'site-spade');
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?stale=${Date.now()}`);
    expect(() => visual.assertReviewedIdentity({ ...card, identityReviewFresh: false })).toThrow(/stale/i);
  });

  it('fingerprints full release inputs and validates automatic attestations noninteractively', async () => {
    const common = await import(`${pathToFileURL(resolve(root, 'scripts', 'inspiration-eval-common.mjs')).href}?eval=${Date.now()}`);
    const attestationModule = await import(`${pathToFileURL(resolve(root, 'scripts', 'inspiration-eval-attestation.mjs')).href}?attestation=${Date.now()}`);
    const subscriptionEval = await import(`${pathToFileURL(resolve(root, 'scripts', 'inspiration-subscription-eval.mjs')).href}?subscriptionEval=${Date.now()}`);
    const current = await common.currentEvaluationInputs();
    expect(current.inputs.evaluationMode).toBe('subscription');
    expect(current.inputs.subscriptionRunner).toBe('codex-cli-chatgpt');
    expect(Object.keys(current.inputs.cardFingerprints)).toEqual(['site-spade']);
    expect(Object.keys(current.inputs.identityReviewBandFingerprints)).toHaveLength(34);
    expect(new Set(Object.values(current.inputs.identityReviewOrigins))).toEqual(new Set(['codex-drafted']));
    expect(current.inputs.skillFingerprint).toMatch(/^[a-f0-9]{64}$/);
    const artifactManifest = { 'manifest.json': common.hash('manifest') };
    const report = { evaluationMode: 'subscription', evaluationFingerprint: current.evaluationFingerprint, machinePassed: true, releaseEligible: true, artifactManifest, rubric: { mean: 4.2, minimum: 3 } };
    const attestation = { schemaVersion: 3, evaluationMode: 'subscription', evaluationFingerprint: current.evaluationFingerprint, machinePassed: true, createdAt: new Date().toISOString(), reportHash: common.hash(report), artifactManifestHash: common.hash(artifactManifest), rubricMean: 4.2, rubricMinimum: 3, cardFingerprints: current.inputs.cardFingerprints, identityReviewBandFingerprints: current.inputs.identityReviewBandFingerprints, identityReviewOrigins: current.inputs.identityReviewOrigins, inputFingerprints: current.inputs.fileFingerprints, skillFingerprint: current.inputs.skillFingerprint, goldenFixtureFingerprint: current.inputs.goldenFixtureFingerprint };
    expect(attestationModule.validateAttestation(attestation, current, { report, artifactManifest })).toBe(true);
    expect(() => attestationModule.validateAttestation({ ...attestation, evaluationMode: 'sealed-api-benchmark' }, current, { report, artifactManifest })).toThrow(/wrong mode/i);
    expect(() => attestationModule.validateAttestation({ ...attestation, skillFingerprint: 'stale' }, current, { report, artifactManifest })).toThrow(/stale/i);
    expect(() => attestationModule.validateAttestation({ ...attestation, reportHash: 'a'.repeat(64) }, current, { report, artifactManifest })).toThrow(/modified/i);
    const prepared = await subscriptionEval.prepare({ outputRoot: resolve(scratch, 'subscription-eval') });
    const preparedManifest = JSON.parse(readFileSync(prepared.manifestPath, 'utf8'));
    expect(preparedManifest).toEqual(expect.objectContaining({ evaluationMode: 'subscription', subscriptionRunner: 'codex-cli-chatgpt', imageProvider: 'codex-imagegen' }));
    expect(preparedManifest.cases).toHaveLength(1);
    expect(readFileSync(resolve(prepared.destination, 'RUNBOOK.md'), 'utf8')).toMatch(/test:inspiration-eval[\s\S]*ImageGen[\s\S]*OPENAI_API_KEY/);
    const tamperedManifest = resolve(prepared.destination, 'tampered-manifest.json'); writeFileSync(tamperedManifest, JSON.stringify({ ...preparedManifest, cases: [] }));
    await expect(subscriptionEval.verify({ manifestPath: tamperedManifest })).rejects.toThrow(/modified|incomplete/i);
    const source = readFileSync(resolve(root, 'scripts', 'inspiration-eval-attestation.mjs'), 'utf8');
    expect(source).not.toMatch(/readline|inquirer|prompt\(/i);
  }, 20_000);

  it('defaults to ChatGPT-authenticated ephemeral Codex and keeps the sealed API explicit', async () => {
    const isolation = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'isolation-runner.mjs')).href}?isolation=${Date.now()}`);
    const catalog = loadCatalog();
    const card = catalog.cards.find((item: any) => item.id === 'site-spade');
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?request=${Date.now()}`);
    const evidence = await visual.resolveEvidence(catalog, resolve(scratch, 'request-project'), card.id);
    const payload = visual.buildSealedPayload(card, { sha256: evidence.record.sha256 });
    const subscriptionArgs = isolation.subscriptionCodexArgs('C:/temp/eval', ['C:/temp/eval/input/reference.png'], 'C:/temp/eval/schema.json', 'C:/temp/eval/result.json');
    expect(subscriptionArgs).toEqual(expect.arrayContaining(['exec', '--ephemeral', '--ignore-user-config', '--ignore-rules', '--sandbox', 'read-only', '--output-schema', 'C:/temp/eval/schema.json', '--output-last-message', 'C:/temp/eval/result.json']));
    expect(subscriptionArgs.slice(-2)).toEqual(['-i', 'C:/temp/eval/input/reference.png']);
    expect(isolation.subscriptionLoginStatus({ run: () => ({ status: 0, stdout: 'Logged in using ChatGPT', stderr: '' }) })).toEqual(expect.objectContaining({ available: true, authenticatedWith: 'chatgpt' }));
    const doctorReport = { checks: { 'auth.credentials': { status: 'ok', details: { 'stored auth mode': 'chatgpt', 'stored API key': 'true' } } } };
    expect(isolation.subscriptionLoginStatus({ run: () => ({ status: 1, stdout: JSON.stringify(doctorReport), stderr: 'unrelated doctor failure' }) })).toEqual(expect.objectContaining({ available: true, authenticatedWith: 'chatgpt', source: 'doctor' }));
    expect(isolation.subscriptionLoginStatus({ run: () => ({ status: 0, stdout: 'Logged in using API key', stderr: '' }) })).toEqual(expect.objectContaining({ available: true, authenticatedWith: 'api-key' }));
    expect(isolation.subscriptionFeatureStatus({ run: () => ({ status: 0, stdout: 'image_generation stable true', stderr: '' }) })).toEqual(expect.objectContaining({ configured: true }));
    expect(isolation.sanitizedSubscriptionEnv({ Path: 'x', OPENAI_API_KEY: 'secret', openai_api_key: 'also-secret' })).toEqual({ Path: 'x' });
    const subscriptionOutput = resolve(scratch, 'subscription-output');
    const subscription = await isolation.runSubscriptionGeneration(payload, evidence.destination, subscriptionOutput, {
      loginStatus: { available: true, authenticatedWith: 'chatgpt' },
      featureStatus: { available: true, configured: true, detail: '' },
      generationRun: (_command: string, args: string[], options: any) => {
        expect(options.shell).toBe(false); expect(options.input).toMatch(/EXECUTION CONTRACT/); expect(options.input).toMatch(/H0 SLOT RULE[\s\S]*one opaque solid background color/i); expect(options.env.OPENAI_API_KEY).toBeUndefined();
        const resultPath = args[args.indexOf('--output-last-message') + 1];
        writeFileSync(resultPath, JSON.stringify({ files: [{ path: 'index.html', content: '<!doctype html><html><body><main data-inspiration-hero></main><section data-opening-module></section></body></html>' }], inspection: { stillSha256: payload.reference.sha256 } }));
        return { status: 0, stdout: '', stderr: '' };
      },
      env: { ...process.env, OPENAI_API_KEY: 'must-be-removed' },
    });
    expect(subscription).toEqual(expect.objectContaining({ mode: 'subscription-ephemeral', isolated: false, contextLimited: true, authenticatedWith: 'chatgpt', outputMode: 'structured-manifest', attempt: 1 }));
    expect(existsSync(resolve(subscriptionOutput, 'index.html'))).toBe(true);
    let attempts = 0;
    const retried = await isolation.runSubscriptionGeneration(payload, evidence.destination, resolve(scratch, 'subscription-retry-output'), {
      loginStatus: { available: true, authenticatedWith: 'chatgpt' }, featureStatus: { available: true, configured: true, detail: '' },
      generationRun: (_command: string, args: string[]) => {
        const resultPath = args[args.indexOf('--output-last-message') + 1]; attempts += 1;
        writeFileSync(resultPath, attempts === 1 ? '{malformed' : JSON.stringify({ files: [{ path: 'index.html', content: '<!doctype html><html><body>retry</body></html>' }], inspection: { stillSha256: payload.reference.sha256 } }));
        return { status: 0, stdout: '', stderr: '' };
      },
    });
    expect(retried.attempt).toBe(2); expect(attempts).toBe(2);
    const request = await isolation.buildSealedRequest(payload, evidence.destination, { projectRoot: resolve(scratch, 'request-project'), libraryRoot: root });
    expect(request.model).toBe('gpt-5.6-sol');
    expect(request).toEqual(expect.objectContaining({ store: false, background: false, stream: false, tools: [], tool_choice: 'none', reasoning: { effort: 'high' } }));
    expect(request).not.toHaveProperty('conversation'); expect(request).not.toHaveProperty('previous_response_id'); expect(request).not.toHaveProperty('metadata');
    expect(request.input[0].content.filter((item: any) => item.type === 'input_image')).toHaveLength(1);
    await expect(isolation.buildSealedRequest(payload, evidence.destination, { model: 'development-model', projectRoot: resolve(scratch, 'request-project'), libraryRoot: root })).rejects.toThrow(/requires gpt-5.6-sol/i);
    await expect(isolation.buildSealedRequest(payload, evidence.destination, { model: 'development-model', allowDevelopmentModel: true, projectRoot: resolve(scratch, 'request-project'), libraryRoot: root })).resolves.toEqual(expect.objectContaining({ model: 'development-model' }));
    await expect(isolation.runSealedGeneration(payload, evidence.destination, resolve(scratch, 'api-output'))).rejects.toThrow(/explicitApiOptIn/i);
    expect(() => isolation.buildRetryRequest(request, { previousFiles: [], failures: ['make this more payroll'] }, { leakSignals: visual.buildLeakSignals({ distinctiveClaims: ['make this more payroll'] }) })).toThrow(/intake leak/i);
    const redacted = isolation.redactRetryEvidence({ previousFiles: [{ path: 'index.html', content: 'Acme Ledger' }], failures: ['The data & AI platform for modern finance leaked'] }, request, { leakSignals: visual.buildLeakSignals({ companyNames: ['Acme Ledger'] }) });
    expect(JSON.stringify(redacted)).not.toMatch(/Acme Ledger|data & AI platform for modern finance/i);
    expect(() => isolation.createDegradedApproval({ acknowledged: isolation.DEGRADED_WARNING, action: 'wrong', approver: 'Reviewer', generationId: 'D01', degradedCause: 'subscription-unavailable' })).toThrow();
    expect(isolation.createDegradedApproval({ acknowledged: isolation.DEGRADED_WARNING, action: isolation.DEGRADED_ACTION, approver: 'Reviewer', generationId: 'D01', degradedCause: 'subscription-unavailable' })).toEqual(expect.objectContaining({ mode: 'degraded', isolated: false, explicitApproval: true, degradedCause: 'subscription-unavailable' }));
    const source = readFileSync(resolve(skillRoot, 'references', 'workflow.md'), 'utf8');
    expect(source).toContain('POST /v1/responses');
    expect(source).toContain('DEGRADED — NOT ISOLATED');
  }, 20_000);

  it('renders an unlimited, path-safe Design Review manifest without fixed slots', async () => {
    const review = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'design-review.mjs')).href}?review=${Date.now()}`);
    const entries = Array.from({ length: 24 }, (_, index) => ({
      id: `D${String(index + 1).padStart(2, '0')}`,
      name: `Direction ${index + 1}`,
      path: `previews/D${String(index + 1).padStart(2, '0')}/index.html`,
    }));
    const html = await review.renderDesignReviewHtml(entries);
    expect(html).toContain('name="design-review-initial-version-count" content="24"');
    expect(html).toContain('through V24 -> v24/index.html');
    expect(html).toContain('"id": "D24"');
    expect(html).toContain('"path": "previews/D24/index.html"');
    expect(html).toContain('width:fit-content;max-width:100%');
    expect(html).not.toContain('__DESIGN_REVIEW_ENTRIES__');
    await expect(review.renderDesignReviewHtml([{ id: 'D01', name: 'Unsafe', path: '../outside/index.html' }])).rejects.toThrow(/safe relative path/i);
    await expect(review.renderDesignReviewHtml([
      { id: 'D01', name: 'One', path: 'previews/D01/index.html' },
      { id: 'D01', name: 'Two', path: 'previews/D02/index.html' },
    ])).rejects.toThrow(/duplicate/i);
  });

  it('creates unique one-card workspaces and excludes sibling, feedback, intake, and prior-output sentinels', async () => {
    const catalog = loadCatalog();
    const visual = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'visual-contract.mjs')).href}?sentinel=${Date.now()}`);
    const isolation = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'isolation-runner.mjs')).href}?sentinel=${Date.now()}`);
    const selected = catalog.cards.find((card: any) => card.id === 'site-spade');
    const sibling = { ...catalog.cards.find((card: any) => card.id !== selected.id), title: 'SIBLING_SENTINEL_4B17' };
    const evidence = await visual.resolveEvidence(catalog, resolve(scratch, 'sentinel-project'), selected.id);
    const payload = visual.buildSealedPayload(selected, { sha256: evidence.record.sha256 });
    const protectedSentinels = ['SIBLING_SENTINEL_4B17', 'BATCH_FEEDBACK_SENTINEL_8C22', 'INTAKE_SENTINEL_A91F', 'PRIOR_OUTPUT_SENTINEL_F733'];
    expect(sibling.title).toBe(protectedSentinels[0]);
    const first = await isolation.createSubscriptionWorkspace(evidence.destination, payload);
    const second = await isolation.createSubscriptionWorkspace(evidence.destination, payload);
    try {
      expect(first.workspace).not.toBe(second.workspace);
      for (const workspace of [first, second]) {
        expect(readdirSync(workspace.workspace).sort()).toEqual(['PROMPT.md', 'input', 'output', 'output-schema.json', 'payload.json']);
        const serialized = [readFileSync(resolve(workspace.workspace, 'payload.json'), 'utf8'), readFileSync(resolve(workspace.workspace, 'PROMPT.md'), 'utf8'), readFileSync(resolve(workspace.workspace, 'output-schema.json'), 'utf8')].join('\n');
        for (const sentinel of protectedSentinels) expect(serialized).not.toContain(sentinel);
        expect(readdirSync(workspace.input)).toHaveLength(1);
        expect(readdirSync(workspace.output)).toHaveLength(0);
      }
    } finally {
      rmSync(first.workspace, { recursive: true, force: true });
      rmSync(second.workspace, { recursive: true, force: true });
    }
    const manifest = {
      files: [
        { path: 'index.html', content: '<!doctype html><link rel="stylesheet" href="styles.css"><main><section data-inspiration-hero><div data-protected-copy-region>Neutral heading</div><div data-future-image-slot></div></section><section data-opening-module>Opening module</section></main>' },
        { path: 'styles.css', content: 'body{margin:0}[data-inspiration-hero]{display:grid;grid-template-columns:1fr 1fr;min-height:600px}[data-future-image-slot]{width:620px;aspect-ratio:4/3;background:#d8d4ca}[data-opening-module]{min-height:200px}' },
      ],
      inspection: { stillSha256: evidence.record.sha256 },
    };
    expect(JSON.stringify(manifest)).not.toMatch(new RegExp(protectedSentinels.join('|')));
    const output = resolve(scratch, 'sentinel-output');
    await isolation.materializeOutput(manifest, output, evidence.record.sha256);
    const imported = await visual.importPreview(output, resolve(scratch, 'sentinel-project'), 'D-SENTINEL', { leakSignals: { schemaVersion: 1, signals: protectedSentinels.map((value: string) => ({ group: 'sentinel', value, normalized: value.toLowerCase() })) }, sourceIdentity: selected.sourceIdentity, anchorCardId: selected.id, expectedH0: 'reserved-image-hole-with-flat-stand-in', expectedGeometry: { aspectRatio: 4 / 3, aspectTolerance: 0.18, alignment: 'right', minWidthRatio: 0.28, minHeightRatio: 0.2 }, sourceStillInspected: true });
    const importedRoot = resolve(scratch, 'sentinel-project', '.inspiration', 'previews', 'D-SENTINEL');
    const importedText = ['index.html', 'styles.css', 'output-contract.json'].map((file) => readFileSync(resolve(importedRoot, file), 'utf8')).join('\n');
    for (const sentinel of protectedSentinels) expect(importedText).not.toContain(sentinel);
    expect(imported.preview).toBe('../previews/D-SENTINEL/index.html');
  }, 40_000);

  it('round-trips large structured manifests and rejects malformed or unsafe output', async () => {
    const isolation = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'isolation-runner.mjs')).href}?manifest=${Date.now()}`);
    const destination = resolve(scratch, 'manifest-stress'); const stillSha256 = 'a'.repeat(64);
    const tricky = ['const quote = "double";', "const apostrophe = 'single';", 'const template = `value ${amount}`;', 'const regex = /[\\\\/"\'`]/gu;', 'const unicode = "雪—café";', 'const closing = "</script>";'].join('\n');
    const padding = `/*${'x'.repeat((1024 * 1024) + 256_000)}*/`;
    const manifest = {
      files: [
        { path: 'index.html', content: `<!doctype html><html><body><script>${tricky}</script></body></html>` },
        { path: 'assets/stress.js', content: `${tricky}\n${padding}` },
      ],
      inspection: { stillSha256 },
    };
    await isolation.materializeOutput(manifest, destination, stillSha256);
    for (const file of manifest.files) {
      const actual = readFileSync(resolve(destination, file.path), 'utf8');
      expect(createHash('sha256').update(actual).digest('hex')).toBe(createHash('sha256').update(file.content).digest('hex'));
    }
    await expect(isolation.materializeOutput({ ...manifest, files: [...manifest.files, manifest.files[0]] }, destination, stillSha256)).rejects.toThrow(/duplicate/i);
    await expect(isolation.materializeOutput({ ...manifest, files: [{ path: '../escape.js', content: 'x' }] }, destination, stillSha256)).rejects.toThrow(/invalid path/i);
    await expect(isolation.materializeOutput({ ...manifest, files: [{ path: 'assets/image.txt', content: 'data:image/png;base64,AAAA' }] }, destination, stillSha256)).rejects.toThrow(/binary data URI/i);
    await expect(isolation.materializeOutput({ ...manifest, files: [{ path: 'assets/too-large.js', content: 'x'.repeat(isolation.MAX_STRUCTURED_OUTPUT_BYTES) }] }, destination, stillSha256)).rejects.toThrow(/2 MiB/i);
  }, 20_000);

  it('initializes schema 11 state, records direction-only subscription provenance, and persists visual controls through events', () => {
    const project = resolve(scratch, 'state-project');
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    expect(runNode(script, ['init', project]).status).toBe(0);
    const requestPath = resolve(scratch, 'state-batch-request.json');
    const actionsPath = resolve(scratch, 'state-batch-actions.json');
    writeFileSync(requestPath, JSON.stringify({ pageUse: 'marketing', seed: 'state-batch', excluded: [] }));
    writeFileSync(actionsPath, JSON.stringify([{ type: 'ACCEPT ALL' }]));
    expect(runNode(resolve(skillRoot, 'scripts', 'reference-selection.mjs'), ['propose-batch-and-save', project, requestPath]).status).toBe(0);
    expect(runNode(resolve(skillRoot, 'scripts', 'reference-selection.mjs'), ['batch-action-and-save', project, actionsPath]).status).toBe(0);
    const selectedState = JSON.parse(readFileSync(resolve(project, '.inspiration', 'state.json'), 'utf8'));
    const card = loadCatalog().cards.find((item: any) => item.id === selectedState.references.activeBatch.items[0].session.currentSet.anchor.id);
    const preview = resolve(project, '.inspiration', 'previews', 'D01');
    mkdirSync(preview, { recursive: true });
    writeFileSync(resolve(preview, 'index.html'), '<!doctype html><html><body><main>Direction preview D01</main></body></html>');
    const generationPath = resolve(scratch, 'direction.json');
    writeFileSync(generationPath, JSON.stringify({
      id: 'D01', directionId: 'D01', parent: null, stage: 'direction', status: 'selected', executionHost: 'sealed-runner', label: 'Direction', category: card.primaryCategory,
      thesis: 'One-card visual direction.', references: [{ id: card.id, role: 'anchor' }], preview: '../previews/D01/index.html',
      previewScope: focusedDirectionScope(), createdAt: new Date().toISOString(),
    }));
    const appended = runNode(script, ['append-generation', project, generationPath]);
    expect(appended.status, appended.stderr).toBe(0);
    const eventPath = resolve(scratch, 'visual-event.json');
    writeFileSync(eventPath, JSON.stringify({ type: 'visual.isolation-recorded', payload: { generationId: 'D01', mode: 'subscription-ephemeral', isolated: false, contextLimited: true, authenticatedWith: 'chatgpt', runner: 'codex-cli', outputMode: 'structured-manifest', workspaceFingerprint: 'a'.repeat(64) } }));
    expect(runNode(script, ['apply-event', project, eventPath]).status).toBe(0);
    writeFileSync(eventPath, JSON.stringify({ type: 'visual.route-conformance-recorded', payload: { route: '/pricing', status: 'passed', checks: ['type', 'palette', 'spacing'] } }));
    expect(runNode(script, ['apply-event', project, eventPath]).status).toBe(0);
    const state = JSON.parse(readFileSync(resolve(project, '.inspiration', 'state.json'), 'utf8'));
    expect(state.schemaVersion).toBe(11);
    expect(state.workbenchVersion).toBe(8);
    expect(state.generations[0].references).toEqual([{ id: card.id, role: 'anchor' }]);
    expect(state.visualControl.isolation.mode).toBe('subscription-ephemeral');
    expect(state.visualControl.isolationRuns.D01).toEqual(expect.objectContaining({ generationId: 'D01', mode: 'subscription-ephemeral', outputMode: 'structured-manifest' }));
    expect(state.visualControl.routeConformance[0].route).toBe('/pricing');
    expect(readFileSync(resolve(project, '.inspiration', 'workbench', 'index.html'), 'utf8')).toContain('SHOW ANOTHER CARD');
    const designReview = readFileSync(resolve(project, '.inspiration', 'Design Review.html'), 'utf8');
    expect(designReview).toContain('"id": "D01"');
    expect(designReview).toContain('"path": "previews/D01/index.html"');
    expect(designReview).not.toContain('"activeBatch"');
    const priorBatch = state.references.activeBatch;
    state.decisions.push({ action: 'PRESERVE MIGRATION DECISION', summary: 'Schema-v10 decisions survive batch migration.', stage: 'intake', createdAt: new Date().toISOString() });
    state.schemaVersion = 10; state.workbenchVersion = 7; state.references.activeSession = priorBatch.items[0].session; delete state.references.activeBatch; state.references.pinned = state.references.activeSession.pinned;
    writeFileSync(resolve(project, '.inspiration', 'state.json'), JSON.stringify(state));
    expect(runNode(script, ['init', project]).status).toBe(0);
    const migrated = JSON.parse(readFileSync(resolve(project, '.inspiration', 'state.json'), 'utf8'));
    expect(migrated.schemaVersion).toBe(11); expect(migrated.references.activeBatch.items).toHaveLength(1); expect(migrated.references.activeBatch.items[0].session.currentSet.anchor.id).toBe(card.id); expect(migrated.generations[0].id).toBe('D01'); expect(migrated.decisions.some((decision: any) => decision.action === 'PRESERVE MIGRATION DECISION')).toBe(true); expect(migrated.visualControl.isolation.mode).toBe('subscription-ephemeral'); expect(migrated.visualControl.isolationRuns.D01.mode).toBe('subscription-ephemeral'); expect(migrated.visualControl.tweakBar.status).toBe('pending');
    expect(readFileSync(resolve(project, '.inspiration', 'Design Review.html'), 'utf8')).toContain('"id": "D01"');
  }, 60_000);

  it('blocks a stale custom direction until its identity-QA checkpoint passes', () => {
    const project = resolve(scratch, 'custom-identity-qa');
    const stateScript = resolve(skillRoot, 'scripts', 'project-state.mjs');
    const selectionScript = resolve(skillRoot, 'scripts', 'reference-selection.mjs');
    expect(runNode(stateScript, ['init', project]).status).toBe(0);
    const catalog = loadCatalog();
    const card = catalog.cards.find((candidate: any) => candidate.identityReviewFresh !== true && candidate.media?.detailImage && candidate.media?.original && candidate.quality?.width > 0 && candidate.quality?.height > 0 && (candidate.imageRecipe?.kind === 'none'
      ? candidate.imageRecipe.reason?.trim().length >= 60 && candidate.imageRecipe.permittedMethod?.trim().length >= 3
      : candidate.imageRecipe?.prompt?.trim().length >= 80));
    expect(card).toBeTruthy();
    const requestPath = resolve(scratch, 'custom-qa-request.json');
    const actionsPath = resolve(scratch, 'custom-qa-actions.json');
    writeFileSync(requestPath, JSON.stringify({ mode: 'custom', pageUse: 'marketing', identifiers: [card.id], excluded: [] }));
    writeFileSync(actionsPath, JSON.stringify([{ type: 'ACCEPT ALL' }]));
    expect(runNode(selectionScript, ['propose-batch-and-save', project, requestPath]).status).toBe(0);
    expect(runNode(selectionScript, ['batch-action-and-save', project, actionsPath]).status).toBe(0);
    const preview = resolve(project, '.inspiration', 'previews', 'D-CUSTOM');
    mkdirSync(preview, { recursive: true });
    writeFileSync(resolve(preview, 'index.html'), '<!doctype html><html><body><main>Custom direction</main></body></html>');
    const generationPath = resolve(scratch, 'custom-qa-direction.json');
    writeFileSync(generationPath, JSON.stringify({
      id: 'D-CUSTOM', directionId: 'D-CUSTOM', parent: null, stage: 'direction', status: 'selected', executionHost: 'sealed-runner', label: 'Custom direction', category: card.primaryCategory,
      thesis: 'Explicit custom-card direction.', references: [{ id: card.id, role: 'anchor' }], preview: '../previews/D-CUSTOM/index.html', previewScope: focusedDirectionScope(), createdAt: new Date().toISOString(),
    }));
    const blocked = runNode(stateScript, ['append-generation', project, generationPath]);
    expect(blocked.status).not.toBe(0); expect(blocked.stderr).toMatch(/identity QA passes/i);
    const eventPath = resolve(scratch, 'custom-qa-event.json');
    writeFileSync(eventPath, JSON.stringify({ type: 'references.identity-qa-recorded', payload: { slotId: 'R01', status: 'passed', reviewer: 'Project reviewer', summary: 'Reviewed source identity exclusions and still resemblance.' } }));
    expect(runNode(stateScript, ['apply-event', project, eventPath]).status).toBe(0);
    expect(runNode(stateScript, ['append-generation', project, generationPath]).status).toBe(0);
  }, 30_000);

  it('enforces parent-owned variants, complete batches, protected hero lineage, and clean tweak-bar exclusion', async () => {
    const catalog = loadCatalog(); const card = catalog.cards.find((item: any) => item.id === 'site-spade');
    const stateModule = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'project-state.mjs')).href}?boundaries=${Date.now()}`);
    const project = resolve(scratch, 'state-boundaries'); const state = stateModule.emptyState(project); const now = new Date().toISOString();
    state.status = 'build-path';
    state.generations = [{
      id: 'D01-V01-A', parent: 'D01-H0', stage: 'variant', status: 'selected', executionHost: 'sealed-runner', batchId: 'D01-V01', variantOrdinal: 'A', batchPlanFingerprint: 'a'.repeat(64), differenceAxes: ['hierarchy', 'body-format', 'navigation'],
      label: 'A', category: card.primaryCategory, thesis: '', references: [{ id: card.id, role: 'anchor' }], preview: '../previews/D01-V01-A/index.html', previewScope: { kind: 'complete-homepage-variant', pageCount: 1, completeHomepage: true, includesDensePage: false, futureImageSlot: 'empty-flat' }, createdAt: now,
    }];
    let errors = stateModule.validateState(state, project, catalog);
    expect(errors).toContain('variant D01-V01-A must be generated by parent/project Codex');
    expect(errors).toContain('a selected variant from a complete three-variant batch is required before build path');

    state.generations = [
      { id: 'BUILD-H0', parent: null, stage: 'build-path', status: 'selected', executionHost: 'parent-project-codex', buildPath: 'original', clonePreflight: null, heroState: 'H0', recipeKind: 'primary', contractFingerprint: 'b'.repeat(64), layoutFingerprint: 'c'.repeat(64), label: 'Build', category: card.primaryCategory, thesis: '', references: [{ id: card.id, role: 'anchor' }], preview: '../previews/BUILD-H0/index.html', previewScope: { kind: 'build-path-shell', completeHomepage: true, includesDensePage: false }, createdAt: now },
      { id: 'BUILD-H0-HB01-H1', parent: 'BUILD-H0', stage: 'hero', status: 'selected', executionHost: 'parent-project-codex', heroBatchId: 'BUILD-H0-HB01', heroState: 'H1', provider: 'codex', recipeKind: 'primary', recipeFingerprint: 'd'.repeat(64), assetSha256: 'e'.repeat(64), assetReceipt: 'assets/H1.png', contractFingerprint: 'b'.repeat(64), layoutFingerprint: 'f'.repeat(64), label: 'H1', category: card.primaryCategory, thesis: '', references: [{ id: card.id, role: 'anchor' }], preview: '../previews/BUILD-H0-HB01-H1/index.html', createdAt: now },
    ];
    errors = stateModule.validateState(state, project, catalog);
    expect(errors).toContain('BUILD-H0-HB01-H1 changed build-path contract, layout, or recipe lineage');

    state.visualControl.tweakBar = { status: 'production-excluded', records: [
      { status: 'active', generationId: 'BUILD-H0-HB01-H1', contractFingerprint: 'b'.repeat(64), controls: ['typography'], recordedAt: now },
      { status: 'applied', generationId: 'IMPLEMENTED', contractFingerprint: 'b'.repeat(64), valuesFingerprint: '1'.repeat(64), recordedAt: now },
      { status: 'production-excluded', generationId: 'FINAL', contractFingerprint: 'b'.repeat(64), productionBuildFingerprint: '2'.repeat(64), markersFound: ['data-tweak-bar'], recordedAt: now },
    ] };
    errors = stateModule.validateState(state, project, catalog);
    expect(errors).toContain('production-excluded tweak bar requires a clean production-build fingerprint');
  });

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
      visualControl: { isolation: { mode: 'payload-only', recordedAt: new Date().toISOString() } },
      decisions: [], heroProvider: 'codex',
    }));
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    expect(runNode(script, ['init', project]).status).toBe(0);
    const state = JSON.parse(readFileSync(resolve(inspiration, 'state.json'), 'utf8'));
    expect(state.schemaVersion).toBe(11);
    expect(state.generations[0].previewScope).toEqual({ kind: 'legacy-unverified' });
    expect(state.visualControl).toBeTruthy();
    expect(state.visualControl.isolation).toEqual(expect.objectContaining({ mode: 'legacy-unverified', legacyMode: 'payload-only' }));
    expect(state.visualControl.isolationRuns.OLD).toEqual(expect.objectContaining({ generationId: 'OLD', mode: 'legacy-unverified' }));
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
  }, 30_000);

  it('installs, checks, and repairs project-local skills with managed rollback boundaries', async () => {
    const project = resolve(scratch, 'website-project');
    const impeccable = resolve(scratch, 'impeccable-fixture');
    mkdirSync(project, { recursive: true });
    writeFileSync(resolve(project, 'package.json'), '{"private":true}');
    makeImpeccableFixture(impeccable);
    const setup = resolve(root, 'scripts', 'setup-project.mjs');
    const initialSetup = runNode(setup, [project, '--impeccable-source', impeccable]);
    expect(initialSetup.status, initialSetup.stderr).toBe(0);
    const destination = resolve(project, '.agents', 'skills', 'design-taste-injection');
    expect(existsSync(resolve(destination, 'SKILL.md'))).toBe(true);
    expect(existsSync(resolve(project, '.agents', 'skills', 'impeccable', 'SKILL.md'))).toBe(true);
    const config = JSON.parse(readFileSync(resolve(destination, 'config', 'library.json'), 'utf8'));
    expect(config.scope).toBe('project');
    expect(config.projectRoot).toBe(realpathSync.native(project));
    const installedState = resolve(destination, 'scripts', 'project-state.mjs');
    const initialized = runNode(installedState, ['init', project]);
    expect(initialized.status, initialized.stderr).toBe(0);
    expect(JSON.parse(readFileSync(resolve(project, '.inspiration', 'state.json'), 'utf8')).projectRoot).toBe(realpathSync.native(project));
    const malformed = spawnSync(process.execPath, [installedState, 'init', '--project-root', project], { cwd: project, encoding: 'utf8' });
    expect(malformed.status).not.toBe(0);
    expect(malformed.stderr).toContain('do not use --project-root');
    expect(existsSync(resolve(project, '--project-root'))).toBe(false);
    const nestedProject = resolve(project, 'site');
    const nestedAttempt = runNode(installedState, ['init', nestedProject]);
    expect(nestedAttempt.status).not.toBe(0);
    expect(nestedAttempt.stderr).toContain('must match configured website project');
    expect(existsSync(nestedProject)).toBe(false);
    expect(runNode(resolve(root, 'scripts', 'check-project.mjs'), [project]).status).toBe(0);
    writeFileSync(resolve(destination, 'scripts', 'reference-selection.mjs'), '// stale');
    expect(runNode(resolve(root, 'scripts', 'check-project.mjs'), [project]).status).not.toBe(0);
    const repairedSetup = runNode(setup, [project, '--impeccable-source', impeccable]);
    expect(repairedSetup.status, repairedSetup.stderr).toBe(0);
    expect(runNode(resolve(root, 'scripts', 'check-project.mjs'), [project]).status).toBe(0);
    writeFileSync(resolve(project, '.agents', 'skills', 'impeccable', 'custom-note.txt'), 'preserve me');
    const preservingSetup = runNode(setup, [project, '--impeccable-source', impeccable]);
    expect(preservingSetup.status, preservingSetup.stderr).toBe(0);
    expect(readFileSync(resolve(project, '.agents', 'skills', 'impeccable', 'custom-note.txt'), 'utf8')).toBe('preserve me');

    const dest = resolve(scratch, 'rollback-destination');
    const stage = resolve(scratch, 'rollback-staging');
    mkdirSync(dest, { recursive: true }); mkdirSync(stage, { recursive: true });
    writeFileSync(resolve(dest, 'identity.txt'), 'old'); writeFileSync(resolve(stage, 'identity.txt'), 'new');
    const { npxInvocation, replaceMany } = await import(`${pathToFileURL(setup).href}?rollback=${Date.now()}`);
    expect(npxInvocation(['--version'], 'win32', 'C:\\Windows\\System32\\cmd.exe')).toEqual({
      executable: 'C:\\Windows\\System32\\cmd.exe',
      args: ['/d', '/s', '/c', 'npx.cmd', '--version'],
    });
    expect(npxInvocation(['--version'], 'linux')).toEqual({ executable: 'npx', args: ['--version'] });
    await expect(replaceMany([{ destination: dest, staging: stage }], { afterInstall: () => { throw new Error('interrupted'); } })).rejects.toThrow('interrupted');
    expect(readFileSync(resolve(dest, 'identity.txt'), 'utf8')).toBe('old');
  }, 40_000);

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
  }, 20_000);

  it('keeps clone QA at exactly three widths', () => {
    const project = resolve(scratch, 'clone-qa-project');
    const impeccable = resolve(scratch, 'clone-qa-impeccable');
    mkdirSync(project, { recursive: true });
    makeImpeccableFixture(impeccable);
    expect(runNode(resolve(root, 'scripts', 'setup-project.mjs'), [project, '--impeccable-source', impeccable]).status).toBe(0);
    const projectAlias = resolve(scratch, 'clone-qa-project-alias');
    symlinkSync(project, projectAlias, process.platform === 'win32' ? 'junction' : 'dir');
    const runtime = resolve(project, '.agents', 'skills', 'design-taste-injection', 'scripts', 'clone-runtime.mjs');
    const wrongRoot = resolve(project, 'site');
    const wrongPreflight = runNode(runtime, ['preflight', wrongRoot, 'site-spade', 'QA-WRONG']);
    expect(wrongPreflight.status).not.toBe(0);
    expect(wrongPreflight.stderr).toContain('must match configured website project');
    expect(existsSync(wrongRoot)).toBe(false);
    const evidence = resolve(project, '.inspiration', 'clone', 'QA1');
    const evidenceAlias = resolve(projectAlias, '.inspiration', 'clone', 'QA1');
    mkdirSync(evidence, { recursive: true });
    writeFileSync(resolve(evidence, 'preflight.json'), JSON.stringify({ schemaVersion: 2, generationId: 'QA1', cardId: 'site-spade', projectRoot: projectAlias, evidenceRoot: evidenceAlias, requiredWidths: [1440, 768, 390] }));
    const pairs = [1440, 768, 390].map((width) => {
      const original = resolve(evidence, `original-${width}.png`); const clone = resolve(evidence, `clone-${width}.png`);
      const png = new PNG({ width, height: 2 }); png.data.fill(255); const bytes = PNG.sync.write(png);
      writeFileSync(original, bytes); writeFileSync(clone, bytes); return { width, original, clone, maxDiffRatio: 0 };
    });
    const manifest = resolve(evidence, 'qa-manifest.json');
    writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, generationId: 'QA1', pairs }));
    const verified = runNode(runtime, ['verify', projectAlias, 'QA1', manifest]);
    expect(verified.status, verified.stderr).toBe(0);
    const report = JSON.parse(readFileSync(resolve(evidence, 'qa', 'report.json'), 'utf8'));
    expect(report.results.map((item: any) => item.width)).toEqual([1440, 768, 390]);
  }, 20_000);

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
    expect(readFileSync(workbenchPath, 'utf8')).toContain('content="6"');
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
