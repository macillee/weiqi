# Playtest Plan — v0.1.3

> Project: 小棋童围棋闯关  
> Version target: v0.1.3  
> Purpose: collect child/parent feedback after v0.1.2 content expansion

---

# 1. Goal

v0.1.3 is a product polish and feedback cycle.

The current app already has:

```text
36 reviewed problems
local practice flow
wrong book
stars
learning report
settings/reset progress
localStorage progress
```

v0.1.3 should not add major systems. It should verify whether the current product is understandable, comfortable, and useful for children who have studied Go for about one year.

---

# 2. Scope

Allowed in v0.1.3:

- collect playtest feedback;
- polish child-facing copy;
- adjust problem hints/explanations;
- improve mobile layout if needed;
- improve empty states and button labels;
- strengthen tests around problem data quality;
- document v0.2 planning.

Not allowed in v0.1.3:

- login;
- database;
- Supabase integration;
- AI review;
- AI opponent;
- payment;
- teacher/admin backend;
- large content expansion;
- multi-step problem engine;
- 13x13 or 19x19 problem sets.

---

# 3. Test Audience

Recommended testers:

| Role | Count | Notes |
|---|---:|---|
| Child who studied Go for about 1 year | 1–3 | Primary target user |
| Parent / guardian | 1–3 | Observe clarity and motivation |
| Go-aware adult reviewer | 1 | Check problem wording and Go logic |

A formal large test is not required for v0.1.3. Small, careful observation is enough.

---

# 4. Playtest Setup

Before each playtest:

1. Use the latest `main` branch.
2. Run routine validation:

```bash
npm run build
npm run test
```

3. Start local app:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

5. Reset local progress through `/settings` unless testing persistence.

6. Use a phone-width viewport for at least one session.

Docker validation is only required before release/tag or when Docker/dependency/build configuration changed.

---

# 5. Core Playtest Script

Ask the child to perform these tasks without explaining too much:

1. Open the home page.
2. Start 今日练习.
3. Solve at least 5 problems.
4. Use a hint on one problem.
5. Intentionally answer one problem wrong.
6. Complete the practice session.
7. Open 错题本.
8. Review one wrong problem.
9. Open 学习报告.
10. Return to 首页.

Observer should not lead the child unless they are stuck for more than 30 seconds.

---

# 6. Observation Checklist

## 6.1 Navigation

- [ ] Child can find 今日练习.
- [ ] Child can find 错题本.
- [ ] Child can find 学习报告.
- [ ] Child can return to 首页.
- [ ] Settings link is not distracting.

Notes:

```text

```

## 6.2 Problem Understanding

- [ ] Child understands the title.
- [ ] Child understands the description.
- [ ] Child knows they should click the board.
- [ ] Child understands hints.
- [ ] Child understands correct/incorrect feedback.

Problems that caused confusion:

| Problem ID | What confused the child? | Suggested fix |
|---|---|---|
|  |  |  |

## 6.3 Board Interaction

- [ ] Child can click intended intersections.
- [ ] Board is large enough on desktop.
- [ ] Board is large enough on mobile.
- [ ] Occupied points do not cause confusion.
- [ ] Highlights and answer markers are visible.

Notes:

```text

```

## 6.4 Hints and Feedback

- [ ] Hint button is easy to find.
- [ ] Hints help without giving too much too early.
- [ ] Wrong feedback feels gentle.
- [ ] Correct feedback feels encouraging.
- [ ] Correct answer reveal is clear after max wrong attempts.

Problems with weak hints:

| Problem ID | Issue | Suggested copy |
|---|---|---|
|  |  |  |

## 6.5 Difficulty

- [ ] Most problems feel appropriate.
- [ ] Some problems are easy enough for confidence.
- [ ] Some problems are challenging but not frustrating.
- [ ] life_death problems are not misleading.

Too easy:

| Problem ID | Reason |
|---|---|
|  |  |

Too hard:

| Problem ID | Reason |
|---|---|
|  |  |

## 6.6 Motivation

- [ ] Child notices stars.
- [ ] Child understands wrong book purpose.
- [ ] Child is willing to try another problem.
- [ ] Child is not frustrated by wrong answers.

Notes:

```text

```

## 6.7 Parent Clarity

- [ ] Parent understands what the app is for.
- [ ] Parent can interpret 学习报告.
- [ ] Parent understands progress is local-only.
- [ ] Parent understands there is no login/account yet.

Notes:

```text

```

---

# 7. Problem-Level Review Table

Use this table for any problem that needs polish.

| Problem ID | Type | Issue Category | Severity | Recommended Action | Status |
|---|---|---|---|---|---|
|  | copy / hint / logic / difficulty / UI | low / medium / high |  |  | open |

Severity guide:

| Severity | Meaning | Action |
|---|---|---|
| low | Minor wording or style issue | Fix when convenient |
| medium | Child confusion or repeated hesitation | Fix in v0.1.3 |
| high | Go logic error or misleading teaching | Block release |

---

# 8. Allowed v0.1.3 Fixes

Allowed problem data edits:

- `title`
- `description`
- `hints`
- `explanation`
- `successMessage`
- `failureMessage`
- `level`
- `tags`

Avoid changing coordinates unless there is a clear Go-logic bug.

If coordinates change:

1. update `src/data/problems.json`;
2. update `docs/CONTENT_REVIEW_v0.1.2.md` or create a v0.1.3 content review note;
3. run `npm run build`;
4. run `npm run test`;
5. request review.

---

# 9. Data and Privacy Notes

v0.1.x uses localStorage only.

No child data is sent to a server.
No account data exists.
No analytics are implemented.
No AI is called.

If feedback is recorded manually, do not include unnecessary personal information about children.

Use anonymous notes such as:

```text
Child A, age range 6–8, studied Go about 1 year.
```

---

# 10. v0.1.3 Completion Criteria

v0.1.3 is complete when:

- playtest notes are recorded;
- high-severity issues are fixed;
- medium-severity copy/hint issues are triaged;
- `npm run build` passes;
- `npm run test` passes;
- no v0.2 features are implemented;
- `docs/TASKS.md` reflects the next phase.

---

# 11. Playtest Session Template

```text
Session ID:
Date:
Tester role:
Child age range:
Go experience:
Device:
Viewport:
Browser:

Tasks completed:
[ ] Home
[ ] Daily practice
[ ] Hint used
[ ] Wrong answer tested
[ ] Wrong book opened
[ ] Wrong problem reviewed
[ ] Report opened
[ ] Settings/reset checked

Main observations:

Confusing problems:

UI issues:

Parent feedback:

Blocking issues:

Recommended fixes:

Release decision:
[ ] Continue v0.1.3 fixes
[ ] Ready for v0.1.3 tag
```
