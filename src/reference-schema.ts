import { z } from 'zod';

export const categoryValues = [
  'Print-Tech Paper',
  'Dither Mono',
  'Vast Quiet Cinematic',
  'Data-as-Texture',
  'Classical Remix',
  'Glitched Antiquity',
  'Illustrated Storybook',
] as const;

export const CategorySchema = z.enum(categoryValues);

export const momentTypeValues = [
  'authentication',
  'footer',
  'hero',
  'landing-page',
  'product-narrative',
  'editorial-feed',
  'article',
  'guide',
  'catalog',
  'gallery',
  'interactive-scene',
  'annotated-feature',
] as const;

export const designRoleValues = [
  'composition',
  'typography',
  'hero-art',
  'navigation',
  'conversion',
  'content-system',
  'data-display',
  'motion',
  'interaction',
  'product-proof',
  'storytelling',
] as const;

export const pageUseValues = [
  'marketing',
  'product',
  'editorial',
  'documentation',
  'campaign',
  'portfolio',
  'authentication',
  'footer',
] as const;

export const ReferenceWorkflowSchema = z.object({
  momentType: z.enum(momentTypeValues),
  roles: z.array(z.enum(designRoleValues)).min(2).max(6),
  pageUses: z.array(z.enum(pageUseValues)).min(1).max(4),
  anchorUses: z.array(z.enum(pageUseValues)).min(1).max(4),
  anchorStrength: z.number().int().min(1).max(5),
  supportingStrength: z.number().int().min(1).max(5),
  bestFor: z.string().min(12).max(180),
  cautions: z.string().min(12).max(180),
  cloneMode: z.enum(['verified-clone-remix', 'inspired-rebuild', 'reference-only']),
  cloneReason: z.string().min(12).max(180),
});

export const CategoryProfileSchema = z.object({
  thesis: z.string().min(12).max(180),
  composition: z.string().min(12).max(220),
  typography: z.string().min(12).max(220),
  palette: z.string().min(12).max(220),
  texture: z.string().min(12).max(220),
  motion: z.string().min(12).max(220),
  codeHero: z.string().min(12).max(220),
  avoid: z.string().min(12).max(220),
});

export const CategoryProfilesSchema = z.record(CategorySchema, CategoryProfileSchema);

export const ImageRecipeSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('primary'),
    prompt: z.string().min(80),
  }),
  z.object({
    kind: z.literal('supporting'),
    prompt: z.string().min(80),
  }),
  z.object({
    kind: z.literal('none'),
    noneMode: z.enum(['code-native', 'authorized-media']),
    permittedMethod: z.string().min(3).max(100),
    reason: z.string().min(60),
  }),
]);

export const SourceIdentitySchema = z.object({
  derived: z.object({
    sourceNames: z.array(z.string().min(1)),
    aliases: z.array(z.string().min(1)),
    domains: z.array(z.string().min(1)),
    assetHashes: z.array(z.string().regex(/^[a-f0-9]{64}$/)),
  }),
  reviewed: z.object({
    exactCopy: z.array(z.string().min(1)),
    distinctiveClaims: z.array(z.string().min(1)),
    knownMarkAssetIds: z.array(z.string().min(1)),
    knownMarkAssetHashes: z.array(z.string().regex(/^[a-f0-9]{64}$/)),
    characters: z.array(z.string().min(1)),
    products: z.array(z.string().min(1)),
    people: z.array(z.string().min(1)),
    packaging: z.array(z.string().min(1)),
    interfaceFragments: z.array(z.string().min(1)),
    sourceSpecificExclusions: z.array(z.string().min(1)),
  }),
  review: z.object({
    reviewStatus: z.enum(['unreviewed', 'reviewed']),
    reviewOrigin: z.enum(['codex-drafted', 'human-reviewed']).nullable(),
    reviewedAt: z.string().nullable(),
    reviewedBy: z.string().nullable(),
    reviewBasis: z.string().nullable(),
    reviewFingerprint: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  }),
});

export const ReferenceEntrySchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(1),
  displayName: z.string().min(1),
  cardDescriptor: z.string().min(1),
  styleDescriptor: z.string().min(1),
  description: z.string().min(1),
  scope: z.string().min(1),
  interfaceInventory: z.string().min(1),
  workflow: ReferenceWorkflowSchema,
  designSystem: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    sharedShell: z.string().min(1),
  }).optional(),
  primaryCategory: CategorySchema,
  filters: z.array(CategorySchema).min(1),
  tags: z.array(z.string().min(1)).min(4).max(8),
  brief: z.string().min(100),
  imageRecipe: ImageRecipeSchema,
  source: z.object({
    kind: z.enum(['image', 'website']),
    siteName: z.string().optional(),
    url: z.string().url().optional(),
    captureMethod: z.enum([
      'original-upload',
      'live-browser-capture',
      'recovered-live',
      'youtube-frame',
      'enhanced-derivative',
      'generated-reconstruction',
    ]),
    capturedAt: z.string().optional(),
    sourceGroupId: z.string().min(1),
    originalAsset: z.string().min(1),
  }),
  sourceIdentity: SourceIdentitySchema,
  media: z.object({
    poster: z.string().min(1),
    detailImage: z.string().min(1),
    original: z.string().min(1),
    motionClip: z.string().min(1).optional(),
    motionNotes: z.string().min(20),
  }),
  quality: z.object({
    tier: z.enum(['canonical', 'usable', 'limited']),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    confidence: z.number().min(0).max(1),
    reliableFor: z.array(z.string().min(1)).min(1),
    note: z.string().min(1),
  }),
});

export const ReferenceManifestSchema = z.array(ReferenceEntrySchema).length(63);

export type Category = z.infer<typeof CategorySchema>;
export type ImageRecipe = z.infer<typeof ImageRecipeSchema>;
export type SourceIdentity = z.infer<typeof SourceIdentitySchema>;
export type ReferenceWorkflow = z.infer<typeof ReferenceWorkflowSchema>;
export type CategoryProfile = z.infer<typeof CategoryProfileSchema>;
export type ReferenceEntry = z.infer<typeof ReferenceEntrySchema>;
