#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkProject } from './check-project.mjs';
import { discoverBrowser } from '../skills/design-taste-injection/scripts/browser-discovery.mjs';

const root = resolve(import.meta.dirname, '..');
const available = (command, args = ['--version']) => spawnSync(command, args, { encoding: 'utf8', shell: process.platform === 'win32' }).status === 0;
const codexCommand = () => process.env.CODEX_EXECUTABLE ?? (process.platform === 'win32' ? 'codex.exe' : 'codex');
const codexLogin = () => {
  const result = spawnSync(codexCommand(), ['login', 'status'], { encoding: 'utf8', shell: process.platform === 'win32' });
  const detail = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  return { available: result.status === 0, chatgpt: /logged in using chatgpt/i.test(detail) };
};
const doctorProject = async (target) => {
  const lines = [];
  let healthy = true;
  const report = (status, label, detail) => lines.push(`${status} ${label}: ${detail}`);
  const [major, minor] = process.versions.node.split('.').map(Number);
  const nodeOkay = major > 22 || (major === 22 && minor >= 12);
  report(nodeOkay ? 'OK' : 'FIX', 'Node', process.version); healthy &&= nodeOkay;
  report(available('git') ? 'OK' : 'FIX', 'Git', available('git') ? 'available' : 'install Git'); healthy &&= available('git');
  const dependencies = existsSync(resolve(root, 'node_modules', 'vite', 'package.json'));
  report(dependencies ? 'OK' : 'FIX', 'Library dependencies', dependencies ? 'installed' : 'run npm install in the library'); healthy &&= dependencies;
  const project = await checkProject(target);
  report(project.healthy ? 'OK' : 'FIX', 'Project skills', project.healthy ? project.destination : 'run npm run setup:project -- <website-project-root>'); healthy &&= Boolean(project.healthy);
  const browser = discoverBrowser(); report(browser ? 'OK' : 'FIX', 'Rendered H0 validation', browser ?? 'install Chrome, Edge, or Chromium'); healthy &&= Boolean(browser);
  const codex = codexLogin();
  report(codex.available && codex.chatgpt ? 'OK' : 'FIX', 'Codex subscription runner', codex.available && codex.chatgpt ? 'Codex CLI is signed in with ChatGPT' : 'run codex login and sign in with ChatGPT'); healthy &&= codex.available && codex.chatgpt;
  const apiConfigured = Boolean(process.env.OPENAI_API_KEY);
  report('OPTIONAL', 'Sealed API benchmark', apiConfigured ? 'OPENAI_API_KEY is configured for explicit opt-in benchmarking' : 'not configured; normal generation and release evaluation use the Codex subscription');
  console.log(['Design Taste Injection project doctor', ...lines, '', healthy ? 'READY: required project setup is healthy.' : 'NOT READY: complete the FIX items above.'].join('\n'));
  if (!healthy) process.exitCode = 1;
  return { healthy, lines };
};
const main = async () => doctorProject(process.argv.slice(2).find((value) => !value.startsWith('--')));
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Project doctor failed: ${error.message}`); process.exitCode = 1; });

export { doctorProject };
