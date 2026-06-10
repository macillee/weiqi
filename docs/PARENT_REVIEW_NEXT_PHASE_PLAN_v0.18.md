# PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18

> Conservative planning document — session boundary and history modeling before any parent-facing UI.

---

# Goal and Constraints

## Goal

Define a safe, conservative next phase for the parent review surface. **Do not jump to parent dashboard, report UI, or any parent-facing integration.** Instead, focus on session boundary modeling and history contracts that enable safe parent insight delivery in the future.

### Key Constraints

1. **No Parent-Facing UI Yet**: Do not build parent dashboard, report page, or any UI for parents in this phase
2. **Session Boundary First**: Must understand session structure and history before any insight surface
3. **Privacy-First**: Maintain strict data minimization and boundary enforcement
4. **Backwards Compatible**: Zero impact on existing local anonymous mode
5. **Preserve v0.17 Assets**: Build upon existing debug surface without breaking it

### v0.17 Assets to Build Upon

- `/dev/session-summary` — existing developer-only debug page
- `src/lib/session-summary-input.ts` — `buildSessionSummaryInput()` mapping helper
- `src/lib/session-summary.ts` — `summarizeLearningSession()` aggregation logic
- `ParentSessionSummary` — structured output with category/level tables
- 12 tests targeting session-summary behavior

---

# Candidate Integration Directions

The following are **candidate directions for consideration**. None are recommended for immediate implementation. The recommended next step (v0.18.0b) is at the bottom.

Each candidate is evaluated across 6 dimensions:

- **Implementation complexity**: Effort to build and maintain
- **Privacy risk**: Likelihood of accidental data exposure
- **Child-facing exposure risk**: Risk of confusing or distracting the child user
- **Session-boundary needs**: How much session modeling infrastructure is required before this is viable
- **Local-only feasibility**: Whether the candidate can work purely client-side
- **Testing burden**: Effort to test the feature adequately

---

### Candidate A: Keep Developer Debug-Only Surface, Defer All Parent-Facing UI

Continue using v0.17.0b `/dev/session-summary` as the only review surface. No parent-facing UI. All energy goes to session boundary and history modeling contracts.

| Dimension | Rating | Notes |
|---|---|---|
| Implementation complexity | ●●●○○ Very Low | Nothing to build; existing surface already shipped |
| Privacy risk | ●●●●● None | No new data exposure; only developer-accessible route |
| Child-facing exposure risk | ●●●●● None | No child-facing changes; `/dev/*` routes are unlinked |
| Session-boundary needs | ●○○○○ Low | Current single-session summary is sufficient |
| Local-only feasibility | ●●●●● Fully | Already implemented; no server dependency |
| Testing burden | ●●●○○ Low | Existing 12 session-summary tests cover this surface |

---

### Candidate B: Guarded Parent-Only Settings Entry (Later)

Add an optional, auth-gated settings panel where a parent can opt in to view summary data. Pure settings — no dashboard, no report page changes.

| Dimension | Rating | Notes |
|---|---|---|
| Implementation complexity | ●●●●○ Medium-High | Requires auth gate, settings UI, read-only data binding |
| Privacy risk | ●●○○○ Significant | Settings page may expose aggregate data unintentionally |
| Child-facing exposure risk | ●●●●○ Low | Settings page is adult-oriented; child unlikely to navigate there |
| Session-boundary needs | ●●●○○ Medium | Needs cross-session aggregation for meaningful parent insights |
| Local-only feasibility | ●●○○○ Partial | Auth gate needs server; summary data can be local |
| Testing burden | ●●●●○ High | Auth flow tests, settings integration tests, regression tests |

---

### Candidate C: End-of-Session Review Summary (Later)

After a practice session completes, show a lightweight one-screen summary of what was practiced. No persistent dashboard or parent portal.

| Dimension | Rating | Notes |
|---|---|---|
| Implementation complexity | ●●●●○ Medium | New UI component triggered on session completion; moderate effort |
| Privacy risk | ●●○○○ Significant | Summary shown immediately after child's session; could leak patterns |
| Child-facing exposure risk | ●●○○○ Significant | Child sees the summary; wording must be carefully child-friendly |
| Session-boundary needs | ●●●●○ High | Requires robust session start/end detection to avoid showing partial data |
| Local-only feasibility | ●●●●○ Mostly | Can work client-side; no server needed for storage |
| Testing burden | ●●●●○ High | UI rendering tests, session boundary edge cases, integration tests |

---

### Candidate D: Existing Report / Progress Page Extension (Later)

Add a toggleable "parent view" section on the existing `/report` page. Extends current functionality without new routes.

| Dimension | Rating | Notes |
|---|---|---|
| Implementation complexity | ●●●●○ Medium | Extending existing report page; toggle/view separation needed |
| Privacy risk | ●●○○○ Significant | Parent data could bleed into child's report view or vice versa |
| Child-facing exposure risk | ●●●○○ Medium | Child may toggle into parent view; needs clear UX separation |
| Session-boundary needs | ●●●●○ High | Cross-session aggregation needed for meaningful parent insights |
| Local-only feasibility | ●●●●○ Mostly | Report page already works locally; extension can too |
| Testing burden | ●●●●○ High | Report rendering tests, permission toggle tests, regression tests |

---

### Candidate E: Weekly / Monthly Parent Summary (Later)

Generate periodic aggregated progress summaries (stars earned, problems completed, categories practiced). Delivered via simple page — no email, no dashboard.

| Dimension | Rating | Notes |
|---|---|---|
| Implementation complexity | ●●●●○ Medium | Summary aggregation logic + simple display page |
| Privacy risk | ●●○○○ Significant | Periodic summaries aggregate sensitive progress data |
| Child-facing exposure risk | ●●●●● None | Not shown during or near child play sessions |
| Session-boundary needs | ●●●●● Very High | Requires robust history modeling across many sessions |
| Local-only feasibility | ●●●●○ Mostly | Can compute locally from localStorage history |
| Testing burden | ●●●●○ High | Aggregation tests, date-range tests, edge cases |

---

### Candidate F: Do Nothing — Stay on Developer Debug Surface Indefinitely

Accept the v0.17.0b debug surface as sufficient for internal use. Do not invest in parent-facing UI until product validation demands it.

| Dimension | Rating | Notes |
|---|---|---|
| Implementation complexity | ●●●●● None | Zero investment; status quo maintained |
| Privacy risk | ●●●●● None | No new data exposure |
| Child-facing exposure risk | ●●●●● None | No child-facing changes |
| Session-boundary needs | ●○○○○ Low | Current session summary is enough for developer use |
| Local-only feasibility | ●●●●● Fully | Already local-only |
| Testing burden | ●○○○○ None | No new tests needed |

---

### Candidate G: Defer All UI, Improve Session Boundary and History Modeling First ◆ RECOMMENDED

**Do not implement any parent-facing UI.** Instead, invest in:
- Session boundary contract (start/end, continuity, resumption)
- History modeling algorithms (aggregation across sessions)
- Safe parent signal definitions (what signals are safe to expose)
- Temporal analysis infrastructure (performance trends over time)

| Dimension | Rating | Notes |
|---|---|---|
| Implementation complexity | ●●●●○ Medium | Documentation and contract work; no UI code |
| Privacy risk | ●●●●● None | No data exposure; all work is design-time contracts |
| Child-facing exposure risk | ●●●●● None | No child-facing changes |
| Session-boundary needs | ●●●●● Very High | This candidate directly addresses session boundary definition |
| Local-only feasibility | ●●●●● Fully | Contracts and algorithms are pure design work |
| Testing burden | ●●○○○ Low | Contracts are documented, not tested in CI |

---

---

# v0.18.0b Recommended Direction: Session Boundary / History Modeling Contract

**The immediate next slice (v0.18.0b) should be a documentation and contract slice that defines:**

1. **Session Boundary Protocol** — what constitutes a session, how sessions relate, how to handle interrupted sessions, overlap detection
2. **History Modeling Algorithms** — how to aggregate session summaries into trend data, how to compute progress signals
3. **Safe Signal Registry** — documented list of signals safe for eventual parent exposure (accuracy, category distribution, streak data, etc.)
4. **Privacy Boundary Checklist** — what data must never cross into any parent surface
5. **Exclusion List** — explicit list of what not to build yet (parent dashboard, report page, email summaries, push notifications)

**Parent-facing UI is explicitly excluded from v0.18.0b.** No dashboard, no report page changes, no parent settings, no weekly email. Focus purely on contracts and modeling.

---

# Data Flow

```
Child Practice Sessions
      ↓
localStorage Progress + Attempts
      ↓
summarizeLearningSession() (src/lib/session-summary.ts)
      ↓
ParentSessionSummary (aggregated, sanitized)
      ↓
History Modeling Contract (v0.18.0b target)
      ↓
Safe Signals → eventual guarded parent access (future slice)
```

---

# Privacy and Safety Design

1. **Data Minimization**: Only aggregate insights transmitted to any surface
2. **No Raw Answers**: Parent surface must never show specific correct/incorrect answers
3. **Consent Gate**: Any parent surface must be opt-in, auth-gated
4. **Guardrails**: Safe signal thresholds and validation before any exposure

---

# Acceptance Criteria

## Functional

1. Session boundary protocol documented with clear start/end semantics
2. History modeling algorithms defined with pseudocode
3. Safe signal registry published (at least 5 safe signals)
4. Privacy boundary checklist complete
5. Explicit non-goals list documented

## Quality

1. Conservative: no parent-facing UI recommended for immediate implementation
2. Privacy-first: data minimization enforced at contract level
3. Testable: contracts should be verifiable via unit tests

## Explicitly NOT Delivered in v0.18

- No parent-facing UI components
- No parent dashboard
- No report page changes
- No weekly/monthly parent summary UI
- No end-of-session review UI
- No settings entry for parent features
- No analytics or telemetry

---

# Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Too conservative | Define "safe enough" criteria for eventual parent signals |
| Session boundary ambiguity | Start with simple, deterministic session rules |
| Privacy misstep | Privacy boundary checklist and mandatory review gate |
| Scope creep to parent UI | Explicit exclusion list; block any parent-facing UI in v0.18 |

---

# Dependencies

### Required
- v0.17.0b (`/dev/session-summary`, `src/lib/session-summary-input.ts`, `src/lib/session-summary.ts`)
- v0.17.0c QA validation report

### Optional
- v0.16.0c session summary helper (as reference)

---

# References

- v0.17.0a: `docs/PARENT_REVIEW_INTEGRATION_PLAN_v0.17.md`
- v0.17.0b: `/dev/session-summary`, `src/lib/session-summary-input.ts`, `src/lib/session-summary.ts`
- v0.17.0c: `docs/PARENT_REVIEW_DEBUG_QA_v0.17.md`
- v0.17.0d: `docs/RELEASE_NOTES_v0.17.md`
