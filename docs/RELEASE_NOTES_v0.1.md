# Release Notes — v0.1.0

> Project: 小棋童围棋闯关  
> Release type: local-first MVP  
> Status: locally accepted after manual QA, with known limitations documented below.

---

# 1. Release Summary

v0.1.0 is the first locally usable MVP of the children Go learning web app.

The release focuses on a complete local learning loop:

```text
Home
→ Daily practice
→ Single-problem solving
→ Hints and feedback
→ Wrong problem tracking
→ Wrong book review
→ Stars
→ Learning report
```

This version is intentionally local-first:

- No login.
- No database.
- No AI.
- No payment.
- No teacher/admin backend.
- Progress is stored in browser localStorage.

---

# 2. Delivered Features

## 2.1 Local Development and Docker Runtime

- Next.js App Router project.
- TypeScript.
- Tailwind CSS.
- Dockerfile for local production-like runtime.
- Docker Compose support.

Expected checks:

```bash
npm install
npm run build
docker compose up --build
```

---

## 2.2 SVG Go Board

Delivered:

- 9x9 SVG Go board.
- Intersections rendered correctly.
- Stones placed on intersections.
- Empty-point click handling.
- Occupied-point click protection.
- Disabled state.
- Highlights.
- Last move marker support.

Primary board scope for v0.1:

```text
9x9 board only
```

13x13 and 19x19 are type-supported but not fully product-tested.

---

## 2.3 Problem Schema and Sample Problems

Delivered:

- `Problem` TypeScript type.
- Local JSON problem data.
- Problem validation helpers.
- Initial sample problem set.
- Basic Go-logic validation for invalid initial positions.

Current limitation:

```text
Only 9 sample problems are included.
```

v0.1 is meant to validate product flow, not final content volume.

---

## 2.4 Problem Player

Delivered:

- Problem title and description.
- Initial stones rendered on board.
- Answer checking.
- Correct feedback.
- Wrong feedback.
- Retry flow.
- Progressive hints.
- Correct answer reveal after maximum wrong attempts.
- `onAttempt` for every click attempt.
- `onResult` for final problem result.

---

## 2.5 Daily Practice and Levels

Delivered:

- Home page entries.
- Daily practice route.
- Levels route.
- Chapter route.
- Simple level/problem grouping.
- Practice summary.

Daily practice behavior:

- Selects up to 10 available problems.
- Uses all available problems when fewer than 10 exist.

---

## 2.6 Progress, Stars, and Wrong Book

Delivered:

- Stable localStorage key:

```text
children-go-app:v0.1:progress
```

- Attempt recording.
- Wrong problem state.
- Wrong book page.
- Wrong problem review flow.
- Stars.
- Daily practice completion reward.

Wrong problem status flow:

```text
active → reviewing → mastered
```

If a reviewing or mastered problem is answered wrong again, it returns to `active`.

Star rules implemented in v0.1:

- First correct answer on a problem: `+1` star.
- Completing daily practice once per day: `+5` stars.
- Repeating the same correct problem does not duplicate the first-correct star.
- Repeating daily practice on the same day does not duplicate the daily completion reward.

---

## 2.7 Learning Report

Delivered:

- `/report` page.
- Unique attempted problem count.
- Total stars.
- Overall accuracy.
- First-try accuracy.
- Active/reviewing wrong problem count.
- Streak days.
- Category progress.
- Strongest and weakest categories based on first-try accuracy.
- Friendly empty state.

---

## 2.8 QA Checklist

Delivered:

- `docs/QA_CHECKLIST_v0.1.md`

This checklist is the source of truth for v0.1 manual acceptance.

---

# 3. Manual QA Result

Manual QA was performed after v0.1 feature completion.

Known result from user testing:

```text
One small bug was found and fixed.
No other blocking issues were reported during manual testing.
```

Before tagging or releasing, run through `docs/QA_CHECKLIST_v0.1.md` and mark final release decision.

---

# 4. Known Limitations

v0.1 limitations are intentional:

- Only 9 sample problems.
- localStorage only; no account sync.
- No login.
- No database.
- No AI review.
- No AI opponent.
- No online multiplayer.
- No teacher/admin backend.
- No payment.
- No production hosting workflow beyond local Docker runtime.
- No formal automated test suite yet.
- `timeSpentSeconds` is currently recorded as `0`.
- 13x13 and 19x19 are not product-tested.

---

# 5. Recommended Tag

After confirming the QA checklist, tag this version:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Do not tag if there are unresolved blocking bugs.

---

# 6. Next Recommended Version: v0.1.1

v0.1.1 should be a stabilization release, not a feature expansion release.

Recommended scope:

- Add automated tests for core library logic.
- Add a safe reset-progress entry for local testing.
- Polish mobile layout and copy.
- Add a small number of high-quality problems only after manual Go-logic review.
- Keep documentation synchronized.

Do not include in v0.1.1:

- Login.
- Database.
- AI.
- Payment.
- Teacher/admin backend.
- Large-scale problem generation.

---

# 7. Future Roadmap

## v0.1.1 — Stabilization

- Unit tests for core logic.
- Reset local progress.
- QA fixes.
- UI polish.
- Optional small problem batch.

## v0.1.2 — Content Expansion

- Expand to around 30–50 reviewed problems.
- Improve problem categories.
- Continue small-batch Go-logic review.

## v0.2.0 — Accounts and Sync

- User login.
- Student profile.
- Database-backed progress.
- localStorage import/sync path.
- Larger reviewed problem set.

## v0.3.0 — Learning Depth

- Multi-step problems.
- Spaced review scheduling.
- Parent weekly report.

## v0.4.0 — Teacher Workflow

- Teacher account.
- Class management.
- Assignments.
- Student progress dashboard.

---

# 8. Release Decision Template

```text
Release: v0.1.0
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.1.0 tag
[ ] Not approved — see notes

Notes:
```
