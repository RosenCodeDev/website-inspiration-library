#!/usr/bin/env node
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const MANAGER = 'website-inspiration-library/design-taste-injection';
const LEGACY_MANAGERS = new Set(['website-library/design-taste-injection']);
const root = resolve(import.meta.dirname, '..');

const valueAfter = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
};

const versionAtLeast = (current, required) => {
  const actual = current.replace(/^v/, '').split('.').map(Number);
  const floor = required.split('.').map(Number);
  for (let index = 0; index < floor.length; index += 1) {
    if ((actual[index] ?? 0) > floor[index]) return true;
    if ((actual[index] ?? 0) < floor[index]) return false;
  }
  return true;
};

const validateSource = () => {
  const required = [
    'package.json',
    'src/references.ts',
    'src/workflow-intelligence.ts',
    'scripts/export-workflow-catalog.mjs',
    'skills/design-taste-injection/SKILL.md',
    'skills/design-taste-injection/agents/openai.yaml',
  ];
  const missing = required.filter((path) => !existsSync(resolve(root, path)));
  if (missing.length) throw new Error(`Library is incomplete: ${missing.join(', ')}`);
};

const readMarker = async (destination) => {
  const markerPath = resolve(destination, '.design-taste-injection-install.json');
  if (!existsSync(markerPath)) return null;
  return JSON.parse(await readFile(markerPath, 'utf8'));
};

const main = async () => {
  if (!versionAtLeast(process.version, '22.12.0')) {
    throw new Error(`Node.js 22.12 or newer is required. Current version: ${process.version}`);
  }
  validateSource();

  const catalogCheck = spawnSync(process.execPath, [resolve(root, 'scripts', 'export-workflow-catalog.mjs')], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (catalogCheck.status !== 0) throw new Error(catalogCheck.stderr.trim() || 'The library catalog did not validate.');
  const catalog = JSON.parse(catalogCheck.stdout);
  if (catalog.cards.length !== 63 || catalog.categories.length !== 7) throw new Error('The validated catalog must contain 63 cards and seven categories.');

  const codexHome = resolve(valueAfter('--codex-home') ?? process.env.CODEX_HOME ?? resolve(homedir(), '.codex'));
  const destination = resolve(codexHome, 'skills', 'design-taste-injection');
  const existingMarker = existsSync(destination) ? await readMarker(destination) : null;
  const isManagedInstallation =
    existingMarker?.managedBy === MANAGER || LEGACY_MANAGERS.has(existingMarker?.managedBy);
  if (existsSync(destination) && !isManagedInstallation) {
    throw new Error(`Refusing to replace an unmanaged skill at ${destination}. Move it manually, then rerun setup.`);
  }

  const source = resolve(root, 'skills', 'design-taste-injection');
  const staging = `${destination}.installing-${process.pid}`;
  await mkdir(dirname(destination), { recursive: true });
  await rm(staging, { recursive: true, force: true });
  await cp(source, staging, { recursive: true, force: false, errorOnExist: true });
  await mkdir(resolve(staging, 'config'), { recursive: true });

  const installedAt = new Date().toISOString();
  const config = {
    schemaVersion: 1,
    libraryRoot: root,
    catalogCommand: `${process.execPath} ${resolve(root, 'scripts', 'export-workflow-catalog.mjs')}`,
    catalogFingerprint: catalog.fingerprint,
    libraryVersion: catalog.fingerprint,
    installedAt,
  };
  const marker = { managedBy: MANAGER, sourceRoot: root, installedAt };
  await writeFile(resolve(staging, 'config', 'library.json'), `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  await writeFile(resolve(staging, '.design-taste-injection-install.json'), `${JSON.stringify(marker, null, 2)}\n`, 'utf8');

  const installedSkill = await readFile(resolve(staging, 'SKILL.md'), 'utf8');
  if (!installedSkill.includes('name: design-taste-injection') || installedSkill.includes('[TODO')) throw new Error('Staged skill failed validation.');
  await rm(destination, { recursive: true, force: true });
  await rename(staging, destination);

  console.log('Design Taste Injection installed successfully.');
  console.log(`Skill: ${destination}`);
  console.log(`Library: ${root}`);
  console.log('Restart Codex Desktop, open a website project folder, and paste: $design-taste-injection');
};

main().catch((error) => {
  console.error(`Setup failed: ${error.message}`);
  process.exitCode = 1;
});
