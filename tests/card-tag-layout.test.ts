import { describe, expect, it } from 'vitest';
import { optimizeCardTagOrder } from '../src/card-tag-layout';

describe('homepage card tag ordering', () => {
  it('turns a one, two, one layout into a two, one, one layout', () => {
    expect(optimizeCardTagOrder([120, 70, 70, 120], 150)).toEqual([1, 2, 0, 3]);
  });

  it('prefers two balanced pairs over a three and one split', () => {
    expect(optimizeCardTagOrder([48, 48, 48, 90], 150)).toEqual([0, 3, 1, 2]);
  });

  it('keeps authored order when it is already equally optimal', () => {
    expect(optimizeCardTagOrder([70, 70, 70, 70], 150)).toEqual([0, 1, 2, 3]);
  });

  it('returns every original index exactly once', () => {
    const order = optimizeCardTagOrder([185, 92, 136, 64], 220);
    expect([...order].sort((left, right) => left - right)).toEqual([0, 1, 2, 3]);
  });
});
