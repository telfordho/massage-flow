# Massage Flow — Start Here

## Current baseline

This directory is the **only active Massage Flow baseline**. Start with this file, then read `PRODUCT_SPEC.md`, `CURRENT_STATE.md`, `design.md`, and `todo.md`. The one portable recovery archive is `Massage_Flow_Complete_Baseline.zip`.

| Keep using | Purpose |
|---|---|
| `START_HERE.md` | Entry point, recovery sequence, and new-chat workflow. |
| `PRODUCT_SPEC.md` | Consolidated product rules, safety boundaries, data model, and test contract. |
| `CURRENT_STATE.md` | What is implemented, verified, and pending. |
| `design.md` | Portrait mobile interaction and visual design decisions. |
| `todo.md` | Immutable implementation history and outstanding items. |
| `Massage_Flow_Complete_Baseline.zip` | One portable source-and-document recovery archive. |

All earlier versioned packages and incremental addenda are retained under `archive/legacy-versioned-materials/` for reference only. They are not required for ordinary work.

## Project ChatBot synchronization

The project ChatBot reads the **shared project files**, not the WebDev working directory automatically. Whenever the current baseline changes, synchronize these six files to the project shared-file area before asking the ChatBot about progress: `START_HERE.md`, `PRODUCT_SPEC.md`, `CURRENT_STATE.md`, `design.md`, `todo.md`, and `Massage_Flow_Complete_Baseline.zip`. Apply the shared-file update through project configuration, then ask the ChatBot again in a new message.

If the ChatBot reports an older milestone, compare its shared `CURRENT_STATE.md` with the active project file first. Do not treat a ChatBot answer as the source of truth until that comparison matches.

## New-chat workflow

1. Work in the active `massage-flow-restored` project whenever it is available. Read the five active Markdown files listed above before changing behaviour.
2. Add every requested feature or defect to `todo.md` as an unchecked item **before** implementation.
3. Read the relevant implementation code and the matching section of `PRODUCT_SPEC.md`. Keep all user-facing copy in Cantonese Traditional Chinese.
4. Implement the change while preserving the deterministic program engine, general-relaxation boundary, local-only data model, and preview-before-countdown rule.
5. Add or update deterministic tests; run `pnpm check`, `pnpm test`, and `pnpm lint`; then mark the completed task in `todo.md`.
6. Update `CURRENT_STATE.md` and, if product behaviour changed, `PRODUCT_SPEC.md`. Save a checkpoint before delivery.

## If the active project is unavailable

Attach `Massage_Flow_Complete_Baseline.zip`, inspect the archive without executing unknown files, and obtain explicit confirmation before restoring it into a separate Expo project. Do not overwrite an unrelated project, reuse project-specific configuration, or treat a historical package in `archive/` as the latest baseline.

> **Current operational rule:** The prototype is local-first. Do not add cloud sync, authentication, server storage, diagnosis, treatment, or rehabilitation functionality unless the user explicitly requests it.
