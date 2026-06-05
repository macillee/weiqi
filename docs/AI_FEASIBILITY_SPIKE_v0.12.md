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

**Constraints:**

- AI must be **bounded, child-safe, and optional**.
- The app must continue to work without AI configuration (graceful
  fallback to existing hints and deterministic feedback).
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
- **Feasibility:** Low for v0.12 — requires a running Go engine, which
  is a major infrastructure addition. Defer to a future phase. A
  **bounded mini-game variant** (e.g., "capture race", "life-death
  puzzle with AI response") could be scoped later.

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

### 3.1 LLM-Only Explanation Layer

**How:** Send problem context + child's move to an LLM API (e.g.,
OpenAI, Anthropic, or local model) with a strict system prompt that
bounds the output to Go-specific explanations.

| Dimension | Assessment |
|---|---|
| Go accuracy | Medium — LLMs can reason about simple Go positions from text descriptions but may hallucinate about board states. Accuracy drops for complex positions. |
| Child UX quality | High — LLMs can generate natural, warm, age-appropriate Chinese explanations. |
| Implementation effort | Low — single API call, no engine integration. |
| Deployment complexity | Low — external API, no local engine. |
| Cost | Low–Medium — ~$0.01–0.03 per request (GPT-4o-mini class); ~$0.05–0.15 per request (GPT-4o class). Must recheck before implementation. |
| Latency | 1–3 seconds (external API). Acceptable for button-triggered review. |
| Privacy | Medium — sends problem context (no personal data) to external API. |
| Risk of harmful output | Medium — mitigated by strict prompt engineering and output length bounds. |
| Fit for v0.12 slices | High — can be implemented in v0.12.0d prototype. |

### 3.2 Go Engine / KataGo / GTP-Backed Analysis

**How:** Run KataGo (or similar GTP engine) locally or server-side to
analyze positions. Use engine output (winrate, score, move rankings) to
generate deterministic feedback.

| Dimension | Assessment |
|---|---|
| Go accuracy | Very high — professional-level analysis. |
| Child UX quality | Low without LLM layer — raw engine output (winrate deltas, move rankings) is not child-friendly. |
| Implementation effort | High — requires engine binary, neural net, GTP or analysis engine integration, resource management. |
| Deployment complexity | Very high — KataGo requires GPU or CPU with AVX2, ~200MB+ neural net, Docker integration. |
| Cost | Low per-request (local compute), but high infrastructure cost (GPU server or significant CPU). |
| Latency | 0.5–5 seconds for 9×9 analysis (depends on hardware and playouts). |
| Privacy | High — all computation local; no data sent externally. |
| Risk of harmful output | Very low — deterministic engine output. |
| Fit for v0.12 slices | Low for v0.12 — infrastructure cost too high for a prototype. Better as a future enhancement. |

### 3.3 Rule-Engine + Templates

**How:** Use deterministic rules to generate explanations from problem
metadata. E.g., "你下在了 (2,3)，但正确答案是 (4,5)。这道题考的是
吃子，要注意对方的气。" Templates keyed on category, wrong move
proximity, and existing hint text.

| Dimension | Assessment |
|---|---|
| Go accuracy | High for template-covered cases — uses known correct answer and metadata. |
| Child UX quality | Medium — templated responses are functional but lack the nuance and warmth of LLM output. |
| Implementation effort | Low — no external dependencies, pure TypeScript. |
| Deployment complexity | Very low — runs in-browser, no API calls. |
| Cost | Zero. |
| Latency | Instant (local computation). |
| Privacy | Perfect — no data leaves the device. |
| Risk of harmful output | Very low — deterministic. |
| Fit for v0.12 slices | High as a fallback layer for v0.12.0d. |

### 3.4 Hybrid Engine + LLM Explanation

**How:** KataGo analyzes the position (move rankings, score estimation);
LLM translates the engine analysis into child-friendly Chinese
explanation.

| Dimension | Assessment |
|---|---|
| Go accuracy | Very high — engine provides ground truth. |
| Child UX quality | Very high — engine accuracy + LLM warmth. |
| Implementation effort | Very high — requires both engine and LLM integration. |
| Deployment complexity | Very high — engine infrastructure + external API. |
| Cost | High — engine compute + LLM API per request. |
| Latency | 2–8 seconds (engine analysis + LLM generation). |
| Privacy | Medium — sends engine output + problem context to LLM API. |
| Risk of harmful output | Low — engine provides factual grounding; LLM translates. |
| Fit for v0.12 slices | Low for v0.12 — too complex for a prototype. Best long-term direction. |

### 3.5 Human-Reviewed AI-Assisted Content Pipeline

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
| LLM-only | Medium | High | Low | Low | Low–Med | 1–3s | Medium | Medium | High |
| Engine (KataGo) | Very high | Low | High | Very high | High infra | 0.5–5s | High | Very low | Low |
| Rule + templates | High | Medium | Low | Very low | Zero | Instant | Perfect | Very low | High (fallback) |
| Hybrid engine + LLM | Very high | Very high | Very high | Very high | High | 2–8s | Medium | Low | Low |
| AI content pipeline | Medium | High | Medium | Low | Medium | N/A | High | Low | Good (slice 4) |

---

## 4. Deployment and Runtime Options

### Option A: Client-Side LLM API Call

- Frontend calls LLM API directly from the browser.
- Requires `NEXT_PUBLIC_AI_API_KEY` env var.
- Simplest implementation but exposes API key in browser.
- **Not recommended** — API key exposure is a security risk for a
  child-facing product.

### Option B: Server-Side API Route (Next.js)

- Next.js API route (`/api/ai-review`) proxies LLM API calls.
- API key stored server-side only (not in `NEXT_PUBLIC_` var).
- Problem context sent from client; server adds system prompt and calls
  LLM; returns bounded response.
- Preserves local anonymous mode: if AI env var is not configured, the
  API route returns a "not configured" response and the UI falls back
  to deterministic hints.
- **Recommended for v0.12.0d prototype.**

### Option C: External API Provider

- Use a hosted Go analysis API (if available) or LLM API directly.
- Similar to Option B but may use a specialized Go analysis service.
- No such service currently exists for child-friendly Go explanations.
- **Not viable for v0.12** — no suitable provider exists.

### Option D: Local Engine Process / GTP Sidecar

- Run KataGo as a sidecar process in Docker.
- High accuracy but very high deployment complexity.
- Not compatible with the current lightweight Docker setup.
- **Defer to future phase** after v0.12 validates the AI direction.

### Environment and Missing-Config Behavior

- New env var: `AI_API_KEY` (server-side only, no `NEXT_PUBLIC_` prefix).
- Optional: `AI_API_BASE_URL` for custom API endpoints.
- If `AI_API_KEY` is not configured, AI review UI is hidden and the
  app falls back to deterministic hints.
- Local anonymous mode continues to work without any AI configuration.
- Docker Compose reads `.env.local` via existing `env_file` mechanism.

---

## 5. Cost and Latency Model

### Assumptions

- One child using the app for daily practice (10 problems per session).
- AI review requested on ~30% of problems (3 requests per session).
- 1 session per day, 30 sessions per month = ~90 AI requests/month.

### Cost Estimate

| Provider | Model | Cost per 1K tokens (input) | Cost per 1K tokens (output) | Est. per request | Monthly cost (90 req) |
|---|---|---|---|---|---|
| OpenAI | gpt-4o-mini | $0.15 | $0.60 | ~$0.005 | ~$0.45 |
| OpenAI | gpt-4o | $2.50 | $10.00 | ~$0.05 | ~$4.50 |
| Anthropic | claude-3.5-haiku | $0.80 | $4.00 | ~$0.01 | ~$0.90 |
| Local (Ollama) | qwen2.5:7b | Free | Free | $0 | $0 |

> **Note:** Pricing above is approximate as of June 2025 and must be
> rechecked before implementation. Local model (Ollama) requires
> significant local compute (~8GB RAM for 7B model).

### Latency Targets

- **Target:** < 3 seconds from button press to displayed explanation.
- **LLM API:** 1–3 seconds typical (depending on provider and model).
- **Fallback:** If AI response takes > 5 seconds, show deterministic
  hint instead and log a timeout.

### Fallback Behavior

- AI unavailable → fall back to existing hint system.
- AI timeout (> 5s) → show deterministic hint, display "AI暂时不可用".
- AI returns unparseable output → fall back to deterministic hint.
- AI not configured → hide AI review button entirely.

---

## 6. Privacy and Safety Constraints

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
- **No service-role key in client-side code.** AI API key is server-side
  only.
- **No saving AI conversation transcripts.** AI responses are displayed
  once and not persisted.
- **Log AI errors server-side only.** For debugging, log request
  metadata (problem ID, response status) without child personal data.

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

**Option A: Bounded LLM explanation layer with rule/template fallback.**

### Why this option

1. **Fastest path to child-facing value.** LLM explanations are warm,
   natural, and conceptually appropriate for intermediate learners.
   A single API route can deliver the v0.12.0d prototype.
2. **Rule/template fallback eliminates hard dependency.** If AI is
   unavailable, slow, or misconfigured, the app falls back to
   deterministic hints. The product is never broken by AI failure.
3. **Low deployment cost.** No Go engine, no GPU, no sidecar process.
   A single Next.js API route and an optional API key.
4. **Cost is manageable at low volume.** ~$0.45–4.50/month for one
   child using gpt-4o-mini or gpt-4o. Free with local models.
5. **Privacy is acceptable.** Only problem context (no personal data)
   is sent to the LLM API. Server-side API route keeps the key secure.
6. **Feasibility spike validates the approach.** If LLM explanations
   prove too inaccurate for Go positions, the rule/template fallback
   ensures the product still works. The hybrid engine+LLM direction
   remains available as a future upgrade.

### What this means for v0.12.0d

- New Next.js API route: `src/app/api/ai-review/route.ts`.
- New module: `src/lib/ai-review.ts` — constructs prompt from problem
  context, calls API route, parses and validates response.
- Server-side: API route holds the LLM API key, adds system prompt,
  calls LLM provider, validates and bounds the response.
- Client-side: "请AI老师帮忙" button after wrong answer → calls API
  route → displays response or falls back to deterministic hint.
- New env vars: `AI_API_KEY` (server-side only), `AI_API_BASE_URL`
  (optional).
- Fallback: deterministic template-based hints when AI is unavailable.

### What is deferred

- KataGo / GTP engine integration (future, after v0.12 validates the
  AI direction).
- AI sparring / opponent play (future, requires engine).
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
