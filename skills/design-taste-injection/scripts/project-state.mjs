#!/usr/bin/env node
import { cp, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertContainedPath, assertIndependentPath, canonicalPath } from './path-safety.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(scriptDir, '..');
const templatePath = resolve(skillRoot, 'assets', 'workbench-template.html');
const currentSchemaVersion = 5;
const currentWorkbenchVersion = 3;
const legacyWorkbenchHashes = new Set([
  '90d7b70ac826a8955583e5f09d5ccb198e1d2a85e27e49b07391e23255d91b5d',
  '5304288a5c7048ebae565f16489c278a194b9cac16184a24090fddd0e70ebf0a',
]);
const workflowStatuses = new Set(['intake', 'architecture', 'directions', 'references', 'variants', 'build-path', 'hero', 'implementation', 'polish', 'complete']);
const generationStages = new Set(['direction', 'variant', 'build-path', 'hero', 'implementation', 'final']);
const generationStatuses = new Set(['candidate', 'selected', 'rejected', 'superseded']);
const architectureStatuses = new Set(['pending', 'candidate', 'approved']);
const focusedPreviewSections = ['hero', 'opening-module'];

const fail = (message) => { console.error(`Design Taste Injection: ${message}`); process.exitCode = 1; };
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const validDate = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const hashText = (value) => createHash('sha256').update(value).digest('hex');
const loadCatalog = () => {
  const result = spawnSync(process.execPath, [resolve(scriptDir, 'library.mjs'), 'catalog'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Could not read the library catalog.');
  return JSON.parse(result.stdout);
};

const libraryRoot = async () => {
  if (process.env.DESIGN_TASTE_LIBRARY_ROOT) return resolve(process.env.DESIGN_TASTE_LIBRARY_ROOT);
  const configPath = resolve(skillRoot, 'config', 'library.json');
  if (!existsSync(configPath)) return null;
  return resolve((await readJson(configPath)).libraryRoot);
};
const assertProjectRoot = async (projectRoot) => {
  const protectedRoots = [skillRoot, await libraryRoot()].filter(Boolean);
  return assertIndependentPath(projectRoot, protectedRoots);
};

const emptyState = (projectRoot) => {
  const now = new Date().toISOString();
  return {
    schemaVersion: currentSchemaVersion,
    workbenchVersion: currentWorkbenchVersion,
    projectRoot,
    status: 'intake',
    createdAt: now,
    updatedAt: now,
    intake: { introduction: '', intent: '', audience: '', materialsAndRequirements: '' },
    informationArchitecture: { status: 'pending', pages: [], sections: [], primaryJourney: '' },
    references: {
      catalogFingerprint: null,
      selectionStatus: 'none',
      activeSession: null,
      acceptedSets: [],
      historicalCards: {},
      pinned: [],
      excluded: [],
      usage: {},
    },
    generations: [],
    decisions: [],
    heroProvider: 'codex',
    verification: { status: 'pending', checks: [], completedAt: null },
    migrationWarnings: [],
  };
};

const validateNamedItem = (item, label) => {
  if (typeof item === 'string' && item.trim()) return [];
  if (isRecord(item) && typeof item.id === 'string' && item.id.trim() && typeof (item.title ?? item.name) === 'string' && (item.title ?? item.name).trim()) return [];
  return [`${label} entries must be nonempty strings or records with id and title/name`];
};
const validateReferenceSet = (set, label, catalog = null) => {
  const errors = [];
  if (!isRecord(set) || !isRecord(set.anchor) || !Array.isArray(set.supporting)) return [`${label} must contain anchor and supporting`];
  const all = [set.anchor, ...set.supporting];
  if (set.anchor.role !== 'anchor' || set.supporting.some((item) => item?.role === 'anchor')) errors.push(`${label} must contain exactly one anchor`);
  if (all.some((item) => !isRecord(item) || typeof item.id !== 'string' || typeof item.role !== 'string')) errors.push(`${label} references need id and role`);
  const ids = all.map((item) => item?.id);
  if (new Set(ids).size !== ids.length) errors.push(`${label} contains duplicate cards`);
  if (set.supporting.length > 2) errors.push(`${label} supports at most two cards`);
  if (catalog) for (const item of all) {
    const card = catalog.cards.find((entry) => entry.id === item?.id);
    if (card && item.role !== 'anchor' && !card.workflow.roles.includes(item.role)) errors.push(`${label} assigns an unsupported role to ${item.id}`);
  }
  if (typeof set.signature === 'string') {
    const expected = `${set.anchor.id}|${set.supporting.map((item) => `${item.id}:${item.role}`).sort().join('|')}`;
    if (set.signature !== expected) errors.push(`${label} signature does not match its cards and roles`);
  }
  return errors;
};

const validateDirectionPreviewScope = (scope, label, allowLegacy = true) => {
  if (!isRecord(scope)) return [`${label} requires previewScope`];
  if (scope.kind === 'legacy-unverified') return allowLegacy ? [] : [`${label} cannot use legacy-unverified previewScope`];
  if (scope.kind !== 'focused-category-preview') return [`${label} previewScope.kind must be focused-category-preview`];
  const sections = Array.isArray(scope.sections) ? scope.sections : [];
  if (scope.pageCount !== 1
    || sections.length !== focusedPreviewSections.length
    || !focusedPreviewSections.every((section) => sections.includes(section))
    || scope.completeSite !== false) {
    return [`${label} must stay to one page with exactly a hero and one opening module; completeSite must be false`];
  }
  return [];
};

const validateState = (state, expectedProjectRoot, catalog = null) => {
  const errors = [];
  const catalogIds = new Set(catalog?.cards?.map((card) => card.id) ?? []);
  const catalogRoles = new Set(catalog?.cards?.flatMap((card) => card.workflow.roles) ?? []);
  const catalogCategories = new Set(catalog?.categories ?? []);
  if (!isRecord(state)) return ['state must be an object'];
  if (state.schemaVersion !== currentSchemaVersion) errors.push(`schemaVersion must be ${currentSchemaVersion}`);
  if (state.workbenchVersion !== currentWorkbenchVersion) errors.push(`workbenchVersion must be ${currentWorkbenchVersion}`);
  if (!isAbsolute(state.projectRoot ?? '')) errors.push('projectRoot must be absolute');
  if (expectedProjectRoot && canonicalPath(state.projectRoot ?? '.') !== canonicalPath(expectedProjectRoot)) errors.push('saved projectRoot does not match the project being operated on');
  if (!workflowStatuses.has(state.status)) errors.push(`invalid workflow status: ${state.status}`);
  if (!validDate(state.createdAt) || !validDate(state.updatedAt)) errors.push('createdAt and updatedAt must be valid timestamps');
  if (!isRecord(state.intake)) errors.push('intake must be an object');
  else for (const key of ['introduction', 'intent', 'audience', 'materialsAndRequirements']) if (typeof state.intake[key] !== 'string') errors.push(`intake.${key} must be a string`);
  if (!isRecord(state.informationArchitecture)) errors.push('informationArchitecture must be an object');
  else {
    if (!architectureStatuses.has(state.informationArchitecture.status)) errors.push('informationArchitecture.status is invalid');
    if (!Array.isArray(state.informationArchitecture.pages)) errors.push('informationArchitecture.pages must be an array');
    else state.informationArchitecture.pages.forEach((item, index) => errors.push(...validateNamedItem(item, `informationArchitecture.pages[${index}]`)));
    if (!Array.isArray(state.informationArchitecture.sections)) errors.push('informationArchitecture.sections must be an array');
    else state.informationArchitecture.sections.forEach((item, index) => errors.push(...validateNamedItem(item, `informationArchitecture.sections[${index}]`)));
    if (typeof state.informationArchitecture.primaryJourney !== 'string') errors.push('informationArchitecture.primaryJourney must be a string');
  }
  if (!isRecord(state.references)) errors.push('references must be an object');
  else {
    if (state.references.catalogFingerprint !== null && typeof state.references.catalogFingerprint !== 'string') errors.push('references.catalogFingerprint must be a string or null');
    if (!['none', 'current', 'needs-revalidation'].includes(state.references.selectionStatus)) errors.push('references.selectionStatus is invalid');
    if (state.references.activeSession !== null && !isRecord(state.references.activeSession)) errors.push('references.activeSession must be an object or null');
    if (!Array.isArray(state.references.acceptedSets)) errors.push('references.acceptedSets must be an array');
    else state.references.acceptedSets.forEach((set, index) => errors.push(...validateReferenceSet(set, `references.acceptedSets[${index}]`, catalog)));
    if (!isRecord(state.references.historicalCards)) errors.push('references.historicalCards must be an object');
    else for (const [id, card] of Object.entries(state.references.historicalCards)) {
      if (!isRecord(card) || card.id !== id || typeof card.title !== 'string' || typeof card.primaryCategory !== 'string') errors.push(`historical card snapshot is invalid: ${id}`);
    }
    if (!Array.isArray(state.references.pinned)) errors.push('references.pinned must be an array');
    else {
      const ids = state.references.pinned.map((pin) => pin?.id);
      if (new Set(ids).size !== ids.length) errors.push('references.pinned contains duplicates');
      if (state.references.pinned.some((pin) => !isRecord(pin) || typeof pin.id !== 'string' || typeof pin.role !== 'string')) errors.push('references.pinned records need id and role');
      if (state.references.pinned.length > 3) errors.push('references.pinned supports at most three cards');
      if (state.references.pinned.filter((pin) => pin.role === 'anchor').length > 1) errors.push('references.pinned contains multiple anchors');
      if (catalog && state.references.selectionStatus === 'current') for (const pin of state.references.pinned) {
        if (!catalogIds.has(pin.id)) errors.push(`references.pinned contains unknown card: ${pin.id}`);
        if (pin.role !== 'anchor' && !catalogRoles.has(pin.role)) errors.push(`references.pinned contains unknown role: ${pin.role}`);
      }
    }
    if (!Array.isArray(state.references.excluded) || state.references.excluded.some((id) => typeof id !== 'string') || new Set(state.references.excluded).size !== state.references.excluded.length) errors.push('references.excluded must contain unique strings');
    if (Array.isArray(state.references.excluded) && Array.isArray(state.references.pinned)) {
      const excluded = new Set(state.references.excluded);
      for (const pin of state.references.pinned) if (excluded.has(pin.id)) errors.push(`reference cannot be pinned and excluded: ${pin.id}`);
    }
    if (!isRecord(state.references.usage) || Object.values(state.references.usage).some((count) => !Number.isInteger(count) || count < 0)) errors.push('references.usage must contain nonnegative integers');
    if (catalog && state.references.selectionStatus === 'current') {
      if (state.references.catalogFingerprint !== catalog.fingerprint) errors.push('active references require revalidation against the current catalog');
      if (!state.references.activeSession) errors.push('current references require an active session');
      else {
        errors.push(...validateReferenceSet(state.references.activeSession.currentSet, 'references.activeSession.currentSet', catalog));
        if (state.references.activeSession.catalogFingerprint !== catalog.fingerprint) errors.push('active session catalog fingerprint is stale');
      }
      const activeIds = state.references.activeSession ? [state.references.activeSession.currentSet?.anchor?.id, ...(state.references.activeSession.currentSet?.supporting ?? []).map((item) => item.id)] : [];
      for (const id of activeIds.filter(Boolean)) if (!catalogIds.has(id)) errors.push(`active session contains unknown card: ${id}`);
      for (const id of state.references.excluded ?? []) if (!catalogIds.has(id)) errors.push(`references.excluded contains unknown card: ${id}`);
      for (const id of Object.keys(state.references.usage ?? {})) if (!catalogIds.has(id) && !state.references.historicalCards?.[id]) errors.push(`references.usage lacks a current card or historical snapshot: ${id}`);
    }
    if (catalog) for (const set of state.references.acceptedSets ?? []) for (const item of [set.anchor, ...set.supporting]) {
      if (!catalogIds.has(item.id) && !state.references.historicalCards?.[item.id]) errors.push(`accepted reference lacks a current card or historical snapshot: ${item.id}`);
    }
  }
  if (!Array.isArray(state.generations)) errors.push('generations must be an array');
  if (!Array.isArray(state.decisions)) errors.push('decisions must be an array');
  if (!['codex', 'higgsfield'].includes(state.heroProvider)) errors.push('heroProvider must be codex or higgsfield');
  if (!isRecord(state.verification) || !['pending', 'passed'].includes(state.verification.status)
    || !Array.isArray(state.verification.checks) || state.verification.checks.some((item) => typeof item !== 'string' || !item.trim())
    || (state.verification.status === 'passed' && !validDate(state.verification.completedAt))) errors.push('verification record is invalid');
  if (!Array.isArray(state.migrationWarnings) || state.migrationWarnings.some((item) => typeof item !== 'string')) errors.push('migrationWarnings must be an array of strings');

  const ids = new Set();
  for (const generation of state.generations ?? []) {
    if (!isRecord(generation)) { errors.push('generation must be an object'); continue; }
    if (!generation.id || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(generation.id) || ids.has(generation.id)) errors.push(`invalid or duplicate generation id: ${generation.id ?? '(missing)'}`);
    ids.add(generation.id);
    if (!generationStages.has(generation.stage)) errors.push(`invalid stage for ${generation.id}`);
    if (!generationStatuses.has(generation.status)) errors.push(`invalid status for ${generation.id}`);
    if (typeof generation.label !== 'string' || !generation.label.trim()) errors.push(`label is required for ${generation.id}`);
    if (generation.category !== null && generation.category !== undefined && typeof generation.category !== 'string') errors.push(`category is invalid for ${generation.id}`);
    if (catalog && generation.category && !catalogCategories.has(generation.category)) errors.push(`unknown category for ${generation.id}: ${generation.category}`);
    if (typeof generation.thesis !== 'string') errors.push(`thesis is required for ${generation.id}`);
    if (generation.stage === 'direction') errors.push(...validateDirectionPreviewScope(generation.previewScope, `direction ${generation.id}`));
    if (!Array.isArray(generation.references)) errors.push(`references are required for ${generation.id}`);
    else {
      const referenceIds = generation.references.map((item) => item?.id);
      if (new Set(referenceIds).size !== referenceIds.length) errors.push(`duplicate references for ${generation.id}`);
      if (generation.references.filter((item) => item?.role === 'anchor').length > 1) errors.push(`multiple anchor references for ${generation.id}`);
      for (const item of generation.references) {
        if (!isRecord(item) || typeof item.id !== 'string' || typeof item.role !== 'string') { errors.push(`invalid reference record for ${generation.id}`); continue; }
        const card = catalog?.cards?.find((entry) => entry.id === item.id);
        if (catalog && !card && !state.references?.historicalCards?.[item.id]) errors.push(`unknown reference ${item.id} for ${generation.id}`);
        if (card && item.role !== 'anchor' && !card.workflow.roles.includes(item.role)) errors.push(`unsupported reference role ${item.role} for ${item.id}`);
      }
    }
    if (!validDate(generation.createdAt)) errors.push(`createdAt is invalid for ${generation.id}`);
    const expectedPreview = `../previews/${generation.id}/index.html`;
    if (generation.preview !== expectedPreview) errors.push(`preview for ${generation.id} must be ${expectedPreview}`);
  }
  for (const generation of state.generations ?? []) if (generation?.parent && !ids.has(generation.parent)) errors.push(`missing parent ${generation.parent} for ${generation.id}`);
  for (const [index, decision] of (state.decisions ?? []).entries()) {
    if (!isRecord(decision) || typeof decision.action !== 'string' || !decision.action.trim() || typeof decision.summary !== 'string' || !decision.summary.trim() || !workflowStatuses.has(decision.stage) || !validDate(decision.createdAt)) errors.push(`invalid decision record at index ${index}`);
  }
  const stageOrder = [...workflowStatuses];
  const atOrAfter = (stage) => stageOrder.indexOf(state.status) >= stageOrder.indexOf(stage);
  const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
  if (atOrAfter('architecture') && (!nonempty(state.intake?.introduction) || !nonempty(state.intake?.intent) || !nonempty(state.intake?.audience))) errors.push('introduction, intent, and audience are required before architecture');
  if (atOrAfter('directions') && (state.informationArchitecture?.status !== 'approved'
    || !(state.informationArchitecture.pages?.length || state.informationArchitecture.sections?.length)
    || !nonempty(state.informationArchitecture?.primaryJourney))) errors.push('approved architecture with pages or sections and a primary journey is required before directions');
  const selectedAt = (stage) => (state.generations ?? []).some((generation) => generation.stage === stage && generation.status === 'selected');
  if (atOrAfter('references') && !selectedAt('direction')) errors.push('a selected direction is required before references');
  if (atOrAfter('variants') && (!(state.references?.acceptedSets?.length > 0) || state.references?.selectionStatus !== 'current')) errors.push('a current accepted reference set is required before variants');
  if (atOrAfter('build-path') && !selectedAt('variant')) errors.push('a selected variant is required before build path');
  if (atOrAfter('hero') && !selectedAt('build-path')) errors.push('a selected build path is required before hero work');
  if (atOrAfter('implementation') && !selectedAt('hero')) errors.push('a selected hero is required before implementation');
  if (atOrAfter('polish') && !selectedAt('implementation')) errors.push('a selected implementation is required before polish');
  if (state.status === 'complete' && (!selectedAt('final') || state.verification?.status !== 'passed')) errors.push('a selected final generation and passed verification are required before completion');
  return errors;
};

const statePaths = (projectRoot) => {
  const inspirationRoot = resolve(projectRoot, '.inspiration');
  return { inspirationRoot, state: resolve(inspirationRoot, 'state.json'), workbench: resolve(inspirationRoot, 'workbench', 'index.html'), workbenchArchive: resolve(inspirationRoot, 'workbench', 'archive'), previews: resolve(inspirationRoot, 'previews') };
};
const assertStatePaths = (projectRoot, paths) => {
  const canonicalProject = canonicalPath(projectRoot);
  assertContainedPath(paths.inspirationRoot, canonicalProject);
  for (const candidate of [paths.state, paths.workbench, paths.workbenchArchive, paths.previews]) assertContainedPath(candidate, paths.inspirationRoot);
};
const previewPath = (paths, generationId) => resolve(paths.previews, generationId, 'index.html');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const legacyPreview = (generation) => `<!doctype html>\n<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${escapeHtml(generation.id)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3ebdd;color:#171612;font:14px/1.5 ui-monospace,monospace}p{max-width:34ch;text-align:center}</style>\n<p>${escapeHtml(generation.label || generation.id)}<br>Legacy generation preserved without a rendered preview.</p></html>\n`;

const normalizeStatus = (status) => ({ direction: 'directions', reference: 'references', variant: 'variants', build: 'implementation' })[status] ?? (workflowStatuses.has(status) ? status : 'intake');
const migrateState = async (state, paths, projectRoot, catalog) => {
  if (![1, 2, 3, 4, 5].includes(state.schemaVersion)) throw new Error(`Unsupported state schema: ${state.schemaVersion}`);
  if (state.schemaVersion === currentSchemaVersion) {
    if (state.references?.selectionStatus === 'current' && state.references.catalogFingerprint !== catalog.fingerprint) {
      state.references.historicalCards ??= {};
      const priorSets = [...(state.references.acceptedSets ?? []), state.references.activeSession?.currentSet].filter(Boolean);
      for (const set of priorSets) for (const entry of [set.anchor, ...(set.supporting ?? [])]) {
        if (!entry?.id || state.references.historicalCards[entry.id]) continue;
        const current = catalog.cards.find((card) => card.id === entry.id);
        state.references.historicalCards[entry.id] = current
          ? { id: current.id, title: current.title, primaryCategory: current.primaryCategory, fingerprint: current.fingerprint, retired: false }
          : { id: entry.id, title: entry.title ?? entry.id, primaryCategory: set.category ?? 'Retired reference', fingerprint: null, retired: true };
      }
      state.references.selectionStatus = 'needs-revalidation';
      state.migrationWarnings ??= [];
      state.migrationWarnings.push('The library catalog changed. Historical selections remain visible, but the active set must be revalidated before reuse.');
      state.updatedAt = new Date().toISOString();
      return true;
    }
    return state.workbenchVersion !== currentWorkbenchVersion;
  }
  let changed = state.schemaVersion !== currentSchemaVersion;
  const previousSchemaVersion = state.schemaVersion;
  state.schemaVersion = currentSchemaVersion;
  state.projectRoot = canonicalPath(state.projectRoot ?? projectRoot);
  state.status = normalizeStatus(state.status);
  state.createdAt = validDate(state.createdAt) ? state.createdAt : new Date().toISOString();
  state.updatedAt = validDate(state.updatedAt) ? state.updatedAt : state.createdAt;
  state.intake = { introduction: '', intent: '', audience: '', materialsAndRequirements: '', ...(isRecord(state.intake) ? state.intake : {}) };
  state.informationArchitecture = { status: 'pending', pages: [], sections: [], primaryJourney: '', ...(isRecord(state.informationArchitecture) ? state.informationArchitecture : {}) };
  const legacyReferences = isRecord(state.references) ? state.references : {};
  const acceptedSets = Array.isArray(legacyReferences.acceptedSets) ? legacyReferences.acceptedSets : Array.isArray(legacyReferences.sets) ? legacyReferences.sets : [];
  const historicalCards = isRecord(legacyReferences.historicalCards) ? legacyReferences.historicalCards : {};
  for (const set of acceptedSets) for (const entry of [set?.anchor, ...(set?.supporting ?? [])]) {
    if (!entry?.id || historicalCards[entry.id]) continue;
    const card = catalog.cards.find((item) => item.id === entry.id);
    historicalCards[entry.id] = card
      ? { id: card.id, title: card.title, primaryCategory: card.primaryCategory, fingerprint: card.fingerprint, retired: false }
      : { id: entry.id, title: entry.title ?? entry.id, primaryCategory: 'Retired reference', fingerprint: null, retired: true };
  }
  state.references = {
    catalogFingerprint: catalog.fingerprint,
    selectionStatus: legacyReferences.activeSession ? 'needs-revalidation' : 'none',
    activeSession: null,
    acceptedSets,
    historicalCards,
    pinned: Array.isArray(legacyReferences.pinned) ? legacyReferences.pinned : [],
    excluded: Array.isArray(legacyReferences.excluded) ? legacyReferences.excluded : [],
    usage: isRecord(legacyReferences.usage) ? legacyReferences.usage : {},
  };
  state.generations = Array.isArray(state.generations) ? state.generations : [];
  state.decisions = (Array.isArray(state.decisions) ? state.decisions : []).map((decision) => (
    isRecord(decision) && typeof decision.action === 'string' && typeof decision.summary === 'string' && workflowStatuses.has(decision.stage) && validDate(decision.createdAt)
      ? decision
      : { action: isRecord(decision) && typeof decision.action === 'string' ? decision.action : 'legacy decision', summary: isRecord(decision) && typeof decision.summary === 'string' ? decision.summary : 'Migrated legacy workflow decision.', stage: state.status, createdAt: state.updatedAt, details: decision }
  ));
  state.heroProvider = ['codex', 'higgsfield'].includes(state.heroProvider) ? state.heroProvider : 'codex';
  state.verification = isRecord(state.verification) ? state.verification : { status: 'pending', checks: [], completedAt: null };
  state.migrationWarnings = Array.isArray(state.migrationWarnings) ? state.migrationWarnings : [];
  for (const generation of state.generations) {
    generation.label = typeof generation.label === 'string' && generation.label.trim() ? generation.label : generation.id;
    generation.category ??= null;
    generation.thesis = typeof generation.thesis === 'string' ? generation.thesis : '';
    generation.references = Array.isArray(generation.references) ? generation.references : [];
    if (generation.stage === 'direction' && !isRecord(generation.previewScope)) generation.previewScope = { kind: 'legacy-unverified' };
    generation.createdAt = validDate(generation.createdAt) ? generation.createdAt : state.updatedAt;
    generation.preview = `../previews/${generation.id}/index.html`;
    const path = previewPath(paths, generation.id);
    if (!existsSync(path)) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, legacyPreview(generation), 'utf8'); }
  }
  const originalStatus = state.status;
  const orderedStatuses = [...workflowStatuses];
  const semanticMarkers = ['required before', 'required before completion'];
  for (let index = orderedStatuses.indexOf(state.status); index >= 0; index -= 1) {
    state.status = orderedStatuses[index];
    const candidate = { ...state, workbenchVersion: currentWorkbenchVersion };
    const semanticErrors = validateState(candidate, projectRoot, catalog).filter((error) => semanticMarkers.some((marker) => error.includes(marker)));
    if (!semanticErrors.length) break;
  }
  if (state.status !== originalStatus) {
    state.migrationWarnings.push(`Schema ${previousSchemaVersion} project stage was adjusted from ${originalStatus} to ${state.status} because required approved artifacts were missing.`);
    state.decisions.push({ action: 'MIGRATION STAGE ADJUSTMENT', summary: `Preserved project history and resumed at ${state.status}.`, stage: state.status, createdAt: state.updatedAt });
  }
  if (state.workbenchVersion !== currentWorkbenchVersion) changed = true;
  return changed;
};

const atomicWriteJson = async (path, value, hooks = {}) => {
  const temporary = `${path}.writing-${process.pid}-${Date.now()}`;
  const backup = `${path}.backup-${process.pid}-${Date.now()}`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  try { await hooks.beforeReplace?.(); }
  catch (error) { await rm(temporary, { force: true }); throw error; }
  try {
    await rename(temporary, path);
  } catch (error) {
    if (!existsSync(path)) { await rm(temporary, { force: true }); throw error; }
    await rename(path, backup);
    try { await rename(temporary, path); await rm(backup, { force: true }); }
    catch (replacementError) { if (existsSync(backup)) await rename(backup, path); await rm(temporary, { force: true }); throw replacementError; }
  }
};

const ensureWorkbench = async (state, paths) => {
  const template = await readFile(templatePath, 'utf8');
  if (!existsSync(paths.workbench)) { await mkdir(dirname(paths.workbench), { recursive: true }); await cp(templatePath, paths.workbench); state.workbenchVersion = currentWorkbenchVersion; return null; }
  if (state.workbenchVersion === currentWorkbenchVersion) return null;
  const current = await readFile(paths.workbench, 'utf8');
  const managed = legacyWorkbenchHashes.has(hashText(current)) || hashText(current) === hashText(template);
  if (!managed) {
    await mkdir(paths.workbenchArchive, { recursive: true });
    const archived = resolve(paths.workbenchArchive, `custom-v${state.workbenchVersion}-${Date.now()}.html`);
    await cp(paths.workbench, archived, { force: false, errorOnExist: true });
    state.migrationWarnings ??= [];
    state.migrationWarnings.push(`Customized workbench archived at ${relative(paths.inspirationRoot, archived)} before the managed template upgrade.`);
  }
  await cp(templatePath, paths.workbench, { force: true });
  state.workbenchVersion = currentWorkbenchVersion;
  return null;
};
const assertGenerationPreview = async (paths, generation) => {
  const expected = `../previews/${generation.id}/index.html`;
  if (generation.preview !== expected) throw new Error(`generation preview must be ${expected}`);
  const path = previewPath(paths, generation.id);
  if (!existsSync(path) || !(await stat(path)).isFile()) throw new Error(`generation preview is missing: ${path}`);
  const source = await readFile(path, 'utf8');
  if (source.trim().length < 40 || !/<(?:!doctype|html|body)\b/i.test(source)) throw new Error(`generation preview is not a renderable HTML document: ${path}`);
};

const loadState = async (projectRoot, paths) => {
  assertStatePaths(projectRoot, paths);
  if (!existsSync(paths.state)) throw new Error('project state is missing; run init first');
  const catalog = loadCatalog();
  const state = await readJson(paths.state);
  const migrated = await migrateState(state, paths, projectRoot, catalog);
  const warning = await ensureWorkbench(state, paths);
  if (warning) throw new Error(warning);
  const errors = validateState(state, projectRoot, catalog);
  if (errors.length) throw new Error(errors.join('; '));
  if (migrated) await atomicWriteJson(paths.state, state);
  return state;
};

const init = async (rawRoot) => {
  const projectRoot = await assertProjectRoot(rawRoot);
  const catalog = loadCatalog();
  await mkdir(projectRoot, { recursive: true });
  const paths = statePaths(projectRoot);
  assertStatePaths(projectRoot, paths);
  await mkdir(dirname(paths.workbench), { recursive: true });
  if (!existsSync(paths.state)) await atomicWriteJson(paths.state, emptyState(projectRoot));
  const state = await readJson(paths.state);
  const migrated = await migrateState(state, paths, projectRoot, catalog);
  const warning = await ensureWorkbench(state, paths);
  if (warning) throw new Error(warning);
  const errors = validateState(state, projectRoot, catalog);
  if (errors.length) throw new Error(errors.join('; '));
  if (migrated) await atomicWriteJson(paths.state, state);
  console.log(JSON.stringify({ projectRoot, state: paths.state, workbench: paths.workbench, resumed: state.generations.length > 0, schemaVersion: state.schemaVersion }, null, 2));
};

const normalizeDecision = (record, stage) => {
  if (!isRecord(record) || typeof record.action !== 'string' || !record.action.trim() || typeof record.summary !== 'string' || !record.summary.trim()) throw new Error('decision requires nonempty action and summary');
  return { ...record, stage: record.stage ?? stage, createdAt: record.createdAt ?? new Date().toISOString() };
};
const applyEvent = async (projectRoot, paths, state, event, options = {}) => {
  if (!isRecord(event) || typeof event.type !== 'string') throw new Error('event requires type');
  const payload = event.payload;
  const catalog = loadCatalog();
  if (event.type === 'intake.updated') {
    if (!isRecord(payload)) throw new Error('intake.updated requires an object payload');
    state.intake = { ...state.intake, ...payload };
  } else if (event.type === 'architecture.updated') {
    if (!isRecord(payload)) throw new Error('architecture.updated requires an object payload');
    state.informationArchitecture = { ...state.informationArchitecture, ...payload };
  } else if (event.type === 'references.updated') {
    throw new Error('references.updated is retired; use the validated references.session-saved action');
  } else if (event.type === 'references.session-saved') {
    const { normalizeSession } = await import('./reference-selection.mjs');
    const session = normalizeSession(catalog, structuredClone(payload));
    const usage = { ...state.references.usage };
    for (const [id, count] of Object.entries(session.usage)) usage[id] = Math.max(usage[id] ?? 0, count);
    state.references = {
      ...state.references,
      catalogFingerprint: catalog.fingerprint,
      selectionStatus: 'current',
      activeSession: session,
      pinned: structuredClone(session.pinned),
      excluded: [...new Set([...state.references.excluded, ...session.excluded])],
      usage,
    };
    if (session.accepted && !state.references.acceptedSets.some((set) => set.signature === session.currentSet.signature)) {
      state.references.acceptedSets.push(structuredClone(session.currentSet));
    }
    const sessionSets = [session.currentSet, ...session.acceptedSets, ...session.history];
    for (const set of sessionSets) for (const entry of [set.anchor, ...set.supporting]) {
      const card = catalog.cards.find((item) => item.id === entry.id);
      if (card) state.references.historicalCards[card.id] = { id: card.id, title: card.title, primaryCategory: card.primaryCategory, fingerprint: card.fingerprint, retired: false };
    }
  } else if (event.type === 'workflow.status-changed') state.status = payload?.status;
  else if (event.type === 'hero.provider-selected') state.heroProvider = payload?.provider;
  else if (event.type === 'verification.completed') {
    if (!isRecord(payload) || !Array.isArray(payload.checks) || !payload.checks.length || payload.checks.some((item) => typeof item !== 'string' || !item.trim())) throw new Error('verification.completed requires nonempty checks');
    state.verification = { status: 'passed', checks: [...new Set(payload.checks)], completedAt: new Date().toISOString() };
  }
  else if (event.type === 'generation.appended') {
    if (payload?.stage === 'direction') {
      const scopeErrors = validateDirectionPreviewScope(payload.previewScope, `direction ${payload.id ?? '(missing)'}`, false);
      if (scopeErrors.length) throw new Error(scopeErrors.join('; '));
    }
    await assertGenerationPreview(paths, payload);
    state.generations.push(payload);
  } else if (event.type === 'generation.status-changed') {
    const generation = state.generations.find((item) => item.id === payload?.id);
    if (!generation) throw new Error(`generation not found: ${payload?.id ?? '(missing)'}`);
    generation.status = payload.status;
  } else if (event.type === 'decision.recorded') state.decisions.push(normalizeDecision(payload, state.status));
  else throw new Error(`Unknown state event: ${event.type}`);
  state.updatedAt = new Date().toISOString();
  const errors = validateState(state, projectRoot, catalog);
  if (errors.length) throw new Error(errors.join('; '));
  await atomicWriteJson(paths.state, state);
  if (!options.quiet) console.log(`Applied state event: ${event.type}`);
};

const applyFromPath = async (rawRoot, eventPath) => {
  const projectRoot = await assertProjectRoot(rawRoot);
  const paths = statePaths(projectRoot);
  const state = await loadState(projectRoot, paths);
  await applyEvent(projectRoot, paths, state, await readJson(resolve(eventPath)));
};
const appendCompatibility = async (rawRoot, recordPath, kind) => {
  const record = await readJson(resolve(recordPath));
  const event = kind === 'generation' ? { type: 'generation.appended', payload: record } : { type: 'decision.recorded', payload: record };
  const projectRoot = await assertProjectRoot(rawRoot);
  const paths = statePaths(projectRoot);
  const state = await loadState(projectRoot, paths);
  await applyEvent(projectRoot, paths, state, event);
};
const validate = async (rawRoot) => {
  const projectRoot = await assertProjectRoot(rawRoot);
  const paths = statePaths(projectRoot);
  const state = await loadState(projectRoot, paths);
  for (const generation of state.generations) await assertGenerationPreview(paths, generation);
  console.log(`Valid Design Taste Injection state: ${state.generations.length} generations, ${state.decisions.length} decisions.`);
};
const readProjectState = async (rawRoot) => {
  const projectRoot = await assertProjectRoot(rawRoot);
  return loadState(projectRoot, statePaths(projectRoot));
};
const saveReferenceSession = async (rawRoot, session) => {
  const projectRoot = await assertProjectRoot(rawRoot);
  const paths = statePaths(projectRoot);
  const state = await loadState(projectRoot, paths);
  await applyEvent(projectRoot, paths, state, { type: 'references.session-saved', payload: session }, { quiet: true });
};
const main = async () => {
  const [command = 'help', rawRoot = process.cwd(), recordPath] = process.argv.slice(2);
  if (command === 'init') return init(rawRoot);
  if (command === 'validate') return validate(rawRoot);
  if (command === 'apply-event' && recordPath) return applyFromPath(rawRoot, recordPath);
  if (command === 'append-generation' && recordPath) return appendCompatibility(rawRoot, recordPath, 'generation');
  if (command === 'append-decision' && recordPath) return appendCompatibility(rawRoot, recordPath, 'decision');
  if (command === 'get') return console.log(JSON.stringify(await readProjectState(rawRoot), null, 2));
  console.log('Usage: project-state.mjs init|validate|get <project-root> | apply-event|append-generation|append-decision <project-root> <record.json>');
};
const isDirectExecution = () => Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirectExecution()) main().catch((error) => fail(error.message));

export { applyEvent, assertProjectRoot, atomicWriteJson, emptyState, migrateState, readProjectState, saveReferenceSession, validateState };
