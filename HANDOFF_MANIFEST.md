# Massage Flow — Handoff Manifest

| Field | Current value |
|---|---|
| Manifest version | `v1.8` |
| Updated | 2026-08-18 |
| Runnable baseline | `massage-flow-restored` Expo project |
| Portable source baseline | `Massage_Flow_Prototype_Source_v1.8.zip` |
| Latest specification package | `Massage_Flow_Spec_Package_v1.13.zip` (includes v1.5 base package and later addenda) |
| Specification addendum | `SPEC_ADDENDUM_v1.6.md`, `DURATION_EDIT_FIX_v1.7.md`, `SHOULDER_NECK_EXPANSION_v1.8.md`, `FOREARM_PALM_EXPANSION_v1.9.md`, `NAVIGATION_HISTORY_CONTROLS_v1.10.md`, `UPPER_HIP_EXPANSION_v1.11.md`, `MVP_VISUAL_GUIDANCE_v1.12.md`, and `THREE_D_RENDERING_DECISION_v1.13.md` |
| Handoff package | `Massage_Flow_Handoff_Package_v2.1.zip` |
| Portable source package | `Massage_Flow_Prototype_Source_v1.8.zip` |
| State document | `CURRENT_STATE.md` |
| New-chat instruction | `NEW_CHAT_HANDOFF.md` |

## Recovery rule

The active `massage-flow-restored` project is the preferred editing baseline. If it is unavailable, attach `Massage_Flow_Prototype_Source_v1.8.zip`, inspect its contents, compare this manifest and the companion packages, and obtain explicit confirmation before restoring it into a separate runnable Expo project. Never overwrite an unrelated project, reuse project-specific configuration, or rely on a historical checkpoint URI.

## Required pre-edit checks

1. Confirm that this manifest, `CURRENT_STATE.md`, `NEW_CHAT_HANDOFF.md`, `Massage_Flow_Prototype_Source_v1.8.zip`, `Massage_Flow_Spec_Package_v1.13.zip`, and `Massage_Flow_Handoff_Package_v2.1.zip` are available.
2. Confirm the active Expo project and its root `todo.md` are readable.
3. Add the new feature or bug to `todo.md` before implementation.
4. Read the relevant product and technical specifications before changing product rules, data structures, or user-facing flows.

## Release checklist

Every completed change must update `todo.md` and `CURRENT_STATE.md`, validate the project with `pnpm check`, `pnpm test`, and `pnpm lint`, and create a checkpoint. When a change alters product rules, data structures, UI flow, or tests, update the related specifications and rebuild the portable source and handoff packages before sharing them. The current native 3D rendering decision is documented in `THREE_D_RENDERING_DECISION_v1.13.md`.
