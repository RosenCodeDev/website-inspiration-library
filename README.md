# Website Inspiration Library

A private, local-first reference library for keeping a human in the design loop and giving AI concrete visual direction. It contains 63 independently curated moments: 25 supplied image references and 38 website-sourced cards.

**New user? Follow the [First-Time User Guide](FIRST-TIME-USER-GUIDE.md) for copy-and-paste installation and website-start instructions.**

## Run locally

```powershell
cd C:\Users\hrose\Desktop\website-inspiration-library
npm install
npm run dev
```

Open `http://127.0.0.1:4173/`. The app has no login, database, tracking, or remote runtime dependency. All displayed reference media is stored under `public/assets`.

## How the catalog works

- `src/references.ts` holds identity, ordering, categories, provenance, quality limits, and runtime media. `src/reference-content.ts` is the single source of truth for descriptors, descriptions, scope, interface inventory, observable tags, image recipes, structured AI briefs, and motion evidence.
- `src/reference-schema.ts` validates the complete 63-entry manifest at startup.
- Image recipes are classified as a primary generated visual, a supporting generated layer, or `build in code`. Code-native diagrams, real product interfaces, and exact branded assets do not expose a misleading image-prompt action.
- The eleven-field design brief adds Scope and Interface inventory to the original visual fields. Its Motion field is an implementation recommendation; the separate Motion behavior section reports captured evidence only.
- `Copy Agent Packet` combines the complete reference, brief, quality limits, and observed motion for an implementation agent. Focused Brief and Image Prompt actions remain available; copied image guidance defaults to Codex while retaining Higgsfield or another capable model as an option.
- Every reference has one primary category and may appear in overlapping secondary filters.
- The seven filters describe observable visual styles; there is no catch-all “Reference Styles” category.
- The grid always starts with a still 8:5 poster. On mouse devices, hovering only the image region of one of the fourteen motion-enabled cards starts its muted local MP4 from the beginning; leaving resets it to the poster, and only one grid preview can run at a time. Nearby clips preload while paused so the first decoded frame can replace the poster without flashing. Touch grids and reduced-motion environments remain still.
- The detail modal uses the same poster-first behavior: its clip plays only while the top visual area is hovered, has no player chrome, and resets to the full-size still on leave. A rejected or missing video falls back to the still.
- Green, amber, and red dots mean canonical, usable, and limited source quality. Canonical sources support detailed analysis; usable sources support composition, palette, imagery, and broad hierarchy; limited sources are concept and rough-composition cues only.
- Backend-only workflow intelligence assigns every card a page type, design roles, page uses, safe anchor uses, anchor/support strength, best use, caution, and curated clone mode. Seven category Taste Constitutions keep multi-reference directions coherent. These fields guide `design-taste-injection` without changing the portal UI.

## Design Taste Injection

The repository contains the reusable Codex skill under `skills/design-taste-injection`. Install or update it globally with:

```powershell
npm run setup:codex
npm run check:codex
npm run doctor
```

Restart Codex Desktop, open an independent website project folder, and paste `$design-taste-injection` into the Codex chat. The skill reads this library in place and stores all project-specific state under the target project’s `.inspiration` folder. It never writes website work into this repository.

The workflow uses schema-v5 state, validated saved reference actions, project-wide usage diversity, and `diverse` shared-system selection by default. The schema limits the initial category comparison to one focused hero-and-opening-module preview per direction, preventing seven complete sites from being built before category approval. `system-depth` is available when several Notion, X, or other grouped moments need distinct jobs. Clone Remix is supported for curated, measurable references with human approval; it is not presented as a guarantee for arbitrary websites. After installing the current skill, `npm run test:public-clone` runs the network-dependent Aside clean-room clone and identity-safe remix pilot; it remains outside CI because public availability and bot protection are nondeterministic. The latest measured result is recorded in [docs/validation/PUBLIC-CLONE-PILOT.md](docs/validation/PUBLIC-CLONE-PILOT.md). The original-design path is validated by deterministic tests and build checks, but a supervised first-time non-coder pilot remains an empirical release exercise rather than a claim made by the repository.

Run `npm run release:check` before a release. It validates scripts and the skill, checks the pinned vendor and archive pointers, runs tests and the portal build, verifies a temporary global installation, and reconstructs a controlled responsive fixture that must remain functional after its source server stops.

## Media and provenance

- The 25 active image files are copied byte-for-byte from `archive/Example Websites Images` to `public/assets/originals`. Superseded source files are retained under `archive/Superseded Source Images` and in Git history.
- Current website captures live in `public/assets/site-captures`; accidental browser scrollbar tracks are cropped from the affected captures.
- Runtime media resolves from the exported catalog's `publicAssetRoot` plus each card's `/assets/...` path. These ordinary Git files under `public/assets` are the only media required by the portal; Git LFS stores historical evidence only.
- Uniform 1600×1000 derivatives live in `public/assets/posters`. Most use a high-quality non-generative bicubic crop. Supplied images 20, 21, 22, 24, and 25 use card-specific smart crops; image 23 uses a matching background mat and contain fit. Detail views continue to use the uncropped originals.
- Muted 1440×900 H.264 High Profile previews live in `public/assets/motion`. They were recorded directly from Spade, SSTR, Igloo, Lusion, Schemas of Uncertainty, System Patch, Oqoqo, Aside, Jitter, Coda, Paper, Cursor, Plinth, and Fin at a verified 30 fps with hardware-accelerated Chrome, frame-synchronized interaction, hidden scrollbars, and offline quality-focused encoding. Scrolling recipes refresh the document height while recording and fail unless they reach the verified bottom. The 60 fps proof was rejected because this computer could not sustain 60 real captured frames per second; no frames were interpolated or relabelled. No third-party gallery recordings are used.
- Capture-only browser and encoding dependencies are excluded from the production app. Selected historical takes and review evidence are retained under `archive/Capture History`; new scratch captures remain ignored until deliberately promoted.
- The exact hardware-capture recipes and encoding settings are tracked under `capture-tools`; see `capture-tools/README.md`. New temporary takes, browser profiles, and contact sheets remain ignored under `capture-work` until deliberately promoted into the archive.
- The former `Motion and New Static Images` guide folder was removed after the approved Don’t Board Me and Orano assets were incorporated under `public/assets/site-captures`; no runtime component depends on the removed folder.
- `scripts/remove-capture-scrollbars.ps1` contains dimension-guarded crops for the seven captures that originally included browser scrollbars; run it before regenerating posters if those source captures are restored.
- Images 13 and 15 use recovered live captures from Linq and Marble in the UI while retaining their original video frames for provenance.
- Images 12, 14, 16, 17, and 18 use user-approved, source-guided generated reconstructions and are marked `usable`, never `canonical`; their original YouTube frames remain archived.

Regenerate copies and posters after adding source media:

```powershell
& .\scripts\generate-media.ps1
```

## Add a new reference

1. Save the untouched source in the appropriate local asset folder.
2. Add identity, categories, provenance, quality limits, and media paths to `src/references.ts`.
3. Add the card’s concise descriptor, description, scope, interface inventory, 4–8 observable tags, recipe classification, complete eleven-field design profile, and factual motion behavior to `src/reference-content.ts`.
4. Add its page type, design roles, page uses, anchor/support strength, best use, and caution to `src/workflow-intelligence.ts`.
5. Generate the 8:5 poster without overwriting the original.
6. If it is a linked website, capture a stable hero state and add the verified HTTPS URL. Use a separate card for each genuinely distinct moment from the same site, sharing `sourceGroupId`.
7. If motion materially defines the reference, preload fonts and lazy assets, record a hardware-rendered take with hidden scrollbars and frame-synchronized interactions, verify real cadence, then encode a muted fast-start 1440×900 H.264 MP4 offline. Describe only observed trigger, sequence, fixed layers, pacing, and endpoint in Motion behavior; put adaptation advice in the brief’s Motion field.
8. Export and review the workflow catalog, acknowledge the changed fingerprint, then run `npm test` and `npm run build`. See `docs/LIBRARY-MAINTENANCE.md`.

New external inspirations or generated substitute images should only be added after explicit approval.

## Development archive and Git LFS

The application lives directly in this repository root. Historical source material is consolidated under `archive`; see `archive/README.md` for its contents.

The unique MKV and WebM files under `archive/Capture History` are backed up through Git LFS. They are not runtime dependencies. A clone without Git LFS still contains the complete portal and can run `npm install`, `npm test`, `npm run build`, and `npm run dev`; only the historical recording files remain as small pointer files.

To retrieve and verify the full historical recording archive:

```powershell
git lfs install
git lfs pull --include="archive/Capture History/**"
npm run verify:archive
```
