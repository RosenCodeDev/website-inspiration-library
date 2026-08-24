# Website Inspiration Library

A private, local-first reference library for keeping a human in the design loop and giving AI concrete visual direction. It contains 63 independently curated moments: 25 supplied image references and 38 website-sourced cards.

## Run locally

```powershell
cd C:\Users\hrose\Desktop\website-library
npm install
npm run dev
```

Open `http://127.0.0.1:4173/`. The app has no login, database, tracking, or remote runtime dependency. All displayed reference media is stored under `public/assets`.

## How the catalog works

- `src/references.ts` holds identity, ordering, categories, provenance, quality limits, and runtime media. `src/reference-content.ts` is the single source of truth for descriptors, descriptions, scope, interface inventory, observable tags, image recipes, structured AI briefs, and motion evidence.
- `src/reference-schema.ts` validates the complete 63-entry manifest at startup.
- Image recipes are classified as a primary generated visual, a supporting generated layer, or `build in code`. Code-native diagrams, real product interfaces, and exact branded assets do not expose a misleading image-prompt action.
- The eleven-field design brief adds Scope and Interface inventory to the original visual fields. Its Motion field is an implementation recommendation; the separate Motion behavior section reports captured evidence only.
- `Copy Agent Packet` combines the complete reference, brief, quality limits, and observed motion for an implementation agent. The focused Brief and Image Prompt actions remain available, and generated-image instructions explicitly target Higgsfield or another image-generation model at 2K.
- Every reference has one primary category and may appear in overlapping secondary filters.
- The seven filters describe observable visual styles; there is no catch-all “Reference Styles” category.
- The grid always starts with a still 8:5 poster. On mouse devices, hovering only the image region of one of the fourteen motion-enabled cards starts its muted local MP4 from the beginning; leaving resets it to the poster, and only one grid preview can run at a time. Nearby clips preload while paused so the first decoded frame can replace the poster without flashing. Touch grids and reduced-motion environments remain still.
- The detail modal uses the same poster-first behavior: its clip plays only while the top visual area is hovered, has no player chrome, and resets to the full-size still on leave. A rejected or missing video falls back to the still.
- Green, amber, and red dots mean canonical, usable, and limited source quality. Canonical sources support detailed analysis; usable sources support composition, palette, imagery, and broad hierarchy; limited sources are concept and rough-composition cues only.

## Media and provenance

- The 25 active image files are copied byte-for-byte from `archive/Example Websites Images` to `public/assets/originals`. Superseded source files are retained under `archive/Superseded Source Images` and in Git history.
- Current website captures live in `public/assets/site-captures`; accidental browser scrollbar tracks are cropped from the affected captures.
- Uniform 1600×1000 derivatives live in `public/assets/posters`. Most use a high-quality non-generative bicubic crop; supplied images 20–25 use a matching background mat and contain fit so important edge content is not removed.
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
4. Generate the 8:5 poster without overwriting the original.
5. If it is a linked website, capture a stable hero state and add the verified HTTPS URL. Use a separate card for each genuinely distinct moment from the same site, sharing `sourceGroupId`.
6. If motion materially defines the reference, preload fonts and lazy assets, record a hardware-rendered take with hidden scrollbars and frame-synchronized interactions, verify real cadence, then encode a muted fast-start 1440×900 H.264 MP4 offline. Describe only observed trigger, sequence, fixed layers, pacing, and endpoint in Motion behavior; put adaptation advice in the brief’s Motion field.
7. Run `npm test` and `npm run build`.

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
