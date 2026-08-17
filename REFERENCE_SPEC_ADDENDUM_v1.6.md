# Massage Flow — Specification Addendum v1.6

**Effective date:** 2026-08-17  
**Applies after:** `Massage_Flow_Spec_Package_v1.5.zip`  
**Implementation baseline:** `massage-flow-restored` Expo / React Native project

## 1. Product scope

This addendum introduces device-local continuity for the existing general relaxation-guidance prototype. It preserves household-member choices, commonly used session settings, completed-session summaries, and optional subjective feedback across app restarts. It also adds an in-app history destination from which the user can safely revisit a prior setup.

The scope remains deliberately local. It does not add sign-in, cloud sync, backup, analytics, medical records, diagnosis, treatment, or rehabilitation features. The app continues to use Cantonese Traditional Chinese for user-facing content and continues to state that it is for general relaxation only.

## 2. User experience and flow change

| Entry point | Behaviour |
|---|---|
| Home | A compact **「歷史」** action opens the local completed-session list. |
| Mode selection | When available, the selected participant’s last areas, duration, and context are restored before the user enters the setup flow. |
| Session completion | The prototype writes a local summary immediately, including a snapshot of selection, context, constrained edits, segment completion, and timestamp. |
| Completion feedback | Selecting **「舒服咗」**、**「差唔多」** or **「更加唔舒服」** updates the corresponding local history entry. |
| History | Each row displays participant context, broad regions, duration, completion count, optional feedback, and a **「重做同一套流程」** action. |
| Repeat flow | The action restores a saved setup and enters the existing program preview. It never auto-starts the countdown or bypasses the preview/edit safety boundary. |

## 3. Local data contract

The app stores one JSON envelope under the versioned key `massage-flow.local-data.v1`. It is validated on read and falls back to a safe default if the device value is missing, malformed, or inaccessible.

| Field | Purpose | Rules |
|---|---|---|
| `version` | Local envelope version | Current value is `1`. |
| `members` | Fixed self identity plus adult helper members | `self` is always restored and remains non-manageable. |
| `preferencesByMember` | Last target list, duration, and context per member | Preferences are copied on write; current constrained edits are intentionally not auto-applied. |
| `history` | Most-recent-first completed-session snapshots | Retains at most 30 entries. |
| `history[].id` | Client-generated session identifier | UUID v4 format. |
| `history[].completedAt` | Completion timestamp | ISO 8601 UTC string. |
| `history[].targets` | Priority-ordered broad-region targets | Preserves region and side. |
| `history[].editIntent` | Constrained preview edit snapshot | Replayed only through the current deterministic program engine. |
| `history[].outcome` | Optional subjective feedback | One of `舒服咗`、`差唔多`、`更加唔舒服`, or `null`. |

Only a value accepted by the local normalizer reaches app state. An unavailable storage service does not block the guided session; the flow remains usable for the current visit without persistence.

## 4. Invariants and safety boundaries

The current deterministic program engine remains the source of truth. A historical snapshot provides setup intent only; replay regenerates the program through the same rules that govern a new session. The product must therefore continue to preserve the following invariants.

| Invariant | Requirement |
|---|---|
| Mode-aware reachability | Self-guided and assisted sessions retain their distinct approved action sets. |
| Broad-to-detailed selection | Users save broad targets; the system generates detailed segments. |
| Program consistency | Preview, demonstration, and countdown use one regenerated program result. |
| Controlled editing | Warm-up, cool-down, total duration, and approved-action limits cannot be bypassed through history replay. |
| Participant boundary | “我” remains fixed for self-guided mode and is excluded from helper-member management. |
| Wellness boundary | Stored feedback does not change the app into a diagnostic or treatment tool. |

## 5. Implementation and test plan

The implementation uses `@react-native-async-storage/async-storage`, already present in the Expo project dependencies. The local model is isolated in `lib/prototype-history.ts`; native key-value access is isolated in `lib/prototype-storage.ts`; the existing home-flow screen integrates lifecycle loading, saving, completion capture, and history replay.

| Test area | Verification |
|---|---|
| Default state | The normalizer restores `self`, partner, and family defaults when no valid data exists. |
| Imported local state | A persisted helper member is retained while the immutable self identity is restored. |
| History retention | The latest entry is prepended and retained history is capped at 30 entries. |
| Data isolation | Mutating a returned history target does not mutate the original entry snapshot. |
| Feedback update | Only the selected history entry receives the user’s subjective outcome. |
| Identifier format | Local history IDs satisfy UUID v4 structure. |
| Existing safety rules | The deterministic program test suite continues to validate region, reachability, timing, controlled edits, and playback behaviour. |

Release gate: `pnpm check`, `pnpm test`, and `pnpm lint` must pass before handoff. The current codebase passes type checking, 15 active unit tests, and linting; one pre-existing Node module-type performance warning remains non-blocking.

## 6. Decision and changelog entries

> **Decision:** Complete-session history is device-local and capped at 30 newest summaries. A replay always returns to Preview instead of resuming or starting a timer automatically.

> **Decision:** Participant-level saved preferences restore targets, duration, and session context only. The user always reviews generated segments before the next guided session.

### v1.6 — 2026-08-17

The restored Expo prototype adds validated AsyncStorage persistence for household members, preferences, completed summaries, and feedback. It adds a history screen and a safety-preserving repeat-flow action. It also adds UUID v4 local session IDs and five new local-history tests. A custom Massage Flow launcher icon has been prepared for a future approved release but is not included in the current review build.

## 7. Next recommended slice

The next enhancement should expand broad body-region coverage only after the local-history flow has been validated on physical iOS and Android devices. Cloud sync, account access, and remote backup remain out of scope until explicitly requested.
