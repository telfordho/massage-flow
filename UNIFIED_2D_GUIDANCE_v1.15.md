# Massage Flow — Unified 2D Guidance v1.15

## Approved direction

The product uses one detailed, portrait-first **2D full-body back-view map** for broad-region selection, laterality selection, program preview, step demonstration, and countdown guidance. The map has a fine anatomical outline, centre-spine guide, transparent touch targets, and approved region highlights driven only by existing `region + side` program data.

> The previous Three.js mannequin is no longer shown in the active product flow. It remains project history only and does not define the current UX direction.

## Behaviour

| Context | 2D map behaviour |
|---|---|
| Broad-region selection | The user taps an approved safe region on the detailed back-body outline. |
| Laterality | The left or right region is highlighted according to the approved target; **雙側** highlights both. |
| Preview | The generated program displays the same selected regions without adding new editing routes. |
| Demonstration and countdown | The current approved segment is highlighted in warm emphasis colour; textual location and boundary instructions remain authoritative. |

## Boundaries

The visual map does not create selectable excluded surfaces or change self-guided substitutes, warm-up, cool-down, total duration, or deterministic safety rules. Shoulder-and-neck, forearm-and-palm, back, and upper-hip boundaries remain unchanged.

## Verification

`pnpm check`, `pnpm test`, and `pnpm lint` pass with 31 active unit tests. The detailed-map selected-label card proposed in an earlier draft is intentionally not included.
