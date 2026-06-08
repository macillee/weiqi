# v0.16.0b — Session Review Data Contract and Local Aggregation Plan

## 1. Goal and Boundary

### Goal

Define the sanitized parent session review data contract and local aggregation rules. This document locks down the contract shape, source data assumptions, aggregation algorithm, heuristics, and parent note template rules before any helper code or UI is written.

### Boundary

- This is **contract/docs only**.
- No helper implementation in v0.16.0b.
- No UI.
- No persistence changes.
- No Supabase schema changes.
- No external AI.
- No telemetry or analytics.
- No runtime behavior changes.

## 2. Source Data Assumptions

### Available Source Fields

The aggregation algorithm reads from existing local progress state (`StudentProgress` in `src/lib/progress.ts`):

| Field | Source | Required |
|---|---|---|
| Session date/time | Practice session context or attempt timestamps | No (derive from first attempt timestamp) |
| Attempted problem IDs | `problemAttempts` entries | Yes |
| Category | Problem metadata (resolved by problem ID) | Yes (derived) |
| Level | Problem metadata (resolved by problem ID) | Yes (derived) |
| Correctness result | Attempt `correct` field | Yes |
| Attempts/retries | Multiple `problemAttempts` entries per problem | No (default to 1) |
| Hint usage | Attempt `usedHint` field | No (default to 0) |
| Multi-step completion | Attempt `completed` field for multi-step problems | No (infer from step data) |
| Wrong-answer feedback shown | Attempt `coachShown` field | No (omit if missing) |

### Graceful Degradation

| Missing Field | Behavior |
|---|---|
| Session ID | Derive local ephemeral session ID from first attempt timestamp |
| Hint usage | Omit hints data or set to 0 with warning |
| Multi-step completion | Infer only when safe (all steps attempted); otherwise note as partial |
| Category/level | Derive from problem metadata by ID; if ID unknown, mark as `unknown` |
| Local progress | Return empty-session review with `signalQuality: "empty"` |
| Attempt timestamps | Use session-level timestamp if available; otherwise omit time data |
| Coach shown flag | Omit coach-related fields with warning |

## 3. Data Minimization Rules

The review contract must **not** include by default:

- Child name or profile.
- Raw transcripts of practice sessions.
- Raw board positions or move sequences beyond problem ID and high-level result.
- Engine raw output (winrate, scoreLead, analysis details).
- Raw local file paths.
- Telemetry events.
- External identifiers (Supabase user ID, child profile ID).
- Teacher/admin identifiers.
- Leaderboard or comparison data.

## 4. TypeScript Pseudo-Contract

```ts
export type SessionReviewCategory =
  | "capture"
  | "escape"
  | "connect_cut"
  | "life_death"
  | "opening"
  | "endgame"
  | "mixed";

export type SessionReviewLevel = 1 | 2 | 3 | 4 | 5;

export type SessionReviewSignalQuality = "complete" | "partial" | "empty";

export type SessionReviewCategorySummary = {
  category: SessionReviewCategory;
  attempted: number;
  correctFirstTry: number;
  retried: number;
  hintsUsed: number;
  multiStepAttempted: number;
  multiStepCompleted: number;
};

export type SessionReviewLevelSummary = {
  level: SessionReviewLevel;
  attempted: number;
  correctFirstTry: number;
  hintsUsed: number;
};

export type SessionReviewProblemSummary = {
  problemId: string;
  category: SessionReviewCategory;
  level: SessionReviewLevel;
  result: "correct-first-try" | "correct-after-retry" | "incomplete" | "unknown";
  hintsUsed: number;
  multiStep: boolean;
};

export type ParentSessionReview = {
  sessionId: string;
  reviewedAt: string;
  signalQuality: SessionReviewSignalQuality;
  totalAttempted: number;
  totalCorrectFirstTry: number;
  totalRetried: number;
  totalHintsUsed: number;
  multiStepAttempted: number;
  multiStepCompleted: number;
  categories: SessionReviewCategorySummary[];
  levels: SessionReviewLevelSummary[];
  problems: SessionReviewProblemSummary[];
  strengths: string[];
  shakyConcepts: string[];
  suggestedNextFocus: string[];
  parentNote: string;
  warnings: string[];
};
```

### Field Rationale

| Field | Purpose |
|---|---|
| `signalQuality` | Allows the parent to understand data completeness |
| `totalAttempted` | Total problems attempted in the session |
| `totalCorrectFirstTry` | Problems solved correctly on first attempt |
| `totalRetried` | Problems where the child tried again after a wrong answer |
| `totalHintsUsed` | Problems where hints were revealed |
| `multiStepAttempted` | Multi-step problems started |
| `multiStepCompleted` | Multi-step problems fully completed |
| `categories` | Per-category breakdown for pattern recognition |
| `levels` | Per-level breakdown for difficulty calibration |
| `problems` | Per-problem detail for specific review |
| `strengths` | Categories/patterns where the child performed well |
| `shakyConcepts` | Categories/patterns needing more practice |
| `suggestedNextFocus` | Actionable 1–2 category suggestions |
| `parentNote` | Auto-generated parent-friendly summary sentence |
| `warnings` | Data quality notes (missing fields, small samples) |

## 5. Aggregation Algorithm

The deterministic local aggregation follows these steps:

1. **Load source data**: Read existing local progress/session state from `localStorage` via `loadProgress()`.
2. **Resolve problem metadata**: Map each attempted problem ID to its category and level using the problem data source.
3. **Normalize attempts**: For each problem ID, group all attempts and produce a single `SessionReviewProblemSummary`:
   - `result`: `"correct-first-try"` if first attempt is correct; `"correct-after-retry"` if any later attempt is correct; `"incomplete"` if never correct; `"unknown"` if result data is missing.
   - `hintsUsed`: count of attempts where hints were revealed.
   - `multiStep`: true if the problem has `totalSteps > 1` or `steps.length > 0`.
4. **Compute totals**:
   - `totalAttempted`: number of unique problem IDs.
   - `totalCorrectFirstTry`: count of problems with `result === "correct-first-try"`.
   - `totalRetried`: count of problems with multiple attempts.
   - `totalHintsUsed`: sum of `hintsUsed` across all problems.
   - `multiStepAttempted`: count of multi-step problems attempted.
   - `multiStepCompleted`: count of multi-step problems with `result !== "incomplete"`.
5. **Aggregate by category**: Group problems by category; compute per-category counts.
6. **Aggregate by level**: Group problems by level; compute per-level counts.
7. **Derive strengths** (see section 6).
8. **Derive shaky concepts** (see section 6).
9. **Derive suggested next focus** (see section 6).
10. **Generate parent note** (see section 7).
11. **Attach warnings**: For missing or partial source fields.
12. **Return `ParentSessionReview`**: Without persistence or network calls.

## 6. Heuristics for Strengths, Shaky Concepts, and Next Focus

### General Rules

- Use **counts**, not precise percentages, for sample sizes < 5.
- Do not label a category as shaky from a single mistake.
- Require at least 2 attempts in a category before drawing conclusions.
- Strengths require at least 2 correct-first-try in a category.

### Strength Detection

| Condition | Strength Label |
|---|---|
| Category with ≥ 2 correct-first-try and ≥ 60% first-try rate | `"{category} 表现不错"` |
| Multi-step completion rate ≥ 50% with ≥ 2 attempted | `"多步题完成得很好"` |
| Overall first-try rate ≥ 70% with ≥ 5 problems | `"今天整体表现稳定"` |

### Shaky Concept Detection

| Condition | Shaky Label |
|---|---|
| Category with ≥ 2 attempts and ≤ 40% first-try rate | `"{category} 需要再练"` |
| Category with ≥ 3 retries | `"{category} 还需要多练习"` |
| Multi-step with ≥ 2 incomplete and hints used | `"多步题还需要再想想"` |

### Suggested Next Focus

- Pick 1–2 categories with the lowest first-try rate (minimum 2 attempts).
- If all categories have ≥ 60% first-try rate, suggest variety: `"建议明天尝试不同类别的题目"`.
- If multi-step friction detected, suggest: `"建议明天多练几道多步题"`.
- If a category was not practiced at all, suggest: `"明天可以试试{category}的题目"`.

### Wording Constraints

- "需要再练"
- "正在形成"
- "今天表现稳定"
- "建议明天继续练习..."
- Avoid "weak", "failed", "bad", or blame framing.

## 7. Parent Note Template Rules

### Template Selection

| Session Pattern | Template |
|---|---|
| Empty session (0 attempts) | "今天还没有练习记录，开始一局今日练习吧。" |
| Balanced successful (≥ 5 problems, ≥ 70% first-try) | "今天表现稳定！完成了{totalAttempted}道题，其中{totalCorrectFirstTry}道一次做对。{strengths}。{suggestedNextFocus}" |
| Hints used productively (hints > 0, retry success > 0) | "今天遇到难题时会主动看提示，这是很好的学习习惯。完成了{totalAttempted}道题，{totalCorrectFirstTry}道一次做对。{suggestedNextFocus}" |
| Category needing practice (shaky concepts present) | "今天在{shakyConcepts}方面还需要再练一练。完成了{totalAttempted}道题，明天可以多试试这些类型的题目。" |
| Multi-step friction (multi-step attempted but low completion) | "多步题还需要再想想，慢慢来，多练几次就会越来越熟练。{suggestedNextFocus}" |
| Level 3–5 appropriate challenge | "今天练习了不少中级难度的题目，继续加油！{strengths}。{suggestedNextFocus}" |
| Mixed category exposure (≥ 4 categories) | "今天尝试了不同类别的题目，练习面很广！{strengths}。{suggestedNextFocus}" |

### Avoid

- Score/rank framing.
- Blame language.
- "weak", "bad", "failed".
- Precise percentages for samples < 5.
- Engine/diagnostics language.
- External AI references.

## 8. Privacy and Safety Checklist

- [ ] No telemetry.
- [ ] No analytics.
- [ ] No external network call.
- [ ] No external AI.
- [ ] No child name/profile by default.
- [ ] No raw board positions.
- [ ] No raw transcripts.
- [ ] No engine output.
- [ ] No Supabase requirement.
- [ ] Local anonymous mode supported.
- [ ] Parent wording low-pressure.
- [ ] No leaderboard/ranking/comparison.

## 9. Implementation Guidance for v0.16.0c

- Implement a local-only helper, likely under `src/lib/session-review.ts`.
- No UI in v0.16.0c.
- No Server Action or API route unless separately justified.
- No persistence writes.
- No Supabase requirement.
- No external network calls.
- Tests should use fixtures/mocks.
- Helper should be deterministic and easy to unit test.
- Missing data should return warnings, not throw, unless input is invalid.

## 10. Next Task Definition

### Task

`v0.16.0c — Parent Session Summary Helper, local-only / no UI`

### Goal

Implement the local-only aggregation helper that reads from existing localStorage progress and produces a `ParentSessionReview` object. No UI, no persistence writes, no network calls.

### Allowed Files

- `src/lib/session-review.ts` — new helper module.
- `src/__tests__/session-review.test.ts` — unit tests with fixtures/mocks.
- `docs/TASKS.md` — mark v0.16.0c delivered and queue v0.16.0d.

### Non-Goals

- No UI (v0.16.0d).
- No persistence writes.
- No Supabase schema changes.
- No Server Action or API route.
- No external network calls.
- No telemetry or analytics.

### Acceptance Criteria

- `src/lib/session-review.ts` exports a deterministic `buildSessionReview()` function.
- Function reads from a `StudentProgress`-like input (injectable for testing).
- Returns `ParentSessionReview` with all fields populated.
- Handles empty progress gracefully (`signalQuality: "empty"`).
- Handles partial data gracefully with warnings.
- No persistence writes.
- No UI.
- All existing tests still pass.
- `npm run build` passes.

### Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
