import { existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const isWithin = (candidate, root) => {
  const rel = relative(root, candidate);
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel));
};

const canonicalPath = (candidate) => {
  let cursor = resolve(candidate);
  const tail = [];
  while (!existsSync(cursor)) {
    const parent = dirname(cursor);
    if (parent === cursor) break;
    tail.unshift(cursor.slice(parent.length + (parent.endsWith(sep) ? 0 : 1)));
    cursor = parent;
  }
  const base = existsSync(cursor) ? realpathSync.native(cursor) : cursor;
  return resolve(base, ...tail);
};

const assertIndependentPath = (candidate, protectedRoots) => {
  const target = canonicalPath(candidate);
  for (const protectedRoot of protectedRoots.filter(Boolean)) {
    const protectedPath = canonicalPath(protectedRoot);
    if (isWithin(target, protectedPath) || isWithin(protectedPath, target)) {
      throw new Error(`project folder must be independent from protected path: ${protectedPath}`);
    }
  }
  return target;
};

const assertContainedPath = (candidate, root) => {
  const canonicalRoot = canonicalPath(root);
  const canonicalCandidate = canonicalPath(candidate);
  if (!isWithin(canonicalCandidate, canonicalRoot)) throw new Error(`path escapes protected root: ${candidate}`);
  return canonicalCandidate;
};

const assertProjectRootPath = async (candidate, installedSkillRoot, fallbackLibraryRoot = null) => {
  if (typeof candidate !== 'string' || !candidate.trim()) throw new Error('project folder is required');
  const skillPath = canonicalPath(installedSkillRoot);
  const configPath = resolve(skillPath, 'config', 'library.json');
  if (!existsSync(configPath)) return assertIndependentPath(candidate, [skillPath, fallbackLibraryRoot].filter(Boolean));

  const config = JSON.parse(await readFile(configPath, 'utf8'));
  if (config.scope !== 'project' || typeof config.projectRoot !== 'string' || !config.projectRoot.trim()
    || typeof config.libraryRoot !== 'string' || !config.libraryRoot.trim()) {
    throw new Error(`installed project configuration is invalid: ${configPath}`);
  }
  const target = canonicalPath(candidate);
  const configuredProject = canonicalPath(config.projectRoot);
  if (target !== configuredProject) throw new Error(`project folder must match configured website project: ${configuredProject}`);
  if (skillPath === configuredProject || !isWithin(skillPath, configuredProject)) throw new Error(`installed skill is outside its configured website project: ${skillPath}`);
  return assertIndependentPath(target, [config.libraryRoot]);
};

export { assertContainedPath, assertIndependentPath, assertProjectRootPath, canonicalPath, isWithin };
