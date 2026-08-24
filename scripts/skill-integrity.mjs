#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const slash = (value) => value.replaceAll('\\', '/');
const fileHash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const walk = async (root, directory = root, output = []) => {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(root, path, output);
    else if (entry.isFile()) output.push(slash(relative(root, path)));
  }
  return output;
};
const inventoryTree = async (root, excluded = new Set()) => {
  const files = {};
  for (const relativePath of await walk(root)) {
    if (excluded.has(relativePath) || [...excluded].some((item) => item.endsWith('/') && relativePath.startsWith(item))) continue;
    files[relativePath] = fileHash(await readFile(resolve(root, relativePath)));
  }
  return files;
};
const fingerprintInventory = (files) => fileHash(Object.entries(files).sort(([left], [right]) => left.localeCompare(right)).map(([path, hash]) => `${path}\0${hash}`).join('\n'));
const skillInventory = (skillRoot) => inventoryTree(resolve(skillRoot), new Set(['config/', '.design-taste-injection-install.json']));
const skillFingerprint = async (skillRoot) => fingerprintInventory(await skillInventory(skillRoot));
const verifyVendorInventory = async (vendorRoot) => {
  const root = resolve(vendorRoot);
  const manifest = JSON.parse(await readFile(resolve(root, 'CHECKSUMS.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || !/^[a-f0-9]{40}$/.test(manifest.upstreamCommit ?? '') || !manifest.files || Array.isArray(manifest.files)) throw new Error('Vendor checksum manifest is invalid.');
  const actual = {};
  for (const relativePath of (await walk(root)).filter((path) => path !== 'CHECKSUMS.json')) {
    const bytes = await readFile(resolve(root, relativePath));
    const rawHash = fileHash(bytes);
    const text = bytes.includes(0) ? null : bytes.toString('utf8');
    const lineEndingHashes = text === null ? [] : [
      fileHash(text.replaceAll('\r\n', '\n')),
      fileHash(text.replaceAll('\r\n', '\n').replaceAll('\n', '\r\n')),
    ];
    actual[relativePath] = [rawHash, ...lineEndingHashes].includes(manifest.files[relativePath])
      ? manifest.files[relativePath]
      : rawHash;
  }
  const expectedPaths = Object.keys(manifest.files).sort();
  const actualPaths = Object.keys(actual).sort();
  const missing = expectedPaths.filter((path) => !(path in actual));
  const extra = actualPaths.filter((path) => !(path in manifest.files));
  const changed = expectedPaths.filter((path) => actual[path] && actual[path] !== manifest.files[path]);
  if (missing.length || extra.length || changed.length) throw new Error(`Vendor integrity failed. Missing: ${missing.join(', ') || 'none'}. Extra: ${extra.join(', ') || 'none'}. Changed: ${changed.join(', ') || 'none'}.`);
  return { upstreamCommit: manifest.upstreamCommit, fileCount: actualPaths.length, fingerprint: fingerprintInventory(actual) };
};
const compareSkillTrees = async (sourceRoot, installedRoot) => {
  const [source, installed] = await Promise.all([skillInventory(sourceRoot), skillInventory(installedRoot)]);
  const sourcePaths = Object.keys(source).sort();
  const installedPaths = Object.keys(installed).sort();
  const missing = sourcePaths.filter((path) => !(path in installed));
  const extra = installedPaths.filter((path) => !(path in source));
  const changed = sourcePaths.filter((path) => installed[path] && installed[path] !== source[path]);
  return { current: !missing.length && !extra.length && !changed.length, sourceFingerprint: fingerprintInventory(source), installedFingerprint: fingerprintInventory(installed), missing, extra, changed };
};

const main = async () => {
  const [command, first, second] = process.argv.slice(2);
  if (command === 'skill' && first) return console.log(JSON.stringify({ fingerprint: await skillFingerprint(first) }, null, 2));
  if (command === 'verify-vendor' && first) return console.log(JSON.stringify(await verifyVendorInventory(first), null, 2));
  if (command === 'compare' && first && second) return console.log(JSON.stringify(await compareSkillTrees(first, second), null, 2));
  throw new Error('Usage: skill-integrity.mjs skill <skill-root> | verify-vendor <vendor-root> | compare <source> <installed>');
};
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) main().catch((error) => { console.error(error.message); process.exitCode = 1; });

export { compareSkillTrees, fingerprintInventory, inventoryTree, skillFingerprint, skillInventory, verifyVendorInventory };
