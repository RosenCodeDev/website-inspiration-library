#!/usr/bin/env node
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { compareSkillTrees, skillFingerprint, verifyVendorInventory } from './skill-integrity.mjs';

const MANAGER = 'website-inspiration-library/design-taste-injection';
const LEGACY_MANAGERS = new Set(['website-library/design-taste-injection']);
const root = resolve(import.meta.dirname, '..');
const requireFromRoot = createRequire(resolve(root, 'package.json'));
const valueAfter = (flag) => { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : null; };
const versionAtLeast = (current, required) => {
  const actual = current.replace(/^v/, '').split('.').map(Number);
  const floor = required.split('.').map(Number);
  for (let index = 0; index < floor.length; index += 1) {
    if ((actual[index] ?? 0) > floor[index]) return true;
    if ((actual[index] ?? 0) < floor[index]) return false;
  }
  return true;
};

const validateCatalog = (catalog) => {
  if (!catalog || catalog.schemaVersion !== 2 || !Array.isArray(catalog.cards) || !catalog.cards.length || !Array.isArray(catalog.categories) || !catalog.categories.length) throw new Error('The validated catalog must contain cards and categories.');
  const ids = catalog.cards.map((card) => card.id);
  if (new Set(ids).size !== ids.length || ids.some((id) => typeof id !== 'string' || !id)) throw new Error('The validated catalog contains invalid or duplicate card IDs.');
  const orders = catalog.cards.map((card) => card.order);
  if (orders.some((order, index) => order !== index + 1)) throw new Error('The validated catalog order must be sequential.');
  if (new Set(catalog.categories).size !== catalog.categories.length || catalog.categories.some((category) => !catalog.categoryProfiles?.[category])) throw new Error('The validated catalog categories are incomplete or duplicated.');
};
const validateSource = async () => {
  const required = ['package.json', 'src/references.ts', 'src/workflow-intelligence.ts', 'scripts/export-workflow-catalog.mjs', 'scripts/skill-integrity.mjs', 'skills/design-taste-injection/SKILL.md', 'skills/design-taste-injection/agents/openai.yaml', 'skills/design-taste-injection/scripts/clone-runtime.mjs', 'skills/design-taste-injection/scripts/build-probe-bundle.mjs', 'skills/design-taste-injection/vendor/site-clone/CHECKSUMS.json'];
  const missing = required.filter((path) => !existsSync(resolve(root, path)));
  if (missing.length) throw new Error(`Library is incomplete: ${missing.join(', ')}`);
  for (const dependency of ['playwright-core', 'pixelmatch', 'pngjs']) {
    try { requireFromRoot.resolve(dependency); } catch { throw new Error(`Missing clone runtime dependency: ${dependency}. Run npm install, then rerun setup.`); }
  }
  return verifyVendorInventory(resolve(root, 'skills', 'design-taste-injection', 'vendor', 'site-clone'));
};
const readMarker = async (destination) => {
  const markerPath = resolve(destination, '.design-taste-injection-install.json');
  if (!existsSync(markerPath)) return null;
  return JSON.parse(await readFile(markerPath, 'utf8'));
};

const replaceInstallation = async (destination, staging, hooks = {}) => {
  const backup = `${destination}.backup-${process.pid}-${Date.now()}`;
  let backedUp = false;
  let replacementInstalled = false;
  try {
    if (existsSync(destination)) { await rename(destination, backup); backedUp = true; }
    await hooks.afterBackup?.();
    await rename(staging, destination);
    replacementInstalled = true;
    if (backedUp) await rm(backup, { recursive: true, force: true });
  } catch (error) {
    if (replacementInstalled && existsSync(destination)) await rm(destination, { recursive: true, force: true });
    if (backedUp && existsSync(backup)) await rename(backup, destination);
    throw error;
  } finally {
    if (existsSync(staging)) await rm(staging, { recursive: true, force: true });
  }
};

const main = async () => {
  if (!versionAtLeast(process.version, '22.12.0')) throw new Error(`Node.js 22.12 or newer is required. Current version: ${process.version}`);
  const vendor = await validateSource();
  const catalogCheck = spawnSync(process.execPath, [resolve(root, 'scripts', 'export-workflow-catalog.mjs')], { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (catalogCheck.status !== 0) throw new Error(catalogCheck.stderr.trim() || 'The library catalog did not validate.');
  const catalog = JSON.parse(catalogCheck.stdout);
  validateCatalog(catalog);

  const codexHome = resolve(valueAfter('--codex-home') ?? process.env.CODEX_HOME ?? resolve(homedir(), '.codex'));
  const destination = resolve(codexHome, 'skills', 'design-taste-injection');
  const existingMarker = existsSync(destination) ? await readMarker(destination) : null;
  const isManagedInstallation = existingMarker?.managedBy === MANAGER || LEGACY_MANAGERS.has(existingMarker?.managedBy);
  if (existsSync(destination) && !isManagedInstallation) throw new Error(`Refusing to replace an unmanaged skill at ${destination}. Move it manually, then rerun setup.`);

  const source = resolve(root, 'skills', 'design-taste-injection');
  const sourceFingerprint = await skillFingerprint(source);
  const staging = `${destination}.installing-${process.pid}-${Date.now()}`;
  await mkdir(dirname(destination), { recursive: true });
  await rm(staging, { recursive: true, force: true });
  await cp(source, staging, { recursive: true, force: false, errorOnExist: true });
  await mkdir(resolve(staging, 'config'), { recursive: true });

  const installedAt = new Date().toISOString();
  const config = { schemaVersion: 3, libraryRoot: root, catalogCommand: `${process.execPath} ${resolve(root, 'scripts', 'export-workflow-catalog.mjs')}`, catalogFingerprint: catalog.fingerprint, skillFingerprint: sourceFingerprint, vendorFingerprint: vendor.fingerprint, vendorCommit: vendor.upstreamCommit, libraryVersion: catalog.fingerprint, installedAt };
  const marker = { managedBy: MANAGER, sourceRoot: root, skillFingerprint: sourceFingerprint, installedAt };
  await writeFile(resolve(staging, 'config', 'library.json'), `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  await writeFile(resolve(staging, '.design-taste-injection-install.json'), `${JSON.stringify(marker, null, 2)}\n`, 'utf8');
  const installedSkill = await readFile(resolve(staging, 'SKILL.md'), 'utf8');
  if (!installedSkill.includes('name: design-taste-injection') || installedSkill.includes('[TODO')) throw new Error('Staged skill failed validation.');
  const stagedComparison = await compareSkillTrees(source, staging);
  if (!stagedComparison.current || stagedComparison.sourceFingerprint !== sourceFingerprint) throw new Error('Staged skill bundle does not match the source.');
  await replaceInstallation(destination, staging);

  console.log('Design Taste Injection installed successfully.');
  console.log(`Skill: ${destination}`);
  console.log(`Library: ${root}`);
  console.log(`Skill fingerprint: ${sourceFingerprint}`);
  console.log(`Vendor: ${vendor.upstreamCommit} (${vendor.fileCount} files)`);
  console.log('Restart Codex Desktop, open a website project folder, and paste: $design-taste-injection');
};
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) main().catch((error) => { console.error(`Setup failed: ${error.message}`); process.exitCode = 1; });

export { replaceInstallation, validateCatalog };
