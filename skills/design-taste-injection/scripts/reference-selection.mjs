#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const quality = { canonical: 1, usable: 0.65, limited: 0.3 };

const words = (value) => new Set(String(value ?? '').toLowerCase().match(/[a-z0-9]+/g) ?? []);
const overlap = (left, right) => {
  if (!left.size) return 0.5;
  let matches = 0;
  for (const token of left) if (right.has(token)) matches += 1;
  return Math.min(1, matches / Math.max(3, left.size));
};

const cardText = (card) => words([
  card.title, card.description, card.scope, card.interfaceInventory, card.primaryCategory,
  ...card.tags, card.workflow.bestFor, ...card.workflow.roles, ...card.workflow.pageUses,
].join(' '));

const baseScore = (card, request, role) => {
  const semantic = request.fitById?.[card.id] ?? overlap(words(request.keywords?.join(' ')), cardText(card));
  const pageFit = request.pageUse ? (card.workflow.pageUses.includes(request.pageUse) ? 1 : 0.2) : 0.7;
  const requestedRoles = request.roles ?? [];
  const roleCoverage = requestedRoles.length
    ? requestedRoles.filter((item) => card.workflow.roles.includes(item)).length / requestedRoles.length
    : 0.7;
  const strength = role === 'anchor' ? card.workflow.anchorStrength / 5 : card.workflow.supportingStrength / 5;
  const roleFit = (roleCoverage * 0.65) + (strength * 0.35);
  const sourceQuality = quality[card.quality.tier] ?? 0;
  const priorUses = request.usage?.[card.id] ?? 0;
  const diversity = 1 / (1 + priorUses);
  return (semantic * 30) + (pageFit * 20) + (roleFit * 20) + (sourceQuality * 10) + (diversity * 5);
};

const chooseSet = (catalog, request) => {
  const excluded = new Set(request.excluded ?? []);
  const categoryCards = catalog.cards.filter((card) => card.filters.includes(request.category) && !excluded.has(card.id));
  if (!categoryCards.length) throw new Error(`No eligible cards for ${request.category}`);

  const pinned = (request.pinned ?? []).map((pin) => {
    const card = categoryCards.find((item) => item.id === pin.id);
    if (!card) throw new Error(`Pinned card is unavailable in ${request.category}: ${pin.id}`);
    return { card, role: pin.role };
  });
  if (pinned.length > 3) throw new Error('A direction supports at most three references.');

  const selected = [...pinned];
  if (!selected.some((item) => item.role === 'anchor')) {
    const anchor = categoryCards
      .filter((card) => !selected.some((item) => item.card.id === card.id))
      .sort((a, b) => baseScore(b, request, 'anchor') - baseScore(a, request, 'anchor'))[0];
    if (anchor) selected.unshift({ card: anchor, role: 'anchor' });
  }

  while (selected.length < 3) {
    const coveredRoles = new Set(selected.flatMap((item) => item.card.workflow.roles));
    const desiredRole = (request.roles ?? []).find((role) => !coveredRoles.has(role));
    const candidate = categoryCards
      .filter((card) => !selected.some((item) => item.card.id === card.id))
      .map((card) => {
        const newRoles = card.workflow.roles.filter((role) => !coveredRoles.has(role)).length;
        const complementarity = Math.min(1, newRoles / 3);
        const roleBonus = desiredRole && card.workflow.roles.includes(desiredRole) ? 5 : 0;
        return { card, score: baseScore(card, request, 'support') + (complementarity * 15) + roleBonus };
      })
      .sort((a, b) => b.score - a.score)[0]?.card;
    if (!candidate) break;
    selected.push({ card: candidate, role: desiredRole ?? candidate.workflow.roles[0] });
  }

  const anchor = selected.find((item) => item.role === 'anchor') ?? selected[0];
  const supporting = selected.filter((item) => item !== anchor).slice(0, 2);
  return {
    category: request.category,
    anchor: { id: anchor.card.id, title: anchor.card.title, role: 'anchor', score: Number(baseScore(anchor.card, request, 'anchor').toFixed(2)) },
    supporting: supporting.map(({ card, role }) => ({ id: card.id, title: card.title, role, score: Number(baseScore(card, request, 'support').toFixed(2)) })),
  };
};

const applyAction = (catalog, session, action, request) => {
  const next = structuredClone(session);
  next.pinned ??= [];
  next.excluded ??= [];
  next.history ??= [];

  if (action.type === 'ACCEPT ALL') return { ...next, accepted: true, next: 'advance' };
  if (action.type === 'PIN THIS CARD') {
    if (!next.pinned.some((pin) => pin.id === action.cardId)) next.pinned.push({ id: action.cardId, role: action.role ?? 'support' });
    return { ...next, accepted: false, next: 'ask-keep-or-refresh-unpinned' };
  }
  if (action.type === 'DO NOT USE THIS CARD') {
    next.excluded = [...new Set([...next.excluded, action.cardId])];
    next.pinned = next.pinned.filter((pin) => pin.id !== action.cardId);
    next.currentSet = chooseSet(catalog, { ...request, pinned: next.pinned, excluded: next.excluded });
    return { ...next, accepted: false, next: 'review-automatic-replacement' };
  }
  if (action.type === 'SHOW ANOTHER SET') {
    const used = [next.currentSet?.anchor, ...(next.currentSet?.supporting ?? [])].filter(Boolean).map((item) => item.id);
    const usage = { ...(request.usage ?? {}) };
    for (const id of used) usage[id] = (usage[id] ?? 0) + 3;
    next.history.push(next.currentSet);
    next.currentSet = chooseSet(catalog, { ...request, pinned: next.pinned, excluded: next.excluded, usage });
    return { ...next, accepted: false, next: 'review-alternate-set' };
  }
  if (action.type === 'SWAP') {
    const excluded = action.replacementId ? next.excluded : [...next.excluded, action.cardId];
    const proposed = chooseSet(catalog, { ...request, pinned: next.pinned, excluded });
    if (action.replacementId) {
      const replacement = catalog.cards.find((card) => card.id === action.replacementId);
      if (!replacement || !replacement.filters.includes(request.category)) throw new Error('Requested replacement is unavailable in this category.');
      const all = [proposed.anchor, ...proposed.supporting];
      const slot = all.findIndex((item) => item.id === action.cardId);
      if (slot >= 0) all[slot] = { id: replacement.id, title: replacement.title, role: action.role ?? all[slot].role, score: null };
      next.currentSet = { category: request.category, anchor: all.find((item) => item.role === 'anchor') ?? all[0], supporting: all.filter((item) => item.role !== 'anchor').slice(0, 2) };
    } else next.currentSet = proposed;
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
    console.log(JSON.stringify(chooseSet(catalog, request), null, 2));
    return;
  }
  if (command === 'action') {
    const session = JSON.parse(await readFile(resolve(firstPath), 'utf8'));
    const action = JSON.parse(await readFile(resolve(secondPath), 'utf8'));
    const request = JSON.parse(await readFile(resolve(thirdPath), 'utf8'));
    console.log(JSON.stringify(applyAction(catalog, session, action, request), null, 2));
    return;
  }
  throw new Error('Usage: reference-selection.mjs propose <request.json> | action <session.json> <action.json> <request.json>');
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`Design Taste Injection: ${error.message}`); process.exitCode = 1; });
}

export { applyAction, baseScore, chooseSet };
