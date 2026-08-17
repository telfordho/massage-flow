# Massage Flow — New Chat Handoff

Use the active **Massage Flow** project as the code baseline. Before editing, read `HANDOFF_MANIFEST.md`, `CURRENT_STATE.md`, this file, `todo.md`, and the relevant documents from `Massage_Flow_Spec_Package_v1.10.zip`, including `SPEC_ADDENDUM_v1.6.md`, `DURATION_EDIT_FIX_v1.7.md`, `SHOULDER_NECK_EXPANSION_v1.8.md`, `FOREARM_PALM_EXPANSION_v1.9.md`, and `NAVIGATION_HISTORY_CONTROLS_v1.10.md`. If the active project is unavailable, attach `Massage_Flow_Prototype_Source_v1.5.zip`, inspect it without executing code, and ask for confirmation before restoring it into a separate Expo project.

## Non-negotiable product rules

1. All user-facing copy is Cantonese Traditional Chinese.
2. Users choose broad body areas; the system chooses detailed segments, actions, and timing.
3. Self-guided and assisted use apply different accessibility rules; changing only copy is insufficient.
4. “我” is a fixed self-guided identity, not an editable household member.
5. Preview edits must preserve total duration, warm-up, cool-down, and the approved safety boundary.
6. Preview, demonstration, and countdown share one generated program.
7. The product provides general relaxation guidance only; it does not diagnose, treat, or rehabilitate.
8. Shoulder-and-neck flow stays on the back-of-neck and outer-shoulder surface; it avoids the front of the neck, throat, sides of the neck, and the centre of the spine.
9. Forearm-and-palm flow stays on the forearm and palm surface; it avoids the wrist, finger joints, and prominent bony areas.
10. Preview always provides an explicit return route to the preceding duration setup, while history deletion requires an inline confirmation and removes one entry only.

## Development sequence

1. Record every new feature or defect as an unchecked item in `todo.md`.
2. Read the relevant implementation and specification files before changing behavior.
3. Update deterministic unit tests whenever program, persistence, or repeat-flow rules change.
4. Run `pnpm check`, `pnpm test`, and `pnpm lint` after implementation.
5. Mark completed work in `todo.md`, update the state and handoff materials, create a checkpoint, and list the newest archive names in the delivery note.

## Current recommended slice

Validate the existing AsyncStorage persistence, history, replay, shoulder-and-neck, and forearm-and-palm selection flows on physical iOS and Android devices. Keep replay inside the existing program preview boundary, and do not introduce cloud sync or accounts unless explicitly requested.
