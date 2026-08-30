import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { categories, references } from '../src/references';
import type { Category } from '../src/reference-schema';
import {
  buildDirectionsPrompt,
  buildHeroImagesPrompt,
  buildVariantsPrompt,
  manualBuildDirectionDescription,
  manualBuildDirectionHeading,
  primaryCategoryReferences,
  randomPrimarySelection,
  reshufflePrimarySelection,
} from '../src/manual-prompts';
import { buildManualDesignReviewTemplate, designReviewTemplateFilename } from '../src/design-review-template';

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
    expect(prompt).not.toContain(manualBuildDirectionHeading);
    expect(prompt).not.toContain(manualBuildDirectionDescription);
    expect(prompt).toContain('using the attached `Design Review Template.html`');
    expect(prompt).toContain(`\`V1\` → \`v1/index.html\` through \`V${selected.length}\` → \`v${selected.length}/index.html\``);
    expect(prompt).toContain(selected[0].imageRecipe.kind === 'none'
      ? selected[0].imageRecipe.reason
      : selected[0].imageRecipe.prompt);
  });

  it('preserves arbitrary ordered manual selections and one folder per direction', () => {
    const cases = [
      [references[0]],
      primaryCategoryReferences(references, manualCategories[0]).slice(0, 4),
      references.slice(0, 23),
    ];
    for (const selected of cases) {
      const prompt = buildDirectionsPrompt(selected);
      expect(prompt).toContain(`Create ${selected.length} version${selected.length === 1 ? '' : 's'} of this page, each in its own folder (v1/ ... v${selected.length}/)`);
      expect(prompt).toContain(`\`V1\` → \`v1/index.html\` through \`V${selected.length}\` → \`v${selected.length}/index.html\``);
      expect(prompt).toContain('Do NOT blend directions.');
      const positions = selected.map((reference) => prompt.indexOf(`stable card ID ${reference.id}`));
      expect(positions.every((position) => position >= 0)).toBe(true);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
    expect(cases[1].every((reference) => reference.primaryCategory === cases[1][0].primaryCategory)).toBe(true);
  });

  it('keeps selection inside the three-variant prompt', () => {
    const reference = references.find((entry) => entry.id === 'site-paper')!;
    const prompt = buildVariantsPrompt(reference, 'v1');

    expect(prompt).toContain(`anchored by ${reference.displayName} [${reference.id}]`);
    expect(prompt).not.toContain(reference.title);
    expect(prompt).toContain('Change the body formats at minimum');
    expect(prompt).toContain('Do not introduce visual influence from any other direction');
    expect(prompt).toContain('Add v1a/, v1b/, and v1c/ to the existing `design-review-entries` block');
  });

  it('downloads an unlimited design-review recipe with a dynamic initial count', () => {
    expect(designReviewTemplateFilename).toBe('Design Review Template.html');
    for (const count of [1, manualCategories.length, 23]) {
      const template = buildManualDesignReviewTemplate(count);
      expect(template).toContain(`name="design-review-initial-version-count" content="${count}"`);
      expect(template).toContain(`through V${count} -> v${count}/index.html`);
      expect(template).toContain('id="design-review-entries"');
      expect(template).toMatch(/id="design-review-entries">\s*\[\]\s*<\/script>/);
      expect(template).toContain('It accepts any number of design entries.');
      expect(template).toContain('class="version-rail"');
      expect(template).toContain('class="comparison-row"');
      expect(template).not.toContain('__INITIAL_VERSION_COUNT__');
      expect(template).not.toContain('__DESIGN_REVIEW_ENTRIES__');
    }
    const source = readFileSync(resolve(process.cwd(), 'src', 'manual-prompts.ts'), 'utf8');
    const templateSource = readFileSync(resolve(process.cwd(), 'skills', 'design-taste-injection', 'assets', 'design-review-template.html'), 'utf8');
    expect(source).not.toContain('through `V7`');
    expect(templateSource).not.toContain('through V7 -> v7/index.html');
  });

  it('includes only the chosen anchor and explicit Prompt 3 references', () => {
    const anchor = references.find((entry) => entry.id === 'site-paper')!;
    const additional = [
      references.find((entry) => entry.id === 'site-cursor')!,
      references.find((entry) => entry.id === 'site-oqoqo')!,
    ];
    const omitted = references.find((entry) => entry.id === 'image-stillness')!;
    const prompt = buildHeroImagesPrompt({ variantLabel: 'v1b', anchor, additionalReferences: additional });

    expect(prompt).toContain(`${anchor.displayName} [${anchor.id}] — chosen variant reference image`);
    for (const reference of additional) {
      expect(prompt).toContain(`${reference.displayName} [${reference.id}] — explicit additional reference`);
      expect(prompt).not.toContain(reference.title);
    }
    expect(prompt).not.toContain(`${omitted.displayName} [${omitted.id}]`);
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
    expect(workbench).toContain('Unselect all');
    expect(workbench).toContain('Download design review template');
    expect(workbench.indexOf('Download design review template')).toBeLessThan(workbench.indexOf('Copy prompt'));
    expect(workbench).not.toContain('Prompt Pack');
    expect(workbench).not.toContain('Review prompt pack');
  });
});
