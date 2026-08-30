#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compareSkillTrees, skillFingerprint, verifyVendorInventory } from './skill-integrity.mjs';
import { assertIndependentPath, canonicalPath } from '../skills/design-taste-injection/scripts/path-safety.mjs';

const MANAGER = 'website-inspiration-library/design-taste-injection';
const root = resolve(import.meta.dirname, '..');
const sourceSkill = resolve(root, 'skills', 'design-taste-injection');
const positional = () => process.argv.slice(2).filter((value, index, values) => !value.startsWith('--') && (index === 0 || !values[index - 1].startsWith('--')));
const valueAfter = (flag) => { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : null; };
const hasFlag = (flag) => process.argv.includes(flag);
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const npxInvocation = (args, platform = process.platform, commandProcessor = process.env.ComSpec) => platform === 'win32'
  ? { executable: commandProcessor ?? 'cmd.exe', args: ['/d', '/s', '/c', 'npx.cmd', ...args] }
  : { executable: 'npx', args };
const findPersonalSkill = (name) => [
  resolve(homedir(), '.agents', 'skills', name),
  resolve(process.env.CODEX_HOME ?? resolve(homedir(), '.codex'), 'skills', name),
].find((candidate) => existsSync(resolve(candidate, 'SKILL.md')));
const validateCatalog = (catalog) => {
  if (!catalog || catalog.schemaVersion !== 5 || !Array.isArray(catalog.cards) || !catalog.cards.length || !Array.isArray(catalog.categories) || !catalog.categories.length) throw new Error('The validated catalog must use schema 5 and contain cards and categories.');
  if (catalog.cards.some((card) => typeof card.displayName !== 'string' || !card.displayName.trim())) throw new Error('Catalog cards require a canonical displayName.');
  if (catalog.cards.some((card) => !card.sourceIdentity || !card.media?.detailImage)) throw new Error('Catalog cards require source identity and a canonical still.');
};
const exportCatalog = () => {
  const result = spawnSync(process.execPath, [resolve(root, 'scripts', 'export-workflow-catalog.mjs')], { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'The library catalog did not validate.');
  const catalog = JSON.parse(result.stdout); validateCatalog(catalog); return catalog;
};
const assertTarget = (rawTarget) => {
  if (!rawTarget) throw new Error('Provide the website project root: npm run setup:project -- <website-project-root>');
  const target = assertIndependentPath(rawTarget, [root, sourceSkill, resolve(homedir(), '.agents', 'skills'), resolve(process.env.CODEX_HOME ?? resolve(homedir(), '.codex'), 'skills')]);
  if (!existsSync(target)) throw new Error(`Website project does not exist: ${target}`);
  return target;
};
const installImpeccableInto = async (stagingSkills, options = {}) => {
  const destination = resolve(stagingSkills, 'impeccable');
  const localSource = options.impeccableSource ? resolve(options.impeccableSource) : findPersonalSkill('impeccable');
  if (localSource) { await cp(localSource, destination, { recursive: true, force: false, errorOnExist: true }); return { source: localSource }; }
  if (options.skipExternal) throw new Error('Impeccable is unavailable and external installation is disabled.');
  const scratch = resolve(tmpdir(), `design-taste-impeccable-${process.pid}-${Date.now()}`);
  await mkdir(scratch, { recursive: true });
  try {
    const invocation = npxInvocation(['--yes', 'impeccable', 'install', '--providers=codex', '--scope=project']);
    const result = spawnSync(invocation.executable, invocation.args, { cwd: scratch, encoding: 'utf8', timeout: 180_000 });
    if (result.status !== 0) throw new Error(result.stderr?.trim() || result.error?.message || result.stdout?.trim() || 'Impeccable project installation failed.');
    const generated = resolve(scratch, '.agents', 'skills', 'impeccable');
    if (!existsSync(resolve(generated, 'SKILL.md'))) throw new Error('Impeccable installer did not create a project skill.');
    await cp(generated, destination, { recursive: true, force: false, errorOnExist: true });
    return { source: 'npx impeccable' };
  } finally { await rm(scratch, { recursive: true, force: true }); }
};
const replaceMany = async (replacements, hooks = {}) => {
  const completed = [];
  try {
    for (const item of replacements) {
      const backup = `${item.destination}.backup-${process.pid}-${Date.now()}`;
      const existed = existsSync(item.destination);
      if (existed) await rename(item.destination, backup);
      try { await rename(item.staging, item.destination); }
      catch (error) { if (existed && existsSync(backup)) await rename(backup, item.destination); throw error; }
      completed.push({ ...item, backup, existed });
    }
    await hooks.afterInstall?.();
    for (const item of completed) if (item.existed) await rm(item.backup, { recursive: true, force: true });
  } catch (error) {
    for (const item of [...completed].reverse()) {
      if (existsSync(item.destination)) await rm(item.destination, { recursive: true, force: true });
      if (item.existed && existsSync(item.backup)) await rename(item.backup, item.destination);
    }
    throw error;
  }
};

const setupProject = async (rawTarget, options = {}) => {
  const target = assertTarget(rawTarget);
  const catalog = exportCatalog();
  const vendor = await verifyVendorInventory(resolve(sourceSkill, 'vendor', 'site-clone'));
  const sourceFingerprint = await skillFingerprint(sourceSkill);
  const agentsRoot = resolve(target, '.agents');
  const skillsRoot = resolve(agentsRoot, 'skills');
  const stagingRoot = resolve(agentsRoot, `.design-taste-installing-${process.pid}-${Date.now()}`);
  const stagingSkills = resolve(stagingRoot, 'skills');
  await mkdir(stagingSkills, { recursive: true });
  try {
    const stagedDesignTaste = resolve(stagingSkills, 'design-taste-injection');
    await cp(sourceSkill, stagedDesignTaste, { recursive: true, force: false, errorOnExist: true });
    await mkdir(resolve(stagedDesignTaste, 'config'), { recursive: true });
    const installedAt = new Date().toISOString();
    const config = { schemaVersion: 4, scope: 'project', projectRoot: target, libraryRoot: root, catalogCommand: `${process.execPath} ${resolve(root, 'scripts', 'export-workflow-catalog.mjs')}`, catalogFingerprint: catalog.fingerprint, skillFingerprint: sourceFingerprint, vendorFingerprint: vendor.fingerprint, vendorCommit: vendor.upstreamCommit, installedAt };
    const marker = { managedBy: MANAGER, scope: 'project', projectRoot: target, sourceRoot: root, skillFingerprint: sourceFingerprint, installedAt };
    await writeFile(resolve(stagedDesignTaste, 'config', 'library.json'), `${JSON.stringify(config, null, 2)}\n`, 'utf8');
    await writeFile(resolve(stagedDesignTaste, '.design-taste-injection-install.json'), `${JSON.stringify(marker, null, 2)}\n`, 'utf8');
    const stagedComparison = await compareSkillTrees(sourceSkill, stagedDesignTaste);
    if (!stagedComparison.current || stagedComparison.sourceFingerprint !== sourceFingerprint) throw new Error('Staged Design Taste Injection bundle does not match the source.');
    const existingImpeccable = resolve(skillsRoot, 'impeccable');
    const preserveImpeccable = existsSync(resolve(existingImpeccable, 'SKILL.md'));
    const impeccable = preserveImpeccable
      ? { source: 'existing project skill', preserved: true }
      : await installImpeccableInto(stagingSkills, options);
    const names = ['design-taste-injection'];
    if (!preserveImpeccable) names.push('impeccable');
    if (options.withHiggsfield) {
      const existingHiggsfield = resolve(skillsRoot, 'higgsfield');
      if (!existsSync(resolve(existingHiggsfield, 'SKILL.md'))) {
        const higgsfield = findPersonalSkill('higgsfield');
        if (!higgsfield) throw new Error('Higgsfield was requested but no installed skill is available to copy.');
        await cp(higgsfield, resolve(stagingSkills, 'higgsfield'), { recursive: true, force: false, errorOnExist: true });
        names.push('higgsfield');
      }
    }
    await mkdir(skillsRoot, { recursive: true });
    const replacements = [];
    for (const name of names) {
      const destination = resolve(skillsRoot, name);
      if (existsSync(destination) && name === 'design-taste-injection') {
        const markerPath = resolve(destination, '.design-taste-injection-install.json');
        if (!existsSync(markerPath) || (await readJson(markerPath)).managedBy !== MANAGER) throw new Error(`Refusing to replace unmanaged project skill: ${destination}`);
      }
      replacements.push({ staging: resolve(stagingSkills, name), destination });
    }
    await replaceMany(replacements);
    return {
      target,
      skills: ['design-taste-injection', 'impeccable', ...(options.withHiggsfield ? ['higgsfield'] : [])].map((name) => resolve(skillsRoot, name)),
      catalogFingerprint: catalog.fingerprint,
      skillFingerprint: sourceFingerprint,
      vendorFingerprint: vendor.fingerprint,
      impeccableSource: impeccable.source,
    };
  } finally { await rm(stagingRoot, { recursive: true, force: true }); }
};
const main = async () => {
  const rawTarget = valueAfter('--target') ?? positional()[0];
  const result = await setupProject(rawTarget, { withHiggsfield: hasFlag('--with-higgsfield'), skipExternal: hasFlag('--no-external-install'), impeccableSource: valueAfter('--impeccable-source') });
  console.log(JSON.stringify(result, null, 2));
  console.log('Restart Codex in the website project, then invoke $design-taste-injection.');
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Project setup failed: ${error.message}`); process.exitCode = 1; });

export { assertTarget, npxInvocation, replaceMany, setupProject, validateCatalog };
