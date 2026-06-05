# v0.12 — Next Phase Plan: Practice Explainability / Child-Facing Learning UX

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

What the product lacks:

- Children cannot see **why** a problem was selected (review, weak
  category, level match, new practice). The selection algorithm is
  invisible.
- There is no **encouragement or context** tied to the selection
  rationale. A review problem looks the same as a brand-new problem.
- The practice experience is functional but **emotionally flat** —
  children see a sequence of problems without narrative or feedback
  about their learning journey.

---

## 2. Candidate Direction Evaluation

### A. Practice Explainability / Child-Facing Learning UX

**Strengths:**

- Direct child impact — children see context for each problem
  ("复习错题", "新题", "吃子训练").
- Low technical risk — UI-only or data-light changes; no algorithm
  or schema changes required.
- Leverages v0.10 selection algorithm: the rationale already exists in
  the code (priority type, category, level), it just needs to be
  surfaced.
- Strengthens the learning loop: children understand that review and
  weak-category practice are intentional, not random.
- Small, reviewable slices — each slice can be a single PR.
- Compatible with any future direction (multi-step, content, AI).

**Weaknesses / Risks:**

- Risk of UI clutter for young children (7–9). Design must be minimal
  and non-distracting.
- Selection rationale must be extracted without coupling the UI to
  internal algorithm details.
- Marginal impact if children do not read or notice the indicators.

**Estimated Slice Count:** 3–4

**Verdict:** Primary direction — directly improves the child's learning
experience, leverages existing v0.10 infrastructure, low risk, and
compatible with all future directions.

---

### B. Server Progress Completion / Supabase Sync Hardening

**Strengths:**

- Server progress sync already works (v0.2.3c).
- Could add offline queue, conflict resolution, or retry hardening.

**Weaknesses / Risks:**

- The sync layer is already functional and tested (v0.2.3b/c, v0.2.4c).
- Further hardening has no child-facing impact.
- Offline queue / conflict resolution adds significant complexity
  with subtle edge cases.
- v0.11 Docker/Supabase env hardening already improved the deployment
  foundation; diminishing returns from further infra work.

**Estimated Slice Count:** 2–3

**Verdict:** Defer — server sync is already functional. Further
hardening can be bundled with a future Supabase-dependent feature if
real sync issues emerge.

---

### C. Content Expansion Beyond 77 Problems

**Strengths:**

- Tangible variety increase.
- Proven content-authoring process from v0.4/v0.5/v0.7.

**Weaknesses / Risks:**

- Diminishing returns after v0.10 skill filtering and v0.8 full wiring.
  The algorithm now distributes 77 problems effectively across
  categories and levels.
- 77 problems cover 6 categories and 5 levels. The gap is primarily
  in level 4–5 depth, not total count.
- Content authoring is more expensive per problem than UX improvements.
- v0.4/v0.5/v0.7 established that content packs are safe and routine —
  this direction can be picked up at any time without risk of
  regression.

**Estimated Slice Count:** 2–3

**Verdict:** Defer — practice explainability improves the experience
with every existing problem; content expansion improves it only with
each new problem. Revisit after v0.12.

---

### D. Deeper Multi-Step Learning (3+ Steps, ProblemStep Schema v2)

**Strengths:**

- High pedagogical value — multi-step problems teach deeper reading.

**Weaknesses / Risks:**

- Requires `ProblemStep` schema v2 — schema migration, authoring tools,
  and validation.
- 3–5 slices of work with medium regression risk.
- Current multi-step content (9 problems, 2 steps each) was wired in
  v0.8 and gated in v0.10; the team should observe usage before
  expanding the format.
- No child has yet encountered multi-step problems through normal daily
  practice (they must first complete single-step prerequisites).
- Harder to review than UI or documentation changes.

**Estimated Slice Count:** 3–5

**Verdict:** Defer — premature until the team has usage data on current
2-step problems filtered through v0.10 gating. Revisit after
observational period.

---

### E. AI Opponent / AI Review Exploration

**Strengths:**

- Potentially high pedagogical value if done well.
- Could differentiate the product.

**Weaknesses / Risks:**

- High technical risk: latency, cost, safety, age-appropriate UX,
  content quality control.
- Requires external API dependency (cost, availability, data privacy).
- Not suitable for incremental, small-slice delivery.
- The product is designed for short, focused problem-solving sessions,
  not open-ended play against AI.
- Current scope explicitly excludes AI (AGENTS.md, PROJECT_SPEC.md,
  TASKS.md).

**Estimated Slice Count:** Exploration only; implementation would be 5+

**Verdict:** Defer — the product should strengthen its core learning
loop before exploring AI. AI is a high-risk, high-cost direction that
is incompatible with the current incremental delivery model. If pursued,
it should be a dedicated v0.13+ planning cycle with a feasibility study.

---

## 3. Decision Matrix

| Direction | Child impact | Parent value | Effort | Regression risk | Infra dependency | Slice fit |
|---|---|---|---|---|---|---|
| A. Practice explainability | High | Medium | Low | Low | None | 3–4 small |
| B. Supabase sync hardening | None | Low | Medium | Low | Supabase | 2–3 medium |
| C. Content expansion | Medium | Low | Medium | Low | None | 2–3 medium |
| D. Deeper multi-step | High | Medium | High | Medium | Schema v2 | 3–5 large |
| E. AI exploration | Uncertain | Uncertain | High | High | External API | Exploration only |

---

## 4. Selected Primary Direction

**Practice explainability / child-facing learning UX.**

Justification:

- **Directly leverages v0.10.** The selection algorithm already
  produces rich rationale (priority type, category, level match). This
  information exists in the code but is invisible to children.
- **Strengthens the learning loop.** When children see "复习错题" or
  "吃子训练", they understand that practice is personalized and
  intentional. This is more motivating than a random sequence of
  problems.
- **Low risk.** No algorithm changes, no schema changes, no new
  dependencies. Each slice is UI-only or data-light.
- **Compatible with all future directions.** Explainability indicators
  work equally well with more content (C), deeper multi-step (D), or
  even AI-assisted review (E).
- **Small, reviewable slices.** Each slice is a single PR with clear
  scope.
- **Fills a known gap.** v0.10 release notes (section 7) noted "No UI
  explanation for why a daily problem was selected" as a known
  limitation.

---

## 5. Slices

### Slice 1 (v0.12.0b): Selection Rationale Tags

**Goal:** Surface why each daily-practice problem was selected with a
small, non-distracting tag.

**Scope:**

- `src/lib/practice.ts` — extend `selectDailyProblems` return type to
  include per-problem selection rationale (e.g., `"review"`,
  `"wrong_review"`, `"category_balance"`, `"new"`).
- `src/app/practice/page.tsx` — display a small tag or badge next to
  the problem header indicating the selection type.
- `src/__tests__/practice.test.ts` — tests for rationale tagging.

**Non-goals:**

- No changes to the selection algorithm.
- No new UI components beyond a minimal tag/badge.
- No changes to wrong-book, report, or chapter pages.
- No schema or data changes.

**Acceptance criteria:**

- `selectDailyProblems` returns rationale for each selected problem.
- Practice page shows a tag for each problem (e.g., "复习", "错题",
  "新题").
- Tags are minimal and non-distracting for 7–9 year olds.
- Existing selection behavior unchanged.
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

### Slice 2 (v0.12.0c): Category and Level Context in Practice

**Goal:** Show category name and level indicator alongside each problem
in daily practice, giving children a sense of what skill they are
practicing.

**Scope:**

- `src/app/practice/page.tsx` — display category label (e.g., "吃子")
  and level indicator (e.g., "⭐⭐") in the problem header area.
- `src/lib/chapters.ts` or `src/lib/problems.ts` — helper to map
  category IDs to display names if not already available.
- `src/__tests__/practice.test.ts` — tests for category/level display
  data availability.

**Non-goals:**

- No changes to the selection algorithm.
- No new pages or navigation.
- No changes to wrong-book, report, or chapter pages.
- No schema or data changes.

**Acceptance criteria:**

- Practice page shows category label for the current problem.
- Practice page shows a level indicator appropriate for children.
- Display is minimal and does not clutter the problem area.
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

### Slice 3 (v0.12.0d): Practice Session Summary Enhancement

**Goal:** Enhance the end-of-session summary to show what the child
practiced: categories covered, review vs. new count, and a brief
encouragement message.

**Scope:**

- `src/app/practice/page.tsx` — extend the summary view with category
  breakdown, review/new count, and contextual encouragement.
- `src/lib/practice.ts` — helper to compute session summary metadata
  from the completed session.

**Non-goals:**

- No changes to the selection algorithm.
- No new pages or navigation.
- No server-side analytics or tracking.
- No schema or data changes.

**Acceptance criteria:**

- Summary shows categories practiced.
- Summary shows review vs. new problem count.
- Summary includes a brief, warm encouragement message.
- Display is child-friendly and concise.
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

### Slice 4 (v0.12.0e): Stabilization / Release Notes

**Goal:** Stabilize the v0.12 practice explainability series and
publish release notes plus QA checklist.

**Scope:**

- `docs/RELEASE_NOTES_v0.12.md` — summary of v0.12.0a/b/c/d.
- `docs/QA_CHECKLIST_v0.12.md` — manual QA checklist.
- `docs/TASKS.md` — mark v0.12 complete, set next phase.

**Non-goals:**

- No code or test changes.
- No schema or data changes.

**Acceptance criteria:**

- Release notes document all v0.12 slices.
- QA checklist covers rationale tags, category/level context, summary
  enhancement, and regression.
- `npm run build` and `npm run test` pass.

---

## 6. Non-Goals for v0.12

The following items are explicitly out of scope for the entire v0.12
phase:

- **Payment** — no payment or subscription features.
- **Teacher / admin backend** — no management or monitoring dashboard.
- **Leaderboard** — no social or competitive features.
- **Multiplayer** — no online or local multiplayer.
- **Board-size expansion** — 9×9 only.
- **SGF import/export** — no SGF support.
- **Broad app redesign** — no layout overhaul or new pages beyond
  practice page enhancements.
- **Unrelated infrastructure work** — no CI, Docker, or deployment
  changes.
- **AI opponent / AI review** — no AI features.
- **Schema changes** — `Problem`, `ProblemStep`, `StudentProgress`,
  and all other schemas remain unchanged.
- **Problem content** — no new problems, no edits to existing problems.
- **Problem data** — `src/data/problems.json` is not modified.
- **Selection algorithm changes** — `selectDailyProblems` logic is
  unchanged; only the return type is extended to include rationale.
- **`src/lib/supabase/` client code** — no changes.
- **Supabase self-hosting** — out of scope per v0.2 design.
- **Service role keys** — never exposed in browser container.

---

## 7. Acceptance Rules for v0.12 Slices

1. **One reviewable PR per slice.** Each slice is self-contained and
   can be reviewed, merged, and deployed independently.
2. **No mixing unrelated product areas.** A slice PR touches only
   practice-related UI, `practice.ts` rationale extension, tests, or
   documentation as explicitly scoped.
3. **No package/lockfile changes unless explicitly scoped.**
4. **No schema change.** No `Problem`, `ProblemStep`, or database schema
   modifications.
5. **No selection algorithm change.** The selection algorithm logic
   remains identical; only the return type is extended.
6. **No AI/payment/teacher/admin/leaderboard/board-size/SGF scope
   creep.**
7. **Each PR must pass `npm run lint`, `npm run typecheck`,
   `npm run test`, `npm run build`, and `npm run test:e2e`.**

---

## 8. Review Focus

Reviewers should check:

- Candidate evaluation is balanced and grounded in current project state.
- The selected direction (practice explainability) is justified given
  v0.10 selection algorithm and known limitations.
- Slice boundaries are small enough for sequential PR review.
- Rationale tagging does not couple the UI to internal algorithm
  implementation details.
- Category/level display is minimal and child-friendly.
- Summary enhancement is concise and warm, not verbose.
- No selection algorithm changes are introduced.
- Scope remains as planned — no schema, data, or infra work.
