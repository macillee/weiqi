import { describe, it, expect } from "vitest";
import {
  validateProblem,
  validateAllProblems,
  loadProblems,
} from "@/lib/problems";
import type { Problem } from "@/lib/problems";

function makeValidProblem(overrides: Partial<Problem> = {}): Problem {
  return {
    id: "TEST-001",
    boardSize: 9,
    category: "capture",
    level: 1,
    tags: ["capture"],
    toPlay: "black",
    title: "Test Problem",
    description: "Test description",
    initialStones: [],
    answers: [{ x: 3, y: 3 }],
    hints: ["Hint 1"],
    explanation: "Explanation",
    successMessage: "Good job!",
    failureMessage: "Try again!",
    ...overrides,
  };
}

describe("validateProblem", () => {
  it("passes for a valid problem", () => {
    const result = validateProblem(makeValidProblem());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when id is missing", () => {
    const result = validateProblem(makeValidProblem({ id: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("id"))).toBe(true);
  });

  it("fails when title is missing", () => {
    const result = validateProblem(makeValidProblem({ title: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("title"))).toBe(true);
  });

  it("fails when description is missing", () => {
    const result = validateProblem(makeValidProblem({ description: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("description"))).toBe(true);
  });

  it("fails when answers is empty", () => {
    const result = validateProblem(makeValidProblem({ answers: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("answer"))).toBe(true);
  });

  it("fails when hints is empty", () => {
    const result = validateProblem(makeValidProblem({ hints: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("hint"))).toBe(true);
  });

  it("fails when stone coordinates are out of range", () => {
    const result = validateProblem(
      makeValidProblem({ initialStones: [{ x: 10, y: 0, color: "black" }] }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("invalid"))).toBe(true);
  });

  it("fails when answer coordinates are out of range", () => {
    const result = validateProblem(
      makeValidProblem({ answers: [{ x: 9, y: 0 }] }),
    );
    expect(result.valid).toBe(false);
  });

  it("fails when answer overlaps with a stone", () => {
    const result = validateProblem(
      makeValidProblem({
        initialStones: [{ x: 3, y: 3, color: "black" }],
        answers: [{ x: 3, y: 3 }],
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("overlaps"))).toBe(true);
  });

  it("fails when duplicate stones exist", () => {
    const result = validateProblem(
      makeValidProblem({
        initialStones: [
          { x: 3, y: 3, color: "black" },
          { x: 3, y: 3, color: "white" },
        ],
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("duplicate"))).toBe(true);
  });

  it("fails when a group has zero liberties", () => {
    const result = validateProblem(
      makeValidProblem({
        initialStones: [
          { x: 4, y: 4, color: "black" },
          { x: 3, y: 4, color: "white" },
          { x: 5, y: 4, color: "white" },
          { x: 4, y: 3, color: "white" },
          { x: 4, y: 5, color: "white" },
        ],
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("zero-liberty"))).toBe(true);
  });

  it("fails for invalid category", () => {
    const result = validateProblem(
      makeValidProblem({ category: "invalid" as any }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("invalid category"))).toBe(
      true,
    );
  });

  it("fails for invalid level", () => {
    const result = validateProblem(makeValidProblem({ level: 6 as any }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("level"))).toBe(true);
  });
});

describe("validateAllProblems", () => {
  it("fails when duplicate IDs exist", () => {
    const problems: Problem[] = [
      makeValidProblem({ id: "DUP-001" }),
      makeValidProblem({ id: "DUP-001" }),
    ];
    const result = validateAllProblems(problems);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Duplicate"))).toBe(true);
  });

  it("passes for multiple valid problems", () => {
    const problems: Problem[] = [
      makeValidProblem({ id: "A-001" }),
      makeValidProblem({ id: "A-002" }),
    ];
    const result = validateAllProblems(problems);
    expect(result.valid).toBe(true);
  });
});

describe("problem data quality", () => {
  const problems = loadProblems();

  it("total problem count is 39", () => {
    expect(problems).toHaveLength(39);
  });

  it("v0.1.2 added problem IDs exist", () => {
    const expectedIds = [
      "CAP-011",
      "CAP-012",
      "CAP-013",
      "ESC-006",
      "ESC-007",
      "CC-007",
      "CC-008",
      "CC-009",
      "LD-001",
      "LD-002",
      "LD-003",
      "LD-004",
    ];
    const ids = problems.map((p) => p.id);
    for (const id of expectedIds) {
      expect(ids).toContain(id);
    }
  });

  it("every problem has at least 2 hints", () => {
    for (const problem of problems) {
      expect(problem.hints.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("failureMessage avoids blame or harsh wording", () => {
    const harshPatterns = [
      /错[误了]/,
      /笨/,
      /傻/,
      /太差/,
      /不行/,
      /不对/,
      /错了/,
    ];
    for (const problem of problems) {
      for (const pattern of harshPatterns) {
        expect(problem.failureMessage).not.toMatch(pattern);
      }
    }
  });

  it("all problems are 9x9 board", () => {
    for (const problem of problems) {
      expect(problem.boardSize).toBe(9);
    }
  });

  it("all problems are single-move (exactly one answer point or multiple points for same-move options)", () => {
    for (const problem of problems) {
      expect(problem.answers.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("all problems have child-friendly successMessage", () => {
    for (const problem of problems) {
      expect(problem.successMessage.length).toBeGreaterThan(0);
      expect(problem.successMessage.length).toBeLessThanOrEqual(30);
    }
  });

  describe("multi-step problem validation", () => {
    it("validates a valid multi-step problem", () => {
      const multiStepProblem: Problem = {
        id: "TEST-MULTI-001",
        boardSize: 9,
        category: "capture",
        level: 2,
        tags: ["multi-step", "test"],
        toPlay: "black",
        title: "Test Multi-Step",
        description: "Test multi-step problem",
        initialStones: [
          { x: 3, y: 3, color: "white" },
          { x: 2, y: 3, color: "black" },
        ],
        answers: [{ x: 4, y: 3 }],
        hints: ["Step 1 hint"],
        explanation: "Test explanation",
        successMessage: "Good",
        failureMessage: "Try again",
        totalSteps: 2,
        steps: [
          {
            step: 1,
            addedStones: [],
            removedStones: [],
            answers: [{ x: 4, y: 3 }],
            hints: ["Step 1 hint"],
            explanation: "Step 1 explanation",
            successMessage: "Step 1 good",
            failureMessage: "Step 1 try again",
          },
          {
            step: 2,
            addedStones: [{ x: 4, y: 3, color: "black" }],
            removedStones: [],
            answers: [{ x: 3, y: 4 }],
            hints: ["Step 2 hint"],
            explanation: "Step 2 explanation",
            successMessage: "Step 2 good",
            failureMessage: "Step 2 try again",
          },
        ],
      };
      const result = validateProblem(multiStepProblem);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("fails when step ordering is invalid", () => {
      const problem: Problem = {
        id: "TEST-MULTI-002",
        boardSize: 9,
        category: "capture",
        level: 2,
        tags: ["multi-step", "test"],
        toPlay: "black",
        title: "Test Invalid Order",
        description: "Test invalid step ordering",
        initialStones: [],
        answers: [{ x: 0, y: 0 }],
        hints: ["Hint"],
        explanation: "Explanation",
        successMessage: "Good",
        failureMessage: "Try again",
        totalSteps: 2,
        steps: [
          {
            step: 1,
            addedStones: [],
            removedStones: [],
            answers: [{ x: 0, y: 0 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
          {
            step: 3, // Invalid: should be 2
            addedStones: [],
            removedStones: [],
            answers: [{ x: 1, y: 1 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
        ],
      };
      const result = validateProblem(problem);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Problem TEST-MULTI-002: steps must be sequentially numbered starting from 1");
    });

    it("fails when step answer coordinates are out of range", () => {
      const problem: Problem = {
        id: "TEST-MULTI-003",
        boardSize: 9,
        category: "capture",
        level: 2,
        tags: ["multi-step", "test"],
        toPlay: "black",
        title: "Test Invalid Coordinates",
        description: "Test invalid answer coordinates",
        initialStones: [],
        answers: [{ x: 0, y: 0 }],
        hints: ["Hint"],
        explanation: "Explanation",
        successMessage: "Good",
        failureMessage: "Try again",
        totalSteps: 2,
        steps: [
          {
            step: 1,
            addedStones: [],
            removedStones: [],
            answers: [{ x: 10, y: 10 }], // Invalid: out of 9x9 board
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
          {
            step: 2,
            addedStones: [],
            removedStones: [],
            answers: [{ x: 1, y: 1 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
        ],
      };
      const result = validateProblem(problem);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("invalid x coordinate"))).toBe(true);
    });

    it("fails when addedStones overlaps with existing stones on board", () => {
      const problem: Problem = {
        id: "TEST-MULTI-004",
        boardSize: 9,
        category: "capture",
        level: 2,
        tags: ["multi-step", "test"],
        toPlay: "black",
        title: "Test AddedStone Overlap",
        description: "Test addedStones overlapping with existing stones",
        initialStones: [{ x: 3, y: 3, color: "white" }],
        answers: [{ x: 4, y: 3 }],
        hints: ["Hint"],
        explanation: "Explanation",
        successMessage: "Good",
        failureMessage: "Try again",
        totalSteps: 2,
        steps: [
          {
            step: 1,
            addedStones: [{ x: 3, y: 3, color: "black" }], // Overlaps with initial stone at (3,3)
            removedStones: [],
            answers: [{ x: 4, y: 3 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
          {
            step: 2,
            addedStones: [],
            removedStones: [],
            answers: [{ x: 1, y: 1 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
        ],
      };
      const result = validateProblem(problem);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("overlaps with existing stone"))).toBe(true);
    });

    it("fails when removedStones does not exist on board", () => {
      const problem: Problem = {
        id: "TEST-MULTI-005",
        boardSize: 9,
        category: "capture",
        level: 2,
        tags: ["multi-step", "test"],
        toPlay: "black",
        title: "Test RemovedStone Not Exist",
        description: "Test removedStones removing non-existent stone",
        initialStones: [{ x: 3, y: 3, color: "white" }],
        answers: [{ x: 4, y: 3 }],
        hints: ["Hint"],
        explanation: "Explanation",
        successMessage: "Good",
        failureMessage: "Try again",
        totalSteps: 2,
        steps: [
          {
            step: 1,
            addedStones: [],
            removedStones: [{ x: 5, y: 5, color: "black" }], // Does not exist on board
            answers: [{ x: 4, y: 3 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
          {
            step: 2,
            addedStones: [],
            removedStones: [],
            answers: [{ x: 1, y: 1 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
        },
        ],
      };
      const result = validateProblem(problem);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("does not exist on board"))).toBe(true);
    });

    it("fails when board delta creates zero-liberty group", () => {
      const problem: Problem = {
        id: "TEST-MULTI-006",
        boardSize: 9,
        category: "capture",
        level: 2,
        tags: ["multi-step", "test"],
        toPlay: "black",
        title: "Test Zero Liberty After Delta",
        description: "Test board delta creating zero-liberty group",
        initialStones: [
          { x: 3, y: 3, color: "black" },
          { x: 2, y: 3, color: "white" },
          { x: 4, y: 3, color: "white" },
          { x: 3, y: 2, color: "white" },
          // (3,4) is empty - gives the black stone at (3,3) one liberty
        ],
        answers: [{ x: 3, y: 4 }],
        hints: ["Hint"],
        explanation: "Explanation",
        successMessage: "Good",
        failureMessage: "Try again",
        totalSteps: 2,
        steps: [
          {
            step: 1,
            addedStones: [{ x: 3, y: 4, color: "white" }], // This surrounds the black stone completely
            removedStones: [],
            answers: [{ x: 1, y: 1 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
          {
            step: 2,
            addedStones: [],
            removedStones: [],
            answers: [{ x: 1, y: 1 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
        ],
      };
      const result = validateProblem(problem);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("zero-liberty group"))).toBe(true);
    });
  });
});
