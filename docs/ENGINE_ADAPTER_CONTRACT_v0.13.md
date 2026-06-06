# Local Engine Adapter Contract — v0.13

## 1. Goal and Non-Goals

### Goal

Define the adapter interface, configuration shape, setup contract, and fallback behavior for integrating a local KataGo Go engine into the wrong-answer review flow — without implementing any runtime code.

### Non-goals

- No adapter implementation (`src/lib/engine-adapter.ts` is not created in this task).
- No `child_process` calls.
- No API routes or Server Actions.
- No KataGo binary, model file, or config script is committed.
- No package dependencies are added.
- No Docker or CI changes.
- No runtime UI changes.
- No Ollama, local LLM, or external AI API integration.

---

## 2. Environment Variables / Sample Config

All variables are optional. The app continues to work normally without any of them.

```env
# Optional local KataGo integration (disabled by default; not required for local mode).
# KATAGO_ENABLED=false
# KATAGO_BIN_PATH=
# KATAGO_MODEL_PATH=
# KATAGO_CONFIG_PATH=
# KATAGO_VISITS=300
# KATAGO_TIMEOUT_MS=5000
```

| Variable | Default | Description |
|---|---|---|
| `KATAGO_ENABLED` | `false` | Master switch. When `false`, all engine features are disabled regardless of other vars. |
| `KATAGO_BIN_PATH` | empty | Absolute path to KataGo executable. If empty or invalid, engine features are disabled. |
| `KATAGO_MODEL_PATH` | empty | Absolute path to KataGo network weights file (`.bin.gz`). |
| `KATAGO_CONFIG_PATH` | empty | Absolute path to KataGo analysis config. If empty, a built-in default config is used. |
| `KATAGO_VISITS` | `300` | Number of visits per analysis. Lower values (100–300) reduce latency. |
| `KATAGO_TIMEOUT_MS` | `5000` | Maximum wait time per analysis in milliseconds. |

### Requirements

- Missing or invalid config **disables** engine features and falls back to rule/template coach.
- Do not require these vars for local anonymous mode, Docker build, or normal app startup.
- No service keys, secrets, or child data should be stored in env.

---

## 3. Adapter TypeScript Contract (Pseudo-code)

The following defines the expected interface. No implementation file will be added in this task.

```ts
// ---- Engine types ----

export type EngineAvailability = {
  enabled: boolean;
  available: boolean;
  reason?:
    | "disabled"
    | "missing-binary"
    | "missing-model"
    | "timeout"
    | "unsupported-platform"
    | "error";
};

export type EngineReviewInput = {
  boardSize: 9;
  toPlay: "black" | "white";
  initialStones: Array<{ x: number; y: number; color: "black" | "white" }>;
  attemptedMove: { x: number; y: number };
  authoredAnswer: { x: number; y: number };
  category: ProblemCategory;
};

export type EngineReviewSignal = {
  source: "katago";
  topMoves: Array<{
    x: number;
    y: number;
    visits: number;
    scoreLead: number;
    winrate: number;
  }>;
  authoredAnswerRank: number | null;
  attemptedMoveRank: number | null;
  agreesWithAuthoredAnswer: boolean;
  confidence: "low" | "medium" | "high";
  warnings: string[];
};

// ---- Adapter interface ----

export interface LocalGoEngineAdapter {
  /** Check whether the engine is configured and responsive. */
  getAvailability(): Promise<EngineAvailability>;

  /**
   * Analyze a wrong move and return engine signals.
   * Returns null if engine is unavailable, times out, or errors.
   * Does not generate child-facing text — signals are consumed by rule/template layer.
   */
  analyzeWrongMove(input: EngineReviewInput): Promise<EngineReviewSignal | null>;
}
```

### Contract rules

- `getAvailability()` must resolve quickly (<100ms). It checks file existence and optionally runs a lightweight binary check.
- `analyzeWrongMove()` must respect `KATAGO_TIMEOUT_MS`. If the engine does not respond within the timeout, return `null`.
- The adapter **must not** generate child-facing text. All output is raw engine signals consumed by the rule/template layer.
- Input data is strictly limited to board position and move coordinates (see privacy section).

---

## 4. Fallback Behavior Contract

| Condition | Behavior |
|---|---|
| `KATAGO_ENABLED=false` | Engine features disabled. Use `getLocalReview()`. |
| `KATAGO_BIN_PATH` missing or invalid | `getAvailability()` returns `available: false, reason: "missing-binary"`. Fall back to rule/template. |
| Engine binary exists but `KATAGO_MODEL_PATH` missing | `getAvailability()` returns `available: false, reason: "missing-model"`. Fall back. |
| Engine times out during analysis | Return `null`. Rule/template handles feedback. Do not block the wrong-answer flow. |
| Engine returns error | Return `null`. Log error details to server console only. Never show engine errors to the child. |
| Engine disagrees with authored answer | Engine signals are advisory. Authored answer from `problems.json` is canonical. Do not override. |
| Engine suggests a different move | Rule/template layer may phrase as "也可以考虑…" for future UI, but never as "你下错了，应该下在…". |

### Key principles

- The wrong-answer feedback flow **must never block** waiting for the engine.
- If `analyzeWrongMove()` takes longer than `KATAGO_TIMEOUT_MS`, the caller proceeds with rule/template feedback immediately.
- Engine analysis is **advisory only**. The authored answer in `problems.json` is always correct.
- No error details are shown to the child.

---

## 5. Privacy and Data Minimization

### Data sent to the local engine

- Board position (stones with coordinates and colors)
- `toPlay` (whose turn)
- Attempted move coordinates
- Authored answer coordinates
- Board size (9)
- Problem category

### Data NOT sent

- Child name, nickname, or profile
- Progress history, stars, wrong-book data
- Login credentials or Supabase tokens
- Device identifiers or analytics
- Previous problem history
- Any personal information

### Data persistence

- Raw engine output is ephemeral — used once for feedback, then discarded.
- No transcripts or raw engine output are saved to disk, localStorage, or Supabase.
- No external network calls are made during engine analysis.

---

## 6. Setup Guide

### Prerequisites

- KataGo CPU binary (Eigen backend) downloaded from the [official releases page](https://github.com/lightvector/KataGo/releases).
- Network weights file downloaded from the same release page (`.bin.gz` file).
- The app must already be running and functional in local anonymous mode.

### macOS / Linux

1. Download the CPU/Eigen binary and matching network weights from the [official KataGo releases page](https://github.com/lightvector/KataGo/releases). Choose the archive matching your platform (e.g. `katago-vX.Y.Z-ubuntu-x64.zip`, `katago-vX.Y.Z-macos-x64.zip`).
2. Extract and place the binary somewhere persistent, e.g. `~/.katago/katago`.
3. Download the recommended `.bin.gz` network weights file from the same release.
4. Generate a default analysis config:

```bash
/path/to/katago genconfig -model /path/to/network.bin.gz -output /path/to/analysis_config.cfg
```

### Windows PowerShell

1. Download the CPU/Eigen binary from the [official KataGo releases page](https://github.com/lightvector/KataGo/releases). Extract `katago.exe` to a persistent folder.
2. Download the recommended `.bin.gz` network weights file from the same release.
3. Generate a default analysis config:

```powershell
.\katago.exe genconfig -model .\network.bin.gz -output .\analysis_config.cfg
```

### Verify installation

```bash
katago version
```

### Configure the app

Add to `.env.local`, adjusting paths to match your setup:

```env
KATAGO_ENABLED=true
KATAGO_BIN_PATH=/path/to/katago
KATAGO_MODEL_PATH=/path/to/network.bin.gz
KATAGO_CONFIG_PATH=/path/to/analysis_config.cfg
KATAGO_VISITS=300
KATAGO_TIMEOUT_MS=5000
```

### Important notes

- This setup is **completely optional**. The app works without it.
- v0.13.0b only documents the env/config contract. **Runtime integration is not implemented yet.**
- v0.13.0c will implement the adapter and validate real KataGo execution.
- Docker users: KataGo runs on the host, not inside the container. Configure `KATAGO_BIN_PATH` to point to the host binary.

---

## 7. Local Benchmark Plan

The following benchmarks must be measured in v0.13.0c (not this task):

| Metric | How to measure | Expected range (assumption) |
|---|---|---|
| Availability check time | Time `getAvailability()` | <100ms |
| First analysis latency (cold start) | Time first `analyzeWrongMove()` after process start | 3–10s |
| Repeated analysis latency (warm) | Time subsequent analyses | 1–3s |
| Timeout behavior | Kill engine mid-analysis, verify null return | < KATAGO_TIMEOUT_MS |
| CPU usage during analysis | OS task manager | ~1 core at 100% |
| RAM usage during analysis | OS task manager | ~1–2 GB |
| Missing binary behavior | Delete/rename binary, verify graceful fallback | Returns null, no crash |
| Missing model behavior | Point to nonexistent file, verify graceful fallback | Returns null, no crash |
| Unsuitable platform | Run on unsupported OS (if any) | `getAvailability()` returns unavailable |

Do not claim final benchmark numbers in this document. Update them in a later task once v0.13.0c validates actual performance.

---

## 8. Next Implementation Slice

### v0.13.0c — Implement Server-Only Engine Adapter with Timeout Fallback

**Goal**: Create the `LocalGoEngineAdapter` implementation in a server-only module, with config reader, process timeout/fallback, and unit tests with mocked `child_process`.

**Allowed files**:
- `src/lib/engine-adapter.ts` — adapter implementation (server-only, no client import)
- `src/lib/engine-config.ts` — config reader for `KATAGO_*` env vars
- `src/__tests__/engine-adapter.test.ts` — unit tests with mocked child_process
- `docs/TASKS.md` — mark v0.13.0c delivered, queue v0.13.0d

**Non-goals**:
- No UI integration.
- No KataGo binary/model committed.
- No API routes.
- No Docker changes.
- No package dependencies.

**Acceptance criteria**:
- `getAvailability()` works with real binary path (manual test) and returns `available: false` for missing/invalid paths.
- `analyzeWrongMove()` respects timeout and returns `null` on timeout.
- Unit tests cover: missing binary, missing model, timeout, engine error, successful analysis mock.
- No client-facing text is generated by the adapter.

**Validation**:
```bash
npm run test        # Unit tests pass
npm run typecheck   # Exit 0
npm run build       # Compiled successfully
```
