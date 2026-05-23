import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import ProblemPlayer from "@/components/problem/ProblemPlayer";
import type { Problem } from "@/lib/problems";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("@/components/board/GoBoard", () => ({
  default: ({
    size,
    stones,
    disabled,
    highlights,
    onPointClick,
  }: {
    size: number;
    stones: Array<{ x: number; y: number; color: string }>;
    disabled: boolean;
    highlights: Array<{ x: number; y: number; type: string }>;
    onPointClick?: (x: number, y: number) => void;
  }) => (
    <div data-testid="go-board" data-size={size} data-disabled={disabled}>
      {Array.from({ length: size * size }, (_, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        const isOccupied = stones.some((s) => s.x === x && s.y === y);
        const highlight = highlights.find((h) => h.x === x && h.y === y);
        return (
          <button
            key={`${x}-${y}`}
            data-testid={`point-${x}-${y}`}
            disabled={disabled || isOccupied}
            data-highlight={highlight?.type}
            onClick={() => onPointClick?.(x, y)}
          >
            {x},{y}
            {isOccupied && `:${stones.find((s) => s.x === x && s.y === y)?.color}`}
            {highlight && `:${highlight.type}`}
          </button>
        );
      })}
    </div>
  ),
}));

vi.mock("@/components/problem/ProblemHeader", () => ({
  default: ({ problem }: { problem: Problem }) => (
    <div data-testid="problem-header">
      <span>{problem.title}</span>
    </div>
  ),
}));

vi.mock("@/components/problem/HintPanel", () => ({
  default: ({
    hints,
    visibleCount,
    onShowHint,
    allShown,
  }: {
    hints: string[];
    visibleCount: number;
    onShowHint: () => void;
    allShown: boolean;
  }) => (
    <div data-testid="hint-panel" data-visible-count={visibleCount} data-all-shown={allShown}>
      <ul>
        {hints.slice(0, visibleCount).map((hint, i) => (
          <li key={i} data-testid={`hint-${i}`}>
            {hint}
          </li>
        ))}
      </ul>
      {!allShown && (
        <button data-testid="show-hint-btn" onClick={onShowHint}>
          显示提示
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/problem/FeedbackDialog", () => ({
  default: ({
    isCorrect,
    successMessage,
    failureMessage,
    explanation,
    onNext,
    onTryAgain,
    showAnswer,
  }: {
    isCorrect: boolean;
    successMessage: string;
    failureMessage: string;
    explanation?: string;
    onNext?: () => void;
    onTryAgain?: () => void;
    showAnswer: boolean;
  }) => (
    <div
      data-testid="feedback-dialog"
      data-correct={isCorrect}
      data-show-answer={showAnswer}
    >
      <p data-testid="feedback-message">{isCorrect ? successMessage : failureMessage}</p>
      {explanation && <p data-testid="feedback-explanation">{explanation}</p>}
      {isCorrect && onNext && (
        <button data-testid="next-btn" onClick={onNext}>
          {showAnswer ? "下一题" : "下一步"}
        </button>
      )}
      {!isCorrect && onTryAgain && !showAnswer && (
        <button data-testid="try-again-btn" onClick={onTryAgain}>
          再试一次
        </button>
      )}
      {!isCorrect && showAnswer && onNext && (
        <button data-testid="next-btn" onClick={onNext}>
          下一题
        </button>
      )}
    </div>
  ),
}));

const createSingleStepProblem = (): Problem => ({
  id: "SINGLE-001",
  boardSize: 9,
  category: "capture",
  level: 1,
  tags: ["test"],
  toPlay: "black",
  title: "单步测试题",
  description: "单步问题描述",
  initialStones: [
    { x: 3, y: 3, color: "white" },
    { x: 2, y: 3, color: "black" },
  ],
  answers: [{ x: 4, y: 3 }],
  hints: ["提示1", "提示2"],
  explanation: "解释",
  successMessage: "成功了！",
  failureMessage: "再试试",
});

const createMultiStepProblem = (): Problem => ({
  id: "MULTI-001",
  boardSize: 9,
  category: "capture",
  level: 2,
  tags: ["multi-step", "test"],
  toPlay: "black",
  title: "多步测试题",
  description: "多步问题描述",
  initialStones: [{ x: 3, y: 3, color: "white" }],
  answers: [{ x: 4, y: 3 }],
  hints: ["全局提示"],
  explanation: "全局解释",
  successMessage: "全部完成！",
  failureMessage: "全局失败",
  totalSteps: 2,
  steps: [
    {
      step: 1,
      answers: [{ x: 4, y: 3 }],
      hints: ["第一步提示"],
      explanation: "第一步解释",
      successMessage: "第一步成功",
      failureMessage: "第一步失败",
      addedStones: [{ x: 4, y: 3, color: "black" }],
    },
    {
      step: 2,
      answers: [{ x: 5, y: 3 }],
      hints: ["第二步提示"],
      explanation: "第二步解释",
      successMessage: "第二步成功",
      failureMessage: "第二步失败",
      addedStones: [{ x: 5, y: 3, color: "black" }],
    },
  ],
});

let container: HTMLDivElement;
let root: Root;

function renderComponent(component: React.ReactElement) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(component));
}

function cleanup() {
  if (root) {
    act(() => root.unmount());
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

function click(id: string) {
  const el = container?.querySelector(`[data-testid="${id}"]`);
  if (el) act(() => (el as HTMLElement).click());
}

function textContent(id: string): string | null {
  const el = container?.querySelector(`[data-testid="${id}"]`);
  return el?.textContent ?? null;
}

function hasText(text: string | RegExp): boolean {
  if (!container) return false;
  const content = container.textContent || "";
  if (typeof text === "string") return content.includes(text);
  return text.test(content);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("ProblemPlayer - single-step problem behavior", () => {
  it("renders single-step problem without step indicator", () => {
    renderComponent(<ProblemPlayer problem={createSingleStepProblem()} />);

    expect(container?.querySelector('[data-testid="problem-header"]')).not.toBeNull();
    expect(container?.querySelector('[data-testid="go-board"]')).not.toBeNull();
    expect(hasText(/第 \d+ 步/)).toBe(false);
  });

  it("correct answer triggers onResult with correct values", () => {
    const onResult = vi.fn();
    const onAttempt = vi.fn();
    renderComponent(
      <ProblemPlayer
        problem={createSingleStepProblem()}
        onResult={onResult}
        onAttempt={onAttempt}
      />
    );

    click("point-4-3");

    expect(onAttempt).toHaveBeenCalledWith(4, 3, true, false);
    expect(onResult).toHaveBeenCalledWith(true, 0, false);
  });

  it("wrong answer records attempt but not final result until max attempts", () => {
    const onResult = vi.fn();
    const onAttempt = vi.fn();
    renderComponent(
      <ProblemPlayer
        problem={createSingleStepProblem()}
        onResult={onResult}
        onAttempt={onAttempt}
      />
    );

    click("point-0-0");

    expect(onAttempt).toHaveBeenCalledWith(0, 0, false, false);
    expect(onResult).not.toHaveBeenCalled();

    expect(container?.querySelector('[data-testid="feedback-dialog"]')).not.toBeNull();
    expect(container?.querySelector('[data-testid="try-again-btn"]')).not.toBeNull();

    click("try-again-btn");
    click("point-0-0");

    expect(onResult).toHaveBeenCalledWith(false, 2, false);
  });

  it("onNext called after correct answer on single-step", () => {
    const onNext = vi.fn();
    renderComponent(<ProblemPlayer problem={createSingleStepProblem()} onNext={onNext} />);

    click("point-4-3");
    click("next-btn");

    expect(onNext).toHaveBeenCalled();
  });
});

describe("ProblemPlayer - multi-step step indicator", () => {
  it("renders step indicator for multi-step problem", () => {
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} />);

    expect(hasText("第 1 步 / 共 2 步")).toBe(true);
  });

  it("shows step circles for each step", () => {
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} />);

    expect(hasText("1")).toBe(true);
    expect(hasText("2")).toBe(true);
  });
});

describe("ProblemPlayer - correct answer advances to next step", () => {
  it("correct answer on step 1 shows step 1 success feedback", () => {
    const onResult = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onResult={onResult} />);

    click("point-4-3");

    expect(container?.querySelector('[data-testid="feedback-dialog"]')).not.toBeNull();
    expect(textContent("feedback-message")).toBe("第一步成功");
    expect(onResult).not.toHaveBeenCalled();
  });

  it("clicking next advances to step 2", () => {
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} />);

    click("point-4-3");
    click("next-btn");

    expect(hasText("第 2 步 / 共 2 步")).toBe(true);
  });

  it("final step correct calls onResult with totals", () => {
    const onResult = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onResult={onResult} />);

    click("point-4-3");
    click("next-btn");

    expect(hasText("第 2 步 / 共 2 步")).toBe(true);
    expect(onResult).not.toHaveBeenCalled();

    click("point-5-3");

    expect(onResult).toHaveBeenCalledWith(true, 0, false);
  });

  it("onNext called after final step completion", () => {
    const onNext = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onNext={onNext} />);

    click("point-4-3");
    click("next-btn");
    click("point-5-3");

    expect(textContent("feedback-message")).toBe("全部完成！");

    click("next-btn");
    expect(onNext).toHaveBeenCalled();
  });
});

describe("ProblemPlayer - hints reset per step", () => {
  it("step 1 hint is shown after clicking show hint", () => {
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} />);

    const hintPanel = container?.querySelector('[data-testid="hint-panel"]');
    expect(hintPanel?.getAttribute("data-visible-count")).toBe("0");

    click("show-hint-btn");

    expect(textContent("hint-0")).toBe("第一步提示");
  });

  it("step 2 hint resets when advancing from step 1", () => {
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} />);

    click("show-hint-btn");
    expect(textContent("hint-0")).toBe("第一步提示");

    click("point-4-3");
    click("next-btn");

    expect(hasText("第 2 步 / 共 2 步")).toBe(true);

    const hintPanel = container?.querySelector('[data-testid="hint-panel"]');
    expect(hintPanel?.getAttribute("data-visible-count")).toBe("0");

    click("show-hint-btn");
    expect(textContent("hint-0")).toBe("第二步提示");
  });

  it("usedHint is tracked per-step and aggregated at problem level", () => {
    const onResult = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onResult={onResult} />);

    click("show-hint-btn");
    click("point-4-3");
    click("next-btn");

    click("point-5-3");

    expect(onResult).toHaveBeenCalledWith(true, 0, true);
  });
});

describe("ProblemPlayer - final step completion records whole problem", () => {
  it("step 1 correct does not call final onResult", () => {
    const onResult = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onResult={onResult} />);

    click("point-4-3");

    expect(onResult).not.toHaveBeenCalled();
  });

  it("step 2 correct calls onResult with aggregated values", () => {
    const onResult = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onResult={onResult} />);

    click("point-4-3");
    click("next-btn");
    click("point-5-3");

    expect(onResult).toHaveBeenCalledWith(true, 0, false);
  });

  it("aggregates wrong attempts from all steps", () => {
    const onResult = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onResult={onResult} />);

    click("point-0-0");
    click("try-again-btn");
    click("point-4-3");
    click("next-btn");

    click("point-0-0");
    click("try-again-btn");
    click("point-5-3");

    expect(onResult).toHaveBeenCalledWith(true, 2, false);
  });
});

describe("ProblemPlayer - wrong answer records at problem level", () => {
  it("wrong answers across steps accumulate at problem level", () => {
    const onResult = vi.fn();
    const onAttempt = vi.fn();
    renderComponent(
      <ProblemPlayer
        problem={createMultiStepProblem()}
        onResult={onResult}
        onAttempt={onAttempt}
      />
    );

    click("point-0-0");
    expect(onAttempt).toHaveBeenCalledWith(0, 0, false, false);

    click("try-again-btn");
    click("point-4-3");
    click("next-btn");

    click("point-0-0");
    click("try-again-btn");
    click("point-5-3");

    expect(onResult).toHaveBeenCalledWith(true, 2, false);
  });

  it("max wrong attempts on any step triggers problem failure", () => {
    const onResult = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onResult={onResult} />);

    click("point-0-0");
    click("try-again-btn");
    click("point-0-0");

    expect(onResult).toHaveBeenCalledWith(false, 2, false);
  });

  it("max wrong attempts on step 2 triggers problem failure", () => {
    const onResult = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onResult={onResult} />);

    click("point-4-3");
    click("next-btn");

    click("point-0-0");
    click("try-again-btn");
    click("point-0-0");

    expect(onResult).toHaveBeenCalledWith(false, 2, false);
  });

  it("wrong attempts reset when advancing to next step", () => {
    const onResult = vi.fn();
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} onResult={onResult} />);

    click("point-0-0");
    click("try-again-btn");
    click("point-4-3");
    click("next-btn");

    click("point-0-0");

    expect(onResult).not.toHaveBeenCalled();

    click("try-again-btn");
    click("point-0-0");

    expect(onResult).toHaveBeenCalledWith(false, 3, false);
  });
});

describe("ProblemPlayer - board state updates between steps", () => {
  it("step 2 board shows stones added in step 1", () => {
    renderComponent(<ProblemPlayer problem={createMultiStepProblem()} />);

    const step1Stone = container?.querySelector('[data-testid="point-3-3"]');
    expect(step1Stone?.textContent).toContain("white");

    click("point-4-3");
    click("next-btn");

    const step2AddedStone = container?.querySelector('[data-testid="point-4-3"]');
    expect(step2AddedStone?.textContent).toContain("black");
  });
});

describe("ProblemPlayer - problem change resets state", () => {
  it("changing problem resets to step 1", () => {
    const problem1 = createMultiStepProblem();
    const problem2: Problem = {
      ...problem1,
      id: "MULTI-002",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 1, y: 1 }],
          hints: ["新第一步提示"],
          explanation: "新第一步解释",
          successMessage: "新第一步成功",
          failureMessage: "新第一步失败",
        },
        {
          step: 2,
          answers: [{ x: 2, y: 2 }],
          hints: ["新第二步提示"],
          explanation: "新第二步解释",
          successMessage: "新第二步成功",
          failureMessage: "新第二步失败",
        },
      ],
    };

    renderComponent(<ProblemPlayer problem={problem1} />);

    click("point-4-3");
    click("next-btn");
    expect(hasText("第 2 步 / 共 2 步")).toBe(true);

    act(() => root.render(<ProblemPlayer problem={problem2} />));

    expect(hasText("第 1 步 / 共 2 步")).toBe(true);
  });
});
