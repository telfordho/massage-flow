# Massage Flow — Current State

| Field | Current value |
|---|---|
| Updated | 2026-08-18 |
| Runnable code baseline | Isolated **massage-flow-restored** Expo / React Native project |
| Source restored from | `Massage_Flow_Prototype_Source_v1.0.zip` |
| Latest specification package | `Massage_Flow_Spec_Package_v1.15.zip` |
| Latest handoff package | `Massage_Flow_Handoff_Package_v2.3.zip` |
| Product language | Cantonese Traditional Chinese for all user-facing content |
| Current milestone | Detailed full-body 2D map is the approved visual guidance system across the active flow |

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

## Interactive visual-guidance foundation

The prototype now uses one portrait-first interactive vector body-map component across broad-region selection, laterality selection, preview, demonstration, and countdown. Tapping a displayed safe surface selects the corresponding approved broad region or left/right side; **雙側** remains an explicit existing control. The preview is a read-only visual summary, while demonstration and countdown use a warm highlight for the current approved `Program Segment`.

The visual layer reads the same `region + side` data that program generation already approves. It does not create new body targets, turn excluded boundaries into tappable regions, or change self-guided substitutes. See `MVP_VISUAL_GUIDANCE_v1.12.md` for the implementation contract and scope.

## Unified 2D visual guidance

The approved visual system is now one detailed, portrait-first **full-body back-view 2D map** across broad-region selection, laterality, preview, demonstration, and countdown. It uses a fine anatomical outline, centre-spine guide, and selected regions that remain within the approved body boundary. Selection is directly tappable; preview is read-only; demonstration and countdown use warm emphasis for the active approved segment.

The map reads the same approved `region + side` data that program generation uses. It does not create new targets, turn excluded surfaces into selectable regions, or change self-guided substitutes. The formerly active 3D mannequin is no longer displayed in the product flow. See `UNIFIED_2D_GUIDANCE_v1.15.md` for the current visual contract.

## Verification result

`pnpm check`, `pnpm test`, and `pnpm lint` pass. The active test suite contains 31 passing tests: 18 deterministic program-rule tests, 6 persistence/history tests, 4 interactive body-map mapping tests, and 3 historical 3D view/side mapping tests. One existing Node module-type performance warning appears during linting but does not produce a lint error. The custom launcher icon is intentionally deferred pending user review; the current review build uses lightweight default image assets.

## Next recommended slice

Validate the detailed 2D map for each region, side, preview, demonstration, and countdown on physical iOS and Android devices. Once accepted, the next MVP capability is Cantonese segment audio, followed by offline content handling; cloud sync, accounts, backups, and medical features remain out of scope unless explicitly requested.
