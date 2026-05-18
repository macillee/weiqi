# Development Guide

> Project: 小棋童围棋闯关  
> Version: v0.1 local-first MVP  
> Audience: opencode, Codex Review, human maintainers

---

# 1. Development Goal

This project is a children-friendly Go problem-solving web app.

v0.1 must remain focused on:

- 9x9 Go board;
- one-move problems;
- local JSON problem data;
- localStorage progress state;
- local development and Docker runtime.

Do not turn v0.1 into a general Go platform.

---

# 2. Node.js Requirements

- Recommended: Node.js 22
- Minimum: Node.js 20.19+
- Docker uses `node:22-alpine`

---

# 3. Local Commands

Use these commands for normal local development:

```bash
npm install
npm run dev
npm run build
```

Docker development mode:

```bash
docker compose -f docker-compose.dev.yml up
```

Docker production-like local runtime:

```bash
docker compose up --build
```

Default local URL:

```text
http://localhost:3000
```

If scripts differ from this document, update this document and explain why in the PR.

---

# 4. Branching and PR Rules

Use small task branches:

```text
feature/project-scaffold
feature/go-board
feature/problem-player
feature/levels-practice
feature/progress-wrong-book
feature/report-polish
```

Rules:

- One milestone per PR.
- Do not combine unrelated changes.
- Keep PRs reviewable.
- Include screenshots for UI changes.
- Include manual test notes.
- Update documentation when implementation decisions change.

---

# 5. v0.1 Architecture Rules

Allowed technologies:

- Next.js App Router;
- React;
- TypeScript;
- Tailwind CSS;
- SVG board rendering;
- local JSON data;
- localStorage;
- Docker.

Not allowed in v0.1 unless documentation explicitly changes:

- backend API dependency for core practice flow;
- database dependency;
- login/auth;
- Supabase integration;
- payment;
- AI opponent;
- AI review;
- online multiplayer;
- teacher/admin backend.

---

# 6. Recommended Project Structure

```text
/src
  /app
    page.tsx
    /practice
    /levels
    /wrong-book
    /report
  /components
    /board
      GoBoard.tsx
      BoardPoint.tsx
      Stone.tsx
      BoardHighlight.tsx
    /problem
      ProblemPlayer.tsx
      ProblemHeader.tsx
      HintPanel.tsx
      FeedbackDialog.tsx
    /progress
      StarsBadge.tsx
      StreakBadge.tsx
      AchievementToast.tsx
    /layout
      AppShell.tsx
      ChildFriendlyButton.tsx
  /data
    problems.json
  /lib
    board.ts
    problems.ts
    progress.ts
    recommendation.ts
    achievements.ts
```

This structure can evolve, but changes must remain simple and documented.

---

# 7. TypeScript Rules

- Use explicit domain types for Go board, problems, attempts, and progress.
- Avoid `any` unless there is a documented reason.
- Keep shared types close to domain logic.
- Do not duplicate incompatible types across files.
- Validate external/static JSON data before relying on it.

Core domain types should align with `docs/PROJECT_SPEC.md`.

---

# 8. Go Board Implementation Rules

The board is the foundation of the product.

Rules:

- Board coordinates are 0-based.
- `x` increases left to right.
- `y` increases top to bottom.
- Stones are placed on intersections, not inside cells.
- A 9x9 board has 9 horizontal lines and 9 vertical lines.
- Clicking an occupied intersection must not trigger answer selection.
- Clicking outside the board must do nothing.
- Touch targets must be usable on mobile.
- `GoBoard` must not own problem-answer logic.

Recommended props:

```ts
type StoneColor = "black" | "white";

type Stone = {
  x: number;
  y: number;
  color: StoneColor;
};

type HighlightType = "correct" | "wrong" | "hint" | "lastMove";

type Highlight = {
  x: number;
  y: number;
  type: HighlightType;
};

type GoBoardProps = {
  size: 9 | 13 | 19;
  stones: Stone[];
  disabled?: boolean;
  lastMove?: { x: number; y: number };
  highlights?: Highlight[];
  onPointClick?: (x: number, y: number) => void;
};
```

---

# 9. Problem Data Rules

v0.1 uses local JSON problem data.

Rules:

- Every problem must have a unique ID.
- Every problem must have at least one answer.
- All coordinates must be within board range.
- `initialStones` must not contain duplicate coordinates.
- Child-facing copy must be short, concrete, and encouraging.
- Avoid abstract adult Go language when a simpler prompt works.

Good copy:

```text
白棋只剩一口气，黑棋应该下在哪里？
```

Bad copy:

```text
请寻找当前局面中的最优战术手段。
```

---

# 10. localStorage Rules

v0.1 uses localStorage for progress.

Stable key:

```text
children-go-app:v0.1:progress
```

Rules:

- Progress must survive page refresh.
- Handle missing or malformed localStorage data gracefully.
- Avoid storing unnecessary large data.
- Do not store secrets.
- Keep export/import migration possible for v0.2.

---

# 11. Child UX Rules

This product is for children around 6–10 years old.

Rules:

- Keep copy short.
- Use warm feedback.
- Avoid blame or harsh error messages.
- Use large buttons and clear layout.
- Keep each practice session short.
- Avoid gambling-like or addictive mechanics.

Allowed rewards:

- stars;
- badges;
- gentle animations;
- chapter completion.

Avoid:

- gacha;
- leaderboards;
- aggressive streak pressure;
- excessive popups;
- strong monetization cues.

---

# 12. Testing Rules

Before handing off a PR, run all available checks.

Minimum required checks:

```bash
npm run build
docker compose up --build
```

Also run if available:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:watch
```

Manual checks for UI changes:

- desktop browser;
- narrow/mobile viewport;
- no console blocking errors;
- core route loads;
- core interaction works.

---

# 13. Documentation Maintenance

Documentation is part of the product.

Update docs when:

- architecture changes;
- task scope changes;
- data schema changes;
- command names change;
- Docker workflow changes;
- acceptance criteria change;
- a decision is made that future agents must know.

Do not leave important decisions only in chat history.
