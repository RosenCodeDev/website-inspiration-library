#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { compareSkillTrees, skillFingerprint, verifyVendorInventory } from './skill-integrity.mjs';

const MANAGER = 'website-inspiration-library/design-taste-injection';
const root = resolve(import.meta.dirname, '..');
const sourceSkill = resolve(root, 'skills', 'design-taste-injection');
const valueAfter = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
};
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const checkInstallation = async (codexHome) => {
  const destination = resolve(codexHome, 'skills', 'design-taste-injection');
  const markerPath = resolve(destination, '.design-taste-injection-install.json');
  const configPath = resolve(destination, 'config', 'library.json');
  const result = {
    installed: false, managed: false, pathCurrent: false, catalogCurrent: false,
    skillCurrent: false, vendorCurrent: false, filesCurrent: false, destination, library: root,
  };
  if (!existsSync(destination) || !existsSync(markerPath) || !existsSync(configPath)) return result;

  const [marker, config] = await Promise.all([readJson(markerPath), readJson(configPath)]);
  result.installed = true;
  result.managed = marker.managedBy === MANAGER;
  result.pathCurrent = resolve(config.libraryRoot ?? '') === root && resolve(marker.sourceRoot ?? '') === root;

  const catalogCheck = spawnSync(process.execPath, [resolve(root, 'scripts', 'export-workflow-catalog.mjs')], {
    cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024,
  });
  if (catalogCheck.status === 0) {
    const catalog = JSON.parse(catalogCheck.stdout);
    result.catalogCurrent = config.catalogFingerprint === catalog.fingerprint;
    result.catalogFingerprint = catalog.fingerprint;
    result.installedCatalogFingerprint = config.catalogFingerprint;
  }

  const [sourceFingerprint, comparison, sourceVendor, installedVendor] = await Promise.all([
    skillFingerprint(sourceSkill),
    compareSkillTrees(sourceSkill, destination),
    verifyVendorInventory(resolve(sourceSkill, 'vendor', 'site-clone')),
    verifyVendorInventory(resolve(destination, 'vendor', 'site-clone')),
  ]);
  result.skillCurrent = sourceFingerprint === config.skillFingerprint
    && sourceFingerprint === marker.skillFingerprint
    && comparison.sourceFingerprint === sourceFingerprint;
  result.filesCurrent = comparison.current;
  result.vendorCurrent = sourceVendor.fingerprint === installedVendor.fingerprint
    && sourceVendor.fingerprint === config.vendorFingerprint
    && sourceVendor.upstreamCommit === config.vendorCommit;
  result.sourceSkillFingerprint = sourceFingerprint;
  result.installedSkillFingerprint = comparison.installedFingerprint;
  result.skillDifferences = { missing: comparison.missing, extra: comparison.extra, changed: comparison.changed };
  return result;
};

const main = async () => {
  const codexHome = resolve(valueAfter('--codex-home') ?? process.env.CODEX_HOME ?? resolve(homedir(), '.codex'));
  let result;
  try {
    result = await checkInstallation(codexHome);
  } catch (error) {
    console.error(`Installed bundle validation failed: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify(result, null, 2));
  const healthy = result.installed && result.managed && result.pathCurrent && result.catalogCurrent
    && result.skillCurrent && result.vendorCurrent && result.filesCurrent;
  if (!healthy) {
    console.error('Design Taste Injection needs repair. Run: npm run setup:codex');
    process.exitCode = 1;
    return;
  }
  console.log('Design Taste Injection is installed, current, and connected to this library.');
};

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(`Skill check failed: ${error.message}`);
    process.exitCode = 1;
  });
}

export { checkInstallation };
