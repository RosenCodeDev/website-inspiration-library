import { cpSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { afterAll, describe, expect, it } from 'vitest';
import { PNG } from 'pngjs';

const root = realpathSync(process.cwd());
const skillRoot = resolve(root, 'skills', 'design-taste-injection');
const scratch = mkdtempSync(join(tmpdir(), 'design-taste-test-'));
const runNode = (script: string, args: string[] = [], env: NodeJS.ProcessEnv = {}) => spawnSync(
  process.execPath,
  [script, ...args],
  { cwd: root, encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 20 * 1024 * 1024 },
);
const focusedDirectionScope = () => ({
  kind: 'focused-category-preview',
  pageCount: 1,
  sections: ['hero', 'opening-module'],
  completeSite: false,
});

afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('design-taste-injection skill', () => {
  it('has a valid concise entrypoint and routed guidance', () => {
    const skill = readFileSync(resolve(skillRoot, 'SKILL.md'), 'utf8');
    const metadata = readFileSync(resolve(skillRoot, 'agents', 'openai.yaml'), 'utf8');
    expect(skill).toContain('name: design-taste-injection');
    expect(skill).not.toContain('[TODO');
    expect(skill).toContain('APPROVE AND CONTINUE');
    expect(skill).toContain('DO NOT USE THIS CARD');
    expect(skill).toContain('`H0`');
    expect(skill).toContain('focused-category-preview');
    expect(metadata).toContain('$design-taste-injection');
    expect(metadata).toContain('allow_implicit_invocation: true');
  });

  it('imports maintained scripts without executing their command-line entrypoints', () => {
    const files = [
      'scripts/check-codex.mjs', 'scripts/setup-codex.mjs', 'scripts/skill-integrity.mjs', 'scripts/export-workflow-catalog.mjs',
      'scripts/doctor.mjs', 'scripts/validate-skill.mjs', 'scripts/verify-temp-install.mjs', 'scripts/controlled-clone-fixture.mjs', 'scripts/clone-plumbing-smoke.mjs',
      'skills/design-taste-injection/scripts/library.mjs', 'skills/design-taste-injection/scripts/build-probe-bundle.mjs',
      'skills/design-taste-injection/scripts/project-state.mjs', 'skills/design-taste-injection/scripts/reference-selection.mjs',
      'skills/design-taste-injection/scripts/clone-runtime.mjs', 'skills/design-taste-injection/scripts/serve-workbench.mjs',
    ].map((file) => pathToFileURL(resolve(root, file)).href);
    const imported = spawnSync(process.execPath, ['-e', `Promise.all(${JSON.stringify(files)}.map((file)=>import(file)))`], { cwd: root, encoding: 'utf8' });
    expect(imported.status, imported.stderr).toBe(0);
    expect(imported.stdout).toBe('');
    const stdinImport = spawnSync(process.execPath, ['--input-type=module', '-'], { cwd: root, encoding: 'utf8', input: `await import(${JSON.stringify(files[9])})` });
    expect(stdinImport.status, stdinImport.stderr).toBe(0);
    expect(stdinImport.stdout).toBe('');
  }, 20_000);

  it('reads the live validated library rather than a copied project catalog', () => {
    const result = runNode(resolve(skillRoot, 'scripts', 'library.mjs'), ['catalog'], { DESIGN_TASTE_LIBRARY_ROOT: root });
    expect(result.status, result.stderr).toBe(0);
    const catalog = JSON.parse(result.stdout);
    expect(catalog.cards).toHaveLength(63);
    expect(catalog.categories).toHaveLength(7);
    expect(catalog.libraryRoot).toBe(root);
    expect(catalog.cards.every((card: { fingerprint?: string }) => Boolean(card.fingerprint))).toBe(true);
  });

  it('initializes and validates one persistent project workbench', () => {
    const project = resolve(scratch, 'new-website');
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    const initialized = runNode(script, ['init', project], env);
    expect(initialized.status, initialized.stderr).toBe(0);

    const makePreview = (id: string) => {
      const folder = resolve(project, '.inspiration', 'previews', id);
      mkdirSync(folder, { recursive: true });
      writeFileSync(resolve(folder, 'index.html'), `<!doctype html><html><body><h1>${id}</h1></body></html>`);
      return `../previews/${id}/index.html`;
    };

    const generationPath = resolve(scratch, 'generation.json');
    writeFileSync(generationPath, JSON.stringify({
      id: 'D01', parent: null, stage: 'direction', status: 'candidate', label: 'Print Tech Paper', category: 'Print-Tech Paper', thesis: 'Editorial proof with tactile structure.', references: [], preview: makePreview('D01'), createdAt: new Date().toISOString(),
      previewScope: focusedDirectionScope(),
    }));
    const appended = runNode(script, ['append-generation', project, generationPath], env);
    expect(appended.status, appended.stderr).toBe(0);

    const h0Path = resolve(scratch, 'hero-h0.json');
    const h1Path = resolve(scratch, 'hero-h1.json');
    writeFileSync(h0Path, JSON.stringify({
      id: 'D01-A-O-H0', parent: 'D01', stage: 'hero', status: 'selected', label: 'Code hero', category: 'Print-Tech Paper', thesis: 'A polished code-built print plate.', references: [], preview: makePreview('D01-A-O-H0'), createdAt: new Date().toISOString(),
    }));
    writeFileSync(h1Path, JSON.stringify({
      id: 'D01-A-O-H1', parent: 'D01-A-O-H0', stage: 'hero', status: 'candidate', label: 'Generated hero', category: 'Print-Tech Paper', thesis: 'A generated alternative that preserves H0.', references: [], preview: makePreview('D01-A-O-H1'), createdAt: new Date().toISOString(),
    }));
    expect(runNode(script, ['append-generation', project, h0Path], env).status).toBe(0);
    expect(runNode(script, ['append-generation', project, h1Path], env).status).toBe(0);
    expect(runNode(script, ['validate', project], env).status).toBe(0);
    expect(runNode(script, ['init', project], env).status).toBe(0);

    const state = JSON.parse(readFileSync(resolve(project, '.inspiration', 'state.json'), 'utf8'));
    const workbench = readFileSync(resolve(project, '.inspiration', 'workbench', 'index.html'), 'utf8');
    expect(state.generations.map((item: { id: string }) => item.id)).toEqual(['D01', 'D01-A-O-H0', 'D01-A-O-H1']);
    expect(workbench).toContain('Design Workbench');
    expect(workbench).toContain("fetch('../state.json'");
  }, 20_000);

  it('adds workflow state to an existing website without replacing its files', () => {
    const project = resolve(scratch, 'existing-website');
    mkdirSync(project, { recursive: true });
    const existing = '<h1>Existing website</h1>';
    writeFileSync(resolve(project, 'index.html'), existing);
    const result = runNode(
      resolve(skillRoot, 'scripts', 'project-state.mjs'),
      ['init', project],
      { DESIGN_TASTE_LIBRARY_ROOT: root },
    );
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(resolve(project, 'index.html'), 'utf8')).toBe(existing);
    expect(JSON.parse(readFileSync(resolve(project, '.inspiration', 'state.json'), 'utf8')).heroProvider).toBe('codex');
  });

  it('keeps reference selection user-controlled and replaces exclusions automatically', () => {
    const script = resolve(skillRoot, 'scripts', 'reference-selection.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    const requestPath = resolve(scratch, 'selection-request.json');
    writeFileSync(requestPath, JSON.stringify({
      category: 'Print-Tech Paper',
      keywords: ['editorial', 'product', 'evidence'],
      roles: ['composition', 'typography', 'content-system'],
      pageUse: 'marketing',
      pinned: [], excluded: [], usage: {}, fitById: {},
    }));
    const proposalResult = runNode(script, ['propose', requestPath], env);
    expect(proposalResult.status, proposalResult.stderr).toBe(0);
    const proposal = JSON.parse(proposalResult.stdout);
    expect(proposal.currentSet.anchor.role).toBe('anchor');
    expect(proposal.currentSet.supporting.length).toBeLessThanOrEqual(2);

    const sessionPath = resolve(scratch, 'selection-session.json');
    writeFileSync(sessionPath, JSON.stringify(proposal));

    const pinPath = resolve(scratch, 'pin-action.json');
    writeFileSync(pinPath, JSON.stringify({ type: 'PIN THIS CARD', cardId: proposal.currentSet.anchor.id, role: 'anchor' }));
    const pinResult = runNode(script, ['action', sessionPath, pinPath], env);
    expect(pinResult.status, pinResult.stderr).toBe(0);
    const pinned = JSON.parse(pinResult.stdout);
    expect(pinned.next).toBe('ask-keep-or-refresh-unpinned');
    writeFileSync(sessionPath, JSON.stringify(pinned));

    const excludePath = resolve(scratch, 'exclude-action.json');
    writeFileSync(excludePath, JSON.stringify({ type: 'DO NOT USE THIS CARD', cardId: proposal.currentSet.supporting[0].id }));
    const excludeResult = runNode(script, ['action', sessionPath, excludePath], env);
    expect(excludeResult.status, excludeResult.stderr).toBe(0);
    const excluded = JSON.parse(excludeResult.stdout);
    expect(excluded.next).toBe('review-automatic-replacement');
    expect([excluded.currentSet.anchor.id, ...excluded.currentSet.supporting.map((item: { id: string }) => item.id)]).not.toContain(proposal.currentSet.supporting[0].id);
    writeFileSync(sessionPath, JSON.stringify(excluded));

    const anotherPath = resolve(scratch, 'another-action.json');
    writeFileSync(anotherPath, JSON.stringify({ type: 'SHOW ANOTHER SET' }));
    const anotherResult = runNode(script, ['action', sessionPath, anotherPath], env);
    expect(anotherResult.status, anotherResult.stderr).toBe(0);
    expect(JSON.parse(anotherResult.stdout).next).toBe('review-alternate-set');
  }, 20_000);

  it('accumulates selection history and swaps the currently displayed alternate slot', () => {
    const script = resolve(skillRoot, 'scripts', 'reference-selection.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    const requestPath = resolve(scratch, 'selection-history-request.json');
    const sessionPath = resolve(scratch, 'selection-history-session.json');
    const actionPath = resolve(scratch, 'selection-history-action.json');
    writeFileSync(requestPath, JSON.stringify({
      category: 'Print-Tech Paper', pageUse: 'marketing', fitMode: 'exploratory',
      keywords: ['editorial', 'product'], roles: ['composition', 'typography'],
      pinned: [], excluded: [], usage: {}, fitById: {},
    }));
    const first = runNode(script, ['propose', requestPath], env);
    expect(first.status, first.stderr).toBe(0);
    let session = JSON.parse(first.stdout);
    const signatures = new Set([session.currentSet.signature]);
    writeFileSync(actionPath, JSON.stringify({ type: 'SHOW ANOTHER SET' }));
    for (let index = 0; index < 4; index += 1) {
      writeFileSync(sessionPath, JSON.stringify(session));
      const alternate = runNode(script, ['action', sessionPath, actionPath], env);
      expect(alternate.status, alternate.stderr).toBe(0);
      session = JSON.parse(alternate.stdout);
      expect(signatures.has(session.currentSet.signature)).toBe(false);
      signatures.add(session.currentSet.signature);
    }
    expect(Object.values(session.usage).some((count) => Number(count) > 1)).toBe(true);

    const oldAnchor = session.currentSet.anchor.id;
    writeFileSync(sessionPath, JSON.stringify(session));
    writeFileSync(actionPath, JSON.stringify({ type: 'SWAP', cardId: oldAnchor }));
    const swapped = runNode(script, ['action', sessionPath, actionPath], env);
    expect(swapped.status, swapped.stderr).toBe(0);
    const next = JSON.parse(swapped.stdout);
    expect(next.currentSet.anchor.id).not.toBe(oldAnchor);
    expect(next.currentSet.anchor.role).toBe('anchor');
    expect(next.history.at(-1).signature).toBe(session.currentSet.signature);
  }, 20_000);

  it('validates malformed selection inputs and always supports exploratory category directions', async () => {
    const script = resolve(skillRoot, 'scripts', 'reference-selection.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    const requestPath = resolve(scratch, 'selection-validation-request.json');
    writeFileSync(requestPath, JSON.stringify({
      category: 'Print-Tech Paper', pageUse: 'marketing', fitMode: 'exploratory', keywords: [], roles: [],
      pinned: [{ id: 'site-spade', role: 'anchor' }, { id: 'site-paper', role: 'anchor' }],
      excluded: [], usage: {}, fitById: { 'site-spade': 1.2 },
    }));
    const malformed = runNode(script, ['propose', requestPath], env);
    expect(malformed.status).not.toBe(0);
    expect(malformed.stderr).toMatch(/fitById|one pinned anchor/);

    const catalogResult = runNode(resolve(skillRoot, 'scripts', 'library.mjs'), ['catalog'], env);
    const catalog = JSON.parse(catalogResult.stdout);
    const { createSession } = await import(`${pathToFileURL(script).href}?selection=${Date.now()}`);
    for (const pageUse of ['marketing', 'product', 'editorial', 'documentation', 'authentication', 'footer']) for (const category of catalog.categories) {
      const proposal = createSession(catalog, {
        category, pageUse, fitMode: 'exploratory', keywords: [pageUse], roles: [],
        pinned: [], excluded: [], usage: {}, fitById: {},
      });
      expect(['exact', 'adjacent', 'aesthetic-only'], `${category}/${pageUse}`).toContain(proposal.currentSet.anchorFit);
    }
    const implementationFailures = catalog.categories.filter((category: string) => {
      try {
        createSession(catalog, { category, pageUse: 'authentication', fitMode: 'implementation', keywords: [], roles: [], pinned: [], excluded: [], usage: {}, fitById: {} });
        return false;
      } catch { return true; }
    });
    expect(implementationFailures.length).toBeGreaterThan(0);
  }, 20_000);

  it('rejects unsafe automatic anchors and missing workbench previews', () => {
    const selection = resolve(skillRoot, 'scripts', 'reference-selection.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    const requestPath = resolve(scratch, 'unsafe-anchor-request.json');
    writeFileSync(requestPath, JSON.stringify({
      category: 'Illustrated Storybook', pageUse: 'marketing', roles: ['composition'],
      pinned: [{ id: 'image-flora-footer', role: 'anchor' }], excluded: [], usage: {}, fitById: {},
    }));
    const rejectedAnchor = runNode(selection, ['propose', requestPath], env);
    expect(rejectedAnchor.status).not.toBe(0);
    expect(rejectedAnchor.stderr).toContain('cannot anchor');

    const project = resolve(scratch, 'missing-preview-project');
    const stateScript = resolve(skillRoot, 'scripts', 'project-state.mjs');
    expect(runNode(stateScript, ['init', project], env).status).toBe(0);
    const record = resolve(scratch, 'missing-preview.json');
    writeFileSync(record, JSON.stringify({
      id: 'D07', parent: null, stage: 'direction', status: 'candidate', label: 'Missing',
      category: 'Illustrated Storybook', thesis: 'Missing preview.', references: [],
      preview: '../previews/D07/index.html', previewScope: focusedDirectionScope(), createdAt: new Date().toISOString(),
    }));
    const rejectedPreview = runNode(stateScript, ['append-generation', project, record], env);
    expect(rejectedPreview.status).not.toBe(0);
    expect(rejectedPreview.stderr).toContain('generation preview is missing');

    const overbuiltFolder = resolve(project, '.inspiration', 'previews', 'D08');
    mkdirSync(overbuiltFolder, { recursive: true });
    writeFileSync(resolve(overbuiltFolder, 'index.html'), '<!doctype html><html><body><main>Overbuilt direction</main></body></html>');
    writeFileSync(record, JSON.stringify({
      id: 'D08', parent: null, stage: 'direction', status: 'candidate', label: 'Overbuilt',
      category: 'Illustrated Storybook', thesis: 'A complete site created too early.', references: [],
      preview: '../previews/D08/index.html',
      previewScope: { kind: 'focused-category-preview', pageCount: 2, sections: ['hero', 'opening-module', 'pricing'], completeSite: true },
      createdAt: new Date().toISOString(),
    }));
    const rejectedScope = runNode(stateScript, ['append-generation', project, record], env);
    expect(rejectedScope.status).not.toBe(0);
    expect(rejectedScope.stderr).toContain('one page with exactly a hero and one opening module');
  }, 20_000);

  it('migrates legacy project state without losing its generation history', () => {
    const project = resolve(scratch, 'legacy-project-state');
    const inspiration = resolve(project, '.inspiration');
    mkdirSync(inspiration, { recursive: true });
    writeFileSync(resolve(inspiration, 'state.json'), JSON.stringify({
      schemaVersion: 1,
      projectRoot: project,
      status: 'direction',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      intake: { introduction: 'Legacy', intent: 'Preserve it', audience: 'Team', materialsAndRequirements: '' },
      informationArchitecture: { status: 'approved', pages: [], sections: [], primaryJourney: '' },
      references: { pinned: [], excluded: [], usage: {}, sets: [] },
      generations: [{
        id: 'D01', parent: null, stage: 'direction', status: 'selected', label: 'Legacy direction',
        category: 'Print-Tech Paper', thesis: 'Preserved legacy direction.', references: [], preview: '', createdAt: new Date().toISOString(),
      }],
      decisions: [],
      heroProvider: 'codex',
    }));
    const migrated = runNode(
      resolve(skillRoot, 'scripts', 'project-state.mjs'),
      ['init', project],
      { DESIGN_TASTE_LIBRARY_ROOT: root },
    );
    expect(migrated.status, migrated.stderr).toBe(0);
    const state = JSON.parse(readFileSync(resolve(inspiration, 'state.json'), 'utf8'));
    expect(state.schemaVersion).toBe(5);
    expect(state.generations[0].previewScope).toEqual({ kind: 'legacy-unverified' });
    expect(state.generations[0].id).toBe('D01');
    expect(state.generations[0].preview).toBe('../previews/D01/index.html');
    expect(readFileSync(resolve(inspiration, 'previews', 'D01', 'index.html'), 'utf8')).toContain('Legacy generation preserved');

    for (const legacyVersion of [2, 3, 4]) {
      const legacyProject = resolve(scratch, `legacy-project-state-v${legacyVersion}`);
      const legacyInspiration = resolve(legacyProject, '.inspiration');
      mkdirSync(legacyInspiration, { recursive: true });
      const { previewScope: _previewScope, ...legacyGenerationBase } = state.generations[0];
      const legacyGeneration = { ...legacyGenerationBase, id: `D0${legacyVersion}`, parent: null, preview: `../previews/D0${legacyVersion}/index.html` };
      writeFileSync(resolve(legacyInspiration, 'state.json'), JSON.stringify({
        ...state, schemaVersion: legacyVersion, workbenchVersion: 1, projectRoot: legacyProject,
        generations: [legacyGeneration],
      }));
      const migratedLegacy = runNode(resolve(skillRoot, 'scripts', 'project-state.mjs'), ['init', legacyProject], { DESIGN_TASTE_LIBRARY_ROOT: root });
      expect(migratedLegacy.status, migratedLegacy.stderr).toBe(0);
      const legacyState = JSON.parse(readFileSync(resolve(legacyInspiration, 'state.json'), 'utf8'));
      expect(legacyState.schemaVersion).toBe(5);
      expect(legacyState.generations[0].id).toBe(`D0${legacyVersion}`);
      expect(legacyState.generations[0].previewScope).toEqual({ kind: 'legacy-unverified' });
    }
  });

  it('updates state through validated events and preserves the prior file after rejection', () => {
    const project = resolve(scratch, 'state-events-project');
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    expect(runNode(script, ['init', project], env).status).toBe(0);
    const eventPath = resolve(scratch, 'state-event.json');
    writeFileSync(eventPath, JSON.stringify({
      type: 'intake.updated',
      payload: { introduction: 'A product site', intent: 'Explain value', audience: 'Buyers', materialsAndRequirements: 'Use the supplied brief.' },
    }));
    expect(runNode(script, ['apply-event', project, eventPath], env).status).toBe(0);
    writeFileSync(eventPath, JSON.stringify({ type: 'workflow.status-changed', payload: { status: 'architecture' } }));
    expect(runNode(script, ['apply-event', project, eventPath], env).status).toBe(0);
    writeFileSync(eventPath, JSON.stringify({
      type: 'architecture.updated',
      payload: { status: 'approved', pages: ['Home'], sections: ['Hero'], primaryJourney: 'Learn then act' },
    }));
    expect(runNode(script, ['apply-event', project, eventPath], env).status).toBe(0);
    const statePath = resolve(project, '.inspiration', 'state.json');
    const beforeInvalid = readFileSync(statePath, 'utf8');
    writeFileSync(eventPath, JSON.stringify({ type: 'workflow.status-changed', payload: { status: 'invented-stage' } }));
    const rejected = runNode(script, ['apply-event', project, eventPath], env);
    expect(rejected.status).not.toBe(0);
    expect(readFileSync(statePath, 'utf8')).toBe(beforeInvalid);
    const state = JSON.parse(beforeInvalid);
    expect(state.schemaVersion).toBe(5);
    expect(state.intake.introduction).toBe('A product site');
    expect(state.informationArchitecture.status).toBe('approved');
  }, 20_000);

  it('preserves the prior state when an atomic replacement is interrupted', async () => {
    const path = resolve(scratch, 'atomic-state.json');
    writeFileSync(path, '{"prior":true}\n');
    const { atomicWriteJson } = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'project-state.mjs')).href}?atomic=${Date.now()}`);
    await expect(atomicWriteJson(path, { prior: false }, { beforeReplace: () => { throw new Error('simulated interruption'); } })).rejects.toThrow('simulated interruption');
    expect(readFileSync(path, 'utf8')).toBe('{"prior":true}\n');
  });

  it('archives a customized older workbench before installing the compatible template', () => {
    const project = resolve(scratch, 'custom-workbench-project');
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    expect(runNode(script, ['init', project], env).status).toBe(0);
    const statePath = resolve(project, '.inspiration', 'state.json');
    const workbenchPath = resolve(project, '.inspiration', 'workbench', 'index.html');
    const custom = '<!doctype html><html><body><h1>My custom workbench</h1></body></html>';
    writeFileSync(workbenchPath, custom);
    const state = JSON.parse(readFileSync(statePath, 'utf8'));
    state.schemaVersion = 3;
    state.workbenchVersion = 2;
    writeFileSync(statePath, JSON.stringify(state));
    const upgraded = runNode(script, ['init', project], env);
    expect(upgraded.status, upgraded.stderr).toBe(0);
    const archive = resolve(project, '.inspiration', 'workbench', 'archive');
    const archivedName = readdirSync(archive)[0];
    expect(readFileSync(resolve(archive, archivedName), 'utf8')).toBe(custom);
    expect(readFileSync(workbenchPath, 'utf8')).toContain('design-taste-workbench-version" content="3');
  }, 20_000);

  it('serves isolated workbench previews, byte-range media, and falls back from a busy port', async () => {
    const project = resolve(scratch, 'workbench-server-project');
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    expect(runNode(script, ['init', project], env).status).toBe(0);
    const media = resolve(project, '.inspiration', 'previews', 'D01', 'sample.mp4');
    mkdirSync(resolve(media, '..'), { recursive: true });
    writeFileSync(media, Buffer.from('0123456789'));
    const template = readFileSync(resolve(project, '.inspiration', 'workbench', 'index.html'), 'utf8');
    expect(template).toContain('sandbox="allow-scripts"');
    expect(template).toContain('stage-filter');
    expect(template).toContain('category-filter');

    const occupied = createServer((_request, response) => response.end('occupied'));
    await new Promise<void>((done) => occupied.listen(0, '127.0.0.1', done));
    const busyPort = (occupied.address() as { port: number }).port;
    const { listenWithFallback } = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'serve-workbench.mjs')).href}?server=${Date.now()}`);
    const running = await listenWithFallback(project, busyPort, 3);
    expect(running.port).toBe(busyPort + 1);
    const ranged = await fetch(`http://127.0.0.1:${running.port}/previews/D01/sample.mp4`, { headers: { Range: 'bytes=2-5' } });
    expect(ranged.status).toBe(206);
    expect(ranged.headers.get('content-type')).toBe('video/mp4');
    expect(await ranged.text()).toBe('2345');
    const escaped = await fetch(`http://127.0.0.1:${running.port}/../package.json`);
    expect(escaped.status).toBe(404);
    await new Promise<void>((done, reject) => running.server.close((error?: Error) => error ? reject(error) : done()));
    await new Promise<void>((done, reject) => occupied.close((error?: Error) => error ? reject(error) : done()));
  });

  it('uses an operating-system port after valid high ports are exhausted', async () => {
    const project = resolve(scratch, 'high-port-project');
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    expect(runNode(script, ['init', project], { DESIGN_TASTE_LIBRARY_ROOT: root }).status).toBe(0);
    const occupied = createServer((_request, response) => response.end('occupied'));
    try { await new Promise<void>((done, reject) => occupied.once('error', reject).listen(65535, '127.0.0.1', done)); } catch { /* A separate process already occupies it, which is also a valid test setup. */ }
    const { listenWithFallback } = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'serve-workbench.mjs')).href}?highport=${Date.now()}`);
    const running = await listenWithFallback(project, 65535, 3);
    expect(running.port).toBeGreaterThan(0);
    expect(running.port).toBeLessThan(65535);
    await new Promise<void>((done, reject) => running.server.close((error?: Error) => error ? reject(error) : done()));
    if (occupied.listening) await new Promise<void>((done, reject) => occupied.close((error?: Error) => error ? reject(error) : done()));
  }, 20_000);

  it('rejects junction escapes from the project inspiration folder', () => {
    const project = resolve(scratch, 'junction-project');
    const outside = resolve(scratch, 'junction-outside');
    mkdirSync(project, { recursive: true });
    mkdirSync(outside, { recursive: true });
    symlinkSync(outside, resolve(project, '.inspiration'), process.platform === 'win32' ? 'junction' : 'dir');
    const result = runNode(resolve(skillRoot, 'scripts', 'project-state.mjs'), ['init', project], { DESIGN_TASTE_LIBRARY_ROOT: root });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('escapes protected root');
  });

  it('rejects copied state files whose saved project root does not match', () => {
    const first = resolve(scratch, 'state-original');
    const second = resolve(scratch, 'state-copy');
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    expect(runNode(script, ['init', first], env).status).toBe(0);
    cpSync(resolve(first, '.inspiration'), resolve(second, '.inspiration'), { recursive: true });
    const result = runNode(script, ['validate', second], env);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('saved projectRoot does not match');
  });

  it('rejects malformed current state instead of silently repairing it', () => {
    const project = resolve(scratch, 'invalid-schema-three');
    const script = resolve(skillRoot, 'scripts', 'project-state.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    expect(runNode(script, ['init', project], env).status).toBe(0);
    const statePath = resolve(project, '.inspiration', 'state.json');
    const state = JSON.parse(readFileSync(statePath, 'utf8'));
    state.status = 'invented';
    delete state.intake;
    state.informationArchitecture.status = 'invented';
    state.references.usage = { 'site-spade': -1 };
    state.decisions = [{}];
    writeFileSync(statePath, JSON.stringify(state));
    const rejected = runNode(script, ['validate', project], env);
    expect(rejected.status).not.toBe(0);
    expect(rejected.stderr).toContain('invalid workflow status');
    expect(rejected.stderr).toContain('intake must be an object');
    expect(rejected.stderr).toContain('informationArchitecture.status is invalid');
    expect(rejected.stderr).toContain('references.usage');
    expect(rejected.stderr).toContain('invalid decision record');
  });

  it('refuses to initialize project output inside the library', () => {
    const result = runNode(
      resolve(skillRoot, 'scripts', 'project-state.mjs'),
      ['init', resolve(root, 'accidental-project')],
      { DESIGN_TASTE_LIBRARY_ROOT: root },
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('project folder must be independent');
  });

  it('installs and safely reinstalls only its managed global skill', () => {
    const codexHome = resolve(scratch, 'codex-home');
    const setup = resolve(root, 'scripts', 'setup-codex.mjs');
    const first = runNode(setup, ['--codex-home', codexHome]);
    expect(first.status, first.stderr).toBe(0);
    const destination = resolve(codexHome, 'skills', 'design-taste-injection');
    const config = JSON.parse(readFileSync(resolve(destination, 'config', 'library.json'), 'utf8'));
    expect(config.libraryRoot).toBe(root);
    expect(config.catalogFingerprint).toMatch(/^[a-f0-9]{16}$/);
    expect(config.skillFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(config.vendorFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(readFileSync(resolve(destination, 'SKILL.md'), 'utf8')).toContain('name: design-taste-injection');
    expect(runNode(setup, ['--codex-home', codexHome]).status).toBe(0);
    const check = runNode(resolve(root, 'scripts', 'check-codex.mjs'), ['--codex-home', codexHome]);
    expect(check.status, check.stderr).toBe(0);
    expect(check.stdout).toContain('installed, current, and connected');

    const changedScript = resolve(destination, 'scripts', 'reference-selection.mjs');
    writeFileSync(changedScript, `${readFileSync(changedScript, 'utf8')}\n// changed after installation\n`);
    const stale = runNode(resolve(root, 'scripts', 'check-codex.mjs'), ['--codex-home', codexHome]);
    expect(stale.status).not.toBe(0);
    expect(stale.stderr).toContain('needs repair');
    expect(runNode(setup, ['--codex-home', codexHome]).status).toBe(0);
    expect(runNode(resolve(root, 'scripts', 'check-codex.mjs'), ['--codex-home', codexHome]).status).toBe(0);
  }, 20_000);

  it('verifies the complete vendor tree and rolls back an interrupted replacement', async () => {
    const integrity = resolve(root, 'scripts', 'skill-integrity.mjs');
    const vendorCopy = resolve(scratch, 'vendor-copy');
    cpSync(resolve(skillRoot, 'vendor', 'site-clone'), vendorCopy, { recursive: true });
    expect(runNode(integrity, ['verify-vendor', vendorCopy]).status).toBe(0);
    const upstream = resolve(vendorCopy, 'UPSTREAM.md');
    writeFileSync(upstream, readFileSync(upstream, 'utf8').replaceAll('\r\n', '\n').replaceAll('\n', '\r\n'));
    expect(runNode(integrity, ['verify-vendor', vendorCopy]).status).toBe(0);
    const changed = resolve(vendorCopy, 'skills', 'clone-site', 'scripts', 'surface-map.js');
    writeFileSync(changed, `${readFileSync(changed, 'utf8')}\n// tampered\n`);
    const rejected = runNode(integrity, ['verify-vendor', vendorCopy]);
    expect(rejected.status).not.toBe(0);
    expect(rejected.stderr).toContain('Vendor integrity failed');

    const destination = resolve(scratch, 'rollback-destination');
    const staging = resolve(scratch, 'rollback-staging');
    mkdirSync(destination, { recursive: true });
    mkdirSync(staging, { recursive: true });
    writeFileSync(resolve(destination, 'identity.txt'), 'working installation');
    writeFileSync(resolve(staging, 'identity.txt'), 'replacement');
    const { replaceInstallation } = await import(`${pathToFileURL(resolve(root, 'scripts', 'setup-codex.mjs')).href}?rollback=${Date.now()}`);
    await expect(replaceInstallation(destination, staging, { afterBackup: () => { throw new Error('simulated interruption'); } })).rejects.toThrow('simulated interruption');
    expect(readFileSync(resolve(destination, 'identity.txt'), 'utf8')).toBe('working installation');
  });

  it('detects a stale installed library path and rejects non-cloneable cards', () => {
    const codexHome = resolve(scratch, 'health-check-home');
    const setup = resolve(root, 'scripts', 'setup-codex.mjs');
    expect(runNode(setup, ['--codex-home', codexHome]).status).toBe(0);
    const destination = resolve(codexHome, 'skills', 'design-taste-injection');
    const project = resolve(scratch, 'clone-preflight-project');
    mkdirSync(project, { recursive: true });
    const preflight = runNode(
      resolve(destination, 'scripts', 'clone-runtime.mjs'),
      ['preflight', project, 'image-astra-ai', 'D01-A-R'],
    );
    expect(preflight.status).not.toBe(0);
    expect(preflight.stderr).toContain('reference-only');

    const configPath = resolve(destination, 'config', 'library.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    config.libraryRoot = resolve(scratch, 'moved-library');
    writeFileSync(configPath, JSON.stringify(config));
    const stale = runNode(resolve(root, 'scripts', 'check-codex.mjs'), ['--codex-home', codexHome]);
    expect(stale.status).not.toBe(0);
    expect(stale.stderr).toContain('needs repair');
  }, 15_000);

  it('runs deterministic three-width clone pixel QA from the installed skill', () => {
    const codexHome = resolve(scratch, 'clone-qa-home');
    expect(runNode(resolve(root, 'scripts', 'setup-codex.mjs'), ['--codex-home', codexHome]).status).toBe(0);
    const runtime = resolve(codexHome, 'skills', 'design-taste-injection', 'scripts', 'clone-runtime.mjs');
    const project = resolve(scratch, 'clone-qa-project');
    const evidence = resolve(project, '.inspiration', 'clone', 'QA1');
    mkdirSync(evidence, { recursive: true });
    writeFileSync(resolve(evidence, 'preflight.json'), JSON.stringify({
      schemaVersion: 2, generationId: 'QA1', cardId: 'site-spade', projectRoot: project,
      evidenceRoot: evidence, requiredWidths: [1440, 768, 390],
    }));
    const pairs = [1440, 768, 390].map((width) => {
      const original = resolve(evidence, `original-${width}.png`);
      const clone = resolve(evidence, `clone-${width}.png`);
      const png = new PNG({ width, height: 2 });
      png.data.fill(255);
      const bytes = PNG.sync.write(png);
      writeFileSync(original, bytes);
      writeFileSync(clone, bytes);
      return { width, original, clone, maxDiffRatio: 0 };
    });
    const manifest = resolve(evidence, 'qa-manifest.json');
    writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, generationId: 'QA1', pairs }));
    const result = runNode(runtime, ['verify', project, 'QA1', manifest]);
    expect(result.status, result.stderr).toBe(0);
    const report = JSON.parse(readFileSync(resolve(evidence, 'qa', 'report.json'), 'utf8'));
    expect(report.passed).toBe(true);
    expect(report.results.map((entry: { width: number }) => entry.width)).toEqual([1440, 768, 390]);
    expect(report.results.every((entry: { comparedPixels: number; maskedPixels: number }) => entry.comparedPixels > 0 && entry.maskedPixels === 0)).toBe(true);
  });

  it('rejects clone QA loopholes and marks permissive thresholds inconclusive', () => {
    const codexHome = resolve(scratch, 'clone-qa-hardening-home');
    expect(runNode(resolve(root, 'scripts', 'setup-codex.mjs'), ['--codex-home', codexHome]).status).toBe(0);
    const runtime = resolve(codexHome, 'skills', 'design-taste-injection', 'scripts', 'clone-runtime.mjs');
    const project = resolve(scratch, 'clone-qa-hardening-project');
    const evidence = resolve(project, '.inspiration', 'clone', 'QA2');
    mkdirSync(evidence, { recursive: true });
    const makePairs = (threshold = 0.02, maskRects?: unknown[]) => [1440, 768, 390].map((width) => {
      const original = resolve(evidence, `source-${width}.png`);
      const clone = resolve(evidence, `result-${width}.png`);
      const png = new PNG({ width, height: 4 });
      png.data.fill(255);
      writeFileSync(original, PNG.sync.write(png));
      writeFileSync(clone, PNG.sync.write(png));
      return { width, original, clone, maxDiffRatio: threshold, maskRects };
    });
    const manifest = resolve(evidence, 'qa-manifest.json');
    writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, generationId: 'QA2', pairs: makePairs() }));
    const noPreflight = runNode(runtime, ['verify', project, 'QA2', manifest]);
    expect(noPreflight.status).not.toBe(0);
    expect(noPreflight.stderr).toContain('preflight');

    writeFileSync(resolve(evidence, 'preflight.json'), JSON.stringify({
      schemaVersion: 2, generationId: 'QA2', cardId: 'site-spade', projectRoot: project,
      evidenceRoot: evidence, requiredWidths: [1440, 768, 390],
    }));
    const oversizedMasks = makePairs(0.02).map((pair) => ({
      ...pair, maskRects: [{ x: 0, y: 0, width: pair.width, height: 2, reason: 'dynamic content' }],
    }));
    writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, generationId: 'QA2', pairs: oversizedMasks }));
    const masked = runNode(runtime, ['verify', project, 'QA2', manifest]);
    expect(masked.status).not.toBe(0);
    expect(masked.stderr).toContain('maximum is 25%');

    const duplicateWidths = makePairs();
    duplicateWidths[2].width = 768;
    writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, generationId: 'QA2', pairs: duplicateWidths }));
    const duplicated = runNode(runtime, ['verify', project, 'QA2', manifest]);
    expect(duplicated.status).not.toBe(0);
    expect(duplicated.stderr).toContain('exactly one record');

    writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, generationId: 'QA2', pairs: makePairs(0.08) }));
    const inconclusive = runNode(runtime, ['verify', project, 'QA2', manifest]);
    expect(inconclusive.status).toBe(3);
    const report = JSON.parse(readFileSync(resolve(evidence, 'qa', 'report.json'), 'utf8'));
    expect(report.status).toBe('inconclusive');
    expect(report.results.every((entry: { status: string }) => entry.status === 'inconclusive')).toBe(true);
  }, 20_000);

  it('enforces schema-5 stage prerequisites and rejects invented completed work', async () => {
    const project = resolve(scratch, 'semantic-state-project');
    const catalogResult = runNode(resolve(skillRoot, 'scripts', 'library.mjs'), ['catalog'], { DESIGN_TASTE_LIBRARY_ROOT: root });
    const catalog = JSON.parse(catalogResult.stdout);
    const { emptyState, validateState } = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'project-state.mjs')).href}?state=${Date.now()}`);
    const state = emptyState(project);
    state.intake = { introduction: 'Product site', intent: 'Explain value', audience: 'Buyers', materialsAndRequirements: '' };
    state.informationArchitecture = { status: 'approved', pages: ['Home'], sections: ['Hero'], primaryJourney: 'Learn then act' };
    const generation = (id: string, stage: string, status = 'selected', parent: string | null = null) => ({
      id, parent, stage, status, label: id, category: 'Print-Tech Paper', thesis: 'Validated project artifact.', references: [],
      preview: `../previews/${id}/index.html`, createdAt: new Date().toISOString(),
      ...(stage === 'direction' ? { previewScope: focusedDirectionScope() } : {}),
    });
    state.generations = [
      generation('D1', 'direction'), generation('V1', 'variant', 'selected', 'D1'), generation('B1', 'build-path', 'selected', 'V1'),
      generation('H1', 'hero', 'selected', 'B1'), generation('I1', 'implementation', 'selected', 'H1'), generation('F1', 'final', 'selected', 'I1'),
    ];
    const { applyAction, createSession } = await import(`${pathToFileURL(resolve(skillRoot, 'scripts', 'reference-selection.mjs')).href}?semantic=${Date.now()}`);
    const session = applyAction(catalog, createSession(catalog, { category: 'Print-Tech Paper', pageUse: 'marketing', fitMode: 'implementation', groupPolicy: 'diverse', keywords: ['editorial'], roles: [], pinned: [{ id: 'site-spade', role: 'anchor' }], excluded: [], usage: {}, fitById: {} }), { type: 'ACCEPT ALL' });
    state.references = {
      catalogFingerprint: catalog.fingerprint, selectionStatus: 'current', activeSession: session,
      acceptedSets: session.acceptedSets, historicalCards: {}, pinned: session.pinned, excluded: session.excluded, usage: session.usage,
    };
    state.verification = { status: 'passed', checks: ['responsive QA'], completedAt: new Date().toISOString() };
    for (const status of ['intake', 'architecture', 'directions', 'references', 'variants', 'build-path', 'hero', 'implementation', 'polish', 'complete']) {
      state.status = status;
      expect(validateState(state, project, catalog), status).toEqual([]);
    }
    state.generations = state.generations.filter((item: { stage: string }) => item.stage !== 'final');
    state.status = 'complete';
    expect(validateState(state, project, catalog).join(' ')).toContain('selected final generation');
    state.generations = [generation('FAKE', 'final')];
    state.references.acceptedSets = [{ anchor: { id: 'invented-card', role: 'invented' }, supporting: [] }];
    expect(validateState(state, project, catalog).join(' ')).toMatch(/invented-card|selected direction/);
  }, 20_000);

  it('persists reference actions, project-wide usage, and grouping policy', async () => {
    const project = resolve(scratch, 'saved-reference-project');
    const stateScript = resolve(skillRoot, 'scripts', 'project-state.mjs');
    const selectionScript = resolve(skillRoot, 'scripts', 'reference-selection.mjs');
    const env = { DESIGN_TASTE_LIBRARY_ROOT: root };
    expect(runNode(stateScript, ['init', project], env).status).toBe(0);
    const requestPath = resolve(scratch, 'saved-request.json');
    writeFileSync(requestPath, JSON.stringify({ category: 'Print-Tech Paper', pageUse: 'marketing', fitMode: 'exploratory', groupPolicy: 'diverse', keywords: ['editorial', 'product'], roles: ['composition', 'typography'], pinned: [], excluded: [], usage: {}, fitById: {} }));
    const proposed = runNode(selectionScript, ['propose-and-save', project, requestPath], env);
    expect(proposed.status, proposed.stderr).toBe(0);
    const first = JSON.parse(proposed.stdout);
    const actionPath = resolve(scratch, 'saved-action.json');
    writeFileSync(actionPath, JSON.stringify({ type: 'SHOW ANOTHER SET' }));
    const changed = runNode(selectionScript, ['action-and-save', project, actionPath], env);
    expect(changed.status, changed.stderr).toBe(0);
    const changedSession = JSON.parse(changed.stdout);
    const excludedId = changedSession.currentSet.supporting[0].id;
    writeFileSync(actionPath, JSON.stringify({ type: 'DO NOT USE THIS CARD', cardId: excludedId }));
    expect(runNode(selectionScript, ['action-and-save', project, actionPath], env).status).toBe(0);
    const state = JSON.parse(runNode(stateScript, ['get', project], env).stdout);
    expect(state.references.activeSession.currentSet.signature).not.toBe(first.currentSet.signature);
    expect(state.references.excluded).toContain(excludedId);
    expect(Object.values(state.references.usage).some((count) => Number(count) > 0)).toBe(true);
    const usedCard = Object.keys(state.references.usage).find((id) => state.references.usage[id] > 0);
    writeFileSync(requestPath, JSON.stringify({ category: 'Data-as-Texture', pageUse: 'documentation', fitMode: 'exploratory', groupPolicy: 'diverse', keywords: ['documentation'], roles: ['content-system'], pinned: [], excluded: [], usage: {}, fitById: {} }));
    const nextCategory = runNode(selectionScript, ['propose-and-save', project, requestPath], env);
    expect(nextCategory.status, nextCategory.stderr).toBe(0);
    expect(JSON.parse(nextCategory.stdout).request.usage[usedCard]).toBeGreaterThan(0);
    expect(JSON.parse(nextCategory.stdout).excluded).toContain(excludedId);

    const catalog = JSON.parse(runNode(resolve(skillRoot, 'scripts', 'library.mjs'), ['catalog'], env).stdout);
    const { createSession } = await import(`${pathToFileURL(selectionScript).href}?grouping=${Date.now()}`);
    const diverse = createSession(catalog, { category: 'Data-as-Texture', pageUse: 'documentation', fitMode: 'implementation', groupPolicy: 'diverse', keywords: ['documentation'], roles: ['content-system', 'typography'], pinned: [], excluded: [], usage: {}, fitById: {} });
    const diverseIds = [diverse.currentSet.anchor.id, ...diverse.currentSet.supporting.map((item: { id: string }) => item.id)];
    expect(diverseIds.filter((id: string) => catalog.cards.find((card: { id: string }) => card.id === id)?.designSystem?.id === 'x-business-docs').length).toBeLessThanOrEqual(1);
    const deep = createSession(catalog, { category: 'Data-as-Texture', pageUse: 'documentation', fitMode: 'implementation', groupPolicy: 'system-depth', keywords: ['documentation'], roles: ['content-system', 'typography', 'product-proof'], pinned: [{ id: 'site-x-advertising', role: 'anchor' }, { id: 'site-x-basics', role: 'typography' }, { id: 'site-x-ad-formats', role: 'product-proof' }], excluded: [], usage: {}, fitById: {} });
    expect([deep.currentSet.anchor.id, ...deep.currentSet.supporting.map((item: { id: string }) => item.id)]).toEqual(expect.arrayContaining(['site-x-advertising', 'site-x-basics', 'site-x-ad-formats']));
  }, 30_000);

  it('migrates the repository\'s legacy managed installation in place', () => {
    const codexHome = resolve(scratch, 'legacy-codex-home');
    const destination = resolve(codexHome, 'skills', 'design-taste-injection');
    mkdirSync(destination, { recursive: true });
    writeFileSync(resolve(destination, 'SKILL.md'), 'legacy managed copy');
    writeFileSync(
      resolve(destination, '.design-taste-injection-install.json'),
      JSON.stringify({ managedBy: 'website-library/design-taste-injection' }),
    );

    const result = runNode(resolve(root, 'scripts', 'setup-codex.mjs'), ['--codex-home', codexHome]);
    expect(result.status, result.stderr).toBe(0);
    const marker = JSON.parse(
      readFileSync(resolve(destination, '.design-taste-injection-install.json'), 'utf8'),
    );
    expect(marker.managedBy).toBe('website-inspiration-library/design-taste-injection');
    expect(readFileSync(resolve(destination, 'SKILL.md'), 'utf8')).toContain('name: design-taste-injection');
  });

  it('refuses to replace an unmanaged same-name skill', () => {
    const codexHome = resolve(scratch, 'unmanaged-home');
    const destination = resolve(codexHome, 'skills', 'design-taste-injection');
    mkdirSync(destination, { recursive: true });
    writeFileSync(resolve(destination, 'SKILL.md'), 'unmanaged');
    const result = runNode(resolve(root, 'scripts', 'setup-codex.mjs'), ['--codex-home', codexHome]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Refusing to replace an unmanaged skill');
  });

  it('documents exact beginner commands and separates chat from PowerShell', () => {
    const guide = readFileSync(resolve(root, 'FIRST-TIME-USER-GUIDE.md'), 'utf8');
    expect(guide).toContain('npm run setup:codex');
    expect(guide).toContain('npm run check:codex');
    expect(guide).toContain('npx impeccable install --providers=codex --scope=global');
    expect(guide).toContain('npx skills add higgsfield-ai/skills --global --agent codex --yes');
    expect(guide).toContain('$design-taste-injection');
    expect(guide).toContain('Codex chat');
    expect(guide).toContain('PowerShell');
    expect(guide).toContain('## Happy path in Codex chat');
    expect(guide).toContain('APPROVE AND CONTINUE — choose D03.');
    const installedSection = guide.split('### If the library is already at')[1].split('The setup command')[0];
    expect(installedSection.match(/npm run doctor/g)).toHaveLength(1);
  });

  it('pins the complete approved MIT clone-remix pipeline with attribution', () => {
    const vendor = resolve(skillRoot, 'vendor', 'site-clone');
    const upstream = readFileSync(resolve(vendor, 'UPSTREAM.md'), 'utf8');
    expect(upstream).toContain('f01d396b64afa07870c6fc6757a35b92993791e2');
    expect(readFileSync(resolve(vendor, 'LICENSE'), 'utf8')).toContain('MIT License');
    for (const file of [
      'skills/clone-site/scripts/surface-map.js',
      'skills/clone-site/scripts/motion-probe.js',
      'skills/clone-site/scripts/tokens-probe.js',
      'skills/remix-site/scripts/tokenize-css.js',
      'skills/remix-site/scripts/tweak-panel.js',
    ]) {
      expect(readFileSync(resolve(vendor, file), 'utf8').length).toBeGreaterThan(1000);
    }
  });
});
