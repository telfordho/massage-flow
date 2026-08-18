# Massage Flow — Current State

| Field | Current value |
|---|---|
| Updated | 2026-08-18 |
| Runnable code baseline | Isolated **massage-flow-restored** Expo / React Native project |
| Source restored from | `Massage_Flow_Prototype_Source_v1.0.zip` |
| Latest specification package | `Massage_Flow_Spec_Package_v1.11.zip` |
| Latest handoff package | `Massage_Flow_Handoff_Package_v1.9.zip` |
| Product language | Cantonese Traditional Chinese for all user-facing content |
| Current milestone | Source restoration, local persistence/history, safe replay, shoulder-and-neck, forearm-and-palm, and upper-hip expansions are complete |

> This project is a general relaxation-guidance prototype. It does not diagnose, treat, rehabilitate, or provide medical advice.

## Existing guided flow

The restored flow covers adult confirmation, self-guided or assisted-use choice, adult household-member selection, broad back-area selection, area priority, laterality, sensation and goal inputs, duration choice, deterministic program generation, constrained preview edits, segment demonstration, guided countdown, and subjective completion feedback.

| Rule | Current product boundary |
|---|---|
| Area selection | Users choose broad areas first; the system chooses the detailed segments and timing. |
| Self-guided mode | Uses “我” automatically and restricts inaccessible actions or substitutes an approved alternative. |
| Assisted mode | Lets the user select a partner or adult family member; “我” is never managed as a household member. |
| Preview edits | Users may adjust priority, eligible segment duration, and approved gentle alternatives only. Warm-up, cool-down, total duration, and safety rules remain protected. |
| Consistency | Preview, demonstration, and countdown must use the same generated program. |

## Completed local continuity slice

The prototype now validates and saves its local data with AsyncStorage. It retains adult household members, per-member targets/duration/context preferences, completed-session snapshots, and subjective feedback. History retains the newest 30 completed entries, and each entry has a UUID v4-formatted local identifier plus an ISO 8601 completion timestamp.

The Home screen now exposes **「歷史」**. A user can review locally saved summaries and choose **「重做同一套流程」**; the saved input returns to the existing Preview screen and regenerates the program through the current deterministic safety rules. It does not auto-start the session or bypass the preview/edit boundary.

The Preview editor now uses a fixed-order time-transfer rule for main segments. Pressing plus or minus changes the tapped segment directly and compensates with the next eligible displayed main segment; later segments are used only when the immediate next segment reaches its 30–180 second limit. The total session duration, warm-up, cool-down, and approved-action boundaries remain protected.

## Shoulder-and-neck expansion

**肩頸外側** is now available alongside upper, middle, and lower back. The app visualizes the selected shoulder-and-neck surface, carries the selection through preview, guidance, local history, and replay, and applies the existing deterministic duration rules.

The shoulder-and-neck flow is strictly limited to the surface of the back of the neck and the outer shoulder. It excludes the front of the neck, throat, sides of the neck, and the centre of the spine. Self-guided mode replaces the harder-to-control portion with an approved outer-shoulder substitute. See `SHOULDER_NECK_EXPANSION_v1.8.md` for the full boundary.

## Forearm-and-palm expansion

**前臂與手掌** is now available as a separate broad region with its own visual map. It supports left, right, and both sides throughout selection, preview, demonstration, countdown, local history, and replay.

The flow stays on the forearm and palm surface, avoiding the wrist, finger joints, and prominent bony areas. Self-guided steps remain directly reachable using the opposite hand. See `FOREARM_PALM_EXPANSION_v1.9.md` for the full boundary.

## Navigation and local-history controls

Program Preview now includes **「返回時長」**, so the user can revise duration without abandoning the setup. Every local history card now supports a guarded, single-entry deletion: the first tap opens an inline confirmation; only an explicit second confirmation removes that entry and triggers the existing local persistence save.

## Upper-hip expansion

**臀髖上緣** is now a selectable broad region with left, right, and both-side support. It uses the existing preview, guidance, local-history, and replay paths.

The flow remains on the upper-hip and outer-hip surface only. It explicitly avoids the gluteal cleft, tailbone, groin, and centre of the pelvis. In self-guided mode, the first step is over clothing and the harder-to-control range is replaced by an approved outer-hip substitute. See `UPPER_HIP_EXPANSION_v1.11.md` for the full boundary.

## Verification result

`pnpm check`, `pnpm test`, and `pnpm lint` pass. The active test suite contains 24 passing tests: 18 deterministic program-rule tests, including shoulder-and-neck, forearm-and-palm, and upper-hip boundary coverage plus duration-adjustment regressions, and 6 persistence/history tests. One existing Node module-type performance warning appears during linting but does not produce a lint error. The custom launcher icon is intentionally deferred pending user review; the current review build uses lightweight default image assets.

## Next recommended slice

Validate the newly restored local-history experience on physical iOS and Android devices before expanding to new broad body regions. Cloud sync, accounts, backups, and medical features remain out of scope unless explicitly requested.
