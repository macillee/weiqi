# v0.15 QA Checklist — Content Quality / Intermediate Problem Expansion

## 1. Environment Setup

- [ ] Fresh checkout of the v0.15 release branch.
- [ ] Node 22 installed.
- [ ] `npm ci` installs without errors.
- [ ] Local anonymous mode works **without Supabase** and **without KataGo**.
- [ ] KataGo env vars can remain unset — app works without them.
- [ ] No external AI API needed.

## 2. Static Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

- [ ] `npm run lint` exits 0.
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run test` — all tests pass (includes Pack A regression tests).
- [ ] `npm run build` — compiled successfully.
- [ ] Problem total is **101**.
- [ ] L3–5 total is **58**.

## 3. E2E and Docker Validation

```bash
npm run test:e2e
docker compose build
docker compose up --build
```

- [ ] E2E smoke tests pass (6 tests).
- [ ] `docker compose build` succeeds.
- [ ] App reachable on `http://localhost:3000`.
- [ ] Demo page shows **101** total problems.
- [ ] No Supabase env required for local anonymous mode.
- [ ] No KataGo config required.

## 4. Pack A Data QA

Manual/developer checks:

- [ ] All 14 Pack A IDs exist: CAP-021, CAP-022, ESC-013, ESC-014, CC-017, CC-018, LD-013, OP-011, OP-012, END-011, END-012, MIX-001, MIX-002, MIX-003.
- [ ] Matrix matches target: L3=3, L4=7, L5=4.
- [ ] No level 1–2 problems in Pack A.
- [ ] 3 multi-step problems exist: CAP-022, CC-018, MIX-001.
- [ ] First mixed problems exist: MIX-001, MIX-002, MIX-003.
- [ ] All answers are empty board points.
- [ ] No duplicate initial stones.
- [ ] Chinese prompts/hints/explanations are clear and short.
- [ ] Failure messages are child-friendly.

## 5. Practice Regression QA

- [ ] Normal practice still loads (`/practice`).
- [ ] Demo page still loads (`/demo`).
- [ ] Category browsing still works if present.
- [ ] Daily practice still respects existing selection logic.
- [ ] Multi-step flow still works for existing and new multi-step problems.
- [ ] Wrong-answer coach still works.
- [ ] No new child-facing diagnostics or engine UI appears.

## 6. Privacy / Safety QA

- [ ] No external AI API calls.
- [ ] No telemetry or analytics.
- [ ] No child profile/name/progress sent externally.
- [ ] No new Supabase requirement.
- [ ] No raw engine output or diagnostics shown to child.
- [ ] Local/offline content works.

## 7. Sign-Off

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
| Pack A matrix checked | |
| Mixed category checked | |
| Multi-step Pack A checked | |
| Demo count checked | |
| Docker checked | |
| Known issues | |
