# v0.23 — Wire Remaining 7 Unwired v0.7.0b Problems

## 1. Summary

v0.23 completes the deferred wiring of the final 7 v0.7.0b problem IDs into chapter navigation and the daily-practice pool. After the v0.22.0b slice left 7 IDs unwired (CAP-021, CC-017, ESC-013, ESC-014, LD-013, OP-011, OP-012), v0.23.0b now wires all of them into category-correct chapter levels, achieving **full 110-problem library coverage**.

Key principles carried through v0.23:

- **Wiring-only.** v0.23.0a scoped v0.23.0b to "wire the 7 remaining unwired problems" as the conservative primary slice. v0.23.0b implements exactly that scope.
- **Backward compatible.** All existing chapter and level IDs are preserved. No renumbering.
- **No selection-algorithm change.** The daily-practice pool automatically samples the newly-wired problems with no change to `selectDailyProblems()`.
- **Privacy boundary preserved.** v0.19.0d / v0.20.0d `FORBIDDEN_PARENT_FIELDS` (30 keys total) is unaffected; the wiring is a data-only change.
- **Full coverage achieved.** 110 problems now all reachable from chapter navigation and the daily-practice pool.

## 2. What changed

| Slice | Deliverable | PR |
|---|---|---|
| v0.23.0a | `docs/NEXT_PHASE_PLAN_v0.23.md` — re-anchors v0.22 baseline, evaluates 5 candidate directions, recommends wiring the 7 remaining unwired problems as the primary v0.23 path. Planning-only, no code change. | pending |
| v0.23.0b | `src/lib/chapters.ts` — 5 new level nodes: `capture-14` (CAP-021), `escape-9` (ESC-013, ESC-014), `connect-cut-10` (CC-017), `opening-6` (OP-011, OP-012), `life-death-7` (LD-013). `getAllProblemIds()` covers 110 problems (was 103). 14 new v0.23.0b tests added, 1 v0.22.0b count assertion relaxed to `>= 103` (net +14, 705 total across 32 files). | pending |

### File inventory

New files added in v0.23:

- `docs/NEXT_PHASE_PLAN_v0.23.md` — v0.23.0a planning
- `docs/RELEASE_NOTES_v0.23.md` — this file
- `docs/QA_CHECKLIST_v0.23.md` — v0.23 QA checklist

Modified files:

- `src/lib/chapters.ts` — v0.23.0b new `capture-14`, `escape-9`, `connect-cut-10`, `opening-6`, `life-death-7` levels
- `src/__tests__/chapters.test.ts` — v0.23.0b tests (14 new, 1 relaxed)
- `docs/TASKS.md` — current phase and strategy entries updated for v0.23.0a–0c

## 3. What did not change

- No algorithm change (recommendation / selection / practice flow unchanged)
- No UI change (chapter navigation already supports 7 chapters; `chapters.ts` is the source)
- No new route, no navigation link, no end-of-session modal, no report page change
- No persistence change
- No `StudentProgress` schema change
- No Supabase change, no auth change
- No API route, Server Action change, telemetry, analytics, or external service call
- No new AI / Ollama / KataGo integration
- No package, Docker, CI, or build config change
- No FeedbackDialog change
- `/dev/session-summary` unchanged from v0.17
- v0.20 consumer wiring (gated by `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION`) is unchanged

## 4. v0.23.0b wiring detail

### New `capture-14` level

Appended at the end of the existing `capture` chapter. Contains the deferred v0.7.0b capture problem CAP-021.

```ts
{ id: "capture-14", title: "第 14 关", problemIds: ["CAP-021"] },
```

### New `escape-9` level

Appended at the end of the existing `escape` chapter. Contains the deferred v0.7.0b escape problems ESC-013 and ESC-014.

```ts
{ id: "escape-9", title: "第 9 关", problemIds: ["ESC-013", "ESC-014"] },
```

### New `connect-cut-10` level

Appended at the end of the existing `connect_cut` chapter. Contains the deferred v0.7.0b connect_cut problem CC-017.

```ts
{ id: "connect-cut-10", title: "第 10 关", problemIds: ["CC-017"] },
```

### New `opening-6` level

Appended at the end of the existing `opening` chapter. Contains the deferred v0.7.0b opening problems OP-011 and OP-012.

```ts
{ id: "opening-6", title: "第 6 关", problemIds: ["OP-011", "OP-012"] },
```

### New `life-death-7` level

Appended at the end of the existing `life_death` chapter. Contains the deferred v0.7.0b life_death problem LD-013.

```ts
{ id: "life-death-7", title: "第 7 关", problemIds: ["LD-013"] },
```

### Daily-practice pool coverage

`getAllProblemIds()` now covers 110 problems (was 103), completing full library coverage. The 7 newly-wired entries:

- CAP-021 (capture)
- ESC-013, ESC-014 (escape)
- CC-017 (connect_cut)
- OP-011, OP-012 (opening)
- LD-013 (life_death)

`selectDailyProblems()` automatically samples from the expanded pool with no algorithm change.

### Remaining out of scope

None — all 110 problems in `problems.json` are now wired into chapter navigation and the daily-practice pool. The v0.22.0b "remaining 7" gap is fully closed by v0.23.0b.

## 5. Privacy and data minimization

- No engine data is touched. v0.19.0d / v0.20.0d `FORBIDDEN_PARENT_FIELDS` (30 keys total: v0.18 14 + v0.19.0d 16 engine / KataGo) is preserved end-to-end. The wiring only adds chapter level entries; no engine output, no telemetry, no parent-visible surface change.
- `chapters.ts` is a data-only module. No `localStorage` write, no `fetch` call, no telemetry.
- v0.20.0b/0c wiring inert-by-default design is preserved: `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION` flags still default off.

## 6. Testing and validation

| Area | Count | Scope |
|---|---|---|
| `chapters.test.ts` (v0.23.0b) | 25 | chapter structure (7 chapters, unique ids), level uniqueness, every problemId resolves, 5 new levels (capture-14 / escape-9 / connect-cut-10 / opening-6 / life-death-7), exact-once duplicate protection, global no-duplicate regression, existing v0.21.0b / v0.22.0b wiring preserved, daily pool scope assertion (110 total) |
| **Total in project** | **705** | **32 test files** |

All checks pass on CI:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 705 passed (32 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## 7. Known limitations

- v0.20.0b / v0.20.0c feature flags remain default off. v0.23 does not enable them; enablement is a future follow-up candidate.
- No pre-warming, no success-path engine reasoning — all deferred to future slices.
- No parent review surface re-opening — deferred to future slices per the v0.21.0a plan.

## 8. Recommended next phase

**v0.24 — candidate directions**

The v0.23 series is intentionally small: one planning slice (0a), one wiring slice (0b), one stabilization slice (0c). With full 110-problem coverage achieved, candidates for v0.24+:

- **Feature flag enablement / QA** for `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION`. Higher value once we have real engine data; for now, both flags are inert by default.
- **Infrastructure** (CI shard, Docker image slim, Playwright reporter upgrade). Defer until CI becomes a bottleneck.
- **Parent review surface** (re-open v0.17 / v0.18 "no parent UI" stance). Requires fresh product decision.
- **Documentation baseline refresh** to reflect the current v0.23 state (README describes an older v0.8-era status).

The next phase should be a planning-only slice that evaluates these candidates and writes the slice plan before any integration code is written.
