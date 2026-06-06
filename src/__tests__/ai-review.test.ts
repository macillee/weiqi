import { describe, it, expect } from "vitest";
import {
  getLocalReview,
  validateReviewOutput,
  type LocalReviewInput,
} from "@/lib/ai-review";
import type { Problem } from "@/lib/problems";

function makeProblem(
  overrides: Partial<Problem> & { id: string },
): Problem {
  return {
    boardSize: 9,
    category: "capture",
    level: 1,
    tags: [],
    toPlay: "black",
    title: "test",
    description: "test",
    initialStones: [],
    answers: [{ x: 3, y: 3 }],
    hints: [],
    explanation: "",
    successMessage: "",
    failureMessage: "",
    ...overrides,
  };
}

const baseInput: LocalReviewInput = {
  problem: makeProblem({ id: "CAP-001", category: "capture" }),
  attemptedMove: { x: 0, y: 0 },
  correctMove: { x: 3, y: 3 },
  usedHint: false,
};

describe("getLocalReview", () => {
  it("returns rule-template source", () => {
    const result = getLocalReview(baseInput);
    expect(result.source).toBe("rule-template");
  });

  it("returns a non-empty message", () => {
    const result = getLocalReview(baseInput);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("returns a non-empty concept", () => {
    const result = getLocalReview(baseInput);
    expect(result.concept.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same input", () => {
    const a = getLocalReview(baseInput);
    const b = getLocalReview(baseInput);
    expect(a).toEqual(b);
  });

  it("produces different output for different inputs", () => {
    const a = getLocalReview(baseInput);
    const b = getLocalReview({ ...baseInput, attemptedMove: { x: 1, y: 1 } });
    expect(a.message).not.toBe(b.message);
  });

  const categories: Array<Problem["category"]> = [
    "capture",
    "escape",
    "connect_cut",
    "life_death",
    "opening",
    "endgame",
    "mixed",
  ];

  for (const cat of categories) {
    describe(`category: ${cat}`, () => {
      it(`returns category-specific feedback for ${cat}`, () => {
        const input: LocalReviewInput = {
          ...baseInput,
          problem: makeProblem({ id: `${cat}-001`, category: cat }),
        };
        const result = getLocalReview(input);
        expect(result.message.length).toBeGreaterThan(0);
        expect(result.source).toBe("rule-template");
      });

      it(`returns a relevant concept for ${cat}`, () => {
        const input: LocalReviewInput = {
          ...baseInput,
          problem: makeProblem({ id: `${cat}-002`, category: cat }),
        };
        const result = getLocalReview(input);
        expect(result.concept.length).toBeGreaterThan(0);
      });
    });
  }

  it("falls back gracefully for unknown category string at runtime", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      problem: makeProblem({
        id: "UNK-001",
        category: "capture",
      }),
    };
    const result = getLocalReview(input);
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.source).toBe("rule-template");
  });

  it("uses wrongMoves message when the attempted move matches", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      problem: makeProblem({
        id: "WM-001",
        category: "capture",
        wrongMoves: [{ x: 0, y: 0, message: "这步没有叫吃，找找气最少的地方。" }],
      }),
      attemptedMove: { x: 0, y: 0 },
    };
    const result = getLocalReview(input);
    expect(result.message).toBe("这步没有叫吃，找找气最少的地方。");
  });

  it("does not use wrongMoves message for a different move", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      problem: makeProblem({
        id: "WM-002",
        category: "capture",
        wrongMoves: [{ x: 5, y: 5, message: "这步没有叫吃。" }],
      }),
      attemptedMove: { x: 0, y: 0 },
    };
    const result = getLocalReview(input);
    expect(result.message).not.toBe("这步没有叫吃。");
  });

  it("gives near-correct feedback when attempted move is adjacent to correct", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      problem: makeProblem({ id: "NEAR-001", category: "capture" }),
      attemptedMove: { x: 3, y: 4 },
      correctMove: { x: 3, y: 3 },
    };
    const result = getLocalReview(input);
    expect(result.message).toContain("差一点点");
  });

  it("does not give near-correct feedback when attempted move is far from correct", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      problem: makeProblem({ id: "FAR-001", category: "capture" }),
      attemptedMove: { x: 0, y: 0 },
      correctMove: { x: 3, y: 3 },
    };
    const result = getLocalReview(input);
    expect(result.message).not.toContain("差一点点");
  });

  it("handles missing correctMove gracefully", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      correctMove: undefined,
    };
    const result = getLocalReview(input);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("handles missing correctMove without near-correct check", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      problem: makeProblem({ id: "NO-CORRECT", category: "capture" }),
      attemptedMove: { x: 3, y: 4 },
      correctMove: undefined,
    };
    const result = getLocalReview(input);
    expect(result.message).not.toContain("差一点点");
  });

  it("provides hint-used message when usedHint is true", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      usedHint: true,
    };
    const noHint = getLocalReview({ ...baseInput, usedHint: false });
    const withHint = getLocalReview(input);
    expect(withHint.message).not.toBe(noHint.message);
    expect(withHint.message.length).toBeGreaterThan(0);
  });

  it("handles problem with no wrongMoves field", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      problem: makeProblem({ id: "NO-WM", category: "life_death" }),
    };
    const result = getLocalReview(input);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("handles problem with empty wrongMoves array", () => {
    const input: LocalReviewInput = {
      ...baseInput,
      problem: makeProblem({
        id: "EMPTY-WM",
        category: "capture",
        wrongMoves: [],
      }),
    };
    const result = getLocalReview(input);
    expect(result.message.length).toBeGreaterThan(0);
  });
});

describe("validateReviewOutput", () => {
  it("accepts valid output", () => {
    const result = getLocalReview(baseInput);
    expect(validateReviewOutput(result)).toBe(true);
  });

  it("rejects output exceeding 150 characters", () => {
    const result = {
      message: "啊".repeat(151),
      concept: "test",
      source: "rule-template" as const,
    };
    expect(validateReviewOutput(result)).toBe(false);
  });

  it("rejects output with non-rule-template source", () => {
    const result = {
      message: "test",
      concept: "test",
      source: "gpt-4",
    } as unknown as import("@/lib/ai-review").LocalReviewResult;
    expect(validateReviewOutput(result)).toBe(false);
  });

  it("rejects output containing banned phrase '你下错了'", () => {
    const result = {
      message: "你下错了，应该下在别的地方。",
      concept: "test",
      source: "rule-template" as const,
    };
    expect(validateReviewOutput(result)).toBe(false);
  });

  it("rejects output containing banned phrase '初学者错误'", () => {
    const result = {
      message: "这是初学者错误。",
      concept: "test",
      source: "rule-template" as const,
    };
    expect(validateReviewOutput(result)).toBe(false);
  });

  it("rejects output containing rank claim '级位'", () => {
    const result = {
      message: "你大概是10级位水平。",
      concept: "test",
      source: "rule-template" as const,
    };
    expect(validateReviewOutput(result)).toBe(false);
  });

  it("rejects output containing '你的水平'", () => {
    const result = {
      message: "你的水平还需要提高。",
      concept: "test",
      source: "rule-template" as const,
    };
    expect(validateReviewOutput(result)).toBe(false);
  });

  it("accepts output at exactly 150 characters", () => {
    const result = {
      message: "啊".repeat(150),
      concept: "test",
      source: "rule-template" as const,
    };
    expect(validateReviewOutput(result)).toBe(true);
  });
});

describe("all category outputs pass validation", () => {
  const categories: Array<Problem["category"]> = [
    "capture",
    "escape",
    "connect_cut",
    "life_death",
    "opening",
    "endgame",
    "mixed",
  ];

  for (const cat of categories) {
    it(`${cat} output passes validation`, () => {
      const input: LocalReviewInput = {
        problem: makeProblem({ id: `V-${cat}`, category: cat }),
        attemptedMove: { x: 0, y: 0 },
        correctMove: { x: 3, y: 3 },
        usedHint: false,
      };
      const result = getLocalReview(input);
      expect(validateReviewOutput(result)).toBe(true);
    });

    it(`${cat} with hint passes validation`, () => {
      const input: LocalReviewInput = {
        problem: makeProblem({ id: `VH-${cat}`, category: cat }),
        attemptedMove: { x: 0, y: 0 },
        correctMove: { x: 3, y: 3 },
        usedHint: true,
      };
      const result = getLocalReview(input);
      expect(validateReviewOutput(result)).toBe(true);
    });
  }
});
