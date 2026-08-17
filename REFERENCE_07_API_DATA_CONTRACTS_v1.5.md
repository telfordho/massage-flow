# Massage Flow — API & Data Contract Reference

| 文件欄位 | 內容 |
|---|---|
| 狀態 | 概念 contract；開發時轉成 OpenAPI／JSON Schema；已同步 MVP「智能流程編排 v1」、mode adaptation、多部位、感受目標及受控編輯 Prototype |
| 版本 | 1.5 |
| 日期 | 2026-08-17 |
| 適用 | Mobile、Unity bridge、Backend、CMS、QA |

> **v1.5 contract 補充：** plan revision 採 `ProgramEditIntent { targetOrder?, mainDurationOverrides?, substituteVariants? }`。服務端或本機規則引擎必須回傳完整重算 `Program Segment` snapshot，不接受直接修改 immutable segment 或移除必要 `PREPARATION`／`COOL_DOWN`。

## 1. Contract 版本

| Contract | 初始版本 | 相容原則 |
|---|---|---|
| API | `/v1` | 新增 optional 欄位屬向後相容；改語義或刪欄位需新 major path。 |
| Plan input | `schemaVersion: 2` | v2 使用概括區域輸入；Server／client 最少支援政策範圍內舊版本。 |
| Plan snapshot | `snapshotVersion: 2` | v2 以 `Program Segment` 表達系統細分肌群、示範與執行資料；immutable；舊 snapshot reader 長期保留。 |
| Unity bridge | `protocolVersion: 2` | v2 支援 segment 播放狀態及下一步預告；啟動時協商；唔相容要拒絕並返回可理解錯誤。 |
| Content manifest | `manifestVersion: 1` | App 先驗證最低 App 版本、平台、locale 同 checksum。 |
| Sync | `syncVersion: 1` | Cursor opaque；client 唔解析 server cursor。 |

## 2. Canonical enum

| Enum | 值 |
|---|---|
| `MassageMode` | `SELF`、`HELP_OTHER` |
| `BodySide` | `LEFT`、`RIGHT`、`BOTH`、`CENTER`、`NOT_APPLICABLE` |
| `Sensation` | `TIGHT`、`SORE`、`STIFF`、`TENDER`、`GENERAL_RELAXATION` |
| `Severity` | `1` 至 `5` |
| `DurationBand` | `TODAY`、`FEW_DAYS`、`RECURRING_LONG_TERM`、`NOT_SPECIFIED` |
| `MassageGoal` | `RELAX`、`PRE_ACTIVITY`、`POST_ACTIVITY`、`EASE_MOVEMENT`、`BEDTIME` |
| `PressureLevel` | `LIGHT`、`LIGHT_TO_MEDIUM`、`MEDIUM` |
| `PlanPhase` | `PREPARATION`、`WARM_UP`、`MAIN`、`COOL_DOWN`、`TRANSITION` |
| `SessionStatus` | `DRAFT`、`READY`、`IN_PROGRESS`、`PAUSED`、`COMPLETED`、`ENDED_EARLY`、`FAILED` |
| `OutcomeRating` | `BETTER`、`SAME`、`WORSE` |
| `ContentStatus` | `DRAFT`、`IN_REVIEW`、`APPROVED`、`PUBLISHED`、`SUPERSEDED`、`ROLLED_BACK`、`RETIRED` |
| `AssetType` | `UNITY_BUNDLE`、`MODEL`、`ANIMATION`、`AUDIO`、`IMAGE`、`SUBTITLE`、`GEOMETRY_ZONE` |
| `ZoneType` | `SELECTABLE`、`FORBIDDEN`、`CAUTION_VISUAL_ONLY` |

任何 enum 擴充要先確認舊 client 對 unknown value 嘅 fallback。禁止將顯示文案直接當 enum；顯示名稱由 localization key 解析。

## 3. ID 規則

| 類型 | 格式 | 例子 |
|---|---|---|
| User／profile／session／plan | UUID v4 或具同等碰撞保障嘅 client-generated UUID | `b6f8b5a0-6f3f-4aaf-9b03-6d0c84523e91` |
| Canonical content code | 小寫 `snake_case`，發佈後不可改語義 | `upper_trapezius`、`upper_back` |
| Content release | 可排序版本字串 | `2026.08.1` |
| Asset pack | `<scope>-<locale>-<platform>-<release>` | `upper-body-zh-HK-ios-2026.08.1` |
| Request／diagnostic | 時間可排序 opaque ID | `req_01J...`、`diag_01J...` |

## 4. 核心資料 payload

### 4.1 Person profile

```json
{
  "id": "b6f8b5a0-6f3f-4aaf-9b03-6d0c84523e91",
  "displayName": "我",
  "ageBand": "ADULT_18_39",
  "adultConfirmed": true,
  "defaultMode": "SELF",
  "pressurePreference": "LIGHT_TO_MEDIUM",
  "personalizationEnabled": false,
  "version": 3,
  "updatedAt": "2026-08-16T08:00:00Z"
}
```

`displayName` 屬個人資料，唔可以進 analytics 或一般 log。`adultConfirmed` 必須為 `true` 先可以建立 session。

### 4.2 Session target

```json
{
  "id": "0d24b7b7-44c2-4530-9672-76169487a107",
  "regionId": "upper_back",
  "side": "LEFT",
  "priorityRank": 1,
  "sensation": "TIGHT",
  "severity": 3,
  "durationBand": "FEW_DAYS",
  "goal": "RELAX",
  "freeTextNote": null
}
```

MVP 嘅 `freeTextNote` 只作紀錄，唔進規則引擎。MVP 用戶只提交概括 `regionId` 及相關偏好，不提交手動 `muscleIds`；編排引擎根據已發佈對應資料自行選出細分肌群。V1.2 AI 只可以輸出另一個用戶確認過嘅 structured interpretation，唔覆寫原文。

Plan input 的 `targets` 為已排序陣列，陣列位置即 `priorityRank`；Prototype 首批值為 `upper_back`、`mid_back`、`lower_back`，每項均須帶 `side`。輸出 snapshot 內每個 segment 必須保留 `regionId`，以便預覽和播放器顯示與用戶所選順序一致的來源部位。

Current Prototype 亦提交一個 session-level `context`：`sensation`、`severity`、`durationBand` 及 `goal`。輸出 snapshot 要回傳相同的 structured `context`、`contextNotice` 及 `allocationNotice`，使時長頁、預覽與播放器消費同一個可解釋結果。日後 per-target context 可以加到每個 `target`；現有 session-level 結構需保留向後相容讀取。

### 4.3 Program Segment snapshot

每個 plan step 係一個可獨立預覽、示範及倒數執行嘅 `Program Segment`。它保留系統已選定嘅肌群與手法，讓倒數播放器毋須重新計算流程。

```json
{
  "snapshotVersion": 2,
  "segmentType": "MASSAGE_ACTION",
  "id": "dc0c6e76-1d6a-45bc-a095-013f8910848b",
  "sequence": 2,
  "phase": "MAIN",
  "posture": {
    "id": "seated",
    "name": "坐姿",
    "setupAssetId": "asset_posture_seated_zhhk_v3"
  },
  "target": {
    "regionId": "upper_back",
    "regionName": "上背",
    "muscleIds": ["upper_trapezius"],
    "muscleNames": ["上斜方肌"],
    "side": "LEFT"
  },
  "modeAdaptation": {
    "mode": "SELF",
    "reachability": "SUBSTITUTE_ONLY",
    "substitutionApplied": true,
    "reasonKey": "plan.self_reachability.alternate_upper_back"
  },
  "technique": {
    "actionId": "fingerpad_slow_circle_upper_trap",
    "techniqueCode": "SLOW_CIRCULAR_PRESSURE",
    "handContact": "FINGERPADS",
    "direction": "OUTWARD_CIRCLE"
  },
  "durationSec": 120,
  "pressure": "LIGHT_TO_MEDIUM",
  "copy": {
    "title": "左邊上斜方肌",
    "instruction": "用指腹慢慢向外打圈。",
    "caption": "保持輕至中等力度。"
  },
  "assets": {
    "unityAnimationId": "anim_upper_trap_circle_v4",
    "demoPreviewImageId": "img_upper_trap_circle_preview_v1",
    "highlightGeometryId": "geo_upper_trap_left_v2",
    "audioId": "audio_zhhk_upper_trap_circle_v5",
    "subtitleId": "subtitle_zhhk_upper_trap_circle_v5"
  },
  "nextSegmentId": "a204b6f3-e4a1-4e72-9fb7-7349f1e76c5d",
  "contentRelease": "2026.08.1"
}
```

Snapshot 保存概括部位、系統細分肌群、顯示名稱、示範與執行 asset references，唔只保存 foreign key，確保預覽、倒數及歷史重播一致。`modeAdaptation` 必須保存目前模式、可觸及性結果、是否已替代及可本地化原因 key，令選區、預覽及播放器毋須重新判斷。`actionId` 可以日後 retired，但 snapshot 仍然有效。

## 5. API 通用規則

| 項目 | 規則 |
|---|---|
| Auth | `Authorization: Bearer <token>`；內容 manifest 可視乎政策匿名取得。 |
| Request ID | Client 可傳 `X-Request-ID`；server 會返回。 |
| Idempotency | 所有建立／批次 mutation 接受 `Idempotency-Key`。 |
| Concurrency | 可編輯 resource 使用 `version` 或 `If-Match`。 |
| Pagination | Cursor-based；回應 `nextCursor`，唔用 offset 作大型歷史。 |
| Time | UTC ISO 8601；duration 欄位明確使用 `Sec`／`Ms`。 |
| Error | 統一 `error.code`、`messageKey`、`recoverable`、`details`、`requestId`。 |
| Locale | `Accept-Language` + profile locale；content release 仍要顯式 locale。 |
| Content caching | `ETag`、`If-None-Match`、immutable cache path。 |

## 6. Endpoint contract 摘要

### 6.1 `GET /v1/content/manifest`

Query 包括 `platform`、`locale`、`appVersion`、可選 `currentRelease`。回應包括推薦 release、最低 App 版本、pack dependencies、size、checksum、CDN URL、是否強制撤回同上一個可用 release。

### 6.2 `POST /v1/plans/generate`

輸入必須有 profile adult confirmation、mode、duration、概括區域 targets、preferences、content release、rule version 或 server default、available asset packs。成功回應返回由 `Program Segment` 組成嘅 plan snapshot、generation summary、每個概括區域嘅肌群細分摘要、mode reachability 結果、已採用替代及原因、suggested minimum duration、asset readiness、可觀看示範嘅 asset references 同 explainable notices。

| Error code | 意義 |
|---|---|
| `PROFILE_NOT_ADULT` | Profile 未確認 18+。 |
| `TARGET_REQUIRED` | 冇選任何部位。 |
| `DURATION_TOO_SHORT` | 即使降級都不足以生成有效方案。 |
| `CONTENT_RELEASE_UNAVAILABLE` | 指定版本不可用或已撤回。 |
| `CONTENT_ASSET_MISSING` | 核心資產缺失。 |
| `NO_COMPATIBLE_ACTION` | 模式、部位及限制下冇已審核動作。 |
| `RULE_VERSION_UNSUPPORTED` | Client／server 規則版本唔相容。 |

### 6.3 `POST /v1/sync/push`

```json
{
  "syncVersion": 1,
  "deviceId": "fc97b657-79c5-4e30-9f3a-50545a7630c9",
  "baseCursor": "opaque_cursor",
  "mutations": [
    {
      "mutationId": "8ca8a254-d48e-40ec-bd6c-19384a1f0275",
      "entityType": "MASSAGE_SESSION",
      "operation": "UPSERT",
      "entityId": "2b36a69c-4e51-4bb9-8060-41d630c72ee4",
      "baseVersion": null,
      "occurredAt": "2026-08-16T08:30:00Z",
      "payload": {}
    }
  ]
}
```

回應逐項返回 `ACCEPTED`、`DUPLICATE`、`CONFLICT` 或 `REJECTED`，並提供新 cursor。任何 mutation 重送都必須安全。

### 6.4 `GET /v1/sync/pull`

輸入 opaque cursor；回應 server changes、tombstones、content notices 同 next cursor。Client 必須先 transactionally apply changes，再保存新 cursor。

## 7. Unity bridge envelope

```json
{
  "protocolVersion": 2,
  "requestId": "bridge_01J...",
  "type": "OPEN_BODY_SELECTOR",
  "sentAtMs": 1786867200000,
  "payload": {}
}
```

未知 `type` 返回 `UNSUPPORTED_MESSAGE_TYPE`；高於支援嘅 major protocol 返回 `PROTOCOL_INCOMPATIBLE`；相同 `requestId` 唔應重複執行副作用。

## 8. Analytics event contract

| Event | 必要欄位 | 禁止欄位 |
|---|---|---|
| `body_selector_opened` | appVersion、platform、contentRelease、mode | profileName、freeText |
| `region_selected` | regionId、side、selectionCount | 家庭成員資料 |
| `plan_generated` | durationBucket、targetCount、ruleVersion、segmentCount、generationMs | 完整 target notes、肌群名稱列表 |
| `program_previewed` | planId pseudonym、segmentCount、demoAvailable | 名稱、語音 |
| `segment_demo_viewed` | planId pseudonym、segmentIndex、demoType | 名稱、完整 plan payload |
| `session_started` | planId pseudonym、segmentCount、offline | 名稱、語音 |
| `segment_started` | planId pseudonym、segmentIndex、phase | 肌群名稱、完整 plan payload |
| `session_completed` | planned／actual duration bucket、completedSegmentCount | 自由文字 |
| `outcome_submitted` | rating、regionCategory bucket | profileName |
| `unity_scene_error` | errorCode、scene、deviceCapability、contentRelease | plan payload、stack 中敏感值 |

## 9. Content manifest 範例

```json
{
  "manifestVersion": 1,
  "release": "2026.08.1",
  "platform": "ios",
  "locale": "zh-HK",
  "minimumAppVersion": "1.0.0",
  "packs": [
    {
      "id": "upper-body-zh-HK-ios-2026.08.1",
      "sizeBytes": 52428800,
      "sha256": "hex-value",
      "dependencies": ["core-runtime-ios-2026.08.1"],
      "url": "https://cdn.example.invalid/...",
      "required": true
    }
  ],
  "revokedReleases": [],
  "fallbackRelease": "2026.07.3"
}
```

實際 URL、bucket 同 domain 開工時再設定；例子使用無效示範 domain，唔代表已建立任何服務。

## 10. 資料刪除與匯出 contract

帳戶刪除 endpoint 建立 asynchronous job，返回 job ID、估計完成政策同狀態查詢。刪除範圍包括 user、profile、session、outcome、free text、voice object、push token、personalization state 同可定位 object metadata；法律或保安必須保留嘅 audit 要去識別化並有 retention 理由。

資料匯出以可讀 JSON／CSV 及必要資產清單提供，包含 profile、settings、session、targets、plan snapshots、outcomes 同 consent history。匯出檔使用短期 signed URL，過期後自動刪除。
