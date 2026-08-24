import { createHash } from 'node:crypto';
import { closeSync, createReadStream, existsSync, openSync, readFileSync, readSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archiveRoot = resolve(repositoryRoot, 'archive', 'Capture History');
const manifestPath = resolve(archiveRoot, 'checksums.sha256');
const allowPointers = process.argv.includes('--allow-pointers');

if (!existsSync(manifestPath)) {
  throw new Error(`Archive checksum manifest is missing: ${manifestPath}`);
}

const entries = readFileSync(manifestPath, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const match = line.match(/^([a-f0-9]{64}) \*(.+)$/i);
    if (!match) throw new Error(`Invalid checksum line: ${line}`);
    return { expected: match[1].toLowerCase(), relativePath: match[2] };
  });

const sha256 = (path) =>
  new Promise((resolveHash, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolveHash(hash.digest('hex')));
  });

const failures = [];
const pointers = [];

for (const entry of entries) {
  const fullPath = resolve(archiveRoot, entry.relativePath);
  if (!fullPath.startsWith(`${archiveRoot}${sep}`)) {
    failures.push(`${entry.relativePath}: path escapes the archive`);
    continue;
  }
  if (!existsSync(fullPath)) {
    failures.push(`${entry.relativePath}: missing`);
    continue;
  }

  const handle = openSync(fullPath, 'r');
  const prefixBuffer = Buffer.alloc(128);
  let prefixLength;
  try {
    prefixLength = readSync(handle, prefixBuffer, 0, prefixBuffer.length, 0);
  } finally {
    closeSync(handle);
  }
  const prefix = prefixBuffer.subarray(0, prefixLength).toString('utf8');
  if (prefix.startsWith('version https://git-lfs.github.com/spec/v1')) {
    const pointer = readFileSync(fullPath, 'utf8');
    const oid = /\noid sha256:([a-f0-9]{64})\n/i.exec(`\n${pointer.trim()}\n`)?.[1]?.toLowerCase();
    const size = /\nsize (\d+)\n/.exec(`\n${pointer.trim()}\n`)?.[1];
    if (!oid || !size || Number(size) <= 0 || oid !== entry.expected) failures.push(`${entry.relativePath}: invalid Git LFS pointer`);
    else pointers.push(entry.relativePath);
    continue;
  }

  const actual = await sha256(fullPath);
  if (actual !== entry.expected) failures.push(`${entry.relativePath}: checksum mismatch`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else if (pointers.length && !allowPointers) {
  console.error(`Archive is not hydrated: ${pointers.length} Git LFS file(s) are pointers.`);
  console.error('Run "git lfs pull --include=archive/Capture History/**" and retry.');
  process.exitCode = 2;
} else if (pointers.length) {
  console.log(`Verified ${entries.length} archive entries, including ${pointers.length} valid Git LFS pointer(s).`);
} else {
  console.log(`Verified ${entries.length} archived capture-history files.`);
}
