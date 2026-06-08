# v0.16 Plan — Learning Session Review / Parent Progress Insights

## 1. Goal and Non-Goals

### Goal

Help the parent review learning sessions and understand how the child is progressing with the expanded intermediate content (v0.15). The first phase should be lightweight and local-first.

### Design Principles

- Parent insight should emphasize **encouragement, pattern recognition, and next-practice direction**.
- Avoid ranking, pressure, punitive wording, or over-measuring the child.
- The child's practice experience must not be disrupted by parent-facing features.

### Non-Goals (v0.16)

- No UI implementation in v0.16.0a (planning only).
- No analytics or telemetry.
- No external AI API.
- No Supabase schema changes.
- No teacher/admin dashboard.
- No runtime behavior changes in this planning task.
- No persistence beyond existing localStorage progress.
- No email, push notification, or external sharing.

## 2. Parent Questions to Answer

The plan should enable answers to these parent-facing questions:

| Question | Priority |
|---|---|
| What did the child practice today? | High |
| Which categories appeared? | High |
| Which levels appeared? | High |
| Which problems were missed or retried? | High |
| Which concepts seem shaky? | Medium |
| Did the child improve after hints or feedback? | Medium |
| Are level 3–5 problems too hard, too easy, or appropriate? | Medium |
| Which category should tomorrow emphasize? | Medium |
| Did multi-step problems cause friction? | Low |
| Is the child seeing enough variety across all 7 categories? | Low |

## 3. Candidate Insight Signals

### Allowed / Local Signals

- session date/time;
- problem IDs attempted;
- category;
- level;
- result (correct/incorrect);
- attempts count;
- hint usage;
- retry success;
- multi-step completion;
- wrong-answer feedback shown;
- local-only summary counts.

### Must Explicitly Avoid (by Default)

- child name/profile in exported summaries;
- raw transcripts of practice sessions;
- engine raw output (winrate, scoreLead, analysis details);
- raw local file paths;
- telemetry events;
- external network submission;
- teacher/admin identifiers;
- leaderboards or comparative rankings.

## 4. Data Source and Local-First Boundary

- First implementation should use **existing local progress/session state** (`localStorage`).
- Local anonymous mode must remain fully supported.
- Supabase may be optional **only if** existing progress sync already provides data; do not require it.
- No new Supabase schema in the first implementation slice unless separately justified.
- Parent insight should be generated locally from already available practice events/progress state.
- No external AI summarization.
- No telemetry or analytics pipeline.

## 5. Session Review Output Model

The following pseudo-contract defines the sanitized output shape for a parent session review. The exact shape may differ during implementation, but the fields below establish the minimum viable set.

```ts
export type SessionReviewCategorySummary = {
  category: "capture" | "escape" | "connect_cut" | "life_death" | "opening" | "endgame" | "mixed";
  attempted: number;
  correctFirstTry: number;
  retried: number;
  hintsUsed: number;
};

export type SessionReviewLevelSummary = {
  level: 1 | 2 | 3 | 4 | 5;
  attempted: number;
  correctFirstTry: number;
  hintsUsed: number;
};

export type ParentSessionReview = {
  sessionId: string;
  reviewedAt: string;
  totalAttempted: number;
  totalCorrectFirstTry: number;
  totalRetried: number;
  totalHintsUsed: number;
  multiStepAttempted: number;
  multiStepCompleted: number;
  categories: SessionReviewCategorySummary[];
  levels: SessionReviewLevelSummary[];
  shakyConcepts: string[];
  strengths: string[];
  suggestedNextFocus: string[];
  parentNote: string;
};
```

### Field Rationale

| Field | Purpose |
|---|---|
| `sessionId` | Identifies a single practice session (daily or chapter) |
| `reviewedAt` | When the review was generated |
| `totalAttempted` | Total problems attempted in the session |
| `totalCorrectFirstTry` | Problems solved correctly on first attempt |
| `totalRetried` | Problems where the child tried again after a wrong answer |
| `totalHintsUsed` | Problems where hints were revealed |
| `multiStepAttempted` | Multi-step problems started |
| `multiStepCompleted` | Multi-step problems fully completed |
| `categories` | Per-category breakdown |
| `levels` | Per-level breakdown |
| `shakyConcepts` | Categories/patterns where the child struggled (e.g., "征子方向判断") |
| `strengths` | Categories/patterns where the child performed well |
| `suggestedNextFocus` | Actionable suggestions for tomorrow's practice |
| `parentNote` | Auto-generated parent-friendly summary sentence |

## 6. Parent Wording Principles

### Language Rules

- Use supportive parent wording.
- Avoid rank/score pressure.
- Avoid "weak", "failed", "bad", or blame framing.
- Prefer: "需要再练", "正在形成", "今天表现稳定", "建议明天继续练习…".
- Make suggestions actionable but small.
- Do not expose engine diagnostics or raw technical details.
- Do not show overly precise percentages when sample size is small.

### Example Phrases

| Situation | Wording |
|---|---|
| Good performance | "今天表现稳定，尤其在征子题目上做得很棒！" |
| Some struggle | "连接切断的题目还需要再练一练，明天可以多试几道。" |
| Hint usage | "遇到难题时会主动看提示，这是很好的学习习惯。" |
| Multi-step | "多步题完成得很好，说明思考越来越深入了。" |
| Mixed results | "今天尝试了不同类别的题目，继续加油！" |
| Empty session | "今天还没有练习记录，开始一局今日练习吧。" |

## 7. v0.16 Slice Plan

| Slice | Focus | Scope |
|---|---|---|
| v0.16.0a | Learning Session Review / Parent Progress Insight Plan | Planning (this document) |
| v0.16.0b | Session Review Data Contract and Local Aggregation Plan | Docs/contract — define the data aggregation helper contract without UI |
| v0.16.0c | Parent Session Summary Helper, local-only / no UI | Implementation — local aggregation helper that reads from localStorage and produces `ParentSessionReview` |
| v0.16.0d | Parent Session Summary UI, read-only and child-safe | UI — a simple read-only parent review page accessible from settings or report |
| v0.16.0e | Validation / QA / Release Notes | Stabilization |

### Rationale for Sequence

- **v0.16.0b first**: Lock down the data contract and aggregation plan before writing code. This avoids scope creep into UI or persistence.
- **v0.16.0c second**: Implement the local-only helper that reads existing progress and produces the review output. No UI yet — testable via unit tests.
- **v0.16.0d third**: Add a read-only parent review page. The page is child-safe (no raw engine data, no external sharing).
- **v0.16.0e last**: Validate the full flow, write release notes, and update QA checklist.

## 8. v0.16.0b Next Task Definition

### Task

`v0.16.0b — Session Review Data Contract and Local Aggregation Plan`

### Goal

Define the TypeScript data contract for session review aggregation and document the local aggregation plan. This is a docs-only or contract-only task.

### Allowed Files

- `docs/SESSION_REVIEW_CONTRACT_v0.16.md` — data contract and aggregation plan.
- `docs/TASKS.md` — mark v0.16.0b delivered and queue v0.16.0c.

### Non-Goals

- No helper implementation (v0.16.0c).
- No UI (v0.16.0d).
- No persistence changes.
- No Supabase schema changes.
- No tests or E2E.
- No runtime code changes.

### Acceptance Criteria

- `docs/SESSION_REVIEW_CONTRACT_v0.16.md` exists with:
  - Finalized `ParentSessionReview` type shape.
  - Aggregation algorithm description (how to read from existing `StudentProgress`).
  - Category/level summary derivation rules.
  - Shaky concept and strength detection heuristics.
  - Suggested next focus derivation rules.
  - Parent note generation rules.
  - Privacy and data minimization checklist.
- `docs/TASKS.md` marks v0.16.0b delivered and queues v0.16.0c.
- No runtime code, tests, E2E, CI, Docker, package files, problem data, schema, SQL/Supabase, or feature work is added.

### Validation

Docs-only change. Run `npm run build` and `npm run test` to confirm no regressions.

## 9. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Turning parent insight into pressure | Use supportive wording principles; avoid rankings, scores, or comparisons |
| Over-interpreting small sample sizes | Show raw counts, not percentages, when sample < 5; add disclaimer |
| Leaking child data | No external network calls; local-only aggregation; no telemetry |
| Adding telemetry creep | Explicitly prohibit telemetry in all v0.16 slices |
| Supabase becoming required | Keep local anonymous mode as primary; Supabase optional only if existing sync already provides data |
| Too much UI/dashboard scope | v0.16.0d is a single read-only page, not a full dashboard |
| Confusing parent notes with engine diagnostics | Parent notes use only safe signals; engine diagnostics are never exposed |
| Showing raw IDs without explanation | Map problem IDs to category+level labels; show Chinese category names |
| Local progress data being incomplete | Handle missing/empty progress gracefully; show "no data" state |

## 10. Decision Recommendation

1. **Start with a small local data contract / aggregation plan** (v0.16.0b).
2. **Do not build a full dashboard yet** — start with a single read-only page.
3. **Do not add external AI summarization** — parent notes should be template-based and local.
4. **Keep parent-facing wording supportive and low-pressure** — follow the wording principles in section 6.
5. **Prioritize insights tied to category/level/multi-step practice and suggested next focus** — these are the most actionable signals for a parent.
6. **Local anonymous mode must remain the primary path** — Supabase sync is optional and not required.
