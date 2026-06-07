# v0.14 QA Checklist — Engine-Assisted Review UX Evaluation / Local Diagnostics

## 1. Environment Setup

- [ ] Fresh checkout of the v0.14 release branch.
- [ ] Node 22 installed.
- [ ] `npm ci` installs without errors.
- [ ] Local anonymous mode works **without Supabase** and **without KataGo**.
- [ ] Optional Supabase env vars remain unchanged from previous versions.
- [ ] Optional KataGo env vars can remain unset — app works without them.
- [ ] Diagnostics helper requires no UI setup.

## 2. Static Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

- [ ] `npm run lint` exits 0.
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run test` — all tests pass.
- [ ] `npm run build` — compiled successfully.

## 3. E2E and Docker Validation

```bash
npm run test:e2e
docker compose build
docker compose up --build
```

- [ ] E2E smoke tests pass (6 tests).
- [ ] `docker compose build` succeeds.
- [ ] App reachable on `http://localhost:3000`.
- [ ] No KataGo config required in Docker environment.
- [ ] No Supabase env required for local anonymous mode.
- [ ] No diagnostics UI appears in child practice flow.

## 4. Engine-Assisted Review Observation

Reference `docs/UX_OBSERVATION_CHECKLIST_v0.14.md` for structured templates.

### Session A: Engine Disabled

- [ ] `KATAGO_ENABLED` unset or `false`.
- [ ] Submit wrong answer; click `请老师帮忙`.
- [ ] Rule/template feedback appears immediately.
- [ ] No `本地引擎辅助` label appears.

### Session B: Engine Unavailable

- [ ] `KATAGO_ENABLED=true` with invalid binary/model paths.
- [ ] Submit wrong answer; click `请老师帮忙`.
- [ ] Fallback to rule/template; no child-facing error.

### Session C: Engine Available (Optional — Local KataGo Required)

- [ ] Configure valid `KATAGO_BIN_PATH`, `KATAGO_MODEL_PATH`, etc.
- [ ] Engine-assisted label appears only if engine signal is used.
- [ ] Low confidence or disagreement falls back to rule/template.

### Stale Async Behavior

- [ ] Click `请老师帮忙`, then `再试一次` before engine returns.
- [ ] Old engine result must not reappear.
- [ ] Click `请老师帮忙`, then move to next problem before engine returns.
- [ ] Old engine result must not reappear on the new problem.

## 5. Diagnostics Helper QA

Manual/developer checks (run via test or Node script; no UI):

- [ ] `getLocalEngineDiagnostics()` is server-only (`import "server-only"`).
- [ ] Disabled config returns `status: "disabled"`, reason `"disabled"`.
- [ ] Missing binary/model returns `status: "enabled-unavailable"` with sanitized reason.
- [ ] Available config returns `status: "available"` without raw paths.
- [ ] `lastAnalysis` default is `"not-run"`.
- [ ] Timeout/malformed/process-error `lastAnalysis` maps to `"rule-template"`.
- [ ] Successful `lastAnalysis` can map to `"engine-assisted"`.
- [ ] Output contains no raw file paths, child data, board positions, moves, raw engine output, winrate, or scoreLead.

## 6. Privacy / Safety QA

- [ ] No external AI API calls.
- [ ] No telemetry or analytics.
- [ ] No Ollama or local LLM required.
- [ ] No child name, profile, or progress sent to diagnostics.
- [ ] No transcripts saved.
- [ ] No raw local paths in diagnostics output.
- [ ] No board position by default in diagnostics output.
- [ ] Diagnostics not shown to child in practice UI.
- [ ] Rule/template fallback works fully offline.

## 7. Regression Checks

- [ ] Normal practice flow still works (start, play, complete).
- [ ] Wrong-answer coach feedback still works.
- [ ] Engine disabled/unavailable fallback still works.
- [ ] No child-facing diagnostics label or panel appears.
- [ ] Local anonymous mode still works without Supabase.
- [ ] Docker build still succeeds (`docker compose build`).

## 8. Sign-Off

| Field | Value |
|---|---|
| Date | |
| Branch / PR | |
| `npm run lint` | |
| `npm run typecheck` | |
| `npm run test` | |
| `npm run build` | |
| `npm run test:e2e` | |
| `docker compose build` | |
| Local anonymous mode checked | |
| Supabase mode checked (optional) | |
| KataGo disabled path checked | |
| KataGo unavailable path checked | |
| KataGo available path checked (optional) | |
| UX observation checklist used | |
| Diagnostics helper sanitized output checked | |
| Coach reset / async guard checked | |
| Known issues | |
