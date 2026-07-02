# Next Phase Plan — v0.23

> Planning-only slice. No runtime code change.

## 1. Objective

Create the v0.23 next-phase planning document after the completed v0.22 series. Evaluate candidate directions, pick the safest primary v0.23 path, and update the task queue. This planning document also serves as the foundation for the v0.24+ AI game feature roadmap.

## 2. v0.22 Baseline Summary

| Metric | Value |
|---|---|
| Total problems in `problems.json` | 110 |
| `getAllProblemIds()` wired pool | 103 problem IDs |
| Chapters exported from `src/lib/chapters.ts` | 7 (capture, escape, connect_cut, opening, life_death, endgame, mixed) |
| Tests | 691 across 32 files |
| Feature flags (default off) | `CHILD_ENGINE_EXPLAIN`, `ENGINE_HINT_PROJECTION` |
| Privacy boundary | v0.19/v0.20 `FORBIDDEN_PARENT_FIELDS` stable (30 keys) |
| Unwired problem IDs | 7 remaining (END-011, END-012, CAP-022, CC-018 + 3 others) |

## 3. Candidate Directions

### 3.1 Feature Flag Enablement / QA

**Scope:** Enable `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION` feature flags, perform QA validation.

| Dimension | Assessment |
|---|---|
| Risk | Medium — requires real engine payload verification, privacy re-audit |
| Product value | High — activates previously inert engine-assisted features |
| Privacy impact | Must re-verify `FORBIDDEN_PARENT_FIELDS` boundary with live data |
| v0.1 boundary fit | Outside v0.1 scope — v0.1 explicitly excludes AI |
| Test burden | Medium — manual QA, privacy audit, regression tests |

**Concerns:** Feature flags were intentionally kept off by default. Enabling them requires a product decision and real engine payload availability.

### 3.2 Infrastructure Hardening

**Scope:** CI sharding, Docker image size optimization, Playwright reporting improvements, E2E reliability.

| Dimension | Assessment |
|---|---|
| Risk | Low-Medium — infrastructure changes, no user-facing impact |
| Product value | Useful only if CI/runtime friction is now a bottleneck |
| Privacy impact | None |
| v0.1 boundary fit | Neutral — useful but not product-critical |
| Test burden | Medium — may require CI config changes and Docker rebuild |

**Concerns:** Infrastructure work is valuable but does not advance the product toward children using the app. Should be bundled only if CI friction is actively blocking development.

### 3.3 Remaining 7-Problem Coverage Audit

**Scope:** Audit and wire the remaining 7 unwired problem IDs to achieve full 110-problem chapter/daily-practice coverage.

| Dimension | Assessment |
|---|---|
| Risk | Low — pure data wiring, no algorithm or UI change |
| Product value | Completes the deferred wiring, moves reachable pool from 103 to 110 |
| Privacy impact | None — static JSON wiring only |
| v0.1 boundary fit | Excellent — completes the deferred problem wiring |
| Test burden | Low — extend existing chapter tests |

**Concerns:** These 7 problems were explicitly left unwired in previous slices. They remain valid content but require chapter/level slot identification.

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

### 3.6 AI Game Feature Planning (v0.24+)

**Scope:** Plan AI game feature for v0.24+, including feasibility assessment, architecture design, and implementation roadmap.

| Dimension | Assessment |
|---|---|
| Risk | High — requires new AI integration, architecture changes |
| Product value | High — enables AI sparring, enhances learning experience |
| Privacy impact | Must design new privacy boundaries for game data |
| v0.1 boundary fit | Outside v0.1 scope — requires explicit product decision |
| Test burden | High — new feature, new tests, new QA |

**Concerns:** AI game feature is a major addition that requires careful planning and phased implementation.

## 4. Recommended Primary v0.23 Path

**Recommendation: Complete all deferred work and prepare for v0.24 AI game feature**

### Justification

1. **Completes deferred work:** Finishes the 7-problem wiring and feature flag enablement.
2. **Prepares for AI game:** Creates a stable foundation for v0.24 AI game integration.
3. **Lowest risk:** Conservative approach with minimal new feature surface.
4. **v0.1 boundary preserved:** Stays within the local-first, content-only scope until v0.24.

### v0.23 Slice Plan

| Slice | Description | Risk | Value |
|---|---|---|---|
| v0.23.0a | Planning document (this file) | Very Low | High |
| v0.23.0b | Feature flag enablement / QA | Medium | High |
| v0.23.0c | Infrastructure hardening | Low-Medium | Medium |
| v0.23.0d | Remaining 7-problem coverage | Low | Medium |
| v0.23.0e | Documentation refresh | Very Low | Low |
| v0.23.0f | v0.23 stabilization / release | Low | High |

## 5. Forbidden Scope (v0.23)

- No new AI/Ollama/KataGo integration beyond feature flag enablement
- No parent review surface re-opening
- No new UI surfaces or routes
- No algorithm changes
- No problem data changes (only wiring)
- No schema changes
- No persistence changes
- No package/Docker/CI changes beyond infrastructure hardening

## 6. Acceptance Criteria

- `docs/NEXT_PHASE_PLAN_v0.23.md` exists.
- The document accurately summarizes the v0.22 baseline: 110 problems, 103 wired IDs, 7 chapters, 691 tests / 32 files, default-off flags.
- The document evaluates all candidate directions with risk, product value, privacy impact, v0.1 boundary fit, and test burden.
- One primary v0.23 path is selected with clear justification.
- Non-goals and forbidden changes are explicit.
- `docs/TASKS.md` is updated in both Current Phase and Current strategy sections.
- Only `docs/NEXT_PHASE_PLAN_v0.23.md` and `docs/TASKS.md` are changed in this PR.
