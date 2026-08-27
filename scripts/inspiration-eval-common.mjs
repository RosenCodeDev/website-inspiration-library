import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { loadCatalog } from './export-workflow-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const RELEASE_MODEL = 'gpt-5.6-sol';
const RELEASE_CARD_IDS = ['site-spade'];
const INITIAL_IDENTITY_IDS = [
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
  const currentInventories = INITIAL_IDENTITY_IDS.map((id) => catalog.cards.find((card) => card.id === id));
  if (currentInventories.some((card) => !card || !card.identityReviewFresh)) throw new Error('All 34 initial marketing-band identity inventories must be current before release evaluation.');
  const paths = {
    subscriptionEvaluation: resolve(root, 'scripts', 'inspiration-subscription-eval.mjs'),
    subscriptionAttestation: resolve(root, 'scripts', 'inspiration-eval-attestation.mjs'),
    identityReviews: resolve(root, 'src', 'source-identity-reviews.ts'),
    schema: resolve(root, 'src', 'reference-schema.ts'),
  };
  const fixtures = await walk(resolve(root, 'tests', 'fixtures', 'h0'));
  const skillFiles = await walk(resolve(root, 'skills', 'design-taste-injection'));
  const inputs = {
    schemaVersion: 3,
    evaluationMode: 'subscription',
    subscriptionRunner: 'codex-cli-chatgpt',
    imageProvider: 'codex-imagegen',
    cardIds: RELEASE_CARD_IDS,
    catalogFingerprint: catalog.fingerprint,
    cardFingerprints: Object.fromEntries(RELEASE_CARD_IDS.map((id) => {
      const card = catalog.cards.find((item) => item.id === id);
      if (!card) throw new Error(`Release evaluation card is missing: ${id}`);
      if (!card.identityReviewFresh) throw new Error(`Release evaluation identity inventory is stale: ${id}`);
      return [id, { card: card.fingerprint, evidence: card.sourceIdentity.derived.assetHashes[0], identity: card.identityReviewFingerprint }];
    })),
    identityReviewBandFingerprints: Object.fromEntries(currentInventories.map((card) => [card.id, card.identityReviewFingerprint])),
    identityReviewOrigins: Object.fromEntries(currentInventories.map((card) => [card.id, card.sourceIdentity.review.reviewOrigin])),
    fileFingerprints: Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([name, path]) => [name, await hashFile(path)]))),
    skillFingerprint: hash(Object.fromEntries(await Promise.all(skillFiles.map(async (file) => [file.relativePath, await hashFile(file.path)])))),
    goldenFixtureFingerprint: hash(Object.fromEntries(await Promise.all(fixtures.map(async (file) => [file.relativePath, await hashFile(file.path)])))),
  };
  return { inputs, evaluationFingerprint: hash(inputs), catalog };
};

const artifactManifest = async (directory) => Object.fromEntries(await Promise.all((await walk(directory)).filter((file) => !['report.json', 'attestation.json'].includes(file.relativePath)).map(async (file) => [file.relativePath, await hashFile(file.path)])));

export { INITIAL_IDENTITY_IDS, RELEASE_CARD_IDS, RELEASE_MODEL, artifactManifest, currentEvaluationInputs, hash, hashFile, root, walk };
