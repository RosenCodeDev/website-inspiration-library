#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const probeRoot = resolve(scriptRoot, '..', 'vendor', 'site-clone', 'skills', 'clone-site', 'scripts');
const probeFiles = ['surface-map.js', 'motion-probe.js', 'tokens-probe.js'];
const exports = ['instrumentGetContext', 'surfaceMap', 'isCanvasAnimating', 'instrumentMotion', 'motionProbe', 'motionSummary', 'tokensProbe'];
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/^\s*[\r\n]/gm, '');

const buildProbeBundle = async (destination) => {
  const parts = await Promise.all(probeFiles.map(async (file) => stripComments(await readFile(resolve(probeRoot, file), 'utf8'))));
  const bundle = `${parts.join('\n')}\n;(function(){const root=typeof window!=="undefined"?window:globalThis;Object.assign(root,{${exports.join(',')}});})();\n`;
  if (destination) await writeFile(resolve(destination), bundle, 'utf8');
  return bundle;
};

const main = async () => {
  const destination = process.argv[2];
  if (!destination) throw new Error('Usage: build-probe-bundle.mjs <destination.js>');
  const bundle = await buildProbeBundle(destination);
  console.log(`${resolve(destination)} ${Buffer.byteLength(bundle)} bytes`);
};

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((error) => { console.error(`Probe bundle failed: ${error.message}`); process.exitCode = 1; });
}

export { buildProbeBundle };
