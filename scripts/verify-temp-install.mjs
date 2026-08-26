#!/usr/bin/env node
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const verifyTemporaryInstallation = async () => {
  const temporaryHome = await mkdtemp(resolve(tmpdir(), 'design-taste-install-'));
  const project = resolve(temporaryHome, 'website-project');
  const impeccableFixture = resolve(temporaryHome, 'impeccable-fixture');
  try {
    await mkdir(project, { recursive: true });
    await mkdir(impeccableFixture, { recursive: true });
    await writeFile(resolve(project, 'package.json'), '{"private":true}\n', 'utf8');
    await writeFile(resolve(impeccableFixture, 'SKILL.md'), '---\nname: impeccable\ndescription: Test fixture for project-scoped installation.\n---\n\nFixture.\n', 'utf8');
    for (const script of ['setup-project.mjs', 'check-project.mjs']) {
      const args = [resolve(root, 'scripts', script), project];
      if (script === 'setup-project.mjs') args.push('--no-external-install', '--impeccable-source', impeccableFixture);
      const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
      if (result.status !== 0) throw new Error(result.stderr.trim() || `${script} failed`);
    }
    console.log('Temporary project-scoped skill installation is complete and fingerprint-current.');
  } finally {
    await rm(temporaryHome, { recursive: true, force: true });
  }
};
const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) verifyTemporaryInstallation().catch((error) => { console.error(error.message); process.exitCode = 1; });
export { verifyTemporaryInstallation };
