#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getBag, readLedger, saveBag, writeLedger } from './rotation-ledger.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sessionSchemaVersion = 4;
const qualityWeight = { canonical: 1, usable: 0.72, limited: 0 };
const qualityBandWidth = 10;
const unique = (values) => [...new Set(values)];
const setSignature = (set) => set.anchor.id;
const recipeUsable = (card) => card.imageRecipe?.kind === 'none'
  ? ['code-native', 'authorized-media'].includes(card.imageRecipe.noneMode)
    && typeof card.imageRecipe.permittedMethod === 'string' && card.imageRecipe.permittedMethod.trim().length >= 3
    && typeof card.imageRecipe.reason === 'string' && card.imageRecipe.reason.trim().length >= 60
  : typeof card.imageRecipe?.prompt === 'string' && card.imageRecipe.prompt.trim().length >= 80;
const stillUsable = (card) => Boolean(card.media?.detailImage && card.media?.original && card.quality?.width > 0 && card.quality?.height > 0);

const normalizeRequestShape = (request) => ({
  category: request?.category,
  pageUse: request?.pageUse,
  seed: typeof request?.seed === 'string' && request.seed.trim() ? request.seed.trim() : null,
  pinned: request?.pinned ?? [],
  excluded: request?.excluded ?? [],
});
const catalogSets = (catalog) => ({
  ids: new Set(catalog.cards.map((card) => card.id)),
  categories: new Set(catalog.categories),
  pageUses: new Set(catalog.cards.flatMap((card) => card.workflow.anchorUses)),
});
const assertStringArray = (value, label) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) throw new Error(`${label} must be an array of nonempty strings`);
  if (unique(value).length !== value.length) throw new Error(`${label} must not contain duplicates`);
};
const validateRequest = (catalog, rawRequest) => {
  const request = normalizeRequestShape(rawRequest);
  const allowed = catalogSets(catalog);
  if (!allowed.categories.has(request.category)) throw new Error(`Unknown category: ${request.category ?? '(missing)'}`);
  if (!allowed.pageUses.has(request.pageUse)) throw new Error(`Unknown pageUse: ${request.pageUse ?? '(missing)'}`);
  assertStringArray(request.excluded, 'excluded');
  for (const id of request.excluded) if (!allowed.ids.has(id)) throw new Error(`Unknown excluded card: ${id}`);
  if (!Array.isArray(request.pinned) || request.pinned.length > 1) throw new Error('pinned must contain at most one anchor record');
  if (request.pinned.length) {
    const pin = request.pinned[0];
    if (!pin || !allowed.ids.has(pin.id)) throw new Error(`Unknown pinned card: ${pin?.id ?? '(missing)'}`);
    if (pin.role !== 'anchor') throw new Error('The only supported pinned role is anchor');
    if (request.excluded.includes(pin.id)) throw new Error(`Pinned card is also excluded: ${pin.id}`);
  }
  return request;
};

const anchorEligible = (card, rawRequest) => {
  const request = normalizeRequestShape(rawRequest);
  return card.primaryCategory === request.category
    && card.workflow.anchorUses.includes(request.pageUse)
    && card.quality.tier !== 'limited'
    && card.sourceIdentity?.review?.reviewStatus === 'reviewed'
    && ['codex-drafted', 'human-reviewed'].includes(card.sourceIdentity?.review?.reviewOrigin)
    && card.identityReviewFresh === true
    && stillUsable(card)
    && recipeUsable(card);
};
const baseScore = (card, request) => {
  if (!anchorEligible(card, request)) return 0;
  const strength = card.workflow.anchorStrength / 5;
  const sourceAndMedia = (qualityWeight[card.quality.tier] ?? 0) * card.quality.confidence;
  const pageRoleAndUsability = (card.workflow.anchorUses.includes(request.pageUse) ? 0.6 : 0)
    + (stillUsable(card) && recipeUsable(card) ? 0.4 : 0);
  return (strength * 45) + (sourceAndMedia * 35) + (pageRoleAndUsability * 20);
};
const eligibleQualityBand = (catalog, request) => {
  const excluded = new Set(request.excluded);
  const eligible = catalog.cards
    .filter((card) => !excluded.has(card.id) && anchorEligible(card, request))
    .map((card) => ({ card, score: Number(baseScore(card, request).toFixed(2)) }));
  if (!eligible.length) throw new Error(`No safe primary anchor is available for ${request.category} and ${request.pageUse}`);
  const top = Math.max(...eligible.map((item) => item.score));
  return eligible.filter((item) => item.score >= top - qualityBandWidth);
};
const preflightCategoryCoverage = (catalog, pageUse, excluded = []) => {
  const allowed = catalogSets(catalog);
  if (!allowed.pageUses.has(pageUse)) throw new Error(`Unknown pageUse: ${pageUse ?? '(missing)'}`);
  assertStringArray(excluded, 'excluded');
  const excludedIds = new Set(excluded); const coverage = catalog.categories.map((category) => {
    const request = { category, pageUse, pinned: [], excluded };
    const eligibleIds = catalog.cards.filter((card) => !excludedIds.has(card.id) && anchorEligible(card, request)).map((card) => card.id);
    return { category, eligibleIds };
  });
  const missing = coverage.filter((entry) => entry.eligibleIds.length === 0).map((entry) => entry.category);
  if (missing.length) throw new Error(`Cannot generate all-category directions for ${pageUse}; no safe exact-category anchor is available for: ${missing.join(', ')}`);
  return { pageUse, categoryCount: coverage.length, coverage };
};
const shuffleRank = (seed, cycle, id) => createHash('sha256').update(`${seed}\0${cycle}\0${id}`).digest('hex');
const orderBand = (band, seed, cycle) => [...band].sort((left, right) => {
  const order = shuffleRank(seed, cycle, left.card.id).localeCompare(shuffleRank(seed, cycle, right.card.id));
  return order || left.card.id.localeCompare(right.card.id);
});
const normalizeRotation = (bag, request, catalogFingerprint) => ({
  category: request.category,
  pageRole: request.pageUse,
  seed: request.seed ?? bag?.seed ?? createHash('sha256').update(`${catalogFingerprint}\0${request.category}\0${request.pageUse}`).digest('hex').slice(0, 16),
  cycle: Number.isInteger(bag?.cycle) && bag.cycle >= 0 ? bag.cycle : 0,
  shownIds: Array.isArray(bag?.shownIds) ? unique(bag.shownIds.filter((id) => typeof id === 'string')) : [],
  updatedAt: bag?.updatedAt ?? new Date(0).toISOString(),
});
const selectAnchor = (catalog, request, bag) => {
  const band = eligibleQualityBand(catalog, request);
  const bandIds = new Set(band.map((item) => item.card.id));
  const rotation = normalizeRotation(bag, request, catalog.fingerprint);
  rotation.shownIds = rotation.shownIds.filter((id) => bandIds.has(id));
  const pinnedId = request.pinned[0]?.id;
  let chosen;
  if (pinnedId) {
    const card = catalog.cards.find((item) => item.id === pinnedId);
    if (!card || request.excluded.includes(pinnedId) || !anchorEligible(card, request)) throw new Error(`Pinned card is not an eligible exact-category anchor: ${pinnedId}`);
    chosen = { card, score: Number(baseScore(card, request).toFixed(2)) };
  } else {
    chosen = orderBand(band, rotation.seed, rotation.cycle).find((item) => !rotation.shownIds.includes(item.card.id));
    if (!chosen) {
      rotation.cycle += 1;
      rotation.shownIds = [];
      chosen = orderBand(band, rotation.seed, rotation.cycle)[0];
    }
  }
  if (!rotation.shownIds.includes(chosen.card.id)) rotation.shownIds.push(chosen.card.id);
  rotation.updatedAt = new Date().toISOString();
  const set = {
    category: request.category,
    fitMode: 'exploratory',
    anchorFit: 'exact',
    anchor: { id: chosen.card.id, title: chosen.card.title, role: 'anchor', score: chosen.score },
    supporting: [],
    score: chosen.score,
    reused: rotation.cycle > 0,
  };
  set.signature = setSignature(set);
  return { set, rotation, eligibleIds: band.map((item) => item.card.id) };
};
const chooseSet = (catalog, rawRequest, options = {}) => selectAnchor(catalog, validateRequest(catalog, rawRequest), options.bag).set;
const createSession = (catalog, rawRequest, options = {}) => {
  const request = validateRequest(catalog, rawRequest);
  const selected = selectAnchor(catalog, request, options.bag);
  return {
    schemaVersion: sessionSchemaVersion,
    catalogFingerprint: catalog.fingerprint,
    request,
    pinned: structuredClone(request.pinned),
    excluded: structuredClone(request.excluded),
    rotation: selected.rotation,
    history: [],
    acceptedSets: [],
    currentSet: selected.set,
    accepted: false,
    exhausted: selected.set.reused,
  };
};
const validateSetRecord = (catalog, request, set, label, { enforceCurrent = false } = {}) => {
  if (!set || typeof set !== 'object' || !set.anchor || !Array.isArray(set.supporting) || set.supporting.length !== 0) throw new Error(`${label} must contain exactly one anchor and no supporting cards`);
  if (set.anchor.role !== 'anchor') throw new Error(`${label} anchor role is invalid`);
  const card = catalog.cards.find((item) => item.id === set.anchor.id);
  if (!card) throw new Error(`${label} contains unknown card: ${set.anchor.id ?? '(missing)'}`);
  if (!Number.isFinite(set.anchor.score) || set.anchor.score < 0 || set.anchor.score > 100 || set.score !== set.anchor.score) throw new Error(`${label} contains an invalid score`);
  if (set.category !== request.category || set.fitMode !== 'exploratory' || set.anchorFit !== 'exact') throw new Error(`${label} has invalid category or fit metadata`);
  if (set.signature !== setSignature(set)) throw new Error(`${label} signature does not match its anchor`);
  if (enforceCurrent && (!anchorEligible(card, request) || request.excluded.includes(card.id))) throw new Error(`${label} anchor is ineligible`);
  return set;
};
const normalizeSession = (catalog, rawSession, fallbackRequest) => {
  if (!rawSession || typeof rawSession !== 'object' || Array.isArray(rawSession)) throw new Error('session must be an object');
  const request = validateRequest(catalog, rawSession.request ?? fallbackRequest ?? {});
  if (rawSession.schemaVersion !== sessionSchemaVersion) throw new Error(`session schemaVersion must be ${sessionSchemaVersion}`);
  if (rawSession.catalogFingerprint !== catalog.fingerprint) throw new Error('selection session requires revalidation against the current catalog');
  if (!Array.isArray(rawSession.history ?? []) || !Array.isArray(rawSession.acceptedSets ?? [])) throw new Error('session history and acceptedSets must be arrays');
  const session = {
    schemaVersion: sessionSchemaVersion,
    catalogFingerprint: rawSession.catalogFingerprint,
    request,
    pinned: structuredClone(rawSession.pinned ?? request.pinned),
    excluded: structuredClone(rawSession.excluded ?? request.excluded),
    rotation: normalizeRotation(rawSession.rotation, request, catalog.fingerprint),
    history: structuredClone(rawSession.history ?? []),
    acceptedSets: structuredClone(rawSession.acceptedSets ?? []),
    currentSet: structuredClone(rawSession.currentSet),
    accepted: rawSession.accepted === true,
    exhausted: rawSession.exhausted === true,
  };
  session.request = validateRequest(catalog, { ...request, pinned: session.pinned, excluded: session.excluded });
  validateSetRecord(catalog, session.request, session.currentSet, 'session currentSet', { enforceCurrent: true });
  session.history.forEach((set, index) => validateSetRecord(catalog, request, set, `session history[${index}]`));
  session.acceptedSets.forEach((set, index) => validateSetRecord(catalog, request, set, `session acceptedSets[${index}]`));
  if (session.pinned.length && session.pinned[0].id !== session.currentSet.anchor.id) throw new Error(`Pinned card is not fixed in the current set: ${session.pinned[0].id}`);
  return session;
};
const nextAutomaticSet = (catalog, session) => {
  const selected = selectAnchor(catalog, session.request, session.rotation);
  session.rotation = selected.rotation;
  session.currentSet = selected.set;
  session.exhausted = selected.set.reused;
};
const validateAction = (action) => {
  if (!action || typeof action !== 'object' || Array.isArray(action)) throw new Error('action must be an object');
  const types = ['ACCEPT ALL', 'PIN THIS CARD', 'DO NOT USE THIS CARD', 'SHOW ANOTHER CARD', 'SHOW ANOTHER SET', 'SWAP'];
  if (!types.includes(action.type)) throw new Error(`Unknown action: ${action.type ?? '(missing)'}`);
  if (['PIN THIS CARD', 'DO NOT USE THIS CARD', 'SWAP'].includes(action.type) && typeof action.cardId !== 'string') throw new Error(`${action.type} requires cardId`);
  if (action.replacementId !== undefined && typeof action.replacementId !== 'string') throw new Error('replacementId must be a string');
  return action;
};
const applyAction = (catalog, rawSession, rawAction, fallbackRequest) => {
  const next = normalizeSession(catalog, structuredClone(rawSession), fallbackRequest);
  const action = validateAction(rawAction);
  next.accepted = false;
  if (action.type === 'ACCEPT ALL') {
    if (!next.acceptedSets.some((set) => set.signature === next.currentSet.signature)) next.acceptedSets.push(structuredClone(next.currentSet));
    return { ...next, accepted: true, next: 'advance' };
  }
  if (action.type === 'PIN THIS CARD') {
    if (action.cardId !== next.currentSet.anchor.id) throw new Error(`Card is not the current anchor: ${action.cardId}`);
    next.pinned = [{ id: action.cardId, role: 'anchor' }];
    next.request = validateRequest(catalog, { ...next.request, pinned: next.pinned, excluded: next.excluded });
    return { ...next, next: 'review-pinned-anchor' };
  }
  if (action.type === 'DO NOT USE THIS CARD') {
    if (action.cardId !== next.currentSet.anchor.id) throw new Error(`Card is not the current anchor: ${action.cardId}`);
    next.excluded = unique([...next.excluded, action.cardId]);
    next.pinned = [];
    next.history.push(structuredClone(next.currentSet));
    next.request = validateRequest(catalog, { ...next.request, pinned: [], excluded: next.excluded });
    nextAutomaticSet(catalog, next);
    return { ...next, next: next.exhausted ? 'review-reused-card-library-exhausted' : 'review-automatic-replacement' };
  }
  if (action.type === 'SHOW ANOTHER CARD' || action.type === 'SHOW ANOTHER SET') {
    if (next.pinned.length) throw new Error('Unpin the current anchor before showing another card.');
    next.history.push(structuredClone(next.currentSet));
    nextAutomaticSet(catalog, next);
    return { ...next, next: next.exhausted ? 'review-reused-card-library-exhausted' : 'review-alternate-card' };
  }
  if (action.type === 'SWAP') {
    if (action.cardId !== next.currentSet.anchor.id) throw new Error(`Card is not the current anchor: ${action.cardId}`);
    if (next.pinned.length) throw new Error('Unpin the current anchor before swapping it.');
    if (!action.replacementId) throw new Error('SWAP requires replacementId in an anchor-only direction.');
    const replacementRequest = validateRequest(catalog, { ...next.request, pinned: [{ id: action.replacementId, role: 'anchor' }] });
    next.history.push(structuredClone(next.currentSet));
    const selected = selectAnchor(catalog, replacementRequest, next.rotation);
    next.rotation = selected.rotation;
    next.currentSet = selected.set;
    return { ...next, next: 'review-replacement' };
  }
  throw new Error(`Unknown action: ${action.type}`);
};

const loadCatalog = () => {
  const result = spawnSync(process.execPath, [resolve(scriptDir, 'library.mjs'), 'catalog'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Could not read library catalog.');
  return JSON.parse(result.stdout);
};
const syncSessionBag = async (session, path, ledger) => {
  saveBag(ledger, session.rotation);
  await writeLedger(path, ledger);
};
const main = async () => {
  const [command, firstPath, secondPath, thirdPath] = process.argv.slice(2);
  if (!command) return;
  const catalog = loadCatalog();
  if (command === 'preflight') {
    const excluded = secondPath ? JSON.parse(await readFile(resolve(secondPath), 'utf8')) : [];
    console.log(JSON.stringify(preflightCategoryCoverage(catalog, firstPath, excluded), null, 2));
    return;
  }
  if (command === 'propose' || command === 'propose-and-save') {
    const requestPath = command === 'propose' ? firstPath : secondPath;
    const request = JSON.parse(await readFile(resolve(requestPath), 'utf8'));
    const { path, ledger } = await readLedger(catalog.fingerprint);
    const session = createSession(catalog, request, { bag: getBag(ledger, request.category, request.pageUse) });
    await syncSessionBag(session, path, ledger);
    if (command === 'propose-and-save') {
      const { saveReferenceSession } = await import('./project-state.mjs');
      await saveReferenceSession(resolve(firstPath), session);
    }
    console.log(JSON.stringify(session, null, 2));
    return;
  }
  if (command === 'action') {
    const session = JSON.parse(await readFile(resolve(firstPath), 'utf8'));
    const action = JSON.parse(await readFile(resolve(secondPath), 'utf8'));
    const request = thirdPath ? JSON.parse(await readFile(resolve(thirdPath), 'utf8')) : undefined;
    console.log(JSON.stringify(applyAction(catalog, session, action, request), null, 2));
    return;
  }
  if (command === 'action-and-save') {
    const projectRoot = resolve(firstPath);
    const action = JSON.parse(await readFile(resolve(secondPath), 'utf8'));
    const { readProjectState, saveReferenceSession } = await import('./project-state.mjs');
    const state = await readProjectState(projectRoot);
    if (!state.references.activeSession) throw new Error('No active reference session is saved for this project.');
    const { path, ledger } = await readLedger(catalog.fingerprint);
    const globalBag = getBag(ledger, state.references.activeSession.request.category, state.references.activeSession.request.pageUse);
    const raw = structuredClone(state.references.activeSession);
    raw.rotation = globalBag.cycle > raw.rotation.cycle
      ? globalBag
      : { ...raw.rotation, shownIds: unique([...raw.rotation.shownIds, ...globalBag.shownIds]) };
    const session = applyAction(catalog, raw, action);
    await syncSessionBag(session, path, ledger);
    await saveReferenceSession(projectRoot, session);
    console.log(JSON.stringify(session, null, 2));
    return;
  }
  throw new Error('Usage: reference-selection.mjs preflight <page-use> [excluded.json] | propose <request.json> | action <session.json> <action.json> [request.json] | propose-and-save <project-root> <request.json> | action-and-save <project-root> <action.json>');
};
const isDirectExecution = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirectExecution) main().catch((error) => { console.error(`Design Taste Injection: ${error.message}`); process.exitCode = 1; });

export { anchorEligible, applyAction, baseScore, chooseSet, createSession, eligibleQualityBand, normalizeSession, preflightCategoryCoverage, selectAnchor, setSignature, validateRequest };
