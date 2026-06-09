# v0.17 — Parent Review Integration Surface QA Checklist

## 1. Scope checklist

- [ ] `docs/RELEASE_NOTES_v0.17.md` exists and covers v0.17.0a–v0.17.0c
- [ ] `docs/QA_CHECKLIST_v0.17.md` exists (this file)
- [ ] `docs/PARENT_REVIEW_INTEGRATION_PLAN_v0.17.md` exists and is current
- [ ] `docs/PARENT_REVIEW_DEBUG_QA_v0.17.md` exists with QA validation report
- [ ] `src/app/dev/session-summary/page.tsx` exists — developer debug page
- [ ] `src/lib/session-summary-input.ts` exists — mapping helper
- [ ] `src/__tests__/session-summary-input.test.ts` exists — 5 mapping helper tests
- [ ] `src/__tests__/session-summary-debug.test.tsx` exists — 10 rendering/privacy tests
- [ ] No parent dashboard, child-facing summary, navigation link, end-of-session modal, history/report view, persistence, API route, Server Action, telemetry, Supabase write, external AI, engine/KataGo, or diagnostics integration was added
- [ ] No problem content, selection logic, practice flow, report, wrong-book, or level progression changes were made

## 2. Static validation

- [ ] `npm run lint` — exit 0
- [ ] `npm run typecheck` — exit 0
- [ ] `npm run test` — all 537+ tests pass
- [ ] `npm run build` — compiled successfully
- [ ] `npm run test:e2e` — passes in CI
- [ ] Docker build verification — passes in CI

## 3. `/dev/session-summary` manual QA

### Developer-only surface

- [ ] Route is at `/dev/session-summary` (not linked from any normal app flow)
- [ ] Page shows "🔧 开发者调试面板" warning banner
- [ ] Banner states: "此页面仅用于开发调试。数据仅存储在本地浏览器中，不会发送到任何服务器。"
- [ ] Banner states: "这不是成绩或排名，仅作为练习参考。"
- [ ] No navigation link to the page exists on home, practice, levels, wrong-book, report, or settings
- [ ] Page links to `/` and `/practice` are acceptable (outbound only)

### Session overview

- [ ] "会话概要" card displays signal quality, total attempted, correct first-try, retried, hints used, multi-step attempted, multi-step completed
- [ ] All counts match the current localStorage progress data

### Category table

- [ ] "分类统计" table lists all practiced categories
- [ ] Each category shows: attempted, correct first-try, retried, hints used, multi-step
- [ ] Multi-step column shows "completed/attempted" format or "-" when none attempted
- [ ] Unknown category handled gracefully if present

### Level table

- [ ] "难度分布" table lists all levels practiced
- [ ] Each level shows: attempted, correct first-try, hints used

### Strengths section

- [ ] "👍 表现不错" section appears when criteria are met (≥2 correct-first-try, ≥60% rate)
- [ ] Section is hidden when no strengths criteria met

### Shaky concepts section

- [ ] "📝 可以继续巩固" section appears when criteria are met (≤40% first-try rate or ≥3 retries)
- [ ] Section is hidden when no shaky concepts identified

### Suggested next focus section

- [ ] "🎯 明日建议" section appears when criteria are met
- [ ] Section is hidden when no suggestions available

### Parent note

- [ ] "家长笔记" section displays Chinese parent note text
- [ ] Note matches expected content based on session data
- [ ] Note is non-judgmental and guidance-oriented

### Warnings

- [ ] Warnings banner appears when data is sparse or missing
- [ ] Warning text is clear and understandable

### Empty state

- [ ] When no progress data exists, page shows "暂无练习数据"
- [ ] Empty state offers a link to `/practice` to start practicing
- [ ] Empty state does not render cards, tables, or sections

### Developer footer

- [ ] Session ID and generation timestamp displayed at bottom
- [ ] Session ID does not contain problem IDs (starts with "session-" prefix)

## 4. Scenario QA

- [ ] Empty progress: no attempts, empty state appears, no summary cards/tables render
- [ ] Sparse one-attempt progress: warning appears and wording avoids overclaiming
- [ ] Mixed correct/wrong session: counts, category table, strengths/shaky concepts reflect mixed data
- [ ] Hint-used / retried session: hints and retry counts render; wording remains non-judgmental
- [ ] Multi-step attempted/completed session: multi-step attempted/completed counts and category multi-step column render correctly

## 5. Privacy/data minimization checklist

Confirm rendered page does **not** display:

- [ ] Raw move coordinates (`selectedX`, `selectedY`)
- [ ] Raw board state
- [ ] Engine metrics or raw output
- [ ] Supabase/account IDs
- [ ] Child identity or profile information
- [ ] Stars, streak days, or achievement data
- [ ] Raw review schedule internals
- [ ] Problem IDs (e.g., "CAP-001", "ESC-003")

Confirm rendered page **does** display only aggregated/sanitized data:

- [ ] Session overview counts
- [ ] Category summary table
- [ ] Level summary table
- [ ] Strengths, shaky concepts, and suggested next focus descriptions
- [ ] Chinese parent note
- [ ] Developer warnings

## 6. Chinese parent wording checklist

- [ ] All wording is concise (1–3 sentences)
- [ ] Non-judgmental — no blame words, ranking, or labels that imply the child is weak/bad
- [ ] Not anxiety-inducing or scoring-pressure
- [ ] Not overclaiming mastery from a single session
- [ ] Not using engine/winrate language
- [ ] Actionable for the next practice
- [ ] Encouraging tone (e.g., "遇到难题时会主动看提示，这是很好的学习习惯")

## 7. Accessibility and layout checklist

- [ ] All sections use proper heading hierarchy (`<h2>`)
- [ ] Tables have proper `<thead>` with `<th>` elements and readable labels
- [ ] Text is readable on narrow/mobile viewport (max-w-2xl, px-4)
- [ ] Text size (`text-sm`) is adequate for reading
- [ ] Color contrast: sections are visually distinct (green/amber/blue/gray)
- [ ] No visual-only information that would be missed without color perception

## 8. Release sign-off

- [ ] `docs/RELEASE_NOTES_v0.17.md` is complete and accurate
- [ ] `docs/QA_CHECKLIST_v0.17.md` is complete
- [ ] `docs/PARENT_REVIEW_DEBUG_QA_v0.17.md` exists with validation report
- [ ] `docs/TASKS.md` marks v0.17.0d delivered and v0.17 series complete
- [ ] `docs/TASKS.md` queues next phase (v0.18.0a)
- [ ] All static validation passes
- [ ] No open blockers from v0.17 QA
- [ ] All docs are internally consistent
