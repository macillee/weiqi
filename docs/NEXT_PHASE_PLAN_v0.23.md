# Next Phase Plan — v0.23

> Planning-only slice. No runtime code change.

## 1. Objective

Create the v0.23 next-phase planning document after the completed v0.22 series. Evaluate candidate directions, pick the safest primary v0.23 path, and update the task queue.

## 2. v0.22 Baseline Summary

| Metric | Value |
|---|---|
| Total problems in `problems.json` | 110 |
| `getAllProblemIds()` wired pool | 103 problem IDs |
| Unwired problem IDs | 7 remaining (CAP-021, CC-017, ESC-013, ESC-014, LD-013, OP-011, OP-012) |
| Chapters exported from `src/lib/chapters.ts` | 7 (capture, escape, connect_cut, opening, life_death, endgame, mixed) |
| Tests | 691 across 32 files |
| Feature flags (default off) | `CHILD_ENGINE_EXPLAIN`, `ENGINE_HINT_PROJECTION` |
| Privacy boundary | v0.19/v0.20 `FORBIDDEN_PARENT_FIELDS` stable (30 keys) |

## 3. Candidate Directions

### 3.1 Wire Remaining 7 Unwired Problems

**Scope:** Add the 7 remaining unwired problem IDs (CAP-021, CC-017, ESC-013, ESC-014, LD-013, OP-011, OP-012) to chapter navigation and the daily-practice pool.

| Dimension | Assessment |
|---|---|
| Risk | Low — pure data wiring, no algorithm or UI change |
| Product value | Moves reachable pool from 103 to 110, completing full library coverage |
| Privacy impact | None — static JSON wiring only |
| v0.1 boundary fit | Excellent — completes the deferred problem wiring |
| Test burden | Low — extend existing chapter tests |

**Concerns:** These 7 problems were left unwired in previous slices. They remain valid content but require chapter/level slot identification.

### 3.2 Feature Flag Enablement / QA

**Scope:** Enable `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION` feature flags, perform QA validation.

| Dimension | Assessment |
|---|---|
| Risk | Medium — requires real engine payload verification, privacy re-audit |
| Product value | High — activates previously inert engine-assisted features |
| Privacy impact | Must re-verify `FORBIDDEN_PARENT_FIELDS` boundary with live data |
| v0.1 boundary fit | Outside v0.1 scope — v0.1 explicitly excludes AI |
| Test burden | Medium — manual QA, privacy audit, regression tests |

**Concerns:** Feature flags were intentionally kept off by default. Enabling them requires a product decision and real engine payload availability.

### 3.3 Infrastructure Hardening

**Scope:** CI sharding, Docker image size optimization, Playwright reporting improvements, E2E reliability.

| Dimension | Assessment |
|---|---|
| Risk | Low-Medium — infrastructure changes, no user-facing impact |
| Product value | Useful only if CI/runtime friction is now a bottleneck |
| Privacy impact | None |
| v0.1 boundary fit | Neutral — useful but not product-critical |
| Test burden | Medium — may require CI config changes and Docker rebuild |

**Concerns:** Infrastructure work is valuable but does not advance the product toward children using the app. Should be bundled only if CI friction is actively blocking development.

### 3.4 Documentation Baseline Refresh

**Scope:** Update README and other docs to reflect current v0.22 state.

| Dimension | Assessment |
|---|---|
| Risk | Very low — documentation only |
| Product value | Low — helpful for contributors but not child-facing |
| Privacy impact | None |
| v0.1 boundary fit | Excellent — documentation maintenance is always in scope |
| Test burden | None |

**Concerns:** The README describes an older v0.8-era status. This is useful housekeeping but does not advance the product.

### 3.5 Parent Review Surface Re-open Decision

**Scope:** Revisit v0.17/v0.18 parent review assets for potential exposure to parents.

| Dimension | Assessment |
|---|---|
| Risk | Medium — requires explicit gate/product decision |
| Product value | High for parents, but v0.1 boundary explicitly says "no parent UI" |
| Privacy impact | Must re-verify `FORBIDDEN_PARENT_FIELDS` boundary |
| v0.1 boundary fit | Outside v0.1 scope — requires re-opening v0.17/v0.18 "no parent UI, no parent gate" stance |
| Test burden | High — new UI surface, privacy audit, wording review |

**Concerns:** Parent review surface was explicitly deferred in v0.21.0a as requiring a re-opening of the v0.1 stance. This is a product decision, not a technical one.

## 4. Recommended Primary v0.23 Path

**Recommendation: 3.1 — Wire remaining 7 unwired problems**

### Justification

1. **Lowest risk:** Pure data wiring with no algorithm, UI, or infrastructure change.
2. **Completes deferred work:** These 7 problems were explicitly left unwired in previous slices.
3. **Product value:** Moves the reachable pool from 103 to 110, achieving full library coverage.
4. **No scope creep:** Does not open any new feature surface, does not require engine payloads, does not require privacy re-audit.
5. **v0.1 boundary preserved:** Stays within the local-first, content-only, no-engine scope.
6. **Test burden:** Minimal — extend existing chapter tests.

### Non-Goals

- No feature flag enablement.
- No engine/KataGo integration.
- No parent review surface.
- No infrastructure change.
- No UI change.
- No algorithm change.

## 5. Forbidden Scope (v0.23.0b)

- No problem data change (problems already exist in `problems.json`).
- No chapter wiring beyond the 7 remaining IDs.
- No UI, route, schema, API, persistence, telemetry, parent surface, engine, package, Docker, CI, or selection algorithm change.
- No feature flag enablement.
- No new AI/Ollama/KataGo integration.
- No README rewrite.

**Note:** v0.23.0b is a narrow chapter-wiring slice. It will touch `src/lib/chapters.ts` and `src/__tests__/chapters.test.ts` to add the 7 remaining problem IDs to chapter levels. All other runtime, build, and config files remain unchanged.

## 6. Acceptance Criteria

- `docs/NEXT_PHASE_PLAN_v0.23.md` exists.
- The document accurately summarizes the v0.22 baseline: 110 problems, 103 wired IDs, 7 remaining unwired IDs, 7 chapters, 691 tests / 32 files, default-off flags.
- The document evaluates the candidate directions with risk, product value, privacy impact, v0.1 boundary fit, and test burden.
- One primary v0.23.0b path is selected with clear justification.
- Non-goals and forbidden changes are explicit.
- `docs/TASKS.md` is updated with a single new entry in the Current Phase section (append only, no rewrite of historical entries).
- Only `docs/NEXT_PHASE_PLAN_v0.23.md` and `docs/TASKS.md` are changed in this PR.
