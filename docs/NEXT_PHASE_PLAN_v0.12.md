# v0.12 — Next Phase Plan: AI-First Intermediate Progression

> Project: 小棋童围棋闯关
> Phase: v0.12.0a — planning
> Date: 2026-06-05
> Status: Planning complete — ready for implementation

---

## 1. Current Baseline

v0.11 completed deployment hardening. The product now has:

- **77 problems** (68 single-step + 9 multi-step), all wired into 6
  chapters across 5 difficulty levels.
- **Daily-practice skill filtering** (v0.10): category-balanced
  selection, level clamping, spaced review priority, wrong-problem
  priority, and multi-step eligibility gating.
- **Deployment hardening** (v0.11): Docker Compose reads optional
  `.env.local`, CI verifies Docker build, deployment documentation is
  current.
- **Optional Supabase backend**: auth, child profiles, server progress
  sync, and local import already implemented (v0.2.1–v0.2.4).
- **UX polish** (v0.6): Chinese board labels, celebration animations,
  audio feedback, progressive hint cards with board markers.
- **Infrastructure** (v0.9): CI with 6 gates (lint/typecheck/unit/build/
  E2E/Docker), 6 E2E smoke tests.

### Core product constraint

The target child has studied Go for about one year. Current introductory
problems (levels 1–2) are no longer a good fit. The primary gap is
**stage/level mismatch** — the child needs appropriately challenging
intermediate learning, not more beginner onboarding or UI polish around
existing introductory content.

- Existing 77 introductory problems are baseline/foundation, not the
  main growth path.
- Future public-user beginner onboarding can be improved later.
- v0.12 prioritizes the current child's real stage over generic beginner
  guidance.

---

## 2. Candidate Direction Evaluation

### A. AI-First Intermediate Progression / AI Coach & Sparring

**Strengths:**

- Directly addresses the core product gap: stage/level mismatch for a
  one-year learner.
- AI review can explain mistakes and alternatives in solved/wrong
  problems — conceptually appropriate for intermediate learning
  (reading, liberties, connection/cut, life-death shape, direction of
  play).
- AI sparring provides adaptive challenge that static problems cannot.
- User preference is clearly AI-oriented.
- Feasibility spike as a first slice reduces risk before full
  commitment.
- Compatible with existing problem library (AI review works on any
  problem).

**Weaknesses / Risks:**

- External API dependency (cost, availability, data privacy).
- Latency and quality control for child-safe, age-appropriate AI
  output.
- Not all AI approaches are suitable for 7–9 year olds; output must
  be filtered and bounded.
- Larger slice scope than pure UI changes.
- Requires careful evaluation before full commitment (feasibility spike
  is mandatory).

**Estimated Slice Count:** 4–5 (including feasibility spike and
stabilization)

**Verdict:** Primary direction — directly addresses the core product
gap (stage mismatch) and aligns with user preference for AI-oriented
intermediate learning.

---

### B. Practice Explainability / Child-Facing Learning UX

**Strengths:**

- Low technical risk — UI-only changes.
- Leverages v0.10 selection algorithm rationale.

**Weaknesses / Risks:**

- Does not address the core product gap: stage/level mismatch.
- Adding UI context around 77 introductory problems does not solve the
  problem that the child needs appropriately challenging intermediate
  content.
- Marginal impact for a one-year learner who has already outgrown
  introductory-level practice.
- Better suited as a future polish item after the core learning path
  is addressed.

**Estimated Slice Count:** 3–4

**Verdict:** Defer — does not address the core gap. Can be bundled with
a future UX polish phase after the intermediate learning path is
established.

---

### C. Content Expansion Beyond 77 Problems

**Strengths:**

- Tangible variety increase.
- Proven content-authoring process from v0.4/v0.5/v0.7.

**Weaknesses / Risks:**

- Adding more introductory problems does not address stage mismatch.
- Level 4–5 content authoring is more expensive and harder to validate.
- Better combined with AI-assisted problem pipeline (direction A,
  slice 4).
- Standalone content expansion has diminishing returns after v0.10 skill
  filtering.

**Estimated Slice Count:** 2–3

**Verdict:** Defer as standalone — should be integrated into the AI
direction as a later slice (intermediate content expansion or
AI-assisted problem pipeline).

---

### D. Deeper Multi-Step Learning (3+ Steps, ProblemStep Schema v2)

**Strengths:**

- High pedagogical value for intermediate learners.

**Weaknesses / Risks:**

- Requires schema migration, authoring, and validation.
- Does not address the core stage-mismatch gap on its own.
- Better suited after AI review can provide feedback on multi-step
  mistakes.

**Estimated Slice Count:** 3–5

**Verdict:** Defer — premature without AI review to support multi-step
feedback. Revisit after AI direction is established.

---

### E. Server Progress Completion / Supabase Sync Hardening

**Strengths:**

- Server progress sync already works (v0.2.3c).

**Weaknesses / Risks:**

- Already functional; further hardening has no child-facing impact.
- AI features may require new server-side endpoints, but that is
  scoped within the AI direction, not standalone sync hardening.

**Estimated Slice Count:** 2–3

**Verdict:** Defer — sync is already functional. AI-related server needs
are scoped within direction A.

---

## 3. Decision Matrix

| Direction | Child impact (intermediate) | Addresses stage mismatch | Effort | Regression risk | Slice fit |
|---|---|---|---|---|---|
| A. AI-first intermediate | High | Yes | Medium–High | Medium | 4–5 (spike first) |
| B. Practice explainability | Low | No | Low | Low | 3–4 |
| C. Content expansion | Medium | Partially | Medium | Low | 2–3 |
| D. Deeper multi-step | High (for advanced) | Partially | High | Medium | 3–5 |
| E. Supabase sync hardening | None | No | Medium | Low | 2–3 |

---

## 4. Selected Primary Direction

**AI-first intermediate progression / AI coach & sparring for a
one-year learner.**

Justification:

- **Addresses the core gap.** The target child has outgrown
  introductory content. AI-driven review and sparring provide adaptive
  challenge that static problems cannot.
- **Aligns with user preference.** The user has clearly expressed an
  AI-oriented direction for v0.12.
- **Feasibility spike de-risks.** The first implementation slice is a
  feasibility spike that evaluates AI approaches before full commitment.
  If the spike reveals blockers, the direction can be adjusted.
- **Compatible with existing content.** AI review works on any problem
  in the library; it does not require new content to be useful.
- **Enables future directions.** AI review naturally leads to AI
  sparring, AI-assisted problem authoring, and multi-step feedback.

Product goal:

> Let a one-year Go learner quickly enter an appropriately challenging
> state through AI-driven practice, review, and opponent-like
> interaction.

---

## 5. Slices

### Slice 1 (v0.12.0b): AI Feasibility Spike / Architecture Decision

**Goal:** Evaluate AI approaches for child-safe Go interaction and make
an informed architecture decision before full implementation.

**Scope:**

- `docs/AI_FEASIBILITY_SPIKE_v0.12.md` — feasibility report covering:
  - AI approach evaluation: KataGo / GTP engine, LLM explanation,
    rule-engine combinations.
  - Deployment model: local vs. server-side, Docker integration,
    API requirements.
  - Cost analysis: per-request cost, estimated monthly cost at low
    volume.
  - Latency targets: acceptable response time for child interaction.
  - Privacy and safety: data handling, content filtering,
    age-appropriate output constraints.
  - Child-appropriate UX: explanation style, language level, feedback
    format.
  - Recommended architecture decision with rationale.
- No `src/` code changes.
- No new dependencies.

**Non-goals:**

- No full product implementation.
- No AI model training or fine-tuning.
- No changes to existing problem data or schemas.
- No server-side API endpoints.

**Acceptance criteria:**

- Feasibility report exists with evaluated approaches, cost/latency/
  safety analysis, and a recommended architecture decision.
- No code changes introduced.
- `npm run build` and `npm run test` pass (unchanged).

---

### Slice 2 (v0.12.0c): Level Calibration / Intermediate Challenge Entry

**Goal:** Provide a way for the app to infer or select an appropriate
starting level for a one-year learner, avoiding default placement into
introductory content.

**Scope:**

- `src/lib/practice.ts` — add level calibration logic that detects when
  a child has progressed beyond introductory levels and adjusts the
  starting level for daily practice and chapter navigation.
- `src/app/practice/page.tsx` — surface level calibration result (e.g.,
  show "中级练习" or equivalent when the child is above introductory
  level).
- `src/__tests__/practice.test.ts` — tests for level calibration.

**Non-goals:**

- No AI integration in this slice (that comes in v0.12.0d).
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

---

### Slice 3 (v0.12.0d): Bounded AI Review / AI Coach Prototype

**Goal:** Implement a bounded AI review prototype that explains mistakes
or alternatives in solved/wrong problems.

**Scope:**

- `src/lib/ai-review.ts` — AI review module that sends a problem +
  child's wrong answer to an AI endpoint and receives a child-friendly
  explanation. Includes graceful fallback when AI is unavailable.
- `src/app/practice/page.tsx` or `src/components/problem/` — display AI
  review feedback after a wrong answer, with a "请AI老师帮忙" button.
- `src/__tests__/ai-review.test.ts` — tests for AI review module
  (mocked API, fallback behavior, output safety checks).
- Configuration for AI endpoint (env var or local config).

**Non-goals:**

- No AI sparring / opponent play (future direction).
- No AI-generated problems (future direction).
- No changes to existing problem data or schemas.
- No mandatory AI — must work without AI (graceful fallback).

**Acceptance criteria:**

- After a wrong answer, child can optionally request AI review.
- AI review provides a brief, child-friendly explanation of the
  mistake or correct approach.
- Graceful fallback when AI is unavailable or misconfigured.
- AI output is bounded: short, age-appropriate, no free-form
  conversation.
- `npm run test`, `npm run build` pass.

**Validation commands:**

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

---

### Slice 4 (v0.12.0e): Intermediate Content Expansion or AI-Assisted Problem Pipeline

**Goal:** Address the content gap for intermediate learners by either
adding level 4–5 problems or establishing an AI-assisted problem
pipeline based on observed gaps.

**Scope:**

- One of:
  - **Path A (manual content):** Add 10–15 level 4–5 problems to
    `src/data/problems.json` covering intermediate concepts (reading
    depth, direction of play, shape recognition, life-death
    evaluation). Follow v0.4/v0.5/v0.7 proven content process.
  - **Path B (AI-assisted pipeline):** Design a reviewed pipeline
    where AI generates candidate problems and a human reviews and
    approves them before inclusion.
- The choice between Path A and Path B should be informed by the
  feasibility spike results (v0.12.0b).

**Non-goals:**

- No unreviewed AI-generated content in the problem library.
- No schema changes.
- No changes to existing problem data.

**Acceptance criteria:**

- If Path A: new problems pass `validateAllProblems`, content review
  documented, test count updated.
- If Path B: pipeline documented, review process defined, no
  unreviewed content added.
- `npm run test`, `npm run build` pass.

---

### Slice 5 (v0.12.0f): Stabilization / Release Notes

**Goal:** Stabilize the v0.12 AI-first intermediate progression series
and publish release notes plus QA checklist.

**Scope:**

- `docs/RELEASE_NOTES_v0.12.md` — summary of v0.12.0a–e.
- `docs/QA_CHECKLIST_v0.12.md` — manual QA checklist.
- `docs/TASKS.md` — mark v0.12 complete, set next phase.

**Non-goals:**

- No code or test changes.
- No schema or data changes.

**Acceptance criteria:**

- Release notes document all v0.12 slices.
- QA checklist covers AI feasibility, level calibration, AI review
  prototype, content expansion, and regression.
- `npm run build` and `npm run test` pass.

---

## 6. Non-Goals for v0.12

The following items are explicitly out of scope for the entire v0.12
phase:

- **Payment** — no payment or subscription features.
- **Teacher / admin backend** — no management or monitoring dashboard.
- **Leaderboard** — no social or competitive features.
- **Multiplayer** — no online or local multiplayer.
- **Board-size expansion** — 9×9 only (unless AI direction explicitly
  requires a different size for sparring).
- **SGF import/export** — no SGF support.
- **Broad app redesign** — no layout overhaul.
- **Unrelated infrastructure work** — no CI, Docker, or deployment
  changes.
- **AI model training or fine-tuning** — use existing models only.
- **Unreviewed AI-generated content** — all AI output must be bounded
  and reviewed.
- **Free-form AI conversation** — AI interactions are bounded to
  specific problem review contexts.
- **Supabase self-hosting** — out of scope per v0.2 design.
- **Service role keys** — never exposed in browser container.

---

## 7. Acceptance Rules for v0.12 Slices

1. **One reviewable PR per slice.** Each slice is self-contained and
   can be reviewed, merged, and deployed independently.
2. **Feasibility spike must complete before AI implementation.** Slice
   v0.12.0b must produce a documented architecture decision before
   v0.12.0d begins implementation.
3. **No mixing unrelated product areas.** A slice PR touches only
   AI-related modules, practice UI, content, or documentation as
   explicitly scoped.
4. **No package/lockfile changes unless explicitly scoped and
   justified.**
5. **No schema change.** No `Problem`, `ProblemStep`, or database
   schema modifications unless explicitly scoped in a slice.
6. **AI must be optional and gracefully degradable.** The app must
   work without AI. AI features are additive, not required.
7. **No AI/payment/teacher/admin/leaderboard/board-size/SGF scope
   creep** beyond what is explicitly scoped in the AI direction.
8. **Each PR must pass `npm run lint`, `npm run typecheck`,
   `npm run test`, `npm run build`, and `npm run test:e2e`.**

---

## 8. Review Focus

Reviewers should check:

- The selected direction (AI-first intermediate progression) addresses
  the core product gap: stage/level mismatch for a one-year learner.
- Feasibility spike (v0.12.0b) is genuinely evaluative and does not
  pre-commit to a specific AI approach.
- Level calibration (v0.12.0c) solves the defaulting-into-introductory-
  content problem.
- AI review prototype (v0.12.0d) is bounded, child-safe, and gracefully
  degradable.
- Content expansion (v0.12.0e) is informed by feasibility spike results.
- AI is evaluated as a main product direction, not only a deferred
  high-risk novelty.
- Existing 77 introductory problems are treated as baseline/foundation,
  not the main growth path.
- Scope remains as planned — no unreviewed AI content, no free-form
  AI conversation, no payment/teacher/leaderboard scope creep.
