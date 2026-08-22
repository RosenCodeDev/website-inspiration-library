import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { categories, references } from '../src/references';

const publicPath = (asset: string) => resolve(process.cwd(), 'public', asset.replace(/^\//, ''));

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

describe('reference manifest', () => {
  it('contains exactly 45 sequential, unique reference moments', () => {
    expect(references).toHaveLength(45);
    expect(references.map((entry) => entry.order)).toEqual(Array.from({ length: 45 }, (_, index) => index + 1));
    expect(new Set(references.map((entry) => entry.id)).size).toBe(45);
  });

  it('populates every requested filter', () => {
    for (const category of categories.slice(1)) {
      expect(references.some((entry) => entry.filters.includes(category))).toBe(true);
    }
  });

  it('includes all local media and uniform 1600×1000 posters', () => {
    for (const entry of references) {
      for (const asset of [entry.media.poster, entry.media.detailImage, entry.media.original]) {
        expect(existsSync(publicPath(asset)), `${entry.id}: ${asset}`).toBe(true);
      }
      expect(jpegDimensions(publicPath(entry.media.poster)), entry.id).toEqual({ width: 1600, height: 1000 });
      if (entry.media.motionClip) expect(existsSync(publicPath(entry.media.motionClip))).toBe(true);
    }
  });

  it('preserves all 18 supplied originals byte-for-byte', () => {
    for (let index = 1; index <= 18; index += 1) {
      const reference = references[index - 1];
      const extension = reference.media.original.split('.').pop();
      const source = resolve(process.cwd(), '..', 'Example Websites Images', `${index}.${extension}`);
      const copied = publicPath(reference.media.original);
      expect(sha256(copied), reference.id).toBe(sha256(source));
    }
  });

  it('exposes verified links only through website sources', () => {
    const linked = references.filter((entry) => entry.source.url);
    expect(linked).toHaveLength(29);
    expect(linked.every((entry) => entry.source.kind === 'website')).toBe(true);
    expect(linked.every((entry) => entry.source.url?.startsWith('https://'))).toBe(true);
  });

  it('does not claim fine-detail reliability for limited YouTube frames', () => {
    const limited = references.filter((entry) => entry.quality.tier === 'limited');
    expect(limited).toHaveLength(4);
    for (const entry of limited) {
      expect(entry.quality.reliableFor).not.toContain('typography');
      expect(entry.quality.note.toLowerCase()).toContain('youtube');
    }
  });
});
