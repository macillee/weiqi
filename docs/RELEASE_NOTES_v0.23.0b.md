# v0.23.0b — Feature Flag Enablement / QA

## 1. Summary

v0.23.0b enables the `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION` feature flags that were previously implemented but kept off by default. This slice activates the v0.20.0b consumer wiring for multi-step wrong attempts and the v0.20.0c engine hint projection for single highlight on the board.

Key principles carried through v0.23.0b:

- **Enablement-only.** v0.23.0b changes only the default values of existing feature flags. No new logic, no new components, no new routes.
- **Backward compatible.** All existing functionality is preserved. Users can still override flags via environment variables or runtime setters.
- **Privacy boundary preserved.** v0.19.0d / v0.20.0d `FORBIDDEN_PARENT_FIELDS` (30 keys total) is unaffected; the enablement is a flag-value change only.

## 2. What changed

| Slice | Deliverable | PR |
|---|---|---|
| v0.23.0b | `src/lib/child-engine-explain.ts` — default changed from `false` to `true`; `src/lib/engine-hint.ts` — default changed from `false` to `true`; test updates for new defaults | #TBD |

### File inventory

Modified files:

- `src/lib/child-engine-explain.ts` — `getChildEngineExplainFlag()` default changed from `false` to `true`; JSDoc updated
- `src/lib/engine-hint.ts` — `getEngineHintProjectionFlag()` default changed from `false` to `true`; JSDoc updated
- `src/__tests__/child-engine-explain.test.ts` — default test updated, flag-off test updated
- `src/__tests__/engine-hint.test.ts` — default test updated

## 3. What did not change

- No new AI / Ollama / KataGo integration
- No new components, pages, or routes
- No UI change (the features were already wired; they now activate by default)
- No persistence change
- No `StudentProgress` schema change
- No Supabase change, no auth change
- No API route, Server Action change, telemetry, analytics, or external service call
- No package, Docker, CI, or build config change
- No FeedbackDialog change
- `/dev/session-summary` unchanged

## 4. Feature flag enablement detail

### CHILD_ENGINE_EXPLAIN

When this flag is on (now the default), `ProblemPlayer` routes the multi-step wrong-attempt "请老师帮忙" button through the v0.20.0b local-only `handleShowChildCoach` path instead of the v0.13 / v0.19 server-action `handleShowCoach` path.

**Impact:**
- Multi-step problems: "请老师帮忙" button now uses local rule-template wording
- Single-step problems: Unaffected (still uses server-action path)
- Flag-off behavior: Users can set `CHILD_ENGINE_EXPLAIN=false` to revert to v0.19 behavior

### ENGINE_HINT_PROJECTION

When this flag is on (now the default), `ProblemPlayer` projects a single `hint` highlight on the board after the first wrong attempt when `buildEngineHint()` returns a usable hint.

**Impact:**
- First wrong attempt: Board may show a hint highlight (when engine signal and topMoves are available)
- Subsequent attempts: Unaffected
- Flag-off behavior: Users can set `ENGINE_HINT_PROJECTION=false` to revert to v0.19 behavior

## 5. Privacy and data minimization

- No engine data is touched. v0.19.0d / v0.20.0d `FORBIDDEN_PARENT_FIELDS` (30 keys total) is preserved end-to-end.
- The enablement only changes default flag values; no new data flows, no new telemetry, no new parent-visible surface change.
- Users can override flags via environment variables to opt out.

## 6. Testing and validation

| Area | Count | Scope |
|---|---|---|
| `child-engine-explain.test.ts` | 31 | Default on, flag-off test updated |
| `engine-hint.test.ts` | 15 | Default on |
| **Total in project** | **691** | **32 test files** |

All checks pass:

| Check | Result |
|---|---|
| `npm run test` | 691 passed (32 files) |
| `npm run build` | Compiled successfully |

## 7. Known limitations

- The engine hint projection (`ENGINE_HINT_PROJECTION`) currently passes `topMoves: undefined` and a low-confidence signal, so the helper's `low-confidence` gate fires and returns `no-hint` unless a real engine payload is provided by a future slice.
- The child engine explain (`CHILD_ENGINE_EXPLAIN`) path does not have a real engine signal, so the helper's `source` gate renders `rule-template` (no `engine-assisted` caption).
- Full engine integration requires a future slice with real KataGo engine payloads.

## 8. Recommended next phase

**v0.23.0c — Infrastructure Hardening**

The next slice should focus on CI sharding, Docker image optimization, and Playwright reporting improvements.
