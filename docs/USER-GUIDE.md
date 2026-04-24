# CAS Incubator OS — 使用手冊 / User Guide

> 最後更新: 2026-04-24 · Platform: https://incubator.nexhunt.xyz

## 📖 目錄

1. [平台簡介](#平台簡介)
2. [角色總覽](#角色總覽)
3. [Super Admin 指南](#super-admin-指南)
4. [教師 (Teacher) 指南](#教師-teacher-指南)
5. [導師 (Mentor) 指南](#導師-mentor-指南)
6. [學生 (Student) 指南](#學生-student-指南)
7. [家長 (Parent) 指南](#家長-parent-指南)
8. [常見問題 FAQ](#常見問題-faq)
9. [故障排除](#故障排除)

---

## 平台簡介

**CAS Incubator OS** 是 AI 驅動的專案式教育平台，協助高中生從「想法」走到「可展示的專案」。

核心特色:
- **10 階段方法論**: 從興趣探索 → 定義問題 → 找使用者 → 競品研究 → 價值主張 → MVP → 建置 → 測試 → 故事 → 成果展
- **AI 輔助**: 學生 intake 摘要、專案分類、老師回饋草稿、家長更新自動起草
- **雙軌教學**: 教師 (classroom) + 導師 (1-on-1) 分工
- **家長可視度**: 週報 email + in-app inbox，無需打擾學習
- **中英雙語**: 介面可隨時切換

---

## 角色總覽

| 角色 | 主要任務 | 進入路徑 |
|---|---|---|
| Super Admin | 建 program / cohort / 發班碼 / 看所有 risk | `/admin` |
| Teacher | 帶班 / 發 worksheet / 追學生進度 | `/teacher` |
| Mentor | 1-on-1 審專案 / 評 rubric / 寫筆記 | `/mentor` |
| Student | 做專案 / 交 worksheet / 接受回饋 | `/student` |
| Parent | 看孩子進度 / 接收 email 更新 | `/parent` |

---

## Super Admin 指南

### 初次設定流程

1. **建 Program** — `/admin/programs` → New Program
   - 輸入名稱、描述、總課次、總時數
2. **建 Cohort** — `/admin/cohorts/new`
   - 選 Program / 起迄日 / 最大人數
3. **發 Class Code** — `/admin/class-codes`
   - 選 Cohort → Generate → 把 `CAS-INC-XXXX-YYYY` 發給家長/學生
4. **指派 Teacher / Mentor** — `/admin/cohorts/[id]` → 加 staff

### 日常監督

| 頁面 | 看什麼 |
|---|---|
| `/admin` | Overview: 學生/老師/專案/風險計數 |
| `/admin/analytics` | 圖表: 各階段分佈、專案類型餅圖、近期活動 |
| `/admin/ai-usage` | AI 用量: 每月 token、Claude 成本估算、每 route 用量 |
| `/admin/risks` | 所有 risk flags (手動 + 自動偵測) |
| `/admin/communications/queue` | 待審核的 parent updates (老師起草，你批准後才寄) |
| `/admin/projects` | 跨 cohort 專案總覽 |
| `/admin/notes` | 所有導師筆記 feed |
| `/admin/users` | 調整用戶角色 |

### 內容管理

- `/admin/curriculum` — 上傳 lesson PDF/slides
- `/admin/method-stages` — 編輯 10 階段描述、預期產出
- `/admin/project-types` — 編輯 9 種專案類型定義
- `/admin/worksheets` — 建 worksheet 範本 (schema-driven form)
- `/admin/rubrics` — 建評分 rubric
- `/admin/checkpoints` — 建 program 的 checkpoint

### 關鍵: Parent Update 審核

老師撰寫家長更新 → status=`pending_approval` → 你到 `/admin/communications/queue` 審 → Approve 才發信

### Auto Risk Detection

每日 09:00 UTC (TW 17:00) 自動偵測:
- 14 天無提交 → no_progress
- Checkpoint 卡超過 7 天 → stale_checkpoint
- 14 天無登入 → low_engagement

可在 `/admin/risks` 看結果。

---

## 教師 (Teacher) 指南

### 核心工作流

1. **早上** — `/teacher` 看 cohort 狀態 + 通知 bell
2. **帶課** — `/teacher/resources` 打開 lesson PDF / slides
3. **批 worksheet** — `/teacher/worksheets/review` 有待審 queue
   - 點進去看學生交的內容
   - **AI 生成摘要** 按鈕 → Sonnet 幫你摘出重點
   - **AI 起草回饋** 按鈕 → Haiku 寫初稿，你改
   - 選: Approve / Request Revision
4. **寫家長更新** — `/teacher/parents` → 選學生 → Compose
   - **AI Draft** 自動寫初稿
   - 儲存 → 進 super_admin 審核 queue → admin 批准後寄出
5. **Flag risk** — 學生詳情頁右上 "Flag Risk" 按鈕

### 快速指令

- 查哪些學生卡某階段 → `/teacher/projects` filter by stage
- 看特定學生所有 worksheet → `/teacher/students/[id]` (暫未實作，用 worksheets filter)

---

## 導師 (Mentor) 指南

### 核心工作流

1. **看 queue** — `/mentor/checkpoints/queue` 列待審 checkpoint
2. **審 checkpoint** — 點進去
   - 看所有必要 artifacts (worksheets + rubric)
   - 評 rubric (分數 1-5 + 評語)
   - 選: Approve / Request Revision / Escalate
3. **寫筆記** — 任何學生頁「Leave Note」按鈕
   - 類型: check_in / checkpoint_review / risk_flag / intervention / summary
   - 升級 flag: 勾「escalate to super_admin」
4. **看專案** — `/mentor/projects` 依學生篩選
5. **評 rubric** — `/mentor/rubrics/evaluate?student_id=X&rubric_id=Y`

### Mentor 最重要的事

不給答案，引導學生思考。用 Socratic 問法:
- 「你這個問題真正的使用者是誰?」
- 「如果你砍掉一半功能，還能解決問題嗎?」
- 「這個競品在哪裡做得比你好?」

---

## 學生 (Student) 指南

### 第一次登入

1. 收到老師給的 **Class Code** (格式: `CAS-INC-XXXX-YYYY`)
2. 去 https://incubator.nexhunt.xyz/join
3. 輸入 Class Code → Continue
4. 註冊帳號 (Email 或 Google)
5. 完成 **Intake** 5 步驟 (個人/目標/AI 經驗/專案想法/同意)
6. AI 會自動:
   - 分類你的專案類型
   - 產生學習畫像給老師看
   - 建好你的 project workspace

### 日常做事

| 頁面 | 做什麼 |
|---|---|
| `/student` | Dashboard — 看目前階段 + 下一個任務 |
| `/student/project` | 編輯專案內容 + 上傳截圖/demo link |
| `/student/method` | 10 階段 pipeline — 看自己在哪 |
| `/student/method/[stage]` | 做該階段的工作 + 提交審閱 |
| `/student/worksheets` | 待交 / 已交的 worksheets |
| `/student/checkpoints` | 重要里程碑 |
| `/student/resources` | 下載 lesson PDF / slides |
| `/student/showcase` | 建最終作品集 (Phase 5 才開放) |
| `/notifications` | 看老師 / mentor 回饋通知 |

### Showcase 分享

專案做完 → `/student/showcase`
- 編輯描述 / demo / slides / screenshots
- 開啟 "Public sharing" → 拿到 `/showcase/[token]` 公開連結
- 分享給家人、放進大學申請資料

---

## 家長 (Parent) 指南

### 加入連結

1. 收到 Class Code (從老師 or 孩子)
2. 去 `/join` 輸入代碼
3. 選「我是家長/監護人」
4. 填孩子姓名 → 系統自動連結

### 看孩子進度

- `/parent` — 總覽: 孩子在哪階段、進度 %
- `/parent/updates` — 老師/mentor 發來的週報 inbox
- 每封週報也會寄到你註冊的 email

### 參與但不打擾

平台設計讓你「看得到不用碰」:
- 不會收到學生交作業的 ping
- 只收重要里程碑 + mentor 關心
- 無法看到學生私密筆記 / 老師內部評論

---

## 常見問題 FAQ

### Q: 學生可以用哪個 AI?
A: 平台內建 Claude (Sonnet 4.6 用於重要決策, Haiku 4.5 用於批量)。學生也可在專案中用自己的 ChatGPT / Claude 帳號 — 教學重點是**如何有效使用 AI**，不是工具限制。

### Q: 每個專案多少學生?
A: 一學生一專案 (per cohort)。深度 > 廣度。

### Q: AI 可以直接批改嗎?
A: 不。所有批准/評分/家長通訊 **必須人類最終決定**。AI 只是 draft 助理。

### Q: 資料安全嗎?
A: 
- 密碼: Clerk 存 (業界標準加密)
- 資料: Supabase Postgres + RLS
- 檔案: Vercel Blob
- 未滿 18 歲需家長同意 (COPPA compliant)

### Q: 可以退費嗎?
A: 目前試辦階段無收費。

### Q: 可以多語言嗎?
A: 當前支援 中文 (繁) + English。語言切換在每頁右下角。

### Q: 找得到 Class Code 在哪發嗎?
A: 老師或 admin 去 `/admin/class-codes` 或 `/admin/cohorts/[id]` 看。

---

## 故障排除

### 登入後看不到任何頁面
- 檢查 email 是否在 Clerk 帳號
- 檢查 Clerk → Supabase 同步 (admin 可在 `/admin/users` 查)
- 重登入一次

### 看到「no unique or exclusion constraint」錯誤
- migration 沒跑完，聯絡 admin 跑 `/supabase/migrations/000X_*.sql`

### AI 沒回應
- 可能 ANTHROPIC_API_KEY 額度不足
- Admin 在 `/admin/ai-usage` 可看本月用量
- 失敗不會擋 UI，可手動寫

### Email 沒收到
- 檢查垃圾信
- Resend domain 須設 SPF/DKIM (admin 應在 Resend dashboard 設好)

### Public showcase 404
- 確認 public_share_enabled = true
- 確認 token 正確 (複製完整)

---

## 技術支援

- GitHub: https://github.com/nexhuntbarry/cas-incubator-os
- Email: barry.py.chuang01@gmail.com

---

## 版本歷史

- 2026-04-24 — v1.0 Phase 1-5 上線 (auth / cohort / intake / method / worksheet / rubric / checkpoint / parent updates / risk / showcase / analytics)
