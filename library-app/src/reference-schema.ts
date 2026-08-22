import { z } from 'zod';

export const categoryValues = [
  'Print-Tech Paper',
  'Dither Mono',
  'Vast Quiet Cinematic',
  'Data-as-Texture',
  'Classical Remix',
  'Glitched Antiquity',
  'Illustrated Storybook',
  'Reference Styles',
] as const;

export const CategorySchema = z.enum(categoryValues);

export const ReferenceEntrySchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(1),
  styleDescriptor: z.string().min(1),
  description: z.string().min(1),
  primaryCategory: CategorySchema,
  filters: z.array(CategorySchema).min(1),
  tags: z.array(z.string().min(1)).min(4).max(8),
  brief: z.string().min(100),
  imagePrompt: z.string().min(80),
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
  media: z.object({
    poster: z.string().min(1),
    detailImage: z.string().min(1),
    original: z.string().min(1),
    motionClip: z.string().min(1).optional(),
    motionNotes: z.string().optional(),
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

export const ReferenceManifestSchema = z.array(ReferenceEntrySchema).length(46);

export type Category = z.infer<typeof CategorySchema>;
export type ReferenceEntry = z.infer<typeof ReferenceEntrySchema>;
