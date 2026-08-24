#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkInstallation } from './check-codex.mjs';
import { discoverBrowser } from '../skills/design-taste-injection/scripts/browser-discovery.mjs';

const root = resolve(import.meta.dirname, '..');
const commandAvailable = (command, args = ['--version']) => {
  const result = spawnSync(command, args, { encoding: 'utf8', shell: process.platform === 'win32' });
  return result.status === 0 ? (result.stdout || result.stderr).trim().split(/\r?\n/)[0] : null;
};

const doctor = async () => {
  const codexHome = resolve(process.env.CODEX_HOME ?? resolve(homedir(), '.codex'));
  const lines = [];
  let requiredHealthy = true;
  const report = (status, label, detail) => lines.push(`${status} ${label}: ${detail}`);
  const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
  const nodeOkay = nodeMajor > 22 || (nodeMajor === 22 && nodeMinor >= 12);
  report(nodeOkay ? 'OK' : 'FIX', 'Node', nodeOkay ? process.version : `${process.version}; install Node 22.12 or newer`); requiredHealthy &&= nodeOkay;
  const git = commandAvailable('git'); report(git ? 'OK' : 'FIX', 'Git', git ?? 'install Git, then reopen the terminal'); requiredHealthy &&= Boolean(git);
  const dependencies = existsSync(resolve(root, 'node_modules', 'vite', 'package.json'));
  report(dependencies ? 'OK' : 'FIX', 'Dependencies', dependencies ? 'installed' : 'run npm install in this library folder'); requiredHealthy &&= dependencies;
  try {
    const skill = await checkInstallation(codexHome);
    const current = skill.installed && skill.managed && skill.pathCurrent && skill.catalogCurrent && skill.skillCurrent && skill.vendorCurrent && skill.filesCurrent;
    report(current ? 'OK' : 'FIX', 'Codex skill', current ? 'installed and connected' : 'run npm run setup:codex, then restart Codex'); requiredHealthy &&= current;
  } catch (error) { report('FIX', 'Codex skill', `${error.message}; run npm run setup:codex`); requiredHealthy = false; }
  const browser = discoverBrowser(); report(browser ? 'OK' : 'OPTIONAL', 'Browser capture', browser ?? 'install Chrome, Edge, or Chromium; or set DESIGN_TASTE_BROWSER_PATH');
  const impeccable = existsSync(resolve(codexHome, 'skills', 'impeccable')) || existsSync(resolve(homedir(), '.agents', 'skills', 'impeccable'));
  report(impeccable ? 'OK' : 'FIX', 'Impeccable', impeccable ? 'global skill found; approve each project hook with /hooks' : 'run npx impeccable install --providers=codex --scope=global, then approve each project hook with /hooks');
  const higgsfield = existsSync(resolve(codexHome, 'skills', 'higgsfield')) || Boolean(commandAvailable('higgsfield'));
  report(higgsfield ? 'OK' : 'OPTIONAL', 'Higgsfield', higgsfield ? 'available' : 'not installed; Codex image generation remains the default');
  const lfs = commandAvailable('git', ['lfs', 'version']); report(lfs ? 'OK' : 'OPTIONAL', 'Historical archive', lfs ? `${lfs}; not required by the portal` : 'Git LFS not installed; runtime portal media still works');
  console.log(['Design Taste Injection doctor', ...lines, '', requiredHealthy ? 'READY: required setup is healthy.' : 'NOT READY: complete the FIX items above.'].join('\n'));
  if (!requiredHealthy) process.exitCode = 1;
  return { requiredHealthy, lines };
};

const isDirect = process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirect) doctor().catch((error) => { console.error(`Doctor failed: ${error.message}`); process.exitCode = 1; });

export { doctor };
