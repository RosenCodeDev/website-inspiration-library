#!/usr/bin/env node
import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(scriptDir, '..');
const templatePath = resolve(skillRoot, 'assets', 'workbench-template.html');

const fail = (message) => {
  console.error(`Design Taste Injection: ${message}`);
  process.exitCode = 1;
};

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const libraryRoot = async () => {
  if (process.env.DESIGN_TASTE_LIBRARY_ROOT) return resolve(process.env.DESIGN_TASTE_LIBRARY_ROOT);
  const configPath = resolve(skillRoot, 'config', 'library.json');
  if (!existsSync(configPath)) return null;
  return resolve((await readJson(configPath)).libraryRoot);
};

const isWithin = (candidate, protectedPath) => {
  const pathFromProtected = relative(protectedPath, candidate);
  return pathFromProtected === '' || (!pathFromProtected.startsWith(`..${sep}`) && pathFromProtected !== '..' && !isAbsolute(pathFromProtected));
};

const assertProjectRoot = async (projectRoot) => {
  const target = resolve(projectRoot);
  const protectedRoots = [skillRoot, await libraryRoot()].filter(Boolean);
  for (const protectedRoot of protectedRoots) {
    if (isWithin(target, protectedRoot) || isWithin(protectedRoot, target)) {
      throw new Error(`project folder must be independent from protected path: ${protectedRoot}`);
    }
  }
  return target;
};

const emptyState = (projectRoot) => {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    projectRoot,
    status: 'intake',
    createdAt: now,
    updatedAt: now,
    intake: { introduction: '', intent: '', audience: '', materialsAndRequirements: '' },
    informationArchitecture: { status: 'pending', pages: [], sections: [], primaryJourney: '' },
    references: { pinned: [], excluded: [], usage: {}, sets: [] },
    generations: [],
    decisions: [],
    heroProvider: 'codex',
  };
};

const validateState = (state) => {
  const errors = [];
  if (state.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!isAbsolute(state.projectRoot ?? '')) errors.push('projectRoot must be absolute');
  if (!Array.isArray(state.generations)) errors.push('generations must be an array');
  if (!Array.isArray(state.decisions)) errors.push('decisions must be an array');
  if (!Array.isArray(state.references?.pinned)) errors.push('references.pinned must be an array');
  if (!Array.isArray(state.references?.excluded)) errors.push('references.excluded must be an array');
  if (!['codex', 'higgsfield'].includes(state.heroProvider)) errors.push('heroProvider must be codex or higgsfield');

  const ids = new Set();
  for (const generation of state.generations ?? []) {
    if (!generation.id || ids.has(generation.id)) errors.push(`invalid or duplicate generation id: ${generation.id ?? '(missing)'}`);
    ids.add(generation.id);
    if (!['direction', 'variant', 'build-path', 'hero', 'final'].includes(generation.stage)) errors.push(`invalid stage for ${generation.id}`);
    if (!['candidate', 'selected', 'rejected', 'superseded'].includes(generation.status)) errors.push(`invalid status for ${generation.id}`);
  }

  for (const generation of state.generations ?? []) {
    if (generation.parent && !ids.has(generation.parent)) errors.push(`missing parent ${generation.parent} for ${generation.id}`);
  }
  return errors;
};

const statePaths = (projectRoot) => {
  const inspirationRoot = resolve(projectRoot, '.inspiration');
  return {
    inspirationRoot,
    state: resolve(inspirationRoot, 'state.json'),
    workbench: resolve(inspirationRoot, 'workbench', 'index.html'),
  };
};

const init = async (rawRoot) => {
  const projectRoot = await assertProjectRoot(rawRoot);
  await mkdir(projectRoot, { recursive: true });
  const paths = statePaths(projectRoot);
  await mkdir(dirname(paths.workbench), { recursive: true });
  if (!existsSync(paths.state)) await writeFile(paths.state, `${JSON.stringify(emptyState(projectRoot), null, 2)}\n`, 'utf8');
  if (!existsSync(paths.workbench)) await cp(templatePath, paths.workbench);
  const state = await readJson(paths.state);
  const errors = validateState(state);
  if (errors.length) throw new Error(errors.join('; '));
  console.log(JSON.stringify({ projectRoot, state: paths.state, workbench: paths.workbench, resumed: state.generations.length > 0 }, null, 2));
};

const append = async (rawRoot, recordPath, kind) => {
  const projectRoot = await assertProjectRoot(rawRoot);
  const paths = statePaths(projectRoot);
  if (!existsSync(paths.state)) throw new Error('project state is missing; run init first');
  const state = await readJson(paths.state);
  const record = await readJson(resolve(recordPath));
  if (kind === 'generation') state.generations.push(record);
  else state.decisions.push(record);
  state.updatedAt = new Date().toISOString();
  const errors = validateState(state);
  if (errors.length) throw new Error(errors.join('; '));
  await writeFile(paths.state, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  console.log(`Recorded ${kind}: ${record.id ?? record.action ?? 'entry'}`);
};

const validate = async (rawRoot) => {
  const projectRoot = await assertProjectRoot(rawRoot);
  const state = await readJson(statePaths(projectRoot).state);
  const errors = validateState(state);
  if (errors.length) throw new Error(errors.join('; '));
  console.log(`Valid Design Taste Injection state: ${state.generations.length} generations, ${state.decisions.length} decisions.`);
};

const main = async () => {
  const [command = 'help', rawRoot = process.cwd(), recordPath] = process.argv.slice(2);
  if (command === 'init') return init(rawRoot);
  if (command === 'validate') return validate(rawRoot);
  if (command === 'append-generation' && recordPath) return append(rawRoot, recordPath, 'generation');
  if (command === 'append-decision' && recordPath) return append(rawRoot, recordPath, 'decision');
  console.log('Usage: project-state.mjs init|validate <project-root> | append-generation|append-decision <project-root> <record.json>');
};

main().catch((error) => fail(error.message));

export { assertProjectRoot, emptyState, validateState };
