# v0.16 — Parent Session Summary QA Checklist

## 1. Scope checklist

- [ ] `src/lib/session-summary.ts` exists with `summarizeLearningSession()` pure function
- [ ] `docs/RELEASE_NOTES_v0.16.md` exists and covers all required sections
- [ ] `docs/SESSION_SUMMARY_VALIDATION_v0.16.md` exists with QA validation report
- [ ] `src/__tests__/session-summary.test.ts` exists with 29 unit tests
- [ ] No UI, parent dashboard, child-facing summary, API route, Server Action, persistence, telemetry, Supabase write/migration, external AI, Ollama, KataGo, engine/diagnostics, Docker/CI, package, or runtime practice-flow changes were added

## 2. Manual QA checklist — helper behavior

Check each scenario by calling `summarizeLearningSession()` with the described input:

### Empty input
- [ ] `signalQuality` is `"empty"`
- [ ] `totalAttempted` is 0
- [ ] `parentNote` is "今天还没有练习记录，开始一局今日练习吧。"
- [ ] `warnings` include "本次没有练习记录，数据为空。"
- [ ] `strengths`, `shakyConcepts`, `suggestedNextFocus` are empty

### Sparse input (1–2 attempts)
- [ ] `signalQuality` is `"complete"`
- [ ] `warnings` include "数据较少，只作为参考。"
- [ ] No strengths claimed from sparse data
- [ ] `parentNote` does not overclaim mastery

### All-correct session (≥5 problems, ≥70% first-try)
- [ ] `totalCorrectFirstTry` matches input
- [ ] `parentNote` contains "今天表现稳定"
- [ ] Strengths detected ("capture 表现不错", "今天整体表现稳定")
- [ ] No `shakyConcepts`

### Mixed correct/incorrect session
- [ ] Correct/incorrect counts match input
- [ ] `totalRetried` reflects problems with >1 attempt
- [ ] `parentNote` does not blame the child

### Repeated wrong attempts in one category
- [ ] `shakyConcepts` includes "需要再练" and/or "还需要多练习"
- [ ] `suggestedNextFocus` suggests that category
- [ ] `parentNote` mentions the category

### High hint usage
- [ ] `totalHintsUsed` matches input
- [ ] If hint used + retry success > 0, `parentNote` includes "遇到难题时会主动看提示，这是很好的学习习惯"

### Multi-step difficulty
- [ ] `multiStepAttempted` and `multiStepCompleted` match input
- [ ] With ≥2 multi-step incomplete + hints used, `shakyConcepts` includes "多步题还需要再想想"
- [ ] `parentNote` avoids blame

### Multiple categories
- [ ] `categories` list includes all practiced categories
- [ ] Each category has correct counts
- [ ] With ≥4 categories, `parentNote` mentions "练习面很广"

### Unknown category
- [ ] Problem with `category: "unknown"` is grouped under `"unknown"` category
- [ ] No crash or error

### Missing timestamps
- [ ] `reviewedAt` uses `sessionCompletedAt` when present
- [ ] `reviewedAt` falls back to `sessionStartedAt` when `sessionCompletedAt` absent
- [ ] `reviewedAt` becomes `"unknown"` when both absent

## 3. Privacy checklist

Confirm the helper does not expose:

- [ ] Child name or profile
- [ ] Account ID or Supabase ID
- [ ] Raw board state
- [ ] Raw move coordinates
- [ ] Engine raw output, winrate, or scoreLead
- [ ] External AI text
- [ ] Telemetry or analytics events
- [ ] Session transcripts

## 4. Wording checklist

Confirm Chinese parent notes are:

- [ ] Concise (1–3 sentences)
- [ ] Non-judgmental — no blame words
- [ ] Not ranking-based
- [ ] Not anxiety-inducing
- [ ] Not overclaiming mastery from a single session
- [ ] Not using engine/winrate language
- [ ] Actionable for the next practice

## 5. Regression checklist

- [ ] `npm run lint` — exit 0
- [ ] `npm run typecheck` — exit 0
- [ ] `npm run test` — all 521+ tests pass
- [ ] `npm run build` — compiled successfully
- [ ] `npm run test:e2e` — passed in CI (if CI-enabled)
- [ ] Docker build verification — passed in CI (if CI-enabled)

## 6. Release readiness checklist

- [ ] `docs/RELEASE_NOTES_v0.16.md` is complete and accurate
- [ ] `docs/QA_CHECKLIST_v0.16.md` is complete
- [ ] `docs/SESSION_SUMMARY_VALIDATION_v0.16.md` exists (from v0.16.0d)
- [ ] `docs/TASKS.md` marks v0.16.0e delivered and v0.16 series complete
- [ ] Next phase is queued in `docs/TASKS.md`
- [ ] Known limitations are documented in release notes
- [ ] No open blockers from v0.16 QA
- [ ] All docs are internally consistent
