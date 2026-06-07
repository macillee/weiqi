import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Problem } from "@/lib/problems";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Mock requestEngineReview to return a controlled deferred promise
let resolveEngineReview:
  | ((value: { confidence: string; agreesWithAuthoredAnswer: boolean } | null) => void)
  | null = null;

vi.mock("@/lib/review-actions", () => ({
  requestEngineReview: vi.fn(
    () =>
      new Promise((resolve) => {
        resolveEngineReview = resolve;
      }),
  ),
}));

// Audio feedback is no-op in tests
vi.mock("@/lib/audioFeedback", () => ({
  playCorrect: vi.fn(),
  playWrong: vi.fn(),
}));

import ProblemPlayer from "@/components/problem/ProblemPlayer";

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
    successMessage: "Good!",
    failureMessage: "Try again",
  };
}

function clickBoardPoint(
  container: HTMLElement,
  x: number,
  y: number,
): void {
  const circles = container.querySelectorAll('circle[role="button"]');
  const target = Array.from(circles).find(
    (el) => el.getAttribute("aria-label") === `Board intersection at ${x}, ${y}`,
  );
  if (!target) throw new Error(`No clickable intersection at (${x}, ${y})`);
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

function findButton(container: HTMLElement, text: string): HTMLButtonElement | null {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.trim() === text,
  ) ?? null;
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const onNext = vi.fn();

function mount() {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container!);
    root.render(<ProblemPlayer problem={makeProblem("P-001")} onNext={onNext} />);
  });
  return container!;
}

beforeEach(() => {
  resolveEngineReview = null;
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

describe("stale async engine guard", () => {
  it("discards stale engine response when try-again is clicked before engine resolves", async () => {
    const c = mount();

    // 1. Make a wrong move at (0,0) — not the answer at (3,3)
    act(() => {
      clickBoardPoint(c, 0, 0);
    });

    expect(c.textContent).toContain("请老师帮忙");
    expect(c.textContent).toContain("再试一次");

    // 2. Click "请老师帮忙" — engine request is now pending, thisRequestId=1
    const coachBtn = findButton(c, "请老师帮忙");
    expect(coachBtn).not.toBeNull();
    await act(async () => {
      coachBtn!.click();
    });

    // Local review message should be visible (amber-50 container)
    expect(c.querySelector('[class*="bg-amber-50"]')).not.toBeNull();

    // 3. Click "再试一次" before engine resolves — increments coachRequestId to 2
    const tryAgainBtn = findButton(c, "再试一次");
    expect(tryAgainBtn).not.toBeNull();
    await act(async () => {
      tryAgainBtn!.click();
    });

    // After try-again: result=null, board re-enabled, no FeedbackDialog
    expect(c.textContent).not.toContain("请老师帮忙");
    expect(c.textContent).not.toContain("再试一次");

    // 4. Make another wrong move — wrongAttempts becomes 2 → showAnswer=true
    act(() => {
      clickBoardPoint(c, 1, 0);
    });

    // showAnswer=true: FeedbackDialog shows correct answer, "下一题", no coach
    expect(c.textContent).toContain("下一题");
    expect(c.textContent).toContain("正确答案");
    expect(c.textContent).not.toContain("本地引擎辅助");

    // 5. Resolve the stale engine promise (thisRequestId=1, current=2)
    await act(async () => {
      resolveEngineReview!({
        confidence: "high",
        agreesWithAuthoredAnswer: true,
      });
    });

    // 6. Verify stale engine result was NOT applied — no "本地引擎辅助" label
    expect(c.textContent).not.toContain("本地引擎辅助");
    // Still shows the showAnswer dialog without coach message contamination
    expect(c.textContent).toContain("下一题");
  });

  it("applies engine result when no reset happens before resolve", async () => {
    const c = mount();

    // 1. Wrong move
    act(() => {
      clickBoardPoint(c, 0, 0);
    });

    // 2. Click "请老师帮忙"
    const coachBtn = findButton(c, "请老师帮忙");
    expect(coachBtn).not.toBeNull();
    await act(async () => {
      coachBtn!.click();
    });

    // Local review visible
    expect(c.querySelector('[class*="bg-amber-50"]')).not.toBeNull();

    // 3. Resolve engine with high confidence (not stale)
    await act(async () => {
      resolveEngineReview!({
        confidence: "high",
        agreesWithAuthoredAnswer: true,
      });
    });

    // Engine-assisted label should appear
    expect(c.textContent).toContain("本地引擎辅助");
  });

  it("discards stale engine response when problem changes before engine resolves", async () => {
    const c = mount();

    // 1. Wrong move on P-001
    act(() => {
      clickBoardPoint(c, 0, 0);
    });

    const coachBtn = findButton(c, "请老师帮忙");
    expect(coachBtn).not.toBeNull();
    await act(async () => {
      coachBtn!.click();
    });

    expect(c.querySelector('[class*="bg-amber-50"]')).not.toBeNull();

    // 2. Simulate problem change by re-rendering with a different problem ID
    //    This triggers useEffect → coachRequestId.current += 1
    act(() => {
      root!.render(<ProblemPlayer problem={makeProblem("P-002")} onNext={onNext} />);
    });

    // After problem change: fresh state, no coach message, board enabled
    expect(c.textContent).not.toContain("请老师帮忙");

    // 3. Resolve the stale engine promise — should be discarded
    await act(async () => {
      resolveEngineReview!({
        confidence: "high",
        agreesWithAuthoredAnswer: true,
      });
    });

    // 4. Make wrong move on P-002
    act(() => {
      clickBoardPoint(c, 0, 0);
    });

    // The stale engine result must NOT have set coachReview
    // So the "请老师帮忙" button should appear for fresh coach
    expect(c.textContent).toContain("请老师帮忙");
    expect(c.textContent).not.toContain("本地引擎辅助");
  });
});
