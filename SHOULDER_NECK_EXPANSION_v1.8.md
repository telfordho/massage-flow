# Massage Flow — Shoulder-and-Neck Expansion v1.8

## Scope

This expansion adds **肩頸外側** as a broad selectable region for the existing general-relaxation prototype. It participates in the same selection, laterality, priority, duration, preview, demonstration, countdown, local-history, and replay flows as the existing back regions.

## General-relaxation safety boundary

> The shoulder-and-neck flow is limited to the **surface of the back of the neck and the outer shoulder**. It explicitly avoids the front of the neck, throat, sides of the neck, and the centre of the spine.

| Mode | Allowed flow | Additional constraint |
|---|---|---|
| Self-guided | Surface pause at the back of the neck/outer shoulder, then cross-body outer-shoulder substitute | The harder-to-control neck portion is replaced with the outer-shoulder substitute. |
| Assisted | Surface glide at the back of the neck/outer shoulder, outer-shoulder glide, and outer-shoulder pause | Every generated main instruction repeats the exclusion boundary. |

The feature remains general relaxation guidance only. It does not diagnose, treat, rehabilitate, or assess symptoms.

## Program rules

The engine introduces the `SHOULDER_NECK` body region, maps it to **肩頸外側** / **肩頸**, and generates deterministic warm-up, main, and cool-down segments using the same total-duration and controlled-editing rules as other regions. In self-guided mode, the main program includes a `SUBSTITUTE_ONLY` segment labelled **自己按替代動作**.

## Verification

Two program-rule tests verify that assisted shoulder-and-neck steps remain inside the written boundary and that self-guided flow uses the approved substitute. The complete suite passes with **19 active tests**, alongside type checking and linting.
