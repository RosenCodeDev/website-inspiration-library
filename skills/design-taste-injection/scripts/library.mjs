#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = resolve(skillRoot, 'config', 'library.json');

const getLibraryRoot = async () => {
  if (process.env.DESIGN_TASTE_LIBRARY_ROOT) return resolve(process.env.DESIGN_TASTE_LIBRARY_ROOT);
  if (!existsSync(configPath)) throw new Error('Missing project skill config/library.json. Run npm run setup:project -- <website-project-root> from the Website Inspiration Library.');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  return resolve(config.libraryRoot);
};

const main = async () => {
  const [command = 'catalog', first, second] = process.argv.slice(2);
  if (!['catalog', 'card', 'stage'].includes(command)) throw new Error(`Unknown command: ${command}`);
  const root = await getLibraryRoot();
  const exporter = resolve(root, 'scripts', 'export-workflow-catalog.mjs');
  if (!existsSync(exporter)) throw new Error(`Library exporter not found at ${exporter}. Update the library and rerun npm run setup:project -- <website-project-root>.`);
  if ((command === 'card' || command === 'stage') && !first) throw new Error(`${command} requires a stable card ID.`);
  const result = spawnSync(process.execPath, [exporter, ...(command === 'catalog' ? [] : ['--card', first])], { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Library catalog export failed.');
  if (command !== 'stage') return process.stdout.write(result.stdout);
  if (!second) throw new Error('stage requires a website project root.');
  const selected = JSON.parse(result.stdout);
  const { resolveEvidence } = await import('./visual-contract.mjs');
  const evidence = await resolveEvidence({
    libraryRoot: selected.libraryRoot,
    publicAssetRoot: selected.publicAssetRoot,
    cards: [selected.card],
  }, resolve(second), first);
  process.stdout.write(`${JSON.stringify({ card: selected.card, evidence: evidence.record, stagedPath: evidence.destination }, null, 2)}\n`);
};

const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) main().catch((error) => {
  console.error(`Design Taste Injection: ${error.message}`);
  process.exitCode = 1;
});

export { getLibraryRoot, main };
