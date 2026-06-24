# Next Phase Plan — v0.22

> Planning-only slice. No runtime code change.

## 1. Objective

Create the v0.22 next-phase planning document after the completed v0.21 series. Evaluate candidate directions, pick the safest primary v0.22 path, and update the task queue.

## 2. v0.21 Baseline Summary

| Metric | Value |
|---|---|
| Total problems in `problems.json` | 110 |
| `getAllProblemIds()` wired pool | 99 problem IDs |
| Chapters exported from `src/lib/chapters.ts` | 7 (capture, escape, connect_cut, opening, life_death, endgame, mixed) |
| Tests | 682 across 32 files |
| Feature flags (default off) | `CHILD_ENGINE_EXPLAIN`, `ENGINE_HINT_PROJECTION` |
| Privacy boundary | v0.19/v0.20 `FORBIDDEN_PARENT_FIELDS` stable |
| Deferred/unwired problem IDs | `END-011`, `END-012`, `CAP-022`, `CC-018` |

## 3. Candidate Directions

### 3.1 Wire remaining 4 unwired v0.7.0b problems

**Scope:** Add `END-011`, `END-012`, `CAP-022`, `CC-018` to chapter levels so they appear in chapter navigation and the daily-practice pool.

| Dimension | Assessment |
|---|---|
| Risk | Low — pure data wiring, no algorithm or UI change |
| Product value | Moves reachable pool from 99 to 103 without adding new problem data |
| Privacy impact | None — static JSON wiring only |
| v0.1 boundary fit | Excellent — completes the deferred v0.7.0b wiring |
| Test burden | Low — extend existing `chapters.test.ts` assertions |

**Concerns:** These 4 problems were explicitly deferred in v0.21.0b as "out of scope". They remain valid content but were not wired because the chapter/level structure did not have a natural slot. Wiring them now may require adding new level nodes or inserting into existing levels.

**Coverage note:** Wiring these 4 IDs moves the reachable pool from 99 to 103. The remaining 7 IDs (110 − 103 = 7) are accounted for by: the 4 deferred IDs themselves (now being wired) plus the 3 pre-existing mixed problems (MIX-001..003) that are already wired. The 110 total includes all problem data in `problems.json`; the 99-to-103 reachable pool is the subset accessible through chapter navigation and daily practice. After wiring these 4, the remaining 7 unreachable IDs would be those not assigned to any chapter level — a separate follow-up could address full coverage if desired.

### 3.2 Feature flag enablement / real engine QA

**Scope:** Manual/staging QA for `CHILD_ENGINE_EXPLAIN` and/or `ENGINE_HINT_PROJECTION` with real engine payload availability.

| Dimension | Assessment |
|---|---|
| Risk | Higher — requires real engine payload, privacy verification, staging environment |
| Product value | High if engine payloads are available; zero without them |
| Privacy impact | Must re-verify `FORBIDDEN_PARENT_FIELDS` boundary with live data |
| v0.1 boundary fit | Outside v0.1 scope — v0.1 explicitly excludes AI |
| Test burden | High — manual QA, staging setup, privacy audit |

**Concerns:** Cannot be completed without a running engine (KataGo). Feature flags must not be enabled by default without explicit product decision. This is a gated follow-up that depends on infrastructure not yet in place.

### 3.3 Infrastructure hardening

**Scope:** CI sharding, Docker image size, Playwright reporting/logging, E2E reliability.

| Dimension | Assessment |
|---|---|
| Risk | Low-Medium — infrastructure changes, no user-facing impact |
| Product value | Useful only if CI/runtime friction is now a bottleneck |
| Privacy impact | None |
| v0.1 boundary fit | Neutral — useful but not product-critical |
| Test burden | Medium — may require CI config changes and Docker rebuild |

**Concerns:** Infrastructure work is valuable but does not advance the product toward children using the app. Should be bundled only if CI friction is actively blocking development.

### 3.4 Parent review surface re-open decision

**Scope:** Revisit v0.17/v0.18 parent review assets for potential exposure to parents.

| Dimension | Assessment |
|---|---|
| Risk | Medium — requires explicit gate/product decision |
| Product value | High for parents, but v0.1 boundary explicitly says "no parent UI" |
| Privacy impact | Must re-verify `FORBIDDEN_PARENT_FIELDS` boundary |
| v0.1 boundary fit | Outside v0.1 scope — requires re-opening v0.17/v0.18 "no parent UI, no parent gate" stance |
| Test burden | High — new UI surface, privacy audit, wording review |

**Concerns:** Parent review surface was explicitly deferred in v0.21.0a as requiring a re-opening of the v0.1 stance. This is a product decision, not a technical one.

### 3.5 Documentation baseline refresh / README consistency

**Scope:** Update README and other docs to reflect current v0.21 state.

| Dimension | Assessment |
|---|---|
| Risk | Very low — documentation only |
| Product value | Low — helpful for contributors but not child-facing |
| Privacy impact | None |
| v0.1 boundary fit | Excellent — documentation maintenance is always in scope |
| Test burden | None |

**Concerns:** The README describes an older v0.8-era status. This is useful housekeeping but does not advance the product.

## 4. Recommended Primary v0.22.0b Path

**Recommendation: 3.1 — Wire remaining 4 unwired problems**

### Justification

1. **Lowest risk:** Pure data wiring with no algorithm, UI, or infrastructure change.
2. **Completes deferred work:** These 4 problems were explicitly marked as "deferred to a follow-up slice" in v0.21.0b.
3. **Product value:** Moves the reachable pool from 99 to 103, bringing the chapter navigation closer to full library coverage.
4. **No scope creep:** Does not open any new feature surface, does not require engine payloads, does not require privacy re-audit.
5. **v0.1 boundary preserved:** Stays within the local-first, content-only, no-engine scope.
6. **Test burden:** Minimal — extend existing chapter tests.

### Non-Goals

- No runtime code change.
- No feature flag enablement.
- No engine/KataGo integration.
- No parent review surface.
- No infrastructure change.
- No UI change.
- No algorithm change.

## 5. Forbidden Scope (v0.22.0b)

- No runtime code change.
- No problem data change (problems already exist in `problems.json`).
- No chapter wiring beyond the 4 deferred IDs.
- No UI, route, schema, API, persistence, telemetry, parent surface, engine, package, Docker, CI, or selection algorithm change.
- No feature flag enablement.
- No new AI/Ollama/KataGo integration.
- No README rewrite.

## 6. Acceptance Criteria

- `docs/NEXT_PHASE_PLAN_v0.22.md` exists.
- The document accurately summarizes the v0.21 baseline: 110 problems, 99 wired IDs, 7 chapters, 682 tests / 32 files, default-off flags, deferred 4 unwired IDs.
- The document evaluates the candidate directions with risk, product value, privacy impact, v0.1 boundary fit, and test burden.
- One primary v0.22.0b path is selected with clear justification.
- Non-goals and forbidden changes are explicit.
- `docs/TASKS.md` is updated in both Current Phase and Current strategy sections.
- No runtime/test/build/package/config files are changed.
