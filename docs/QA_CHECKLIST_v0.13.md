# v0.13 QA Checklist — Local Go Engine Feasibility / Engine-Assisted Review

## 1. Environment Setup

- [ ] Fresh checkout of the v0.13 release branch.
- [ ] Node 22 installed.
- [ ] `npm ci` installs without errors.
- [ ] Local anonymous mode works **without Supabase** and **without KataGo**.
- [ ] Optional Supabase env vars remain unchanged from v0.11 (no regressions).
- [ ] Optional KataGo env vars can remain unset — app works without them.

## 2. Static Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

- [ ] `npm run lint` exits 0.
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run test` — all 460 tests pass (24 files).
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

## 4. Engine Disabled QA

- [ ] `KATAGO_ENABLED` is unset or set to `false`.
- [ ] Open a problem; submit a wrong answer.
- [ ] Click `请老师帮忙` — rule/template feedback appears immediately.
- [ ] No `本地引擎辅助` label appears.
- [ ] No error dialog or loading state shown to child.

## 5. Engine Unavailable QA

- [ ] Set `KATAGO_ENABLED=true` with a missing or invalid `KATAGO_BIN_PATH`.
- [ ] Submit wrong answer; click `请老师帮忙`.
- [ ] Wrong-answer feedback falls back to rule/template.
- [ ] No crash occurs.
- [ ] No permanent loading state.
- [ ] No child-facing engine error message.

## 6. Engine-Assisted QA (Optional — Local KataGo Required)

- [ ] Configure valid `KATAGO_BIN_PATH`, `KATAGO_MODEL_PATH`, optional `KATAGO_CONFIG_PATH`, `KATAGO_VISITS`, `KATAGO_TIMEOUT_MS`.
- [ ] Submit wrong answer; click `请老师帮忙`.
- [ ] If engine signal is high or medium confidence and agrees with authored answer, engine-assisted message may appear.
- [ ] Label `本地引擎辅助` appears **only** in the engine-assisted case.
- [ ] Low confidence or disagreement falls back to rule/template.
- [ ] Raw winrate, scoreLead, and engine metrics are **not** shown.

## 7. Coach Reset / Async Guard QA

- [ ] Submit wrong answer; click `请老师帮忙`; before engine returns, click `再试一次`.
- [ ] Old engine result must **not** reappear after resolve.
- [ ] Submit wrong answer; click `请老师帮忙`; before engine returns, navigate to next problem.
- [ ] Old engine result must **not** reappear on the new problem.
- [ ] Multi-step next-step reset still clears coach feedback.
- [ ] Next wrong-answer flow still shows coach button normally.

## 8. Safety / Privacy QA

- [ ] No external AI API calls are made.
- [ ] No Ollama or local LLM is required.
- [ ] No child name, profile, or progress is sent to the engine.
- [ ] No transcripts are saved.
- [ ] Engine data is limited to board position, move, and category.
- [ ] Rule/template fallback works fully offline.

## 9. Sign-Off

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
| Coach reset / async guard checked | |
| Known issues | |
