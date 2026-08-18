# Massage Flow — New Chat Handoff

Use the active **Massage Flow** project as the code baseline. Before editing, read `HANDOFF_MANIFEST.md`, `CURRENT_STATE.md`, this file, `todo.md`, `REFERENCE_CONTEXT_INDEX.md`, and relevant `REFERENCE_*.md` files. The latest specification package is `Massage_Flow_Spec_Package_v1.11.zip`; the portable baseline is `Massage_Flow_Prototype_Source_v1.6.zip`.

## Required working rules

1. Keep all user-facing copy in Cantonese Traditional Chinese.
2. Preserve the general-relaxation boundary; do not add diagnosis, treatment, rehabilitation, or medical assessment.
3. Preserve adult confirmation, self versus assisted mode, household-member restrictions, broad-region-first selection, deterministic program generation, controlled preview editing, and preview-gated replay.
4. Keep warm-up, cool-down, total duration, and approved-action limits protected during edits and replay.
5. Shoulder-and-neck flow stays on the back-of-neck and outer-shoulder surface; avoid the front/side of the neck, throat, and centre spine.
6. Forearm-and-palm flow stays on the forearm and palm surface; avoid wrist, finger joints, and prominent bony areas.
7. Upper-hip flow stays on the upper-hip and outer-hip surface; avoid the gluteal cleft, tailbone, groin, and centre pelvis.
8. Add every request or bug to `todo.md` before implementation. Mark it complete immediately after validation.
9. Run `pnpm check`, `pnpm test`, and `pnpm lint` before a checkpoint. Update `CURRENT_STATE.md`, this handoff, and relevant reference materials if rules, data, UI flow, or tests change.

## Recovery rule

Use the active project where available. If it is unavailable, inspect `Massage_Flow_Prototype_Source_v1.6.zip` without executing its code and obtain explicit confirmation before restoring it into a separate Expo project.

## Current next priority

Validate persistence, history deletion, and preview-gated replay on physical iOS and Android devices before adding another broad body region or cloud features.
