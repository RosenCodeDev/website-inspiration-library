#!/usr/bin/env node
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const verifyTemporaryInstallation = async () => {
  const temporaryHome = await mkdtemp(resolve(tmpdir(), 'design-taste-install-'));
  try {
    for (const script of ['setup-codex.mjs', 'check-codex.mjs']) {
      const result = spawnSync(process.execPath, [resolve(root, 'scripts', script), '--codex-home', temporaryHome], { cwd: root, encoding: 'utf8' });
      if (result.status !== 0) throw new Error(result.stderr.trim() || `${script} failed`);
    }
    console.log('Temporary skill installation is complete and fingerprint-current.');
  } finally {
    await rm(temporaryHome, { recursive: true, force: true });
  }
};
const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) verifyTemporaryInstallation().catch((error) => { console.error(error.message); process.exitCode = 1; });
export { verifyTemporaryInstallation };
