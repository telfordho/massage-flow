# Massage Flow — Current State

## Implemented baseline

The app now supports general-relaxation programs for **肩頸外側、膊頭／上背、中背、下背、前臂與手掌**, in both self-guided and assisted modes. Every supported region follows its own approved surface boundary and accessibility rules.

The full user journey is available: adult confirmation, mode and member selection, broad-region priority/laterality, context, duration, deterministic Preview, controlled edits, demonstration, countdown, subjective feedback, local history, preview-gated replay, and confirmed single-entry history deletion.

## Data and interaction status

Local AsyncStorage retains members, settings, up to 30 completed summaries, feedback, and history deletion results. The History entry is prominent on Home and completion. Preview has a return-to-duration action. Demonstration and countdown use vertical scrolling and bottom safe-area spacing.

## Verification

`pnpm check`, `pnpm test`, and `pnpm lint` pass. The current suite has **22 active tests**: 16 deterministic program-rule tests and 6 local-history tests. Lint emits one existing Node module-type performance warning but no lint errors.

## Outstanding validation

Validate persistence, history, preview-gated replay, all supported regions, and single-entry deletion on physical iOS and Android devices after a full app restart. The custom launcher-branding concept remains deferred pending user approval.

