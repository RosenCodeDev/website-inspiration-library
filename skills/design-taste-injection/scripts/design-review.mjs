import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const templatePath = resolve(scriptDir, '..', 'assets', 'design-review-template.html');
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const safeRelativePreviewPath = (value) => typeof value === 'string'
  && value.endsWith('/index.html')
  && !isAbsolute(value)
  && !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)
  && !value.includes('\\')
  && !value.split('/').some((segment) => !segment || segment === '.' || segment === '..');

const normalizeDesignReviewEntries = (entries) => {
  if (!Array.isArray(entries)) throw new Error('Design Review entries must be an array.');
  const ids = new Set();
  const paths = new Set();
  return entries.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error(`Design Review entry ${index + 1} must be an object.`);
    const id = typeof entry.id === 'string' ? entry.id.trim() : '';
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    const path = typeof entry.path === 'string' ? entry.path.trim() : '';
    if (!idPattern.test(id)) throw new Error(`Design Review entry ${index + 1} has an invalid id.`);
    if (!name) throw new Error(`Design Review entry ${index + 1} requires a readable name.`);
    if (!safeRelativePreviewPath(path)) throw new Error(`Design Review entry ${index + 1} requires a safe relative path ending in /index.html.`);
    if (ids.has(id)) throw new Error(`Duplicate Design Review id: ${id}.`);
    if (paths.has(path)) throw new Error(`Duplicate Design Review path: ${path}.`);
    ids.add(id);
    paths.add(path);
    return { id, name, path };
  });
};

const serializeEntries = (entries) => JSON.stringify(entries, null, 2)
  .replaceAll('<', '\\u003c')
  .replaceAll('\u2028', '\\u2028')
  .replaceAll('\u2029', '\\u2029');

const renderDesignReviewHtml = async (entries, options = {}) => {
  const normalized = normalizeDesignReviewEntries(entries);
  const initialVersionCount = options.initialVersionCount ?? normalized.length;
  if (!Number.isInteger(initialVersionCount) || initialVersionCount < 0) throw new Error('Design Review initialVersionCount must be a nonnegative integer.');
  const template = await readFile(templatePath, 'utf8');
  const rendered = template
    .replaceAll('__INITIAL_VERSION_COUNT__', String(initialVersionCount))
    .replace('__DESIGN_REVIEW_ENTRIES__', serializeEntries(normalized));
  if (rendered.includes('__INITIAL_VERSION_COUNT__') || rendered.includes('__DESIGN_REVIEW_ENTRIES__')) throw new Error('Design Review template markers were not fully rendered.');
  return rendered;
};

export { normalizeDesignReviewEntries, renderDesignReviewHtml, safeRelativePreviewPath, templatePath };
