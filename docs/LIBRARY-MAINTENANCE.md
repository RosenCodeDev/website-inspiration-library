# Library and Workflow Maintenance

This is the human maintenance manual for future engineers and AI agents.

## What must stay synchronized

Every card has four connected layers:

1. **Identity and evidence:** order, category, source, quality, and media.
2. **Authored design content:** descriptor, description, scope, inventory, tags, recipe, brief, and motion evidence.
3. **Workflow intelligence:** moment type, design roles, page uses, anchor/support strength, best use, caution, and clone eligibility.
4. **Review acknowledgement:** a fingerprint proving that a person or agent intentionally reviewed the combined record after it changed.

The portal displays the first two layers. Design Taste Injection reads all four. Workflow intelligence is intentionally backend-only.

## Add or change a card

1. Inspect the visual at full size and any motion at normal speed.
2. Update `src/references.ts` and `src/reference-content.ts` using the existing concise style.
3. Add or revise the card in `src/workflow-intelligence.ts`.
4. Review its primary category constitution. If the category’s practical meaning changed, revise that constitution rather than adding an unexamined exception.
5. Review `designSystem` and `sourceGroupId`. Related moments share a system but keep distinct purposes.
6. Run:

   ```powershell
   npm run catalog:workflow
   npm test
   npm run build
   ```

7. A fingerprint failure is expected after a meaningful change. Inspect the exported record, then update that card’s value in `tests/workflow-fingerprints.json`. If a constitution changed, update only its value in `tests/category-fingerprints.json`. Do not refresh unrelated fingerprints.

## Workflow intelligence choices

- `momentType` describes the captured page or section, not its mood.
- `roles` state what the reference can teach another design.
- `pageUses` state where that teaching transfers.
- `anchorStrength` measures fitness as the main composition/hierarchy reference.
- `supportingStrength` measures fitness for a focused secondary role.
- `bestFor` is a concise positive use case.
- `cautions` prevents overreach or identity copying.
- `cloneStrategy` is derived: only a verified live URL is eligible. Eligibility never means automatic approval.

## Concise writing checks

- Describe visible relationships before mood.
- Use one concrete idea per sentence.
- Avoid marketing filler, invented intent, and unsupported measurements.
- State motion trigger, moving and fixed layers, sequence, pacing, endpoint, and reduced-motion recommendation in their proper fields.
- Treat generated reconstructions as design direction, never proof of exact copy, typography, labels, or product behavior.

## Skill changes

Validate the skill after any change:

```powershell
python C:\Users\hrose\.codex\skills\.system\skill-creator\scripts\quick_validate.py skills\design-taste-injection
npm test
```

Test setup in an isolated Codex home before replacing the global installation. Rerun `npm run setup:codex` only after validation.
