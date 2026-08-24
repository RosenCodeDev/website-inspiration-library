import type { ReferenceEntry } from './reference-schema';

const imageModelLead = 'Use with Higgsfield or another image-generation model. Generate at 2K.';

const qualityLimit = {
  canonical: 'Detailed layout, typography, spacing, palette, texture, and hierarchy are reliable.',
  usable: 'Use composition, palette, imagery, and broad hierarchy; do not infer fine typography or texture.',
  limited: 'Use concept, rough composition, and broad color only; do not infer exact UI or typography.',
} as const;

export const buildBriefCopy = (reference: ReferenceEntry) => [
  'Use this brief to implement the reference as a responsive, accessible interface. Treat observed evidence as constraints and recommendations as adaptation guidance.',
  '',
  reference.brief,
].join('\n');

export const buildImagePromptCopy = (reference: ReferenceEntry) => {
  if (reference.imageRecipe.kind === 'none') return null;
  return [imageModelLead, '', reference.imageRecipe.prompt].join('\n');
};
export const buildAgentPacket = (reference: ReferenceEntry) => {
  const recipe = reference.imageRecipe.kind === 'none'
    ? `Build in code: ${reference.imageRecipe.reason}`
    : `${reference.imageRecipe.kind === 'primary' ? 'Primary visual' : 'Supporting compositing layer'}: ${imageModelLead} ${reference.imageRecipe.prompt}`;
  const designSystem = reference.designSystem
    ? `\nShared design system: ${reference.designSystem.name}\nShared shell: ${reference.designSystem.sharedShell}`
    : '';

  return [
    'AGENT PACKET',
    'Use this evidence to design a responsive, accessible interface. Preserve the defining relationships; adapt copy and implementation details to the new product.',
    '',
    `Reference: ${reference.title}`,
    `Style: ${reference.styleDescriptor}`,
    `Description: ${reference.description}`,
    `Scope: ${reference.scope}`,
    `Interface inventory: ${reference.interfaceInventory}`,
    `Category: ${reference.primaryCategory}`,
    `Tags: ${reference.tags.join(', ')}`,
    designSystem.trim(),
    '',
    `Image role: ${recipe}`,
    '',
    'STRUCTURED DESIGN BRIEF',
    reference.brief,
    '',
    'SOURCE EVIDENCE',
    `Capture: ${reference.source.captureMethod.replaceAll('-', ' ')}`,
    `Quality: ${reference.quality.tier}`,
    `Dimensions: ${reference.quality.width} × ${reference.quality.height}`,
    `Reliable for: ${reference.quality.reliableFor.join(', ')}`,
    `Limit: ${qualityLimit[reference.quality.tier]}`,
    '',
    'OBSERVED MOTION',
    reference.media.motionNotes,
  ].filter((line, index, lines) => line !== '' || lines[index - 1] !== '').join('\n').trim();
};
