# AI Feasibility Spike — v0.12.0b

> Project: 小棋童围棋闯关
> Phase: v0.12.0b — AI feasibility spike / architecture decision
> Date: 2026-06-05
> Status: Decision-grade report — ready for implementation planning

---

## 1. Product Goal and Constraints

**Target learner:** Child with about one year of Go study (roughly 10–15 kyu
equivalent). Can play full games, understands liberties, capture, escape,
basic connection/cut, and simple life-death. Needs intermediate-level
challenge, not introductory onboarding.

**Current gap:** Existing 77 problems are mostly levels 1–3 (introductory).
The child needs appropriately challenging practice and feedback at an
intermediate level. Static problem sets cannot adapt to the child's
actual skill gaps.

**Goal:** Help the child enter appropriately challenging practice faster
through AI-assisted review, coaching, or sparring.

**Operating model:** The app is primarily run **locally** to serve the
user's own child. It does not assume internet connectivity for core
features. AI should prefer local computation; external services are
opt-in only.

**Constraints:**

- AI must be **bounded, child-safe, and optional**.
- The app must continue to work without AI configuration (graceful
  fallback to existing hints and deterministic feedback).
- **Local-first by default.** No child/problem data leaves the machine
  unless the user explicitly configures an external AI provider.
- No free-form child chat in v0.12. AI interactions are triggered by
  specific actions (e.g., "请AI老师帮忙" button after a wrong answer).
- No unreviewed AI-generated content enters `src/data/problems.json`.
- No service-role key in client-side code.
- No saving AI conversation transcripts.

---

## 2. Use-Case Candidates

### 2.1 AI Review After Wrong Answer

- **Input:** problem context (board state, correct answer, child's wrong
  move), existing hint/explanation metadata.
- **Output:** Short Chinese explanation (1–3 sentences) of why the
  child's move is wrong and what concept to consider.
- **Value:** Directly addresses the "wrong answer → no insight" gap for
  intermediate learners who can benefit from conceptual explanation.
- **Risk:** Hallucinated or incorrect Go advice. Mitigated by bounding
  the prompt context and cross-referencing with the known correct answer.
- **Feasibility:** High — well-scoped input/output, bounded context.

### 2.2 AI Coach for Solved Problems

- **Input:** problem context, correct answer.
- **Output:** Short explanation of why the correct move works, focusing
  on intermediate concepts (liberties, connection/cut, life-death shape,
  direction of play).
- **Value:** Reinforces learning after correct answers; teaches the
  "why" not just the "what".
- **Risk:** Lower than wrong-answer review (correct answer is known),
  but still requires accurate Go reasoning.
- **Feasibility:** High — similar to 2.1 with lower accuracy risk.

### 2.3 AI Sparring / Opponent-Like Interaction

- **Input:** Current board state, child's move.
- **Output:** AI responds with a move on the board.
- **Value:** Provides adaptive challenge beyond static problems.
- **Risk:** Full 9×9 sparring requires a Go engine; open-ended play
  is hard to bound for child safety; latency and deployment complexity
  are significant.
- **Feasibility:** Low for v0.12 — requires a running Go engine. Defer
  to a future phase. A **bounded mini-game variant** (e.g., "capture
  race", "life-death puzzle with AI response") could be scoped later.

### 2.4 AI-Assisted Problem Authoring Pipeline

- **Input:** Category, level, concept constraints.
- **Output:** Candidate intermediate problem (board, stones, answer,
  hints) for human review.
- **Value:** Scales content creation for intermediate levels without
  manual authoring of every problem.
- **Risk:** AI-generated problems may have subtle Go errors; requires
  human review before inclusion. No unreviewed content enters the
  problem library.
- **Feasibility:** Medium — can be explored as a tool/workflow, not a
  real-time feature. Good candidate for v0.12.0e.

### 2.5 Level Calibration Assistance

- **Input:** Child's progress data (completed problems, wrong answers,
  review schedule).
- **Output:** Recommended starting level or practice focus area.
- **Value:** Solves the "defaulting into introductory content" problem.
- **Risk:** Overclaiming precise rank estimation without sufficient
  data. Better implemented as a rule-based system using existing
  progress data.
- **Feasibility:** High as rule-based; low as AI-based. Recommend
  rule-based approach for v0.12.0c.

---

## 3. Approach Comparison

### 3.1 Local Go Engine / KataGo (9×9, CPU, Reduced Playouts)

**How:** Run KataGo locally as a GTP sidecar process. Scope to 9×9
analysis only with reduced playouts (100–500 visits) for child-facing
feedback. Use KataGo's analysis engine JSON output (move rankings,
winrate, score estimation) to generate structured feedback.

| Dimension | Assessment |
|---|---|
| Go accuracy | Very high — even with reduced playouts on 9×9, KataGo far exceeds intermediate kyu level. |
| Child UX quality | Low without explanation layer — raw engine output (winrate, move rankings) is not child-friendly. Needs a translation step (rule templates or LLM). |
| Implementation effort | Medium — requires engine binary distribution, GTP/analysis engine integration, process lifecycle management. |
| Deployment complexity | Medium — KataGo Eigen (CPU) binary + neural net (~40MB for b10c128 or ~200MB for b18c384). Runs as sidecar in Docker or local process. No GPU required for 9×9 with reduced playouts. |
| Cost | Zero per-request (local compute). CPU cost: ~0.5–2 CPU cores during analysis. |
| Latency | 1–5 seconds for 9×9 with 100–500 visits on modern CPU (Eigen backend). Acceptable for button-triggered review. |
| Privacy | Perfect — all computation local; no data leaves the machine. |
| Risk of harmful output | Very low — deterministic engine output. |
| Fit for v0.12 slices | Medium for v0.12 — engine distribution and process management add complexity, but 9×9 CPU analysis is feasible for a local-first prototype. |

**CPU feasibility for 9×9:** KataGo with Eigen (CPU) backend and a
smaller network (b10c128 or b15c192) can analyze 9×9 positions in 1–5
seconds with 100–500 visits on a modern laptop CPU (Apple M1/M2, Intel
i5/i7 12th+). This is sufficient for child-facing feedback where
sub-second professional-level analysis is not required.

### 3.2 Rule-Engine + Templates

**How:** Use deterministic rules to generate explanations from problem
metadata. E.g., "你下在了 (2,3)，但正确答案是 (4,5)。这道题考的是
吃子，要注意对方的气。" Templates keyed on category, wrong move
proximity, and existing hint text.

| Dimension | Assessment |
|---|---|
| Go accuracy | High for template-covered cases — uses known correct answer and metadata. |
| Child UX quality | Medium — templated responses are functional but lack the nuance and warmth of LLM output. |
| Implementation effort | Low — no external dependencies, pure TypeScript. |
| Deployment complexity | Very low — runs in-browser, no API calls, no engine. |
| Cost | Zero. |
| Latency | Instant (local computation). |
| Privacy | Perfect — no data leaves the device. |
| Risk of harmful output | Very low — deterministic. |
| Fit for v0.12 slices | High — always-available fallback layer for v0.12.0d. |

### 3.3 Local LLM (Ollama / Small Model)

**How:** Run a small LLM locally (e.g., Ollama with qwen2.5:3b or
qwen2.5:7b) to generate child-friendly explanations. Engine analysis or
rule templates provide factual grounding; local LLM translates into
warm Chinese text.

| Dimension | Assessment |
|---|---|
| Go accuracy | Medium — LLMs can reason about simple Go positions from text but may hallucinate. Better when grounded by engine analysis or rule templates. |
| Child UX quality | High — natural, warm, age-appropriate Chinese explanations. |
| Implementation effort | Medium — requires Ollama or similar local model runtime; prompt engineering for bounded output. |
| Deployment complexity | Medium — requires ~4–8GB RAM for 3B–7B model; Ollama binary + model weights (~2–5GB). Optional; degrades gracefully if not available. |
| Cost | Zero per-request (local compute). RAM cost: 4–8GB dedicated. |
| Latency | 2–8 seconds on modern CPU (3B–7B model). Acceptable for button-triggered review. |
| Privacy | Perfect — all computation local; no data leaves the machine. |
| Risk of harmful output | Medium — mitigated by strict prompt engineering, output length bounds, and factual grounding from engine/rules. |
| Fit for v0.12 slices | Medium for v0.12 — adds value as an optional explanation layer but requires local model runtime setup. Good as an optional enhancement after engine + rules are working. |

### 3.4 External LLM API (Opt-In Only)

**How:** Send problem context to an external LLM API (OpenAI, Anthropic,
etc.) via a Next.js API route. Server-side API key; client never sees
the key.

| Dimension | Assessment |
|---|---|
| Go accuracy | Medium — same as local LLM; may hallucinate about board states. |
| Child UX quality | High — natural, warm explanations. |
| Implementation effort | Low — single API call, no engine integration. |
| Deployment complexity | Low — external API, no local engine. But requires internet and paid API key. |
| Cost | Low–Medium — ~$0.005–0.05 per request depending on model. ~$0.45–4.50/month for one child. Must recheck before implementation. |
| Latency | 1–3 seconds (network + API). |
| Privacy | Medium — sends problem context (no personal data) to external API. Not default for local-first app. |
| Risk of harmful output | Medium — mitigated by prompt engineering and output bounds. |
| Fit for v0.12 slices | Low as default — conflicts with local-first operating model. Acceptable as an **opt-in provider** for users who prefer cloud AI. |

### 3.5 Hybrid: Local Engine + Local LLM Explanation

**How:** KataGo analyzes the position (move rankings, score estimation);
local LLM translates the engine analysis into child-friendly Chinese
explanation. Rule templates provide fallback when either component is
unavailable.

| Dimension | Assessment |
|---|---|
| Go accuracy | Very high — engine provides ground truth. |
| Child UX quality | Very high — engine accuracy + LLM warmth. |
| Implementation effort | High — requires both engine and LLM integration. |
| Deployment complexity | High — engine binary + neural net + Ollama runtime + model weights. Both optional; degrades gracefully. |
| Cost | Zero per-request (local compute). Infrastructure: ~8–12GB RAM for both. |
| Latency | 2–8 seconds (engine analysis + LLM generation). |
| Privacy | Perfect — all computation local; no data leaves the machine. |
| Risk of harmful output | Very low — engine provides factual grounding; LLM translates. |
| Fit for v0.12 slices | Medium for v0.12 — best long-term direction. Can be built incrementally: engine first, LLM explanation as optional enhancement. |

### 3.6 Human-Reviewed AI-Assisted Content Pipeline

**How:** AI generates candidate intermediate problems; human reviews and
approves before inclusion in `src/data/problems.json`.

| Dimension | Assessment |
|---|---|
| Go accuracy | Medium — AI may produce subtle errors; human review catches most. |
| Child UX quality | High — reviewed content meets quality bar. |
| Implementation effort | Medium — tooling for generation + review workflow. |
| Deployment complexity | Low — offline process, no runtime AI. |
| Cost | Medium — LLM API per generated problem, but amortized over many sessions. |
| Latency | N/A — not a real-time feature. |
| Privacy | High — no runtime data sent externally. |
| Risk of harmful output | Low — human review before inclusion. |
| Fit for v0.12 slices | Good for v0.12.0e — content expansion or pipeline design. |

### Comparison Summary

| Approach | Go accuracy | Child UX | Effort | Deploy | Cost | Latency | Privacy | Harmful risk | v0.12 fit |
|---|---|---|---|---|---|---|---|---|---|
| Local engine (9×9 CPU) | Very high | Low (needs translation) | Medium | Medium | Zero | 1–5s | Perfect | Very low | Medium |
| Rule + templates | High | Medium | Low | Very low | Zero | Instant | Perfect | Very low | High (always) |
| Local LLM (Ollama) | Medium | High | Medium | Medium | Zero | 2–8s | Perfect | Medium | Medium (optional) |
| External LLM (opt-in) | Medium | High | Low | Low | Low–Med | 1–3s | Medium | Medium | Low (opt-in) |
| Hybrid engine + local LLM | Very high | Very high | High | High | Zero | 2–8s | Perfect | Very low | Medium (incremental) |
| AI content pipeline | Medium | High | Medium | Low | Medium | N/A | High | Low | Good (slice 4) |

---

## 4. Deployment and Runtime Options

### Option A: Local Go Engine as GTP Sidecar

- Run KataGo as a child process alongside the Next.js app.
- Use KataGo's analysis engine JSON API for position analysis.
- Engine binary + neural net distributed with the app or downloaded
  on first use.
- Docker: add KataGo binary and model to the Docker image, or mount
  as a volume.
- **Preferred for local-first architecture.** Feasible for 9×9
  analysis on CPU with reduced playouts.

### Option B: Local LLM via Ollama

- Run Ollama locally with a small model (qwen2.5:3b or 7b).
- Next.js API route calls Ollama's local HTTP API.
- Optional — if Ollama is not running, fall back to rule templates.
- Docker: Ollama runs as a separate container or host process.
- **Optional enhancement layer** — not required for v0.12.0d MVP.

### Option C: Rule/Template Engine (Always Available)

- Pure TypeScript, runs in-browser and server-side.
- No external process, no API, no model weights.
- Always available as the guaranteed fallback.
- **Required baseline** — implemented first, always works.

### Option D: External LLM API (Opt-In Adapter)

- Next.js API route (`/api/ai-review`) proxies to external LLM API.
- API key stored server-side only (`AI_API_KEY`, not `NEXT_PUBLIC_`).
- Only used when user explicitly configures an external provider.
- **Not the default** — opt-in for users who prefer cloud AI and
  accept the privacy tradeoff.

### Environment and Missing-Config Behavior

- New env var: `AI_API_KEY` (server-side, opt-in external LLM only).
- New env var: `AI_ENGINE_PATH` (optional, path to KataGo binary).
- New env var: `AI_OLLAMA_URL` (optional, Ollama API URL, default
  `http://localhost:11434`).
- If no AI configuration exists, the app uses rule/template hints
  only — fully functional, no data leaves the machine.
- Docker Compose reads `.env.local` via existing `env_file` mechanism.

### Layered Architecture

```
┌─────────────────────────────────────┐
│  AI Review Request (wrong answer)    │
├─────────────────────────────────────┤
│  1. Rule/template coach (always)     │  ← guaranteed fallback
│  2. Local engine analysis (if KataGo)│  ← optional, local
│  3. Local LLM explanation (if Ollama)│  ← optional, local
│  4. External LLM (if API key)        │  ← optional, opt-in
└─────────────────────────────────────┘
```

Each layer is optional. Layer 1 is always available. Layers 2–4 are
enabled by their respective configuration. If a higher layer fails or
times out, the next available lower layer is used.

---

## 5. Cost and Latency Model

### Local Engine (KataGo CPU, 9×9)

| Resource | Estimate |
|---|---|
| CPU | 0.5–2 cores during analysis |
| RAM | ~200–500MB (engine + neural net) |
| Disk | ~40MB (b10c128 net) or ~200MB (b18c384 net) |
| Latency | 1–5 seconds per 9×9 analysis (100–500 visits) |
| Per-request cost | Zero (local compute) |

### Local LLM (Ollama, 3B–7B model)

| Resource | Estimate |
|---|---|
| CPU | 2–4 cores during generation |
| RAM | ~4GB (3B model) or ~8GB (7B model) |
| Disk | ~2GB (3B model) or ~5GB (7B model) |
| Latency | 2–8 seconds per response |
| Per-request cost | Zero (local compute) |

### External LLM API (Opt-In Only)

| Provider | Model | Est. per request | Monthly cost (90 req) |
|---|---|---|---|
| OpenAI | gpt-4o-mini | ~$0.005 | ~$0.45 |
| OpenAI | gpt-4o | ~$0.05 | ~$4.50 |
| Anthropic | claude-3.5-haiku | ~$0.01 | ~$0.90 |

> **Note:** Pricing above is approximate and must be rechecked before
> implementation.

### Assumptions

- One child using the app for daily practice (10 problems per session).
- AI review requested on ~30% of problems (3 requests per session).
- 1 session per day, 30 sessions per month = ~90 AI requests/month.

### Latency Targets

- **Target:** < 5 seconds from button press to displayed explanation.
- **Rule/template:** Instant.
- **Local engine:** 1–5 seconds (9×9, CPU, reduced playouts).
- **Local LLM:** 2–8 seconds.
- **External LLM:** 1–3 seconds (plus network).
- **Timeout:** If any layer takes > 8 seconds, fall back to the next
  available lower layer.

### Fallback Behavior

- No AI configuration → rule/template hints only (always works).
- Engine unavailable → skip engine analysis; use rule/templates.
- Engine timeout (> 8s) → fall back to rule/templates.
- Local LLM unavailable → use engine analysis + rule templates.
- External LLM unavailable → fall back to local layers.
- Any AI error → display rule/template hint, show "AI暂时不可用" if
  the child had requested AI review.

---

## 6. Privacy and Safety Constraints

- **No data leaves the machine by default.** All local AI computation
  (engine analysis, local LLM) stays on the user's machine.
- **External AI is opt-in only.** If the user configures an external
  LLM API key, problem context (not personal data) is sent to that
  provider. The UI must clearly indicate when external AI is active.
- **Do not send child personal data.** Only send: board state (stone
  positions), correct answer coordinates, child's move coordinates,
  problem category, and problem-level metadata.
- **No free-form personal conversation.** AI interactions are bounded
  to problem review context. The system prompt rejects off-topic input.
- **Bound AI output length.** Maximum 150 Chinese characters per
  response. Truncate longer responses.
- **Bound AI output format.** System prompt specifies: explanation only,
  no questions to the child, no external links, no rank claims.
- **Require fallback.** If AI fails, falls back to deterministic
  template-based hints.
- **Separate AI suggestion from canonical answer.** AI explanation is
  labeled as "AI建议" and never overrides the problem's official correct
  answer.
- **No service-role key in client-side code.** External AI API key is
  server-side only.
- **No saving AI conversation transcripts.** AI responses are displayed
  once and not persisted.
- **Log AI errors locally only.** For debugging, log request metadata
  (problem ID, response status) server-side without child personal data.

---

## 7. Child-Appropriate UX Constraints

- **Short Chinese explanations.** 1–3 sentences, ≤150 characters.
  Suitable for a 7–9 year old who has studied Go for one year.
- **Focus on concrete Go concepts.** Explain one key idea per response:
  liberties, connection, cut, eye shape, atari, capture direction,
  reading depth. Not vague encouragement ("加油！").
- **One key idea at a time.** Do not overwhelm with multiple concepts.
  If the mistake involves multiple issues, explain the most important
  one.
- **Avoid rank claims.** Never say "这是初学者的错误" or "你应该达到X级".
- **Avoid harsh criticism.** Never say "你下错了" or "这步棋很糟糕".
  Use constructive framing: "试试看这里……" or "注意这边的气……".
- **Avoid excessive text.** If the explanation cannot fit in 150
  characters, truncate and suggest looking at the hint instead.
- **Button-triggered, not automatic.** Show a "请AI老师帮忙" button
  after wrong answers. Child chooses whether to request AI review.
- **Keep existing practice flow usable without AI.** AI review is an
  optional enhancement, not a required step.

---

## 8. Recommended Architecture Decision

**Local-first Go AI / rule-assisted coach, with optional local LLM
explanation; external LLM only as an opt-in adapter.**

### Why this option

1. **Aligns with the operating model.** The app runs locally for the
   user's own child. Local-first AI respects this: no data leaves the
   machine by default, no internet dependency, no per-request cost.
2. **Rule/template baseline is always available.** Even without any
   AI engine or model, the app provides deterministic, useful hints.
   The product is never broken by missing AI configuration.
3. **KataGo 9×9 CPU analysis is feasible.** With a smaller network
   (b10c128 or b15c192) and reduced playouts (100–500 visits), KataGo
   can analyze 9×9 positions in 1–5 seconds on a modern laptop CPU.
   This exceeds intermediate kyu-level accuracy by a wide margin.
4. **Local LLM is an optional enhancement.** If the user has Ollama
   running, the app can use a small local model to translate engine
   analysis into warm Chinese explanations. If not, rule templates
   suffice.
5. **External LLM is opt-in, not default.** Users who prefer cloud
   AI can configure an API key, but this is not the recommended path
   for the current deployment model.
6. **Incremental delivery.** Each layer can be built and shipped
   independently:
   - v0.12.0d: rule/template coach + local engine integration.
   - Later: local LLM explanation layer.
   - Later: external LLM opt-in adapter.

### What this means for v0.12.0d

- New module: `src/lib/ai-review.ts` — orchestrates AI review with
  layered fallback (rules → engine → LLM).
- Rule/template coach: deterministic explanations from problem metadata
  (always available, pure TypeScript).
- Local engine integration: communicate with KataGo via GTP or analysis
  engine JSON API. Optional — if engine binary is not available, skip
  to rules.
- New env vars: `AI_ENGINE_PATH` (optional, path to KataGo binary).
- Fallback: rule/template hints when engine is unavailable.
- No external API dependency. No API key required.

### What is deferred

- Local LLM explanation layer (optional enhancement after v0.12.0d).
- External LLM opt-in adapter (optional for users who prefer cloud AI).
- AI sparring / opponent play (future, requires engine + game loop).
- AI-assisted problem authoring pipeline (v0.12.0e, offline workflow).

---

## 9. Proposed Next Implementation Slice

### v0.12.0c — Level Calibration / Intermediate Challenge Entry

**Goal:** Detect when a child has progressed beyond introductory levels
and adjust the starting level for daily practice, avoiding default
placement into level-1 content.

**Expected files:**

- `src/lib/practice.ts` — add level calibration logic based on existing
  progress data (completed/mastered problem IDs, level distribution).
- `src/app/practice/page.tsx` — surface level calibration result (e.g.,
  "中级练习" label when the child is above introductory level).
- `src/__tests__/practice.test.ts` — tests for level calibration.

**Non-goals:**

- No AI integration (that comes in v0.12.0d).
- No new pages or navigation.
- No changes to problem data or schemas.
- No Supabase/server-side changes.

**Acceptance criteria:**

- Practice page detects when the child has progressed beyond
  introductory levels and adjusts selection accordingly.
- Children with significant progress are not defaulted into level-1
  content.
- Existing selection behavior unchanged for introductory-level children.
- `npm run test`, `npm run build` pass.

**Validation commands:**

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```
