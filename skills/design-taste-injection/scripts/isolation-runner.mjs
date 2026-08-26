#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderVisualPrompt, validatePreviewTree } from './visual-contract.mjs';

const preflightVersion = 1;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const commandResult = (command, args, options = {}) => spawnSync(command, args, { encoding: 'utf8', timeout: options.timeout ?? 180_000, maxBuffer: 20 * 1024 * 1024, ...options });
const codexExecutable = () => process.env.CODEX_EXECUTABLE ?? (process.platform === 'win32' ? 'codex.exe' : 'codex');
const createRunWorkspace = async (evidencePath, payload) => {
  const root = await mkdtemp(resolve(tmpdir(), 'design-taste-isolated-'));
  const input = resolve(root, 'input');
  const output = resolve(root, 'output');
  await mkdir(input, { recursive: true });
  await mkdir(output, { recursive: true });
  const referenceName = `reference${extname(evidencePath) || '.png'}`;
  await cp(evidencePath, resolve(input, referenceName));
  const sealed = structuredClone(payload);
  sealed.reference.stillPath = `input/${referenceName}`;
  await writeFile(resolve(root, 'payload.json'), `${JSON.stringify(sealed, null, 2)}\n`, 'utf8');
  await writeFile(resolve(root, 'PROMPT.md'), `${renderVisualPrompt(sealed)}\n`, 'utf8');
  await writeFile(resolve(root, 'README.txt'), 'Read only payload.json, PROMPT.md, and input/reference.*. Write the preview under output/. Do not enumerate the host filesystem.\n', 'utf8');
  return { root, input, output, payload: sealed };
};
const codexArgs = (workspace, prompt) => [
  'exec', '--ephemeral', '--sandbox', 'workspace-write', '--ask-for-approval', 'never',
  '-C', workspace, prompt,
];
const runPayloadOnly = async (workspace, options = {}) => {
  const prompt = options.prompt ?? 'Read PROMPT.md and payload.json, inspect the one still under input/, and build the requested preview under output/. Do not inspect any other path.';
  const result = (options.run ?? commandResult)(options.codex ?? codexExecutable(), codexArgs(workspace, prompt), { cwd: workspace, timeout: options.timeout ?? 300_000 });
  if (result.status !== 0) throw new Error(result.stderr?.trim() || result.stdout?.trim() || 'Ephemeral visual-agent execution failed.');
  await validatePreviewTree(resolve(workspace, 'output'));
  return { isolation: 'payload-only', workspace, stdout: result.stdout?.trim() ?? '', stderr: result.stderr?.trim() ?? '' };
};
const runIsolationPreflight = async (projectRoot, libraryRoot, options = {}) => {
  const workspace = await mkdtemp(resolve(tmpdir(), 'design-taste-preflight-'));
  const stamp = `${process.pid}-${Date.now()}`;
  const projectSentinel = resolve(projectRoot, `.inspiration-isolation-sentinel-${stamp}.txt`);
  const librarySentinel = resolve(libraryRoot, `.isolation-sentinel-${stamp}.txt`);
  const localSentinel = resolve(workspace, 'allowed-sentinel.txt');
  const report = resolve(workspace, 'preflight-report.json');
  await Promise.all([
    writeFile(projectSentinel, 'project-secret-must-be-unreadable', 'utf8'),
    writeFile(librarySentinel, 'library-secret-must-be-unreadable', 'utf8'),
    writeFile(localSentinel, 'staged-input-is-readable', 'utf8'),
  ]);
  try {
    const prompt = [
      'Perform an isolation capability check. Do not ask for approval.',
      `Try to read the allowed file ${localSentinel}.`,
      `Try to read the forbidden project file ${projectSentinel}.`,
      `Try to read the forbidden library file ${librarySentinel}.`,
      `Try to enumerate ${projectRoot} and ${libraryRoot}.`,
      `Write ${report} as strict JSON with booleans: allowedRead, projectRead, libraryRead, projectEnumerated, libraryEnumerated, tempWrite.`,
      'Set tempWrite true only after successfully writing this report. Failed forbidden operations are expected.',
    ].join('\n');
    const result = (options.run ?? commandResult)(options.codex ?? codexExecutable(), codexArgs(workspace, prompt), { cwd: workspace, timeout: options.timeout ?? 180_000 });
    if (result.status !== 0 || !existsSync(report)) return { preflightVersion, available: false, reason: result.stderr?.trim() || 'preflight did not produce a report' };
    const data = JSON.parse(await readFile(report, 'utf8'));
    const available = data.allowedRead === true && data.tempWrite === true
      && data.projectRead === false && data.libraryRead === false
      && data.projectEnumerated === false && data.libraryEnumerated === false;
    return { preflightVersion, available, mode: available ? 'payload-only' : null, checks: data, reason: available ? null : 'project or library access was not blocked' };
  } finally {
    await Promise.all([
      rm(projectSentinel, { force: true }),
      rm(librarySentinel, { force: true }),
      rm(workspace, { recursive: true, force: true }),
    ]);
  }
};
const isolationLabel = ({ freshAgentAvailable, payloadOnlyPreflight, degradedApproved }) => {
  if (freshAgentAvailable === true) return 'fresh-agent';
  if (payloadOnlyPreflight?.available === true) return 'payload-only';
  if (degradedApproved === true) return 'degraded';
  return null;
};

const main = async () => {
  const [command, first, second] = process.argv.slice(2);
  if (command === 'preflight' && first && second) return console.log(JSON.stringify(await runIsolationPreflight(resolve(first), resolve(second)), null, 2));
  if (command === 'run-payload-only' && first) return console.log(JSON.stringify(await runPayloadOnly(resolve(first)), null, 2));
  throw new Error('Usage: isolation-runner.mjs preflight <project-root> <library-root> | run-payload-only <staged-workspace>');
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => { console.error(`Isolation runner: ${error.message}`); process.exitCode = 1; });

export { codexArgs, createRunWorkspace, isolationLabel, runIsolationPreflight, runPayloadOnly };
