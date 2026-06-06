# v0.12 QA Checklist

> Use this checklist before tagging a v0.12 release.

---

## 1. Environment Setup

- [ ] Fresh checkout of the release branch.
- [ ] Node 22 installed (`node --version`).
- [ ] `npm ci` installs cleanly.
- [ ] Local anonymous mode: app runs without `.env.local` or Supabase vars.
- [ ] Optional Supabase env unchanged from v0.11 — missing vars do not break local mode.
- [ ] No AI environment variables, API keys, or model files required for v0.12 features.

---

## 2. Static Validation

```bash
npm run lint        # Exit 0
npm run typecheck   # Exit 0
npm run test        # 416 passed (22 files)
npm run build       # Compiled successfully
```

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.

---

## 3. E2E Validation

```bash
npm run test:e2e    # 6 passed (3.7s)
```

- [ ] `npm run test:e2e` passes (6 tests: home, levels, chapter, demo, practice, settings).

---

## 4. Docker Validation

```bash
docker compose build
docker compose up --build
```

- [ ] `docker compose build` succeeds.
- [ ] `docker compose up --build` starts without errors.
- [ ] App is reachable at `http://localhost:3000`.
- [ ] No KataGo/Ollama/AI config or containers are required.
- [ ] Missing Supabase env does not prevent startup.

---

## 5. Level Calibration Manual QA

- [ ] New user / low progress: daily practice still shows introductory level-1 content.
- [ ] Level-1 mastery achieved: daily practice routes away from level-1 where possible.
- [ ] Level-2 mastery achieved: daily practice can route into level 3+ where enough content exists.
- [ ] Due review problems are prioritized in selection (spaced review integration).
- [ ] Wrong-book problems are prioritized in selection.
- [ ] Category balance: daily practice does not repeat the same category more than 3 times.
- [ ] Level-1 only user: daily practice correctly serves level-1 content (no accidental level-3+).

---

## 6. Local Review Coach Manual QA

- [ ] Wrong answer shows the `请老师帮忙` button in the red feedback dialog.
- [ ] Clicking `请老师帮忙` displays a short Chinese message in an amber-bordered box.
- [ ] The button disappears after the coach message is shown.
- [ ] Clicking `再试一次` clears the coach message and re-shows the `请老师帮忙` button on the next wrong answer.
- [ ] Moving to the next problem clears the coach message (no leak across problems).
- [ ] In multi-step problems, advancing to the next step clears the coach message.
- [ ] Correct-answer flow is completely unchanged (no coach button or message).
- [ ] After max wrong attempts (2), the `请老师帮忙` button is not shown (answer is revealed).
- [ ] No network requests are made when showing coach feedback (verify in browser DevTools Network tab).
- [ ] Coach feedback is deterministic (same input always produces same output).
- [ ] Coach messages are ≤150 characters, use Chinese, and avoid harsh or blaming language.

---

## 7. Intermediate Content Manual QA

- [ ] New level 3–5 problems are reachable via the chapter map (capture-10, capture-11, escape-7, connect-cut-5, connect-cut-7, life-death-3, life-death-5, opening-5, endgame-2, endgame-4).
- [ ] Each new problem displays its Chinese title, description, and hint text.
- [ ] The `GoBoard` renders the initial stones correctly for each new problem.
- [ ] Clicking the answer coordinates shows the success message.
- [ ] Clicking wrong coordinates shows the failure message and `请老师帮忙` button.
- [ ] CAP-020 hint and explanation both reference `(4, 4)` — not `(5, 4)`.
- [ ] No new level-1 introductory problems were added in v0.12.0e.
- [ ] `wrongMoves` entries (if present) display constructive Chinese text.

---

## 8. Safety / Privacy QA

- [ ] No external AI API calls are made during practice (verify in browser DevTools Network tab).
- [ ] No KataGo or Ollama processes are started by the app.
- [ ] No AI transcripts, prompts, or responses are saved to localStorage or anywhere else.
- [ ] No child data leaves the local machine by default.
- [ ] Coach output is bounded (≤150 characters, specific Go concepts, no free-form text).
- [ ] Coach output does not claim rank/level (e.g., "你是 5 级棋手").
- [ ] Coach output does not use harsh or blaming language.

---

## 9. Sign-Off

| Item | Value |
|---|---|
| Date | |
| Branch / PR | |
| `npm run lint` | |
| `npm run typecheck` | |
| `npm run test` | |
| `npm run build` | |
| `npm run test:e2e` | |
| `docker compose build` | |
| `docker compose up --build` | |
| Manual flows checked | |
| Docker mode tested | |
| Supabase mode tested | (or N/A) |
| Known issues | |
