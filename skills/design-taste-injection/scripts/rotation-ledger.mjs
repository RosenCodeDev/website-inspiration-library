#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const schemaVersion = 1;
const appDirectory = 'website-inspiration-library';
const bagKey = (category, pageRole) => `${category}::${pageRole}`;
const ledgerPath = (environment = process.env, platform = process.platform) => {
  if (environment.DESIGN_TASTE_ROTATION_PATH) return resolve(environment.DESIGN_TASTE_ROTATION_PATH);
  if (platform === 'win32') return resolve(environment.LOCALAPPDATA ?? resolve(homedir(), 'AppData', 'Local'), appDirectory, 'rotation-v1.json');
  if (platform === 'darwin') return resolve(homedir(), 'Library', 'Application Support', appDirectory, 'rotation-v1.json');
  return resolve(environment.XDG_STATE_HOME ?? resolve(homedir(), '.local', 'state'), appDirectory, 'rotation-v1.json');
};
const emptyLedger = (catalogFingerprint) => ({ schemaVersion, catalogFingerprint, bags: {} });
const validStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0) && new Set(value).size === value.length;
const normalizeBag = (bag, category, pageRole, seed) => ({
  category,
  pageRole,
  seed: typeof bag?.seed === 'string' && bag.seed ? bag.seed : seed,
  cycle: Number.isInteger(bag?.cycle) && bag.cycle >= 0 ? bag.cycle : 0,
  shownIds: validStringArray(bag?.shownIds) ? [...bag.shownIds] : [],
  updatedAt: typeof bag?.updatedAt === 'string' && !Number.isNaN(Date.parse(bag.updatedAt)) ? bag.updatedAt : new Date(0).toISOString(),
});
const validateLedger = (ledger) => {
  if (!ledger || ledger.schemaVersion !== schemaVersion || typeof ledger.catalogFingerprint !== 'string' || !ledger.bags || Array.isArray(ledger.bags)) throw new Error('Rotation ledger is invalid.');
  for (const [key, bag] of Object.entries(ledger.bags)) {
    if (!bag || key !== bagKey(bag.category, bag.pageRole) || typeof bag.seed !== 'string' || !Number.isInteger(bag.cycle) || bag.cycle < 0 || !validStringArray(bag.shownIds) || Number.isNaN(Date.parse(bag.updatedAt))) throw new Error(`Rotation bag is invalid: ${key}`);
    for (const forbidden of ['projectId', 'projectRoot', 'projectName', 'scores', 'qualifiedIds', 'brief', 'industry', 'audience']) if (Object.hasOwn(bag, forbidden)) throw new Error(`Rotation bag contains forbidden field: ${forbidden}`);
  }
  return ledger;
};
const readLedger = async (catalogFingerprint, options = {}) => {
  const path = options.path ?? ledgerPath();
  if (!existsSync(path)) return { path, ledger: emptyLedger(catalogFingerprint) };
  const parsed = validateLedger(JSON.parse(await readFile(path, 'utf8')));
  if (parsed.catalogFingerprint === catalogFingerprint) return { path, ledger: parsed };
  const validIds = options.validIds instanceof Set ? options.validIds : null;
  return {
    path,
    ledger: {
      schemaVersion,
      catalogFingerprint,
      bags: Object.fromEntries(Object.entries(parsed.bags).map(([key, bag]) => [key, {
        ...bag,
        shownIds: validIds ? bag.shownIds.filter((id) => validIds.has(id)) : [],
      }])),
    },
  };
};
const atomicWrite = async (path, value) => {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.writing-${process.pid}-${Date.now()}`;
  await writeFile(temporary, `${JSON.stringify(validateLedger(value), null, 2)}\n`, 'utf8');
  try { await rename(temporary, path); }
  catch (error) { await rm(temporary, { force: true }); throw error; }
};
const seedFor = (catalogFingerprint, category, pageRole) => createHash('sha256').update(`${catalogFingerprint}\0${category}\0${pageRole}`).digest('hex').slice(0, 16);
const getBag = (ledger, category, pageRole) => {
  const key = bagKey(category, pageRole);
  return normalizeBag(ledger.bags[key], category, pageRole, seedFor(ledger.catalogFingerprint, category, pageRole));
};
const saveBag = (ledger, bag) => {
  const normalized = normalizeBag(bag, bag.category, bag.pageRole, bag.seed);
  ledger.bags[bagKey(bag.category, bag.pageRole)] = { ...normalized, updatedAt: new Date().toISOString() };
  return ledger;
};
const writeLedger = async (path, ledger) => atomicWrite(path, ledger);

const main = async () => {
  const [command = 'path', catalogFingerprint, category, pageRole] = process.argv.slice(2);
  if (command === 'path') return console.log(ledgerPath());
  if (command === 'get' && catalogFingerprint && category && pageRole) {
    const { path, ledger } = await readLedger(catalogFingerprint);
    return console.log(JSON.stringify({ path, bag: getBag(ledger, category, pageRole) }, null, 2));
  }
  throw new Error('Usage: rotation-ledger.mjs path | get <catalog-fingerprint> <category> <page-role>');
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Rotation ledger: ${error.message}`); process.exitCode = 1; });

export { bagKey, emptyLedger, getBag, ledgerPath, readLedger, saveBag, seedFor, validateLedger, writeLedger };
