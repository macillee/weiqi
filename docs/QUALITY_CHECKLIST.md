# Quality Checklist

> Use this checklist before opening, updating, reviewing, or merging a PR.

---

# 1. Product Scope Checklist

- [ ] The change matches `docs/PROJECT_SPEC.md`.
- [ ] The change matches the active task in `docs/TASKS.md`.
- [ ] The PR does not introduce v0.1 out-of-scope functionality.
- [ ] The PR stays focused on one milestone.
- [ ] Documentation is updated if behavior, commands, or architecture changed.

Out-of-scope for v0.1 unless explicitly approved:

- [ ] login/auth;
- [ ] database;
- [ ] AI opponent;
- [ ] AI review;
- [ ] online multiplayer;
- [ ] payment;
- [ ] teacher/admin backend;
- [ ] social features.

---

# 2. Local Validation Checklist

Run the available commands before handoff.

Required:

```bash
npm run build
docker compose up --build
```

Also run if available:

```bash
npm run lint
npm run typecheck
npm run test
```

Manual validation:

- [ ] `http://localhost:3000` loads.
- [ ] No blocking browser console errors.
- [ ] Docker production-like runtime starts.
- [ ] Docker dev runtime starts if this task touches infrastructure.

---

# 3. GoBoard Checklist

Required for board-related PRs:

- [ ] A 9x9 board has 9 horizontal lines and 9 vertical lines.
- [ ] Stones are placed on intersections.
- [ ] Board coordinates are 0-based.
- [ ] `x` increases left to right.
- [ ] `y` increases top to bottom.
- [ ] Empty intersection click returns correct `x, y`.
- [ ] Occupied intersection click does not trigger answer selection.
- [ ] Clicks outside board do nothing.
- [ ] `disabled` prevents clicks.
- [ ] `lastMove` marker is correct.
- [ ] `highlights` are correct.
- [ ] Mobile/touch target is usable.

---

# 4. Problem Data Checklist

Required for problem-data PRs:

- [ ] Every problem has a unique ID.
- [ ] Every problem has a title.
- [ ] Every problem has a child-friendly description.
- [ ] Every problem has at least one answer.
- [ ] Every coordinate is within board range.
- [ ] No duplicate `initialStones` coordinates.
- [ ] Every problem has at least one hint.
- [ ] `category` values are valid.
- [ ] `level` values are valid.
- [ ] Copy is short, warm, and concrete.

## Problem Go Logic Review

Required for problem-data PRs:

- [ ] Each answer point is an empty intersection (not occupied by a stone).
- [ ] The answer makes sense for the stated title and description.
- [ ] No self-capture moves as answers.
- [ ] Capture problems: the target group actually has the stated liberties.
- [ ] Escape problems: the escaping stone/group is actually in danger.
- [ ] Connection problems: the answer actually connects the stated groups.
- [ ] Cut problems: the answer actually separates the stated groups.
- [ ] Life-and-death problems: the position is simple enough for v0.1 (avoid complex shapes).
- [ ] Problems are appropriate for children who have studied Go for about 1 year.

---

# 5. Child UX Checklist

- [ ] Text is understandable by a 6–10 year old child.
- [ ] Error feedback is encouraging, not punitive.
- [ ] Buttons are large enough.
- [ ] Main action is obvious.
- [ ] No excessive animations or popups.
- [ ] No gambling-like reward mechanics.
- [ ] No leaderboard or social pressure in v0.1.
- [ ] Practice flow remains short and focused.

---

# 6. State and Progress Checklist

Required for progress-related PRs:

- [ ] localStorage key is stable: `children-go-app:v0.1:progress`.
- [ ] Refresh does not lose progress.
- [ ] Missing localStorage data is handled.
- [ ] Malformed localStorage data is handled gracefully.
- [ ] Attempts are recorded consistently.
- [ ] Wrong problem status transitions are correct.
- [ ] Stars are not double-awarded.
- [ ] No secrets or sensitive data are stored.

---

# 7. Code Quality Checklist

- [ ] TypeScript types are explicit and meaningful.
- [ ] No unnecessary `any`.
- [ ] Components have clear responsibilities.
- [ ] UI components do not own unrelated business logic.
- [ ] Domain logic is placed in `src/lib` when appropriate.
- [ ] Data is separated from UI.
- [ ] No large dependency was introduced without justification.
- [ ] No dead code or temporary debug code.
- [ ] No severe console warnings/errors.

---

# 8. PR Review Checklist

A good PR description includes:

- [ ] Summary of changes.
- [ ] Scope and out-of-scope notes.
- [ ] Test plan.
- [ ] Screenshots for UI changes.
- [ ] Known limitations.
- [ ] Specific notes for Codex Review.

Codex Review should request changes if:

- Build fails;
- Core flow fails;
- GoBoard coordinates are wrong;
- Problem answer checking is wrong;
- v0.1 scope is violated;
- Child-facing copy is inappropriate;
- State is lost unexpectedly;
- The PR is too broad to review safely.
