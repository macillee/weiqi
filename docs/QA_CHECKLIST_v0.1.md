# v0.1 QA Checklist

> Use this checklist for v0.1 release acceptance testing.  
> Run each check in order and mark pass/fail.

---

# 1. Environment Check

- [ ] Node.js 18+ installed.
- [ ] `npm install` completes without errors.
- [ ] `npm run dev` starts successfully.
- [ ] `http://localhost:3000` loads in browser.
- [ ] No blocking console errors on page load.

---

# 2. Docker Check

- [ ] `docker compose up --build` starts without errors.
- [ ] `http://localhost:3000` is reachable via Docker.
- [ ] `docker compose down` stops cleanly.

---

# 3. Home Page Entry Check

- [ ] Welcome message "欢迎回来，小棋手！" is displayed.
- [ ] Star count is shown (starts at 0 for new users).
- [ ] Wrong problem count badge is shown (or "暂无错题，真棒！").
- [ ] "今日练习" button is visible and navigates to `/practice`.
- [ ] "闯关地图" button is visible and navigates to `/levels`.
- [ ] "错题本" button is visible and navigates to `/wrong-book`.
- [ ] "学习报告" button is visible and navigates to `/report`.
- [ ] "题目演示" button is visible and navigates to `/demo`.

---

# 4. Daily Practice Check

- [ ] `/practice` shows "今日练习" page with "开始练习" button.
- [ ] Clicking "开始练习" starts a session with problems.
- [ ] Progress bar shows current question number.
- [ ] Star count is shown in the top bar.
- [ ] After completing all problems, summary page is shown.
- [ ] Summary shows accuracy percentage, correct/wrong counts.
- [ ] Summary shows stars earned for the session.
- [ ] "再来一次" button restarts the practice session.
- [ ] "返回首页" button navigates to home.

---

# 5. Board Click Check

- [ ] Clicking an empty intersection places a move (no visual stone for demo, but feedback appears).
- [ ] Clicking an occupied intersection does nothing.
- [ ] Clicking outside the board does nothing.
- [ ] After a correct answer, the board is disabled.
- [ ] After 2 wrong answers, the board is disabled.
- [ ] After clicking "再试一次", the board is re-enabled.

---

# 6. Correct / Wrong Answer Feedback Check

- [ ] Correct answer shows green feedback dialog with `successMessage`.
- [ ] Correct answer shows explanation text.
- [ ] Correct answer shows "下一题" button.
- [ ] Wrong answer shows red feedback dialog with `failureMessage`.
- [ ] Wrong answer message is warm and encouraging (not "错误" or harsh).
- [ ] Wrong answer shows "再试一次" button.
- [ ] After 2 wrong answers, correct answer position is shown.
- [ ] After 2 wrong answers, explanation is shown.
- [ ] After 2 wrong answers, "下一题" button is shown.

---

# 7. Hint Check

- [ ] "显示提示" button is visible before hints are all shown.
- [ ] Clicking "显示提示" reveals one hint at a time.
- [ ] Hints are displayed in order from the problem data.
- [ ] After all hints are shown, "显示提示" button disappears.
- [ ] Initial state shows "还没有提示，先想一想吧。" message.

---

# 8. Wrong Book Check

- [ ] `/wrong-book` shows "错题本" page.
- [ ] New users see "太棒了！你还没有错题，继续保持哦！" message.
- [ ] Users with all mastered wrong problems see "太厉害了！你的错题都复习完了，全部掌握！" message.
- [ ] After getting a problem wrong in `/practice`, it appears in the wrong book.
- [ ] Each wrong problem shows: title, category, difficulty, wrong count, status badge.
- [ ] Status badge shows "待复习" (active) or "复习中" (reviewing).
- [ ] "开始复习" button starts review mode for that problem.
- [ ] Review mode uses `ProblemPlayer` for the wrong problem.
- [ ] After completing review, returns to wrong book list.
- [ ] "← 返回首页" button navigates to home.

---

# 9. Wrong Problem Status Flow Check

- [ ] First wrong answer: problem enters `active` status.
- [ ] Reviewing an `active` problem and getting it correct: status changes to `reviewing`.
- [ ] Reviewing a `reviewing` problem and getting it correct again: status changes to `mastered`.
- [ ] `mastered` problems no longer appear in the wrong book list.
- [ ] Getting a `reviewing` problem wrong again: status resets to `active`.

---

# 10. Star Rewards Check

- [ ] First correct answer on a problem: +1 star.
- [ ] Second correct answer on the same problem: 0 stars (no double award).
- [ ] Completing daily practice session: +5 stars.
- [ ] Completing daily practice again on the same day: 0 stars.
- [ ] Star count on home page reflects total stars.
- [ ] Star count in practice summary reflects session stars.

---

# 11. Learning Report Check

- [ ] `/report` shows "学习报告" page.
- [ ] New users see "还没有学习记录哦" with "开始练习" button.
- [ ] After completing problems, report shows:
  - [ ] 已做过 (unique attempted problems count).
  - [ ] 星星 (total stars).
  - [ ] 正确率 (overall accuracy percentage).
  - [ ] 一次做对 (first-try accuracy percentage).
  - [ ] 待复习 (active + reviewing wrong problem count).
  - [ ] 连续练习 (streak days).
- [ ] Strongest category (最强项) is shown with first-try accuracy.
- [ ] Weakest category (加油项) is shown with first-try accuracy.
- [ ] Category progress bars show completed/total for each category.
- [ ] "返回首页" button navigates to home.

---

# 12. localStorage Persistence Check

- [ ] Complete some problems in `/practice`.
- [ ] Refresh the browser page.
- [ ] Star count on home page is preserved.
- [ ] Wrong problems are still listed in `/wrong-book`.
- [ ] Learning report data is preserved.
- [ ] localStorage key is `children-go-app:v0.1:progress`.

---

# 13. /demo Does Not Pollute Progress Check

- [ ] Clear localStorage (or use incognito mode).
- [ ] Navigate to `/demo`.
- [ ] Complete several problems (correct and wrong).
- [ ] Navigate to home page `/`.
- [ ] Star count is still 0.
- [ ] Wrong problem count is 0 (or "暂无错题，真棒！").
- [ ] Navigate to `/report` — shows "还没有学习记录哦".
- [ ] `/demo` does NOT call `onAttempt` or `onResult`.

---

# 14. Mobile Narrow Screen Check

- [ ] Open in browser with viewport width ≤ 375px.
- [ ] Home page layout is readable and buttons are tappable.
- [ ] Board fits within the screen width.
- [ ] Board intersection click targets are large enough (≥ 32px).
- [ ] Feedback dialog is readable.
- [ ] Hint panel is readable.
- [ ] Practice progress bar is visible.
- [ ] Wrong book list items are readable.
- [ ] Report page grid layout is readable.

---

# 15. Known Limitations

- [ ] 24 problems in `problems.json` (v0.1 target is ~100, v0.1.2 planned for expansion).
- [ ] No user login or account system (planned for v0.2).
- [ ] No database; progress is stored in localStorage only.
- [ ] No AI opponent or AI review.
- [ ] No online multiplayer.
- [ ] No teacher/admin backend.
- [ ] No payment system.
- [ ] Only 9x9 board is fully tested; 13x19 are supported by types but not populated with problems.
- [ ] `timeSpentSeconds` is always 0 (not yet tracked).

---

# 16. Release Conclusion

- [ ] All required checks above pass.
- [ ] Known limitations are documented and acceptable for v0.1.
- [ ] No blocking bugs found.
- [ ] `npm run build` passes.
- [ ] `docker compose up --build` passes.

**Release decision:** [ ] Approved for v0.1 release / [ ] Not ready — see notes below.

**Notes:**
