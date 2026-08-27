import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { categories, references } from '../src/references';
import type { Category } from '../src/reference-schema';
import {
  buildDirectionsPrompt,
  buildHeroImagesPrompt,
  buildVariantsPrompt,
  primaryCategoryReferences,
  randomPrimarySelection,
  reshufflePrimarySelection,
} from '../src/manual-prompts';

const manualCategories = categories.slice(1) as Category[];

describe('manual prompt workflow', () => {
  it('uses the complete canonical catalog for Prompt 3 category references', () => {
    const expectedTotals: Record<Category, number> = {
      'Print-Tech Paper': 11,
      'Dither Mono': 8,
      'Vast Quiet Cinematic': 12,
      'Data-as-Texture': 13,
      'Classical Remix': 4,
      'Glitched Antiquity': 3,
      'Illustrated Storybook': 12,
    };

    expect(references).toHaveLength(63);
    for (const category of manualCategories) {
      const available = primaryCategoryReferences(references, category);
      expect(available).toHaveLength(expectedTotals[category]);
      const anchor = available[0];
      expect(available.filter((reference) => reference.id !== anchor.id)).toHaveLength(expectedTotals[category] - 1);
    }
  });

  it('selects one primary card per category and reshuffles away from current cards', () => {
    const firstIds = randomPrimarySelection(references, manualCategories, () => 0);
    const firstSet = new Set(firstIds);
    const nextIds = reshufflePrimarySelection(references, manualCategories, firstSet, () => 0);

    expect(firstIds).toHaveLength(manualCategories.length);
    expect(new Set(firstIds).size).toBe(manualCategories.length);
    expect(nextIds).toHaveLength(manualCategories.length);
    expect(nextIds.every((id) => !firstSet.has(id))).toBe(true);
  });

  it('builds card-specific directions without blending references', () => {
    const selected = manualCategories.slice(0, 2).map((category) => primaryCategoryReferences(references, category)[0]);
    const prompt = buildDirectionsPrompt(selected);

    expect(prompt).toContain('Observed visual relationships:');
    expect(prompt).toContain(`stable card ID ${selected[0].id}`);
    expect(prompt).toContain('Inspect still imagery only; do not inspect motion media.');
    expect(prompt).toContain('Do NOT blend directions.');
    expect(prompt).toContain(selected[0].imageRecipe.kind === 'none'
      ? selected[0].imageRecipe.reason
      : selected[0].imageRecipe.prompt);
  });

  it('keeps selection inside the three-variant prompt', () => {
    const reference = references[0];
    const prompt = buildVariantsPrompt(reference, 'v1');

    expect(prompt).toContain(`anchored by ${reference.title} [${reference.id}]`);
    expect(prompt).toContain('Change the body formats at minimum');
    expect(prompt).toContain('Do not introduce visual influence from any other direction');
  });

  it('includes only the chosen anchor and explicit Prompt 3 references', () => {
    const category = manualCategories[0];
    const categoryCards = primaryCategoryReferences(references, category);
    const anchor = categoryCards[0];
    const additional = [categoryCards[2], categoryCards[5]];
    const omitted = categoryCards[1];
    const prompt = buildHeroImagesPrompt({ variantLabel: 'v1b', anchor, additionalReferences: additional });

    expect(prompt).toContain(`${anchor.title} [${anchor.id}] — chosen variant reference image`);
    for (const reference of additional) {
      expect(prompt).toContain(`${reference.title} [${reference.id}] — explicit additional reference`);
    }
    expect(prompt).not.toContain(`${omitted.title} [${omitted.id}]`);
    expect(prompt).toContain('four distinct hero images');
    expect(prompt).toContain('high quality and 2K');
  });

  it('ships the fixed 2.5px selection ring without the mockup tuner', () => {
    const styles = readFileSync(resolve(process.cwd(), 'src', 'styles.css'), 'utf8');
    const workbench = readFileSync(resolve(process.cwd(), 'src', 'ManualPromptWorkbench.tsx'), 'utf8');

    expect(styles).toContain('box-shadow: 0 0 0 2.5px var(--accent);');
    expect(styles).not.toContain('selection-ring-tuner');
    expect(workbench).not.toMatch(/type="range"/);
  });

  it('keeps only the four tutorial-faithful prompt stages', () => {
    const workbench = readFileSync(resolve(process.cwd(), 'src', 'ManualPromptWorkbench.tsx'), 'utf8');
    expect(workbench).toContain('Manual prompts');
    expect(workbench).toContain('Review prompt');
    expect(workbench).not.toContain('Prompt Pack');
    expect(workbench).not.toContain('Review prompt pack');
  });
});
