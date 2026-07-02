# v0.22 — Wire Remaining 4 Unwired v0.7.0b Problems

## 1. Summary

v0.22 completes the deferred wiring of 4 v0.7.0b problem IDs into chapter navigation and the daily-practice pool. The v0.21.0b slice intentionally left these 4 IDs unwired; v0.22.0b now wires them into category-correct chapter levels.

Key principles carried through v0.22:

- **Wiring-only.** v0.22.0a scoped v0.22.0b to "wire the 4 deferred v0.7.0b problems" as the conservative primary slice. v0.22.0b implements exactly that scope.
- **Backward compatible.** All existing chapter and level IDs are preserved. No renumbering.
- **No selection-algorithm change.** The daily-practice pool automatically samples the newly-wired problems with no change to `selectDailyProblems()`.
- **Privacy boundary preserved.** v0.19.0d / v0.20.0d `FORBIDDEN_PARENT_FIELDS` (30 keys total) is unaffected; the wiring is a data-only change.

## 2. What changed

| Slice | Deliverable | PR |
|---|---|---|
| v0.22.0a | `docs/NEXT_PHASE_PLAN_v0.22.md` — re-anchors v0.21 baseline, evaluates 5 candidate directions, recommends wiring the 4 deferred v0.7.0b problems as the primary v0.22 path. Planning-only, no code change. | #225 |
| v0.22.0b | `src/lib/chapters.ts` — 3 new level nodes: `endgame-6` (END-011, END-012), `capture-13` (CAP-022), `connect-cut-9` (CC-018). `getAllProblemIds()` covers 103 problems (was 99). 10 new v0.22.0b tests added, 1 obsolete v0.21.0b negative test removed (net +9, 691 total across 32 files). | #227 |

### File inventory

New files added in v0.22:

- `docs/NEXT_PHASE_PLAN_v0.22.md` — v0.22.0a planning
- `docs/RELEASE_NOTES_v0.22.md` — this file
- `docs/QA_CHECKLIST_v0.22.md` — v0.22 QA checklist

Modified files:

- `src/lib/chapters.ts` — v0.22.0b new `endgame-6`, `capture-13`, `connect-cut-9` levels
- `src/__tests__/chapters.test.ts` — v0.22.0b tests (10 new, 1 removed)
- `docs/TASKS.md` — current phase and strategy entries updated for v0.22.0a–0c

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

## 4. v0.22.0b wiring detail

### New `endgame-6` level

Appended at the end of the existing `endgame` chapter. Contains the deferred v0.7.0b endgame problems END-011 and END-012.

```ts
{ id: "endgame-6", title: "第 6 关", problemIds: ["END-011", "END-012"] },
```

### New `capture-13` level

Appended at the end of the existing `capture` chapter. Contains the deferred v0.7.0b capture problem CAP-022.

```ts
{ id: "capture-13", title: "第 13 关", problemIds: ["CAP-022"] },
```

### New `connect-cut-9` level

Appended at the end of the existing `connect_cut` chapter. Contains the deferred v0.7.0b connect_cut problem CC-018.

```ts
{ id: "connect-cut-9", title: "第 9 关", problemIds: ["CC-018"] },
```

### Daily-practice pool coverage

`getAllProblemIds()` now covers 103 problems (was 99). The 4 newly-wired entries:

- END-011, END-012 (endgame)
- CAP-022 (capture)
- CC-018 (connect_cut)

`selectDailyProblems()` automatically samples from the expanded pool with no algorithm change.

### Remaining out of scope

Full 110-problem chapter/daily-practice coverage remains out of scope until a separate coverage audit identifies and plans the remaining 7 currently-unwired problem IDs.

## 5. Privacy and data minimization

- No engine data is touched. v0.19.0d / v0.20.0d `FORBIDDEN_PARENT_FIELDS` (30 keys total: v0.18 14 + v0.19.0d 16 engine / KataGo) is preserved end-to-end. The wiring only adds chapter level entries; no engine output, no telemetry, no parent-visible surface change.
- `chapters.ts` is a data-only module. No `localStorage` write, no `fetch` call, no telemetry.
- v0.20.0b/0c wiring inert-by-default design is preserved: `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION` flags still default off.

## 6. Testing and validation

| Area | Count | Scope |
|---|---|---|
| `chapters.test.ts` (v0.22.0b) | 24 | chapter structure (7 chapters, unique ids), level uniqueness, every problemId resolves, endgame-5 Pack B preserved, endgame-6 wires END-011/012, capture-13 wires CAP-022, connect-cut-9 wires CC-018, mixed chapter preserved, categoryLabels mixed entry, daily pool scope assertion (103 total), exact-once duplicate protection, global no-duplicate regression |
| **Total in project** | **691** | **32 test files** |

All checks pass on CI:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 691 passed (32 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## 7. Known limitations

- Full 110-problem chapter/daily-practice coverage remains out of scope until a separate coverage audit identifies and plans the remaining 7 currently-unwired problem IDs.
- v0.20.0b / v0.20.0c feature flags remain default off. v0.22 does not enable them; enablement is a future follow-up candidate.
- No pre-warming, no success-path engine reasoning — all deferred to future slices.
- No parent review surface re-opening — deferred to future slices per the v0.21.0a plan.

## 8. Recommended next phase

**v0.23.0a — Next-Phase Plan (planning-only slice)**

The v0.22 series is intentionally small: one planning slice (0a), one wiring slice (0b), one stabilization slice (0c). Candidates for v0.23+:

- **Feature flag enablement / QA** for `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION`. Higher value once we have real engine data; for now, both flags are inert by default.
- **Infrastructure** (CI shard, Docker image slim, Playwright reporter upgrade). Defer until CI becomes a bottleneck.
- **Parent review surface** (re-open v0.17 / v0.18 "no parent UI" stance). Requires fresh product decision.
- **Remaining 7-problem coverage audit** to achieve full 110-problem reachability.

The next phase should be a planning-only slice (`v0.23.0a`) that evaluates these candidates and writes the slice plan before any integration code is written.
