# PARENT_REVIEW_SESSION_BOUNDARY_CONTRACT_v0.18

> TypeScript pseudo-contract and vocabulary for session boundary, history modeling, and parent-review-safe aggregation. Local-only. No server dependency.

---

# 1. Session Boundary Vocabulary

This section defines the canonical terms used throughout the contract. All future parent-review code must reference this vocabulary.

### current attempt

A single click on the board during a single problem. One problem may receive multiple attempts.

TypeScript shape (informational):

```ts
type CurrentAttempt = {
  problemId: string;
  x: number;
  y: number;
  isCorrect: boolean;
  usedHint: boolean;
  attemptCount: number;   // monotonic per problemId within session
  createdAt: string;      // ISO-8601
};
```

### current session

An uninterrupted sequence of problems presented to the child. The session starts when the child begins a practice block and ends when the child navigates away, refreshes, or explicitly completes the block.

- Session has no server-side identifier.
- Session is tracked in memory only (React state), not persisted to localStorage.
- Session may contain 1–N problems.
- Session resets on page refresh (unless the practice flow preserves state).

### daily summary

All practice activity within a single calendar date (based on `lastPracticeDate` in `StudentProgress`). Aggregated from all sessions that occurred on that date.

- Persisted implicitly via `StudentProgress.attempts[]` and `StudentProgress.lastPracticeDate`.
- Can be computed by filtering `attempts[]` by date.

### historical summary

All practice activity across all dates present in `StudentProgress`. Represents the full retained local learning history.

### retained local history

The `StudentProgress` object saved in `localStorage["children-go-app:v0.1:progress"]`. Includes:

- `attempts: AttemptRecord[]` — every board click the child has made
- `wrongProblems: Record<string, WrongProblemState>` — wrong-problem tracking
- `reviewSchedule` — spaced review metadata
- `stars`, `streakDays`, `lastPracticeDate`, `completedProblemIds`, `masteredProblemIds`, `achievements`

This is the **only** source of truth for any parent review surface in v0.18.

### parent-review-safe aggregate

A derived data structure that satisfies all privacy rules in Section 6. It is computed from `StudentProgress` by a pure function and contains **no** raw coordinates, board state, problem IDs, child identity, or internal scheduling metadata.

Current implementation: `ParentSessionSummary` (output of `summarizeLearningSession()` in `src/lib/session-summary.ts`).

---

# 2. Current-Session vs Daily vs Historical Summary

## What can enter parent review

| Data | Can Enter Parent Review? | Notes |
|---|---|---|
| Problem category (e.g. "capture") | ✅ Yes | Safe signal — no raw content |
| Problem level (1–5 numeric) | ✅ Yes | Safe signal |
| Correct / wrong count per category | ✅ Yes | Aggregate only |
| Strengths / shaky concepts (top/bottom categories) | ✅ Yes | Derived from aggregates |
| Suggested next focus | ✅ Yes | Derived from aggregates |
| Multi-step completion count | ✅ Yes | Aggregate metric |
| Total attempts in session | ✅ Yes | Aggregate metric |
| Total correct in session | ✅ Yes | Aggregate metric |
| Session timestamp | ✅ Yes | Coarse-grained only |
| Parent note (generated template) | ✅ Yes | Pre-written, non-judgmental |

## What cannot enter parent review

| Data | Can Enter Parent Review? | Notes |
|---|---|---|
| Raw move coordinates (x, y) | ❌ No | Exposes specific answer location |
| Raw board state | ❌ No | Exposes problem setup |
| Problem ID (e.g. "CAP-001") | ❌ No | Identifies specific problem |
| Child name or profile | ❌ No | Identity protection |
| Stars count | ❌ No | Child-facing reward; irrelevant to parent |
| Streak days | ❌ No | Child-facing metric |
| Achievements | ❌ No | Child-facing reward |
| Review schedule internals | ❌ No | Spaced-review metadata |
| Individual attempt timestamps | ❌ No | Too granular |
| Hint usage count per problem | ❌ No | Too granular |
| Wrong answer coordinates | ❌ No | Exposes child's mistake location |

## Current `/dev/session-summary` classification

The existing developer debug page at `/dev/session-summary` renders a `ParentSessionSummary` derived from the **current session** boundary. Specifically:

- It reads `loadProgress()` which returns the full `StudentProgress` (retained local history).
- It calls `buildSessionSummaryInput()` to map progress into `AttemptSummary[]`.
- It calls `summarizeLearningSession()` to produce `ParentSessionSummary`.

**Classification:** The current `/dev/session-summary` produces a **historical summary** (it reads all retained history), not a current-session summary. This is acceptable for a developer debug surface but would be **too broad** for a parent-facing surface.

## v0.18 boundary rule for future UI

**Any future parent-facing UI in v0.18+ must derive data exclusively from `ParentSessionSummary` — the parent-review-safe aggregate.**

- ❌ Must not read `StudentProgress` directly.
- ❌ Must not access `localStorage` directly.
- ✅ Must consume only the already-sanitized output of `summarizeLearningSession()`.
- ✅ Must use `buildSessionSummaryInput()` as the only input adapter.

---

# 3. Reset / Retention Behavior

This section defines what happens to session data under various user actions.

| Action | Attempts affected | WrongProblems affected | ParentSessionSummary affected |
|---|---|---|---|
| Page refresh (during practice) | Session lost (memory); all persisted attempts kept | Unchanged | Re-computes from persisted history |
| Restart practice (new session) | Session boundary resets; old attempts kept | Unchanged | Re-computes from persisted history |
| Complete a problem set (daily practice) | Attempts persisted to localStorage | Updated for wrong answers | Re-computes from persisted history |
| Cross-day boundary | Attempts kept; `lastPracticeDate` updated | Unchanged | Re-computes; daily segment changes |
| Clear localStorage (`resetProgress()`) | All attempts deleted | All wrong-problems deleted | Empty summary |
| Multiple opens of `/dev/session-summary` | Unchanged (read-only) | Unchanged | Re-computes each time; deterministic output for same input |
| Browser tab close / crash | Un-persisted attempts lost | Persisted state intact | Re-computes from persisted history on next load |

**Key invariants:**

1. `summarizeLearningSession()` is a **pure function**: same input → same output.
2. `buildSessionSummaryInput()` is a **pure mapping**: same `StudentProgress` → same `AttemptSummary[]`.
3. No parent-review state is persisted separately from `StudentProgress`.
4. Clearing `StudentProgress` (localStorage reset) is the only way to lose all historical data.

---

# 4. Sparse / Empty / Mixed Result Behavior

This section defines how `ParentSessionSummary` behaves under various data conditions.

### Empty progress

```
StudentProgress = { attempts: [], wrongProblems: {}, ...defaults }
```

- `buildSessionSummaryInput()` returns `[]`.
- `summarizeLearningSession()` produces an empty summary with `strengths: []`, `shakyConcepts: []`, `suggestedNextFocus: []`, `parentNote: null`.
- `/dev/session-summary` renders the empty state with a link to `/practice`.

### One attempt

```
StudentProgress = { attempts: [{ problemId: "CAP-001", isCorrect: true, ... }] }
```

- `buildSessionSummaryInput()` returns one `AttemptSummary`.
- Category table has one category (`capture`) with 1 correct, 0 wrong.
- Level table has one level (`1`) with 1 attempt.
- Strength is `["capture"]` if capture rate ≥ 60%.
- Shaky concepts is `[]` if no category has < 60%.
- Suggested next focus is `null` or a gentle encouragement.

### All correct

- Category table shows 100% across all attempted categories.
- Strengths lists every attempted category.
- Shaky concepts is empty.
- Parent note praises the child's performance.
- Suggested next focus suggests maintaining variety.

### All incorrect

- Category table shows 0% across all attempted categories.
- Strengths is empty.
- Shaky concepts lists every attempted category.
- Parent note is supportive, non-judgmental: "今天遇到了一些挑战，下次再试试！"
- Suggested next focus recommends reviewing the most-practiced shaky category.

### Mixed correct/wrong

- Standard proportional rendering.
- Strengths = categories with ≥ 60% correct.
- Shaky = categories with < 60% correct.
- Suggested next focus = the shaky category with the most attempts.

### Hint usage / retry

- Attempts with `usedHint: true` are counted as correct for session-summary purposes.
- Repeat attempts on the same `problemId` increment `attemptCount` but do not duplicate entries in `AttemptSummary[]`.
- `summarizeLearningSession()` uses `firstCorrectAttempt` and `totalAttempts` per problem to compute signals.

### Multi-step problems

- Multi-step problems contribute their step-level attempts as individual `AttemptSummary` entries.
- Completion count aggregates step completions, not problem completions.
- ParentSessionSummary.attempts includes step-level granularity; parent note wording does not expose step details.

### Stale history

Stale history (attempts from weeks ago) is treated identically to fresh history. `ParentSessionSummary` makes no time-decay adjustments in v0.18. This is a known limitation:

- Old correct answers inflate current-strength signals.
- Old wrong answers inflate current-shaky signals.
- Future time-windowing is deferred to a later contract revision.

---

# 5. Local-Only Assumptions

The contract makes the following local-only guarantees:

| Assumption | Status | Rationale |
|---|---|---|
| No server required | ✅ Mandatory | All computation runs client-side in the browser |
| No Supabase dependency | ✅ Mandatory | App must function with zero Supabase env configured |
| No account system | ✅ Mandatory | No login, session, or auth tokens involved |
| No multi-child profile | ✅ Mandatory | Single-child local mode only; no profile switching |
| All data in localStorage | ✅ Mandatory | `StudentProgress` is the only data source |
| No fetch / XHR | ✅ Mandatory | All functions are synchronous pure transformations |
| Deterministic output | ✅ Mandatory | Same `StudentProgress` → same `ParentSessionSummary` every time |

These assumptions are inherited from v0.1 MVP architecture (see `docs/PROJECT_SPEC.md` §8).

---

# 6. Privacy / Data Minimization

The following fields must never appear in any parent-review surface (debug or production):

| Field | Why excluded |
|---|---|
| Raw move coordinates (x, y) | Exposes the specific answer location or child's mistake |
| Raw board state (stones array) | Exposes the problem setup and solution structure |
| Problem IDs (e.g. "CAP-001") | Allows identification of specific content, enabling pattern analysis of individual problems |
| Child identity / profile | No PII of any kind in parent review |
| Stars count | Child-facing reward metric; not meaningful for parent insight |
| Streak days | Child-facing gamification metric |
| Achievements | Child-facing reward; irrelevant to learning insights |
| Review schedule internals | Spaced-review scheduling metadata; internal only |
| Hint usage per problem | Too granular; use hints at aggregate level only |
| Specific correct/wrong answer locations | Exposes child's exact mistake |

**Enforcement:**

- `buildSessionSummaryInput()` drops all coordinate and timestamp data from `AttemptRecord`.
- `summarizeLearningSession()` never reads raw stones, problem IDs (output only contains category/level), or child-facing reward fields.
- Any new parent-review function must pass the same privacy filter.
- All existing tests in `src/__tests__/session-summary-input.test.ts` and `src/__tests__/session-summary-debug.test.tsx` verify these boundaries.

**No telemetry or analytics:**

The contract explicitly forbids:
- Sending any data to an external service
- Logging any parent-review data to console (beyond developer debug)
- Tracking parent page views
- Recording which parent insights are viewed

---

# 7. Parent Gate Requirements

## Minimum local parent gate for v0.18

Any parent-facing UI surface added in v0.18 must satisfy **at minimum** the following local-first gate — no server, Supabase, or account required:

1. **Local parent-only entry or confirmation gate** — A simple confirmation step (tap "我是家长" or "家长查看") before entering any parent review UI. No password required.
2. **Explicit "parent review / guardian only" wording** — The entry point must be clearly labeled for parents only, with a brief note explaining the content is for guardians.
3. **Privacy notice** — A short local notice explaining what data is shown and what is never shown (no raw answers, no coordinates, no problem IDs). The notice must be acknowledged before first use.
4. **No child-facing navigation** — The parent review entry must not appear in the child's normal navigation flow. It may appear as a small, unobtrusive link (e.g. at the bottom of `/report` or `/settings`) or be gated behind a long-press / secret-tap pattern.
5. **No server / account / Supabase requirement** — The gate must work fully offline, in anonymous local mode, with zero server dependencies.
6. **Only consumes parent-review-safe aggregate** — The parent UI must consume `ParentSessionSummary` (via `summarizeLearningSession()`), never raw `StudentProgress` or `localStorage` directly.

## Why current v0.18 cannot directly add report / dashboard / settings entry

The following preconditions are not yet satisfied:

| Precondition | Status | Notes |
|---|---|---|
| Local parent gate | ❌ Missing | No parent-only entry or confirmation gate implemented |
| Privacy notice | ❌ Missing | No privacy notice component exists |
| Session-boundary contract | ✅ This document | Now defined; implementation pending |
| Time-windowing algorithm | ❌ Missing | No stale-history filtering; parent signals would be inaccurate |
| Parent-review UI component library | ❌ Missing | No parent-facing components exist |

Adding a report / dashboard / settings entry before these preconditions are met would:
- Expose unfiltered historical data with no time-windowing
- Confuse parents with stale signals (old correct answers masking current weaknesses)
- Violate privacy boundaries (no notice, no opt-in)
- Bypass the session boundary contract this document defines

## Hosted / multi-user optional note

If the app later supports hosted multi-user mode (Supabase, auth, child profile selection), additional gates may become required — including authentication, child profile selection, and server-side privacy enforcement. **That is out of scope for v0.18 local-only parent review.** The local-first gates defined above are sufficient for the current MVP architecture.

## What UI requires a separate future issue

Each of the following parent-facing features requires its own issue with explicit acceptance criteria:

| UI Feature | Required Precondition |
|---|---|
| Parent settings toggle (`/settings`) | Local parent gate, privacy notice, opt-in |
| Parent summary on `/report` | Session-boundary contract implementation, time-windowing |
| Parent dashboard (`/parent`) | Above + full local parent gate |
| Weekly parent summary | Time-windowing, history modeling |
| End-of-session parent card | Session boundary detection, current-session isolation |

---

# 8. Future Testing Requirements

## Mandatory test coverage for any implementation task

Any future task that implements a parent-review feature must include automated tests covering:

### Data scenarios (unit tests)

| Scenario | Must test |
|---|---|
| Empty progress | Summary renders empty state, no crashes |
| Single attempt, correct | Category/level tables render correctly |
| Single attempt, wrong | Same; parent note is supportive |
| All correct | Strengths populated, shaky empty |
| All wrong | Shaky populated, strengths empty, parent note non-judgmental |
| Mixed correct / wrong | Proportional rendering correct |
| Hint usage | Hint attempts correctly aggregated |
| Retry (multiple attempts) | Monotonic attemptCount verified |
| Multi-step problems | Step-level attempts correctly aggregated |
| Stale history (old dates) | No time-windowing regression (known limitation documented) |
| Reset (clear localStorage) | Empty state after reset |
| Page refresh | Session boundary resets; persisted data intact |

### Privacy boundary tests

Any UI component that displays parent-review data must test:

- No raw coordinates visible in DOM
- No problem IDs visible in DOM
- No board state visible in DOM
- No child identity visible in DOM
- No stars/streaks/achievements visible in DOM
- No review schedule internals visible in DOM

### Storage / persistence tests

Any feature that reads or writes parent-review data must test:

- localStorage read succeeds
- localStorage read failure handled gracefully (no crash)
- Data migration from prior schema (if applicable)
- Data retention after reset

### UI rendering tests (if applicable)

- Component renders without crashing for each data scenario
- Empty state renders correctly with call-to-action
- Parent note wording is non-judgmental (match against a list of allowed adjectives)
- Mobile layout does not break

---

# 9. Recommendation

### v0.18.0c recommended direction: Mini Local Session History Model

**Do not implement any parent-facing UI.** Instead, implement a minimal local session history model that:

1. **Persistence**: Store session-level metadata (start time, end time, problem count, correct count) as an append-only array in `StudentProgress`
2. **Contract validation**: Write unit tests that verify `summarizeLearningSession()` correctly handles:
   - Multiple sessions on the same day (daily summary aggregation)
   - Sessions across multiple days (historical summary aggregation)
   - Empty intermediate sessions (no data loss)
   - Session boundary after page refresh (in-memory state lost, persisted sessions intact)
3. **Time-windowing (optional)**: Add a `daysToInclude` parameter to `summarizeLearningSession()` so future callers can request only the last N days of data

### Explicitly not recommended for v0.18.0c

- ❌ No parent dashboard, report page, or settings entry
- ❌ No UI components of any kind
- ❌ No new routes or navigation changes
- ❌ No storage schema migration (append-only additions to `StudentProgress` only)
- ❌ No API routes or Server Actions
- ❌ No telemetry, analytics, or external service calls
- ❌ No AI or engine integration
- ❌ No changes to practice flow, wrong-book, report, level progression, or child-facing UI

---

# References

- v0.17.0a: `docs/PARENT_REVIEW_INTEGRATION_PLAN_v0.17.md`
- v0.17.0b: `/dev/session-summary`, `src/lib/session-summary-input.ts`, `src/lib/session-summary.ts`
- v0.17.0c: `docs/PARENT_REVIEW_DEBUG_QA_v0.17.md`
- v0.17.0d: `docs/RELEASE_NOTES_v0.17.md`
- v0.18.0a: `docs/PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18.md`
- v0.1 MVP: `docs/PROJECT_SPEC.md` §8 (local storage)
