# Next Phase Plan — v0.24

> Planning-only slice. No runtime code change.

## 1. Objective

Create the v0.24 next-phase planning document after the completed v0.23 series. Evaluate candidate directions, pick the safest primary v0.24 path, and update the task queue.

## 2. v0.23 Baseline Summary

| Metric | Value |
|---|---|
| Total problems in `problems.json` | 110 |
| `getAllProblemIds()` wired pool | 110 problem IDs (full library coverage) |
| Unwired problem IDs | 0 — all 110 problems are now reachable |
| Chapters exported from `src/lib/chapters.ts` | 7 (capture, escape, connect_cut, opening, life_death, endgame, mixed) |
| Tests | 705 across 32 files |
| Feature flags (default off) | `CHILD_ENGINE_EXPLAIN`, `ENGINE_HINT_PROJECTION` |
| Privacy boundary | v0.19/v0.20 `FORBIDDEN_PARENT_FIELDS` stable (30 keys) |

## 3. Candidate Directions

### 3.1 Intermediate Content Expansion

**Scope:** Add new level 3–5 problems (capture / escape / connect_cut / life_death / opening / endgame / mixed) to deepen the library beyond the current 110, following the v0.15 Pack A and v0.20 Pack B content-only pattern. New IDs extend the existing `CAP-`, `ESC-`, `CC-`, `LD-`, `OP-`, `END-`, `MIX-` namespaces; new chapters.ts level nodes appended where needed.

| Dimension | Assessment |
|---|---|
| Risk | Low — pure data + content-only wiring, same pattern as v0.7/v0.15/v0.20/v0.21/v0.22 |
| Product value | High — more curated level 3–5 depth in the thinner categories directly helps the target child learner; note the current library is **not** low-level skewed (see §3.1.1) |
| Privacy impact | None — static JSON + chapters.ts wiring only |
| v0.1 boundary fit | Excellent — content-only, no engine, no auth, no UI surface change |
| Test burden | Low — extend existing `problems.test.ts` and `chapters.test.ts` with count + constraint assertions |

**Concerns:** Needs human-reviewed board/answer reasoning per problem (carried by content review doc). No algorithm change otherwise.

#### 3.1.1 Current library level / category distribution (measured)

Measured from `src/data/problems.json` (110 problems):

| Level | Count |
|---|---:|
| L1 | 10 |
| L2 | 33 |
| L3 | 28 |
| L4 | 23 |
| L5 | 16 |

- L1–L2 = **43**; L3–L5 = **67**. The library is already intermediate-weighted, not low-level skewed.

| Category | Count |
|---|---:|
| capture | 25 |
| connect_cut | 19 |
| endgame | 16 |
| life_death | 15 |
| escape | 15 |
| opening | 12 |
| mixed | 8 |

- The thin categories are `opening` (12), `mixed` (8), `life_death` (15), `escape` (15). `capture` (25) and `connect_cut` (19) are the densest.

**Implication for v0.24.0b:** expansion should target the thinner categories and stay in level 3–5 (L1–L2 is already well covered at 43), rather than "raising a low-level-skewed library".

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

**Scope:** Update README and other docs to reflect current v0.23 state (full 110-problem coverage, 7 chapters, current feature-flag status).

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

## 4. Recommended Primary v0.24 Path

**Recommendation: 3.1 — Intermediate Content Expansion**

### Justification

1. **Lowest product-risk of the high-value options:** Pure data + content-only wiring, identical to the proven v0.7 / v0.15 / v0.20 / v0.21 / v0.22 content pattern.
2. **Highest child-facing value now:** With all 110 problems wired and already intermediate-weighted (L3–L5 = 67 of 110), the value of v0.24 is to deepen the **thinner categories** (opening, mixed, life_death, escape) with curated level 3–5 problems, directly serving the target learner (学棋约一年) and addressing the v0.12/v0.15 intermediate-progression intent.
3. **No scope creep:** Stays within local-first, content-only, no-engine scope. No UI, route, algorithm, persistence, parent-surface, or engine change.
4. **Reuses existing test infrastructure:** Extends `problems.test.ts` (count, level 3–5 + category constraint, no duplicate coordinates, answers on empty intersections, copy length, banned-phrase regression) and `chapters.test.ts` (new level nodes, exact-once, global no-duplicate) — no new harness.
5. **v0.1 boundary preserved.**

### Non-Goals

- No feature flag enablement.
- No engine/KataGo integration.
- No parent review surface.
- No infrastructure change.
- No UI change.
- No algorithm change.

## 5. Forbidden Scope (v0.24.0b)

- No runtime/algorithm change (recommendation / selection / practice flow unchanged).
- No UI, route, schema, API, persistence, telemetry, parent surface, engine, package, Docker, CI, or selection-algorithm change.
- No feature flag enablement.
- No new AI/Ollama/KataGo integration.
- No README rewrite (deferred to 3.4 if desired separately).

**Note:** v0.24.0b is a content-only expansion slice. It will touch `src/data/problems.json` (new problems) and `src/lib/chapters.ts` (new level nodes to expose them), plus extend `src/__tests__/problems.test.ts` and `src/__tests__/chapters.test.ts`. All other runtime, build, and config files remain unchanged.

## 6. Proposed v0.24.0b Expansion Scope (capped)

This section bounds the content expansion so implementation can be objectively judged against scope. All numbers below are the **target**; every individual problem still requires human board/answer reasoning review (recorded in `docs/CONTENT_REVIEW_v0.24.md`).

### 6.1 Target totals

| Metric | v0.23 baseline | v0.24.0b target |
|---|---:|---:|
| Total problems | 110 | **122** (+12) |
| L1–L2 count | 43 | 43 (unchanged — no new low-level problems) |
| L3–L5 count | 67 | **79** (+12) |

### 6.2 Category allocation and ID assignment

New problems continue existing namespaces; no new namespace is introduced.

| Category | New IDs | Count | Resulting category total |
|---|---|---:|---:|
| opening | OP-013, OP-014, OP-015, OP-016 | 4 | 12 → 16 |
| mixed | MIX-009, MIX-010, MIX-011, MIX-012 | 4 | 8 → 12 |
| life_death | LD-014, LD-015 | 2 | 15 → 17 |
| escape | ESC-015, ESC-016 | 2 | 15 → 17 |
| connect_cut | — | 0 | 19 (unchanged) |
| capture | — | 0 | 25 (unchanged) |
| endgame | — | 0 | 16 (unchanged) |
| **Total** | | **12** | **122** |

Rationale: expansion targets the four thinnest categories (opening 12, mixed 8, life_death 15, escape 15). `connect_cut` (19) and `capture` (25) are the two densest categories and are left unchanged; `endgame` (16) is also left unchanged to keep the slice focused on the genuinely thin categories. The 2 problems originally sketched under `connect_cut` have been reassigned to `opening` and `mixed` (the two thinnest), preserving the +12 total and the "thinnest categories only" rule.

### 6.3 Level matrix (all new problems level 3–5)

| Category | L3 | L4 | L5 | Sum |
|---|---:|---:|---:|---:|
| opening | 2 | 2 | 0 | 4 |
| mixed | 1 | 1 | 2 | 4 |
| life_death | 1 | 0 | 1 | 2 |
| escape | 1 | 1 | 0 | 2 |
| **Total** | **5** | **4** | **3** | **12** |

### 6.4 `chapters.ts` wiring (append-only)

New level nodes appended at the end of each affected chapter (existing level ids preserved):

| Chapter | New level id | problemIds |
|---|---|---|
| opening | `opening-7` | OP-013, OP-014, OP-015, OP-016 |
| mixed | `mixed-5` | MIX-009, MIX-010, MIX-011, MIX-012 |
| life_death | `life-death-8` | LD-014, LD-015 |
| escape | `escape-10` | ESC-015, ESC-016 |

### 6.5 Test extensions

- `src/__tests__/problems.test.ts`: library count assertion 110 → 122; level 3–5 + category constraint per new ID; no duplicate coordinates; answers on empty intersections; copy length; warm-copy banned-phrase regression.
- `src/__tests__/chapters.test.ts`: 4 new level nodes exist (`opening-7`, `mixed-5`, `life-death-8`, `escape-10`); each new ID resolves; `getAllProblemIds()` = 122; exact-once duplicate protection; global no-duplicate regression; daily-pool scope assertion (122 total).

### 6.6 Hard limits (out-of-scope if exceeded)

- New problem count must be **exactly 12** (total 122).
- No new namespace; only `OP / MIX / LD / ESC` extensions above.
- No L1 or L2 problems added.
- No change to `capture` or `endgame` categories.
- No runtime/algorithm/UI/route/persistence/engine/parent-surface change.

## 7. Acceptance Criteria

- `docs/NEXT_PHASE_PLAN_v0.24.md` exists.
- The document accurately summarizes the v0.23 baseline: 110 problems, 110 wired IDs, 0 unwired IDs, 7 chapters, 705 tests / 32 files, default-off flags.
- The document evaluates the candidate directions with risk, product value, privacy impact, v0.1 boundary fit, and test burden.
- One primary v0.24.0b path is selected with clear justification.
- Non-goals and forbidden changes are explicit.
- `docs/TASKS.md` is updated with a single new entry in the Current Phase section (append only, no rewrite of historical entries).
- Only `docs/NEXT_PHASE_PLAN_v0.24.md` and `docs/TASKS.md` are changed in this PR.
