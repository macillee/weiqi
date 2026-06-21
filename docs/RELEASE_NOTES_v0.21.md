# v0.21 — Pack B Chapter/Daily-Practice Wiring

## 1. Summary

v0.21 is the conservative low-risk first implementation slice of the v0.21 series: it wires the 9 v0.20.0d Pack B problems (4 endgame + 5 mixed) into the existing chapter navigation and daily-practice rotation, and fills the missing `mixed` category chapter that the v0.4.0b through v0.7.0b slices never added. No algorithm, no UI, no schema change — the wiring only touches `src/lib/chapters.ts`.

Key principles carried through v0.21:

- **Wiring-only.** v0.21.0a scoped v0.21.0b to "Pack B chapter/daily-practice wiring" as the conservative primary slice. v0.21.0b implements exactly that scope.
- **Backward compatible.** Existing `endgame-1..endgame-4` level ids are preserved. Saved progress and chapter-by-id links still resolve.
- **No selection-algorithm change.** The daily-practice pool automatically samples the newly-wired problems with no change to `selectDailyProblems()`.
- **Privacy boundary preserved.** v0.19.0d / v0.20.0d `FORBIDDEN_PARENT_FIELDS` (30 keys total) is unaffected; the wiring is a data-only change.

## 2. What changed

| Slice | Deliverable | PR |
|---|---|---|
| v0.21.0a | `docs/NEXT_PHASE_PLAN_v0.21.md` — re-anchors v0.20 gated consumer wiring + Pack B content, evaluates 4 candidate directions (Pack B wiring, flag enablement/QA, infrastructure, parent review), recommends Pack B chapter/daily-practice wiring as the primary v0.21 path. Planning-only, no code change. | #219 |
| v0.21.0b | `src/lib/chapters.ts` — new `endgame-5` level with v0.20.0d endgame problems (END-013..016); new `mixed` chapter "综合擂台" with 4 levels (mixed-1..mixed-4) covering all 8 mixed problems (MIX-001..003 from v0.4.0b + MIX-004..008 from Pack B). `getAllProblemIds()` covers 99 problems (was 87). 15 new tests in `src/__tests__/chapters.test.ts` including Pack B exact-once duplicate protection and global no-duplicate regression. | #221 |

### File inventory

New files added in v0.21:

- `docs/NEXT_PHASE_PLAN_v0.21.md` — v0.21.0a planning
- `src/__tests__/chapters.test.ts` — v0.21.0b wiring tests (15 tests)

Modified files:

- `src/lib/chapters.ts` — v0.21.0b new `endgame-5` level + new `mixed` chapter
- `docs/TASKS.md` — current phase and strategy entries updated for v0.21.0a–0b

## 3. What did not change

- No algorithm change (recommendation / selection / practice flow unchanged)
- No UI change (chapters navigation already supports 7 chapters; `chapters.ts` is the source)
- No new route, no navigation link, no end-of-session modal, no report page change
- No persistence change
- No `StudentProgress` schema change
- No Supabase, no auth
- No API route, Server Action change, telemetry, analytics, or external service call
- No new AI / Ollama / KataGo integration
- No package, Docker, CI, or build config change
- No FeedbackDialog change
- `/dev/session-summary` unchanged from v0.17
- v0.20 consumer wiring (gated by `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION`) is unchanged

## 4. v0.21.0b wiring detail

### New `endgame-5` level

Appended at the end of the existing `endgame` chapter. Contains the v0.20.0d Pack B endgame problems (END-013..016), all at level 3-5. The existing `endgame-1..endgame-4` level ids are preserved for backward compatibility with saved progress and chapter-by-id links.

```ts
{ id: "endgame-5", title: "第 5 关", problemIds: ["END-013", "END-014", "END-015", "END-016"] },
```

### New `mixed` chapter "综合擂台"

A new 7th chapter that fills the missing `mixed` category. The v0.4.0b through v0.7.0b slices added MIX-001..003 and MIX-004..008 (Pack B) but never created a `mixed` chapter to host them. v0.21.0b creates it.

```ts
{
  id: "mixed",
  title: "综合擂台",
  emoji: "🏟️",
  description: "多种功夫都用上",
  levels: [
    { id: "mixed-1", title: "第 1 关", problemIds: ["MIX-001", "MIX-002"] },
    { id: "mixed-2", title: "第 2 关", problemIds: ["MIX-003", "MIX-004"] },
    { id: "mixed-3", title: "第 3 关", problemIds: ["MIX-005", "MIX-006"] },
    { id: "mixed-4", title: "第 4 关", problemIds: ["MIX-007", "MIX-008"] },
  ],
}
```

### Daily-practice pool coverage

`getAllProblemIds()` now covers 99 problems (was 87). The 12 newly-wired entries:

- v0.20.0d Pack B (9): END-013, END-014, END-015, END-016, MIX-004, MIX-005, MIX-006, MIX-007, MIX-008
- v0.4.0b MIX (3): MIX-001, MIX-002, MIX-003

`selectDailyProblems()` automatically samples from the expanded pool with no algorithm change.

### Out of scope (deferred)

- **END-011, END-012** (v0.7.0b endgame additions to `problems.json` but never wired into a chapter)
- **CAP-022, CC-018** (v0.7.0b additions to `problems.json` but never wired into a chapter)
- **MULTI-008, MULTI-009** were already wired in v0.8 (in `connect-cut-8` and `escape-8` respectively); no change needed

Wiring these 4 unwired problems (END-011, END-012, CAP-022, CC-018) is a follow-up slice, not in v0.21.0b scope per the v0.21.0a plan.

## 5. Privacy and data minimization

- No engine data is touched. v0.19.0d / v0.20.0d `FORBIDDEN_PARENT_FIELDS` (30 keys total: v0.18 14 + v0.19.0d 16 engine / KataGo) is preserved end-to-end. The wiring only adds chapter level entries; no engine output, no telemetry, no parent-visible surface change.
- `chapters.ts` is a data-only module. No `localStorage` write, no `fetch` call, no telemetry.
- v0.20.0b/0c wiring inert-by-default design is preserved: `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION` flags still default off. The new wiring does not change any v0.20 behavior.

## 6. Testing and validation

| Area | Count | Scope |
|---|---|---|
| `chapters.test.ts` (v0.21.0b) | 15 | chapter structure (7 chapters, unique ids), level uniqueness, every problemId resolves to a problem in problems.json, endgame-5 wires END-013..016, endgame-1..endgame-4 preserved, mixed chapter wires all 8 mixed problems, mixed-1..4 exist, categoryLabels mixed entry, daily pool scope assertion (12 v0.21.0b-scope entries reachable), out-of-scope assertion (END-011/012/CAP-022/CC-018 unwired), Pack B chapter placement, **Pack B exact-once duplicate protection**, **global no-duplicate regression** |
| **Total in project** | **682** | **32 test files** |

All checks pass on CI:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 682 passed (32 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## 7. Known limitations

- The 4 unwired v0.7.0b additions (END-011, END-012, CAP-022, CC-018) remain in `problems.json` but are not reachable from chapter navigation or daily-practice rotation. Wiring these is a follow-up slice, deferred from v0.21.0b per the v0.21.0a plan.
- v0.20.0b / v0.20.0c feature flags remain default off. v0.21 does not enable them; enablement is a v0.22+ follow-up candidate.
- No pre-warming, no success-path engine reasoning — all deferred to v0.22+.
- No parent review surface re-opening — deferred to v0.22+ per the v0.21.0a plan.

## 8. Recommended next phase

**v0.22.0a — Next-Phase Plan (planning-only slice)**

The v0.21 series is intentionally small: one planning slice (0a), one wiring slice (0b), one stabilization slice (0c). Candidates for v0.22+:

- **Wire the remaining 4 unwired v0.7.0b problems** (END-011, END-012, CAP-022, CC-018) into chapters. Small, low-risk, completes the chapter-coverage audit.
- **Feature flag enablement / QA** for `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION`. Higher value once we have real engine data; for now, both flags are inert by default.
- **Infrastructure** (CI shard, Docker image slim, Playwright reporter upgrade). Defer until CI becomes a bottleneck.
- **Parent review surface** (re-open v0.17 / v0.18 "no parent UI" stance). Requires fresh product decision.

The next phase should be a planning-only slice (`v0.22.0a`) that evaluates these candidates and writes the slice plan before any integration code is written.
