# Local Go Engine Feasibility & KataGo Prototype Plan — v0.13

## 1. Product Goal and Constraints

- **Target learner**: child with approximately one year of Go study.
- **Goal**: improve review/coach quality beyond static rule templates by incorporating local Go engine analysis where useful, while keeping all processing on-device.
- **Local-first**: no data leaves the machine by default. Engine analysis must be a purely local process.
- **Optional**: the app must continue to work without KataGo or any engine configured. Engine features degrade gracefully to rule/template-only behavior.
- **Bounded**: v0.13 should not attempt full free-form AI chat, 19x19 unrestricted professional review, or open-ended sparring.
- **Fallback**: the existing rule/template coach (`src/lib/ai-review.ts`) remains the default and safe fallback.

---

## 2. Candidate Use Cases

### 2.1 Wrong-answer local engine review

- Use the current problem position, the child's attempted move, and the correct answer to compare move quality.
- Engine reports win-rate drop, point loss, or liberty/connectivity change.
- Rule/template layer translates the engine signal into a short child-readable Chinese message.
- Keep the existing ≤150 character constraint and no-rank-claim rule.

### 2.2 Correct-answer explanation support

- Engine validates why the authored answer is strong (e.g., "this move captures 3 stones", "this move connects two groups").
- Rule/template still controls wording and bounds the output.
- Does not override the authored explanation in `problems.json`.

### 2.3 Local sparring / mini-fight prototype

- A bounded 9x9 or local-position sparring mode where the engine responds to the child's move on a fixed position.
- This is not a full open-ended game. The position stays within the current problem context.
- If feasibility proves simple, this could be prototyped late in v0.13; otherwise defer to v0.14.

### 2.4 Problem validation / authoring support

- Use KataGo to sanity-check candidate problems before human review.
- Detect: zero-liberty initial positions, multiple winning moves, self-capture answers.
- Human review remains mandatory. This is strictly an authoring aid, not a replacement.

### 2.5 Level calibration enhancement (deferred)

- Future use: use engine-derived difficulty signals (e.g., reading depth, branching factor) to calibrate problem levels.
- Do not attempt in v0.13. Level calibration remains based on hand-authored level metadata.

---

## 3. Engine Options

> The resource and latency figures below are planning assumptions, not verified benchmarks. v0.13.0b/c must validate them on the target local machine before treating them as requirements.

### 3.1 KataGo CPU / Eigen

| Factor | Assessment |
|---|---|
| Install complexity | Moderate — user downloads binary, unzips, places on PATH or in project dir. No build from source needed for common platforms. |
| Model file size | Assumption: ~40 MB (network weights). Downloaded once. |
| CPU / RAM | Assumption: ~1–2 GB RAM; runs on any modern CPU with Eigen backend. |
| 9x9 support | Excellent — KataGo natively supports 9x9 with its own trained networks. |
| Analysis API | GTP-compatible. `kata-analyze` command returns win-rate, visits, top moves. |
| Expected latency | Assumption: ~1–3 seconds with 200–600 visits on modern CPU. Acceptable for coach use. Needs local benchmark. |
| Platform support | Windows, macOS, Linux binaries available. |
| Docker implications | Assumption: including KataGo in the Docker image adds ~60 MB. Not default for dev. |
| Maintenance risk | Low — KataGo releases stable builds. Can pin a known version. |

### 3.2 KataGo OpenCL / GPU

| Factor | Assessment |
|---|---|
| Install complexity | Higher — requires OpenCL runtime or CUDA. Many child laptops lack GPU. |
| Performance | Assumption: 5–20× faster than CPU for same visit count. Needs local benchmark. |
| Recommendation | Support as optional config only. Default to CPU/Eigen. |

### 3.3 Other lightweight engines

- **GNU Go** — no longer maintained, weaker analysis. Not recommended.
- **Leela Zero** — requires GPU. Not practical for personal local setup.
- **Pachi** — historically relevant but unmaintained. Not recommended.
- **No engine (rule/template only)** — always available, deterministic, zero-install. Remains the default.

### 3.4 Recommendation

**KataGo CPU/Eigen** is the recommended engine. It balances install simplicity, 9x9 support, analysis quality, and platform coverage. GPU is optional. Rule/template remains the fallback.

---

## 4. Prototype Architecture Options

### 4.1 Manual local binary path (recommended for v0.13)

- User downloads KataGo CPU binary and network weights from the official release page.
- `.env.local` config:
  ```
  KATAGO_BIN_PATH=/usr/local/bin/katago
  KATAGO_MODEL_PATH=~/.katago/kata1-b18c384nbt-s8711467072-d4665523374.bin.gz
  KATAGO_CONFIG_PATH=~/.katago/analysis_config.cfg
  KATAGO_VISITS=300
  ```
- App checks `KATAGO_BIN_PATH` at startup. If missing, engine features are disabled.
- A `/diagnostics` page or log message indicates engine availability.
- No engine binary is bundled in the repo.

### 4.2 Dev-only sidecar process (future)

- A local script (`scripts/start-katago.sh`) starts KataGo as a background GTP process.
- The app connects to a localhost adapter (e.g., TCP port or Unix socket).
- Useful for testing but adds process management complexity. Defer to v0.13.0c at earliest.

### 4.3 Node child_process adapter (implementation target)

- In a Server Action or API route, spawn `katago analysis` via `child_process.spawn`.
- Send a GTP `kata-analyze` command with the current board position.
- Read the JSON response, parse it, and pass signals to the rule/template layer.
- Requires careful:
  - Timeout (default 5s max per analysis).
  - Process lifecycle (single-use or pool).
  - Error handling (engine crash, missing binary).
  - Server-only boundary (never exposed to client).

### 4.4 Docker sidecar (deferred)

- A separate Docker service for KataGo would isolate the engine but adds complexity.
- Must not break the current single-service Docker build.
- Not recommended for v0.13.

### 4.5 Rule/template-only fallback

- Always available. The engine layer should wrap the existing `getLocalReview()` and add engine-derived signals only when the engine is configured and responsive.

### 4.6 Recommendation

Start with **manual local binary + Node child_process adapter** in v0.13.0b/c. This keeps the engine optional and the install simple.

---

## 5. Data Flow and Privacy

- **Minimum data sent to engine**: board position (GTP `kata-analyze` with `move` candidates), `toPlay`, attempted move, answer coordinate, board size (9).
- **No child personal data**: names, progress history, device identifiers, usage patterns — none sent to the engine.
- **No progress history**: the engine receives only the current position. It does not know the child's skill level, past mistakes, or learning pace.
- **No transcript persistence**: engine analysis output is ephemeral — used once for feedback, then discarded.
- **No external network call**: all communication is local process-to-process.
- **Local timeout**: if engine does not respond within 5 seconds, fall back to rule/template feedback.
- **Fallback**: if the engine binary is missing, misconfigured, or errors, the rule/template coach handles the request without notifying the child.

---

## 6. Output Design

- **Engine does not write child-facing text directly**.
- Rule/template layer receives engine signals (win-rate drop, top moves, point loss) and selects the appropriate Chinese template.
- Keep the ≤150 character constraint from v0.12.0d.
- Focus on one concept per feedback:
  - liberties ("这手棋后白棋还剩一口气")
  - connection/cut ("黑棋被切断了")
  - life-death ("这里是真眼/假眼")
  - endgame value ("这手棋价值很大")
  - direction ("向中腹发展更好")
- No rank claims.
- No harsh criticism.
- Clearly distinguish canonical answer (from `problems.json`) from engine suggestion:
  - If engine agrees with the authored answer, use the authored explanation.
  - If engine suggests a different move, phrase as "黑棋也可以考虑下在…" rather than "你下错了，应该下在…".

---

## 7. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Engine installation friction | Provide step-by-step setup in `docs/DEPLOYMENT.md`. Auto-detect missing binary. |
| Process lifecycle issues | Timeout (5s), single-use process per analysis, kill orphan processes. |
| Platform differences | Test on Windows (PowerShell), macOS (bash), Linux. Provide docs per platform. |
| CPU latency / battery / heat | Default low visits (200–300). Allow config override. Disable on battery if needed. |
| Engine disagrees with authored answer | Rule/template layer resolves conflicts. Authored answer is always canonical. |
| Overcomplicated feedback for children | Keep template layer strict. Engine adds signal, not free-form text. |
| Docker dev/prod mismatch | Engine is outside Docker. Docker users configure host binary path. |
| Local anonymous mode breakage | Engine must not be required. App runs fully without `KATAGO_BIN_PATH`. |

---

## 8. Recommended v0.13 Plan

```
v0.13.0a — Local Go Engine Feasibility / KataGo Prototype Plan         (this document)
v0.13.0b — Local Engine Adapter Contract / Sample Config               (docs + env contract)
v0.13.0c — Implement Server-Only Engine Adapter with Timeout Fallback  (code: adapter + config)
v0.13.0d — Integrate Engine-Assisted Review Behind Feature Flag        (code: wrong-answer flow)
v0.13.0e — QA / Stabilization / Release Notes                          (docs)
```

### Why this order

1. **v0.13.0b** — Define the adapter interface (TypeScript types, config shape, fallback contract) and document the manual setup steps. No runtime changes. This lets the architecture be reviewed before any code is written.
2. **v0.13.0c** — Implement the adapter (`src/lib/engine-adapter.ts`), the config reader, and the child_process wrapper. All behind `KATAGO_BIN_PATH` check. Server-only.
3. **v0.13.0d** — Wire the adapter into the wrong-answer flow in `ProblemPlayer` / `ai-review.ts`, behind a feature flag (e.g., `enableEngineReview` in config). The rule/template coach remains the default; engine only enriches when available.
4. **v0.13.0e** — Release notes, QA checklist, and stabilization.

---

## 9. Next Task Definition

### v0.13.0b — Local Engine Adapter Contract / Sample Config

**Goal**: Define the TypeScript adapter interface, config schema, setup documentation, and fallback contract — without implementing the adapter.

**Allowed files**:
- `docs/ENGINE_ADAPTER_CONTRACT_v0.13.md` — contract and setup guide.
- `docs/TASKS.md` — mark v0.13.0b delivered, queue v0.13.0c.
- `docs/DEPLOYMENT.md` — add optional KataGo setup section.
- `.env.example` — add commented `KATAGO_BIN_PATH` var if not present.

**Non-goals**:
- No implementation of the adapter.
- No child_process code.
- No UI changes.
- No package dependencies.
- No Docker changes.
- No KataGo binaries or model files in the repo.

**Acceptance criteria**:
- `docs/ENGINE_ADAPTER_CONTRACT_v0.13.md` exists with:
  - Adapter function signatures (TypeScript pseudo-code).
  - Config schema (`KatagoConfig` type).
  - Fallback behavior contract.
  - Setup steps per platform (Windows, macOS, Linux).
- `docs/TASKS.md` marks v0.13.0b delivered and queues v0.13.0c.
- No adapter code, no runtime changes, no KataGo binaries.

**Validation**: docs-only — `npm run build` and `npm run test` not required.
