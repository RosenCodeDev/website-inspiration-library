import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { referenceContent } from '../src/reference-content';
import { categories, references } from '../src/references';
import { buildAgentPacket, buildBriefCopy, buildImagePromptCopy } from '../src/agent-packet';
import { categoryProfiles, referenceWorkflow } from '../src/workflow-intelligence';
import workflowFingerprints from './workflow-fingerprints.json';
import categoryFingerprints from './category-fingerprints.json';

const publicPath = (asset: string) => resolve(process.cwd(), 'public', asset.replace(/^\//, ''));
const archivePath = (...segments: string[]) => resolve(process.cwd(), 'archive', ...segments);

const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');

const stable = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, stable(record[key])]));
  }
  return value;
};

const workflowFingerprint = (reference: (typeof references)[number]) => {
  const card = {
    id: reference.id,
    order: reference.order,
    title: reference.title,
    cardDescriptor: reference.cardDescriptor,
    styleDescriptor: reference.styleDescriptor,
    description: reference.description,
    scope: reference.scope,
    interfaceInventory: reference.interfaceInventory,
    designSystem: reference.designSystem,
    primaryCategory: reference.primaryCategory,
    filters: reference.filters,
    tags: reference.tags,
    brief: reference.brief,
    imageRecipe: reference.imageRecipe,
    source: reference.source,
    media: reference.media,
    quality: reference.quality,
    workflow: reference.workflow,
  };
  return createHash('sha256').update(JSON.stringify(stable(card))).digest('hex').slice(0, 16);
};

const jpegDimensions = (path: string) => {
  const data = readFileSync(path);
  let offset = 2;
  while (offset < data.length) {
    if (data[offset] !== 0xff) { offset += 1; continue; }
    const marker = data[offset + 1];
    const length = data.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error(`No JPEG dimensions found for ${path}`);
};

const rasterDimensions = (path: string) => {
  const data = readFileSync(path);
  if (data.subarray(1, 4).toString('ascii') === 'PNG') {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  return jpegDimensions(path);
};

describe('reference manifest', () => {
  it('contains exactly 63 sequential, unique reference moments', () => {
    expect(references).toHaveLength(63);
    expect(references.map((entry) => entry.order)).toEqual(Array.from({ length: 63 }, (_, index) => index + 1));
    expect(new Set(references.map((entry) => entry.id)).size).toBe(63);
  });

  it('has one canonical authored-content record for every reference', () => {
    expect(Object.keys(referenceContent)).toHaveLength(63);
    expect(new Set(Object.keys(referenceContent))).toEqual(new Set(references.map((entry) => entry.id)));
  });

  it('requires complete workflow intelligence for every card and category', () => {
    expect(Object.keys(referenceWorkflow)).toHaveLength(63);
    expect(new Set(Object.keys(referenceWorkflow))).toEqual(new Set(references.map((entry) => entry.id)));
    expect(Object.keys(categoryProfiles)).toEqual(categories.slice(1));

    for (const entry of references) {
      expect(entry.workflow.roles.length, entry.id).toBeGreaterThanOrEqual(2);
      expect(entry.workflow.pageUses.length, entry.id).toBeGreaterThanOrEqual(1);
      expect(entry.workflow.anchorUses.length, entry.id).toBeGreaterThanOrEqual(1);
      expect(entry.workflow.anchorUses.every((pageUse) => entry.workflow.pageUses.includes(pageUse)), entry.id).toBe(true);
      expect(entry.workflow.cloneReason.split(/\s+/).length, `${entry.id} cloneReason`).toBeLessThanOrEqual(24);
      expect(entry.workflow.bestFor.split(/\s+/).length, `${entry.id} bestFor`).toBeLessThanOrEqual(24);
      expect(entry.workflow.cautions.split(/\s+/).length, `${entry.id} cautions`).toBeLessThanOrEqual(24);
    }
  });

  it('uses an explicit conservative clone-remix allowlist rather than URL presence', () => {
    const approved = [
      'site-spade', 'site-igloo', 'site-lusion', 'site-aside', 'site-jitter',
      'site-coda', 'site-paper', 'site-cursor', 'site-plinth', 'site-fin',
    ];
    expect(references.filter((entry) => entry.workflow.cloneMode === 'verified-clone-remix').map((entry) => entry.id)).toEqual(approved);
    expect(references.find((entry) => entry.id === 'site-apple')?.workflow.cloneMode).toBe('inspired-rebuild');
    expect(references.find((entry) => entry.id === 'site-notion')?.workflow.cloneMode).toBe('inspired-rebuild');
    expect(references.find((entry) => entry.id === 'site-x-intro')?.workflow.cloneMode).toBe('inspired-rebuild');
    expect(references.filter((entry) => !entry.source.url).every((entry) => entry.workflow.cloneMode === 'reference-only')).toBe(true);
  });

  it('requires intentional acknowledgement when card intelligence changes', () => {
    const current = Object.fromEntries(references.map((entry) => [entry.id, workflowFingerprint(entry)]));
    expect(current).toEqual(workflowFingerprints);
  });

  it('keeps category constitutions concise and complete', () => {
    for (const [category, profile] of Object.entries(categoryProfiles)) {
      expect(Object.keys(profile), category).toEqual(['thesis', 'composition', 'typography', 'palette', 'texture', 'motion', 'codeHero', 'avoid']);
      for (const [field, value] of Object.entries(profile)) {
        expect(value.split(/\s+/).length, `${category} ${field}`).toBeLessThanOrEqual(24);
      }
    }
    const current = Object.fromEntries(Object.entries(categoryProfiles).map(([category, profile]) => [
      category,
      createHash('sha256').update(JSON.stringify(stable(profile))).digest('hex').slice(0, 16),
    ]));
    expect(current).toEqual(categoryFingerprints);
  });

  it('uses eleven bespoke brief fields without the retired category defaults', () => {
    const labels = ['Scope', 'Interface inventory', 'Composition', 'Typography', 'Palette', 'Texture', 'Hierarchy', 'Spacing', 'Motion', 'Preserve', 'Avoid'];
    const retiredDefaults = [
      'an editorial serif paired with compact utilitarian mono labels',
      'one high-contrast image or statement dominates a restrained interface',
      'a full-bleed scene carries the experience while copy remains secondary',
      'a readable headline anchors a field of subordinate information',
      'historic imagery and a monumental headline share the focal plane',
      'an archival figure remains recognizable beneath controlled digital disruption',
      'illustration establishes the world, then a concise action completes the story',
    ];

    for (const entry of references) {
      const lines = entry.brief.split('\n');
      expect(lines, entry.id).toHaveLength(11);
      expect(lines.map((line) => line.split(':', 1)[0]), entry.id).toEqual(labels);
      for (const retired of retiredDefaults) expect(entry.brief, entry.id).not.toContain(retired);
    }
  });

  it('separates generated assets from code-native references', () => {
    const counts = { primary: 0, supporting: 0, none: 0 };
    for (const entry of references) {
      counts[entry.imageRecipe.kind] += 1;
      if (entry.imageRecipe.kind === 'none') {
        expect(entry.imageRecipe.reason.length, entry.id).toBeGreaterThanOrEqual(60);
      } else {
        expect(entry.imageRecipe.prompt, entry.id).toContain('[SUBJECT:');
        expect(entry.imageRecipe.prompt, entry.id).not.toContain('website hero concept titled');
        expect(entry.imageRecipe.prompt, entry.id).not.toContain('Use original placeholder copy');
      }
    }
    expect(counts).toEqual({ primary: 34, supporting: 10, none: 19 });
  });

  it('keeps observed motion distinct from suggested brief motion', () => {
    for (const entry of references) {
      if (entry.media.motionClip) {
        expect(entry.media.motionNotes, entry.id).toMatch(/^Trigger:/);
      } else {
        expect(entry.media.motionNotes, entry.id).toBe('No motion captured. Use the brief’s Motion guidance for implementation.');
      }
    }
  });

  it('keeps authored guidance concise and information-dense', () => {
    const wordCount = (value: string) => value.trim().split(/\s+/).length;
    for (const entry of references) {
      expect(wordCount(entry.description), `${entry.id} description`).toBeLessThanOrEqual(35);
      expect(wordCount(entry.scope), `${entry.id} scope`).toBeLessThanOrEqual(12);
      expect(wordCount(entry.interfaceInventory), `${entry.id} interface inventory`).toBeLessThanOrEqual(28);
      expect(entry.styleDescriptor.length, `${entry.id} descriptor`).toBeLessThanOrEqual(64);
      expect(entry.cardDescriptor.length, `${entry.id} card descriptor`).toBeLessThanOrEqual(32);
      for (const tag of entry.tags) expect(wordCount(tag), `${entry.id} tag: ${tag}`).toBeLessThanOrEqual(5);
      if (entry.imageRecipe.kind !== 'none') {
        expect(wordCount(entry.imageRecipe.prompt), `${entry.id} image recipe`).toBeLessThanOrEqual(90);
      }
      for (const [field, value] of Object.entries(referenceContent[entry.id].profile)) {
        expect(wordCount(value), `${entry.id} ${field}`).toBeLessThanOrEqual(40);
      }
    }
  });

  it('uses seven populated visual filters and categorizes every card', () => {
    expect(categories).toHaveLength(8);
    expect(categories).not.toContain('Reference Styles');
    for (const category of categories.slice(1)) {
      expect(references.some((entry) => entry.filters.includes(category))).toBe(true);
    }
    for (const entry of references) {
      expect(entry.filters).toContain(entry.primaryCategory);
      expect(entry.filters.length).toBeGreaterThan(0);
      expect(entry.tags.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('includes all local media and uniform 1600×1000 posters', () => {
    for (const entry of references) {
      for (const asset of [entry.media.poster, entry.media.detailImage, entry.media.original]) {
        expect(existsSync(publicPath(asset)), `${entry.id}: ${asset}`).toBe(true);
      }
      expect(jpegDimensions(publicPath(entry.media.poster)), entry.id).toEqual({ width: 1600, height: 1000 });
      expect(rasterDimensions(publicPath(entry.media.detailImage)), `${entry.id} quality dimensions`).toEqual({
        width: entry.quality.width,
        height: entry.quality.height,
      });
      if (entry.media.motionClip) expect(existsSync(publicPath(entry.media.motionClip))).toBe(true);
    }
  });

  it('uses smart crops only for the five affected grid posters', () => {
    const expectedMedia = {
      58: { poster: '/assets/posters/image-20.jpg', detail: '/assets/originals/20.jpg' },
      59: { poster: '/assets/posters/image-21.jpg', detail: '/assets/originals/21.jpg' },
      60: { poster: '/assets/posters/image-22.jpg', detail: '/assets/originals/22.jpg' },
      62: { poster: '/assets/posters/image-24.jpg', detail: '/assets/originals/24.jpg' },
      63: { poster: '/assets/posters/image-25.jpg', detail: '/assets/originals/25.jpg' },
    } as const;

    for (const [order, media] of Object.entries(expectedMedia)) {
      const entry = references.find((reference) => reference.order === Number(order))!;
      expect(entry.media.poster).toBe(media.poster);
      expect(entry.media.detailImage).toBe(media.detail);
      expect(entry.media.poster).not.toBe(entry.media.detailImage);
    }
  });

  it('copies all 25 active image references byte-for-byte', () => {
    for (let index = 1; index <= 25; index += 1) {
      const reference = references.find((entry) => entry.media.original.match(new RegExp(`/originals/${index}\\.(jpg|png)$`)));
      expect(reference, `missing image ${index}`).toBeDefined();
      const extension = reference!.media.original.split('.').pop();
      const source = archivePath('Example Websites Images', `${index}.${extension}`);
      const copied = publicPath(reference!.media.original);
      expect(sha256(copied), reference!.id).toBe(sha256(source));
    }
  });

  it('keeps the superseded image 1 upload byte-identical in the archive', () => {
    const archived = archivePath('Superseded Source Images', '1-supplied-original.jpg');
    expect(existsSync(archived)).toBe(true);
    expect(sha256(archived)).toBe('bc1d4a8ec65a9b6df1dbd4b4be3e15c5f5243e7420dcbc33dbddd9a67551cfce');
  });

  it('keeps replaced YouTube frames byte-identical in the archive', () => {
    const expected = {
      12: '15f14a67b380c07b21ed9da72b27da9b6a192f7fe1fe70868a5d019224d4e5d9',
      14: '091f218693c9d1fc7b1d1248519394a9df83bb5c34d1db72e6c44bb92c568820',
      16: 'c645900e6558287fac6cbbb546482b34970e75d4372c6a154cf8fbc291266255',
      17: '450127297b598d3aad2e5cddcc3626e9feb9105183512ba786a4f05f3d4bc2d0',
      18: 'bee110f43a3be5e67b510d1b09e5e149b69e872a6c143c035d4b253b828050d2',
    } as const;

    for (const [number, hash] of Object.entries(expected)) {
      const archived = archivePath('Superseded Source Images', `${number}-youtube-original.png`);
      expect(existsSync(archived)).toBe(true);
      expect(sha256(archived)).toBe(hash);
    }
  });

  it('does not connect review-only enhanced or generated candidates to cards', () => {
    const serialized = JSON.stringify(references);
    expect(serialized).not.toContain('_enhanced');
    expect(serialized).not.toContain('_chatgpt_generated');
  });

  it('labels approved generated reconstructions as usable rather than canonical', () => {
    const approved = references.filter((entry) => [12, 14, 16, 17, 18].includes(entry.order));
    expect(approved).toHaveLength(5);
    expect(approved.every((entry) => entry.source.captureMethod === 'generated-reconstruction')).toBe(true);
    expect(approved.every((entry) => entry.quality.tier === 'usable')).toBe(true);
  });

  it('exposes verified links only through website sources', () => {
    const linked = references.filter((entry) => entry.source.url);
    expect(linked).toHaveLength(40);
    expect(linked.every((entry) => entry.source.kind === 'website')).toBe(true);
    expect(linked.every((entry) => entry.source.url?.startsWith('https://'))).toBe(true);
  });

  it('uses the incorporated Don’t Board Me and Orano assets without the retired guide folder', () => {
    const retiredGuideFolders = [
      resolve(process.cwd(), 'Motion and New Static Images'),
      archivePath('Motion and New Static Images'),
    ];
    const serialized = JSON.stringify(references);
    expect(retiredGuideFolders.every((folder) => !existsSync(folder))).toBe(true);
    expect(existsSync(publicPath('/assets/site-captures/06-dont-board-me.png'))).toBe(true);
    expect(existsSync(publicPath('/assets/site-captures/10-orano.png'))).toBe(true);
    expect(serialized).not.toContain('Motion and New Static Images');
  });

  it('keeps related Notion and X Business moments adjacent and grouped', () => {
    const notionIds = references.filter((entry) => entry.source.sourceGroupId === 'notion').map((entry) => entry.id);
    expect(notionIds).toEqual(['site-notion', 'site-notion-releases']);

    const notionEntries = references.filter((entry) => entry.source.sourceGroupId === 'notion');
    expect(new Set(notionEntries.map((entry) => entry.designSystem?.id))).toEqual(new Set(['notion-product-system']));
    expect(new Set(notionEntries.map((entry) => entry.scope)).size).toBe(2);
    for (const entry of notionEntries) {
      expect(buildAgentPacket(entry)).toContain('Shared design system: Notion product ecosystem');
      expect(buildAgentPacket(entry)).toContain('Keep page-specific structure distinct');
    }

    const xIds = references.filter((entry) => entry.source.sourceGroupId === 'x-business').map((entry) => entry.id);
    expect(xIds).toEqual([
      'site-x-advertising',
      'site-x-business',
      'site-x-basics',
      'site-x-intro',
      'site-x-get-started',
      'site-x-organic',
      'site-x-ads-start',
      'site-x-ad-formats',
    ]);
  });

  it('uses motion only for the fourteen approved previews', () => {
    const motionIds = references.filter((entry) => entry.media.motionClip).map((entry) => entry.id);
    expect(motionIds).toEqual([
      'site-spade',
      'site-sstr',
      'site-igloo',
      'site-lusion',
      'site-schemas',
      'site-system-patch',
      'site-oqoqo',
      'site-aside',
      'site-jitter',
      'site-coda',
      'site-paper',
      'site-cursor',
      'site-plinth',
      'site-fin',
    ]);
    expect(new Set(references.filter((entry) => entry.media.motionClip).map((entry) => entry.media.motionClip)).size).toBe(14);
  });

  it('places the new live and supplied references in the approved order', () => {
    expect(references.some((entry) => entry.id === 'site-notom')).toBe(false);
    expect(references.slice(-11).map((entry) => entry.id)).toEqual([
      'site-paper', 'site-cursor', 'site-plinth', 'site-fin', 'image-voidpixel',
      'image-root-soil', 'image-rooted', 'image-meadow', 'image-grilled', 'image-synthos',
    ].concat('image-bloom-brush'));
  });

  it('keeps new card titles concise and free of dash characters', () => {
    const newIds = ['site-plinth', 'site-fin', 'image-root-soil', 'image-rooted', 'image-meadow', 'image-grilled', 'image-synthos', 'image-bloom-brush'];
    for (const id of newIds) {
      const entry = references.find((reference) => reference.id === id)!;
      expect(entry.title, id).not.toMatch(/[-–—]/);
      expect(entry.title.split(/\s+/).length, id).toBeLessThanOrEqual(3);
    }
  });

  it('declares one shared X Business shell without replacing unique content', () => {
    const xEntries = references.filter((entry) => entry.source.sourceGroupId === 'x-business');
    expect(xEntries).toHaveLength(8);
    expect(new Set(xEntries.map((entry) => entry.designSystem?.id))).toEqual(new Set(['x-business-docs']));
    expect(new Set(xEntries.map((entry) => entry.scope)).size).toBe(8);
    expect(new Set(xEntries.map((entry) => JSON.stringify(entry.imageRecipe))).size).toBe(8);
  });

  it('builds complete concise copy outputs for agents', () => {
    for (const entry of references) {
      const packet = buildAgentPacket(entry);
      expect(packet).toContain(`Reference: ${entry.title}`);
      expect(packet).toContain(`Scope: ${entry.scope}`);
      expect(packet).toContain(`Interface inventory: ${entry.interfaceInventory}`);
      expect(packet).toContain('STRUCTURED DESIGN BRIEF');
      expect(packet).toContain('SOURCE EVIDENCE');
      expect(packet).toContain('OBSERVED MOTION');
      expect(buildBriefCopy(entry)).toContain(entry.brief);
      const prompt = buildImagePromptCopy(entry);
      if (entry.imageRecipe.kind === 'none') expect(prompt).toBeNull();
      else {
        expect(prompt).toContain('Use Codex image generation by default');
        expect(prompt).toContain('Higgsfield or another capable image model is optional');
      }
    }
  });

  it('does not claim fine-detail reliability for limited YouTube frames', () => {
    const limited = references.filter((entry) => entry.quality.tier === 'limited');
    for (const entry of limited) {
      expect(entry.quality.reliableFor).not.toContain('typography');
      expect(entry.quality.note.toLowerCase()).toContain('youtube');
    }
  });

  it('keeps modal background inert and announces only concise filter counts', () => {
    const app = readFileSync(resolve(process.cwd(), 'src', 'App.tsx'), 'utf8');
    expect(app).toContain('inert={selected ? true : undefined}');
    expect(app).toContain('aria-hidden={selected ? true : undefined}');
    expect(app).toContain('className="filter-status" role="status" aria-live="polite"');
    expect(app).not.toMatch(/className="reference-grid"[^>]*aria-live/);
  });

  it('lets users hide the category profile bar without changing category filters', () => {
    const app = readFileSync(resolve(process.cwd(), 'src', 'App.tsx'), 'utf8');
    const styles = readFileSync(resolve(process.cwd(), 'src', 'styles.css'), 'utf8');
    expect(app).toContain('const [categoryProfileVisible, setCategoryProfileVisible] = useState(true);');
    expect(app).toContain('aria-pressed={visible}');
    expect(app).toContain('<span>Show category profile</span>');
    expect(app).toContain('{categoryProfileVisible && <CategoryProfileBar key={activeFilter} activeFilter={activeFilter} />}');
    expect(styles).toContain('.category-profile-visibility-toggle.is-on .category-profile-visibility-check::after');
  });
});
