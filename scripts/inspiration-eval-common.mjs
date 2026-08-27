import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { loadCatalog } from './export-workflow-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const RELEASE_MODEL = 'gpt-5.6-sol';
const RELEASE_CARD_IDS = ['site-spade', 'image-astra-ai', 'site-ctgt'];
const INITIAL_REVIEWED_IDS = [
  'site-spade', 'site-more-nutrition', 'site-pen', 'site-coda', 'image-rooted', 'image-astra-ai', 'image-castle-waitlist', 'image-voidpixel',
  'image-linq-recovered', 'site-watch', 'site-igloo', 'site-lusion', 'site-ctgt', 'site-ctgt-finance', 'site-fin', 'image-root-soil',
  'image-nova-stack', 'image-launchpad-tools', 'site-sstr', 'site-oqoqo', 'site-paper', 'site-cursor', 'image-auron-architecture', 'site-plinth',
  'image-voypix', 'image-synthos', 'image-bloomride', 'image-marble-recovered', 'site-notion', 'site-dont-board-me', 'site-mana', 'site-aside', 'image-meadow', 'image-bloom-brush',
];
const stable = (value) => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])) : value;
const hash = (value) => createHash('sha256').update(Buffer.isBuffer(value) ? value : JSON.stringify(stable(value))).digest('hex');
const hashFile = async (path) => hash(await readFile(path));
const walk = async (directory, base = directory, output = []) => {
  if (!existsSync(directory)) return output;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path, base, output);
    else if (entry.isFile()) output.push({ path, relativePath: relative(base, path).replaceAll('\\', '/') });
  }
  return output;
};

const currentEvaluationInputs = async () => {
  const catalog = await loadCatalog();
  const currentReviewed = INITIAL_REVIEWED_IDS.map((id) => catalog.cards.find((card) => card.id === id));
  if (currentReviewed.some((card) => !card || !card.identityReviewFresh)) throw new Error('All 34 initial marketing-band identity inventories must be current before release evaluation.');
  const paths = {
    promptRenderer: resolve(root, 'skills', 'design-taste-injection', 'scripts', 'visual-contract.mjs'),
    apiContract: resolve(root, 'skills', 'design-taste-injection', 'scripts', 'isolation-runner.mjs'),
    validator: resolve(root, 'skills', 'design-taste-injection', 'scripts', 'visual-contract.mjs'),
    identityReviews: resolve(root, 'src', 'source-identity-reviews.ts'),
    schema: resolve(root, 'src', 'reference-schema.ts'),
  };
  const fixtures = await walk(resolve(root, 'tests', 'fixtures', 'h0'));
  const inputs = {
    schemaVersion: 1,
    releaseModel: RELEASE_MODEL,
    cardIds: RELEASE_CARD_IDS,
    catalogFingerprint: catalog.fingerprint,
    cardFingerprints: Object.fromEntries(RELEASE_CARD_IDS.map((id) => {
      const card = catalog.cards.find((item) => item.id === id);
      if (!card) throw new Error(`Release evaluation card is missing: ${id}`);
      if (!card.identityReviewFresh) throw new Error(`Release evaluation identity review is stale: ${id}`);
      return [id, { card: card.fingerprint, evidence: card.sourceIdentity.derived.assetHashes[0], identity: card.identityReviewFingerprint }];
    })),
    identityReviewBandFingerprints: Object.fromEntries(currentReviewed.map((card) => [card.id, card.identityReviewFingerprint])),
    fileFingerprints: Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([name, path]) => [name, await hashFile(path)]))),
    goldenFixtureFingerprint: hash(Object.fromEntries(await Promise.all(fixtures.map(async (file) => [file.relativePath, await hashFile(file.path)])))),
  };
  return { inputs, evaluationFingerprint: hash(inputs), catalog };
};

const artifactManifest = async (directory) => Object.fromEntries(await Promise.all((await walk(directory)).filter((file) => !file.relativePath.endsWith('report.json')).map(async (file) => [file.relativePath, await hashFile(file.path)])));

export { INITIAL_REVIEWED_IDS, RELEASE_CARD_IDS, RELEASE_MODEL, artifactManifest, currentEvaluationInputs, hash, hashFile, root, walk };
