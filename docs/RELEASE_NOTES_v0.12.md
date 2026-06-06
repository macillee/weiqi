# v0.12 — AI-First Intermediate Progression

## Summary

v0.12 shifted the app's focus to AI-first intermediate progression for children who have studied Go for approximately one year. The series evaluated AI feasibility, implemented a bounded local rule-assisted review coach, calibrated level routing to avoid over-basic practice, and expanded the intermediate content library with 10 human-reviewed problems.

All AI features are local-first and privacy-first. No external AI service is required or enabled by default. No data leaves the machine.

---

## Delivered Slices

| Slice | Description | PR |
|---|---|---|
| v0.12.0a | Next phase plan — AI-first intermediate progression for a one-year learner | #134 |
| v0.12.0b | AI feasibility spike — selected local-first architecture (rule/template baseline, optional local KataGo/LLM later, external LLM opt-in only) | #136 |
| v0.12.0c | Level calibration — intermediate learners route away from over-basic level-1 daily practice | #138 |
| v0.12.0d | Local rule-assisted review coach — deterministic, offline, child-friendly Chinese feedback after wrong answers with `请老师帮忙` button | #140 |
| v0.12.0e | Intermediate content expansion — 10 new level 3–5 problems across all categories; human-reviewed content pipeline document | #142 |
| v0.12.0f | Stabilization — release notes and QA checklist (this document) | #143 |

---

## Product Behavior Changes

- **Level calibration** (v0.12.0c): learners with sufficient progress now avoid defaulting into level-1 introductory content during daily practice. Level 2–5 content is prioritized when progress supports it.
- **Local review coach** (v0.12.0d): after a wrong answer, a `请老师帮忙` button appears in the feedback dialog. Clicking it shows short, deterministic, category-specific Chinese feedback (≤150 characters, rule/template-based, no AI model required). Feedback resets on try-again, problem change, or multi-step step transition.
- **Intermediate content** (v0.12.0e): 10 new manually reviewed problems added:
  - CAP-019 (capture, L4), CAP-020 (capture, L5)
  - ESC-012 (escape, L5)
  - CC-015 (connect_cut, L3), CC-016 (connect_cut, L4)
  - LD-011 (life_death, L3), LD-012 (life_death, L4)
  - OP-010 (opening, L4)
  - END-009 (endgame, L3), END-010 (endgame, L4)
- Content library grew from 77 to 87 problems (72 single-step + 9 multi-step + 6 new single-step from v0.12.0e).

---

## Local-First AI Position

- The rule/template coach (`src/lib/ai-review.ts`) works fully offline, with no network calls, no API keys, and no AI model dependencies.
- All output is validated for length (≤150 chars), source (`rule-template`), and banned phrases.
- No KataGo integration has been implemented.
- No Ollama or local LLM integration has been implemented.
- No external AI API is used by default.
- Future work on local engine integration (KataGo prototype) or local LLM remains optional and explicitly scoped.

---

## Validation Baseline

All checks pass for the v0.12.0f release commit:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 416 passed (22 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed (3.7s) |
| Docker build verification | Build success |

---

## Non-Goals / Unchanged Scope

The following remain out of scope for v0.12 and are not implemented:

- KataGo runtime integration
- Ollama / local LLM runtime integration
- External AI API integration
- Free-form AI chat
- Payment, teacher/admin dashboard, leaderboard, multiplayer
- Board-size expansion beyond 9x9
- SGF import/export
- Supabase / server progress expansion beyond the v0.11 baseline
- Broad UI redesign or new routes

---

## What's Next

The v0.13 series is expected to continue the AI-first intermediate progression direction. The recommended next task is a local Go engine feasibility study (KataGo prototype plan), examining how a local KataGo instance could provide move analysis without network dependency.
