import { existsSync, realpathSync } from 'node:fs';
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

export { assertContainedPath, assertIndependentPath, canonicalPath, isWithin };
