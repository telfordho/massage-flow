# Massage Flow — Consolidated Product Specification

## 1. Product boundary

Massage Flow is a portrait-first, Cantonese Traditional Chinese prototype for **general relaxation guidance** for adults. It does not diagnose, treat, rehabilitate, assess symptoms, or replace professional advice. Users can follow a self-guided flow or guide an adult partner/family member. If a user feels unwell, the flow instructs them to stop.

## 2. Supported broad regions and safety boundaries

Users choose broad regions and side; the deterministic engine chooses detailed segments and timing. Every program preserves warm-up, main segments, cool-down, total duration, and the approved boundary.

| Broad region | General-relaxation boundary | Self-guided rule |
|---|---|---|
| 肩頸外側 | Back of neck and outer shoulder surface only; avoid front of neck, throat, sides of neck, and centre of spine. | A harder-to-control neck portion is replaced with an outer-shoulder substitute. |
| 膊頭／上背 | Outer shoulder, shoulder-blade area, and approved upper-back surface. | Central upper-back access uses an approved substitute. |
| 中背 | Approved middle-back surface, avoiding the spinal centre. | Central access uses a side-back substitute. |
| 下背 | Outer lower-back surface, avoiding the spinal centre. | Uses a controlled outer-waist substitute. |
| 前臂與手掌 | Forearm and palm surface only; avoid wrist, finger joints, and prominent bony areas. | Both main actions remain directly reachable with the opposite hand. |

## 3. Primary flow

成年人確認 → 使用方式 → 選擇對象（如幫他人按）→ 概括部位與左右側 → 感受與目標 → 時長 → 程序預覽 → 可選受控調整／示範 → 倒數引導 → 完成回饋 → 歷史。

The Preview screen is a mandatory boundary before countdown. It provides **返回時長**, controlled program adjustment, full demonstration, and start guidance. History replay restores saved setup intent but returns to Preview; it never starts countdown automatically.

## 4. Deterministic program rules

| Rule | Requirement |
|---|---|
| One source of truth | Preview, demonstration, and countdown derive from one generated program. |
| Priority | Earlier selected regions receive more main-segment time. |
| Editing | Main duration changes by 30 seconds, directly changes the tapped segment, and compensates in fixed display order with the next eligible segment. |
| Guardrails | Warm-up, cool-down, total duration, approved actions, and minimum/maximum main durations remain protected. |
| Reachability | Self-guided and assisted programs have distinct approved steps; copy alone is never used as a substitute for program rules. |

## 5. Local data and history

The app uses AsyncStorage only. It retains adult household members, per-member region/duration/context preferences, up to 30 completed session summaries, and optional subjective feedback. Each local session has a UUID v4 identifier and ISO 8601 completion timestamp.

History entries can be replayed through Preview or deleted individually. Deletion uses an inline confirmation and removes exactly one entry; normal local persistence saves the resulting list automatically.

## 6. Interface rules

The interface is designed for 9:16 portrait usage. Primary actions have at least a 44-point touch target. Demonstration and countdown content scroll vertically with dynamic bottom safe-area space. History has prominent entry points on Home and the completion screen. Body maps switch to an arm illustration for the forearm-and-palm region.

## 7. Validation contract

Run `pnpm check`, `pnpm test`, and `pnpm lint` after every behaviour change. Current regression coverage validates program determinism, safety boundaries, reachability, duration editing, playback, local-history immutability, outcomes, and single-entry deletion.
