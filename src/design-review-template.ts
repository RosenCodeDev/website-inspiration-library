import designReviewTemplate from '../skills/design-taste-injection/assets/design-review-template.html?raw';

export const designReviewTemplateFilename = 'Design Review Template.html';

export const buildManualDesignReviewTemplate = (initialVersionCount: number) => {
  if (!Number.isInteger(initialVersionCount) || initialVersionCount < 1) {
    throw new Error('The design review template requires at least one selected version.');
  }
  const rendered = designReviewTemplate
    .replaceAll('__INITIAL_VERSION_COUNT__', String(initialVersionCount))
    .replace('__DESIGN_REVIEW_ENTRIES__', '[]');
  if (rendered.includes('__INITIAL_VERSION_COUNT__') || rendered.includes('__DESIGN_REVIEW_ENTRIES__')) {
    throw new Error('The design review template could not be prepared.');
  }
  return rendered;
};
