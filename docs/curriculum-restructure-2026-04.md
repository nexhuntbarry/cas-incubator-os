# Curriculum Restructure — 2026-04

Plan B: keep 20 lessons total. Insert a new technical-readiness lesson before the first build sprint, and merge the final two lessons into one closing showcase.

## Goals

- Teach AI tools, LLM/token concept, and CAS install/setup BEFORE the first prototype (current L11).
- Move token mechanics out of the post-Sprint-2 lesson and into the pre-build technical lesson.
- Keep total lesson count at 20 (no schedule disruption).

## Lesson Map (Old → New)

| Old | New | Title (EN) | Title (ZH) | Change |
|----:|----:|---|---|---|
| 1 | 1 | Program Launch — What Makes a Strong Project? | 課程啟動：什麼是好的專案 | unchanged |
| 2 | 2 | Design Thinking and Finding a Real Problem | 設計思考與發現真實問題 | unchanged |
| 3 | 3 | Interest Mapping and Opportunity Areas | 興趣盤點與機會領域 | unchanged |
| 4 | 4 | User, Stakeholder, and Context Definition | 使用者、利害關係人與情境定義 | unchanged |
| 5 | 5 | Existing Solutions and Competitive Landscape | 既有解決方案與競品分析 | unchanged |
| 6 | 6 | Value Proposition and Project Positioning | 價值主張與專案定位 | unchanged |
| 7 | 7 | From Big Idea to MVP | 從大想法到 MVP | unchanged |
| — | **8** | **AI Tools, LLMs, Tokens & CAS Setup** | **AI 工具、LLM、Token 與 CAS 安裝** | **NEW** |
| 8 | 9 | Prompting for Serious Project Work | 為專案工作而設計的 Prompt | shifted |
| 9 | 10 | User Flow and System Logic | 使用者流程與系統邏輯 | shifted |
| 10 | 11 | Wireframe / Architecture Planning | 線框稿與系統架構規劃 | shifted |
| 11 | 12 | CAS Build Sprint 1 | CAS 第一次建構衝刺 | shifted |
| 12 | 13 | Self-Test, Debug, and Diagnose | 自我測試、除錯與診斷 | shifted |
| 13 | 14 | Structured Peer Review | 結構化同儕互評 | shifted |
| 14 | 15 | Turn Feedback into Revision Goals | 把回饋轉為修訂目標 | shifted |
| 15 | 16 | CAS Build Sprint 2 | CAS 第二次建構衝刺 | shifted |
| 16 | 17 | **Model Comparison and AI Efficiency** | **模型比較與 AI 效率** | token portion moved to new L8 |
| 17 | 18 | Strengthen Clarity, Feature Priorities, and UX | 強化清晰度、功能優先序與 UX | shifted |
| 18 | 19 | Build the Project Story | 打造專案故事 | shifted |
| 19+20 | **20** | **Rehearsal, Showcase, and Mentor Review** | **預演、成果展示與導師回饋** | merged |

## Stage Mapping (lesson → method-stage)

| New Lesson | Stage |
|---:|---:|
| 1, 2 | 1 |
| 3, 4 | 2 |
| 5, 6 | 3 |
| 7, 8 | 4 |
| 9 | 5 |
| 10, 11 | 6 |
| 12, 13 | 7 |
| 14, 15 | 8 |
| 16, 17, 18, 19 | 9 |
| 20 | 10 |

---

## New Lesson 8 — AI Tools, LLMs, Tokens & CAS Setup

### English

**Description.** Students learn what AI tools are, how large language models work at a basic level, what tokens are and why they cost money and time, and how to set up CAS — installation, sign-in, project creation, and basic interface navigation. This lesson removes the technical mystery around AI before students attempt their first prototype, ensuring everyone arrives at the next build sprint with a working environment and a shared mental model. Students leave able to log into CAS, create a project, send a basic structured request, and explain in plain language what a token is and why prompts matter.

**Activities.**

| Minutes | Activity | Description |
|---:|---|---|
| 0–10 | Warm-Up | What do you think happens when you type a message into an AI tool? |
| 10–25 | Mini Lesson | LLMs in plain language — input → tokens → prediction → output. What a token is. Why tokens cost money and time. |
| 25–40 | AI Tools Landscape | Overview of common AI tools (chat, image, code) and where CAS fits. |
| 40–60 | CAS Hands-On Setup | Install or access CAS, sign in, create first project, tour the interface. |
| 60–75 | First Conversation | Each student sends one structured request to CAS and observes token count and output. |
| 75–85 | Reflection | What surprised you? Where could you waste tokens? Where is CAS most useful for your project? |
| 85–90 | Exit Ticket | Define "token" in one sentence + show one screenshot proving CAS is set up. |

**Outputs.** CAS account active, first project created, one screenshot saved, one-sentence token definition submitted.

### 中文

**說明。** 學生學習 AI 工具是什麼、大型語言模型（LLM）的基本運作方式、token 是什麼、為什麼 token 會耗費金錢與時間，以及如何安裝與設定 CAS — 包含安裝/登入、建立第一個專案、熟悉介面操作。這堂課在學生進入第一個 prototype 前，先去除 AI 的技術神祕感，確保所有人到下一堂建構衝刺時都已備好環境並具備共同心智模型。學生上完這課應該能登入 CAS、建立專案、送出一個結構化請求，並用白話解釋什麼是 token、為什麼 prompt 寫法很重要。

**活動。**

| 分鐘 | 活動 | 說明 |
|---:|---|---|
| 0–10 | 暖身 | 你輸入一段話到 AI 工具時，背後發生什麼事？ |
| 10–25 | 小講授 | 用白話說 LLM：輸入 → token → 預測 → 輸出。token 是什麼、為什麼會耗費金錢與時間。 |
| 25–40 | AI 工具地圖 | 常見 AI 工具（對話、影像、程式碼）總覽，以及 CAS 的定位。 |
| 40–60 | CAS 實機設定 | 安裝或開啟 CAS、登入、建立第一個專案、巡覽介面。 |
| 60–75 | 第一次對話 | 每位學生送出一個結構化請求並觀察 token 用量與輸出。 |
| 75–85 | 反思 | 哪些地方令你意外？哪些做法會浪費 token？CAS 對你的專案最有用在哪？ |
| 85–90 | 離場票 | 用一句話定義 token + 提交一張 CAS 已設定完成的截圖。 |

**產出。** CAS 帳號可登入、第一個專案已建立、一張截圖、一句 token 定義。

---

## Revised Lesson 17 — Model Comparison and AI Efficiency

Token mechanics moved to new L8. This lesson now focuses on model selection and workflow efficiency.

### English

**Description.** Token mechanics were covered in L8. This lesson focuses on choosing the right model for the job, comparing outputs across models, and improving efficiency through better prompting and reuse. Students compare cost-vs-quality tradeoffs and refine their workflows after Build Sprint 2.

**Activities.**

| Minutes | Activity | Description |
|---:|---|---|
| 0–10 | Warm-Up | Which model did you use most in Sprint 2 and why? |
| 10–25 | Mini Lesson | Model differences — speed, cost, quality, context length. When to use which. |
| 25–50 | Side-by-Side Comparison | Run the same prompt across two models and document differences. |
| 50–70 | Efficiency Audit | Identify wasted prompts/tokens in your own build history. |
| 70–85 | Workflow Refinement | Rewrite your core project prompts for efficiency and reuse. |
| 85–90 | Exit Ticket | One concrete change you will make to reduce token usage without losing quality. |

### 中文

**說明。** token 機制已於 L8 教過，本課聚焦在「選對模型」與「工作流效率」。學生比較成本對品質的取捨，並在 Sprint 2 後優化自己的工作流。

**活動。**

| 分鐘 | 活動 | 說明 |
|---:|---|---|
| 0–10 | 暖身 | Sprint 2 你最常用哪個模型？為什麼？ |
| 10–25 | 小講授 | 模型差異：速度、成本、品質、context 長度，何時該選哪個。 |
| 25–50 | 並排比較 | 用同一段 prompt 跑兩個模型，記錄差異。 |
| 50–70 | 效率盤查 | 在自己過去的建構紀錄裡找出浪費的 prompt / token。 |
| 70–85 | 工作流優化 | 把核心專案 prompt 重寫，使其更有效率、可重用。 |
| 85–90 | 離場票 | 寫下一項具體做法，能在不失品質下降低 token 用量。 |

---

## Merged Lesson 20 — Rehearsal, Showcase, and Mentor Review

Old L19 (Rehearsal, Reflection, Portfolio Framing) merged with old L20 (Showcase and Mentor Review).

### English

**Description.** Students rehearse delivery, run a final dress rehearsal with peers, then present to mentors, parents, or judges in a showcase. They incorporate last-round feedback, capture portfolio assets, and reflect on the full journey from interest mapping to final delivery.

**Activities.**

| Minutes | Activity | Description |
|---:|---|---|
| 0–15 | Final Rehearsal | Timed dry run with peer partner. |
| 15–25 | Last Adjustments | Refine 1–2 weak spots flagged by partner. |
| 25–65 | Showcase Presentations | Each student presents to mentors and audience. |
| 65–80 | Mentor Q&A | Structured feedback from mentors. |
| 80–90 | Closing Reflection + Portfolio Capture | Final written reflection, screenshots, links archived. |

### 中文

**說明。** 學生先彩排、再與夥伴正式預演，最後對導師、家長或評審進行成果展示。納入最後一輪回饋、收集 portfolio 素材，並反思從興趣盤點到最終交付的完整歷程。

**活動。**

| 分鐘 | 活動 | 說明 |
|---:|---|---|
| 0–15 | 最終彩排 | 與夥伴計時正式跑一次。 |
| 15–25 | 最後調整 | 針對夥伴指出的 1–2 個弱點修正。 |
| 25–65 | 成果展示 | 每位學生對導師與觀眾進行簡報。 |
| 65–80 | 導師 Q&A | 結構化回饋。 |
| 80–90 | 結業反思 + Portfolio 收集 | 最終書面反思、截圖、連結存檔。 |

---

## Implementation Steps

1. Update `lib/curriculum/lesson-to-stage.ts` with the new mapping above.
2. Create migration `0017_curriculum_restructure_2026_04.sql`:
   - Insert new L8 (AI Tools, LLMs, Tokens & CAS Setup).
   - Re-number existing L8–L18 to L9–L19 (`UPDATE curriculum_assets SET lesson_number = lesson_number + 1 WHERE program_id = … AND lesson_number BETWEEN 8 AND 18`).
   - Replace L17 (was L16) content with token-stripped version.
   - Merge old L19 + L20 into new L20.
3. Update i18n messages for new/changed lesson titles + descriptions (EN + ZH).
4. Verify worksheet assignments (`worksheet_assignments`) and rubric/checkpoint references still resolve after renumber.
5. Smoke-test teacher teaching-mode page at `/teacher/teaching-mode/[lesson_number]` for L8, L17, L20.
