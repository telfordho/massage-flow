# Massage Flow — Mobile Interface Design

## Design intent

Massage Flow is a portrait-first, one-handed iOS-style relaxation-guidance prototype. The interface uses calm, warm neutrals with a muted jade accent so that it reads as a general wellness tool rather than a clinical treatment product. All user-facing copy is written in Cantonese Traditional Chinese. Interactions use large touch targets, concise progress cues, and a single primary action at the lower edge of each screen.

## Colour choices

| Token | Colour | Role |
|---|---|---|
| Background | `#F7F5F0` | Warm off-white background for a calm session flow. |
| Surface | `#FFFFFF` | Cards and sheets. |
| Primary | `#2F7A6D` | Jade green for primary actions, progress, and selected choices. |
| Primary soft | `#DDEFE9` | Selected-card fill and quiet emphasis. |
| Ink | `#24312E` | Primary body text. |
| Muted | `#64706C` | Supporting copy and timestamps. |
| Safety | `#A66546` | Non-alarming wellness boundary and caution notes. |

## Screen list

| Screen | Primary content and functionality |
|---|---|
| 成年人確認 | General-wellness boundary, age confirmation card, and a clear continuation action. |
| 使用方式 | Choice between self-guided massage and guiding a partner or adult family member. |
| 成員選擇／管理 | Partner and adult family-member cards, create/edit/remove actions, without exposing “我” as a managed member. |
| 概括部位 | Multi-select shoulder/upper back, mid-back, and lower back; each selection supports priority and laterality. |
| 感受與目標 | Short inputs for sensation, severity, duration, and relaxation goal. |
| 總時長 | Compact duration choices with a persistent summary of selected areas. |
| 程序預覽 | System-generated segments, total duration, safety rationale, and constrained edits only. |
| 分段示範 | One segment at a time, with concise positioning and pacing guidance. |
| 倒數引導 | Large remaining-time display, pause/replay/skip controls, and clear final-step completion. |
| 完成回饋 | Non-medical subjective feedback and a return to usage-mode choice. |
| 歷史 | Completed-session summaries, member context, duration, feedback, and a one-tap repeat action. |

## Interactive body-map foundation

The first MVP visual-guidance increment uses a portrait-friendly **interactive vector body map** rather than claiming a production 3D anatomical model. The same deterministic `region + side` input drives the selection view, the generated-program preview, the demonstration screen, and the countdown screen. This prevents the visual surface from diverging from the approved program data.

| Context | Interaction and visual feedback |
|---|---|
| Region selection | A calm body-map card shows the currently selected broad regions. Tapping a safe region selects or removes that broad region; selected surfaces use jade and inactive safe surfaces stay neutral. |
| Laterality selection | The active broad region is displayed alone. Tapping the left or right safe surface selects that side; a compact **雙側** control retains the existing bilateral option. |
| Preview | A non-editing visual summary shows all approved selected surfaces and their side state before the user enters the demonstration. |
| Demonstration and countdown | The current `Program Segment` is highlighted in a warm safety accent while the segment name, approved location and instruction remain adjacent to it. The map is informative only and never exposes a new editable body target. |

The first release covers the already approved shoulder-and-neck, upper/middle/lower-back, upper-hip, and forearm-and-palm surfaces. It does not turn a visual map into medical positioning, does not display excluded areas as tappable, and preserves the current approved self-guided substitutes.

## Key user flows

### New guided flow

成年人確認 → 使用方式 → （如幫他人按）成員選擇 → 概括部位與左右側 → 感受與目標 → 總時長 → 程序預覽／受控編輯 → 示範 → 倒數引導 → 完成回饋 → 歷史寫入。

### Repeat a previous flow

歷史 → 選擇已完成摘要 → 「重做同一套流程」 → 程序預覽 → 示範 → 倒數引導 → 完成回饋 → 新摘要寫入歷史。

### Member management

使用方式（幫他人按）→ 成員選擇 → 管理成員 → 新增／改名／刪除 → 回到成員選擇。此流程只處理伴侶與成年家人；「我」固定屬於自己按模式。

## Interaction and layout rules

Each screen is designed for a 9:16 portrait viewport. The primary action is full width, visually anchored near the bottom safe area, and has a minimum 44-point touch target. Choices appear as stacked cards or segmented choices rather than dense menus. Long content scrolls inside safe-area-aware containers; history uses a performant list layout. Press interactions use subtle opacity or 0.97 scale feedback, while completion uses restrained haptic feedback on supported devices.

The history screen is an additive destination: it must not interrupt the existing guided flow. A repeat action reuses the saved, validated program intent and returns to the existing preview boundary; it must never bypass adult confirmation, safety constraints, warm-up, cool-down, or accessibility rules.
