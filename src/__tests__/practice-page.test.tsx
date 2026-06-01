import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Problem } from "@/lib/problems";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// --- Module mocks ---------------------------------------------------------

const onNextRefs: Array<() => void> = [];
const onResultRefs: Array<
  (correct: boolean, wrongAttempts: number, usedHint: boolean) => void
> = [];

vi.mock("@/components/problem/ProblemPlayer", () => ({
  default: (props: {
    problem: Problem | undefined;
    onNext?: () => void;
    onResult?: (correct: boolean, wrongAttempts: number, usedHint: boolean) => void;
  }) => {
    onNextRefs.length = 0;
    onResultRefs.length = 0;
    if (props.onNext) onNextRefs.push(props.onNext);
    if (props.onResult) onResultRefs.push(props.onResult);
    return (
      <div
        data-testid="problem-player"
        data-problem-id={props.problem?.id ?? "MISSING"}
      >
        problem-player
      </div>
    );
  },
}));

vi.mock("@/lib/practice", async () => {
  const actual = await vi.importActual<typeof import("@/lib/practice")>(
    "@/lib/practice",
  );
  return {
    ...actual,
    selectDailyProblems: vi.fn(),
  };
});

vi.mock("@/lib/progress", () => ({
  loadProgress: vi.fn(() => ({
    completedIds: [],
    wrongProblems: {},
    stars: 0,
    streakDays: 0,
    lastPracticeDate: null,
    reviewSchedule: {},
  })),
  saveProgress: vi.fn(),
}));

vi.mock("@/lib/spaced-review", () => ({
  updateReviewSchedule: vi.fn((schedule) => schedule),
}));

let resolveDailyComplete:
  | ((value: {
      progress: {
        completedIds: string[];
        wrongProblems: Record<string, unknown>;
        stars: number;
        streakDays: number;
        lastPracticeDate: string | null;
        reviewSchedule: Record<string, unknown>;
      };
      starsEarned: number;
      sync: { synced: boolean; error: string | null };
    }) => void)
  | null = null;

vi.mock("@/lib/progress-source", () => ({
  recordAttemptWithSync: vi.fn(async () => ({
    progress: {
      completedIds: [],
      wrongProblems: {},
      stars: 0,
      streakDays: 0,
      lastPracticeDate: null,
      reviewSchedule: {},
    },
    starsEarned: 0,
    sync: { synced: false, error: null },
  })),
  recordDailyPracticeCompleteWithSync: vi.fn(
    () =>
      new Promise((resolve) => {
        resolveDailyComplete = resolve;
      }),
  ),
}));

vi.mock("@/lib/supabase/auth", () => ({
  useSupabaseAuth: () => ({ session: null }),
}));

// Importing AFTER mocks so the mocked modules are used.
import PracticePage from "@/app/practice/page";
import { selectDailyProblems } from "@/lib/practice";

// --- Test utilities -------------------------------------------------------

function makeProblem(id: string): Problem {
  return {
    id,
    boardSize: 9,
    category: "capture",
    level: 1,
    tags: ["capture"],
    toPlay: "black",
    title: `Problem ${id}`,
    description: "Test",
    initialStones: [],
    answers: [{ x: 3, y: 3 }],
    hints: ["Hint"],
    explanation: "Exp",
    successMessage: "Good",
    failureMessage: "Try again",
  };
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function mount() {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container!);
    root.render(<PracticePage />);
  });
  return container!;
}

beforeEach(() => {
  onNextRefs.length = 0;
  onResultRefs.length = 0;
  resolveDailyComplete = null;
  vi.mocked(selectDailyProblems).mockReturnValue([makeProblem("P-001")]);
});

afterEach(() => {
  if (root) {
    act(() => {
      root!.unmount();
    });
    root = null;
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  container = null;
});

// --- Tests ----------------------------------------------------------------

describe("PracticePage end-of-session transition (regression for issue #83)", () => {
  it("never renders ProblemPlayer with an undefined problem during the async sync window after the last problem", async () => {
    const c = mount();

    // 1. idle phase: "开始练习" button is visible
    const startBtn = Array.from(c.querySelectorAll("button")).find(
      (b) => b.textContent === "开始练习",
    );
    expect(startBtn).toBeDefined();

    // 2. start practice
    act(() => {
      startBtn!.click();
    });

    // 3. playing phase: ProblemPlayer rendered with P-001
    const player = c.querySelector('[data-testid="problem-player"]');
    expect(player).not.toBeNull();
    expect(player!.getAttribute("data-problem-id")).toBe("P-001");
    expect(onResultRefs).toHaveLength(1);
    expect(onNextRefs).toHaveLength(1);

    // 4. simulate correct answer on the (only / last) problem
    act(() => {
      onResultRefs[0](true, 0, false);
    });

    // 5. simulate "下一题" tap on the last problem.
    //    handleNext is async and awaits recordDailyPracticeCompleteWithSync,
    //    which is mocked to return a pending Promise (resolveDailyComplete
    //    is null until we resolve it manually). React will re-render during
    //    that await window.
    await act(async () => {
      onNextRefs[0]();
    });

    // 6. CRITICAL ASSERTION: even though the sync promise has not resolved
    //    yet, the rendered output must NOT contain a ProblemPlayer with an
    //    undefined / missing problem id. Before the fix in issue #83, the
    //    "playing" branch was rendered with session.currentIndex out of
    //    bounds and the player crashed on problem.steps.
    const playerDuringAwait = c.querySelector('[data-testid="problem-player"]');
    if (playerDuringAwait) {
      expect(playerDuringAwait.getAttribute("data-problem-id")).not.toBe(
        "MISSING",
      );
    }

    // 7. summary heading should already be visible synchronously (phase
    //    switched to "summary" in the same batched update as setSession).
    expect(c.textContent).toContain("练习完成");

    // 8. now resolve the deferred sync call; summary still renders.
    expect(resolveDailyComplete).not.toBeNull();
    await act(async () => {
      resolveDailyComplete!({
        progress: {
          completedIds: ["P-001"],
          wrongProblems: {},
          stars: 5,
          streakDays: 1,
          lastPracticeDate: new Date().toISOString(),
          reviewSchedule: {},
        },
        starsEarned: 5,
        sync: { synced: false, error: null },
      });
    });

    expect(c.textContent).toContain("练习完成");
    expect(c.querySelector('[data-testid="problem-player"]')).toBeNull();
  });

  it("does not jump to summary phase when there is a next problem", async () => {
    vi.mocked(selectDailyProblems).mockReturnValue([
      makeProblem("P-001"),
      makeProblem("P-002"),
    ]);

    const c = mount();

    const startBtn = Array.from(c.querySelectorAll("button")).find(
      (b) => b.textContent === "开始练习",
    );
    act(() => {
      startBtn!.click();
    });

    expect(
      c.querySelector('[data-testid="problem-player"]')!.getAttribute(
        "data-problem-id",
      ),
    ).toBe("P-001");

    // Complete first problem
    act(() => {
      onResultRefs[0](true, 0, false);
    });
    await act(async () => {
      onNextRefs[0]();
    });

    // Should still be in playing phase, advanced to P-002, no summary, no
    // pending sync promise (recordDailyPracticeCompleteWithSync is only
    // called when the session completes).
    expect(c.textContent).not.toContain("练习完成");
    const player = c.querySelector('[data-testid="problem-player"]');
    expect(player).not.toBeNull();
    expect(player!.getAttribute("data-problem-id")).toBe("P-002");
    expect(resolveDailyComplete).toBeNull();
  });
});
