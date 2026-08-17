# Massage Flow — Reference Context Index

## Current working baseline

For current implementation status and new work, read `HANDOFF_MANIFEST.md`, `CURRENT_STATE.md`, `NEW_CHAT_HANDOFF.md`, and `todo.md` first. The complete current specification package is `Massage_Flow_Spec_Package_v1.10.zip`.

## Detailed reference files

The `REFERENCE_*` files restore the detailed v1.5 source specifications and later approved additions. Use them to understand original development phases, architecture, UI flow, data contracts, tests, decisions, and safety reasoning. When a reference describes an older unfinished state, the current status files take precedence.

| Reference group | Purpose |
|---|---|
| `REFERENCE_01` to `REFERENCE_07` | Product, technical, project overview, UI flow, test plan, engineering standards, and data contracts. |
| `REFERENCE_DECISION_LOG` / `REFERENCE_CHANGELOG` | Historic product decisions and specification evolution. |
| `REFERENCE_SAFETY_RESEARCH` / `REFERENCE_TECHNICAL_RESEARCH` | Background research. |
| `REFERENCE_SPEC_ADDENDUM_v1.6` to `REFERENCE_NAVIGATION_HISTORY_v1.10` | Later implemented persistence, duration editing, body-region, and navigation/history changes. |

## New Chat rule

New Chat should first determine what is currently complete from `CURRENT_STATE.md` and `todo.md`, then consult the matching `REFERENCE_*` documents only for design rationale or detailed implementation context.
