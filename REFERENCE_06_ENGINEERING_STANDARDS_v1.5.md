# Massage Flow — Engineering Standards

| 文件欄位 | 內容 |
|---|---|
| 狀態 | 建議基線，開工時按實際工具版本更新 |
| 版本 | 1.0 |
| 日期 | 2026-08-16 |

## 1. 核心原則

Massage Flow 橫跨 React Native、native bridge、Unity、內容資料同後端，最容易出現嘅問題係同一概念喺各層有唔同 ID、版本或行為。因此工程標準以**單一 domain contract、明確 ownership、不可變內容版本、可重現方案、離線優先同私隱最少化**為核心。

| 原則 | 實際要求 |
|---|---|
| Canonical IDs | Region、muscle、action、posture、asset、rule 同 release ID 一經發佈不可改語義。 |
| Schema first | Bridge、API、content、analytics 同 plan snapshot 先定 schema，再實作 producer／consumer。 |
| Immutable history | 已發佈內容、生成 plan 同完成 session 唔原地改寫；修正建立新 revision。 |
| Deterministic domain | 規則引擎喺相同輸入及版本下產生相同結果。 |
| Offline first | 核心 write 先入 SQLite；雲端係同步同備份，而唔係按摩播放嘅單點依賴。 |
| Privacy by default | 唔收集冇用途資料；自由文字、名稱、語音唔入 analytics 或一般 log。 |
| Safety invariant | 禁按 zone 同禁止 action 係 code／content invariant，唔係普通 feature flag。 |

## 2. Repository 及 ownership

每個 package 要有 `CODEOWNERS` 或同等 owner 設定。`domain`、`content-schema`、`rule-engine`、`bridge-protocol` 同 `analytics-schema` 係共享 contract，修改需要對應 mobile、Unity、backend、QA 同內容 owner review。

生成檔案，例如 Unity export、OpenAPI client、JSON Schema types、asset manifest 同 localization index，要有清楚 header 標示 generated，並由 CI 重建；禁止直接手改。

## 3. TypeScript 標準

| 項目 | 要求 |
|---|---|
| Type safety | 開啟 strict mode；禁止無原因 `any`；外部輸入全部 runtime validation。 |
| Domain type | ID 使用 branded／opaque type，避免 `regionId` 同 `muscleId` 混用。 |
| Nullability | 缺失、未知、未提供要用不同 enum／nullable 語義，唔用空字串代替。 |
| Time | 永久資料用 UTC ISO 8601／epoch；duration 一律整數秒或毫秒並寫入欄位名。 |
| Money | 商業模式未定；日後金額使用最小貨幣單位整數，唔用浮點。 |
| Error | Domain error 使用穩定 code；UI 文案用 localization key。 |
| Async | 所有 network、DB、file operation 可取消或有 timeout；唔建立無限重試。 |
| Logging | 結構化 log；禁止 log token、名稱、自由文字、語音或完整 plan。 |

## 4. C#／Unity 標準

| 項目 | 要求 |
|---|---|
| Scene boundary | Bootstrap、Body Selector、Guidance Player 各自責任清楚；唔將產品導航邏輯放 Unity。 |
| State | React Native 係永久產品狀態 source of truth；Unity 只持有 scene 暫態狀態。 |
| IDs | Unity object 綁 canonical string／GUID，唔依賴 hierarchy path 或 display name。 |
| Allocation | 播放 loop 避免每幀 allocation；使用 object pooling；profile GC spike。 |
| Asset | 只經 Addressables／Asset resolver 取得已版本化資產；禁止硬編 Resources path。 |
| Bridge | 所有 message 經 schema／version 驗證；未知 message 不 crash，返回明確 error。 |
| Time | 倒數使用 monotonic clock；App pause 後由 RN 指令恢復，唔依賴 frame 累加。 |
| Visual safety | Forbidden zone layer 由 runtime 固定載入，plan payload 唔可以關閉。 |

## 5. Backend 標準

Backend 初期採 modular monolith。每個模組有 application service、domain、repository interface 同 transport adapter；禁止 controller 直接執行 SQL 或拼規則。

| 項目 | 要求 |
|---|---|
| API | `/v1` 版本化、runtime validation、request ID、idempotency、標準錯誤格式。 |
| Database | migration 唯一來源；foreign key、unique constraint 同 transaction 優先於只靠 application validation。 |
| Multi-tenancy | 所有 user-owned query 明確帶 owner user ID；測試 IDOR。 |
| Queue | 工作 payload 使用 resource ID，唔複製大型敏感資料；handler 冪等。 |
| Cache | Cache miss 必須可由永久資料重建；cache key 包含 schema／content version。 |
| Audit | CMS 發佈、回退、權限、review、刪除同匯出寫 append-only audit。 |
| AI | 專用 gateway；輸入最少化；JSON schema；timeout；fallback；唔直接寫 plan。 |

## 6. Database 及 migration

資料表、欄位同 enum 使用英文 `snake_case`。Primary key 優先 UUID；內容 canonical code 另設 unique key。所有 user-editable entity 有 `version` 作 optimistic concurrency；append-only event 有 client UUID 同 idempotency constraint。

Migration 必須向前、可重跑檢查、喺 staging 使用 production-like volume 演練。刪欄位採 expand／migrate／contract，唔喺同一版 deploy 直接移除仍有舊 client 使用嘅欄位。JSONB 只用於 immutable snapshot、可變 metadata 或 transition，核心查詢欄位應正規化。

## 7. Error handling

| Error 類別 | 行為 |
|---|---|
| Validation | 唔重試；指出欄位及可修正方式。 |
| Authentication | refresh 一次；失敗要求重新登入；保留本機資料。 |
| Authorization | 唔重試；記 security event，但唔洩露資源存在。 |
| Network／timeout | 有界重試 + jitter；UI 保持離線可用；mutation 入 outbox。 |
| Content missing | readiness check 阻止開始核心缺失方案；提供下載或重新生成。 |
| Unity recoverable | 自動重試一次或 reload scene；之後返回 React Native 預覽。 |
| Rule generation | 返回穩定 domain code，例如時間不足、內容缺失、輸入不完整。 |
| Unknown／internal | 顯示一般錯誤 + diagnostic ID；保存 trace；唔向用戶顯示 stack。 |

## 8. Feature flag

Feature flag 可以控制登入同步、AI、個人化、新部位、新語言、新資產 release 同實驗 UI，但唔可以控制或關閉禁按 zone、禁止技巧、內容簽核、資料授權檢查或帳戶刪除。

每個 flag 要有 owner、目的、建立日期、預計移除日期、default、離線 fallback 同 analytics。長期存在嘅配置要改成版本化 domain config，而唔係永久 flag。

## 9. 測試及 review

任何 rule engine、content schema、bridge protocol、sync conflict 或安全 invariant 修改，都需要至少一名跨領域 reviewer。Pull request 要連結 Product Spec／ADR／issue，列明 offline、migration、analytics、accessibility、privacy 同 rollback 影響。

Merge 前最低要求包括 lint、type check、unit、golden plan、content lint、bridge contract、database migration test，同改動相關嘅 integration tests。Unity 視覺改動需要實機錄影或 reference capture，但視覺檢查唔取代 canonical ID 同 asset integrity 自動測試。

## 10. 環境與設定

| 環境 | 用途 | 資料政策 |
|---|---|---|
| Local | 單機開發、fixture content、mock auth。 | 只用合成資料。 |
| Development | 團隊整合、短期內容 preview。 | 只用測試資料，可重建。 |
| Staging | production-like、migration、release candidate、裝置測試。 | 去識別化或合成資料；禁止直接複製 production。 |
| Production | 真實用戶、已發佈內容。 | 最小權限、MFA、audit、backup、retention。 |

建議環境變數只保存非秘密設定或 secrets manager reference。典型分類包括 API base URL、OIDC issuer／client ID、PostgreSQL connection、Redis URL、Object Storage bucket、CDN base URL、content signing key reference、observability endpoint、feature flag environment 同 data retention policy。真實 secret 唔可以放入 mobile bundle、Unity StreamingAssets、repo 或 `.env.example`。

## 11. 文件同步

| 改動 | 必須同步更新 |
|---|---|
| 用戶流程／功能 | Product Spec、UI Flow、acceptance criteria、analytics。 |
| Domain／schema | Technical Spec、API／content schema、migration、tests。 |
| 架構決定 | ADR、Technical Spec、Project Overview。 |
| 安全內容 | Safety research／guideline、content schema、lint、test fixtures、聲明文案。 |
| 新部位 | Product scope、content manifest、rule fixtures、3D／語音 assets、review record。 |
| 新語言 | localization contract、voice assets、fallback、content gate、UI test。 |
| AI | Product disclosure、AI schema、fallback、privacy、evaluation、monitoring。 |

## 12. Commit、版本及 release

Commit 可使用 Conventional Commits 或同等一致格式。App、API、bridge、rule engine、content schema 同 content release 各自版本化；唔應假設 App 版本等於內容版本。Breaking bridge／API change 要有 compatibility window；已發佈 App 無法即時更新，所以 server／content 最少要支援仍喺政策範圍內嘅舊 client。

Release note 要分「App 功能」、「內容更新」、「安全／限制修正」、「已知問題」同「需要重新下載嘅資產」。如果內容回退，必須保存原因、影響版本、處理時間同後續修正。
