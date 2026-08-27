# Tutorial Video Prompts

Source: [Turn Claude Into A Design GENIUS In 3 Simple Steps](https://www.youtube.com/watch?v=7FU98O0JLHs)

The first prompt below is preserved from the prompt shown on screen. The later prompts are transcript-faithful versions of the spoken or typed instructions with capitalization and punctuation cleaned for readability; they are not presented as character-for-character transcripts.

## 1. Initial Direction Generation

```text
Build a landing page for "Kestrel" — an AI analytics platform for small startups.

Conversion goal: book a demo. Primary CTA on every version is "Book a demo"; it must appear in the hero and repeat at the end of the page.

Intent: a small team's unfair advantage. Should feel serious, crafted intelligence — calm and confident, not loud SaaS hype. A founder should think "these people actually understand data" within 3 seconds.

Guardrails — always: one monumental image anchors the page; imagery is processed, never raw (halftone, dither, grain, ASCII, linework); technical marginalia (coordinates, IDs, ruler ticks, timestamps); type at extremes — monumental display or tiny mono labels, little middle; near-monochrome ground with a single warm accent.

Never: purple gradients, glossy 3D SaaS blobs, untextured stock photography, rounded-everything friendliness, icon-grid feature rows, Inter/system-font-only typography, evenly distributed colorful palettes.

Create 5 versions of this page, each in its own folder (v1/ ... v5/), one per direction below. Same intent and guardrails for all five. Do NOT blend directions — each version commits fully to its own aesthetic.

IMPORTANT — hero images come later. Do NOT generate or source any imagery.

For each version, reserve the hero slot exactly where the placement note says (<img> or background with the correct aspect and position) and fill it with a flat CSS stand-in that matches the direction's palette. Size all typography and negative space as if the described image were already there, so the real image drops in with zero layout changes.

--- DIRECTION 1 (v1) — Print-Tech Paper ---

Aesthetic: print-tech x data — pale sage ground, topographic line illustration, mono data callouts, transaction-ID chips, film-strip ticks, grotesk display.

Reference: C:\Users\Chase\projects\taste-vault\images\spade.png — read it before designing; match feel, not content.

Future hero: a topographic contour-line illustration in dark-green ink on sage paper.

Placement: isolated illustration center-right on a pale sage page, surrounded by mono data-callout chips; page ground matches the paper color so it floats in the layout.

--- DIRECTION 2 (v2) — Data-as-Texture ---

Aesthetic: cinematic data-texture — clouds rendered from amber binary characters, dark teal sky, data-as-material, golden accent CTAs, mono labels.

Reference: C:\Users\Chase\projects\taste-vault\images\climora.png — read it before designing; match feel, not content.

Future hero: golden-hour clouds built from amber binary digits on a dark teal sky.

Placement: full-bleed dark sky; headline left on the darkest area; data-clouds fill the lower right.

--- DIRECTION 3 (v3) — Vast Quiet Cinematic ---

Aesthetic: editorial minimalism x cinematic — vast B&W mountain photography, mist atmosphere, tiny centered sans, extreme whitespace, quiet CTA.

Reference: C:\Users\Chase\projects\taste-vault\images\ctgt-hero.png — read it before designing; match feel, not content.

Future hero: vast desaturated aerial mountain ridge, upper half pure fog-white sky.

Placement: full-bleed; fog-white upper half is the headline zone with tiny centered type; ridge fills the lower half.

--- DIRECTION 4 (v4) — Dither Mono ---

Aesthetic: brutalist-editorial B&W — heavy bitmap dither, stark studio dark, giant cropped footer wordmark, clean sans body, high contrast.

Reference: C:\Users\Chase\projects\taste-vault\images\monolith.png — read it before designing; match feel, not content.

Future hero: monumental dithered B&W subject emerging from darkness, right side lit, left dissolving to black.

Placement: right-half hero against black; left half stays near-black as the headline column; giant KESTREL wordmark overlaps the bottom edge.

--- DIRECTION 5 (v5) — Classical Remix ---

Aesthetic: classical x white editorial — grainy classical figure illustration, serif italic emphasis word, white ground with thin orbit lines, blue pill CTA, trust logo row.

Reference: C:\Users\Chase\projects\taste-vault\images\dualite.png — read it before designing; match feel, not content.

Future hero: grainy vintage illustration of a classical robed scholar studying charts, isolated on white.

Placement: right-half figure on white; faint orbit lines continue behind the left text column; logo row runs below.
```

## 2. Selected-Aesthetic Variants

```text
Let's go with the Vast Quiet version. Generate three different versions of that aesthetic for me, namely changing the body formats, etc.
```

## 3. Hero Image Generation

```text
Let's go with v3b, the ledger version. I want to nail the hero image now. You have three or four examples of hero images in the inspiration library that are part of the quiet aesthetic. Give me four images that would fit this design and our hero image's specific composition. Use the Higgsfield MCP, make them high quality and 2K, create four distinct designs, and pull them up when finished.
```

## 4. Dev-Server Tweak Bar

```text
Can we mimic what happens inside Claude Design and add a tweak bar that pops up on the dev server so I can change a number of things — font size, font type, accent colors, and basically anywhere you think there is a decision to be made in the overall aesthetic and design?

Focus especially on the body because I already like the hero. I want the ability to tweak those decisions on the tweaks page, so go fairly aggressive with what you offer me.
```
