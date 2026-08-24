import { CategoryProfilesSchema, type Category, type CategoryProfile, type ReferenceWorkflow } from './reference-schema';

type WorkflowSeed = Omit<ReferenceWorkflow, 'anchorUses' | 'cloneMode' | 'cloneReason'>;

const w = (
  momentType: WorkflowSeed['momentType'],
  roles: WorkflowSeed['roles'],
  pageUses: WorkflowSeed['pageUses'],
  anchorStrength: WorkflowSeed['anchorStrength'],
  supportingStrength: WorkflowSeed['supportingStrength'],
  bestFor: string,
  cautions: string,
): WorkflowSeed => ({ momentType, roles, pageUses, anchorStrength, supportingStrength, bestFor, cautions });

const categoryProfileSeeds: Record<Category, CategoryProfile> = {
  'Print-Tech Paper': {
    thesis: 'Editorial structure, tactile print evidence, and precise utility controls.',
    composition: 'Use strong grids, measured margins, asymmetric editorial balance, and clear reading order.',
    typography: 'Pair expressive serif or condensed display type with restrained sans or mono utility text.',
    palette: 'Favor paper neutrals, ink black, and one controlled print accent.',
    texture: 'Use grain, rules, halftone, engraving, paper fibers, or restrained registration effects.',
    motion: 'Prefer deliberate reveals, page turns, or weighted scroll; keep text stable and legible.',
    codeHero: 'Build a print plate with rules, crop marks, halftone fields, and one compositional focal form.',
    avoid: 'Glossy glass cards, soft gradient haze, excessive pills, or generic editorial decoration.',
  },
  'Dither Mono': {
    thesis: 'Monochrome hierarchy shaped by pixels, halftone, grain, and hard contrast.',
    composition: 'Use decisive black-white masses, strict alignment, and one high-contrast focal region.',
    typography: 'Use compact grotesk, serif, or bitmap display type with plain functional labels.',
    palette: 'Keep black, white, and controlled grey; add color only when the chosen reference proves it.',
    texture: 'Use ordered dither, coarse pixels, one-bit engraving, scan grain, or dot fields.',
    motion: 'Animate masks, grain, pixels, or a single focal object without degrading text rendering.',
    codeHero: 'Generate a procedural dot or dither field with a calm text-safe region and hard-edged controls.',
    avoid: 'Unbounded grayscale, neon cyberpunk glow, decorative terminal clichés, or illegible noise.',
  },
  'Vast Quiet Cinematic': {
    thesis: 'Large atmospheric space, restrained copy, and one scene with cinematic weight.',
    composition: 'Let a full-bleed scene dominate while copy occupies a calm, deliberate edge or center zone.',
    typography: 'Use few lines, confident scale contrast, and compact navigation or captions.',
    palette: 'Use a narrow atmospheric palette with controlled exposure and one optional signal accent.',
    texture: 'Favor film grain, fog, soft depth, landscape detail, or large uninterrupted color fields.',
    motion: 'Use slow camera, parallax, environmental drift, or weighted scroll with quiet holds.',
    codeHero: 'Create layered gradients, fog bands, horizon geometry, and a slow depth field in CSS or canvas.',
    avoid: 'Dense card grids, busy utility chrome, fast bounce motion, or copy covering the focal subject.',
  },
  'Data-as-Texture': {
    thesis: 'Information, systems, and product evidence become the visual material.',
    composition: 'Organize diagrams, interfaces, labels, and modules into a readable evidence hierarchy.',
    typography: 'Use clear grotesk or mono labels with disciplined scale, alignment, and annotation logic.',
    palette: 'Start neutral; use functional accents to encode state, path, or priority.',
    texture: 'Use grids, nodes, traces, dashboards, tables, plots, and repeated interface fragments.',
    motion: 'Reveal relationships, state changes, and scroll-linked system progression; keep data readable.',
    codeHero: 'Build a real SVG or canvas system map with labeled nodes, paths, and restrained live signals.',
    avoid: 'Fake unreadable dashboards, random charts, decorative data noise, or generated interface text.',
  },
  'Classical Remix': {
    thesis: 'Historic imagery and formal typography recast through contemporary digital structure.',
    composition: 'Balance monumental art or architecture with modern navigation, copy, and controls.',
    typography: 'Use high-contrast serif display type with concise modern sans or mono support.',
    palette: 'Use stone, ink, parchment, earth, or museum neutrals with one restrained digital accent.',
    texture: 'Use engraving, fresco, sculpture, archival plates, patina, or paper grain.',
    motion: 'Use slow reveals, masks, tracking lines, or measured parallax; preserve material dignity.',
    codeHero: 'Compose concentric geometry, archival frames, ruled labels, and a central sculptural silhouette.',
    avoid: 'Theme-park antiquity, ornamental overload, fake Latin, gold gradients, or fantasy-game chrome.',
  },
  'Glitched Antiquity': {
    thesis: 'Archival or ancient material disrupted by controlled digital artifacts.',
    composition: 'Keep the historic subject recognizable while glitches occupy defined layers or edges.',
    typography: 'Pair formal display type with technical labels, pixel text, or narrow utility copy.',
    palette: 'Use aged neutrals or monochrome with sparse electric or registration accents.',
    texture: 'Combine scan lines, pixels, displacement, compression, ink, stone, or celestial diagrams.',
    motion: 'Use brief signal breaks, displacement, scan passes, or state shifts rather than constant noise.',
    codeHero: 'Layer an archival silhouette with clipped scan bands, coordinate lines, and reversible distortion.',
    avoid: 'Full-screen random glitch, generic hacker motifs, unreadable copy, or effects without hierarchy.',
  },
  'Illustrated Storybook': {
    thesis: 'Illustration establishes a coherent world and a simple human path through it.',
    composition: 'Use scene layers, clear character or object focus, and protected space for copy and actions.',
    typography: 'Use warm editorial display type with plain, accessible supporting text and controls.',
    palette: 'Use a limited illustrated palette with intentional foreground, midground, and background contrast.',
    texture: 'Use ink, watercolor, vector fields, botanical marks, paper, or lightly irregular linework.',
    motion: 'Animate environmental layers or one narrative beat; keep conversion controls anchored.',
    codeHero: 'Build layered SVG scenery with a horizon, organic silhouettes, one focal character, and subtle drift.',
    avoid: 'Stock mascot art, unrelated decorative stickers, excessive cuteness, or motion on every element.',
  },
};

export const categoryProfiles = CategoryProfilesSchema.parse(categoryProfileSeeds);

export const referenceWorkflow: Record<string, WorkflowSeed> = {
  'image-astra-ai': w('hero', ['composition', 'typography', 'hero-art', 'conversion'], ['marketing', 'product'], 4, 5, 'Monochrome AI propositions with a real command surface.', 'Do not infer product behavior from decorative halftone fragments.'),
  'image-dark-portal': w('authentication', ['composition', 'typography', 'hero-art', 'conversion'], ['authentication', 'product'], 5, 4, 'High-contrast authentication with a cinematic split.', 'The severe dark treatment needs accessible form contrast.'),
  'image-light-portal': w('authentication', ['composition', 'typography', 'hero-art', 'conversion'], ['authentication', 'product'], 5, 4, 'Light authentication with an atmospheric split.', 'Keep controls crisp against the soft photographic side.'),
  'image-castle-waitlist': w('hero', ['composition', 'typography', 'hero-art', 'conversion'], ['marketing', 'campaign'], 5, 5, 'Waitlists needing monumental type and one engraved subject.', 'Replace the castle rather than copying its identity.'),
  'image-flora-footer': w('footer', ['composition', 'hero-art', 'navigation', 'content-system'], ['footer', 'editorial'], 4, 5, 'Illustrated footers that integrate utility into scenery.', 'Maintain link legibility over the illustrated field.'),
  'image-bloomride': w('hero', ['composition', 'typography', 'hero-art', 'conversion'], ['marketing', 'campaign'], 5, 4, 'Optimistic travel or place-based landing pages.', 'Protect open sky for real HTML copy and actions.'),
  'image-voypix': w('hero', ['composition', 'typography', 'hero-art', 'conversion'], ['marketing', 'portfolio'], 4, 5, 'Creative tools needing a tactile pixel collage.', 'Use the hand motif only when it serves the new product.'),
  'image-nova-stack': w('hero', ['composition', 'data-display', 'product-proof', 'conversion'], ['product', 'marketing'], 5, 5, 'Developer platforms needing an integration map.', 'Build labels and integration states as real interface content.'),
  'image-auron-architecture': w('hero', ['composition', 'typography', 'hero-art', 'navigation'], ['portfolio', 'marketing'], 5, 4, 'Formal studios needing architectural authority.', 'Avoid ornamental excess and preserve modern usability.'),
  'image-vitra-waitlist': w('hero', ['composition', 'typography', 'hero-art', 'conversion'], ['marketing', 'campaign'], 4, 5, 'Friendly editorial waitlists with a single illustrated scene.', 'Do not let illustration weaken the signup path.'),
  'image-launchpad-tools': w('hero', ['composition', 'data-display', 'product-proof', 'conversion'], ['product', 'marketing'], 5, 5, 'Integration products needing connected-tool proof.', 'Use genuine product relationships, not arbitrary logos.'),
  'image-stillness': w('hero', ['composition', 'typography', 'hero-art', 'storytelling'], ['marketing', 'editorial'], 4, 5, 'Quiet practice products with an illustrated focal figure.', 'Generated details are directional rather than source evidence.'),
  'image-linq-recovered': w('hero', ['composition', 'hero-art', 'product-proof', 'storytelling'], ['product', 'marketing'], 4, 5, 'Messaging products combining world-building and UI.', 'Keep conversation UI readable over the landscape.'),
  'image-yieldstream': w('hero', ['composition', 'hero-art', 'data-display', 'typography'], ['product', 'marketing'], 4, 5, 'Finance concepts using celestial systems as metaphor.', 'Generated labels and data are not reliable source facts.'),
  'image-marble-recovered': w('hero', ['composition', 'typography', 'hero-art', 'storytelling'], ['product', 'marketing'], 5, 4, 'Learning products presented as explorable worlds.', 'Preserve clear conversion hierarchy within the rich scene.'),
  'image-break-pattern': w('hero', ['composition', 'typography', 'hero-art', 'storytelling'], ['marketing', 'campaign'], 5, 5, 'Transformation narratives built around one precise gesture.', 'Treat reconstructed artwork as directional, not exact anatomy.'),
  'image-market-predictions': w('hero', ['composition', 'data-display', 'typography', 'product-proof'], ['product', 'marketing'], 4, 5, 'Prediction products needing a geographic data field.', 'Invent no market values, labels, or implied live data.'),
  'image-juris': w('hero', ['composition', 'typography', 'hero-art', 'conversion'], ['product', 'marketing'], 4, 5, 'Authority-led services combining classical imagery and modern action.', 'Replace legal and brand claims with verified project content.'),
  'site-notion': w('landing-page', ['composition', 'navigation', 'conversion', 'product-proof'], ['product', 'marketing'], 5, 5, 'Broad product propositions with friendly ecosystem proof.', 'Use the shared Notion shell without copying branded illustrations.'),
  'site-notion-releases': w('editorial-feed', ['content-system', 'navigation', 'product-proof', 'typography'], ['editorial', 'product'], 5, 5, 'Release feeds, changelogs, and evidence-rich product updates.', 'Keep its feed structure distinct from the Notion homepage.'),
  'site-spade': w('hero', ['composition', 'typography', 'hero-art', 'motion', 'product-proof'], ['product', 'marketing'], 5, 5, 'Technical financial products needing tactile authority.', 'Replace brand assets and confirm any transaction claims.'),
  'site-sstr': w('product-narrative', ['storytelling', 'motion', 'composition', 'product-proof'], ['product', 'marketing'], 5, 5, 'Engineered products with a scroll-led technical story.', 'Simplify the sequence when project content cannot support its length.'),
  'site-watch': w('interactive-scene', ['hero-art', 'typography', 'motion', 'composition'], ['campaign', 'marketing'], 5, 4, 'Single-product campaigns led by cinematic media.', 'Requires strong original product media to avoid imitation.'),
  'site-igloo': w('interactive-scene', ['interaction', 'motion', 'hero-art', 'composition'], ['portfolio', 'marketing'], 5, 5, 'Studios needing one memorable interactive object.', 'Provide a static and reduced-motion alternative.'),
  'site-dont-board-me': w('hero', ['hero-art', 'typography', 'conversion', 'composition'], ['marketing', 'campaign'], 4, 5, 'Playful service propositions with poster-like illustration.', 'Keep the action clear and avoid copying the dog character.'),
  'site-opal': w('hero', ['composition', 'typography', 'hero-art', 'product-proof'], ['product', 'editorial'], 4, 5, 'Editorial product stories using restrained image mosaics.', 'Preserve reading order when adapting the mosaic.'),
  'site-lusion': w('interactive-scene', ['interaction', 'motion', 'hero-art', 'composition'], ['portfolio', 'marketing'], 5, 5, 'Creative studios led by a responsive 3D focal object.', 'Use WebGL only when it adds meaning and degrades safely.'),
  'site-mana': w('hero', ['composition', 'typography', 'hero-art', 'conversion'], ['campaign', 'marketing'], 5, 4, 'Bold consumer campaigns centered on product packaging.', 'Use owned product photography and compliant claims.'),
  'site-orano': w('interactive-scene', ['data-display', 'hero-art', 'interaction', 'storytelling'], ['product', 'campaign'], 4, 5, 'Technical experiences using wireframes and guided controls.', 'Do not fabricate operational data or imply a working simulation.'),
  'site-snows': w('hero', ['hero-art', 'typography', 'composition', 'storytelling'], ['campaign', 'editorial'], 4, 5, 'Seasonal stories with still-life atmosphere.', 'The sparse structure depends on excellent original imagery.'),
  'site-x-advertising': w('landing-page', ['content-system', 'navigation', 'data-display', 'conversion'], ['documentation', 'product'], 5, 5, 'Advertising overviews with modular proof and resources.', 'Reuse the shared X shell only as a system reference.'),
  'site-x-business': w('landing-page', ['composition', 'navigation', 'conversion', 'content-system'], ['product', 'documentation'], 5, 5, 'Business propositions with direct conversion paths.', 'Keep its page-specific purpose distinct within the shared shell.'),
  'site-x-basics': w('catalog', ['content-system', 'navigation', 'typography', 'storytelling'], ['documentation', 'editorial'], 5, 5, 'Learning hubs with clear topic grouping and paths.', 'Do not collapse all topics into visually identical cards.'),
  'site-x-intro': w('article', ['content-system', 'typography', 'navigation', 'data-display'], ['documentation', 'editorial'], 5, 5, 'Long-form primers that need evidence modules.', 'Preserve article flow instead of forcing a marketing hero.'),
  'site-x-get-started': w('guide', ['content-system', 'navigation', 'data-display', 'conversion'], ['documentation', 'product'], 5, 5, 'Ordered onboarding and setup guidance.', 'Steps must reflect real product requirements.'),
  'site-x-organic': w('guide', ['content-system', 'typography', 'data-display', 'storytelling'], ['documentation', 'editorial'], 5, 5, 'Practice guides with examples and checklists.', 'Avoid generic advice unsupported by project materials.'),
  'site-x-ads-start': w('guide', ['content-system', 'navigation', 'conversion', 'product-proof'], ['documentation', 'product'], 5, 5, 'Procedural advertising setup flows.', 'Use verified platform steps and current interface evidence.'),
  'site-x-ad-formats': w('catalog', ['content-system', 'data-display', 'navigation', 'product-proof'], ['documentation', 'product'], 5, 5, 'Format catalogs and structured product comparisons.', 'Keep examples factual and avoid invented performance claims.'),
  'site-schemas': w('interactive-scene', ['hero-art', 'motion', 'interaction', 'typography'], ['editorial', 'portfolio'], 4, 5, 'Research or art projects needing an ambient generative field.', 'Limit motion duration and provide a calm fallback.'),
  'site-apple': w('landing-page', ['composition', 'hero-art', 'conversion', 'product-proof'], ['campaign', 'product'], 5, 4, 'Consumer product launches with disciplined promotional modules.', 'Do not reuse Apple identity, photography, or product claims.'),
  'site-clou': w('interactive-scene', ['typography', 'hero-art', 'motion', 'navigation'], ['portfolio', 'editorial'], 4, 5, 'Architecture portfolios with kinetic identity.', 'Maintain project discoverability beneath the expressive type.'),
  'site-system-patch': w('product-narrative', ['storytelling', 'motion', 'typography', 'content-system'], ['portfolio', 'editorial'], 5, 5, 'Case studies with pinned media and paced chapters.', 'Adapt section count to available project evidence.'),
  'site-oqoqo': w('product-narrative', ['product-proof', 'data-display', 'content-system', 'motion'], ['product', 'marketing'], 5, 5, 'Technical AI products needing real workflow evidence.', 'Build genuine UI and do not generate fake evaluation data.'),
  'site-human-made': w('interactive-scene', ['typography', 'motion', 'composition', 'navigation'], ['campaign', 'portfolio'], 4, 4, 'Brand entrances needing a restrained identity moment.', 'Do not let an entrance delay access to useful content.'),
  'site-more-nutrition': w('hero', ['hero-art', 'typography', 'conversion', 'composition'], ['campaign', 'marketing'], 5, 4, 'Consumer nutrition campaigns with immersive product worlds.', 'Use owned packaging and substantiated nutrition claims.'),
  'site-aside': w('product-narrative', ['hero-art', 'motion', 'product-proof', 'conversion'], ['product', 'marketing'], 5, 5, 'Software products combining approachable art and interface proof.', 'Keep scroll chapters readable and the cloud motif secondary.'),
  'site-jitter': w('gallery', ['motion', 'content-system', 'typography', 'navigation'], ['portfolio', 'product'], 5, 5, 'Motion portfolios and browsable creative galleries.', 'Thumbnails need reduced-motion and poster fallbacks.'),
  'site-pen': w('hero', ['composition', 'typography', 'conversion', 'product-proof'], ['product', 'marketing'], 4, 5, 'Developer tools needing a compact utilitarian proposition.', 'Add sufficient product evidence beyond the minimal hero.'),
  'site-coda': w('product-narrative', ['typography', 'motion', 'storytelling', 'conversion'], ['campaign', 'marketing'], 5, 5, 'Commerce campaigns needing bold print pacing.', 'Keep animated statistics factual and accessible.'),
  'site-izanami': w('interactive-scene', ['hero-art', 'motion', 'typography', 'composition'], ['portfolio', 'campaign'], 4, 4, 'Atmospheric fashion or artist identities.', 'Sparse navigation must remain discoverable and keyboard usable.'),
  'site-ctgt': w('hero', ['composition', 'typography', 'hero-art', 'conversion'], ['product', 'marketing'], 5, 5, 'Governance propositions using restrained cinematic evidence.', 'Do not imply governance outcomes without supporting proof.'),
  'site-ctgt-finance': w('hero', ['composition', 'hero-art', 'data-display', 'navigation'], ['product', 'marketing'], 5, 5, 'Industry-specific governance with a cinematic control rail.', 'Keep controls functional and industry claims verified.'),
  'site-paper': w('product-narrative', ['product-proof', 'data-display', 'motion', 'content-system'], ['product', 'marketing'], 5, 5, 'Design tools needing a connected workflow story.', 'Use real workspace UI; generated interface imagery is unsuitable.'),
  'site-cursor': w('product-narrative', ['product-proof', 'content-system', 'motion', 'conversion'], ['product', 'marketing'], 5, 5, 'AI tools needing layered interface evidence and credibility.', 'Replace branded editor states and keep technical claims factual.'),
  'site-plinth': w('product-narrative', ['composition', 'typography', 'hero-art', 'content-system'], ['product', 'marketing'], 5, 5, 'Marketplaces combining classical authority and technical listings.', 'Do not reproduce marketplace listings or classical assets unchanged.'),
  'site-fin': w('product-narrative', ['hero-art', 'motion', 'storytelling', 'conversion'], ['product', 'marketing'], 5, 5, 'Global platforms needing scale, calm, and progressive proof.', 'Support the cinematic frame with concrete product modules.'),
  'image-voidpixel': w('hero', ['typography', 'data-display', 'composition', 'product-proof'], ['product', 'marketing'], 5, 5, 'Pixel-led tools with dense monochrome product evidence.', 'Build dashboard labels as real code, not generated pixels.'),
  'image-root-soil': w('hero', ['hero-art', 'typography', 'composition', 'storytelling'], ['marketing', 'campaign'], 5, 5, 'Mission-led organizations grounded in landscape evidence.', 'Avoid unsupported impact claims and generic nature imagery.'),
  'image-rooted': w('hero', ['typography', 'hero-art', 'composition', 'conversion'], ['marketing', 'editorial'], 5, 5, 'Organizations needing archival restraint and direct purpose.', 'Preserve readable contrast over the sepia terrain plate.'),
  'image-meadow': w('hero', ['hero-art', 'composition', 'conversion', 'product-proof'], ['product', 'marketing'], 5, 5, 'Friendly productivity tools with illustrated world-building.', 'Keep interface proof concrete beneath the landscape metaphor.'),
  'image-grilled': w('annotated-feature', ['composition', 'data-display', 'typography', 'hero-art'], ['editorial', 'campaign'], 5, 5, 'Annotated products, recipes, or technical object breakdowns.', 'Labels and leader lines must remain accurate and readable.'),
  'image-synthos': w('hero', ['typography', 'hero-art', 'conversion', 'composition'], ['product', 'marketing'], 5, 5, 'Learning products pairing precise input with ink atmosphere.', 'Keep input behavior real and generated artwork text-free.'),
  'image-bloom-brush': w('hero', ['hero-art', 'typography', 'conversion', 'composition'], ['portfolio', 'marketing'], 5, 5, 'Creative studios balancing floral material and clear action.', 'Keep painterly framing outside the primary reading path.'),
};

const verifiedCloneRemixIds = new Set([
  'site-spade',
  'site-igloo',
  'site-lusion',
  'site-aside',
  'site-jitter',
  'site-coda',
  'site-paper',
  'site-cursor',
  'site-plinth',
  'site-fin',
]);

const anchorUsesFor = (workflow: WorkflowSeed): WorkflowSeed['pageUses'] => {
  if (workflow.momentType === 'authentication') return ['authentication'];
  if (workflow.momentType === 'footer') return ['footer'];
  if (workflow.momentType === 'editorial-feed' || workflow.momentType === 'article') {
    return workflow.pageUses.filter((pageUse) => pageUse === 'editorial' || pageUse === 'documentation');
  }
  if (workflow.momentType === 'guide' || workflow.momentType === 'catalog') {
    return workflow.pageUses.filter((pageUse) => pageUse === 'documentation' || pageUse === 'product' || pageUse === 'editorial');
  }
  return workflow.pageUses;
};

export const getReferenceWorkflow = (
  id: string,
  hasVerifiedLiveSource: boolean,
): ReferenceWorkflow => {
  const intelligence = referenceWorkflow[id];
  if (!intelligence) throw new Error(`Missing workflow intelligence: ${id}`);
  const cloneMode = verifiedCloneRemixIds.has(id)
    ? 'verified-clone-remix'
    : hasVerifiedLiveSource
      ? 'inspired-rebuild'
      : 'reference-only';
  return {
    ...intelligence,
    anchorUses: anchorUsesFor(intelligence),
    cloneMode,
    cloneReason: cloneMode === 'verified-clone-remix'
      ? 'Curated public source suitable for measured reconstruction and identity-safe remixing.'
      : cloneMode === 'inspired-rebuild'
        ? 'Live source supports analysis, but this card is not approved for automatic verified cloning.'
        : 'No reproducible live source is approved; use this card only as a visual reference.',
  };
};
