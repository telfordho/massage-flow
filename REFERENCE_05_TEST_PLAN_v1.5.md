# Massage Flow — Test Plan

| 文件欄位 | 內容 |
|---|---|
| 狀態 | 開工前測試基線；已同步 MVP「智能流程編排 v1」、模式可觸及性、多部位、感受目標及受控編輯 Prototype |
| 版本 | 1.5 |
| 日期 | 2026-08-17 |
| 主要範圍 | Prototype、MVP、V1.1 雲端擴充 |

> **v1.5 必測項：** 部位重排須改變主要時間優先次序；主要段落 override 與較柔和替代動作須反映於預覽、示範及播放器；無論調整組合如何，總時間不變，並至少保留一段準備及一段收尾。

## 1. 測試目標

測試要證明 Massage Flow 唔單止「畫面行到」，而係每次都可以由同一組概括部位、優先度及時長輸入產生可重現、內容完整、冇禁用技巧、資產可解析、時間合理並可離線完成嘅 `Program Segment` 程序。程序預覽／示範、3D、React Native、Unity bridge、SQLite、資產包同規則引擎係同一條核心鏈；任何一段失敗都唔可以令 session 靜默記錯、預覽與倒數不一致或顯示錯誤位置。

## 2. 測試層級

| 層級 | 目的 | 主要 owner |
|---|---|---|
| Unit | 驗證時間分配、filter、排序、schema、repository 同 bridge handler。 | 工程 |
| Golden plan | 固定輸入及版本產生固定方案；規則改動要審核 diff。 | 工程 + 產品 + 內容 |
| Property-based | 驗證所有輸入組合都滿足安全及時間 invariant。 | 工程 |
| Content lint | 確認肌肉、動作、動畫、語音、翻譯、禁按區同簽核完整。 | 內容 + 工程 |
| Integration | React Native、native bridge、Unity、SQLite、下載及音訊整合。 | 工程 + QA |
| Device／performance | 驗證低中高階裝置、記憶體、FPS、發熱、電量同 scene lifecycle。 | QA + Unity |
| Offline／sync | 驗證飛行模式、outbox、重試、登入合併、多裝置同 tombstone。 | QA + Backend |
| Security／privacy | 驗證 AuthZ、token、敏感 log、資料刪除、管理權限同資產 URL。 | Security／Backend |
| Accessibility | 字體、讀屏、字幕、對比、減少動態同唔只靠顏色。 | UX + QA |
| Usability | 驗證非專業成人可指出位置、理解動作、完成轉位同控制播放器。 | Product + UX |

## 3. Release gate

| Gate | 條件 |
|---|---|
| Prototype gate | RN／Unity 可重複進出；肩／上背可點選；一個動作可同步播放；飛行模式可完成；冇不可接受 memory growth。 |
| Content gate | 每個發佈區域通過內容 completeness、禁按區、語音、動畫、資產同專業簽核。 |
| MVP gate | 所有 P0／P1 測試通過；概括選區至肌群細分、程序預覽／示範及逐段倒數結果一致；無 blocker／critical defect；核心裝置矩陣 crash-free；離線完整；歷史可重播。 |
| V1.1 gate | AuthZ、sync、備份、匯出、刪除、CMS 審批、release rollback、災難恢復演練通過。 |

## 4. 核心 invariant 自動測試

| ID | Invariant |
|---|---|
| INV-001 | 任何正式方案都唔包含禁按 zone。 |
| INV-002 | 任何正式方案都唔包含脊椎推整、關節復位、高速旋轉或其他禁止 technique。 |
| INV-003 | 每個 step 時間介乎 action 定義嘅最短及最長時間。 |
| INV-004 | 總 step 時間加已定義 transition 誤差等於方案總時間。 |
| INV-005 | 每個 step 都有 region／muscle、姿勢、力度、文案、核心視覺資產同 locale fallback。 |
| INV-006 | 同一 input、rule version、content release 同 asset availability 產生相同 plan snapshot hash。 |
| INV-007 | 自己按模式唔會包含標示為只適合幫人按嘅 action。 |
| INV-008 | 舊 plan snapshot 唔會因新 content release 而改變。 |
| INV-009 | 已刪 profile 嘅 tombstone 優先於舊裝置更新，唔會被重新建立。 |
| INV-010 | AI interpretation 永遠唔可以直接指定 action、禁按 zone 或醫療結論。 |
| INV-011 | MVP 用戶輸入只包含概括區域；所有細分肌群必須由已發佈規則與內容映射產生。 |
| INV-012 | 程序預覽／示範、離線 readiness check 及播放器必須讀取同一 plan revision 與 `Program Segment` 序列。 |
| INV-013 | `SELF + UNAVAILABLE` 位置不可在選區選取或生成；`SELF + SUBSTITUTE_ONLY` 必須使用已發佈替代、保留替代原因，並與預覽及播放器一致。 |

## 5. Golden plan fixtures

| Fixture | 輸入 | 預期重點 |
|---|---|---|
| GP-001 | 自己按、左側上背、繃緊 3、放鬆、5 分鐘 | 用戶毋須選肌肉；系統自動細分自我可觸及肌群；一個姿勢；有熱身及收尾。 |
| GP-002 | 幫人按、雙側上背、酸攰 2、放鬆、10 分鐘 | 系統安排左右側細分肌群；按摩者視角；時間大致對稱。 |
| GP-003 | 幫人按、肩背 priority 1 + 小腿 priority 2、15 分鐘 | 高優先部位獲較多時間；按姿勢分組；轉位最少。 |
| GP-004 | 自己按、三個部位、5 分鐘 | 集中最高優先部位或返回清楚降級；唔產生過短步驟。 |
| GP-005 | 後頸安全區、任何模式、10 分鐘 | 冇頸前／頸側高亮，冇快速旋轉，力度只限保守範圍。 |
| GP-006 | 同 GP-002，但缺少一個非必要語音資產 | 可用字幕降級，plan 本身不變並標示語音缺失。 |
| GP-007 | 同 GP-002，但缺少核心手部動畫 | readiness check 失敗；唔開始錯誤方案。 |
| GP-008 | 舊 content release 生成後發佈新版 | 歷史重播仍使用舊 snapshot 及可取得嘅 archive asset。 |
| GP-009 | 概括選擇上背、10 分鐘，先預覽／觀看示範再開始 | 預覽與播放器使用相同 segment 次序、肌群、手法、時間及 asset references。 |
| GP-010 | 自己按、雙側上背、10 分鐘，其中一個候選動作只適合幫人按 | 原動作被排除；只在有已審核替代時生成替代 segment 並顯示原因，否則清楚要求改選部位。 |
| GP-011 | 上背 priority 1 + 下背 priority 2、10 分鐘 | 兩個 region 都有 segment；上背的主要時長多於下背；總時間保持一致。 |
| GP-012 | 自己按、中背 + 下背、10 分鐘 | 中背與下背中央難觸及位置以已審核替代 segment 處理，預覽與播放器均顯示來源 region 及替代原因。 |

## 6. 主要功能測試例子

### 6.1 家庭成員

| ID | 情境 | 預期 |
|---|---|---|
| PROF-001 | 建立「我」，確認 18+，性別留空 | 成功保存；可以開始 session。 |
| PROF-002 | 未確認 18+ | 唔可以保存為可按摩 profile。 |
| PROF-003 | 使用重複暱稱 | 可保存，以內部 UUID 區分。 |
| PROF-004 | 刪除有歷史嘅 profile | 顯示影響；按既定策略匿名化／封存；歷史唔錯配到其他人。 |
| PROF-005 | 訪客註冊後合併 | 本機 profile、session 同 outcome 使用原 UUID 或 mapping 合併，冇重複。 |

### 6.2 3D 選區

| ID | 情境 | 預期 |
|---|---|---|
| BODY-001 | 旋轉、縮放後選左肩 | 左肩高亮，side=`LEFT`，相機姿勢可保存。 |
| BODY-002 | 表面層點選上背，再切肌肉提示層 | 相關肌群可作提示；原概括 region selection 保留；用戶毋須點選肌肉仍可繼續。 |
| BODY-003 | 點禁按區 | 不選中；顯示不可選標記同簡短原因。 |
| BODY-004 | 選左肩、右小腿、雙側前臂並排序 | 三個 target 正確保存 priority 1–3。 |
| BODY-005 | 開啟減少動態 | 相機及動畫減少非必要 transition，選區仍清楚。 |
| BODY-006 | 自己按進入上背選區 | `DIRECT` 區域可選；`SUBSTITUTE_ONLY` 顯示替代確認；`UNAVAILABLE` 不可選且不會靜默加入 target。 |

### 6.3 時長及生成

| ID | 情境 | 預期 |
|---|---|---|
| PLAN-001 | 單一部位選 10 分鐘 | 生成完整三階段方案，總時間合理。 |
| PLAN-002 | 多部位選 5 分鐘 | 顯示建議最短時間；容許集中最高優先部位。 |
| PLAN-003 | 相同輸入生成兩次 | snapshot hash 相同。 |
| PLAN-004 | 改 priority 後生成 | 時間分配或排序反映新 priority。 |
| PLAN-005 | 改 step 時間超出 action 上限 | UI 限制或引擎拒絕，並顯示可接受範圍。 |
| PLAN-006 | 跳過必要熱身 | 唔容許完全刪除，或以另一個必要步驟替代。 |
| PLAN-007 | 揀替代手法 | 只顯示同模式、部位、姿勢及資產相容嘅已審核 action。 |
| PLAN-008 | 選上背及 10 分鐘，未輸入任何肌肉 | 產生包含細分肌群、手法、力度、時長及示範資產的 `Program Segment` 序列。 |
| PLAN-009 | 調整一個 segment 時長或替代手法 | 引擎重新編排；預覽、asset readiness 與播放器均指向新 plan revision。 |
| PLAN-010 | 同一上背輸入分別使用自己按與幫人按 | 自己按只使用 `DIRECT`／已審核替代動作；幫人按可使用完整已審核候選集；兩者 generation trace 均可解釋。 |

### 6.4 播放器

| ID | 情境 | 預期 |
|---|---|---|
| PLAY-001 | 正常播放 | 3D、高亮、肌肉名稱、字幕、語音、倒數同步。 |
| PLAY-002 | 暫停 30 秒再繼續 | 主倒數唔流失；語音同動畫由一致狀態恢復。 |
| PLAY-003 | 重播目前步驟 | step 由起點播放；完成統計唔重複計兩次。 |
| PLAY-004 | 下一步／上一步 | 目標位置、資產、倒數同 event sequence 正確。 |
| PLAY-005 | App 入背景 | 自動暫停；返回後提示繼續；冇漏記。 |
| PLAY-006 | 電話或其他音訊打斷 | 自動暫停或 audio ducking 符合政策；唔繼續無聲倒數。 |
| PLAY-007 | 姿勢轉換 | 主倒數暫停，等「我準備好」先開始下一組。 |
| PLAY-008 | 強制關 App 再開 | 如 session 可恢復，回到最近已確認 segment；否則保留未完成紀錄。 |
| PLAY-009 | 從程序預覽觀看指定 segment 示範後開始 | 示範不改變 snapshot；播放器從相同 segment 序列開始，顯示目前細分肌群、本段倒數及下一步。 |
| PLAY-010 | segment 完成後自動推進 | Unity、語音、字幕、計時及 `SEGMENT_CHANGED` 事件同步切到下一段；總時間正確更新。 |

### 6.5 完成及歷史

| ID | 情境 | 預期 |
|---|---|---|
| DONE-001 | 完成全部步驟並選舒服咗 | 保存 actual duration、completed steps 同 outcome=`BETTER`。 |
| DONE-002 | 中途結束 | 保存 partial session；唔當完整完成率。 |
| DONE-003 | 選更唔舒服 | 保存 outcome；顯示一般停止及按需要尋求協助提示；唔診斷。 |
| HIST-001 | 重做舊方案 | 使用舊 snapshot；若核心資產已清除，先重新下載 archive 或生成兼容副本。 |
| HIST-002 | 新內容發佈後睇舊紀錄 | 舊文字、肌肉、時間、資產版本不變。 |

## 7. 離線及下載測試

| ID | 情境 | 預期 |
|---|---|---|
| OFF-001 | 已下載方案，開飛行模式 | 由預覽、播放到 outcome 全部完成。 |
| OFF-002 | 下載 40% 網絡斷線 | 保存進度；重連後續傳；唔啟用半包。 |
| OFF-003 | checksum 錯誤 | 刪臨時檔、標記失敗、可重試；舊版仍可用。 |
| OFF-004 | 安裝新版時 App 被終止 | 下次啟動恢復或清理 staging；active version 不變。 |
| OFF-005 | 空間不足 | 列出所需空間及可清內容；唔刪 session／profile。 |
| OFF-006 | 下載完但 Unity dry-load 失敗 | 唔啟用新包；回退舊版；記 diagnostic ID。 |

## 8. V1.1 同步測試

| ID | 情境 | 預期 |
|---|---|---|
| SYNC-001 | 離線完成兩個 session 後登入 | 兩個 session 以 UUID 冪等上傳，唔重複。 |
| SYNC-002 | 同一 profile 兩裝置改不同欄位 | 欄位級 merge；兩個改動都保留。 |
| SYNC-003 | 一個裝置刪 profile，另一個離線改暱稱 | tombstone 優先，舊更新唔復活 profile。 |
| SYNC-004 | 同一 outbox batch 重送 | server 以 idempotency key 返回原結果。 |
| SYNC-005 | 裝置時間錯兩小時 | server 唔以 client clock 作唯一排序；使用 version／received time。 |
| SYNC-006 | access token 過期 | refresh 一次再重試；失敗就保留 outbox 並要求重新登入。 |

## 9. 安全內容測試

安全測試唔係個人醫療篩查，而係確認產品永遠唔會教出已禁止內容。測試資料應包含頸前、頸兩側、脊椎骨突等禁按 zone，以及高速扭轉、推整、復位、極大力度等禁止 action。任何 release 或 plan 只要命中一項，就必須令 build／publish gate 失敗。

| ID | 情境 | 預期 |
|---|---|---|
| SAFE-001 | Action target 同 forbidden zone geometry 相交 | Content lint 失敗，唔可發佈。 |
| SAFE-002 | Technique code 屬禁止清單 | Schema／publish gate 失敗。 |
| SAFE-003 | 廣東話語音稿包含「復位／治療／保證有效」 | Terminology lint 標記並要求人工修正。 |
| SAFE-004 | 後頸 step camera 顯示到頸前但高亮正確 | 視覺 reviewer 檢查；如可能誤導就唔通過。 |
| SAFE-005 | 方案受控編輯嘗試移除全部熱身 | 引擎拒絕或自動加入替代必要步驟。 |

## 10. 性能與裝置矩陣

| 類別 | 最少測試 |
|---|---|
| iOS | 一部最低支援裝置、一部中階、一部高階；至少兩個螢幕尺寸。 |
| Android | 低 RAM／GPU、中階、高階；至少兩間主要廠商；不同螢幕比例。 |
| 網絡 | Wi-Fi、4G／5G、慢速、高延遲、斷續、完全離線。 |
| 儲存 | 充足、接近不足、下載期間不足。 |
| 電量／熱 | 15、30 分鐘 session；背景／前景；螢幕常亮。 |

性能測試至少量度一般冷啟動、Unity scene ready、FPS percentile、記憶體峰值、三次進出 scene 後 retained memory、asset load、點選 latency、語音／動畫漂移、下載速度同電量消耗。正式門檻要喺 Prototype 實機數據後鎖定。

## 11. 無障礙測試

| ID | 情境 | 預期 |
|---|---|---|
| A11Y-001 | 系統字體最大 | 主要表單、按鈕、倒數同肌肉名稱唔被截斷；可捲動。 |
| A11Y-002 | VoiceOver／TalkBack | React Native 頁面次序合理；Unity scene 有替代文字控制及字幕。 |
| A11Y-003 | 色覺差異 | 已選、禁按、目前步驟唔只靠顏色。 |
| A11Y-004 | 減少動態 | 非必要相機轉場、粒子及手勢動畫降低；核心方向仍可理解。 |
| A11Y-005 | 關閉語音 | 字幕、倒數、姿勢同提示完整，功能不受阻。 |

## 12. Usability test 建議

Prototype 建議先以 5–8 位符合目標嘅非專業成人做 formative test，MVP 前再擴大。每次觀察用戶能否完成：建立成員、指出概括上背、選兩個部位及排序、明白建議時間、看懂系統如何細分肌群、在程序預覽觀看示範、跟手部動畫、完成姿勢轉換、暫停／重播、提交結果。

研究人員唔應先教用戶介面；記錄誤點、停頓、問句、位置理解、方向錯誤同對醫療效果嘅誤解。任何多位用戶將產品當診斷或治療工具，都需要修改文案、流程或視覺層級，而唔只係加一段更長免責聲明。

## 14. 感受及目標 Prototype 測試

| 案例 | 輸入 | 預期結果 |
|---|---|---|
| 一般放鬆 | 純粹想放鬆、2／5、今日開始、一般放鬆 | 使用平衡暖身／收尾比例；預覽顯示固定 context 解釋。 |
| 睡前高程度 | 繃緊、4／5、幾日、睡前舒緩 | 收尾時間多於一般放鬆；主要時間相對減少；預覽顯示保守節奏原因。 |
| 活動前 | 僵硬、3／5、今日開始、活動前準備 | 暖身時間多於一般放鬆；總時長不變。 |
| 多部位 | 任意固定 context、兩個已排序 target | 感受／目標影響暖身與收尾；主要時間仍先分配予第一優先部位。 |

所有 case 必須驗證 segment 總時長等於所選總時長、snapshot 保留 structured context、時長頁與預覽頁顯示同一份 `contextNotice`／`allocationNotice`。
