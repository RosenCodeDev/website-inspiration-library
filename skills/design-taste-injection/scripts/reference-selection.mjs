#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const quality = { canonical: 1, usable: 0.65, limited: 0.3 };
const fitRank = { exact: 0, adjacent: 1, 'aesthetic-only': 2 };
const sessionSchemaVersion = 3;
const words = (value) => new Set(String(value ?? '').toLowerCase().match(/[a-z0-9]+/g) ?? []);
const overlap = (left, right) => {
  if (!left.size) return 0.5;
  let matches = 0;
  for (const token of left) if (right.has(token)) matches += 1;
  return Math.min(1, matches / Math.max(3, left.size));
};
const unique = (values) => [...new Set(values)];
const cardText = (card) => words([
  card.title, card.description, card.scope, card.interfaceInventory, card.primaryCategory,
  ...card.tags, card.workflow.bestFor, ...card.workflow.roles, ...card.workflow.pageUses,
].join(' '));

const normalizeRequestShape = (request) => ({
  category: request?.category,
  pageUse: request?.pageUse,
  fitMode: request?.fitMode ?? 'implementation',
  groupPolicy: request?.groupPolicy ?? 'diverse',
  allowFallback: request?.allowFallback === true,
  keywords: request?.keywords ?? [],
  roles: request?.roles ?? [],
  fitById: request?.fitById ?? {},
  usage: request?.usage ?? {},
  pinned: request?.pinned ?? [],
  excluded: request?.excluded ?? [],
});

const anchorFit = (card, request) => {
  if (card.primaryCategory !== request.category || card.quality.tier === 'limited') return null;
  if (card.workflow.anchorUses.includes(request.pageUse)) return 'exact';
  if (request.fitMode === 'implementation' && !request.allowFallback) return null;
  if (card.workflow.pageUses.includes(request.pageUse)) return 'adjacent';
  return 'aesthetic-only';
};
const anchorEligible = (card, request) => anchorFit(card, normalizeRequestShape(request)) !== null;
const catalogSets = (catalog) => ({
  ids: new Set(catalog.cards.map((card) => card.id)),
  categories: new Set(catalog.categories),
  roles: new Set(catalog.cards.flatMap((card) => card.workflow.roles)),
  pageUses: new Set(catalog.cards.flatMap((card) => card.workflow.pageUses)),
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
  if (!['exploratory', 'implementation'].includes(request.fitMode)) throw new Error('fitMode must be exploratory or implementation');
  if (!['diverse', 'system-depth'].includes(request.groupPolicy)) throw new Error('groupPolicy must be diverse or system-depth');
  assertStringArray(request.keywords, 'keywords');
  assertStringArray(request.roles, 'roles');
  for (const role of request.roles) if (!allowed.roles.has(role)) throw new Error(`Unknown requested role: ${role}`);
  assertStringArray(request.excluded, 'excluded');
  for (const id of request.excluded) if (!allowed.ids.has(id)) throw new Error(`Unknown excluded card: ${id}`);
  if (!request.fitById || typeof request.fitById !== 'object' || Array.isArray(request.fitById)) throw new Error('fitById must be an object');
  for (const [id, score] of Object.entries(request.fitById)) {
    if (!allowed.ids.has(id)) throw new Error(`Unknown fitById card: ${id}`);
    if (!Number.isFinite(score) || score < 0 || score > 1) throw new Error(`fitById score must be between 0 and 1: ${id}`);
  }
  if (!request.usage || typeof request.usage !== 'object' || Array.isArray(request.usage)) throw new Error('usage must be an object');
  for (const [id, count] of Object.entries(request.usage)) {
    if (!allowed.ids.has(id)) throw new Error(`Unknown usage card: ${id}`);
    if (!Number.isInteger(count) || count < 0) throw new Error(`usage must contain nonnegative integers: ${id}`);
  }
  if (!Array.isArray(request.pinned) || request.pinned.length > 3) throw new Error('pinned must contain at most three records');
  const pinnedIds = request.pinned.map((pin) => pin?.id);
  if (unique(pinnedIds).length !== pinnedIds.length) throw new Error('Pinned cards must be unique');
  let anchorPins = 0;
  for (const pin of request.pinned) {
    if (!pin || !allowed.ids.has(pin.id)) throw new Error(`Unknown pinned card: ${pin?.id ?? '(missing)'}`);
    if (request.excluded.includes(pin.id)) throw new Error(`Pinned card is also excluded: ${pin.id}`);
    if (pin.role === 'anchor') anchorPins += 1;
    else if (!allowed.roles.has(pin.role)) throw new Error(`Unknown pinned role: ${pin.role ?? '(missing)'}`);
  }
  if (anchorPins > 1) throw new Error('A direction can have only one pinned anchor');
  return request;
};

const baseScore = (card, request, role) => {
  const semantic = request.fitById?.[card.id] ?? overlap(words(request.keywords.join(' ')), cardText(card));
  const pageFit = card.workflow.pageUses.includes(request.pageUse) ? 1 : 0.2;
  const roleCoverage = request.roles.length ? request.roles.filter((item) => card.workflow.roles.includes(item)).length / request.roles.length : 0.7;
  const strength = role === 'anchor' ? card.workflow.anchorStrength / 5 : card.workflow.supportingStrength / 5;
  const roleFit = (roleCoverage * 0.65) + (strength * 0.35);
  const sourceQuality = quality[card.quality.tier] ?? 0;
  const priorUses = request.usage[card.id] ?? 0;
  const diversity = 1 / (1 + priorUses);
  return (semantic * 30) + (pageFit * 20) + (roleFit * 20) + (sourceQuality * 10) + (diversity * 5);
};
const combinations = (items, size, start = 0, prefix = [], output = []) => {
  if (prefix.length === size) { output.push(prefix); return output; }
  for (let index = start; index <= items.length - (size - prefix.length); index += 1) combinations(items, size, index + 1, [...prefix, items[index]], output);
  return output;
};
const roleForSupport = (card, request, alreadyCovered, pinnedRole) => {
  if (pinnedRole) return pinnedRole;
  return request.roles.find((role) => !alreadyCovered.has(role) && card.workflow.roles.includes(role))
    ?? card.workflow.roles.find((role) => !alreadyCovered.has(role))
    ?? card.workflow.roles[0];
};
const setSignature = (set) => `${set.anchor.id}|${set.supporting.map((item) => `${item.id}:${item.role}`).sort().join('|')}`;
const setIds = (set) => [set.anchor.id, ...set.supporting.map((item) => item.id)];
const designSystemId = (card) => card.designSystem?.id ?? null;
const groupingAllowed = (cards, request) => {
  const grouped = new Map();
  for (const card of cards) {
    const id = designSystemId(card);
    if (id) grouped.set(id, [...(grouped.get(id) ?? []), card.id]);
  }
  for (const ids of grouped.values()) {
    if (ids.length < 2) continue;
    if (request.groupPolicy === 'system-depth') continue;
    if (ids.every((id) => request.pinned.some((pin) => pin.id === id))) continue;
    return false;
  }
  return true;
};

const buildCandidates = (catalog, request) => {
  const excluded = new Set(request.excluded);
  const categoryCards = catalog.cards.filter((card) => card.filters.includes(request.category) && !excluded.has(card.id));
  if (!categoryCards.length) throw new Error(`No references are available for ${request.category}`);
  const pinned = request.pinned.map((pin) => {
    const card = categoryCards.find((item) => item.id === pin.id);
    if (!card) throw new Error(`Pinned card is unavailable in ${request.category}: ${pin.id}`);
    if (pin.role === 'anchor' && !anchorEligible(card, request)) throw new Error(`Pinned card cannot anchor ${request.category} for ${request.pageUse}: ${pin.id}`);
    if (pin.role !== 'anchor' && !card.workflow.roles.includes(pin.role)) throw new Error(`Pinned card cannot serve ${pin.role}: ${pin.id}`);
    return { card, role: pin.role };
  });
  const pinnedAnchor = pinned.find((item) => item.role === 'anchor');
  const pinnedSupports = pinned.filter((item) => item.role !== 'anchor');
  const anchorCards = pinnedAnchor ? [pinnedAnchor.card] : categoryCards.filter((card) => anchorEligible(card, request) && !pinnedSupports.some((item) => item.card.id === card.id));
  if (!anchorCards.length) throw new Error(`No safe primary anchor is available for ${request.category} and ${request.pageUse}`);
  const output = [];
  for (const anchor of anchorCards) {
    const remaining = categoryCards.filter((card) => card.id !== anchor.id && !pinnedSupports.some((item) => item.card.id === card.id));
    const needed = Math.min(2 - pinnedSupports.length, remaining.length);
    const supportChoices = needed > 0 ? combinations(remaining, needed) : [[]];
    for (const choice of supportChoices) {
      const supportCards = [...pinnedSupports.map((item) => item.card), ...choice];
      if (!groupingAllowed([anchor, ...supportCards], request)) continue;
      const covered = new Set(anchor.workflow.roles);
      const supporting = supportCards.map((card) => {
        const pinnedRole = pinnedSupports.find((item) => item.card.id === card.id)?.role;
        const role = roleForSupport(card, request, covered, pinnedRole);
        for (const item of card.workflow.roles) covered.add(item);
        return { id: card.id, title: card.title, role, score: Number(baseScore(card, request, 'support').toFixed(2)) };
      });
      if (new Set(supporting.map((item) => item.role)).size !== supporting.length) continue;
      const fit = anchorFit(anchor, request);
      const complementarity = unique([anchor, ...supportCards].flatMap((card) => card.workflow.roles)).length;
      const rawScore = baseScore(anchor, request, 'anchor') + supporting.reduce((sum, item) => sum + item.score, 0) + (complementarity * 2);
      const set = { category: request.category, fitMode: request.fitMode, anchorFit: fit, anchor: { id: anchor.id, title: anchor.title, role: 'anchor', score: Number(baseScore(anchor, request, 'anchor').toFixed(2)) }, supporting, score: Number(rawScore.toFixed(2)) };
      output.push({ ...set, signature: setSignature(set) });
    }
  }
  return output;
};

const chooseSet = (catalog, rawRequest, options = {}) => {
  const request = validateRequest(catalog, rawRequest);
  const blocked = new Set(options.blockedSignatures ?? []);
  const recentSets = options.recentSets ?? [];
  const candidates = buildCandidates(catalog, request);
  const scoreCandidate = (candidate) => {
    const ids = setIds(candidate);
    const historicalOverlap = recentSets.reduce((sum, set) => sum + ids.filter((id) => setIds(set).includes(id)).length, 0);
    return candidate.score - (fitRank[candidate.anchorFit] * 30) - (ids.reduce((sum, id) => sum + (request.usage[id] ?? 0), 0) * 12) - (historicalOverlap * 18);
  };
  const unseen = candidates.filter((candidate) => !blocked.has(candidate.signature));
  const selected = (unseen.length ? unseen : candidates).sort((left, right) => scoreCandidate(right) - scoreCandidate(left))[0];
  if (!selected) throw new Error(`No valid reference set is available for ${request.category}`);
  return { ...selected, reused: unseen.length === 0 };
};

const createSession = (catalog, rawRequest) => {
  const request = validateRequest(catalog, rawRequest);
  return { schemaVersion: sessionSchemaVersion, catalogFingerprint: catalog.fingerprint, request, pinned: structuredClone(request.pinned), excluded: structuredClone(request.excluded), usage: structuredClone(request.usage), history: [], acceptedSets: [], currentSet: chooseSet(catalog, request), accepted: false, exhausted: false };
};
const validateSetRecord = (catalog, request, set, label, { enforceCurrent = false } = {}) => {
  if (!set || typeof set !== 'object' || !set.anchor || !Array.isArray(set.supporting) || set.supporting.length > 2) throw new Error(`${label} is missing or invalid`);
  const entries = [set.anchor, ...set.supporting];
  const ids = entries.map((entry) => entry?.id);
  if (unique(ids).length !== ids.length) throw new Error(`${label} contains duplicate cards`);
  if (set.anchor.role !== 'anchor' || set.supporting.some((item) => item?.role === 'anchor')) throw new Error(`${label} must contain exactly one anchor`);
  for (const entry of entries) {
    const card = catalog.cards.find((item) => item.id === entry.id);
    if (!card) throw new Error(`${label} contains unknown card: ${entry.id ?? '(missing)'}`);
    if (!Number.isFinite(entry.score) || entry.score < 0 || entry.score > 100) throw new Error(`${label} contains invalid score for ${entry.id}`);
    if (entry.role !== 'anchor' && !card.workflow.roles.includes(entry.role)) throw new Error(`${label} assigns an unsupported role to ${entry.id}`);
    if (enforceCurrent && request.excluded.includes(entry.id)) throw new Error(`${label} contains excluded card: ${entry.id}`);
  }
  if (!Number.isFinite(set.score) || set.score < 0 || set.score > 400) throw new Error(`${label} contains invalid total score`);
  if (set.category !== request.category || !['exploratory', 'implementation'].includes(set.fitMode) || !Object.hasOwn(fitRank, set.anchorFit)) throw new Error(`${label} has invalid category or fit metadata`);
  if (set.signature !== setSignature(set)) throw new Error(`${label} signature does not match its cards and roles`);
  if (enforceCurrent && !anchorEligible(catalog.cards.find((item) => item.id === set.anchor.id), request)) throw new Error(`${label} anchor is ineligible`);
  return set;
};
const normalizeSession = (catalog, rawSession, fallbackRequest) => {
  if (!rawSession || typeof rawSession !== 'object' || Array.isArray(rawSession)) throw new Error('session must be an object');
  const request = validateRequest(catalog, rawSession.request ?? fallbackRequest ?? {});
  if (rawSession.schemaVersion !== sessionSchemaVersion) throw new Error(`session schemaVersion must be ${sessionSchemaVersion}`);
  if (rawSession.catalogFingerprint !== catalog.fingerprint) throw new Error('selection session requires revalidation against the current catalog');
  if (!Array.isArray(rawSession.history ?? []) || !Array.isArray(rawSession.acceptedSets ?? [])) throw new Error('session history and acceptedSets must be arrays');
  const session = { schemaVersion: sessionSchemaVersion, catalogFingerprint: rawSession.catalogFingerprint, request, pinned: structuredClone(rawSession.pinned ?? request.pinned), excluded: structuredClone(rawSession.excluded ?? request.excluded), usage: structuredClone(rawSession.usage ?? request.usage), history: structuredClone(rawSession.history ?? []), acceptedSets: structuredClone(rawSession.acceptedSets ?? []), currentSet: structuredClone(rawSession.currentSet), accepted: rawSession.accepted === true, exhausted: rawSession.exhausted === true };
  session.request = validateRequest(catalog, { ...request, pinned: session.pinned, excluded: session.excluded, usage: session.usage });
  validateSetRecord(catalog, session.request, session.currentSet, 'session currentSet', { enforceCurrent: true });
  session.history.forEach((set, index) => validateSetRecord(catalog, request, set, `session history[${index}]`));
  session.acceptedSets.forEach((set, index) => validateSetRecord(catalog, request, set, `session acceptedSets[${index}]`));
  for (const pin of session.pinned) {
    const item = [session.currentSet.anchor, ...session.currentSet.supporting].find((entry) => entry.id === pin.id);
    if (!item || item.role !== pin.role) throw new Error(`Pinned card is not fixed in the current set: ${pin.id}`);
  }
  return session;
};
const incrementUsage = (session, set, amount = 1) => {
  for (const id of setIds(set)) session.usage[id] = (session.usage[id] ?? 0) + amount;
  session.request.usage = structuredClone(session.usage);
};
const replacementCard = (catalog, session, action, currentItem) => {
  const currentIds = new Set(setIds(session.currentSet));
  const candidates = catalog.cards.filter((card) => card.filters.includes(session.request.category) && !session.excluded.includes(card.id) && !currentIds.has(card.id) && card.id !== currentItem.id && (currentItem.role === 'anchor' ? anchorEligible(card, session.request) : card.workflow.roles.includes(currentItem.role)));
  if (action.replacementId) {
    const card = candidates.find((candidate) => candidate.id === action.replacementId);
    if (!card) throw new Error('Requested replacement is unavailable, duplicated, excluded, or ineligible for this slot.');
    return card;
  }
  const card = candidates.sort((left, right) => baseScore(right, session.request, currentItem.role === 'anchor' ? 'anchor' : 'support') - baseScore(left, session.request, currentItem.role === 'anchor' ? 'anchor' : 'support'))[0];
  if (!card) throw new Error(`No replacement is available for ${currentItem.role}`);
  return card;
};
const swapCurrentSlot = (catalog, session, action) => {
  const all = [session.currentSet.anchor, ...session.currentSet.supporting];
  const index = all.findIndex((item) => item.id === action.cardId);
  if (index < 0) throw new Error(`Card is not in the current set: ${action.cardId}`);
  if (session.pinned.some((pin) => pin.id === action.cardId)) throw new Error('Unpin this card before swapping it.');
  const current = all[index];
  if (action.role && action.role !== current.role) throw new Error('SWAP preserves the current slot role.');
  const replacement = replacementCard(catalog, session, action, current);
  all[index] = { id: replacement.id, title: replacement.title, role: current.role, score: Number(baseScore(replacement, session.request, current.role === 'anchor' ? 'anchor' : 'support').toFixed(2)) };
  const anchor = all.find((item) => item.role === 'anchor');
  const supporting = all.filter((item) => item.role !== 'anchor');
  if (!anchor || supporting.length > 2 || unique(all.map((item) => item.id)).length !== all.length) throw new Error('Replacement would create an invalid set.');
  const selectedCards = all.map((item) => catalog.cards.find((card) => card.id === item.id));
  const complementarity = unique(selectedCards.flatMap((card) => card.workflow.roles)).length;
  const set = { ...session.currentSet, anchorFit: current.role === 'anchor' ? anchorFit(replacement, session.request) : session.currentSet.anchorFit, anchor, supporting, score: Number((all.reduce((sum, item) => sum + item.score, 0) + (complementarity * 2)).toFixed(2)), reused: false };
  set.signature = setSignature(set);
  return set;
};
const validateAction = (action) => {
  if (!action || typeof action !== 'object' || Array.isArray(action)) throw new Error('action must be an object');
  const types = ['ACCEPT ALL', 'PIN THIS CARD', 'DO NOT USE THIS CARD', 'SHOW ANOTHER SET', 'SWAP'];
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
    incrementUsage(next, next.currentSet);
    if (!next.acceptedSets.some((set) => set.signature === next.currentSet.signature)) next.acceptedSets.push(structuredClone(next.currentSet));
    return { ...next, accepted: true, next: 'advance' };
  }
  if (action.type === 'PIN THIS CARD') {
    const item = [next.currentSet.anchor, ...next.currentSet.supporting].find((entry) => entry.id === action.cardId);
    if (!item) throw new Error(`Card is not in the current set: ${action.cardId}`);
    if (action.role && action.role !== item.role) throw new Error('Pinning preserves the card’s current role.');
    const existing = next.pinned.find((pin) => pin.id === item.id);
    if (existing) existing.role = item.role; else next.pinned.push({ id: item.id, role: item.role });
    next.request = validateRequest(catalog, { ...next.request, pinned: next.pinned, excluded: next.excluded, usage: next.usage });
    return { ...next, accepted: false, next: 'ask-keep-or-refresh-unpinned' };
  }
  if (action.type === 'DO NOT USE THIS CARD') {
    if (!setIds(next.currentSet).includes(action.cardId)) throw new Error(`Card is not in the current set: ${action.cardId}`);
    incrementUsage(next, next.currentSet);
    next.excluded = unique([...next.excluded, action.cardId]);
    next.pinned = next.pinned.filter((pin) => pin.id !== action.cardId);
    next.history.push(structuredClone(next.currentSet));
    next.request = validateRequest(catalog, { ...next.request, pinned: next.pinned, excluded: next.excluded, usage: next.usage });
    next.currentSet = chooseSet(catalog, next.request, { blockedSignatures: next.history.map((set) => set.signature), recentSets: next.history });
    next.exhausted = next.currentSet.reused;
    return { ...next, accepted: false, next: next.exhausted ? 'review-reused-set-library-exhausted' : 'review-automatic-replacement' };
  }
  if (action.type === 'SHOW ANOTHER SET') {
    incrementUsage(next, next.currentSet);
    next.history.push(structuredClone(next.currentSet));
    next.request = validateRequest(catalog, { ...next.request, pinned: next.pinned, excluded: next.excluded, usage: next.usage });
    next.currentSet = chooseSet(catalog, next.request, { blockedSignatures: next.history.map((set) => set.signature), recentSets: next.history });
    next.exhausted = next.currentSet.reused;
    return { ...next, accepted: false, next: next.exhausted ? 'review-reused-set-library-exhausted' : 'review-alternate-set' };
  }
  if (action.type === 'SWAP') {
    incrementUsage(next, next.currentSet);
    next.history.push(structuredClone(next.currentSet));
    next.currentSet = swapCurrentSlot(catalog, next, action);
    return { ...next, accepted: false, next: 'review-replacement' };
  }
  throw new Error(`Unknown action: ${action.type}`);
};

const loadCatalog = () => {
  const result = spawnSync(process.execPath, [resolve(scriptDir, 'library.mjs'), 'catalog'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Could not read library catalog.');
  return JSON.parse(result.stdout);
};
const main = async () => {
  const [command, firstPath, secondPath, thirdPath] = process.argv.slice(2);
  if (!command) return;
  const catalog = loadCatalog();
  if (command === 'propose') {
    const request = JSON.parse(await readFile(resolve(firstPath), 'utf8'));
    console.log(JSON.stringify(createSession(catalog, request), null, 2));
    return;
  }
  if (command === 'action') {
    const session = JSON.parse(await readFile(resolve(firstPath), 'utf8'));
    const action = JSON.parse(await readFile(resolve(secondPath), 'utf8'));
    const request = thirdPath ? JSON.parse(await readFile(resolve(thirdPath), 'utf8')) : undefined;
    console.log(JSON.stringify(applyAction(catalog, session, action, request), null, 2));
    return;
  }
  if (command === 'propose-and-save') {
    const projectRoot = resolve(firstPath);
    const request = JSON.parse(await readFile(resolve(secondPath), 'utf8'));
    const { readProjectState, saveReferenceSession } = await import('./project-state.mjs');
    const state = await readProjectState(projectRoot);
    const usage = { ...state.references.usage };
    for (const [id, count] of Object.entries(request.usage ?? {})) usage[id] = Math.max(usage[id] ?? 0, count);
    const session = createSession(catalog, {
      ...request,
      usage,
      excluded: [...new Set([...state.references.excluded, ...(request.excluded ?? [])])],
    });
    await saveReferenceSession(projectRoot, session);
    console.log(JSON.stringify(session, null, 2));
    return;
  }
  if (command === 'action-and-save') {
    const projectRoot = resolve(firstPath);
    const action = JSON.parse(await readFile(resolve(secondPath), 'utf8'));
    const { readProjectState, saveReferenceSession } = await import('./project-state.mjs');
    const state = await readProjectState(projectRoot);
    if (!state.references.activeSession) throw new Error('No active reference session is saved for this project.');
    const session = applyAction(catalog, state.references.activeSession, action);
    await saveReferenceSession(projectRoot, session);
    console.log(JSON.stringify(session, null, 2));
    return;
  }
  throw new Error('Usage: reference-selection.mjs propose <request.json> | action <session.json> <action.json> [legacy-request.json] | propose-and-save <project-root> <request.json> | action-and-save <project-root> <action.json>');
};
const isDirectExecution = () => Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirectExecution()) main().catch((error) => { console.error(`Design Taste Injection: ${error.message}`); process.exitCode = 1; });

export { anchorEligible, applyAction, baseScore, chooseSet, createSession, normalizeSession, setSignature, validateRequest };
