# Massage Flow — MVP Visual-Guidance Increment v1.12

## Scope

This increment adds a portrait-first **interactive vector body map** for the currently approved regions: shoulder-and-neck, upper/middle/lower back, upper hip, and forearm-and-palm. It is a shared visual layer for broad-region selection, laterality selection, program preview, demonstration, and countdown.

> This is an MVP visual foundation, not a claim that the prototype now contains a production 3D anatomical model or medical positioning system.

## Shared data rule

Every display uses the existing approved `RegionTarget` or `ProgramSegment` values for `region` and `side`. The visual layer never creates a new body target, modifies an action, or bypasses program generation. Therefore selection, preview, demonstration, and countdown identify the same approved broad surface and side.

| Context | Behaviour |
|---|---|
| Broad-region selection | Tapping a displayed safe surface selects or removes the matching approved broad region. |
| Laterality selection | Tapping the left or right highlighted-safe surface selects that side. The existing **雙側** action remains the only bilateral control. |
| Preview | The map summarizes selected broad surfaces without adding a new editing route. |
| Demonstration and countdown | The active approved segment uses a warm visual emphasis; segment text retains the location and boundary instruction. |

## Safety and reachability

The map only contains the already approved selectable surfaces. It does not make excluded boundaries tappable and does not relax self-guided substitutes, warm-up, cool-down, total-duration, or deterministic safety rules.

## Verification

Four unit tests cover approved back-surface mapping, the dedicated forearm-and-palm surface, bilateral visibility, and one-sided visibility. With the existing program and persistence suites, `pnpm check`, `pnpm test`, and `pnpm lint` pass with **28 active unit tests**.
