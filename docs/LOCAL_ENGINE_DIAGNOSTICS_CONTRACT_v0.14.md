# Local Engine Diagnostics Contract — v0.14

## 1. Goal and Non-Goals

### Goal

Define a precise future diagnostics data shape for engine availability and last-analysis state, so that a later implementation (v0.14.0d) can be small, server-only, local-only, and safe.

### Non-goals

- No diagnostics implementation in v0.14.0c.
- No diagnostics UI in v0.14.0c.
- No logging code in v0.14.0c.
- No API route or Server Action in v0.14.0c.
- No `NEXT_PUBLIC_*` diagnostics defaults.
- No telemetry or analytics.
- No external network calls.
- No Supabase dependency.
- No child-facing diagnostics.

---

## 2. Diagnostic Questions to Answer

Future diagnostics should answer:

| # | Question |
|---|---|
| 1 | Is engine diagnostics disabled? |
| 2 | Is `KATAGO_ENABLED` set to `true`? |
| 3 | Are required engine paths present (binary, model)? |
| 4 | Is the binary missing? |
| 5 | Is the model missing? |
| 6 | Is optional config missing? |
| 7 | Did the last analysis succeed? |
| 8 | Did the last analysis fallback to rule/template? |
| 9 | Did it timeout? |
| 10 | Did output parsing fail? |
| 11 | Did the engine signal agree with the authored answer? |
| 12 | Was confidence low / medium / high? |
| 13 | Was the child-facing feedback rule-template or engine-assisted? |

---

## 3. TypeScript Pseudo-Contract

This defines the future diagnostics shape. No `src/` file is created in this task.

```ts
export type EngineDiagnosticsStatus =
  | "disabled"
  | "enabled-unavailable"
  | "available"
  | "error";

export type EngineDiagnosticsReason =
  | "disabled"
  | "missing-binary"
  | "missing-model"
  | "missing-config"
  | "unsupported-platform"
  | "timeout"
  | "malformed-output"
  | "process-error"
  | "unknown-error";

export type EngineLatencyBucket =
  | "not-run"
  | "<1s"
  | "1-3s"
  | "3-5s"
  | ">5s"
  | "timeout";

export type EngineLastAnalysisDiagnostics = {
  attempted: boolean;
  result:
    | "not-run"
    | "success"
    | "fallback"
    | "timeout"
    | "malformed-output"
    | "process-error"
    | "unavailable";
  latencyBucket: EngineLatencyBucket;
  confidence?: "low" | "medium" | "high";
  agreesWithAuthoredAnswer?: boolean;
  feedbackSource?: "rule-template" | "engine-assisted";
  warnings: string[];
};

export type LocalEngineDiagnostics = {
  status: EngineDiagnosticsStatus;
  reasons: EngineDiagnosticsReason[];
  enabled: boolean;
  available: boolean;
  checkedAt: string;
  config: {
    hasBinPath: boolean;
    hasModelPath: boolean;
    hasConfigPath: boolean;
    visitsConfigured: boolean;
    timeoutConfigured: boolean;
  };
  lastAnalysis: EngineLastAnalysisDiagnostics;
};
```

### Contract rules

- Use **sanitized booleans** (`hasBinPath`) instead of raw path values.
- `checkedAt` is an ISO-8601 timestamp of the last availability check.
- `warnings` capture non-blocking issues (e.g. config file not found but defaults used).
- `lastAnalysis` is ephemeral — not persisted across sessions by default.

---

## 4. Data Minimization

- Do not expose raw local file paths in diagnostics output that could reach child-facing UI.
- Use `hasBinPath`, `hasModelPath`, `hasConfigPath` instead of the actual path values.
- Do not include child name, profile, progress, login data, Supabase IDs, or transcripts.
- Do not persist raw engine output by default.
- Do not include board position by default. If a future debugging task requires it, gate it behind an explicit flag and keep it local-only.
- If board position is ever included, it must be opt-in, server-only, and off by default.

---

## 5. Server/Client Boundary

- Future implementation must be **server-only by default** (Node.js `child_process`, `fs`).
- Do not import engine diagnostics helpers into client components directly.
- If a parent-facing UI is added later, expose only sanitized diagnostics through an explicitly scoped boundary.
- No child-facing practice UI should display diagnostics by default.
- Do not use `NEXT_PUBLIC_*` env vars for diagnostics defaults.
- Suggested future env flag for dev logging: `ENGINE_DIAGNOSTICS_DEV_LOG=true` (server/local-only).

---

## 6. Last-Analysis Lifecycle

| Scenario | `attempted` | `result` | `latencyBucket` | `feedbackSource` |
|---|---|---|---|---|
| Engine disabled in config | `false` | `not-run` | `not-run` | — |
| Engine enabled but binary missing | `false` | `unavailable` | `not-run` | rule-template |
| Engine enabled but model missing | `false` | `unavailable` | `not-run` | rule-template |
| Engine timed out | `true` | `timeout` | `timeout` | rule-template |
| Engine output malformed | `true` | `malformed-output` | — | rule-template |
| Engine process error | `true` | `process-error` | — | rule-template |
| Engine returned low confidence | `true` | `fallback` | `<1s` / `1-3s` etc. | rule-template |
| Engine disagreed with authored answer | `true` | `fallback` | — | rule-template |
| Engine succeeded, confident, agrees | `true` | `success` | — | engine-assisted |

### Rules

- Do not persist last-analysis diagnostics across sessions by default. Keep them in-memory.
- Diagnostics must never block the wrong-answer feedback flow.
- If the engine was not called (e.g. hint triggered before wrong answer), `lastAnalysis` stays at its default state.

---

## 7. Parent/Developer Presentation Principles

For future UI design (not implemented in this task):

- Show status in plain, actionable language:
  - "引擎已禁用"
  - "引擎已启用，但未找到二进制文件"
  - "引擎已启用，未找到模型文件"
  - "引擎可用（最近一次分析成功）"
  - "引擎超时，已使用规则模板"
- Hide raw file paths and raw engine metrics (visits, scoreLead, winrate) from any parent-facing display by default.
- Use parent/developer wording, not child-facing coaching language.
- Avoid rank claims or winrate explanations.
- Prefer concise actionable status over raw technical output.

---

## 8. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Diagnostics become child-facing | Explicitly enforce server-only boundary. Never render diagnostics in practice flow. |
| Leaking local file paths | Use booleans (`hasBinPath`) instead of raw paths. Sanitize before any output. |
| Over-logging child practice data | Persist nothing by default. In-memory only. No transcripts. |
| Confusion between diagnostics and coaching | Separate module names, separate output channels, separate documentation. |
| Privacy creep into telemetry | Zero telemetry by design. No analytics SDK. No network calls. |
| Masking real engine failures with generic statuses | Include `reasons: EngineDiagnosticsReason[]` for multiple simultaneous issues. |
| Scope creep into settings UI | v0.14.0d explicitly excludes UI. If a parent panel is later proposed, it needs its own task with explicit scope. |

---

## 9. Recommended Implementation Slice

### v0.14.0d — Optional Developer Diagnostics Helper, local-only / server-only

**Goal**: Implement a server-only `getLocalEngineDiagnostics()` helper that reads config and returns availability + last-analysis state. No UI.

**Allowed files**:
- `src/lib/engine-diagnostics.ts` — diagnostics helper (server-only, no client import)
- `src/__tests__/engine-diagnostics.test.ts` — unit tests with mocked config/adapter states
- `docs/TASKS.md` — mark v0.14.0d delivered, queue v0.14.0e

**Non-goals**:
- No UI (settings page, diagnostics panel, or child-facing display)
- No API route or Server Action (unless explicitly justified in the task)
- No `NEXT_PUBLIC_*` diagnostics flags
- No logging code unless small, safe, and gated by `ENGINE_DIAGNOSTICS_DEV_LOG=true`
- No telemetry or persistence
- No engine adapter or config changes

**Acceptance criteria**:
- `getLocalEngineDiagnostics()` returns valid `LocalEngineDiagnostics` shape for all config states (disabled, missing binary, missing model, available)
- `lastAnalysis` is correctly populated from a mock adapter result
- Unit tests cover: disabled config, missing binary, missing model, timeout, malformed output, process error, low confidence fallback, successful analysis
- No child data is included in diagnostics output
- No raw file paths are exposed
- All tests pass with mocked `child_process` / `fs`

**Validation**:
```bash
npm run test        # Unit tests pass
npm run typecheck   # Exit 0
npm run build       # Compiled successfully
```
