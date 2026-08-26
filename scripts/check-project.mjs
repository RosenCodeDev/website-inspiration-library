#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compareSkillTrees, skillFingerprint, verifyVendorInventory } from './skill-integrity.mjs';
import { assertTarget } from './setup-project.mjs';

const MANAGER = 'website-inspiration-library/design-taste-injection';
const root = resolve(import.meta.dirname, '..');
const sourceSkill = resolve(root, 'skills', 'design-taste-injection');
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const checkProject = async (rawTarget) => {
  const target = assertTarget(rawTarget);
  const destination = resolve(target, '.agents', 'skills', 'design-taste-injection');
  const impeccable = resolve(target, '.agents', 'skills', 'impeccable', 'SKILL.md');
  const markerPath = resolve(destination, '.design-taste-injection-install.json');
  const configPath = resolve(destination, 'config', 'library.json');
  const result = { target, destination, installed: false, managed: false, projectScoped: false, pathCurrent: false, catalogCurrent: false, skillCurrent: false, vendorCurrent: false, filesCurrent: false, impeccableInstalled: existsSync(impeccable) };
  if (!existsSync(markerPath) || !existsSync(configPath)) return result;
  const [marker, config] = await Promise.all([readJson(markerPath), readJson(configPath)]);
  result.installed = true;
  result.managed = marker.managedBy === MANAGER;
  result.projectScoped = marker.scope === 'project' && config.scope === 'project' && resolve(marker.projectRoot) === target && resolve(config.projectRoot) === target;
  result.pathCurrent = resolve(config.libraryRoot) === root && resolve(marker.sourceRoot) === root;
  const catalogRun = spawnSync(process.execPath, [resolve(root, 'scripts', 'export-workflow-catalog.mjs')], { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (catalogRun.status === 0) {
    const catalog = JSON.parse(catalogRun.stdout);
    result.catalogCurrent = config.catalogFingerprint === catalog.fingerprint;
  }
  const [sourceFingerprint, comparison, sourceVendor, installedVendor] = await Promise.all([
    skillFingerprint(sourceSkill), compareSkillTrees(sourceSkill, destination),
    verifyVendorInventory(resolve(sourceSkill, 'vendor', 'site-clone')),
    verifyVendorInventory(resolve(destination, 'vendor', 'site-clone')),
  ]);
  result.skillCurrent = sourceFingerprint === config.skillFingerprint && sourceFingerprint === marker.skillFingerprint && comparison.sourceFingerprint === sourceFingerprint;
  result.filesCurrent = comparison.current;
  result.vendorCurrent = sourceVendor.fingerprint === installedVendor.fingerprint && sourceVendor.fingerprint === config.vendorFingerprint && sourceVendor.upstreamCommit === config.vendorCommit;
  result.skillDifferences = { missing: comparison.missing, extra: comparison.extra, changed: comparison.changed };
  result.healthy = result.installed && result.managed && result.projectScoped && result.pathCurrent && result.catalogCurrent && result.skillCurrent && result.vendorCurrent && result.filesCurrent && result.impeccableInstalled;
  return result;
};
const main = async () => {
  const target = process.argv.slice(2).find((value) => !value.startsWith('--'));
  const result = await checkProject(target);
  console.log(JSON.stringify(result, null, 2));
  if (!result.healthy) { console.error('Project skills need repair. Run: npm run setup:project -- <website-project-root>'); process.exitCode = 1; }
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Project skill check failed: ${error.message}`); process.exitCode = 1; });

export { checkProject };
