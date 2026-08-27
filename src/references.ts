import { ReferenceManifestSchema, type Category, type ReferenceEntry, } from './reference-schema';
import { referenceContent } from './reference-content';
import { getReferenceWorkflow } from './workflow-intelligence';
import { sourceIdentityReviews } from './source-identity-reviews';
type Seed = Omit<ReferenceEntry, 'brief' | 'imageRecipe' | 'filters' | 'cardDescriptor' | 'styleDescriptor' | 'description' | 'scope' | 'interfaceInventory' | 'designSystem' | 'tags' | 'media' | 'workflow' | 'sourceIdentity'> & {
    extraFilters?: Category[];
    media: Omit<ReferenceEntry['media'], 'motionNotes'> & { motionNotes?: string };
};
const uniqueText = (values: Array<string | undefined>) => Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
const authorizedMediaNoneIds = new Set(['site-sstr', 'site-watch', 'site-system-patch', 'site-oqoqo', 'site-human-made', 'site-jitter']);
const codeNativeMethods: Record<string, string> = {
    'image-voidpixel': 'css-pixel-field',
    'site-pen': 'html-css-typographic-composition',
    'site-coda': 'html-css-typographic-composition',
};
const imageRecipeFor = (id: string, recipe: { kind: 'primary' | 'supporting'; prompt: string } | { kind: 'none'; reason: string }): ReferenceEntry['imageRecipe'] => recipe.kind === 'none'
    ? { ...recipe, noneMode: authorizedMediaNoneIds.has(id) ? 'authorized-media' : 'code-native', permittedMethod: authorizedMediaNoneIds.has(id) ? 'authorized-real-media-slot' : (codeNativeMethods[id] ?? 'reviewed-html-css-structure') }
    : recipe;
const sourceIdentityFor = (seed: Seed): ReferenceEntry['sourceIdentity'] => {
    const domain = seed.source.url ? new URL(seed.source.url).hostname.replace(/^www\./, '') : undefined;
    const titleName = seed.title.split(/\s+[—–-]\s+/)[0];
    const reviewed = sourceIdentityReviews[seed.id];
    return {
        derived: { sourceNames: uniqueText([seed.source.siteName, titleName]), aliases: [], domains: uniqueText([domain]), assetHashes: [] },
        reviewed: reviewed ? {
            exactCopy: uniqueText(reviewed.exactCopy), distinctiveClaims: uniqueText(reviewed.distinctiveClaims), knownMarkAssetIds: uniqueText(reviewed.knownMarkAssetIds), knownMarkAssetHashes: uniqueText(reviewed.knownMarkAssetHashes),
            characters: uniqueText(reviewed.characters), products: uniqueText(reviewed.products), people: uniqueText(reviewed.people), packaging: uniqueText(reviewed.packaging),
            interfaceFragments: uniqueText(reviewed.interfaceFragments), sourceSpecificExclusions: uniqueText(reviewed.sourceSpecificExclusions),
        } : { exactCopy: [], distinctiveClaims: [], knownMarkAssetIds: [], knownMarkAssetHashes: [], characters: [], products: [], people: [], packaging: [], interfaceFragments: [], sourceSpecificExclusions: [] },
        review: reviewed
            ? { reviewStatus: 'reviewed', reviewedAt: reviewed.reviewedAt, reviewedBy: reviewed.reviewedBy, reviewBasis: reviewed.reviewBasis, reviewFingerprint: reviewed.reviewFingerprint }
            : { reviewStatus: 'unreviewed', reviewedAt: null, reviewedBy: null, reviewBasis: null, reviewFingerprint: null },
    };
};
const buildEntry = (seed: Seed): ReferenceEntry => {
    const content = referenceContent[seed.id];
    if (!content)
        throw new Error(`Missing authored content: ${seed.id}`);
    const profile = content.profile;
    const filters = Array.from(new Set([seed.primaryCategory, ...(seed.extraFilters ?? [])]));
    const brief = [
        `Scope: ${content.scope}`,
        `Interface inventory: ${content.interfaceInventory}`,
        `Composition: ${profile.composition}`,
        `Typography: ${profile.typography}`,
        `Palette: ${profile.palette}`,
        `Texture: ${profile.texture}`,
        `Hierarchy: ${profile.hierarchy}`,
        `Spacing: ${profile.spacing}`,
        `Motion: ${profile.motion}`,
        `Preserve: ${profile.preserve}`,
        `Avoid: ${profile.avoid}`,
    ].join('\n');
    const { extraFilters: _extraFilters, ...entry } = seed;
    return {
        ...entry,
        cardDescriptor: content.cardDescriptor,
        styleDescriptor: content.styleDescriptor,
        description: content.description,
        scope: content.scope,
        interfaceInventory: content.interfaceInventory,
        workflow: getReferenceWorkflow(
            seed.id,
            seed.source.kind === 'website' && Boolean(seed.source.url),
        ),
        designSystem: content.designSystem,
        tags: content.tags,
        media: { ...entry.media, motionNotes: content.motionBehavior },
        filters,
        brief,
        imageRecipe: imageRecipeFor(seed.id, content.imageRecipe),
        sourceIdentity: sourceIdentityFor(seed),
    };
};
const imageFile = (number: number, extension: 'jpg' | 'png') => `/assets/originals/${number}.${extension}`;
const imageSeeds: Seed[] = [
    {
        id: 'image-astra-ai', order: 1, title: 'Astra — AI That Works the Way You Do',
        primaryCategory: 'Dither Mono', extraFilters: ['Data-as-Texture'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'astra-ai', originalAsset: imageFile(1, 'jpg') },
        media: { poster: '/assets/posters/image-01.jpg', detailImage: imageFile(1, 'jpg'), original: imageFile(1, 'jpg') },
        quality: { tier: 'canonical', width: 1898, height: 1476, confidence: 0.97, reliableFor: ['hero layout', 'type scale', 'halftone treatment', 'palette', 'control styling'], note: 'High-resolution unaltered supplied replacement. The earlier long-form upload remains preserved in the archive and Git history.' }
    },
    {
        id: 'image-dark-portal', order: 2, title: 'Nocturne Login Portal',
        primaryCategory: 'Dither Mono', extraFilters: ['Glitched Antiquity'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'welcome-portals', originalAsset: imageFile(2, 'png') },
        media: { poster: '/assets/posters/image-02.jpg', detailImage: imageFile(2, 'png'), original: imageFile(2, 'png') },
        quality: { tier: 'canonical', width: 2880, height: 2048, confidence: 0.98, reliableFor: ['layout', 'contrast', 'form styling', 'image treatment'], note: 'High-resolution supplied image.' }
    },
    {
        id: 'image-light-portal', order: 3, title: 'Daylight Login Portal',
        primaryCategory: 'Dither Mono', extraFilters: ['Vast Quiet Cinematic'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'welcome-portals', originalAsset: imageFile(3, 'jpg') },
        media: { poster: '/assets/posters/image-03.jpg', detailImage: imageFile(3, 'jpg'), original: imageFile(3, 'jpg') },
        quality: { tier: 'canonical', width: 2304, height: 1638, confidence: 0.98, reliableFor: ['layout', 'contrast', 'form styling', 'image treatment'], note: 'High-resolution supplied image.' }
    },
    {
        id: 'image-castle-waitlist', order: 4, title: 'Castle Waitlist',
        primaryCategory: 'Dither Mono', extraFilters: ['Illustrated Storybook', 'Print-Tech Paper'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'castle-waitlist', originalAsset: imageFile(4, 'png') },
        media: { poster: '/assets/posters/image-04.jpg', detailImage: imageFile(4, 'png'), original: imageFile(4, 'png') },
        quality: { tier: 'canonical', width: 2880, height: 2048, confidence: 0.98, reliableFor: ['layout', 'illustration treatment', 'typography', 'form styling'], note: 'High-resolution supplied image.' }
    },
    {
        id: 'image-flora-footer', order: 5, title: 'Flora Field Notes',
        primaryCategory: 'Illustrated Storybook',
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'flora-field-notes', originalAsset: imageFile(5, 'jpg') },
        media: { poster: '/assets/posters/image-05.jpg', detailImage: imageFile(5, 'jpg'), original: imageFile(5, 'jpg') },
        quality: { tier: 'canonical', width: 2880, height: 2192, confidence: 0.97, reliableFor: ['illustration', 'palette', 'navigation grouping', 'footer composition'], note: 'High-resolution supplied image.' }
    },
    {
        id: 'image-bloomride', order: 6, title: 'BloomRide Europe',
        primaryCategory: 'Illustrated Storybook',
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'bloomride', originalAsset: imageFile(6, 'jpg') },
        media: { poster: '/assets/posters/image-06.jpg', detailImage: imageFile(6, 'jpg'), original: imageFile(6, 'jpg') },
        quality: { tier: 'canonical', width: 3018, height: 2184, confidence: 0.97, reliableFor: ['hero layout', 'illustration', 'palette', 'control grouping'], note: 'High-resolution supplied image.' }
    },
    {
        id: 'image-voypix', order: 7, title: 'Voypix — One Pixel',
        primaryCategory: 'Glitched Antiquity', extraFilters: ['Data-as-Texture', 'Classical Remix'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'voypix', originalAsset: imageFile(7, 'jpg') },
        media: { poster: '/assets/posters/image-07.jpg', detailImage: imageFile(7, 'jpg'), original: imageFile(7, 'jpg') },
        quality: { tier: 'canonical', width: 2876, height: 2220, confidence: 0.98, reliableFor: ['layout', 'image treatment', 'typography', 'brand tone'], note: 'High-resolution supplied image.' }
    },
    {
        id: 'image-nova-stack', order: 8, title: 'Nova Developer Stack',
        primaryCategory: 'Data-as-Texture',
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'nova-stack', originalAsset: imageFile(8, 'jpg') },
        media: { poster: '/assets/posters/image-08.jpg', detailImage: imageFile(8, 'jpg'), original: imageFile(8, 'jpg') },
        quality: { tier: 'canonical', width: 2880, height: 2442, confidence: 0.98, reliableFor: ['layout', 'diagram treatment', 'typography', 'conversion pattern'], note: 'High-resolution supplied image.' }
    },
    {
        id: 'image-auron-architecture', order: 9, title: 'Auron — Crafted for Visionaries',
        primaryCategory: 'Classical Remix', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'auron-architecture', originalAsset: imageFile(9, 'png') },
        media: { poster: '/assets/posters/image-09.jpg', detailImage: imageFile(9, 'png'), original: imageFile(9, 'png') },
        quality: { tier: 'canonical', width: 2880, height: 2048, confidence: 0.98, reliableFor: ['layout', 'engraving texture', 'typography', 'formal tone'], note: 'High-resolution supplied image.' }
    },
    {
        id: 'image-vitra-waitlist', order: 10, title: 'Vitra — Good Things Are on the Way',
        primaryCategory: 'Illustrated Storybook',
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'vitra-waitlist', originalAsset: imageFile(10, 'png') },
        media: { poster: '/assets/posters/image-10.jpg', detailImage: imageFile(10, 'png'), original: imageFile(10, 'png') },
        quality: { tier: 'usable', width: 759, height: 540, confidence: 0.9, reliableFor: ['layout', 'palette', 'illustration direction'], note: 'Moderate-resolution supplied image; avoid inferring small typography details.' }
    },
    {
        id: 'image-launchpad-tools', order: 11, title: 'Launchpad Connections',
        primaryCategory: 'Data-as-Texture',
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'launchpad-tools', originalAsset: imageFile(11, 'jpg') },
        media: { poster: '/assets/posters/image-11.jpg', detailImage: imageFile(11, 'jpg'), original: imageFile(11, 'jpg') },
        quality: { tier: 'canonical', width: 4096, height: 2625, confidence: 0.97, reliableFor: ['layout', 'hierarchy', 'diagram direction', 'palette'], note: 'High-resolution supplied image.' }
    },
    {
        id: 'image-stillness', order: 12, title: 'Stillness — Science of Practice',
        primaryCategory: 'Illustrated Storybook', extraFilters: ['Dither Mono'],
        source: { kind: 'image', siteName: 'Stillness', captureMethod: 'generated-reconstruction', capturedAt: '2026-08-22', sourceGroupId: 'stillness', originalAsset: imageFile(12, 'png') },
        media: { poster: '/assets/posters/image-12.jpg', detailImage: imageFile(12, 'png'), original: imageFile(12, 'png') },
        quality: { tier: 'usable', width: 1633, height: 963, confidence: 0.86, reliableFor: ['composition', 'palette', 'illustration direction', 'broad hierarchy'], note: 'User-approved, source-guided generated reconstruction. The YouTube frame is archived; do not treat reconstructed copy or fine detail as source truth.' }
    },
    {
        id: 'image-linq-recovered', order: 13, title: 'Linq Messaging',
        primaryCategory: 'Vast Quiet Cinematic',
        source: { kind: 'website', siteName: 'Linq', url: 'https://linqapp.com/', captureMethod: 'recovered-live', capturedAt: '2026-08-21', sourceGroupId: 'linq', originalAsset: imageFile(13, 'png') },
        media: { poster: '/assets/posters/image-13.jpg', detailImage: '/assets/site-captures/13-linq.png', original: imageFile(13, 'png'), motionNotes: 'The landscape and conversational elements introduce depth while the headline and conversion controls remain anchored.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['layout', 'typography', 'palette', 'UI layering'], note: 'Recovered as a current live browser capture with the browser scrollbar removed; the original video frame remains archived.' }
    },
    {
        id: 'image-yieldstream', order: 14, title: 'Yieldstream Celestial',
        primaryCategory: 'Glitched Antiquity', extraFilters: ['Classical Remix', 'Data-as-Texture'],
        source: { kind: 'image', siteName: 'Yieldstream', captureMethod: 'generated-reconstruction', capturedAt: '2026-08-22', sourceGroupId: 'yieldstream', originalAsset: imageFile(14, 'png') },
        media: { poster: '/assets/posters/image-14.jpg', detailImage: imageFile(14, 'png'), original: imageFile(14, 'png') },
        quality: { tier: 'usable', width: 1597, height: 985, confidence: 0.85, reliableFor: ['composition', 'palette', 'visual metaphor', 'broad hierarchy'], note: 'User-approved, source-guided generated reconstruction. The YouTube frame is archived; do not treat reconstructed copy, data labels, or fine illustration detail as verified source truth.' }
    },
    {
        id: 'image-marble-recovered', order: 15, title: 'Marble Learning World',
        primaryCategory: 'Illustrated Storybook', extraFilters: ['Vast Quiet Cinematic'],
        source: { kind: 'website', siteName: 'Marble', url: 'https://withmarble.com/', captureMethod: 'recovered-live', capturedAt: '2026-08-21', sourceGroupId: 'marble', originalAsset: imageFile(15, 'png') },
        media: { poster: '/assets/posters/image-15.jpg', detailImage: '/assets/site-captures/15-marble.png', original: imageFile(15, 'png'), motionNotes: 'The scene behaves like a living title card: water, clouds, and the child’s approach imply continuous exploration.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['composition', 'typography scale', 'palette', 'illustration'], note: 'Recovered as a current live browser capture with the browser scrollbar removed; the original video frame remains archived.' }
    },
    {
        id: 'image-break-pattern', order: 16, title: 'Break the Pattern',
        primaryCategory: 'Classical Remix', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'image', captureMethod: 'generated-reconstruction', capturedAt: '2026-08-22', sourceGroupId: 'break-pattern', originalAsset: imageFile(16, 'png') },
        media: { poster: '/assets/posters/image-16.jpg', detailImage: imageFile(16, 'png'), original: imageFile(16, 'png') },
        quality: { tier: 'usable', width: 1594, height: 987, confidence: 0.85, reliableFor: ['composition', 'palette', 'visual metaphor', 'broad hierarchy'], note: 'User-approved, source-guided generated reconstruction. The YouTube frame is archived; do not treat reconstructed copy or fine artwork details as verified source truth.' }
    },
    {
        id: 'image-market-predictions', order: 17, title: 'Global Prediction Field',
        primaryCategory: 'Data-as-Texture', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'image', captureMethod: 'generated-reconstruction', capturedAt: '2026-08-22', sourceGroupId: 'market-predictions', originalAsset: imageFile(17, 'png') },
        media: { poster: '/assets/posters/image-17.jpg', detailImage: imageFile(17, 'png'), original: imageFile(17, 'png') },
        quality: { tier: 'usable', width: 1602, height: 981, confidence: 0.84, reliableFor: ['composition', 'data visualization direction', 'palette', 'broad hierarchy'], note: 'User-approved, source-guided generated reconstruction. The YouTube frame is archived; do not infer exact plotting data, historical labels, or fine typography.' }
    },
    {
        id: 'image-juris', order: 18, title: 'Juris Legal Intelligence',
        primaryCategory: 'Classical Remix', extraFilters: ['Illustrated Storybook'],
        source: { kind: 'image', siteName: 'Juris', captureMethod: 'generated-reconstruction', capturedAt: '2026-08-22', sourceGroupId: 'juris', originalAsset: imageFile(18, 'png') },
        media: { poster: '/assets/posters/image-18.jpg', detailImage: imageFile(18, 'png'), original: imageFile(18, 'png') },
        quality: { tier: 'usable', width: 1598, height: 984, confidence: 0.86, reliableFor: ['composition', 'palette', 'visual metaphor', 'broad hierarchy'], note: 'User-approved, source-guided generated reconstruction. The YouTube frame is archived; do not treat reconstructed copy, branding, or sculpture detail as verified source truth.' }
    }
];
const siteSeeds: Seed[] = [
    {
        id: 'site-notion', order: 19, title: 'Notion — Teams and Agents',
        primaryCategory: 'Illustrated Storybook',
        source: { kind: 'website', siteName: 'Notion', url: 'https://www.notion.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'notion', originalAsset: '/assets/site-captures/01-notion.png' },
        media: { poster: '/assets/posters/site-01.jpg', detailImage: '/assets/site-captures/01-notion.png', original: '/assets/site-captures/01-notion.png' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['layout', 'typography', 'conversion pattern', 'brand system'], note: 'Current live browser capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-spade', order: 20, title: 'Spade',
        primaryCategory: 'Print-Tech Paper', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'Spade', url: 'https://spade.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-22', sourceGroupId: 'spade', originalAsset: '/assets/site-captures/02-spade.png' },
        media: { poster: '/assets/posters/site-02.jpg', detailImage: '/assets/site-captures/02-spade.png', original: '/assets/site-captures/02-spade.png', motionClip: '/assets/motion/spade.mp4', motionNotes: 'Without scrolling or pointer input, the central engraved coin rotates through layered contour states while the headline, transaction panels, and technical hero frame remain fixed in an eight-second ambient excerpt.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['layout', 'typography', 'palette', 'engraving treatment', 'ambient motion'], note: 'Current live still and hardware-rendered motion capture with browser chrome and scrollbars excluded.' }
    },
    {
        id: 'site-sstr', order: 21, title: 'SSTR Friction Systems',
        primaryCategory: 'Data-as-Texture', extraFilters: ['Vast Quiet Cinematic'],
        source: { kind: 'website', siteName: 'SSTR', url: 'https://sstr.tech/en/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'sstr', originalAsset: '/assets/site-captures/03-sstr.png' },
        media: { poster: '/assets/posters/site-03.jpg', detailImage: '/assets/site-captures/03-sstr.png', original: '/assets/site-captures/03-sstr.png', motionClip: '/assets/motion/sstr.mp4', motionNotes: 'An automatic percentage loader assembles outlined industrial forms, resolves into the drilling hero, then smooth scrolling reveals field results and technical proof over about twenty seconds.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 0.98, reliableFor: ['composition', 'object scale', 'palette', 'hierarchy'], note: 'Current post-loader live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-watch', order: 22, title: 'FS60P Watch',
        primaryCategory: 'Vast Quiet Cinematic',
        source: { kind: 'website', siteName: 'FS60P', url: 'https://thewatch.60fps.fr/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'fs60p', originalAsset: '/assets/site-captures/04-the-watch.png' },
        media: { poster: '/assets/posters/site-04.jpg', detailImage: '/assets/site-captures/04-the-watch.png', original: '/assets/site-captures/04-the-watch.png', motionNotes: 'The watch rotates and selector states shift within a fixed typographic stage.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['composition', 'type scale', 'product staging', 'interface restraint'], note: 'Current post-loader live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-igloo', order: 23, title: 'Igloo Inc.',
        primaryCategory: 'Vast Quiet Cinematic', extraFilters: ['Dither Mono'],
        source: { kind: 'website', siteName: 'Igloo Inc.', url: 'https://www.igloo.inc/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'igloo', originalAsset: '/assets/site-captures/05-igloo.png' },
        media: { poster: '/assets/posters/site-05.jpg', detailImage: '/assets/site-captures/05-igloo.png', original: '/assets/site-captures/05-igloo.png', motionClip: '/assets/motion/igloo.mp4', motionNotes: 'A quiet automatic introduction constructs the crystalline igloo; slow pointer movement over the central structure then lifts, separates, and re-settles individual ice blocks.' },
        quality: { tier: 'canonical', width: 1279, height: 720, confidence: 1, reliableFor: ['environmental staging', 'palette', 'micro-interface balance'], note: 'Current post-loader live capture.' }
    },
    {
        id: 'site-dont-board-me', order: 24, title: 'Don’t Board Me',
        primaryCategory: 'Illustrated Storybook', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'website', siteName: 'Don’t Board Me', url: 'https://dontboardme.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'dont-board-me', originalAsset: '/assets/site-captures/06-dont-board-me.png' },
        media: { poster: '/assets/posters/site-06.jpg', detailImage: '/assets/site-captures/06-dont-board-me.png', original: '/assets/site-captures/06-dont-board-me.png' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['hero composition', 'type scale', 'palette', 'illustration placement', 'navigation hierarchy'], note: 'High-resolution unobstructed live capture of the post-entry hero.' }
    },
    {
        id: 'site-opal', order: 25, title: 'Opal — The Table',
        primaryCategory: 'Vast Quiet Cinematic', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'website', siteName: 'Opal', url: 'https://op.al/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'opal', originalAsset: '/assets/site-captures/07-opal.png' },
        media: { poster: '/assets/posters/site-07.jpg', detailImage: '/assets/site-captures/07-opal.png', original: '/assets/site-captures/07-opal.png' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['editorial layout', 'image sequencing', 'type scale'], note: 'Current live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-lusion', order: 26, title: 'Lusion Studio',
        primaryCategory: 'Vast Quiet Cinematic',
        source: { kind: 'website', siteName: 'Lusion', url: 'https://lusion.co/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'lusion', originalAsset: '/assets/site-captures/08-lusion.png' },
        media: { poster: '/assets/posters/site-08.jpg', detailImage: '/assets/site-captures/08-lusion.png', original: '/assets/site-captures/08-lusion.png', motionClip: '/assets/motion/lusion.mp4', motionNotes: 'Deliberate pointer movement through the central tray rotates and displaces the blue, black, and white 3D components with inertial depth while the page frame stays fixed.' },
        quality: { tier: 'canonical', width: 1264, height: 720, confidence: 0.98, reliableFor: ['layout', '3D art direction', 'interaction framing'], note: 'Current interactive hero capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-mana', order: 27, title: 'MANA Yerba Mate',
        primaryCategory: 'Illustrated Storybook', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'website', siteName: 'MANA Yerba Mate', url: 'https://en.manayerbamate.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'mana', originalAsset: '/assets/site-captures/09-mana.png' },
        media: { poster: '/assets/posters/site-09.jpg', detailImage: '/assets/site-captures/09-mana.png', original: '/assets/site-captures/09-mana.png', motionNotes: 'Illustrated ingredients and packaging elements bounce, slide, and layer around the fixed product can.' },
        quality: { tier: 'canonical', width: 1237, height: 690, confidence: 1, reliableFor: ['palette', 'collage composition', 'packaging staging', 'motion direction'], note: 'Current live capture with the horizontal browser scrollbar removed.' }
    },
    {
        id: 'site-orano', order: 28, title: 'Orano Innovation',
        primaryCategory: 'Vast Quiet Cinematic', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'Orano', url: 'https://www.orano.group/experience/innovation/en', captureMethod: 'enhanced-derivative', capturedAt: '2026-08-23', sourceGroupId: 'orano', originalAsset: '/assets/site-captures/10-orano.png' },
        media: { poster: '/assets/posters/site-10.jpg', detailImage: '/assets/site-captures/10-orano.png', original: '/assets/site-captures/10-orano.png' },
        quality: { tier: 'usable', width: 1600, height: 1000, confidence: 0.94, reliableFor: ['wireframe composition', 'palette', 'technical hierarchy', 'rover scale', 'grid texture'], note: 'High-resolution crop derived without generative alteration from the supplied Orano guide; use the unaltered guide for fine edge text, and note that it remains preserved byte-for-byte outside the runtime manifest.' }
    },
    {
        id: 'site-snows', order: 29, title: 'SNOWS Winter',
        primaryCategory: 'Illustrated Storybook',
        source: { kind: 'website', siteName: 'SNOWS', url: 'https://snows-winter.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'snows', originalAsset: '/assets/site-captures/11-snows.png' },
        media: { poster: '/assets/posters/site-11.jpg', detailImage: '/assets/site-captures/11-snows.png', original: '/assets/site-captures/11-snows.png', motionNotes: 'Masked logo and shop-window elements reveal in a playful seasonal sequence.' },
        quality: { tier: 'canonical', width: 1264, height: 720, confidence: 1, reliableFor: ['retail staging', 'illustration', 'palette', 'product grouping'], note: 'Current live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-x-advertising', order: 30, title: 'X Advertising',
        primaryCategory: 'Data-as-Texture',
        source: { kind: 'website', siteName: 'X Business', url: 'https://business.x.com/en/advertising', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'x-business', originalAsset: '/assets/site-captures/12-x-advertising.png' },
        media: { poster: '/assets/posters/site-12.jpg', detailImage: '/assets/site-captures/12-x-advertising.png', original: '/assets/site-captures/12-x-advertising.png' },
        quality: { tier: 'canonical', width: 1264, height: 720, confidence: 1, reliableFor: ['diagram composition', 'grid', 'hierarchy'], note: 'Current live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-schemas', order: 31, title: 'Schemas of Uncertainty',
        primaryCategory: 'Data-as-Texture', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'website', siteName: 'Schemas of Uncertainty', url: 'https://schemasofuncertainty.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'schemas', originalAsset: '/assets/site-captures/13-schemas.png' },
        media: { poster: '/assets/posters/site-13.jpg', detailImage: '/assets/site-captures/13-schemas.png', original: '/assets/site-captures/13-schemas.png', motionClip: '/assets/motion/schemas.mp4', motionNotes: 'The automatic canvas continuously grows and rebalances dense ASCII-like marks beneath a fixed essay index; because the behavior is indefinite, the preview uses a representative seven-second excerpt.' },
        quality: { tier: 'canonical', width: 1264, height: 720, confidence: 1, reliableFor: ['data texture', 'density contrast', 'editorial framing'], note: 'Current live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-apple', order: 32, title: 'Apple Promotional Hero',
        primaryCategory: 'Vast Quiet Cinematic',
        source: { kind: 'website', siteName: 'Apple', url: 'https://www.apple.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'apple', originalAsset: '/assets/site-captures/14-apple.png' },
        media: { poster: '/assets/posters/site-14.jpg', detailImage: '/assets/site-captures/14-apple.png', original: '/assets/site-captures/14-apple.png' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['campaign hierarchy', 'spacing', 'conversion restraint'], note: 'Current live campaign capture with the browser scrollbar removed; content is expected to change over time.' }
    },
    {
        id: 'site-clou', order: 33, title: 'CLOU Architects',
        primaryCategory: 'Dither Mono', extraFilters: ['Vast Quiet Cinematic'],
        source: { kind: 'website', siteName: 'CLOU Architects', url: 'https://www.clouarchitects.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'clou', originalAsset: '/assets/site-captures/15-clou.png' },
        media: { poster: '/assets/posters/site-15.jpg', detailImage: '/assets/site-captures/15-clou.png', original: '/assets/site-captures/15-clou.png', motionNotes: 'The identity is expressed through a timed sequence of professions and positions rather than a static claim.' },
        quality: { tier: 'canonical', width: 1264, height: 720, confidence: 0.98, reliableFor: ['typographic stage', 'timing concept', 'minimal composition'], note: 'Current post-loader statement capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-system-patch', order: 34, title: 'System — Patch',
        primaryCategory: 'Print-Tech Paper',
        source: { kind: 'website', siteName: 'System Studio', url: 'https://system.studio/work/patch', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'system-patch', originalAsset: '/assets/site-captures/16-system-patch.png' },
        media: { poster: '/assets/posters/site-16.jpg', detailImage: '/assets/site-captures/16-system-patch.png', original: '/assets/site-captures/16-system-patch.png', motionClip: '/assets/motion/system-patch.mp4', motionNotes: 'Smooth scrolling advances through asymmetric identity panels, tactile product photography, color systems, device applications, and final campaign placements, then settles at the case-study endpoint.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['case-study structure', 'panel proportions', 'brand presentation'], note: 'Current live case-study capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-oqoqo', order: 35, title: 'Oqoqo Evals',
        primaryCategory: 'Data-as-Texture',
        source: { kind: 'website', siteName: 'Oqoqo', url: 'https://oqoqo.ai/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-22', sourceGroupId: 'oqoqo', originalAsset: '/assets/site-captures/17-oqoqo.png' },
        media: { poster: '/assets/posters/site-17.jpg', detailImage: '/assets/site-captures/17-oqoqo.png', original: '/assets/site-captures/17-oqoqo.png', motionClip: '/assets/motion/oqoqo.mp4', motionNotes: 'A smooth top-to-bottom scroll moves from the evaluation proposition and live experiment interface through agent/model comparisons, use cases, agent-first product guidance, workflow anatomy, FAQs, and the final conversion footer; the optional analytics dialog is declined before frame one and the sequence settles at the bottom after about eighteen seconds.' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['product hierarchy', 'copy density', 'proof placement', 'interface framing', 'scroll sequencing'], note: 'High-resolution unobstructed live still plus a hardware-rendered motion capture recorded after declining the optional analytics dialog.' }
    },
    {
        id: 'site-human-made', order: 36, title: 'Human Made Inc.',
        primaryCategory: 'Dither Mono',
        source: { kind: 'website', siteName: 'Human Made', url: 'https://humanmade.co.jp/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'human-made', originalAsset: '/assets/site-captures/18-human-made.png' },
        media: { poster: '/assets/posters/site-18.jpg', detailImage: '/assets/site-captures/18-human-made.png', original: '/assets/site-captures/18-human-made.png', motionNotes: 'A long, controlled loading sequence resolves into a centered identity mark with tiny edge navigation.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 0.98, reliableFor: ['identity staging', 'spacing', 'monochrome hierarchy'], note: 'Current post-loader live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-more-nutrition', order: 38, title: 'More Nutrition Matcha',
        primaryCategory: 'Print-Tech Paper', extraFilters: ['Illustrated Storybook'],
        source: { kind: 'website', siteName: 'More Nutrition', url: 'https://more-nutrition.webflow.io/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'more-nutrition', originalAsset: '/assets/site-captures/20-more-nutrition.png' },
        media: { poster: '/assets/posters/site-20.jpg', detailImage: '/assets/site-captures/20-more-nutrition.png', original: '/assets/site-captures/20-more-nutrition.png', motionNotes: 'Packaging and nutrition marks animate into a tightly staged campaign frame after the loader.' },
        quality: { tier: 'canonical', width: 1251, height: 700, confidence: 1, reliableFor: ['packaging staging', 'type scale', 'palette', 'callout rhythm'], note: 'Current post-loader live capture with both browser scrollbars removed.' }
    },
    {
        id: 'site-aside', order: 39, title: 'Aside Browser',
        primaryCategory: 'Illustrated Storybook',
        source: { kind: 'website', siteName: 'Aside', url: 'https://aside.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'aside', originalAsset: '/assets/site-captures/21-aside.png' },
        media: { poster: '/assets/posters/site-21.jpg', detailImage: '/assets/site-captures/21-aside.png', original: '/assets/site-captures/21-aside.png', motionClip: '/assets/motion/aside.mp4' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['hero hierarchy', 'product staging', 'atmospheric palette', 'ambient interface motion'], note: 'Current live still with an unobstructed hardware-rendered hero motion capture.' }
    },
    {
        id: 'site-jitter', order: 40, title: 'Made with Jitter',
        primaryCategory: 'Print-Tech Paper',
        source: { kind: 'website', siteName: 'Made with Jitter', url: 'https://madewithjitter.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'jitter', originalAsset: '/assets/site-captures/22-jitter.png' },
        media: { poster: '/assets/posters/site-22.jpg', detailImage: '/assets/site-captures/22-jitter.png', original: '/assets/site-captures/22-jitter.png', motionClip: '/assets/motion/jitter.mp4' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['gallery framing', 'typography', 'motion hierarchy', 'featured-loop pacing'], note: 'Current live still with an unobstructed hardware-rendered hero motion capture.' }
    },
    {
        id: 'site-pen', order: 41, title: 'Pen.dev',
        primaryCategory: 'Print-Tech Paper',
        source: { kind: 'website', siteName: 'Pen.dev', url: 'https://www.pen.dev/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'pen', originalAsset: '/assets/site-captures/23-pen.png' },
        media: { poster: '/assets/posters/site-23.jpg', detailImage: '/assets/site-captures/23-pen.png', original: '/assets/site-captures/23-pen.png' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['hierarchy', 'typography', 'grid texture', 'conversion pattern'], note: 'Current live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-coda', order: 42, title: 'Coda Commerce',
        primaryCategory: 'Print-Tech Paper',
        source: { kind: 'website', siteName: 'Coda', url: 'https://www.coda.co/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'coda', originalAsset: '/assets/site-captures/24-coda.png' },
        media: { poster: '/assets/posters/site-24.jpg', detailImage: '/assets/site-captures/24-coda.png', original: '/assets/site-captures/24-coda.png', motionClip: '/assets/motion/coda.mp4', motionNotes: 'A tuned top-to-bottom scroll moves from the cream hero through animated scale statistics, black campaign statements, proof modules, partner content, and the footer, then holds at the bottom.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['type treatment', 'campaign composition', 'palette', 'brand tone'], note: 'Current live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-izanami', order: 43, title: 'Izanami',
        primaryCategory: 'Vast Quiet Cinematic', extraFilters: ['Classical Remix'],
        source: { kind: 'website', siteName: 'Izanami', url: 'https://izanami-official.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'izanami', originalAsset: '/assets/site-captures/25-izanami.png' },
        media: { poster: '/assets/posters/site-25.jpg', detailImage: '/assets/site-captures/25-izanami.png', original: '/assets/site-captures/25-izanami.png', motionNotes: 'A long loader gives way to an ambient fog scene and restrained philosophical text.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 0.94, reliableFor: ['atmosphere', 'scale', 'entrance pacing', 'palette'], note: 'Current atmospheric post-loader capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-ctgt', order: 44, title: 'CTGT Frontier Intelligence',
        primaryCategory: 'Vast Quiet Cinematic', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'CTGT', url: 'https://www.ctgt.ai/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'ctgt', originalAsset: '/assets/site-captures/26-ctgt.png' },
        media: { poster: '/assets/posters/site-26.jpg', detailImage: '/assets/site-captures/26-ctgt.png', original: '/assets/site-captures/26-ctgt.png', motionNotes: 'The mountainous film and dark overlay create slow environmental depth behind stable product navigation.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['composition', 'landscape metaphor', 'headline scale', 'navigation'], note: 'Current live capture with the browser scrollbar removed.' }
    },
    {
        id: 'site-ctgt-finance', order: 45, title: 'CTGT Finance',
        primaryCategory: 'Vast Quiet Cinematic', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'CTGT Finance', url: 'https://www.ctgt.ai/industries/finance', captureMethod: 'live-browser-capture', capturedAt: '2026-08-21', sourceGroupId: 'ctgt', originalAsset: '/assets/site-captures/27-ctgt-finance.png' },
        media: { poster: '/assets/posters/site-27.jpg', detailImage: '/assets/site-captures/27-ctgt-finance.png', original: '/assets/site-captures/27-ctgt-finance.png', motionNotes: 'Slow landscape motion supports a fixed governance message while the bottom feature panels behave as a measured navigation layer.' },
        quality: { tier: 'canonical', width: 1251, height: 713, confidence: 1, reliableFor: ['industry-page hierarchy', 'feature-panel integration', 'landscape staging'], note: 'Current live capture with the browser scrollbar removed.' }
    }
];
const expansionSeeds: Seed[] = [
    {
        id: 'site-notion-releases', order: 20, title: 'Notion Releases',
        primaryCategory: 'Print-Tech Paper', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'Notion Releases', url: 'https://www.notion.com/releases', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'notion', originalAsset: '/assets/site-captures/notion-releases.png' },
        media: { poster: '/assets/posters/notion-releases.jpg', detailImage: '/assets/site-captures/notion-releases.png', original: '/assets/site-captures/notion-releases.png' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['release-feed hierarchy', 'editorial spacing', 'screenshot framing', 'date labeling', 'typography'], note: 'High-resolution unobstructed live capture of the current release feed.' }
    },
    {
        id: 'site-x-business', order: 32, title: 'X Ads Measurement',
        primaryCategory: 'Dither Mono', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'X Ads Measurement', url: 'https://business.x.com/en', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'x-business', originalAsset: '/assets/site-captures/x-business.png' },
        media: { poster: '/assets/posters/x-business.jpg', detailImage: '/assets/site-captures/x-business.png', original: '/assets/site-captures/x-business.png' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['hero hierarchy', 'type scale', 'conversion pattern', 'monochrome palette'], note: 'High-resolution unobstructed live capture.' }
    },
    {
        id: 'site-x-basics', order: 33, title: 'X Business Basics',
        primaryCategory: 'Print-Tech Paper', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'X Business Basics', url: 'https://business.x.com/en/basics', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'x-business', originalAsset: '/assets/site-captures/x-basics.png' },
        media: { poster: '/assets/posters/x-basics.jpg', detailImage: '/assets/site-captures/x-basics.png', original: '/assets/site-captures/x-basics.png' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['content hierarchy', 'editorial spacing', 'navigation', 'module grouping'], note: 'High-resolution unobstructed live capture.' }
    },
    {
        id: 'site-x-intro', order: 34, title: 'Intro to X',
        primaryCategory: 'Print-Tech Paper', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'Intro to X', url: 'https://business.x.com/en/basics/intro-x-for-business', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'x-business', originalAsset: '/assets/site-captures/x-intro.png' },
        media: { poster: '/assets/posters/x-intro.jpg', detailImage: '/assets/site-captures/x-intro.png', original: '/assets/site-captures/x-intro.png' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['long-form hierarchy', 'headline scale', 'report spacing', 'evidence placement'], note: 'High-resolution unobstructed live capture.' }
    },
    {
        id: 'site-x-get-started', order: 35, title: 'Get Started with X',
        primaryCategory: 'Print-Tech Paper', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'Get Started with X', url: 'https://business.x.com/en/basics/get-your-business-started-with-x', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'x-business', originalAsset: '/assets/site-captures/x-get-started.png' },
        media: { poster: '/assets/posters/x-get-started.jpg', detailImage: '/assets/site-captures/x-get-started.png', original: '/assets/site-captures/x-get-started.png' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['onboarding hierarchy', 'instruction grouping', 'type scale', 'spacing'], note: 'High-resolution unobstructed live capture.' }
    },
    {
        id: 'site-x-organic', order: 36, title: 'X Best Practices',
        primaryCategory: 'Data-as-Texture', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'website', siteName: 'X Best Practices', url: 'https://business.x.com/en/basics/organic-best-practices', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'x-business', originalAsset: '/assets/site-captures/x-organic.png' },
        media: { poster: '/assets/posters/x-organic.jpg', detailImage: '/assets/site-captures/x-organic.png', original: '/assets/site-captures/x-organic.png' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['guidance density', 'module hierarchy', 'typographic contrast', 'grid structure'], note: 'High-resolution unobstructed live capture.' }
    },
    {
        id: 'site-x-ads-start', order: 37, title: 'Getting Started with X Ads',
        primaryCategory: 'Data-as-Texture', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'website', siteName: 'Getting Started with X Ads', url: 'https://business.x.com/en/advertising/get-started-with-twitter-ads', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'x-business', originalAsset: '/assets/site-captures/x-ads-start.png' },
        media: { poster: '/assets/posters/x-ads-start.jpg', detailImage: '/assets/site-captures/x-ads-start.png', original: '/assets/site-captures/x-ads-start.png' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['procedural hierarchy', 'setup grouping', 'technical labels', 'spacing'], note: 'High-resolution unobstructed live capture.' }
    },
    {
        id: 'site-x-ad-formats', order: 38, title: 'X Ad Formats',
        primaryCategory: 'Data-as-Texture', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'website', siteName: 'X Ad Formats', url: 'https://business.x.com/en/advertising/formats', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'x-business', originalAsset: '/assets/site-captures/x-ad-formats.png' },
        media: { poster: '/assets/posters/x-ad-formats.jpg', detailImage: '/assets/site-captures/x-ad-formats.png', original: '/assets/site-captures/x-ad-formats.png' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['catalog hierarchy', 'comparison pattern', 'taxonomy', 'module spacing'], note: 'High-resolution unobstructed live capture.' }
    },
    {
        id: 'site-paper', order: 53, title: 'Paper — Design, Share, Ship',
        primaryCategory: 'Data-as-Texture', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'website', siteName: 'Paper', url: 'https://paper.design/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'paper', originalAsset: '/assets/site-captures/paper.png' },
        media: { poster: '/assets/posters/paper.jpg', detailImage: '/assets/site-captures/paper.png', original: '/assets/site-captures/paper.png', motionClip: '/assets/motion/paper.mp4', motionNotes: 'A smooth top-to-bottom scroll moves from the connected-canvas hero through desktop workflow, code round-tripping, real-data examples, agent handoff, and roadmap/footer states; the heavy original sequence is time-compressed to about sixteen seconds and settles at the bottom.' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['hero hierarchy', 'product-interface framing', 'paper texture', 'workflow sequencing', 'scroll behavior'], note: 'High-resolution unobstructed live capture with a locally recorded full-page motion sequence.' }
    },
    {
        id: 'site-cursor', order: 54, title: 'Cursor — Ambitious Software',
        primaryCategory: 'Data-as-Texture', extraFilters: ['Print-Tech Paper'],
        source: { kind: 'website', siteName: 'Cursor', url: 'https://cursor.com/home', captureMethod: 'live-browser-capture', capturedAt: '2026-08-22', sourceGroupId: 'cursor', originalAsset: '/assets/site-captures/cursor.png' },
        media: { poster: '/assets/posters/cursor.jpg', detailImage: '/assets/site-captures/cursor.png', original: '/assets/site-captures/cursor.png', motionClip: '/assets/motion/cursor.mp4', motionNotes: 'A smooth top-to-bottom scroll moves from the coding-agent hero and layered desktop/CLI demonstration through customer proof, autonomous-agent and multi-tool workflows, frontier model and enterprise modules, research highlights, and the final download footer; short section holds keep dense interface text legible before the roughly twenty-one-second sequence settles at the bottom.' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['hero hierarchy', 'product-interface framing', 'editorial spacing', 'software proof density', 'scroll sequencing'], note: 'High-resolution unobstructed live still plus a hardware-rendered full-page motion capture with browser chrome and scrollbars excluded.' }
    },
    {
        id: 'site-plinth', order: 55, title: 'Plinth',
        primaryCategory: 'Classical Remix', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'Plinth', url: 'https://plinthai.xyz/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'plinth', originalAsset: '/assets/site-captures/plinth.png' },
        media: { poster: '/assets/posters/plinth.jpg', detailImage: '/assets/site-captures/plinth.png', original: '/assets/site-captures/plinth.png', motionClip: '/assets/motion/plinth.mp4' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['hero hierarchy', 'classical artwork', 'metallic palette', 'marketplace interface', 'scroll sequencing'], note: 'High-resolution unobstructed live still plus a hardware-rendered full-page motion capture.' }
    },
    {
        id: 'site-fin', order: 56, title: 'Fin',
        primaryCategory: 'Vast Quiet Cinematic', extraFilters: ['Data-as-Texture'],
        source: { kind: 'website', siteName: 'Fin', url: 'https://www.fin.com/', captureMethod: 'live-browser-capture', capturedAt: '2026-08-23', sourceGroupId: 'fin', originalAsset: '/assets/site-captures/fin.png' },
        media: { poster: '/assets/posters/fin.jpg', detailImage: '/assets/site-captures/fin.png', original: '/assets/site-captures/fin.png', motionClip: '/assets/motion/fin.mp4' },
        quality: { tier: 'canonical', width: 1600, height: 1000, confidence: 1, reliableFor: ['hero hierarchy', 'planetary imagery', 'typography', 'financial proof', 'scroll sequencing'], note: 'High-resolution unobstructed live still plus a hardware-rendered full-page motion capture.' }
    }
];
const additionalImageSeeds: Seed[] = [
    {
        id: 'image-voidpixel', order: 46, title: 'Voidpixel — Everything Begins With One Pixel',
        primaryCategory: 'Dither Mono', extraFilters: ['Data-as-Texture'],
        source: { kind: 'image', siteName: 'Voidpixel', captureMethod: 'original-upload', sourceGroupId: 'voidpixel', originalAsset: imageFile(19, 'jpg') },
        media: { poster: '/assets/posters/image-19.jpg', detailImage: imageFile(19, 'jpg'), original: imageFile(19, 'jpg') },
        quality: { tier: 'canonical', width: 2880, height: 2202, confidence: 0.98, reliableFor: ['hero layout', 'pixel typography', 'dashboard composition', 'palette', 'texture'], note: 'High-resolution unaltered supplied source. No verified public website URL is attached.' }
    },
    {
        id: 'image-root-soil', order: 58, title: 'Root & Soil',
        primaryCategory: 'Vast Quiet Cinematic', extraFilters: ['Illustrated Storybook'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'root-soil', originalAsset: imageFile(20, 'jpg') },
        media: { poster: '/assets/posters/image-20.jpg', detailImage: imageFile(20, 'jpg'), original: imageFile(20, 'jpg') },
        quality: { tier: 'canonical', width: 1440, height: 960, confidence: 0.98, reliableFor: ['hero hierarchy', 'type scale', 'landscape treatment', 'palette', 'partner placement'], note: 'High-resolution unaltered supplied source.' }
    },
    {
        id: 'image-rooted', order: 59, title: 'Rooted',
        primaryCategory: 'Print-Tech Paper', extraFilters: ['Vast Quiet Cinematic'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'rooted', originalAsset: imageFile(21, 'jpg') },
        media: { poster: '/assets/posters/image-21.jpg', detailImage: imageFile(21, 'jpg'), original: imageFile(21, 'jpg') },
        quality: { tier: 'canonical', width: 1440, height: 962, confidence: 0.98, reliableFor: ['editorial hierarchy', 'type scale', 'archival image treatment', 'palette', 'partner placement'], note: 'High-resolution unaltered supplied source.' }
    },
    {
        id: 'image-meadow', order: 60, title: 'Meadow',
        primaryCategory: 'Illustrated Storybook', extraFilters: ['Vast Quiet Cinematic'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'meadow', originalAsset: imageFile(22, 'jpg') },
        media: { poster: '/assets/posters/image-22.jpg', detailImage: imageFile(22, 'jpg'), original: imageFile(22, 'jpg') },
        quality: { tier: 'canonical', width: 1435, height: 822, confidence: 0.98, reliableFor: ['hero hierarchy', 'illustration', 'CTA geometry', 'palette', 'proof placement'], note: 'High-resolution unaltered supplied source.' }
    },
    {
        id: 'image-grilled', order: 61, title: 'Perfectly Grilled',
        primaryCategory: 'Data-as-Texture', extraFilters: ['Dither Mono'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'perfectly-grilled', originalAsset: imageFile(23, 'png') },
        media: { poster: '/assets/posters/image-23.jpg', detailImage: imageFile(23, 'png'), original: imageFile(23, 'png') },
        quality: { tier: 'canonical', width: 1411, height: 835, confidence: 0.98, reliableFor: ['radial composition', 'annotation system', 'food photography', 'contrast', 'label placement'], note: 'High-resolution unaltered supplied source.' }
    },
    {
        id: 'image-synthos', order: 62, title: 'Synthos',
        primaryCategory: 'Glitched Antiquity', extraFilters: ['Dither Mono', 'Classical Remix'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'synthos', originalAsset: imageFile(24, 'jpg') },
        media: { poster: '/assets/posters/image-24.jpg', detailImage: imageFile(24, 'jpg'), original: imageFile(24, 'jpg') },
        quality: { tier: 'canonical', width: 1438, height: 1020, confidence: 0.98, reliableFor: ['hero composition', 'typography', 'ink-wash treatment', 'input geometry', 'microcopy hierarchy'], note: 'High-resolution unaltered supplied source.' }
    },
    {
        id: 'image-bloom-brush', order: 63, title: 'Bloom & Brush',
        primaryCategory: 'Illustrated Storybook', extraFilters: ['Classical Remix'],
        source: { kind: 'image', captureMethod: 'original-upload', sourceGroupId: 'bloom-brush', originalAsset: imageFile(25, 'jpg') },
        media: { poster: '/assets/posters/image-25.jpg', detailImage: imageFile(25, 'jpg'), original: imageFile(25, 'jpg') },
        quality: { tier: 'canonical', width: 1437, height: 1015, confidence: 0.98, reliableFor: ['hero hierarchy', 'typography', 'ink-wash treatment', 'CTA placement', 'statistics'], note: 'High-resolution unaltered supplied source.' }
    }
];
const seedById = new Map([...imageSeeds, ...siteSeeds, ...expansionSeeds, ...additionalImageSeeds]
    .map((seed) => [seed.id, seed] as const));
const orderedIds = [
    ...imageSeeds.map((seed) => seed.id),
    'site-notion',
    'site-notion-releases',
    'site-spade',
    'site-sstr',
    'site-watch',
    'site-igloo',
    'site-dont-board-me',
    'site-opal',
    'site-lusion',
    'site-mana',
    'site-orano',
    'site-snows',
    'site-x-advertising',
    'site-x-business',
    'site-x-basics',
    'site-x-intro',
    'site-x-get-started',
    'site-x-organic',
    'site-x-ads-start',
    'site-x-ad-formats',
    'site-schemas',
    'site-apple',
    'site-clou',
    'site-system-patch',
    'site-oqoqo',
    'site-human-made',
    'site-more-nutrition',
    'site-aside',
    'site-jitter',
    'site-pen',
    'site-coda',
    'site-izanami',
    'site-ctgt',
    'site-ctgt-finance',
    'site-paper',
    'site-cursor',
    'site-plinth',
    'site-fin',
    'image-voidpixel',
    'image-root-soil',
    'image-rooted',
    'image-meadow',
    'image-grilled',
    'image-synthos',
    'image-bloom-brush',
];
export const references = ReferenceManifestSchema.parse(orderedIds.map((id, index) => {
    const seed = seedById.get(id);
    if (!seed)
        throw new Error(`Missing reference seed: ${id}`);
    return buildEntry({ ...seed, order: index + 1 });
}));
export const categories: Array<'All' | Category> = [
    'All',
    'Print-Tech Paper',
    'Dither Mono',
    'Vast Quiet Cinematic',
    'Data-as-Texture',
    'Classical Remix',
    'Glitched Antiquity',
    'Illustrated Storybook',
];
