#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');

const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
};

const fingerprint = (value) => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex').slice(0, 16);
const fullFingerprint = (value) => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');

const loadCatalog = async () => {
  const vite = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true } });
  try {
    const [{ references, categories }, { categoryProfiles }] = await Promise.all([
      vite.ssrLoadModule('/src/references.ts'),
      vite.ssrLoadModule('/src/workflow-intelligence.ts'),
    ]);
    const cards = await Promise.all(references.map(async (reference) => {
      const stillPath = resolve(root, 'public', reference.media.detailImage.replace(/^[/\\]+/, ''));
      const stillSha256 = createHash('sha256').update(await readFile(stillPath)).digest('hex');
      const sourceIdentity = {
        ...reference.sourceIdentity,
        derived: { ...reference.sourceIdentity.derived, assetHashes: [stillSha256] },
      };
      const identityReviewFingerprint = fullFingerprint({
        source: reference.source,
        still: { path: reference.media.detailImage, sha256: stillSha256 },
        derived: sourceIdentity.derived,
        reviewed: sourceIdentity.reviewed,
      });
      const card = {
        id: reference.id,
        order: reference.order,
        title: reference.title,
        cardDescriptor: reference.cardDescriptor,
        styleDescriptor: reference.styleDescriptor,
        description: reference.description,
        scope: reference.scope,
        interfaceInventory: reference.interfaceInventory,
        designSystem: reference.designSystem,
        primaryCategory: reference.primaryCategory,
        filters: reference.filters,
        tags: reference.tags,
        brief: reference.brief,
        imageRecipe: reference.imageRecipe,
        source: reference.source,
        sourceIdentity,
        identityReviewFingerprint,
        identityReviewFresh: sourceIdentity.review.reviewStatus === 'reviewed'
          && sourceIdentity.review.reviewFingerprint === identityReviewFingerprint,
        media: reference.media,
        quality: reference.quality,
        workflow: reference.workflow,
      };
      return { ...card, fingerprint: fingerprint(card) };
    }));
    const core = {
      schemaVersion: 4,
      libraryRoot: root,
      publicAssetRoot: resolve(root, 'public'),
      categories: categories.filter((category) => category !== 'All'),
      categoryProfiles,
      categoryFingerprints: Object.fromEntries(
        categories.filter((category) => category !== 'All').map((category) => [category, fingerprint(categoryProfiles[category])]),
      ),
      cards,
    };
    return { ...core, fingerprint: fingerprint(core) };
  } finally {
    await vite.close();
  }
};

const main = async () => {
  const outputIndex = process.argv.indexOf('--output');
  const outputPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : null;
  const cardIndex = process.argv.indexOf('--card');
  const cardId = cardIndex >= 0 ? process.argv[cardIndex + 1] : null;
  const catalog = await loadCatalog();
  const selected = cardId ? catalog.cards.find((card) => card.id === cardId) : null;
  if (cardId && !selected) throw new Error(`Unknown card: ${cardId}`);
  const value = selected ? {
    schemaVersion: catalog.schemaVersion,
    catalogFingerprint: catalog.fingerprint,
    libraryRoot: catalog.libraryRoot,
    publicAssetRoot: catalog.publicAssetRoot,
    card: selected,
  } : catalog;
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  if (outputPath) {
    await writeFile(resolve(outputPath), serialized, 'utf8');
    console.error(`Wrote ${catalog.cards.length} references to ${resolve(outputPath)}`);
  } else {
    process.stdout.write(serialized);
  }
};

const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

export { loadCatalog };
