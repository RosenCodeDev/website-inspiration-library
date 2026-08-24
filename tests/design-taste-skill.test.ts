import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterAll, describe, expect, it } from 'vitest';

const root = process.cwd();
const skillRoot = resolve(root, 'skills', 'design-taste-injection');
const scratch = mkdtempSync(join(tmpdir(), 'design-taste-test-'));
const runNode = (script: string, args: string[] = [], env: NodeJS.ProcessEnv = {}) => spawnSync(
  process.execPath,
  [script, ...args],
  { cwd: root, encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 20 * 1024 * 1024 },
);

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
    expect(metadata).toContain('$design-taste-injection');
    expect(metadata).toContain('allow_implicit_invocation: true');
  });

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

    const generationPath = resolve(scratch, 'generation.json');
    writeFileSync(generationPath, JSON.stringify({
      id: 'D01', parent: null, stage: 'direction', status: 'candidate', label: 'Print Tech Paper', category: 'Print-Tech Paper', thesis: 'Editorial proof with tactile structure.', references: [], preview: '', createdAt: new Date().toISOString(),
    }));
    const appended = runNode(script, ['append-generation', project, generationPath], env);
    expect(appended.status, appended.stderr).toBe(0);

    const h0Path = resolve(scratch, 'hero-h0.json');
    const h1Path = resolve(scratch, 'hero-h1.json');
    writeFileSync(h0Path, JSON.stringify({
      id: 'D01-A-O-H0', parent: 'D01', stage: 'hero', status: 'selected', label: 'Code hero', category: 'Print-Tech Paper', thesis: 'A polished code-built print plate.', references: [], preview: '', createdAt: new Date().toISOString(),
    }));
    writeFileSync(h1Path, JSON.stringify({
      id: 'D01-A-O-H1', parent: 'D01-A-O-H0', stage: 'hero', status: 'candidate', label: 'Generated hero', category: 'Print-Tech Paper', thesis: 'A generated alternative that preserves H0.', references: [], preview: '', createdAt: new Date().toISOString(),
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
  });

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
    expect(proposal.anchor.role).toBe('anchor');
    expect(proposal.supporting.length).toBeLessThanOrEqual(2);

    const sessionPath = resolve(scratch, 'selection-session.json');
    writeFileSync(sessionPath, JSON.stringify({ pinned: [], excluded: [], history: [], currentSet: proposal }));

    const pinPath = resolve(scratch, 'pin-action.json');
    writeFileSync(pinPath, JSON.stringify({ type: 'PIN THIS CARD', cardId: proposal.anchor.id, role: 'anchor' }));
    const pinResult = runNode(script, ['action', sessionPath, pinPath, requestPath], env);
    expect(pinResult.status, pinResult.stderr).toBe(0);
    expect(JSON.parse(pinResult.stdout).next).toBe('ask-keep-or-refresh-unpinned');

    const excludePath = resolve(scratch, 'exclude-action.json');
    writeFileSync(excludePath, JSON.stringify({ type: 'DO NOT USE THIS CARD', cardId: proposal.anchor.id }));
    const excludeResult = runNode(script, ['action', sessionPath, excludePath, requestPath], env);
    expect(excludeResult.status, excludeResult.stderr).toBe(0);
    const excluded = JSON.parse(excludeResult.stdout);
    expect(excluded.next).toBe('review-automatic-replacement');
    expect([excluded.currentSet.anchor.id, ...excluded.currentSet.supporting.map((item: { id: string }) => item.id)]).not.toContain(proposal.anchor.id);

    const anotherPath = resolve(scratch, 'another-action.json');
    writeFileSync(anotherPath, JSON.stringify({ type: 'SHOW ANOTHER SET' }));
    const anotherResult = runNode(script, ['action', sessionPath, anotherPath, requestPath], env);
    expect(anotherResult.status, anotherResult.stderr).toBe(0);
    expect(JSON.parse(anotherResult.stdout).next).toBe('review-alternate-set');
  }, 20_000);

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
    expect(readFileSync(resolve(destination, 'SKILL.md'), 'utf8')).toContain('name: design-taste-injection');
    expect(runNode(setup, ['--codex-home', codexHome]).status).toBe(0);
  });

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
    expect(guide).toContain('npx impeccable skills install -y --providers=codex --scope=global');
    expect(guide).toContain('npx skills add higgsfield-ai/skills --global --agent codex --yes');
    expect(guide).toContain('$design-taste-injection');
    expect(guide).toContain('Codex chat');
    expect(guide).toContain('PowerShell');
  });

  it('pins the approved MIT remix mechanics with attribution', () => {
    const vendor = resolve(skillRoot, 'vendor', 'site-clone-remix');
    const upstream = readFileSync(resolve(vendor, 'UPSTREAM.md'), 'utf8');
    expect(upstream).toContain('f01d396b64afa07870c6fc6757a35b92993791e2');
    expect(readFileSync(resolve(vendor, 'LICENSE'), 'utf8')).toContain('MIT License');
    for (const file of ['tokenize-css.js', 'apply-overrides.js', 'tweak-panel.js']) {
      expect(readFileSync(resolve(vendor, file), 'utf8').length).toBeGreaterThan(1000);
    }
  });
});
