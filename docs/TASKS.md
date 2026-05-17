# Project Task Queue

> This file is the task entry point for opencode.  
> Always read `AGENTS.md`, `docs/PROJECT_SPEC.md`, and `docs/DEVELOPMENT_GUIDE.md` before implementing any task.

---

# Current Phase

v0.1 local-first MVP.

Current development strategy:

```text
1. Stable local Next.js + Docker foundation
2. SVG GoBoard component
3. Problem schema and sample data
4. ProblemPlayer single-question flow
5. Daily practice and levels
6. localStorage progress and wrong book
7. Learning report and polish
```

---

# Completed or In Progress

## Milestone 0: Local Dev + Docker Runtime

Status: completed locally by user/opencode if all commands pass.

Acceptance:

- `npm run dev` works.
- `npm run build` works.
- `docker compose -f docker-compose.dev.yml up` works.
- `docker compose up --build` works.
- `http://localhost:3000` is reachable.

No further business work should be mixed into this milestone.

---

# Next Task: Milestone 1 — SVG GoBoard Component

## Goal

Implement the reusable Go board foundation for v0.1.

This task must not implement the problem system yet.

## Scope

1. Add or update `src/components/board/GoBoard.tsx`.
2. Render a Go board using SVG.
3. Support `size: 9 | 13 | 19`; primary validation is 9x9.
4. Render stones on intersections.
5. Support `onPointClick(x, y)` for empty intersections.
6. Support `disabled`.
7. Support `lastMove` marker.
8. Support `highlights`.
9. Ignore clicks on occupied points.
10. Ignore clicks outside the board.
11. Ensure mobile/touch usability.
12. Provide a simple demo route or home-page demo for local verification.

## Recommended Types

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

## Acceptance Criteria

- `npm run build` passes.
- `docker compose up --build` passes.
- Browser shows a 9x9 Go board.
- 9x9 board has exactly 9 horizontal lines and 9 vertical lines.
- Stones are centered on intersections, not cells.
- Empty-point clicks return correct 0-based coordinates.
- Occupied-point clicks do not trigger `onPointClick`.
- `lastMove` marker appears at the correct coordinate.
- `highlights` appear at correct coordinates.
- The board works in a narrow/mobile viewport.

## Out of Scope

Do not implement:

- Problem JSON loading;
- answer checking;
- hints;
- wrong book;
- daily practice;
- login;
- database;
- AI;
- online play.

---

# Upcoming Task: Milestone 2 — Problem Schema and Sample Problems

## Goal

Define the local problem data contract and provide initial sample problems.

## Scope

- Define `Problem` TypeScript type.
- Create `src/data/problems.json`.
- Add 5–20 sample one-move problems.
- Add validation helpers for coordinates and duplicate stones.
- Add problem loading helper.

## Acceptance

- Sample problems load without runtime errors.
- All sample coordinates are valid.
- TypeScript build passes.
- Data remains separate from UI components.

---

# Upcoming Task: Milestone 3 — ProblemPlayer Single-Question Flow

## Goal

Allow a child to solve one problem from the local JSON problem set.

## Scope

- Implement `ProblemPlayer`.
- Show problem title and description.
- Render initial stones on `GoBoard`.
- Accept a single click answer.
- Check answer against `answers`.
- Show child-friendly success/failure message.
- Show hints progressively.
- Show correct answer after allowed attempts.

## Acceptance

- At least 5 problems are playable.
- Correct answers are recognized.
- Wrong answers are handled warmly.
- Hints display one by one.
- No progress system yet unless explicitly assigned.

---

# Upcoming Task: Milestone 4 — Levels and Daily Practice

## Goal

Create navigable practice flows.

## Scope

- Home entry points.
- Daily practice route.
- Levels route.
- Chapter/level structure.
- Practice completion summary.

---

# Upcoming Task: Milestone 5 — Progress, Stars, Wrong Book

## Goal

Create the local learning loop.

## Scope

- localStorage progress.
- attempts record.
- wrong problem tracking.
- star rewards.
- wrong book route.
- wrong problem review.

---

# Upcoming Task: Milestone 6 — Report and Product Polish

## Goal

Make the app usable for real child/parent testing.

## Scope

- Learning report.
- Accuracy stats.
- category-level mastery summary.
- child-friendly UI polish.
- 100 total problems.

---

# Task Discipline

opencode must not skip ahead.

If a task reveals missing requirements:

1. document the gap;
2. propose a small change;
3. do not silently add large features;
4. keep the PR reviewable.
