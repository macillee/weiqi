# UX Observation Checklist — Engine-Assisted Review (v0.14)

## 1. Goal and Rules

**Goal**: Manually observe whether engine-assisted review (v0.13.0d) improves or harms the learning experience for a child Go learner.

**Target learner**: Child with about one year of Go study.

**Rules**:
- Observation is manual by the parent/user. No telemetry, analytics, screenshots, screen recording, or child data export is required.
- Do not treat one session as proof; use it as product feedback for the next phase.
- The KataGo-enabled session (Session C) is completely optional. Skip it if KataGo is not set up.
- Focus on the child's behavior and reaction, not on engine internals.

---

## 2. Session Setup

Run three short practice sessions, 5–10 problems each, on separate days or with breaks between.

### Session A — Engine Disabled (baseline)

| Item | Detail |
|---|---|
| Setup | `KATAGO_ENABLED` unset or `false`. Restart if env changed. |
| Expected | Rule/template feedback only. No `本地引擎辅助` label. |
| Watch for | Whether the child reads feedback, retries, or ignores. |
| Pass | Feedback appears immediately, no labels, no confusion. |
| Fail | Any engine-related label appears, or feedback is delayed. |

### Session B — Engine Unavailable (fallback)

| Item | Detail |
|---|---|
| Setup | `KATAGO_ENABLED=true`, but set `KATAGO_BIN_PATH` to an invalid path (e.g. `/usr/local/bin/katago-nonexistent`). Restart. |
| Expected | App falls back to rule/template without error. No `本地引擎辅助` label. |
| Watch for | Any crash, loading spinner, or error message visible to the child. |
| Pass | Same experience as Session A. Child cannot tell engine is configured but broken. |
| Fail | Child sees error, loading state, or any engine-related message. |

### Session C — Engine Available (optional)

| Item | Detail |
|---|---|
| Setup | Local KataGo installed and configured (`KATAGO_ENABLED=true`, valid paths). Restart. |
| Expected | `本地引擎辅助` label may appear on some wrong answers when engine signal is high/medium confidence and agrees with authored answer. |
| Watch for | Does the label appear? Does the child notice it? Does it help or distract? Are there delays? |
| Pass | Label appears on some answers; child either reads it and moves on, or ignores it. Feedback remains ≤150 chars and actionable. |
| Fail | Label causes confusion, repeated questions, delays, or stale messages. |

---

## 3. Per-Problem Observation Form

Copy this template for each wrong answer encountered.

```
Date: _______________
Session: [A / B / C]
Problem ID: _______________
Category: [capture / escape / connect_cut / life_death / opening / endgame]
Level: [1 / 2 / 3 / 4 / 5]
Wrong move (if known): (__, __)
Hint used before wrong answer? [yes / no]

Feedback source observed:
  [ ] rule-template
  [ ] engine-assisted
  [ ] unclear / can't tell

Feedback text summary (key phrases):
  _______________________________________________
  _______________________________________________

Child reaction:
  [ ] reads carefully
  [ ] retries immediately
  [ ] asks "这是什么意思?" or similar
  [ ] seems confused / pauses
  [ ] ignores feedback, clicks randomly
  [ ] asks about the label

Time-to-retry (rough):
  [ ] <5s
  [ ] 5–15s
  [ ] 15–30s
  [ ] >30s

Stale/old message appeared? [yes / no]
Visible delay / loading / confusion? [yes / no]

Parent note:
  _______________________________________________
  _______________________________________________
```

---

## 4. Session Summary Form

Complete one summary per session.

```
Session type: [A / B / C]
Date(s): _______________

Problems attempted: _______________
Wrong answers observed: _______________
Coach uses (请老师帮忙): _______________
Engine-assisted labels observed: _______________
Confusing moments: _______________
Stale/old message issues: _______________

Overall parent rating:
  [ ] helpful — child seems to benefit or is neutral
  [ ] neutral — no noticeable difference
  [ ] confusing — child seemed puzzled
  [ ] harmful — child frustrated or slowed down

Recommendation:
  [ ] keep as-is
  [ ] hide the "本地引擎辅助" label
  [ ] make engine slower/less visible
  [ ] improve message wording
  [ ] disable engine-assisted review
  [ ] needs more observation

Notes:
  _______________________________________________
  _______________________________________________
```

---

## 5. Decision Criteria

Use these criteria to decide what to do next:

| Observation | Recommended action |
|---|---|
| No stale messages; no child-facing errors; child understands or ignores label | Continue current behavior |
| Child repeatedly ignores or misunderstands engine-assisted messages; messages feel generic | Improve wording (v0.14.x content tweak) |
| Child asks about label repeatedly; it distracts from the problem | Hide the label; keep engine logic for future use |
| Parent can evaluate with manual checklist alone | Delay diagnostics work |
| Parent cannot tell whether engine is enabled/available; fallback behavior is hard to verify | Prioritize diagnostics (v0.14.c/d) |
| Engine setup creates repeated confusion | Simplify setup or add validation |
| Stale messages appear; engine results cause wrong-problem confusion; child-facing errors appear; feedback reduces practice flow | **Disable or strongly gate** engine-assisted review |

### Blocking conditions

If **any** of the following is observed, pause further engine UX work and open a bug:

- Stale engine message appears after problem change or step transition
- Child sees an engine error message or crash dialog
- Engine feedback directly contradicts the authored answer in a confusing way
- Feedback flow is blocked (loading spinner that never resolves)
- Child gives up or expresses frustration during engine-assisted feedback

---

## 6. Privacy / Safety Reminder

- Do not collect child identity data (name, nickname, profile).
- Do not upload observations anywhere by default.
- Keep notes local (paper, local text file, or parent's private notes).
- Avoid screenshots or video unless personally needed — and keep them private.
- No external AI API or analytics is required for this evaluation.
- Observations are for product improvement, not for grading the child.

---

## 7. Sign-Off Template

```
Observer: _______________
Observation dates: _______________

[ ] Session A (engine disabled) completed
[ ] Session B (engine unavailable) completed
[ ] Session C (engine available) — completed / skipped (circle one)

Key findings:
  _______________________________________________
  _______________________________________________
  _______________________________________________

Recommendation for v0.14.0c:
  [ ] Continue as-is
  [ ] Improve wording
  [ ] Hide label
  [ ] Prioritize diagnostics
  [ ] Disable / gate engine-assisted review

Known issues discovered:
  _______________________________________________
  _______________________________________________
```
