# v0.17 — Parent Review Integration Surface

## 1. Summary

v0.17 delivers the first integration surface for the v0.16 parent session summary — a local-only developer debug page at `/dev/session-summary` that renders the full `ParentSessionSummary` output. The v0.17 series validates the helper's data flow, rendering, privacy boundaries, and Chinese parent wording in a safe, unlinked debug context before any parent-facing UI is considered.

All slices remain strictly local-only: no data leaves the device, no telemetry, no persistence of summary output, no Supabase, no external AI.

## 2. What changed

| Slice | Deliverable | PR |
|---|---|---|
| v0.17.0a | Parent Review Integration Surface Plan — compared 4 candidate surfaces (recommended: developer debug panel), defined session boundary, data flow, privacy review, UI/UX principles, slice plan (b–d) | #192 |
| v0.17.0b | Developer debug page at `/dev/session-summary`, mapping helper `buildSessionSummaryInput()`, full `ParentSessionSummary` rendering with category/level tables, strengths/shaky/next-focus sections, empty state, privacy boundary, 12 new tests | #194 |
| v0.17.0c | QA validation report at `docs/PARENT_REVIEW_DEBUG_QA_v0.17.md`, 4 new regression tests (problem-ID privacy, shaky concepts, suggested next focus, multi-step counts), all Chinese wording reviewed non-judgmental | #196 |

### File inventory

New files added:

- `src/app/dev/session-summary/page.tsx` — developer debug page (client component)
- `src/lib/session-summary-input.ts` — `buildSessionSummaryInput()` mapping helper
- `src/__tests__/session-summary-input.test.ts` — 5 mapping helper unit tests
- `src/__tests__/session-summary-debug.test.tsx` — 10 rendering and privacy tests
- `docs/PARENT_REVIEW_INTEGRATION_PLAN_v0.17.md` — v0.17.0a planning document
- `docs/PARENT_REVIEW_DEBUG_QA_v0.17.md` — v0.17.0c QA validation report

## 3. What did not change

- No parent dashboard, parent settings panel, or child-facing summary UI
- No navigation link to `/dev/session-summary` from home, practice, levels, wrong-book, report, or settings
- No end-of-session modal or page
- No history or weekly report view
- No persistence of summary output
- No Supabase schema or database writes
- No API route or Server Action
- No telemetry or analytics
- No external AI, Ollama, KataGo, or engine/diagnostics dependency
- No package, Docker, or CI change
- No problem content, selection logic, practice flow, report, wrong-book, or level progression changes

## 4. Developer/debug-only route behavior

- Route: `/dev/session-summary` (unlinked — accessible only by direct URL)
- Page clearly identifies itself: "🔧 开发者调试面板"
- Local-only disclaimer: "数据仅存储在本地浏览器中，不会发送到任何服务器"
- Not-a-grade framing: "这不是成绩或排名，仅作为练习参考"
- All operations are synchronous and local: `loadProgress()` → `buildSessionSummaryInput()` → `summarizeLearningSession()`
- No summary output is saved, cached, or transmitted
- Empty progress state shows "暂无练习数据" with a link to `/practice`
- Links from the page to `/` and `/practice` are acceptable — they do not create child-facing discoverability

## 5. Privacy and data minimization

- Rendered output never exposes raw move coordinates, raw board state, engine metrics, Supabase/account IDs, child identity/profile, stars/streaks/achievements, or raw review schedule internals
- Problem IDs are not rendered in the page output
- The `sessionId` field displayed in the page footer is derived from a base36 timestamp (not a problem ID) when timestamps are present, which is always the case in normal usage
- Chinese parent notes are template-based (not LLM-generated), non-judgmental, and guidance-oriented

## 6. Testing and validation

| Area | Count | Scope |
|---|---|---|
| Mapping helper unit tests | 5 | empty progress, attempt metadata, monotonic attemptCount, timestamps, unknown category |
| Debug page rendering tests | 10 | empty state, debug copy, local-only disclaimer, sanitized fields, privacy boundary (forbidden keys), strengths, warnings, problem-ID privacy, shaky concepts, suggested next focus, multi-step counts |
| Existing helper tests (v0.16) | 29 | empty/all-correct/mixed/hint/retry/multi-step/boundary scenarios |
| QA validation report | 1 | developer boundary, local-only boundary, privacy boundary, wording validation, empty/sparse state QA, accessibility, release-readiness |

All tests and build pass on CI:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 537 passed (28 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## 7. Known limitations

- `/dev/session-summary` is developer-only and unlinked — parents cannot discover or access it without knowing the direct URL
- No session boundary filtering — the page aggregates all attempt history as a single summary; no daily/weekly/session-type partitioning
- No persistence or history view — summaries are regenerated in-memory on each page load
- No parent dashboard or report page integration
- No longitudinal trends — each page load is a single snapshot
- Summary quality depends on available local attempt data; sparse/empty sessions produce limited output
- No engine/AI-based evaluation — the helper only aggregates existing correctness/hint/retry signals
- Chinese parent notes are template-based, not LLM-generated

## 8. Recommended next phase

**v0.18.0a — Parent Review Next Phase Plan**

Plan the next step for the parent review surface. Key questions to evaluate:

- Keep the debug-only surface as-is and defer parent-facing UI?
- Introduce a guarded parent-only settings entry (behind auth/parent gate)?
- Gather stronger session-boundary requirements before any parent-facing UI?
- Consider end-of-session or weekly report extensions?

The next phase should be a planning-only slice (docs) before any integration code is written.
