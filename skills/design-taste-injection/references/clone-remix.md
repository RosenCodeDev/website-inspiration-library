# Clone Remix Route

Use only after the user approves a `verified-clone-remix` card and chooses Clone Remix. This route supports curated, measurable public references with human approval; it does not guarantee reconstruction of arbitrary websites. For `inspired-rebuild`, transfer structure without claiming a verified clone. For `reference-only`, remain on Original.

The installed skill contains the pinned, attributed Site Clone pipeline under `<installed-skill-root>/vendor/site-clone`. Read its coordinator, DOM, GPU, compositing, and QA guidance only for this route. The upstream Phase 3 wording is duplicated; treat it as one reconstruction phase, then continue to compositing and verification. Do not edit pinned vendor files.

Ordinary DOM, CSS, Canvas2D, WebGL, and remix work needs no separate Site Clone installation. Advanced WebGPU inspection may require the WebGPU Inspector browser extension. Disclose that prerequisite only when probes identify WebGPU. Higgsfield is unrelated and optional.

## Guardrails

- Clone only for measured learning and identity-safe adaptation.
- Stop on login, checkout, wallet, banking, identity, or impersonation-sensitive pages.
- Do not ship source logos, copy, people, product imagery, analytics, endpoints, tracking, or licensed fonts.
- If access or rendering prevents reliable measurement, offer Original or Inspired Rebuild.
- Label evidence `CONFIRMED`, `OBSERVED`, or `INFERRED`; label GPU replay `SOURCE`, `PARTIAL`, or `APPROXIMATE`.

## Evidence location

```text
.inspiration/clone/<generation-id>/
  preflight.json
  TEARDOWN.md
  ROUTING.md
  surface-map.json
  motion.json
  tokens-1440.json
  tokens-768.json
  tokens-390.json
  captures/
  effects/
  qa/
.inspiration/previews/<generation-id>/index.html
```

Keep evidence in the target project. Integrate an approved result into normal source only after verification and user approval.

## Process

1. **Preflight:** validate URL, public access, clone eligibility, safe purpose, target project, and Chrome, Edge, or Chromium. Honor `DESIGN_TASTE_BROWSER_PATH` for a nonstandard browser location.
2. **Prepare:** load fonts, media, lazy sections, and interactions; exclude browser chrome and scrollbars.
3. **Probe:** build the injectable probes with `node <installed-skill-root>/scripts/build-probe-bundle.mjs <project-evidence-path>/probes.bundle.js`, then run the surface, motion, and token probes. Classify DOM/CSS, video, animated SVG, Canvas2D, WebGL, and WebGPU. Save raw JSON.
4. **Sweep:** inspect scroll, hover, click, tabs, and accordions. Write evidence-labeled teardown and routing.
5. **Build:** use the lightest compatible substrate. Route DOM to measured reconstruction and GPU surfaces to evidence-gated replay or an honest approximation.
6. **Composite:** preserve size, DPR, z-index, pointer behavior, cleanup, and reduced motion.
7. **Verify:** compare original and local output at exactly 1440, 768, and 390 pixels.
8. **Identity scrub:** replace brand, copy, people, product assets, analytics, endpoints, and licensed fonts.
9. **Remix:** apply the approved brief, architecture, constitution, roles, and project assets. Keep `R` lineage.
10. **Checkpoint:** report QA, GPU fidelity, gaps, and debt. Obtain approval before integration.

Start with:

```text
node <installed-skill-root>/scripts/clone-runtime.mjs preflight <project-root> <card-id> <generation-id>
```

Then create a schema-version-2 QA manifest inside the evidence folder. It must match the generation and contain exactly one original/clone pair for 1440, 768, and 390. Every mask needs geometry and a reason; combined coverage cannot exceed 25%. Automatic thresholds cannot exceed 0.05. Larger permitted thresholds are inconclusive and require manual review.

Verify with:

```text
node <installed-skill-root>/scripts/clone-runtime.mjs verify <project-root> <generation-id> <qa-manifest.json>
```

The report calculates differences from unmasked pixels only and records mask coverage, compared pixels, threshold, status, and reason.
