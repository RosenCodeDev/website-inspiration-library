import type { Category, ReferenceEntry } from './reference-schema';

export type ManualPromptStage = 1 | 2 | 3 | 4;
export type ManualSelectionMode = 'random' | 'manual';

export const manualPromptStageNames = [
  'Build directions',
  'Create three variants',
  'Generate hero images',
  'Add tweak bar',
] as const;

export const manualBuildDirectionHeading = 'MULTI-CARD, CONTEXT-SHARED — NOT SEALED';
export const manualBuildDirectionDescription = 'Each direction is visible within one shared model context.';

export const promptReferenceName = (reference: ReferenceEntry) => reference.displayName;

export const primaryCategoryReferences = (
  catalog: readonly ReferenceEntry[],
  category: Category,
) => catalog
  .filter((reference) => reference.primaryCategory === category)
  .sort((left, right) => left.order - right.order);

const pick = <T,>(items: readonly T[], random: () => number) => (
  items[Math.min(items.length - 1, Math.floor(random() * items.length))]
);

export const randomPrimarySelection = (
  catalog: readonly ReferenceEntry[],
  categories: readonly Category[],
  random: () => number = Math.random,
) => categories.map((category) => pick(primaryCategoryReferences(catalog, category), random).id);

export const reshufflePrimarySelection = (
  catalog: readonly ReferenceEntry[],
  categories: readonly Category[],
  currentIds: ReadonlySet<string>,
  random: () => number = Math.random,
) => categories.map((category) => {
  const categoryCards = primaryCategoryReferences(catalog, category);
  const alternatives = categoryCards.filter((reference) => !currentIds.has(reference.id));
  return pick(alternatives.length > 0 ? alternatives : categoryCards, random).id;
});

const parsedBrief = (brief: string) => Object.fromEntries(
  brief.split(/\r?\n/).map((line) => {
    const separator = line.indexOf(':');
    return separator > 0
      ? [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
      : null;
  }).filter((entry): entry is [string, string] => Boolean(entry))
    .filter(([key]) => key.toLowerCase() !== 'motion'),
);

const identityExclusions = (reference: ReferenceEntry) => {
  const identity = reference.sourceIdentity;
  const exclusions = [
    ...identity.derived.sourceNames,
    ...identity.derived.aliases,
    ...identity.derived.domains,
    ...identity.reviewed.exactCopy,
    ...identity.reviewed.distinctiveClaims,
    ...identity.reviewed.sourceSpecificExclusions,
  ];
  return exclusions.length > 0
    ? exclusions.join(', ')
    : 'source logos, source copy, marks, and identity';
};

const directionBlock = (reference: ReferenceEntry, index: number) => {
  const brief = parsedBrief(reference.brief);
  const observed = Object.entries(brief)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
  const futureHero = reference.imageRecipe.kind === 'none'
    ? `Build or reserve media exactly as reviewed: ${reference.imageRecipe.reason}`
    : reference.imageRecipe.prompt;

  return [
    `--- DIRECTION ${index + 1} (v${index + 1}) — ${reference.primaryCategory.toUpperCase()} — ${reference.displayName.toUpperCase()} [${reference.id}] ---`,
    '',
    `Aesthetic: ${reference.styleDescriptor} — ${reference.description}`,
    `Tags: ${reference.tags.join(', ')}.`,
    '',
    'Observed visual relationships:',
    observed,
    '',
    `Reference: Inspect the canonical still for stable card ID ${reference.id}, card name “${reference.displayName}.” Match its visual relationships and feel, not its source content or identity. Inspect still imagery only; do not inspect motion media.`,
    '',
    `Future hero: ${futureHero}`,
    '',
    `Placement: Composition: ${brief.Composition ?? ''} Spacing: ${brief.Spacing ?? ''} Protect the copy and crop regions described by the future-hero recipe.`,
    '',
    `Output: Build a complete responsive landing page. Use this card as the only visual anchor for this version. Do not copy or reproduce: ${identityExclusions(reference)}.`,
  ].join('\n');
};

export const buildDirectionsPrompt = (selected: readonly ReferenceEntry[]) => [
  'Build a landing page for “[PRODUCT]” — [ONE-SENTENCE DESCRIPTION].',
  '',
  'Intent: [DESIRED FEELING, POSITIONING, AND THREE-SECOND IMPRESSION].',
  '[Example]: a small team\'s unfair advantage. Should feel serious, crafted intelligence — calm and confident, not loud SaaS hype. A founder should think “these people actually understand data” within 3 seconds.',
  '',
  'Guardrails — always: one monumental image anchors the page; imagery is processed, never raw (halftone, dither, grain, ASCII, linework); technical marginalia (coordinates, IDs, ruler ticks, timestamps); type at extremes — monumental display or tiny mono labels, little middle; near-monochrome ground with a single warm accent.',
  '',
  'Never: purple gradients, glossy 3D SaaS blobs, untextured stock photography, rounded-everything friendliness, icon-grid feature rows, Inter/system-font-only typography, evenly distributed colorful palettes.',
  '',
  `Create ${selected.length} version${selected.length === 1 ? '' : 's'} of this page, each in its own folder (v1/ ... v${selected.length}/), one per direction below. Do NOT blend directions. Each version must commit completely to its selected card.`,
  '',
  `Also create a consolidated \`Design Review.html\` at the project root using the attached \`Design Review Template.html\`: edit only its \`design-review-entries\` JSON block to add one ordered entry for every generated version (\`V1\` → \`v1/index.html\` through \`V${selected.length}\` → \`v${selected.length}/index.html\`), preserve the template’s layout and comparison behavior unchanged, and keep every version and all of its assets in its existing folder rather than copying or inlining them into the review file; if the template is missing, ask me to attach it instead of recreating it.`,
  '',
  'IMPORTANT — hero images come later. Do NOT generate or source imagery yet. Reserve the hero slot at the specified geometry and use a flat, visually quiet stand-in. Size the typography and negative space for the future image so it can be inserted without redesigning the page.',
  '',
  selected.map(directionBlock).join('\n\n'),
].join('\n');

export const buildVariantsPrompt = (
  winningReference: ReferenceEntry | null,
  versionLabel: string,
) => {
  if (!winningReference) return '[SELECT A WINNING DIRECTION AFTER REVIEWING PROMPT 1 OUTPUT]';
  const version = versionLabel || '[version number placeholder]';
  return [
    `Let’s go with ${version}, the ${winningReference.primaryCategory} direction anchored by ${winningReference.displayName} [${winningReference.id}].`,
    '',
    'Generate three different versions of that exact aesthetic. Change the body formats at minimum; you may also vary section rhythm, navigation treatment, information density, and composition.',
    '',
    'Preserve the selected direction’s hero geometry, typography logic, palette, texture, spacing grammar, and visual relationships. Keep the future-image stand-in correctly reserved. Do not introduce visual influence from any other direction or inspiration card.',
    '',
    `Write the three variants to ${version}a/, ${version}b/, and ${version}c/. Build each as a complete responsive landing page so I can compare how the aesthetic performs beyond the hero.`,
    '',
    `Add ${version}a/, ${version}b/, and ${version}c/ to the existing \`design-review-entries\` block in \`Design Review.html\`; do not change any other template code or move assets out of their version folders.`,
  ].join('\n');
};

export const buildHeroImagesPrompt = ({
  variantLabel,
  anchor,
  additionalReferences,
}: {
  variantLabel: string;
  anchor: ReferenceEntry | null;
  additionalReferences: readonly ReferenceEntry[];
}) => {
  const version = variantLabel || '[version number placeholder]';
  const referenceName = anchor
    ? `${anchor.displayName} [${anchor.id}]`
    : '[chosen variant reference image placeholder]';
  const recipe = anchor
    ? (anchor.imageRecipe.kind === 'none' ? anchor.imageRecipe.reason : anchor.imageRecipe.prompt)
    : '[chosen variant reference image recipe placeholder]';
  const references = anchor ? [anchor, ...additionalReferences] : additionalReferences;

  return [
    `Let’s go with ${version}. I want to nail the hero image now.`,
    '',
    `Chosen variant reference image: ${referenceName}.`,
    '',
    'Chosen variant reference image recipe:',
    recipe,
    '',
    'Inspect the canonical still for every explicitly selected reference below. Match their relevant visual relationships and feel, not their source content or identity:',
    references.length > 0
      ? references.map((reference) => `- ${reference.displayName} [${reference.id}]${anchor?.id === reference.id ? ' — chosen variant reference image' : ' — explicit additional reference'}`).join('\n')
      : '- [chosen variant reference image placeholder]',
    '',
    'Give me four distinct hero images that fit this page and its exact composition. Keep the protected copy regions and crop geometry already established by the selected variant. Make all four high quality and 2K. Use the configured image-generation tool if it is available; otherwise, use the Higgsfield MCP. Do not change the page layout while generating the options. Pull up all four results when finished.',
  ].join('\n');
};

export const buildTweakBarPrompt = (variantLabel: string) => [
  `Use the currently selected implementation, ${variantLabel || '[version number placeholder]'}.`,
  '',
  'Mimic what happens inside Claude Design and add a dev-only tweak bar that appears on the local development server. Let me change the font family, font size and scale, line length, spacing, body layout and density, palette roles, accent colors, surfaces, texture, borders, radius, shadows, and motion wherever those are meaningful design decisions.',
  '',
  'I already like the hero, so preserve it by default and focus especially on the body. Go fairly aggressive with the useful controls you expose, but keep every control inside the approved visual language instead of turning the page into a generic theme editor.',
  '',
  'Make changes update the page immediately, provide a clear reset to the approved defaults, and keep this tweak interface development-only so it is excluded from the production build.',
].join('\n');
