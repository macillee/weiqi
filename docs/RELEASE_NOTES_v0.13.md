# v0.13 Release Notes — Local Go Engine Feasibility / Engine-Assisted Review

## 1. Summary

v0.13 introduces an **optional local Go engine path** and **engine-assisted wrong-answer review**. The app remains local-first and privacy-first. KataGo is optional and disabled by default. The rule/template coach remains the default fallback. No external AI API is used.

Key outcomes:

- Feasibility plan, adapter contract, and server-only implementation for a local KataGo analysis engine.
- Feature-flagged engine-assisted review: when a local KataGo is available and a confident signal agrees with the authored answer, the coach message draws from an `ENGINE_ASSISTED_MESSAGES` pool.
- Stale async guard prevents engine results from overwriting coach state after reset or navigation.
- 460 unit tests across 24 files.

## 2. Delivered Slices

| Slice | Focus | PR |
|---|---|---|
| v0.13.0a | Local Go engine feasibility / KataGo prototype plan | #145 |
| v0.13.0b | Local engine adapter contract and optional sample config | #147 |
| v0.13.0c | Server-only engine adapter with timeout fallback | #150 |
| v0.13.0d | Feature-flagged engine-assisted wrong-answer review | #152 |
| v0.13.0e | Stabilization / release notes / QA checklist | #TBD |

## 3. Product Behavior Changes

- Wrong-answer `请老师帮忙` flow still shows **immediate rule/template feedback**.
- If `KATAGO_ENABLED=true` and the local engine is available, a successful confident engine signal can **enrich** the feedback with a category-specific engine-assisted message.
- If the engine is disabled, missing, slow, low-confidence, or disagrees with the authored answer, the **rule/template fallback** is preserved.
- An engine-assisted label (`本地引擎辅助`) is only shown when an engine signal is actually used.
- **No raw winrate, scoreLead, or engine metrics** are shown to the child.

## 4. Technical Behavior

- `engine-config.ts` and `engine-adapter.ts` are **server-only** (`import "server-only"`).
- `analyzeWrongMove()` returns `EngineReviewSignal | null` — all failure cases return `null`.
- `review-actions.ts` is the **server action boundary** that bridges the client to server-only modules.
- `ProblemPlayer` has a **stale async request guard** (`useRef` counter) that discards engine results after try-again, next-step, or problem change.
- All engine-assisted tests use **mocks** and do not require a real KataGo binary.

## 5. Local Setup Status

- **No KataGo binary, model, or config is bundled** in the repository.
- Users must install KataGo separately if they want to experiment with engine-assisted review.
- `.env.example` contains **optional commented `KATAGO_*` variables**.
- Normal local anonymous mode requires **no AI or engine setup**.
- The Docker image does **not include KataGo**.

## 6. Validation Baseline

Latest known validation from PR #152 CI:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 460 passed (24 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed (3.5s) |
| `docker compose build` | Exit 0 |

## 7. Non-Goals / Unchanged Scope

- No bundled KataGo binary, model, or config.
- No external AI API or Ollama/local LLM integration.
- No free-form chat or raw engine metrics shown to child.
- No settings page or diagnostics UI.
- No problem data changes.
- No Supabase or server progress changes.
- No Docker or CI changes.
- No payment, teacher/admin, leaderboard, board-size expansion, SGF, or multiplayer features.
