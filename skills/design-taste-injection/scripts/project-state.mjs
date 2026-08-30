#!/usr/bin/env node
import { cp, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertContainedPath, assertProjectRootPath, canonicalPath } from './path-safety.mjs';
import { renderDesignReviewHtml } from './design-review.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(scriptDir, '..');
const templatePath = resolve(skillRoot, 'assets', 'workbench-template.html');
const currentSchemaVersion = 11;
const currentWorkbenchVersion = 8;
const legacyWorkbenchHashes = new Set([
  '90d7b70ac826a8955583e5f09d5ccb198e1d2a85e27e49b07391e23255d91b5d',
  '5304288a5c7048ebae565f16489c278a194b9cac16184a24090fddd0e70ebf0a',
  '548eabeda7755bdf4db5d20cec87c1f262ee2047f352de3b40bc899b8ad94506',
  'bfbd3cdcc00173f531a66c82b796009253dcb9a4bffc734355afe7e61c9bf388',
  '3902df7b397887af5682183e161ab08896cea3ba1b5e87d591d531b69a7bd598',
]);
const workflowStatuses = new Set(['intake', 'architecture', 'directions', 'references', 'variants', 'build-path', 'hero', 'implementation', 'polish', 'complete']);
const generationStages = new Set(['direction', 'variant', 'build-path', 'hero', 'implementation', 'final']);
const generationStatuses = new Set(['candidate', 'selected', 'rejected', 'superseded']);
const architectureStatuses = new Set(['pending', 'candidate', 'approved']);
const focusedPreviewSections = ['hero', 'opening-module'];
const variantOrdinals = new Set(['A', 'B', 'C']);
const buildPaths = new Set(['original', 'clone-remix', 'inspired-rebuild']);
const imageRecipeKinds = new Set(['primary', 'supporting', 'none']);
const heroStates = new Set(['H0-retained', 'H1', 'H2', 'H3', 'H4']);
const tweakBarStatuses = new Set(['pending', 'active', 'applied', 'production-excluded']);
const tweakableDecisionKeys = new Set(['typography', 'lineLength', 'spacing', 'bodyDensity', 'paletteRoles', 'accent', 'surfaces', 'texture', 'borders', 'radius', 'shadows', 'motion']);
const variantDifferenceAxes = new Set(['hierarchy', 'body-format', 'navigation', 'rhythm', 'density', 'composition']);
const sha256Pattern = /^[a-f0-9]{64}$/;

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
  return assertProjectRootPath(projectRoot, skillRoot, await libraryRoot());
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
      activeBatch: null,
      acceptedSets: [],
      historicalCards: {},
      pinned: [],
      excluded: [],
    },
    visualControl: {
      evidence: {},
      isolation: { mode: null, recordedAt: null },
      isolationRuns: {},
      leakScans: [],
      identityScans: [],
      anchorContract: null,
      tweakBar: { status: 'pending', records: [] },
      routeConformance: [],
      designGate: { status: 'pending', homepageGenerationId: null, densePageGenerationId: null, decidedAt: null },
    },
    generations: [],
    decisions: [],
    heroProvider: 'codex',
    verification: { status: 'pending', checks: [], completedAt: null },
    migrationWarnings: [],
  };
};

const validId = (value) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value);
const validateFingerprint = (value) => typeof value === 'string' && sha256Pattern.test(value);
const validateTweakableDecisions = (value) => {
  if (!isRecord(value) || !Object.keys(value).length) return false;
  return Object.entries(value).every(([key, options]) => tweakableDecisionKeys.has(key)
    && ((Array.isArray(options) && options.length > 0 && options.every((item) => ['string', 'number', 'boolean'].includes(typeof item)))
      || (isRecord(options) && Number.isFinite(options.min) && Number.isFinite(options.max) && options.max >= options.min)));
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
  if (set.supporting.length !== 0) errors.push(`${label} must contain no supporting cards`);
  if (catalog) for (const item of all) {
    const card = catalog.cards.find((entry) => entry.id === item?.id);
    if (card && item.role !== 'anchor' && !card.workflow.roles.includes(item.role)) errors.push(`${label} assigns an unsupported role to ${item.id}`);
  }
  if (typeof set.signature === 'string') {
    const expected = set.anchor.id;
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

const validateVariantPreviewScope = (scope, label) => {
  if (!isRecord(scope)
    || scope.kind !== 'complete-homepage-variant'
    || scope.pageCount !== 1
    || scope.completeHomepage !== true
    || scope.includesDensePage !== false
    || !['empty-flat', 'not-applicable'].includes(scope.futureImageSlot)) {
    return [`${label} must be one complete homepage, contain no dense page, and declare its future-image slot`];
  }
  return [];
};

const validateGenerationLineage = (generation, catalog = null) => {
  const errors = [];
  if (generation.lineageStatus === 'legacy-unverified') return errors;
  if (!['sealed-runner', 'explicit-degraded', 'parent-project-codex'].includes(generation.executionHost)) errors.push(`executionHost is invalid for ${generation.id}`);
  if (generation.stage === 'direction') {
    if (!['sealed-runner', 'explicit-degraded'].includes(generation.executionHost)) errors.push(`direction ${generation.id} must use the direction-only runner or explicit degraded execution`);
    if (generation.parent !== null || generation.directionId !== generation.id) errors.push(`direction ${generation.id} requires null parent and matching directionId`);
  }
  if (generation.stage === 'variant') {
    if (generation.executionHost !== 'parent-project-codex') errors.push(`variant ${generation.id} must be generated by parent/project Codex`);
    if (!validId(generation.parent) || !validId(generation.batchId) || !variantOrdinals.has(generation.variantOrdinal)) errors.push(`variant ${generation.id} requires parent, batchId, and ordinal A, B, or C`);
    if (!validateFingerprint(generation.batchPlanFingerprint)) errors.push(`variant ${generation.id} requires a batch-plan fingerprint`);
    if (!Array.isArray(generation.differenceAxes) || generation.differenceAxes.length < 3 || new Set(generation.differenceAxes).size !== generation.differenceAxes.length || generation.differenceAxes.some((axis) => !variantDifferenceAxes.has(axis))) errors.push(`variant ${generation.id} requires at least three unique approved difference axes`);
    errors.push(...validateVariantPreviewScope(generation.previewScope, `variant ${generation.id}`));
  }
  if (generation.stage === 'build-path') {
    if (generation.executionHost !== 'parent-project-codex') errors.push(`build path ${generation.id} must be generated by parent/project Codex`);
    if (!validId(generation.parent) || !buildPaths.has(generation.buildPath) || generation.heroState !== 'H0') errors.push(`build path ${generation.id} requires selected variant parent, eligible buildPath, and H0 state`);
    if (!imageRecipeKinds.has(generation.recipeKind) || !validateFingerprint(generation.contractFingerprint) || !validateFingerprint(generation.layoutFingerprint)) errors.push(`build path ${generation.id} requires recipe, contract, and layout fingerprints`);
    if (!isRecord(generation.previewScope) || generation.previewScope.kind !== 'build-path-shell' || generation.previewScope.completeHomepage !== true || generation.previewScope.includesDensePage !== false) errors.push(`build path ${generation.id} must be a complete homepage shell without a dense page`);
    if (generation.buildPath === 'clone-remix' && (!isRecord(generation.clonePreflight) || generation.clonePreflight.status !== 'passed' || typeof generation.clonePreflight.record !== 'string' || !generation.clonePreflight.record.trim())) errors.push(`clone-remix ${generation.id} requires a passed clone preflight record`);
    if (generation.buildPath !== 'clone-remix' && generation.clonePreflight != null) errors.push(`non-clone build path ${generation.id} cannot carry clone preflight evidence`);
    const anchor = generation.references?.find((item) => item?.role === 'anchor');
    const card = catalog?.cards?.find((item) => item.id === anchor?.id);
    if (card && generation.recipeKind !== card.imageRecipe.kind) errors.push(`build path ${generation.id} does not match card ${card.id} image recipe`);
    if (card && generation.buildPath === 'clone-remix' && card.workflow.cloneMode !== 'verified-clone-remix') errors.push(`card ${card.id} is not eligible for Clone Remix`);
    if (card && generation.buildPath === 'inspired-rebuild' && card.workflow.cloneMode !== 'inspired-rebuild') errors.push(`card ${card.id} is not eligible for Inspired Rebuild`);
  }
  if (generation.stage === 'hero') {
    if (generation.executionHost !== 'parent-project-codex' || !validId(generation.parent) || !heroStates.has(generation.heroState) || !imageRecipeKinds.has(generation.recipeKind) || !validateFingerprint(generation.contractFingerprint) || !validateFingerprint(generation.layoutFingerprint)) errors.push(`hero ${generation.id} has invalid parent/project lineage`);
    if (generation.heroState === 'H0-retained') {
      if (generation.recipeKind !== 'none' || generation.provider !== 'none' || generation.heroBatchId !== null || generation.assetSha256 !== null || generation.assetReceipt !== null) errors.push(`retained H0 ${generation.id} must be a kind:none route without generated assets`);
    } else {
      if (!['primary', 'supporting'].includes(generation.recipeKind) || !validId(generation.heroBatchId) || !['codex', 'higgsfield'].includes(generation.provider) || !validateFingerprint(generation.recipeFingerprint) || !validateFingerprint(generation.assetSha256) || typeof generation.assetReceipt !== 'string' || !generation.assetReceipt.trim()) errors.push(`generated hero ${generation.id} requires a complete image-generation receipt`);
    }
  }
  if (['implementation', 'final'].includes(generation.stage) && generation.executionHost !== 'parent-project-codex') errors.push(`${generation.stage} ${generation.id} must be generated by parent/project Codex`);
  return errors;
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
    if (state.references.activeBatch !== null) errors.push(...validateReferenceBatch(state.references.activeBatch, 'references.activeBatch', catalog));
    if (!Array.isArray(state.references.acceptedSets)) errors.push('references.acceptedSets must be an array');
    else state.references.acceptedSets.forEach((set, index) => errors.push(...validateReferenceSet(set, `references.acceptedSets[${index}]`, catalog)));
    if (!isRecord(state.references.historicalCards)) errors.push('references.historicalCards must be an object');
    else for (const [id, card] of Object.entries(state.references.historicalCards)) {
      if (!isRecord(card) || card.id !== id || typeof card.title !== 'string' || typeof card.primaryCategory !== 'string') errors.push(`historical card snapshot is invalid: ${id}`);
    }
    if (!Array.isArray(state.references.pinned)) errors.push('references.pinned must be an array');
    else {
      const keys = state.references.pinned.map((pin) => `${pin?.slotId}\0${pin?.id}`);
      if (new Set(keys).size !== keys.length) errors.push('references.pinned contains duplicates');
      if (state.references.pinned.some((pin) => !isRecord(pin) || typeof pin.slotId !== 'string' || typeof pin.id !== 'string' || pin.role !== 'anchor')) errors.push('references.pinned records need slotId, id, and anchor role');
      if (catalog && state.references.selectionStatus === 'current') for (const pin of state.references.pinned) {
        if (!catalogIds.has(pin.id)) errors.push(`references.pinned contains unknown card: ${pin.id}`);
        if (pin.role !== 'anchor') errors.push(`references.pinned contains unsupported role: ${pin.role}`);
      }
      if (state.references.activeBatch && JSON.stringify(state.references.pinned) !== JSON.stringify(batchPins(state.references.activeBatch))) errors.push('references.pinned must mirror active batch pins');
    }
    if (!Array.isArray(state.references.excluded) || state.references.excluded.some((id) => typeof id !== 'string') || new Set(state.references.excluded).size !== state.references.excluded.length) errors.push('references.excluded must contain unique strings');
    if (Array.isArray(state.references.excluded) && Array.isArray(state.references.pinned)) {
      const excluded = new Set(state.references.excluded);
      for (const pin of state.references.pinned) if (excluded.has(pin.id)) errors.push(`reference cannot be pinned and excluded: ${pin.id}`);
    }
    if (catalog && state.references.selectionStatus === 'current') {
      if (state.references.catalogFingerprint !== catalog.fingerprint) errors.push('active references require revalidation against the current catalog');
      if (!state.references.activeBatch) errors.push('current references require an active batch');
      else if (state.references.activeBatch.catalogFingerprint !== catalog.fingerprint) errors.push('active batch catalog fingerprint is stale');
      const activeIds = state.references.activeBatch ? state.references.activeBatch.items.flatMap((item) => [item.session.currentSet?.anchor?.id, ...(item.session.currentSet?.supporting ?? []).map((entry) => entry.id)]) : [];
      for (const id of activeIds.filter(Boolean)) if (!catalogIds.has(id)) errors.push(`active session contains unknown card: ${id}`);
      for (const id of state.references.excluded ?? []) if (!catalogIds.has(id)) errors.push(`references.excluded contains unknown card: ${id}`);
      if (state.references.activeBatch && batchExcluded(state.references.activeBatch).some((id) => !state.references.excluded.includes(id))) errors.push('references.excluded must include active batch exclusions');
    }
    if (catalog) for (const set of state.references.acceptedSets ?? []) for (const item of [set.anchor, ...set.supporting]) {
      if (!catalogIds.has(item.id) && !state.references.historicalCards?.[item.id]) errors.push(`accepted reference lacks a current card or historical snapshot: ${item.id}`);
    }
  }
  if (!isRecord(state.visualControl)) errors.push('visualControl must be an object');
  else {
    if (!isRecord(state.visualControl.evidence)) errors.push('visualControl.evidence must be an object');
    if (!isRecord(state.visualControl.isolation) || ![null, 'subscription-ephemeral', 'sealed-api', 'degraded', 'legacy-unverified'].includes(state.visualControl.isolation.mode)) errors.push('visualControl.isolation is invalid');
    if (!isRecord(state.visualControl.isolationRuns)) errors.push('visualControl.isolationRuns must be an object');
    else for (const [generationId, run] of Object.entries(state.visualControl.isolationRuns)) {
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(generationId) || !isRecord(run) || run.generationId !== generationId || !['subscription-ephemeral', 'sealed-api', 'degraded', 'legacy-unverified'].includes(run.mode) || !validDate(run.recordedAt)) errors.push(`visualControl.isolationRuns contains an invalid record: ${generationId}`);
    }
    if (!Array.isArray(state.visualControl.leakScans)) errors.push('visualControl.leakScans must be an array');
    if (!Array.isArray(state.visualControl.identityScans)) errors.push('visualControl.identityScans must be an array');
    if (state.visualControl.anchorContract !== null && (!isRecord(state.visualControl.anchorContract) || typeof state.visualControl.anchorContract.cardId !== 'string' || !validateFingerprint(state.visualControl.anchorContract.fingerprint) || !validateTweakableDecisions(state.visualControl.anchorContract.tweakableDecisions) || !validDate(state.visualControl.anchorContract.frozenAt))) errors.push('visualControl.anchorContract is invalid or lacks contract-constrained tweakableDecisions');
    if (!isRecord(state.visualControl.tweakBar) || !tweakBarStatuses.has(state.visualControl.tweakBar.status) || !Array.isArray(state.visualControl.tweakBar.records)) errors.push('visualControl.tweakBar is invalid');
    else {
      const records = state.visualControl.tweakBar.records;
      const expectedOrder = ['active', 'applied', 'production-excluded'];
      if (records.some((record, index) => !isRecord(record) || record.status !== expectedOrder[index] || !validId(record.generationId) || !validateFingerprint(record.contractFingerprint) || !validDate(record.recordedAt))) errors.push('visualControl.tweakBar records must follow active, applied, production-excluded order');
      if (records.length !== expectedOrder.indexOf(state.visualControl.tweakBar.status) + 1 && state.visualControl.tweakBar.status !== 'pending') errors.push('visualControl.tweakBar status does not match its lifecycle records');
      if (state.visualControl.tweakBar.status === 'pending' && records.length) errors.push('pending tweak bar cannot contain lifecycle records');
      const active = records[0]; const applied = records[1]; const excluded = records[2];
      if (active && (!Array.isArray(active.controls) || !active.controls.length || active.controls.some((key) => !tweakableDecisionKeys.has(key)))) errors.push('active tweak bar requires approved frozen-contract controls');
      if (applied && !validateFingerprint(applied.valuesFingerprint)) errors.push('applied tweak bar requires a values fingerprint');
      if (excluded && (!validateFingerprint(excluded.productionBuildFingerprint) || !Array.isArray(excluded.markersFound) || excluded.markersFound.length)) errors.push('production-excluded tweak bar requires a clean production-build fingerprint');
    }
    if (!Array.isArray(state.visualControl.routeConformance)) errors.push('visualControl.routeConformance must be an array');
    if (!isRecord(state.visualControl.designGate) || !['pending', 'passed', 'failed'].includes(state.visualControl.designGate.status)) errors.push('visualControl.designGate is invalid');
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
    errors.push(...validateGenerationLineage(generation, catalog));
    if (!Array.isArray(generation.references)) errors.push(`references are required for ${generation.id}`);
    else {
      const referenceIds = generation.references.map((item) => item?.id);
      if (new Set(referenceIds).size !== referenceIds.length) errors.push(`duplicate references for ${generation.id}`);
      if (generation.stage === 'direction'
        && generation.previewScope?.kind !== 'legacy-unverified'
        && (generation.references.length !== 1 || generation.references[0]?.role !== 'anchor')) errors.push(`direction ${generation.id} must contain exactly one anchor and no supports`);
      else if (generation.references.filter((item) => item?.role === 'anchor').length > 1) errors.push(`multiple anchor references for ${generation.id}`);
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
  const generationsById = new Map((state.generations ?? []).map((generation) => [generation.id, generation]));
  for (const generation of state.generations ?? []) {
    if (generation?.parent && !ids.has(generation.parent)) { errors.push(`missing parent ${generation.parent} for ${generation.id}`); continue; }
    if (generation.lineageStatus === 'legacy-unverified' || !generation.parent) continue;
    const parent = generationsById.get(generation.parent);
    const expectedParentStage = { variant: 'direction', 'build-path': 'variant', hero: 'build-path', implementation: 'hero', final: 'implementation' }[generation.stage];
    if (expectedParentStage && parent?.stage !== expectedParentStage) errors.push(`${generation.id} requires a ${expectedParentStage} parent`);
    if (expectedParentStage && parent?.status !== 'selected') errors.push(`${generation.id} requires its parent to be selected`);
    if (generation.stage === 'build-path' && generation.contractFingerprint !== state.visualControl?.anchorContract?.fingerprint) errors.push(`${generation.id} does not match the frozen anchor contract`);
    if (generation.stage === 'hero' && (generation.contractFingerprint !== parent?.contractFingerprint || generation.layoutFingerprint !== parent?.layoutFingerprint || generation.recipeKind !== parent?.recipeKind)) errors.push(`${generation.id} changed build-path contract, layout, or recipe lineage`);
  }
  const tweakStageByStatus = { active: 'hero', applied: 'implementation', 'production-excluded': 'final' };
  for (const record of state.visualControl?.tweakBar?.records ?? []) if (generationsById.get(record.generationId)?.stage !== tweakStageByStatus[record.status]) errors.push(`tweak-bar ${record.status} record requires a ${tweakStageByStatus[record.status]} generation`);
  if (state.visualControl?.designGate?.status !== 'pending') {
    if (generationsById.get(state.visualControl.designGate.homepageGenerationId)?.stage !== 'implementation' || generationsById.get(state.visualControl.designGate.densePageGenerationId)?.stage !== 'implementation') errors.push('design gate requires homepage and dense-page implementation generations');
  }
  for (const stage of generationStages) {
    const selected = (state.generations ?? []).filter((generation) => generation.stage === stage && generation.status === 'selected');
    if (selected.length > 1) errors.push(`multiple selected ${stage} generations are not allowed`);
  }
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
  const selectedGeneration = (stage) => (state.generations ?? []).find((generation) => generation.stage === stage && generation.status === 'selected');
  const completeVariantBatch = (variant) => {
    if (!variant || variant.lineageStatus === 'legacy-unverified') return false;
    const batch = (state.generations ?? []).filter((generation) => generation.stage === 'variant' && generation.parent === variant.parent && generation.batchId === variant.batchId);
    return batch.length === 3
      && new Set(batch.map((generation) => generation.variantOrdinal)).size === 3
      && [...variantOrdinals].every((ordinal) => batch.some((generation) => generation.variantOrdinal === ordinal))
      && batch.every((generation) => generation.batchPlanFingerprint === variant.batchPlanFingerprint)
      && new Set(batch.map((generation) => JSON.stringify([...generation.differenceAxes].sort()))).size === 3;
  };
  const completeHeroBatch = (hero) => {
    if (!hero || hero.lineageStatus === 'legacy-unverified') return false;
    if (hero.heroState === 'H0-retained') return hero.recipeKind === 'none';
    const batch = (state.generations ?? []).filter((generation) => generation.stage === 'hero' && generation.parent === hero.parent && generation.heroBatchId === hero.heroBatchId);
    return batch.length === 4
      && ['H1', 'H2', 'H3', 'H4'].every((heroState) => batch.some((generation) => generation.heroState === heroState))
      && batch.every((generation) => generation.recipeFingerprint === hero.recipeFingerprint && generation.layoutFingerprint === hero.layoutFingerprint && generation.provider === hero.provider);
  };
  if (atOrAfter('references') && !selectedAt('direction')) errors.push('a selected direction is required before references');
  if (atOrAfter('references')) {
    const direction = selectedGeneration('direction');
    if (direction?.lineageStatus !== 'legacy-unverified' && !state.visualControl?.isolationRuns?.[direction?.id]) errors.push('direction execution provenance is required before references');
  }
  if (atOrAfter('variants') && (!(state.references?.acceptedSets?.length > 0) || state.references?.selectionStatus !== 'current' || state.references?.activeBatch?.accepted !== true)) errors.push('a current fully accepted reference batch is required before variants');
  if (atOrAfter('variants') && state.references?.activeBatch?.items.some((item) => item.identityQaStatus === 'required')) errors.push('all required custom-card identity QA checkpoints must pass before variants');
  if (atOrAfter('variants') && !state.visualControl?.anchorContract) errors.push('a frozen anchor contract is required before variants');
  if (atOrAfter('build-path') && (!selectedAt('variant') || !completeVariantBatch(selectedGeneration('variant')))) errors.push('a selected variant from a complete three-variant batch is required before build path');
  if (atOrAfter('hero') && !selectedAt('build-path')) errors.push('a selected build path is required before hero work');
  if (atOrAfter('implementation') && (!selectedAt('hero') || !completeHeroBatch(selectedGeneration('hero')))) errors.push('a selected hero from a complete four-image batch, or reviewed kind:none H0, is required before implementation');
  if (atOrAfter('implementation') && state.visualControl?.tweakBar?.status === 'pending') errors.push('an active contract-constrained tweak bar is required before implementation');
  if (atOrAfter('polish') && (!selectedAt('implementation') || !['applied', 'production-excluded'].includes(state.visualControl?.tweakBar?.status) || state.visualControl?.designGate?.status !== 'passed')) errors.push('a selected implementation, applied tweak values, and passed homepage/dense-page gate are required before polish');
  if (state.status === 'complete' && (!selectedAt('final') || state.verification?.status !== 'passed' || state.visualControl?.tweakBar?.status !== 'production-excluded')) errors.push('a selected final generation, clean production tweak-bar exclusion, and passed verification are required before completion');
  return errors;
};

const statePaths = (projectRoot) => {
  const inspirationRoot = resolve(projectRoot, '.inspiration');
  return { inspirationRoot, state: resolve(inspirationRoot, 'state.json'), designReview: resolve(inspirationRoot, 'Design Review.html'), workbench: resolve(inspirationRoot, 'workbench', 'index.html'), workbenchArchive: resolve(inspirationRoot, 'workbench', 'archive'), previews: resolve(inspirationRoot, 'previews') };
};
const assertStatePaths = (projectRoot, paths) => {
  const canonicalProject = canonicalPath(projectRoot);
  assertContainedPath(paths.inspirationRoot, canonicalProject);
  for (const candidate of [paths.state, paths.designReview, paths.workbench, paths.workbenchArchive, paths.previews]) assertContainedPath(candidate, paths.inspirationRoot);
};
const previewPath = (paths, generationId) => resolve(paths.previews, generationId, 'index.html');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const legacyPreview = (generation) => `<!doctype html>\n<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${escapeHtml(generation.id)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3ebdd;color:#171612;font:14px/1.5 ui-monospace,monospace}p{max-width:34ch;text-align:center}</style>\n<p>${escapeHtml(generation.label || generation.id)}<br>Legacy generation preserved without a rendered preview.</p></html>\n`;

const normalizeStatus = (status) => ({ direction: 'directions', reference: 'references', variant: 'variants', build: 'implementation' })[status] ?? (workflowStatuses.has(status) ? status : 'intake');
const migrateState = async (state, paths, projectRoot, catalog) => {
  if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(state.schemaVersion)) throw new Error(`Unsupported state schema: ${state.schemaVersion}`);
  if (state.schemaVersion === currentSchemaVersion) {
    if (state.references?.selectionStatus === 'current' && state.references.catalogFingerprint !== catalog.fingerprint) {
      state.references.historicalCards ??= {};
      const priorSets = [...(state.references.acceptedSets ?? []), ...(state.references.activeBatch?.items ?? []).map((item) => item.session?.currentSet)].filter(Boolean);
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
  if (state.schemaVersion === 10) {
    const priorSession = state.references?.activeSession;
    state.schemaVersion = currentSchemaVersion;
    state.migrationWarnings = Array.isArray(state.migrationWarnings) ? state.migrationWarnings : [];
    state.references = isRecord(state.references) ? state.references : {};
    state.references.activeBatch = priorSession ? batchFromSession(priorSession, state) : null;
    delete state.references.activeSession;
    state.references.pinned = state.references.activeBatch ? batchPins(state.references.activeBatch) : [];
    state.references.excluded = [...new Set([...(state.references.excluded ?? []), ...batchExcluded(state.references.activeBatch)])];
    if (priorSession) state.migrationWarnings.push('The schema-v10 active reference session was preserved as a one-item review batch.');
    if (state.references.selectionStatus === 'current' && state.references.catalogFingerprint !== catalog.fingerprint) {
      state.references.selectionStatus = 'needs-revalidation';
      state.migrationWarnings.push('The library catalog changed. Historical selections remain visible, but the active batch must be revalidated before reuse.');
    }
    state.updatedAt = new Date().toISOString();
    return true;
  }
  if (state.schemaVersion === 9) {
    const previousSchemaVersion = state.schemaVersion;
    state.schemaVersion = currentSchemaVersion;
    state.migrationWarnings = Array.isArray(state.migrationWarnings) ? state.migrationWarnings : [];
    state.visualControl = isRecord(state.visualControl) ? state.visualControl : {};
    state.visualControl.tweakBar = isRecord(state.visualControl.tweakBar) ? state.visualControl.tweakBar : { status: 'pending', records: [] };
    if (!isRecord(state.visualControl.isolationRuns)) {
      const priorIsolation = isRecord(state.visualControl.isolation) ? state.visualControl.isolation : { mode: null };
      const priorGenerationId = validId(priorIsolation.generationId) ? priorIsolation.generationId : [...(state.generations ?? [])].reverse().find((generation) => validId(generation?.id))?.id;
      state.visualControl.isolationRuns = priorIsolation.mode && priorGenerationId ? { [priorGenerationId]: { ...priorIsolation, generationId: priorGenerationId, recordedAt: priorIsolation.recordedAt ?? state.updatedAt } } : {};
    }
    if (isRecord(state.visualControl.anchorContract) && !validateTweakableDecisions(state.visualControl.anchorContract.tweakableDecisions)) {
      state.visualControl.legacyAnchorContract = state.visualControl.anchorContract;
      state.visualControl.anchorContract = null;
      state.migrationWarnings.push('The prior anchor contract was preserved as legacyAnchorContract. Freeze a schema-v10 contract with tweakable decisions before creating variants.');
    }
    state.generations = Array.isArray(state.generations) ? state.generations : [];
    for (const generation of state.generations) generation.lineageStatus ??= 'legacy-unverified';
    const priorSession = state.references?.activeSession;
    state.references = isRecord(state.references) ? state.references : {};
    state.references.activeBatch = priorSession ? batchFromSession(priorSession, state) : null;
    delete state.references.activeSession;
    state.references.pinned = state.references.activeBatch ? batchPins(state.references.activeBatch) : [];
    state.references.excluded = [...new Set([...(state.references.excluded ?? []), ...batchExcluded(state.references.activeBatch)])];
    if (state.references?.selectionStatus === 'current' && state.references.catalogFingerprint !== catalog.fingerprint) {
      state.references.selectionStatus = 'needs-revalidation';
      state.migrationWarnings.push('The library catalog changed. Historical selections remain visible, but the active set must be revalidated before reuse.');
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
      state.migrationWarnings.push(`Schema ${previousSchemaVersion} project stage was adjusted from ${originalStatus} to ${state.status} because required current artifacts were missing.`);
      state.decisions.push({ action: 'MIGRATION STAGE ADJUSTMENT', summary: `Preserved project history and resumed at ${state.status}.`, stage: state.status, createdAt: state.updatedAt });
    }
    state.updatedAt = new Date().toISOString();
    return true;
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
  const legacyAcceptedSets = Array.isArray(legacyReferences.acceptedSets) ? legacyReferences.acceptedSets : Array.isArray(legacyReferences.sets) ? legacyReferences.sets : [];
  const acceptedSets = legacyAcceptedSets.filter((set) => set?.anchor?.id).map((set) => ({
    ...set,
    fitMode: 'exploratory',
    anchorFit: 'exact',
    supporting: [],
    score: set.anchor.score ?? set.score ?? 0,
    signature: set.anchor.id,
  }));
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
    activeBatch: null,
    acceptedSets,
    historicalCards,
    pinned: [],
    excluded: Array.isArray(legacyReferences.excluded) ? legacyReferences.excluded : [],
  };
  const priorIsolation = isRecord(state.visualControl?.isolation) ? state.visualControl.isolation : { mode: null, recordedAt: null };
  const migratedIsolation = ['fresh-agent', 'payload-only'].includes(priorIsolation.mode)
    ? { mode: 'legacy-unverified', legacyMode: priorIsolation.mode, recordedAt: priorIsolation.recordedAt ?? state.updatedAt }
    : priorIsolation;
  const priorGenerationId = /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(migratedIsolation.generationId ?? '')
    ? migratedIsolation.generationId
    : [...(Array.isArray(state.generations) ? state.generations : [])].reverse().find((generation) => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(generation?.id ?? ''))?.id ?? 'legacy-unassigned';
  const migratedIsolationRun = migratedIsolation.mode ? { ...migratedIsolation, generationId: priorGenerationId, recordedAt: migratedIsolation.recordedAt ?? state.updatedAt } : null;
  state.visualControl = {
    evidence: isRecord(state.visualControl?.evidence) ? state.visualControl.evidence : {},
    isolation: migratedIsolationRun ?? { mode: null, recordedAt: null },
    isolationRuns: isRecord(state.visualControl?.isolationRuns)
      ? state.visualControl.isolationRuns
      : migratedIsolationRun ? { [priorGenerationId]: migratedIsolationRun } : {},
    leakScans: Array.isArray(state.visualControl?.leakScans) ? state.visualControl.leakScans : [],
    identityScans: Array.isArray(state.visualControl?.identityScans) ? state.visualControl.identityScans : [],
    anchorContract: isRecord(state.visualControl?.anchorContract) ? state.visualControl.anchorContract : null,
    tweakBar: isRecord(state.visualControl?.tweakBar) ? state.visualControl.tweakBar : { status: 'pending', records: [] },
    routeConformance: Array.isArray(state.visualControl?.routeConformance) ? state.visualControl.routeConformance : [],
    designGate: isRecord(state.visualControl?.designGate) ? state.visualControl.designGate : { status: 'pending', homepageGenerationId: null, densePageGenerationId: null, decidedAt: null },
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
  if (isRecord(state.visualControl.anchorContract) && !validateTweakableDecisions(state.visualControl.anchorContract.tweakableDecisions)) {
    state.visualControl.legacyAnchorContract = state.visualControl.anchorContract;
    state.visualControl.anchorContract = null;
    state.migrationWarnings.push('The prior anchor contract was preserved as legacyAnchorContract. Freeze a schema-v10 contract with tweakable decisions before creating variants.');
  }
  for (const generation of state.generations) {
    generation.label = typeof generation.label === 'string' && generation.label.trim() ? generation.label : generation.id;
    generation.category ??= null;
    generation.thesis = typeof generation.thesis === 'string' ? generation.thesis : '';
    generation.references = Array.isArray(generation.references) ? generation.references : [];
    if (generation.stage === 'direction' && !isRecord(generation.previewScope)) generation.previewScope = { kind: 'legacy-unverified' };
    generation.lineageStatus ??= 'legacy-unverified';
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

const atomicWriteText = async (path, value) => {
  const temporary = `${path}.writing-${process.pid}-${Date.now()}`;
  const backup = `${path}.backup-${process.pid}-${Date.now()}`;
  await writeFile(temporary, value, 'utf8');
  try {
    await rename(temporary, path);
  } catch (error) {
    if (!existsSync(path)) { await rm(temporary, { force: true }); throw error; }
    await rename(path, backup);
    try { await rename(temporary, path); await rm(backup, { force: true }); }
    catch (replacementError) { if (existsSync(backup)) await rename(backup, path); await rm(temporary, { force: true }); throw replacementError; }
  }
};

const syncDesignReview = async (state, paths) => {
  const entries = [];
  for (const generation of state.generations) {
    const path = previewPath(paths, generation.id);
    if (!existsSync(path) || !(await stat(path)).isFile()) throw new Error(`Design Review preview is missing: ${path}`);
    entries.push({ id: generation.id, name: generation.label || generation.id, path: `previews/${generation.id}/index.html` });
  }
  await mkdir(paths.inspirationRoot, { recursive: true });
  await atomicWriteText(paths.designReview, await renderDesignReviewHtml(entries));
  return paths.designReview;
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
  if (generation.lineageStatus === 'legacy-unverified') return;
  if (generation.stage === 'variant') {
    if (!/data-inspiration-preview=["']homepage-variant["']/i.test(source)) throw new Error(`variant preview ${generation.id} must identify a complete homepage variant`);
    if (generation.previewScope?.futureImageSlot === 'empty-flat' && !/<([a-z][\w:-]*)\b[^>]*data-future-image-slot(?:=["'][^"']*["'])?[^>]*>\s*<\/\1>/i.test(source)) throw new Error(`variant preview ${generation.id} requires an empty data-future-image-slot`);
  }
  if (generation.stage === 'build-path' && !/data-inspiration-preview=["']build-path-shell["']/i.test(source)) throw new Error(`build-path preview ${generation.id} must identify its H0 shell`);
  if (generation.stage === 'hero') {
    const marker = generation.heroState === 'H0-retained' ? 'hero-retained' : 'hero-alternative';
    if (!new RegExp(`data-inspiration-preview=["']${marker}["']`, 'i').test(source)) throw new Error(`hero preview ${generation.id} must identify ${marker}`);
    if (generation.heroState !== 'H0-retained' && !/data-generated-hero-media\b/i.test(source)) throw new Error(`hero preview ${generation.id} must identify generated hero media`);
  }
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
  await syncDesignReview(state, paths);
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
  await syncDesignReview(state, paths);
  console.log(JSON.stringify({ projectRoot, state: paths.state, designReview: paths.designReview, workbench: paths.workbench, resumed: state.generations.length > 0, schemaVersion: state.schemaVersion }, null, 2));
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
    throw new Error('references.updated is retired; use the validated references.batch-saved action');
  } else if (event.type === 'references.session-saved') {
    const { normalizeSession } = await import('./reference-selection.mjs');
    const session = normalizeSession(catalog, structuredClone(payload));
    applyReferenceBatchState(state, batchFromSession(session, state), catalog);
  } else if (event.type === 'references.batch-saved') {
    const { normalizeBatch } = await import('./reference-selection.mjs');
    const batch = normalizeBatch(catalog, structuredClone(payload));
    applyReferenceBatchState(state, batch, catalog);
  } else if (event.type === 'references.identity-qa-recorded') {
    if (!isRecord(payload) || typeof payload.slotId !== 'string' || payload.status !== 'passed' || typeof payload.summary !== 'string' || !payload.summary.trim() || typeof payload.reviewer !== 'string' || !payload.reviewer.trim()) throw new Error('references.identity-qa-recorded requires slotId, passed status, reviewer, and summary');
    const item = state.references.activeBatch?.items.find((candidate) => candidate.slotId === payload.slotId);
    if (!item || item.requiresIdentityQa !== true) throw new Error(`Identity QA is not required for ${payload.slotId}`);
    item.identityQaStatus = 'passed';
    item.identityQa = { status: 'passed', reviewer: payload.reviewer, summary: payload.summary, recordedAt: new Date().toISOString() };
  } else if (event.type === 'workflow.status-changed') state.status = payload?.status;
  else if (event.type === 'hero.provider-selected') state.heroProvider = payload?.provider;
  else if (event.type === 'visual.evidence-recorded') {
    if (!isRecord(payload) || typeof payload.cardId !== 'string' || typeof payload.sha256 !== 'string' || typeof payload.file !== 'string') throw new Error('visual.evidence-recorded requires cardId, sha256, and file');
    state.visualControl.evidence[payload.cardId] = { ...payload, inspected: payload.inspected === true, recordedAt: new Date().toISOString() };
  }
  else if (event.type === 'visual.evidence-inspected') {
    const evidence = state.visualControl.evidence[payload?.cardId];
    if (!evidence || evidence.sha256 !== payload?.sha256) throw new Error('visual.evidence-inspected requires matching recorded evidence');
    evidence.inspected = true;
    evidence.inspectedAt = new Date().toISOString();
  }
  else if (event.type === 'visual.isolation-recorded') {
    if (!isRecord(payload) || !['subscription-ephemeral', 'sealed-api', 'degraded'].includes(payload.mode)) throw new Error('visual.isolation-recorded requires subscription-ephemeral, sealed-api, or degraded mode');
    if (typeof payload.generationId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(payload.generationId)) throw new Error('visual.isolation-recorded requires a valid generationId');
    if (payload.mode === 'subscription-ephemeral' && (payload.isolated !== false || payload.contextLimited !== true || payload.authenticatedWith !== 'chatgpt' || payload.runner !== 'codex-cli' || !/^[a-f0-9]{64}$/.test(payload.workspaceFingerprint ?? ''))) throw new Error('subscription-ephemeral requires a ChatGPT-authenticated Codex CLI run, an honest non-isolated label, and a SHA-256 workspace fingerprint');
    if (payload.mode === 'sealed-api' && ((!payload.developmentModelOverride && payload.model !== 'gpt-5.6-sol') || (payload.developmentModelOverride === true && (typeof payload.model !== 'string' || !payload.model.trim())) || !/^[a-f0-9]{64}$/.test(payload.requestFingerprint ?? ''))) throw new Error('sealed-api isolation requires the pinned model (or an explicit development override) and a SHA-256 request fingerprint');
    if (payload.mode === 'degraded' && (payload.explicitApproval !== true
      || payload.warning !== 'This generation can see project intake and is not isolated.'
      || payload.action !== 'RUN DEGRADED GENERATION'
      || !['subscription-unavailable', 'subscription-failure', 'api-unavailable', 'sealed-api-failure'].includes(payload.degradedCause) || !validDate(payload.approvedAt)
      || typeof payload.approver !== 'string' || !payload.approver.trim() || typeof payload.generationId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(payload.generationId))) throw new Error('degraded isolation requires one-run explicit approval after the configured generation path is unavailable or fails');
    const generation = state.generations.find((item) => item.id === payload.generationId);
    if (!generation || generation.stage !== 'direction') throw new Error('visual.isolation-recorded is direction-only and requires an existing direction generation');
    if (payload.mode === 'degraded' ? generation.executionHost !== 'explicit-degraded' : generation.executionHost !== 'sealed-runner') throw new Error('direction executionHost does not match its recorded generation mode');
    const isolation = { ...payload, recordedAt: new Date().toISOString() };
    state.visualControl.isolationRuns[payload.generationId] = isolation;
    state.visualControl.isolation = isolation;
  }
  else if (event.type === 'visual.leak-scan-recorded') {
    if (!isRecord(payload) || !['passed', 'failed'].includes(payload.status) || !Array.isArray(payload.matches)) throw new Error('visual.leak-scan-recorded requires status and matches');
    state.visualControl.leakScans.push({ ...payload, recordedAt: new Date().toISOString() });
  }
  else if (event.type === 'visual.identity-scan-recorded') {
    if (!isRecord(payload) || !['passed', 'failed', 'needs-review'].includes(payload.status) || !Array.isArray(payload.matches)) throw new Error('visual.identity-scan-recorded requires status and matches');
    state.visualControl.identityScans.push({ ...payload, recordedAt: new Date().toISOString() });
  }
  else if (event.type === 'visual.anchor-contract-frozen') {
    const selectedDirection = state.generations.find((item) => item.stage === 'direction' && item.status === 'selected');
    const anchorId = selectedDirection?.references?.find((item) => item.role === 'anchor')?.id;
    if (!isRecord(payload) || payload.cardId !== anchorId || !validateFingerprint(payload.fingerprint) || !validateTweakableDecisions(payload.tweakableDecisions)) throw new Error('visual.anchor-contract-frozen requires the selected anchor, a SHA-256 fingerprint, and contract-constrained tweakableDecisions');
    state.visualControl.anchorContract = { ...payload, frozenAt: new Date().toISOString() };
  }
  else if (event.type === 'visual.tweak-bar-recorded') {
    if (!isRecord(payload) || !['active', 'applied', 'production-excluded'].includes(payload.status) || !validId(payload.generationId) || !validateFingerprint(payload.contractFingerprint)) throw new Error('visual.tweak-bar-recorded requires status, generationId, and contract fingerprint');
    if (payload.contractFingerprint !== state.visualControl.anchorContract?.fingerprint) throw new Error('tweak bar does not match the frozen anchor contract');
    const expectedNext = { pending: 'active', active: 'applied', applied: 'production-excluded' }[state.visualControl.tweakBar.status];
    if (payload.status !== expectedNext) throw new Error(`tweak bar lifecycle must advance from ${state.visualControl.tweakBar.status} to ${expectedNext}`);
    if (payload.status === 'active' && (!Array.isArray(payload.controls) || !payload.controls.length || payload.controls.some((key) => !Object.hasOwn(state.visualControl.anchorContract.tweakableDecisions, key)))) throw new Error('active tweak bar controls must come from the frozen contract');
    if (payload.status === 'applied' && !validateFingerprint(payload.valuesFingerprint)) throw new Error('applied tweak bar requires a values fingerprint');
    if (payload.status === 'production-excluded' && (!validateFingerprint(payload.productionBuildFingerprint) || !Array.isArray(payload.markersFound) || payload.markersFound.length)) throw new Error('production-excluded tweak bar requires a clean production build fingerprint');
    const record = { ...payload, recordedAt: new Date().toISOString() };
    state.visualControl.tweakBar.records.push(record);
    state.visualControl.tweakBar.status = payload.status;
  }
  else if (event.type === 'visual.route-conformance-recorded') {
    if (!isRecord(payload) || typeof payload.route !== 'string' || !['passed', 'failed'].includes(payload.status) || !Array.isArray(payload.checks)) throw new Error('visual.route-conformance-recorded requires route, status, and checks');
    state.visualControl.routeConformance.push({ ...payload, recordedAt: new Date().toISOString() });
  }
  else if (event.type === 'visual.design-gate-recorded') {
    if (!isRecord(payload) || !['passed', 'failed'].includes(payload.status) || typeof payload.homepageGenerationId !== 'string' || typeof payload.densePageGenerationId !== 'string') throw new Error('visual.design-gate-recorded requires status and both generation IDs');
    state.visualControl.designGate = { ...payload, decidedAt: new Date().toISOString() };
  }
  else if (event.type === 'verification.completed') {
    if (!isRecord(payload) || !Array.isArray(payload.checks) || !payload.checks.length || payload.checks.some((item) => typeof item !== 'string' || !item.trim())) throw new Error('verification.completed requires nonempty checks');
    state.verification = { status: 'passed', checks: [...new Set(payload.checks)], completedAt: new Date().toISOString() };
  }
  else if (event.type === 'generation.appended') {
    if (payload?.stage === 'direction') {
      const scopeErrors = validateDirectionPreviewScope(payload.previewScope, `direction ${payload.id ?? '(missing)'}`, false);
      if (scopeErrors.length) throw new Error(scopeErrors.join('; '));
      const anchorId = payload.references?.find((entry) => entry.role === 'anchor')?.id;
      const item = state.references.activeBatch?.items.find((candidate) => candidate.session.currentSet.anchor.id === anchorId);
      if (!item || item.reviewStatus !== 'accepted') throw new Error(`Direction ${payload.id ?? '(missing)'} requires an accepted active-batch slot for its anchor`);
      if (item.identityQaStatus === 'required') throw new Error(`Direction ${payload.id ?? '(missing)'} cannot advance until identity QA passes for ${item.slotId}`);
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
  await syncDesignReview(state, paths);
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
const saveReferenceBatch = async (rawRoot, batch) => {
  const projectRoot = await assertProjectRoot(rawRoot);
  const paths = statePaths(projectRoot);
  const state = await loadState(projectRoot, paths);
  await applyEvent(projectRoot, paths, state, { type: 'references.batch-saved', payload: batch }, { quiet: true });
};
const usage = 'Usage: project-state.mjs init|validate|get <project-root> | apply-event|append-generation|append-decision <project-root> <record.json>';
const parseCliArgs = (args) => {
  const [command, ...operands] = args;
  const requiredOperands = ['init', 'validate', 'get'].includes(command) ? 1
    : ['apply-event', 'append-generation', 'append-decision'].includes(command) ? 2 : null;
  if (requiredOperands === null) throw new Error(usage);
  if (typeof operands[0] === 'string' && operands[0].startsWith('-')) throw new Error(`project-root is positional; do not use --project-root. ${usage}`);
  if (operands.length !== requiredOperands) throw new Error(usage);
  return { command, rawRoot: operands[0], recordPath: operands[1] };
};
const batchFromSession = (session, state, options = {}) => {
  if (!isRecord(session)) return null;
  const accepted = session.accepted === true;
  const now = state?.updatedAt ?? new Date().toISOString();
  return {
    schemaVersion: 1,
    catalogFingerprint: session.catalogFingerprint,
    mode: options.mode ?? 'legacy-single',
    pageUse: session.request?.pageUse,
    accepted,
    items: [{
      slotId: 'R01',
      origin: options.origin ?? 'legacy',
      category: session.currentSet?.category ?? session.request?.category,
      reviewStatus: accepted ? 'accepted' : 'pending',
      warnings: [],
      requiresIdentityQa: false,
      identityQaStatus: 'not-required',
      session: structuredClone(session),
    }],
    notices: [],
    createdAt: now,
    updatedAt: now,
  };
};
const batchPins = (batch) => (batch?.items ?? []).flatMap((item) => (
  (item.session?.pinned ?? []).map((pin) => ({ slotId: item.slotId, id: pin.id, role: pin.role }))
));
const batchExcluded = (batch) => [...new Set((batch?.items ?? []).flatMap((item) => item.session?.excluded ?? []))];
const applyReferenceBatchState = (state, batch, catalog) => {
  state.references = {
    ...state.references,
    catalogFingerprint: catalog.fingerprint,
    selectionStatus: 'current',
    activeBatch: structuredClone(batch),
    pinned: batchPins(batch),
    excluded: [...new Set([...(state.references.excluded ?? []), ...batchExcluded(batch)])],
  };
  for (const item of batch.items) {
    const session = item.session;
    if (item.reviewStatus === 'accepted' && !state.references.acceptedSets.some((set) => set.signature === session.currentSet.signature)) {
      state.references.acceptedSets.push(structuredClone(session.currentSet));
    }
    const sessionSets = [session.currentSet, ...(session.acceptedSets ?? []), ...(session.history ?? [])];
    for (const set of sessionSets) for (const entry of [set.anchor, ...(set.supporting ?? [])]) {
      const card = catalog.cards.find((candidate) => candidate.id === entry.id);
      if (card) state.references.historicalCards[card.id] = { id: card.id, title: card.title, primaryCategory: card.primaryCategory, fingerprint: card.fingerprint, retired: false };
    }
  }
};
const validateReferenceBatch = (batch, label, catalog = null) => {
  const errors = [];
  if (!isRecord(batch)) return [`${label} must be an object`];
  if (batch.schemaVersion !== 1) errors.push(`${label}.schemaVersion must be 1`);
  if (typeof batch.catalogFingerprint !== 'string') errors.push(`${label}.catalogFingerprint must be a string`);
  if (!['automatic-categories', 'user-custom', 'legacy-single'].includes(batch.mode)) errors.push(`${label}.mode is invalid`);
  if (typeof batch.pageUse !== 'string' || !batch.pageUse.trim()) errors.push(`${label}.pageUse is required`);
  if (!Array.isArray(batch.items) || !batch.items.length) errors.push(`${label}.items must contain at least one item`);
  else {
    batch.items.forEach((item, index) => {
      const itemLabel = `${label}.items[${index}]`;
      const expectedSlot = `R${String(index + 1).padStart(2, '0')}`;
      if (!isRecord(item) || item.slotId !== expectedSlot) { errors.push(`${itemLabel}.slotId must be ${expectedSlot}`); return; }
      if (!['automatic', 'user-custom', 'legacy'].includes(item.origin)) errors.push(`${itemLabel}.origin is invalid`);
      if (!['pending', 'accepted'].includes(item.reviewStatus)) errors.push(`${itemLabel}.reviewStatus is invalid`);
      if (typeof item.category !== 'string') errors.push(`${itemLabel}.category is required`);
      if (!Array.isArray(item.warnings) || item.warnings.some((warning) => typeof warning !== 'string')) errors.push(`${itemLabel}.warnings must be strings`);
      if (typeof item.requiresIdentityQa !== 'boolean') errors.push(`${itemLabel}.requiresIdentityQa must be boolean`);
      if (!['not-required', 'required', 'passed'].includes(item.identityQaStatus)) errors.push(`${itemLabel}.identityQaStatus is invalid`);
      if (item.requiresIdentityQa !== (item.identityQaStatus !== 'not-required')) errors.push(`${itemLabel} identity QA fields do not match`);
      if (!isRecord(item.session)) errors.push(`${itemLabel}.session must be an object`);
      else {
        if (item.session.catalogFingerprint !== batch.catalogFingerprint) errors.push(`${itemLabel}.session catalog fingerprint does not match the batch`);
        if (item.session.request?.pageUse !== batch.pageUse) errors.push(`${itemLabel}.session pageUse does not match the batch`);
        errors.push(...validateReferenceSet(item.session.currentSet, `${itemLabel}.session.currentSet`, catalog));
        if (item.session.currentSet?.category !== item.category) errors.push(`${itemLabel}.category does not match its current set`);
        if (!Array.isArray(item.session.pinned) || !Array.isArray(item.session.excluded)) errors.push(`${itemLabel}.session requires pinned and excluded arrays`);
      }
    });
  }
  const accepted = Array.isArray(batch.items) && batch.items.length > 0 && batch.items.every((item) => item?.reviewStatus === 'accepted');
  if (batch.accepted !== accepted) errors.push(`${label}.accepted does not match item review status`);
  if (!Array.isArray(batch.notices ?? []) || (batch.notices ?? []).some((notice) => typeof notice !== 'string')) errors.push(`${label}.notices must be strings`);
  if (!validDate(batch.createdAt) || !validDate(batch.updatedAt)) errors.push(`${label} timestamps are invalid`);
  return errors;
};
const main = async () => {
  const { command, rawRoot, recordPath } = parseCliArgs(process.argv.slice(2));
  if (command === 'init') return init(rawRoot);
  if (command === 'validate') return validate(rawRoot);
  if (command === 'apply-event') return applyFromPath(rawRoot, recordPath);
  if (command === 'append-generation') return appendCompatibility(rawRoot, recordPath, 'generation');
  if (command === 'append-decision') return appendCompatibility(rawRoot, recordPath, 'decision');
  if (command === 'get') return console.log(JSON.stringify(await readProjectState(rawRoot), null, 2));
};
const isDirectExecution = () => Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirectExecution()) main().catch((error) => fail(error.message));

export { applyEvent, assertProjectRoot, atomicWriteJson, emptyState, migrateState, parseCliArgs, readProjectState, saveReferenceBatch, saveReferenceSession, statePaths, syncDesignReview, validateState };
