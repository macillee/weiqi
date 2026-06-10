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

### Candidate A: Keep Developer Debug-Only Surface, Defer All Parent-Facing UI
Continue using v0.17.0b `/dev/session-summary` as the only review surface. No parent-facing UI. All energy goes to session boundary and history modeling contracts.

### Candidate B: Guarded Parent-Only Settings Entry (Later)
Add an optional, auth-gated settings panel where a parent can opt in to view summary data. Pure settings — no dashboard, no report page changes.

### Candidate C: End-of-Session Review Summary (Later)
After a practice session completes, show a lightweight one-screen summary of what was practiced. No persistent dashboard or parent portal.

### Candidate D: Existing Report / Progress Page Extension (Later)
Add a toggleable "parent view" section on the existing `/report` page. Extends current functionality without new routes.

### Candidate E: Weekly / Monthly Parent Summary (Later)
Generate periodic aggregated progress summaries (stars earned, problems completed, categories practiced). Delivered via simple page — no email, no dashboard.

### Candidate F: Do Nothing — Stay on Developer Debug Surface Indefinitely
Accept the v0.17.0b debug surface as sufficient for internal use. Do not invest in parent-facing UI until product validation demands it.

### Candidate G: Defer All UI, Improve Session Boundary and History Modeling First ◆ RECOMMENDED
**Do not implement any parent-facing UI.** Instead, invest in:
- Session boundary contract (start/end, continuity, resumption)
- History modeling algorithms (aggregation across sessions)
- Safe parent signal definitions (what signals are safe to expose)
- Temporal analysis infrastructure (performance trends over time)

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
