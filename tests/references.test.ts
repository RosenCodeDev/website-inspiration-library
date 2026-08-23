import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { categories, references } from '../src/references';

const publicPath = (asset: string) => resolve(process.cwd(), 'public', asset.replace(/^\//, ''));
const archivePath = (...segments: string[]) => resolve(process.cwd(), 'archive', ...segments);

const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');

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
  it('contains exactly 55 sequential, unique reference moments', () => {
    expect(references).toHaveLength(55);
    expect(references.map((entry) => entry.order)).toEqual(Array.from({ length: 55 }, (_, index) => index + 1));
    expect(new Set(references.map((entry) => entry.id)).size).toBe(55);
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

  it('copies all 19 active image references byte-for-byte', () => {
    for (let index = 1; index <= 19; index += 1) {
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
    expect(linked).toHaveLength(38);
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

  it('uses motion only for the ten approved previews', () => {
    const motionIds = references.filter((entry) => entry.media.motionClip).map((entry) => entry.id);
    expect(motionIds).toEqual([
      'site-spade',
      'site-sstr',
      'site-igloo',
      'site-lusion',
      'site-schemas',
      'site-system-patch',
      'site-oqoqo',
      'site-coda',
      'site-paper',
      'site-cursor',
    ]);
    expect(new Set(references.filter((entry) => entry.media.motionClip).map((entry) => entry.media.motionClip)).size).toBe(10);
  });

  it('removes Notom and places Cursor immediately after Paper and before Voidpixel', () => {
    expect(references.some((entry) => entry.id === 'site-notom')).toBe(false);
    expect(references.at(-3)?.id).toBe('site-paper');
    expect(references.at(-2)?.id).toBe('site-cursor');
    expect(references.at(-1)?.id).toBe('image-voidpixel');
  });

  it('does not claim fine-detail reliability for limited YouTube frames', () => {
    const limited = references.filter((entry) => entry.quality.tier === 'limited');
    for (const entry of limited) {
      expect(entry.quality.reliableFor).not.toContain('typography');
      expect(entry.quality.note.toLowerCase()).toContain('youtube');
    }
  });
});
