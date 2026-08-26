#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
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

const loadCatalog = async () => {
  const vite = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true } });
  try {
    const [{ references, categories }, { categoryProfiles }] = await Promise.all([
      vite.ssrLoadModule('/src/references.ts'),
      vite.ssrLoadModule('/src/workflow-intelligence.ts'),
    ]);
    const cards = references.map((reference) => {
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
        sourceIdentity: reference.sourceIdentity,
        media: reference.media,
        quality: reference.quality,
        workflow: reference.workflow,
      };
      return { ...card, fingerprint: fingerprint(card) };
    });
    const core = {
      schemaVersion: 3,
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
  const catalog = await loadCatalog();
  const serialized = `${JSON.stringify(catalog, null, 2)}\n`;
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
