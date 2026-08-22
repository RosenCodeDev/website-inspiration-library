# Website Inspiration Library

A private, local-first reference library for keeping a human in the design loop and giving AI concrete visual direction. It contains 46 independently curated hero moments: 19 image references and 27 live website captures.

## Run locally

```powershell
cd C:\Users\hrose\Desktop\website-library\library-app
npm install
npm run dev
```

Open `http://127.0.0.1:4173/`. The app has no login, database, tracking, or remote runtime dependency. All displayed reference media is stored under `public/assets`.

## How the catalog works

- `src/references.ts` is the authored manifest. Each entry contains categories, observable tags, provenance, quality limits, a structured AI brief, and an original-concept image prompt.
- `src/reference-schema.ts` validates the complete 46-entry manifest at startup.
- Every reference has one primary category and may appear in overlapping secondary filters.
- The seven filters describe observable visual styles; there is no catch-all “Reference Styles” category.
- The grid always uses a still 8:5 poster. Motion appears only in the detail modal when a practical local source clip exists; otherwise the entry carries motion notes.
- Green, amber, and red dots mean canonical, usable, and limited source quality. Canonical sources support detailed analysis; usable sources support composition, palette, imagery, and broad hierarchy; limited sources are concept and rough-composition cues only.

## Media and provenance

- The 19 active image files are copied byte-for-byte to `public/assets/originals`. Superseded source files are retained in `public/assets/archive` and Git history.
- Current website captures live in `public/assets/site-captures`; accidental browser scrollbar tracks are cropped from the affected captures.
- Uniform 1600×1000 derivatives live in `public/assets/posters` and are generated with a high-quality non-generative bicubic crop.
- `scripts/remove-capture-scrollbars.ps1` contains dimension-guarded crops for the seven captures that originally included browser scrollbars; run it before regenerating posters if those source captures are restored.
- Images 13 and 15 use recovered live captures from Linq and Marble in the UI while retaining their original video frames for provenance.
- Images 12, 14, 16, 17, and 18 use user-approved, source-guided generated reconstructions and are marked `usable`, never `canonical`; their original YouTube frames remain archived.

Regenerate copies and posters after adding source media:

```powershell
& .\scripts\generate-media.ps1
```

## Add a new reference

1. Save the untouched source in the appropriate local asset folder.
2. Add a new seed to `src/references.ts` with one primary category, any secondary filters, 4–8 observable tags, provenance, quality limits, and the design profile fields.
3. Generate the 8:5 poster without overwriting the original.
4. If it is a linked website, capture a stable hero state and add the verified HTTPS URL. Use a separate card for each genuinely distinct moment from the same site, sharing `sourceGroupId`.
5. Run `npm test` and `npm run build`.

New external inspirations or generated substitute images should only be added after explicit approval.
