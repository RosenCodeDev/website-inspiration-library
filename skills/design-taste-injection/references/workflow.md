# Workflow

Keep one continuous task. Save state after every accepted, revised, replaced, pinned, or rejected decision. Never advance from a consequential choice without explicit approval. Resolve every script path from the installed skill root, not the website project.

## 0. Understand the project

1. Inspect the existing project, if any.
2. Collect Introduction, Intent, Audience, and optional Materials and Requirements.
3. Read supplied files. Summarize confirmed content, required functions, brand constraints, and assumptions.
4. Propose pages, sections, content ownership, and the primary user path.
5. Checkpoint. Revise until approved.

Apply accepted changes with `node <installed-skill-root>/scripts/project-state.mjs apply-event <project-root> <event.json>`. Do not edit state JSON by hand.

## 1. Show the full aesthetic range

Read the live catalog with `node <installed-skill-root>/scripts/library.mjs catalog`. Create one `D01...DNN` direction for every populated category, in catalog order.

For initial selection requests, set `fitMode` to `exploratory`. Each direction contains:

- Category and one-sentence thesis.
- One anchor and no more than two role-specific supports.
- Page-fit label: `exact`, `adjacent`, or `aesthetic-only`.
- Why the set fits, what transfers, and what does not.
- A polished code-built `H0` hero aligned with the category constitution.
- Real navigation and one opening body module based on the approved architecture.

These are focused previews, not complete websites. Add all directions to the single workbench. Checkpoint.

Each direction generation record must include this validated scope:

```json
{
  "previewScope": {
    "kind": "focused-category-preview",
    "pageCount": 1,
    "sections": ["hero", "opening-module"],
    "completeSite": false
  }
}
```

Do not build pricing, footer, secondary pages, or the remaining approved architecture during this pass. The state script rejects broader direction records.

## 2. Select references without surrendering control

Use this decision rubric:

- Project, intent, and audience fit: 30%.
- Page or section fit: 20%.
- Requested role fit: 20%.
- Complementarity: 15%.
- Source quality: 10%.
- Usage diversity: 5%.

Run `node <installed-skill-root>/scripts/reference-selection.mjs propose-and-save <project-root> <request.json>`. Supply `fitById` from evidence-based visual judgment. The script validates and atomically stores the active session, cumulative project usage, exclusions, pins, and accepted sets. For later choices, run `action-and-save <project-root> <action.json>`. Never copy session JSON into project state by hand.

Use `groupPolicy: "diverse"` by default, allowing at most one card from a shared system in a set. Use `system-depth` only when multiple moments from that system have different declared jobs. A user pin can override the default.

Reference actions remain at review:

- `ACCEPT ALL`: accept the current set.
- `SWAP`: replace one current slot and preserve its role.
- `SHOW ANOTHER SET`: prefer an unseen valid set; disclose when reuse begins.
- `PIN THIS CARD`: lock it, then retain or refresh unpinned slots.
- `DO NOT USE THIS CARD`: exclude it and propose a nonduplicate replacement.

Prefer canonical evidence when fit is comparable. Inspect each card's image, authored fields, workflow intelligence, group context, and motion evidence.

After category approval, set `fitMode` to `implementation`. The anchor must use the category as primary, list the requested `pageUse` in `anchorUses`, and have usable or canonical evidence. If none exists, disclose the fallback and obtain permission before rerunning with `allowFallback: true`.

## 3. Develop the chosen direction

Create three compositionally distinct variants: `Dxx-A`, `Dxx-B`, and `Dxx-C`. Keep the approved constitution and references; change hierarchy, density, navigation, body format, or module progression. Do not present palette swaps. Checkpoint and preserve every variant.

## 4. Choose the build path

Offer eligible paths together:

- **Original (`O`)**: build from the constitution and reference roles without copying a page.
- **Clone remix (`R`)**: only for an approved `verified-clone-remix` card. Measure and verify the live page before removing identity and applying the brief.
- **Inspired rebuild**: transfer observed structure without claiming a verified clone when the card says `inspired-rebuild`.

The user chooses. Never clone merely because a URL exists.

## 5. Resolve the hero

Keep the selected code-built hero as `...-H0`. Ask whether image alternatives are wanted.

- If no, refine H0.
- If yes, preserve H0 and create `H1...H4` from approved composition, palette, role, and evidence.
- Use Codex image generation by default. Offer Higgsfield only when installed and selected.
- Present H0 and all alternatives together.

Integrate the chosen hero with correct reading order, responsive behavior, contrast, and reduced motion.

## 6. Implement and tune

Build the approved site. Add only useful development controls for type, accent, spacing, density, surfaces, and meaningful motion. Save accepted values to source and remove controls from production. Checkpoint after the integrated page.

## 7. Polish inside this workflow

Run the Impeccable route in `polish.md`. Keep changes that improve clarity, hierarchy, accessibility, responsiveness, or deliberate character without erasing the chosen direction. Show material visual changes for approval.

## 8. Finish

Verify responsive widths, keyboard flow, focus, contrast, reduced motion, loading, media fallback, and production build. Record successful verification before setting state to `complete`; schema v5 rejects completion without a selected final generation and passed verification. Report final lineage, references and roles, build path, hero provider, adaptations, evidence limits, tests, and remaining constraints.
