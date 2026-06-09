# v0.17.0a — Parent Review Integration Surface Plan

## 1. Goal and constraints

### Goal

Define a safe, local-first integration surface for surfacing the v0.16 parent session summary in the product, without exposing child-facing analytics, adding telemetry, or requiring external services.

### Constraints

- Planning-only; no implementation in v0.17.0a
- Local-first — no data leaves the device
- No telemetry or analytics
- No external AI
- No Supabase write requirement
- No child-facing performance dashboard
- Privacy-first, low-pressure parent wording
- v0.16 helper is pure and ready; no changes needed to `session-summary.ts`

## 2. Current assets from v0.16

| Asset | Location | Description |
|---|---|---|
| `summarizeLearningSession()` | `src/lib/session-summary.ts` | Pure local helper, zero imports, deterministic |
| `ParentSessionSummary` type | `src/lib/session-summary.ts` | Sanitized parent-oriented output shape |
| `LearningSessionSummaryInput` type | `src/lib/session-summary.ts` | Local-only input contract |
| QA validation report | `docs/SESSION_SUMMARY_VALIDATION_v0.16.md` | 13 scenarios, 29 tests, no defects |
| Release notes | `docs/RELEASE_NOTES_v0.16.md` | v0.16 series summary, limitations, privacy |
| QA checklist | `docs/QA_CHECKLIST_v0.16.md` | Manual QA, privacy, wording, regression |

### Known limitations (carried forward)

- Helper is not wired into any UI — parent cannot view summaries without developer tooling
- No persistence or history view — summaries are in-memory per call
- No longitudinal trends — each call is a single-session snapshot
- Summary quality depends on available local attempt data; sparse/empty sessions produce limited output

## 3. Candidate integration surfaces

### Option A: Developer/debug-only local review panel

| Aspect | Assessment |
|---|---|
| **User value** | Developer can manually call `summarizeLearningSession()` and view result without building full UI |
| **Privacy risk** | Low — developer-scoped, no child-facing exposure |
| **Implementation complexity** | Low — a simple debug panel or console-based approach |
| **Child-safety risk** | None — invisible to child |
| **Persistence** | None — ephemeral per-session |
| **Recommendation** | ✅ **Recommended for v0.17.0b** |

Rationale: Lowest risk, fastest path to making the helper observable. Provides real usage feedback before investing in parent-facing UI.

### Option B: Parent-only review panel in Settings

| Aspect | Assessment |
|---|---|
| **User value** | Parent can review recent session summary without developer tools |
| **Privacy risk** | Medium — must ensure child never navigates here accidentally |
| **Implementation complexity** | Medium — needs route guard or parent-only section in Settings |
| **Child-safety risk** | Low — Settings already has parent/developer-oriented content |
| **Persistence** | None — generate summary from current attempt data each time |
| **Recommendation** | ⏳ Defer to v0.17.0c or later |

Rationale: Higher value but needs more design, wording review, and child-safety consideration.

### Option C: End-of-session parent summary modal/page

| Aspect | Assessment |
|---|---|
| **User value** | Parent sees summary immediately after child finishes practice |
| **Privacy risk** | Medium — child may see the summary unless deliberately hidden behind a parent gate |
| **Implementation complexity** | High — needs session boundary logic, parent gate, and dismissal flow |
| **Child-safety risk** | Medium — summary numbers could be misinterpreted by child as grading |
| **Persistence** | None — ephemeral |
| **Recommendation** | ❌ Not recommended for v0.17 — premature for MVP |

Rationale: Requires careful UX research with children and parents. The current MVP should not present any evaluation-like data to the child.

### Option D: Weekly report extension

| Aspect | Assessment |
|---|---|
| **User value** | Longitudinal trend view across multiple sessions |
| **Privacy risk** | Low if parent-only |
| **Implementation complexity** | High — needs persistence, session boundary, date-range aggregation |
| **Child-safety risk** | Low |
| **Persistence** | Required — summaries must be stored across sessions |
| **Recommendation** | ❌ Defer beyond v0.17 — out of scope for current milestone |

Rationale: Persistence requirement and cross-session aggregation add significant complexity. Defer to a future milestone.

## 4. Recommended first integration slice

### Recommended: Option A — Developer/debug-only local review panel (v0.17.0b)

**User-facing boundary**: A simple local-only route or settings entry visible only when a developer flag is set or when accessed directly by path (e.g., `/dev/session-summary`).

**Source of session attempt data**: Read from `localStorage` using the existing `loadProgress()` from `src/lib/progress.ts`.

**Ephemeral vs persisted**: Ephemeral — each page load re-reads from current localStorage progress.

**Fields displayed**:
- Session ID and timestamps
- Total attempted, correct first-try, retried, hints used
- Per-category and per-level breakdowns
- Strengths, shaky concepts, suggested next focus
- Parent note (Chinese)

**Fields explicitly hidden**:
- Raw attempt records (no `selectedX`, `selectedY`)
- Problem IDs (not needed for summary view)
- Review schedule data
- Stars, streak days, achievements
- Child name or profile

**Empty/sparse state behavior**: Show the helper's warning text and a clear "no data" state.

**Wording principles**: Use the existing helper's Chinese parent notes directly.

**No child-facing dashboard guarantee**: The `/dev/` prefix and absence of navigation links ensure children cannot discover this page.

## 5. Session boundary plan

For the first implementation (v0.17.0b), keep the session boundary simple:

- **Source**: All attempts from `localStorage` progress (entire history)
- **No session splitting**: Display all data as one summary; no daily/weekly slicing
- **Fresh start**: User can optionally reset local progress to clear the summary
- **Refresh safety**: Data persists in `localStorage`; summary regenerates on each page load
- **No data → empty state**: The helper already returns a clean sparse summary

Future slices (v0.17.0c+) may add session-type filtering (today, this week, last practice).

## 6. Data flow plan (future implementation)

```
Practice flow (existing)                   Parent/dev summary view (new)
                                   
ProblemPlayer → onAttempt()                /dev/session-summary
  → localStorage save           ───→      loadProgress()
                                           → build LearningSessionSummaryInput
                                           → call summarizeLearningSession(input)
                                           → render ParentSessionSummary
  No network call
  No telemetry
  No Supabase write
```

The data flow is fully local, synchronous, and uses only the existing `loadProgress()` interface.

## 7. Privacy and safety review

| Concern | Mitigation |
|---|---|
| Child identity | Input/output do not include child name or profile |
| Account/Supabase IDs | Not in input, output, or rendering |
| Raw board state | Not included — summary uses only aggregated counts |
| Raw move coordinates | Never included in summary |
| Engine metrics | Not available; helper does not call engine |
| AI-generated text | Not used — parent notes are template-based |
| Ranking/score pressure | Parent notes explicitly avoid ranking or blaming language |
| Parent misuse risk | Summary is framed as guidance, not evaluation. QA checklist confirms wording is non-judgmental |
| Child discovering the page | `/dev/` prefix + no navigation link in normal flow |
| Data persistence | No summary persistence in v0.17.0b |

## 8. UI/UX principles for future implementation

- **Parent-facing language**: Use helper's Chinese parent notes directly — concise, warm, non-judgmental
- **Child-safe tone**: No scores, ranks, or comparison; focus on "what to practice next"
- **Low-pressure summary**: Emphasize encouragement over evaluation
- **Sparse-data disclaimers**: Show helper's `warnings` when data is sparse
- **"Not a grade" framing**: Explicit note that the summary is for reference only
- **Developer-only visibility**: In v0.17.0b, the page is unlinked; accessible only by direct URL
- **Accessibility**: Use standard HTML elements, proper heading hierarchy, sufficient color contrast
- **Mobile constraints**: Keep layout simple and scrollable

## 9. Recommended v0.17 slice plan

| Slice | Description | Scope |
|---|---|---|
| v0.17.0a | Parent Review Integration Surface Plan (this document) | Docs only |
| v0.17.0b | Developer debug surface prototype — minimal route, renders summary from localStorage, no persistence | `src/app/dev/session-summary/page.tsx`, types/imports, tests |
| v0.17.0c | Parent review UI wording validation / QA | Wording review, test updates |
| v0.17.0d | v0.17 stabilization / release notes | Release notes, QA checklist |

All slices beyond v0.17.0a preserve the local-only, no-telemetry, no-persistence (unless explicitly scoped) boundaries.

## 10. Acceptance criteria for v0.17.0b

- [ ] Route exists at `/dev/session-summary` (or equivalent debug path)
- [ ] Page reads localStorage via `loadProgress()`, builds `LearningSessionSummaryInput`, calls `summarizeLearningSession()`
- [ ] All `ParentSessionSummary` fields are displayed in a readable layout
- [ ] Raw attempt coordinates, engine metrics, child identifiers are **not** displayed
- [ ] Empty/sparse progress shows helper warnings
- [ ] No persistence of summary output
- [ ] No API route or Server Action
- [ ] No telemetry or analytics
- [ ] No child-facing navigation link to this page
- [ ] Existing tests still pass
- [ ] `npm run lint`, `typecheck`, `test`, `build` pass
- [ ] No Supabase, AI, engine, diagnostics, Docker, CI, package, or problem data changes
