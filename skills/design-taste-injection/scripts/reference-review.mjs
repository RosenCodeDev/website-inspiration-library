#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readProjectState } from './project-state.mjs';
import { resolveEvidence } from './visual-contract.mjs';

const fail = (message) => { console.error(`Design Taste Injection: ${message}`); process.exitCode = 1; };
const loadCatalog = () => {
  const result = spawnSync(process.execPath, [resolve(fileURLToPath(new URL('.', import.meta.url)), 'library.mjs'), 'catalog'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Could not read the library catalog.');
  return JSON.parse(result.stdout);
};
const briefValue = (brief, key) => String(brief ?? '').split(/\r?\n/).find((line) => line.startsWith(`${key}:`))?.slice(key.length + 1).trim() ?? '';
const markdownPath = (path) => path.replaceAll('\\', '/');
const markdownAlt = (value) => String(value).replaceAll('\\', '\\\\').replaceAll('[', '\\[').replaceAll(']', '\\]');
const renderReviewMarkdown = (catalog, batch, evidenceBySlot) => {
  if (!batch?.items?.length) throw new Error('An active reference batch is required.');
  const lines = [`# Anchor review — ${batch.items.length} direction${batch.items.length === 1 ? '' : 's'}`, '', 'Reply once with `ACCEPT ALL`, or list one or more per-slot actions such as `R01 ACCEPT`, `R02 SHOW ANOTHER CARD`, `R03 SWAP`, `R04 PIN THIS CARD`, `R05 DO NOT USE THIS CARD`, or `USE CUSTOM CARDS: <IDs, exact titles, or canonical URLs>`.', ''];
  for (const item of batch.items) {
    const card = catalog.cards.find((candidate) => candidate.id === item.session?.currentSet?.anchor?.id);
    const evidence = evidenceBySlot[item.slotId];
    if (!card) throw new Error(`Review slot ${item.slotId} references an unknown card.`);
    if (!evidence || !isAbsolute(evidence.destination) || !existsSync(evidence.destination)) throw new Error(`Review slot ${item.slotId} is missing a staged absolute image.`);
    const qualityScore = Math.round(Number(card.quality?.confidence ?? 0) * 100);
    const summary = briefValue(card.brief, 'Preserve') || card.styleDescriptor || card.cardDescriptor;
    const tradeoff = briefValue(card.brief, 'Avoid') || card.quality?.note || 'Review fit against the project requirements before acceptance.';
    const warnings = [...new Set([...(item.warnings ?? []), ...(evidence.warnings ?? [])])];
    lines.push(
      `## ${item.slotId} — ${item.category}`,
      '',
      `- **Card:** ${card.title} (${card.id})`,
      `- **Quality:** ${qualityScore}/100 · ${card.quality.tier}`,
      `- **Status:** ${item.reviewStatus}`,
      `- **Direction:** ${summary}`,
      `- **Tradeoff:** ${tradeoff}`,
      '',
      `![${markdownAlt(`${item.slotId} — ${card.title}`)}](<${markdownPath(evidence.destination)}>)`,
      '',
    );
    if (warnings.length) lines.push(`> **Identity warning:** ${warnings.join(' ')}`, '', '> This direction cannot advance until the required identity-QA checkpoint passes.', '');
  }
  if (batch.notices?.length) lines.push('### Batch notices', '', ...batch.notices.map((notice) => `- ${notice}`), '');
  return `${lines.join('\n').trim()}\n`;
};
const assertReviewMarkdown = (markdown, batch, evidenceBySlot) => {
  if (/```/.test(markdown)) throw new Error('The review may not contain code-fenced image syntax.');
  const images = [...markdown.matchAll(/!\[(?:\\.|[^\]])*\]\((?:<([^>]+)>|([^)]+))\)/g)].map((match) => match[1] ?? match[2]);
  if (images.length !== batch.items.length) throw new Error(`The review must contain exactly ${batch.items.length} inline images.`);
  for (const item of batch.items) {
    const expected = evidenceBySlot[item.slotId]?.destination;
    if (!expected || !images.includes(markdownPath(expected))) throw new Error(`The review is missing the inline still for ${item.slotId}.`);
  }
  return true;
};
const renderActiveReview = async (projectRoot) => {
  const root = resolve(projectRoot);
  const [catalog, state] = await Promise.all([Promise.resolve(loadCatalog()), readProjectState(root)]);
  const batch = state.references?.activeBatch;
  if (!batch) throw new Error('Project state has no active reference batch.');
  const evidenceBySlot = {};
  for (const item of batch.items) {
    const cardId = item.session.currentSet.anchor.id;
    evidenceBySlot[item.slotId] = await resolveEvidence(catalog, root, cardId, { allowIdentityWarning: item.origin === 'user-custom' });
  }
  const markdown = renderReviewMarkdown(catalog, batch, evidenceBySlot);
  assertReviewMarkdown(markdown, batch, evidenceBySlot);
  return markdown;
};
const main = async () => {
  const [command, projectRoot] = process.argv.slice(2);
  if (command !== 'render' || !projectRoot) throw new Error('Usage: reference-review.mjs render <project-root>');
  process.stdout.write(await renderActiveReview(projectRoot));
};
const isDirect = Boolean(process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)));
if (isDirect) main().catch((error) => fail(error.message));

export { assertReviewMarkdown, renderActiveReview, renderReviewMarkdown };
