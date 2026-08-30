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
const batchSchemaVersion = 1;
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

const normalizeRequestShape = (request) => {
  const normalized = {
    category: request?.category,
    pageUse: request?.pageUse,
    seed: typeof request?.seed === 'string' && request.seed.trim() ? request.seed.trim() : null,
    pinned: request?.pinned ?? [],
    excluded: request?.excluded ?? [],
  };
  if (request?.selectionMode === 'custom') {
    normalized.selectionMode = 'custom';
    normalized.customCardId = request.customCardId;
  }
  return normalized;
};
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
  if (request.selectionMode === 'custom') {
    if (typeof request.customCardId !== 'string' || !allowed.ids.has(request.customCardId)) throw new Error(`Unknown custom card: ${request.customCardId ?? '(missing)'}`);
    if (request.pinned.length && request.pinned[0].id !== request.customCardId) throw new Error('A custom selection pin must match customCardId');
    const card = catalog.cards.find((item) => item.id === request.customCardId);
    if (card.primaryCategory !== request.category) throw new Error(`Custom card category does not match ${card.id}`);
  }
  return request;
};

const identityReviewCurrent = (card) => card?.sourceIdentity?.review?.reviewStatus === 'reviewed'
  && ['codex-drafted', 'human-reviewed'].includes(card.sourceIdentity?.review?.reviewOrigin)
  && card.identityReviewFresh === true
  && card.sourceIdentity.review.reviewFingerprint === card.identityReviewFingerprint;
const customCardEligible = (card) => Boolean(card && stillUsable(card) && recipeUsable(card));

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
  return descriptiveScore(card, request);
};
const descriptiveScore = (card, request) => {
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
  if (request.selectionMode === 'custom') {
    const card = catalog.cards.find((item) => item.id === request.customCardId);
    if (!customCardEligible(card)) throw new Error(`Custom card has no readable still or executable recipe/method: ${request.customCardId}`);
    if (request.excluded.includes(card.id)) throw new Error(`Custom card is excluded: ${card.id}`);
    const rotation = normalizeRotation(bag, request, catalog.fingerprint);
    const score = Number(descriptiveScore(card, request).toFixed(2));
    const set = {
      category: card.primaryCategory,
      fitMode: 'user-custom',
      anchorFit: 'explicit',
      anchor: { id: card.id, title: card.title, role: 'anchor', score },
      supporting: [],
      score,
      reused: false,
    };
    set.signature = setSignature(set);
    return { set, rotation, eligibleIds: [card.id] };
  }
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
  const custom = request.selectionMode === 'custom';
  if (set.category !== request.category || set.fitMode !== (custom ? 'user-custom' : 'exploratory') || set.anchorFit !== (custom ? 'explicit' : 'exact')) throw new Error(`${label} has invalid category or fit metadata`);
  if (set.signature !== setSignature(set)) throw new Error(`${label} signature does not match its anchor`);
  const eligible = custom ? card.id === request.customCardId && customCardEligible(card) : anchorEligible(card, request);
  if (enforceCurrent && (!eligible || request.excluded.includes(card.id))) throw new Error(`${label} anchor is ineligible`);
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
const switchSessionToAutomatic = (catalog, session) => {
  const category = session.currentSet.category;
  session.request = validateRequest(catalog, {
    category,
    pageUse: session.request.pageUse,
    seed: session.request.seed,
    pinned: [],
    excluded: session.excluded,
  });
  session.pinned = [];
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
    if (next.request.selectionMode === 'custom') switchSessionToAutomatic(catalog, next);
    else next.request = validateRequest(catalog, { ...next.request, pinned: [], excluded: next.excluded });
    nextAutomaticSet(catalog, next);
    return { ...next, next: next.exhausted ? 'review-reused-card-library-exhausted' : 'review-automatic-replacement' };
  }
  if (action.type === 'SHOW ANOTHER CARD' || action.type === 'SHOW ANOTHER SET') {
    if (next.pinned.length) throw new Error('Unpin the current anchor before showing another card.');
    next.history.push(structuredClone(next.currentSet));
    if (next.request.selectionMode === 'custom') switchSessionToAutomatic(catalog, next);
    nextAutomaticSet(catalog, next);
    return { ...next, next: next.exhausted ? 'review-reused-card-library-exhausted' : 'review-alternate-card' };
  }
  if (action.type === 'SWAP') {
    if (action.cardId !== next.currentSet.anchor.id) throw new Error(`Card is not the current anchor: ${action.cardId}`);
    if (next.pinned.length) throw new Error('Unpin the current anchor before swapping it.');
    if (!action.replacementId) throw new Error('SWAP requires replacementId in an anchor-only direction.');
    const replacement = catalog.cards.find((item) => item.id === action.replacementId);
    const replacementRequest = next.request.selectionMode === 'custom'
      ? validateRequest(catalog, { category: replacement?.primaryCategory, pageUse: next.request.pageUse, seed: next.request.seed, pinned: [], excluded: next.excluded, selectionMode: 'custom', customCardId: action.replacementId })
      : validateRequest(catalog, { ...next.request, pinned: [{ id: action.replacementId, role: 'anchor' }] });
    next.history.push(structuredClone(next.currentSet));
    const selected = selectAnchor(catalog, replacementRequest, next.rotation);
    next.request = replacementRequest;
    next.pinned = [];
    next.rotation = selected.rotation;
    next.currentSet = selected.set;
    return { ...next, next: 'review-replacement' };
  }
  throw new Error(`Unknown action: ${action.type}`);
};

const slotIdFor = (index) => `R${String(index + 1).padStart(2, '0')}`;
const warningsForCard = (card, pageUse) => {
  const warnings = [];
  if (!card.workflow.anchorUses.includes(pageUse)) warnings.push(`Explicit override: ${card.title} is not curated for ${pageUse} anchoring.`);
  if (card.quality.tier === 'limited') warnings.push(`Limited still evidence may reduce visual fidelity for ${card.title}.`);
  if (!identityReviewCurrent(card)) warnings.push(`Source-identity safeguards for ${card.title} are missing or stale; identity QA is required before advancement.`);
  return warnings;
};
const itemFromSession = (catalog, session, index, origin) => {
  const card = catalog.cards.find((entry) => entry.id === session.currentSet.anchor.id);
  const warnings = origin === 'user-custom' ? warningsForCard(card, session.request.pageUse) : [];
  return {
    slotId: slotIdFor(index),
    origin,
    category: card.primaryCategory,
    reviewStatus: session.accepted ? 'accepted' : 'pending',
    warnings,
    requiresIdentityQa: !identityReviewCurrent(card),
    identityQaStatus: identityReviewCurrent(card) ? 'not-required' : 'required',
    session,
  };
};
const batchRecord = (catalog, mode, pageUse, items, notices = []) => {
  const now = new Date().toISOString();
  return {
    schemaVersion: batchSchemaVersion,
    catalogFingerprint: catalog.fingerprint,
    mode,
    pageUse,
    accepted: items.every((item) => item.reviewStatus === 'accepted'),
    items,
    notices,
    createdAt: now,
    updatedAt: now,
  };
};
const createAutomaticBatch = (catalog, rawRequest, options = {}) => {
  const pageUse = rawRequest?.pageUse;
  const excluded = rawRequest?.excluded ?? [];
  preflightCategoryCoverage(catalog, pageUse, excluded);
  const items = catalog.categories.map((category, index) => {
    const bag = options.bags instanceof Map ? options.bags.get(category) : options.bags?.[category];
    const session = createSession(catalog, { category, pageUse, seed: rawRequest?.seed, pinned: [], excluded }, { bag });
    return itemFromSession(catalog, session, index, 'automatic');
  });
  return batchRecord(catalog, 'automatic-categories', pageUse, items);
};
const normalizedUrl = (value) => {
  try {
    const url = new URL(value);
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch { return null; }
};
const resolveCardIdentifier = (catalog, identifier) => {
  if (typeof identifier !== 'string' || !identifier.trim()) throw new Error('Custom card identifiers must be nonempty strings');
  const value = identifier.trim();
  const byId = catalog.cards.find((card) => card.id === value);
  if (byId) return byId;
  const lowered = value.toLocaleLowerCase();
  const titleMatches = catalog.cards.filter((card) => card.title.toLocaleLowerCase() === lowered);
  if (titleMatches.length === 1) return titleMatches[0];
  const siteMatches = catalog.cards.filter((card) => card.source?.siteName?.toLocaleLowerCase() === lowered);
  if (siteMatches.length === 1) return siteMatches[0];
  const targetUrl = normalizedUrl(value);
  const urlMatches = targetUrl ? catalog.cards.filter((card) => normalizedUrl(card.source?.url) === targetUrl) : [];
  if (urlMatches.length === 1) return urlMatches[0];
  const matches = [...new Map([...titleMatches, ...siteMatches, ...urlMatches].map((card) => [card.id, card])).values()];
  if (matches.length > 1) throw new Error(`Ambiguous custom card identifier "${value}": ${matches.map((card) => card.id).join(', ')}`);
  throw new Error(`Custom card identifier did not resolve exactly: ${value}`);
};
const resolveCustomCards = (catalog, identifiers) => {
  if (!Array.isArray(identifiers) || identifiers.length === 0) throw new Error('USE CUSTOM CARDS requires at least one card identifier');
  const cards = []; const seen = new Set(); const notices = [];
  for (const identifier of identifiers) {
    const card = resolveCardIdentifier(catalog, identifier);
    if (seen.has(card.id)) { notices.push(`Duplicate custom card ignored: ${card.title} [${card.id}]`); continue; }
    if (!customCardEligible(card)) throw new Error(`Custom card has no readable still or executable recipe/method: ${card.id}`);
    seen.add(card.id); cards.push(card);
  }
  return { cards, notices };
};
const createCustomBatch = (catalog, rawRequest, options = {}) => {
  const pageUse = rawRequest?.pageUse;
  if (!catalogSets(catalog).pageUses.has(pageUse)) throw new Error(`Unknown pageUse: ${pageUse ?? '(missing)'}`);
  const { cards, notices } = resolveCustomCards(catalog, rawRequest?.identifiers ?? rawRequest?.cards);
  const excluded = rawRequest?.excluded ?? [];
  assertStringArray(excluded, 'excluded');
  const items = cards.map((card, index) => {
    const bag = options.bags instanceof Map ? options.bags.get(card.primaryCategory) : options.bags?.[card.primaryCategory];
    const session = createSession(catalog, { category: card.primaryCategory, pageUse, seed: rawRequest?.seed, pinned: [], excluded, selectionMode: 'custom', customCardId: card.id }, { bag });
    return itemFromSession(catalog, session, index, 'user-custom');
  });
  return batchRecord(catalog, 'user-custom', pageUse, items, notices);
};
const normalizeBatch = (catalog, rawBatch) => {
  if (!rawBatch || typeof rawBatch !== 'object' || Array.isArray(rawBatch)) throw new Error('batch must be an object');
  if (rawBatch.schemaVersion !== batchSchemaVersion) throw new Error(`batch schemaVersion must be ${batchSchemaVersion}`);
  if (rawBatch.catalogFingerprint !== catalog.fingerprint) throw new Error('selection batch requires revalidation against the current catalog');
  if (!['automatic-categories', 'user-custom', 'legacy-single'].includes(rawBatch.mode)) throw new Error('selection batch mode is invalid');
  if (!catalogSets(catalog).pageUses.has(rawBatch.pageUse)) throw new Error(`Unknown pageUse: ${rawBatch.pageUse ?? '(missing)'}`);
  if (!Array.isArray(rawBatch.items) || rawBatch.items.length === 0) throw new Error('selection batch must contain at least one item');
  const items = rawBatch.items.map((rawItem, index) => {
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) throw new Error(`batch item ${index + 1} must be an object`);
    const session = normalizeSession(catalog, rawItem.session);
    const card = catalog.cards.find((entry) => entry.id === session.currentSet.anchor.id);
    const expectedSlot = slotIdFor(index);
    if (rawItem.slotId !== expectedSlot) throw new Error(`batch item ${index + 1} slotId must be ${expectedSlot}`);
    if (!['automatic', 'user-custom', 'legacy'].includes(rawItem.origin)) throw new Error(`batch item ${rawItem.slotId} origin is invalid`);
    if (!['pending', 'accepted'].includes(rawItem.reviewStatus)) throw new Error(`batch item ${rawItem.slotId} reviewStatus is invalid`);
    if (rawItem.category !== card.primaryCategory) throw new Error(`batch item ${rawItem.slotId} category does not match its card`);
    if (!Array.isArray(rawItem.warnings) || rawItem.warnings.some((warning) => typeof warning !== 'string')) throw new Error(`batch item ${rawItem.slotId} warnings must be strings`);
    if (typeof rawItem.requiresIdentityQa !== 'boolean') throw new Error(`batch item ${rawItem.slotId} requiresIdentityQa must be boolean`);
    if (!['not-required', 'required', 'passed'].includes(rawItem.identityQaStatus)) throw new Error(`batch item ${rawItem.slotId} identityQaStatus is invalid`);
    if (rawItem.requiresIdentityQa !== (rawItem.identityQaStatus !== 'not-required')) throw new Error(`batch item ${rawItem.slotId} identity QA fields do not match`);
    return { ...structuredClone(rawItem), session };
  });
  const accepted = items.every((item) => item.reviewStatus === 'accepted');
  if (rawBatch.accepted !== accepted) throw new Error('selection batch accepted state does not match its items');
  if (!Array.isArray(rawBatch.notices ?? []) || (rawBatch.notices ?? []).some((notice) => typeof notice !== 'string')) throw new Error('selection batch notices must be strings');
  if (Number.isNaN(Date.parse(rawBatch.createdAt)) || Number.isNaN(Date.parse(rawBatch.updatedAt))) throw new Error('selection batch timestamps are invalid');
  return { ...structuredClone(rawBatch), items, notices: [...(rawBatch.notices ?? [])], accepted };
};
const refreshBatchItem = (catalog, item, session, reviewStatus = 'pending') => {
  const refreshed = itemFromSession(catalog, session, Number(item.slotId.slice(1)) - 1, item.origin);
  const sameCard = item.session.currentSet.anchor.id === session.currentSet.anchor.id;
  return { ...refreshed, slotId: item.slotId, reviewStatus, identityQaStatus: sameCard && item.identityQaStatus === 'passed' && refreshed.requiresIdentityQa ? 'passed' : refreshed.identityQaStatus };
};
const validateBatchAction = (action) => {
  if (!action || typeof action !== 'object' || Array.isArray(action)) throw new Error('batch action must be an object');
  const types = ['ACCEPT ALL', 'ACCEPT', 'PIN THIS CARD', 'DO NOT USE THIS CARD', 'SHOW ANOTHER CARD', 'SWAP', 'USE CUSTOM CARDS'];
  if (!types.includes(action.type)) throw new Error(`Unknown batch action: ${action.type ?? '(missing)'}`);
  if (!['ACCEPT ALL', 'USE CUSTOM CARDS'].includes(action.type) && typeof action.slotId !== 'string') throw new Error(`${action.type} requires slotId`);
  return action;
};
const applyBatchActions = (catalog, rawBatch, rawActions) => {
  let batch = normalizeBatch(catalog, structuredClone(rawBatch));
  const actions = Array.isArray(rawActions) ? rawActions : [rawActions];
  const issues = []; const notices = [];
  for (const rawAction of actions) {
    try {
      const action = validateBatchAction(rawAction);
      if (action.type === 'USE CUSTOM CARDS') {
        batch = createCustomBatch(catalog, { pageUse: batch.pageUse, identifiers: action.identifiers ?? action.cards, excluded: [...new Set(batch.items.flatMap((item) => item.session.excluded))] });
        notices.push(...batch.notices);
        continue;
      }
      if (action.type === 'ACCEPT ALL') {
        batch.items = batch.items.map((item) => refreshBatchItem(catalog, item, applyAction(catalog, item.session, { type: 'ACCEPT ALL' }), 'accepted'));
        continue;
      }
      const index = batch.items.findIndex((item) => item.slotId === action.slotId);
      if (index < 0) throw new Error(`Unknown batch slot: ${action.slotId}`);
      const item = batch.items[index];
      if (action.type === 'ACCEPT') {
        batch.items[index] = refreshBatchItem(catalog, item, applyAction(catalog, item.session, { type: 'ACCEPT ALL' }), 'accepted');
        continue;
      }
      let sessionAction = { ...action, cardId: item.session.currentSet.anchor.id };
      if (action.type === 'SWAP') {
        const replacement = resolveCardIdentifier(catalog, action.replacementId ?? action.replacement ?? action.card);
        sessionAction = { type: 'SWAP', cardId: item.session.currentSet.anchor.id, replacementId: replacement.id };
      }
      delete sessionAction.slotId;
      batch.items[index] = refreshBatchItem(catalog, item, applyAction(catalog, item.session, sessionAction));
    } catch (error) {
      issues.push({ action: structuredClone(rawAction), message: error.message });
    }
  }
  batch.accepted = batch.items.every((item) => item.reviewStatus === 'accepted');
  batch.updatedAt = new Date().toISOString();
  batch.notices = [...new Set([...batch.notices, ...notices])];
  return { batch, issues, notices: batch.notices };
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
const syncBatchBags = async (batch, path, ledger) => {
  for (const item of batch.items) {
    if (item.session.request.selectionMode !== 'custom') saveBag(ledger, item.session.rotation);
  }
  await writeLedger(path, ledger);
};
const mergeGlobalBagsIntoBatch = (batch, ledger) => {
  const next = structuredClone(batch);
  for (const item of next.items) {
    const globalBag = getBag(ledger, item.session.request.category, item.session.request.pageUse);
    const local = item.session.rotation;
    item.session.rotation = globalBag.cycle > local.cycle
      ? globalBag
      : { ...local, shownIds: unique([...local.shownIds, ...globalBag.shownIds]) };
  }
  return next;
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
  if (command === 'propose-batch' || command === 'propose-batch-and-save') {
    const requestPath = command === 'propose-batch' ? firstPath : secondPath;
    const request = JSON.parse(await readFile(resolve(requestPath), 'utf8'));
    const { path, ledger } = await readLedger(catalog.fingerprint);
    const bags = new Map(catalog.categories.map((category) => [category, getBag(ledger, category, request.pageUse)]));
    const batch = request.mode === 'custom' || request.mode === 'user-custom'
      ? createCustomBatch(catalog, request, { bags })
      : createAutomaticBatch(catalog, request, { bags });
    await syncBatchBags(batch, path, ledger);
    if (command === 'propose-batch-and-save') {
      const { saveReferenceBatch } = await import('./project-state.mjs');
      await saveReferenceBatch(resolve(firstPath), batch);
    }
    console.log(JSON.stringify(batch, null, 2));
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
    const { readProjectState, saveReferenceBatch } = await import('./project-state.mjs');
    const state = await readProjectState(projectRoot);
    if (!state.references.activeBatch || state.references.activeBatch.items.length !== 1) throw new Error('action-and-save requires exactly one active batch item; use batch-action-and-save for a multi-card review.');
    const { path, ledger } = await readLedger(catalog.fingerprint);
    const rawBatch = mergeGlobalBagsIntoBatch(state.references.activeBatch, ledger);
    const raw = structuredClone(rawBatch.items[0].session);
    const globalBag = getBag(ledger, raw.request.category, raw.request.pageUse);
    raw.rotation = globalBag.cycle > raw.rotation.cycle
      ? globalBag
      : { ...raw.rotation, shownIds: unique([...raw.rotation.shownIds, ...globalBag.shownIds]) };
    const session = applyAction(catalog, raw, action);
    const reviewStatus = session.accepted ? 'accepted' : 'pending';
    const batch = normalizeBatch(catalog, {
      ...rawBatch,
      accepted: reviewStatus === 'accepted',
      items: [refreshBatchItem(catalog, rawBatch.items[0], session, reviewStatus)],
      updatedAt: new Date().toISOString(),
    });
    await syncBatchBags(batch, path, ledger);
    await saveReferenceBatch(projectRoot, batch);
    console.log(JSON.stringify(session, null, 2));
    return;
  }
  if (command === 'batch-action' || command === 'batch-action-and-save') {
    const projectRoot = command === 'batch-action-and-save' ? resolve(firstPath) : null;
    const batch = command === 'batch-action'
      ? JSON.parse(await readFile(resolve(firstPath), 'utf8'))
      : (await import('./project-state.mjs').then(({ readProjectState }) => readProjectState(projectRoot))).references.activeBatch;
    if (!batch) throw new Error('No active reference batch is saved for this project.');
    const actionPath = command === 'batch-action' ? secondPath : secondPath;
    const actions = JSON.parse(await readFile(resolve(actionPath), 'utf8'));
    const { path, ledger } = await readLedger(catalog.fingerprint);
    const result = applyBatchActions(catalog, mergeGlobalBagsIntoBatch(batch, ledger), actions);
    await syncBatchBags(result.batch, path, ledger);
    if (command === 'batch-action-and-save') {
      const { saveReferenceBatch } = await import('./project-state.mjs');
      await saveReferenceBatch(projectRoot, result.batch);
    }
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  throw new Error('Usage: reference-selection.mjs preflight <page-use> [excluded.json] | propose <request.json> | propose-and-save <project-root> <request.json> | propose-batch <request.json> | propose-batch-and-save <project-root> <request.json> | action <session.json> <action.json> [request.json] | action-and-save <project-root> <action.json> | batch-action <batch.json> <actions.json> | batch-action-and-save <project-root> <actions.json>');
};
const isDirectExecution = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirectExecution) main().catch((error) => { console.error(`Design Taste Injection: ${error.message}`); process.exitCode = 1; });

export {
  anchorEligible,
  applyAction,
  applyBatchActions,
  baseScore,
  chooseSet,
  createAutomaticBatch,
  createCustomBatch,
  createSession,
  customCardEligible,
  eligibleQualityBand,
  identityReviewCurrent,
  normalizeBatch,
  normalizeSession,
  preflightCategoryCoverage,
  resolveCardIdentifier,
  resolveCustomCards,
  selectAnchor,
  setSignature,
  validateRequest,
};
