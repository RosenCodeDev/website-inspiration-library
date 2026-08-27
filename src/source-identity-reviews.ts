type ReviewedIdentity = {
  exactCopy: string[];
  distinctiveClaims: string[];
  knownMarkAssetIds: string[];
  knownMarkAssetHashes: string[];
  characters: string[];
  products: string[];
  people: string[];
  packaging: string[];
  interfaceFragments: string[];
  sourceSpecificExclusions: string[];
  reviewedAt: string;
  reviewedBy: string;
  reviewBasis: string;
  reviewFingerprint: string;
};

const reviewedAt = '2026-08-27';
const reviewedBy = 'Codex maintainer review';
const reviewBasis = 'Canonical still, reviewed provenance, source metadata, visible source copy, and source-specific identity inventory.';
const pendingFingerprint = '0'.repeat(64);
const review = (input: Partial<ReviewedIdentity> & Pick<ReviewedIdentity, 'distinctiveClaims'>): ReviewedIdentity => ({
  exactCopy: [], knownMarkAssetIds: [], knownMarkAssetHashes: [], characters: [], products: [], people: [], packaging: [], interfaceFragments: [], sourceSpecificExclusions: [],
  reviewedAt, reviewedBy, reviewBasis, reviewFingerprint: pendingFingerprint, ...input,
});

export const sourceIdentityReviews: Record<string, ReviewedIdentity> = {
  'site-spade': review({ distinctiveClaims: ['The data & AI platform for modern finance'], products: ['contour-line coin hero', 'transaction ledger panels'], interfaceFragments: ['transaction ID panel', 'merchant transaction card'] }),
  'site-more-nutrition': review({ distinctiveClaims: ['MATCHA MEETS PROTEIN'], products: ['More Nutrition iced matcha protein tub'], packaging: ['green More protein tub'], interfaceFragments: ['nutrition claim bubbles'] }),
  'site-pen': review({ distinctiveClaims: ['Dream on canvas. Land in code.'], products: ['pen.dev design-to-code product'], interfaceFragments: ['Backed by pill with partner marks'] }),
  'site-coda': review({ distinctiveClaims: ['CUSTOMIZE MONETIZE MAXIMIZE'], products: ['Coda merchant-of-record platform'], interfaceFragments: ['Coda pictogram word treatment'] }),
  'image-rooted': review({ distinctiveClaims: ['Rebuilding Forests One Tree At A Time'], products: ['ROOTED reforestation initiative'], interfaceFragments: ['partner logo strip'] }),
  'image-astra-ai': review({ distinctiveClaims: ['AI That Works the Way You Do'], products: ['Astra AI assistant'], interfaceFragments: ['Ask anything composer', 'Generate Audio label', 'Generate Image label'] }),
  'image-castle-waitlist': review({ distinctiveClaims: ['The waitlist is now open'], products: ['Castle waitlist'], characters: ['dithered castle silhouette'] }),
  'image-voidpixel': review({ distinctiveClaims: ['Everything Begins With One Pixel.'], products: ['Voidpixel product dashboard'], interfaceFragments: ['Voidpixel dashboard screenshot'] }),
  'image-linq-recovered': review({ distinctiveClaims: ['Build robust messaging capabilities in minutes'], products: ['Linq messaging platform'], characters: ['illustrated commuter looking at a phone'] }),
  'site-watch': review({ distinctiveClaims: ['FS60P', 'MODEL 146GR'], products: ['FS60P silver steel watch'], interfaceFragments: ['circular watch selector guides'] }),
  'site-igloo': review({ distinctiveClaims: ['IGLOO'], products: ['Igloo consumer-brand platform'], characters: ['glowing igloo assembled from rectangular blocks'] }),
  'site-lusion': review({ distinctiveClaims: ['We create 3D visual storytelling and interactive web experiences that help brands stand out'], products: ['Lusion interactive studio'], interfaceFragments: ['blue black and white 3D connector forms'] }),
  'site-ctgt': review({ distinctiveClaims: ['Reliable frontier intelligence for regulated domains'], products: ['CTGT interpretability research platform'], interfaceFragments: ['CTGT mountain research hero'] }),
  'site-ctgt-finance': review({ distinctiveClaims: ['From probabilistic guardrails to deterministic governance'], products: ['CTGT finance governance page'], interfaceFragments: ['deterministic reasoning service rail'] }),
  'site-fin': review({ distinctiveClaims: ['Global Money Movement'], products: ['Fin cross-border payments platform'], interfaceFragments: ['golden globe with hexadecimal texture'] }),
  'image-root-soil': review({ distinctiveClaims: ['Every Harvest Begins With Healthy Soil'], products: ['Root & Soil agricultural platform'], interfaceFragments: ['partner logo strip over autumn field'] }),
  'image-nova-stack': review({ distinctiveClaims: ['Connect your stack. NOVA does the rest.'], products: ['NOVA developer stack'], interfaceFragments: ['isometric integration platform with third-party marks'] }),
  'image-launchpad-tools': review({ distinctiveClaims: ['Connect the Tools You Already Rely On'], products: ['Figmanoob connection platform'], interfaceFragments: ['orbiting third-party app marks'] }),
  'site-sstr': review({ distinctiveClaims: ['PUSHING THE LIMITS OF DRILLING'], products: ['CCTP drilling hardware'], interfaceFragments: ['Site of the Day ribbon'] }),
  'site-oqoqo': review({ distinctiveClaims: ['The easiest way to build evals and custom benchmarks for real-world agentic tasks'], products: ['Oqoqo evaluation platform'], interfaceFragments: ['Oqoqo experiment configuration interface'] }),
  'site-paper': review({ distinctiveClaims: ['design incredible', 'the connected canvas for teams shipping with agents'], products: ['Paper connected canvas'], interfaceFragments: ['Paper editor and agent terminal composite'] }),
  'site-cursor': review({ distinctiveClaims: ['Cursor is your coding agent for building ambitious software.'], products: ['Cursor coding agent'], interfaceFragments: ['Cursor Desktop and Cursor CLI composite'] }),
  'image-auron-architecture': review({ distinctiveClaims: ['Crafted for Visionaries'], products: ['Aureon design studio'], interfaceFragments: ['engraved Acropolis hero'] }),
  'site-plinth': review({ distinctiveClaims: ['A marketplace of AI agents. Pay per call.'], products: ['Plinth agent marketplace'], characters: ['classical sword-bearing figure'], interfaceFragments: ['agent publishing composer'] }),
  'image-voypix': review({ distinctiveClaims: ['Everything Begins With One Pixel.'], products: ['Voidpixel product platform'], characters: ['engraved reaching hands'], interfaceFragments: ['pixel-field hero'] }),
  'image-synthos': review({ distinctiveClaims: ['From confusion to clarity, in seconds.'], products: ['Synthos learning assistant'], characters: ['ink-wash mountain landscape with lone figure'], interfaceFragments: ['Ask Synthos composer'] }),
  'image-bloomride': review({ distinctiveClaims: ["Discover Europe's most scenic cycling adventures."], products: ['BloomRide cycling tours'], characters: ['cyclist and windmill landscape'], interfaceFragments: ['tour search panel'] }),
  'image-marble-recovered': review({ distinctiveClaims: ['An interactive world built to keep kids curious, not quiet'], products: ['Marble interactive world'], characters: ['child kayaking toward a fantasy island'] }),
  'site-notion': review({ distinctiveClaims: ['Where teams and agents ship together.'], products: ['Notion workspace'], characters: ['Notion illustrated team and agent avatars'], interfaceFragments: ['Notion product UI and customer logo strip'] }),
  'site-dont-board-me': review({ distinctiveClaims: ['A TIRED DOG IS A HAPPY DOG!'], products: ["Don't Board Me pet care"], characters: ['large shaggy dog illustration'] }),
  'site-mana': review({ distinctiveClaims: ['Melon & Mint'], products: ['MANA yerba mate can'], packaging: ['MANA illustrated beverage can'], characters: ['illustrated heart, flowers, leaves, and surfboard'] }),
  'site-aside': review({ distinctiveClaims: ["The most intelligent AI assistant, but it’s a browser."], products: ['Aside AI browser'], interfaceFragments: ['Aside browser window mockup'] }),
  'image-meadow': review({ distinctiveClaims: ['The Productivity Workspace Built for Deep Focus'], products: ['Meadow productivity workspace'], characters: ['pastoral field and monumental cloud illustration'] }),
  'image-bloom-brush': review({ distinctiveClaims: ['Art That Speaks Without Words'], products: ['Bloom & Brush Studio'], characters: ['pink blossom ink-wash landscape'] }),
};

const reviewFingerprints: Record<string, string> = {
  'image-astra-ai': '0cf2c30cbea4e807e82787e4a9c7889c9470d89050541a43d6c0e1982280fe8d',
  'image-castle-waitlist': 'dda9aae1f4977ab1b5132f181be885637a367b1a5a378564794e4029d3470843',
  'image-bloomride': 'e6c07e1f8b2a815fc48240d82504e4e632f1c9709a101cff48bd67f331df734f',
  'image-voypix': '4fcdc4c9a7bd063f4a1766648f32c8f67ad5128d7f6bcdd918a72e49ae9ac404',
  'image-nova-stack': '35036604c20f458353abfc8a2049e056109ee398d4b8e75c7c9f49dee5b34c25',
  'image-auron-architecture': 'dd725273e77cb9a8a92c1aac55eaf9ea777e8542fd517f908533aaa3ccf6ca50',
  'image-launchpad-tools': 'dc2449d8e25df62090f40a2d8ce5f4fdcb645b4e8c085dc4cba721a1397f688a',
  'image-linq-recovered': '37180f95c5c225adeb079d357bf356ae80aac0be29ae05778a22c3712a036116',
  'image-marble-recovered': 'd9e2ab87b491e7910e0f6b629f69fb5cf501ceb9d262890c906bbd9480e44c0a',
  'site-notion': '5e4f59d35dc6c8a164b7fc7bc632b929f28bd7203aed9b6ffc5531f7d7e6afe3',
  'site-spade': 'b72d00103d2eb1ff8afb590072605b95537132c285bc841acccd93c1bc175e71',
  'site-sstr': '99400c5b7d9b96436077b45e325f5ca949d22fa7e757399a51a3492bcae96b39',
  'site-watch': 'e329482c51ed9ad6ad797bfd20918abcbde0fcf547b16a51be7a5536ddfc4125',
  'site-igloo': '6164bc7fc51d0603158334a4cf19611eed0c2a2c09f12426a4cd562e409a4196',
  'site-dont-board-me': '693fb1ded13449075655d68daf6c7d8f0252887ae1f6de4e76d0fa9daa3b8885',
  'site-lusion': '8887713e094f09c3b8dbfd02aba0310fff24fb46fc031e1898eb2f1d5d15d742',
  'site-mana': '5431b3a53dc60a252c355fb7701077b8f6d7974ff9b58c491592d9cc5bfcecd5',
  'site-oqoqo': 'b7c0960172c852603b45e702af4a3fb5717363fd2a7eedf28f657ab464c74a1e',
  'site-more-nutrition': '5cfbe8935e95815eb1e64d1710d18f1527c3af7d148f1ed144430d74988eb315',
  'site-aside': '80d42ece157fcfb1034ebaa82171a1dc9457a59f9c8af36fe11ab426a1ac434d',
  'site-pen': '6043cbe74deb31c2ea4e99a496b974ee6062377b20d9503f755f19d4c4553b37',
  'site-coda': '39a79826f48ce46a1e21e5bf3a30e22b2f9e10595baef7fedcbe656ecdfc7517',
  'site-ctgt': 'a52177618888e8a969b425abacb9876b98ea8439b825694205d685a25726e9c3',
  'site-ctgt-finance': '956866fb132e1a27924d13cca50bafb0b8a6d3498148c7634580769370ffd88d',
  'site-paper': '18e910d91c3e654d52de0689e7edccd0b800526301850a2db2dcbfc4070e16c9',
  'site-cursor': '7e62ec36166be13c3c6087f324ba5ea5b9d894b9c65a061d79c61c007599d1b8',
  'site-plinth': '9be0d29832d38b0527a09f8cdd863322e398a5418e3891077c5d9c07856e0645',
  'site-fin': '28874184681b01877d8ae6f7d6bcfae8d339482dca19e2c7d3985526025b5460',
  'image-voidpixel': '4b675698fd01b5629256644c5c2259d7987e9e8afec8951408cc02072a632bf8',
  'image-root-soil': 'eaf1297c4ecb20d536b6b62c1dca461cd0fa82512b86c5012859bf49da8b5791',
  'image-rooted': '31759bf85d0de76c78a31db59f6611048a502d56499657166a726d170f71b537',
  'image-meadow': '56d29b877777879376614d6acf53f97d24908841297f36954f0aaccc8fb4e48d',
  'image-synthos': '44852d72f86a150bf2859f6257cce040cdc124836e59eaf69850b63dd1cfb338',
  'image-bloom-brush': 'a3f983499a0d7d32375aacfafa10f65094e0aa6220684f6128ff8391db150c3b',
};

for (const [id, fingerprint] of Object.entries(reviewFingerprints)) sourceIdentityReviews[id].reviewFingerprint = fingerprint;
