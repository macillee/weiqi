import { describe, it, expect } from "vitest";
import {
  validateProblem,
  validateAllProblems,
  loadProblems,
} from "@/lib/problems";
import { getGroup, countLiberties } from "@/lib/board";
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

  it("total problem count is 65", () => {
    expect(problems).toHaveLength(65);
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

  it("all problems pass validateAllProblems", () => {
    const result = validateAllProblems(problems);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("v0.4.0b added problem IDs exist", () => {
    const expectedIds = [
      "CAP-014",
      "ESC-008",
      "CC-011",
      "LD-006",
      "LD-007",
      "OP-004",
    ];
    const multiStepIds = [
      "MULTI-004",
      "MULTI-005",
      "MULTI-006",
      "MULTI-007",
      "MULTI-008",
      "MULTI-009",
    ];
    const ids = problems.map((p) => p.id);
    for (const id of [...expectedIds, ...multiStepIds]) {
      expect(ids).toContain(id);
    }
  });

  it("v0.4.0b single-step IDs use numbers beyond old ranges (no accidental reuse)", () => {
    const problems = loadProblems();
    const oldMax: Record<string, number> = {
      CAP: 13, ESC: 7, CC: 9, LD: 4, OP: 3,
    };
    const newSingleStepIds = ["CAP-014", "ESC-008", "CC-011", "LD-006", "LD-007", "OP-004"];
    for (const id of newSingleStepIds) {
      const match = id.match(/^([A-Z]+)-0*(\d+)$/);
      if (!match) continue;
      const prefix = match[1];
      const num = parseInt(match[2], 10);
      expect(num).toBeGreaterThan(oldMax[prefix]);
    }
  });

  describe("metadata consistency", () => {
    it("every problem has at least one category-aligned tag", () => {
      const catTagMap: Record<string, string[]> = {
        capture: ["capture"],
        escape: ["escape"],
        connect_cut: ["connect", "cut"],
        life_death: ["life_death"],
        opening: ["opening"],
        endgame: ["endgame"],
      };
      for (const problem of problems) {
        const expected = catTagMap[problem.category] || [];
        const hasMatch = expected.some((t) => problem.tags.includes(t));
        expect(hasMatch).toBe(true);
      }
    });

    it("every multi-step problem includes 'multi-step' tag", () => {
      for (const problem of problems) {
        if (problem.steps && problem.totalSteps && problem.totalSteps > 1) {
          expect(problem.tags).toContain("multi-step");
        }
      }
    });

    it("no empty or whitespace-only tags", () => {
      for (const problem of problems) {
        for (const tag of problem.tags) {
          expect(tag.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it("no duplicate tags within a single problem", () => {
      for (const problem of problems) {
        const unique = new Set(problem.tags);
        expect(unique.size).toBe(problem.tags.length);
      }
    });

    it("life_death tag is canonical (no life-death variant)", () => {
      for (const problem of problems) {
        expect(problem.tags).not.toContain("life-death");
      }
    });
  });

  describe("v0.5.0b content pack validation", () => {
    const newIds = [
      "CAP-015", "CAP-016", "CAP-017",
      "ESC-009", "ESC-010",
      "CC-012", "CC-013",
      "LD-008", "LD-009",
      "OP-005",
      "END-001", "END-002", "END-003", "END-004",
    ];

    it("all 14 v0.5.0b problem IDs exist", () => {
      const ids = problems.map((p) => p.id);
      for (const id of newIds) {
        expect(ids).toContain(id);
      }
    });

    it("v0.5.0b IDs are beyond v0.4.0b ranges (no accidental reuse)", () => {
      const oldMax: Record<string, number> = {
        CAP: 14, ESC: 8, CC: 11, LD: 6, OP: 4,
      };
      for (const id of newIds) {
        const match = id.match(/^([A-Z]+)-0*(\d+)$/);
        if (!match) continue;
        const prefix = match[1];
        const num = parseInt(match[2], 10);
        if (oldMax[prefix] !== undefined) {
          expect(num).toBeGreaterThan(oldMax[prefix]);
        }
      }
    });

    it("level 4 and 5 problems exist after v0.5.0b addition", () => {
      const levels = problems.map((p) => p.level);
      expect(levels.filter((l) => l === 4).length).toBeGreaterThanOrEqual(1);
      expect(levels.filter((l) => l === 5).length).toBeGreaterThanOrEqual(1);
    });

    it("endgame category problems have valid level range (1-3)", () => {
      const endgame = problems.filter((p) => p.category === "endgame");
      for (const p of endgame) {
        expect(p.level).toBeGreaterThanOrEqual(1);
        expect(p.level).toBeLessThanOrEqual(3);
      }
    });

    describe("review-time fix verification", () => {
      it("CAP-015 answer captures the white group", () => {
        const p = problems.find((x) => x.id === "CAP-015")!;
        for (const ans of p.answers) {
          const after = [
            ...p.initialStones,
            { x: ans.x, y: ans.y, color: p.toPlay },
          ];
          const whiteGroup = getGroup(
            p.initialStones.find((s) => s.color === "white")!,
            after,
            p.boardSize,
          );
          expect(countLiberties(whiteGroup, after, p.boardSize)).toBe(0);
        }
      });

      it("CAP-017 answer fills white's only corner liberty at (0,0)", () => {
        const p = problems.find((x) => x.id === "CAP-017")!;
        expect(p.answers).toEqual([{ x: 0, y: 0 }]);
        const whiteGroup = getGroup(
          p.initialStones.find((s) => s.color === "white")!,
          p.initialStones,
          p.boardSize,
        );
        // White should have exactly one liberty (the corner) before answer
        expect(countLiberties(whiteGroup, p.initialStones, p.boardSize)).toBe(1);
        // After playing at (0,0), white has 0 liberties → capture
        const after = [
          ...p.initialStones,
          { x: 0, y: 0, color: p.toPlay },
        ];
        const whiteGroupAfter = getGroup(
          p.initialStones.find((s) => s.color === "white")!,
          after,
          p.boardSize,
        );
        expect(countLiberties(whiteGroupAfter, after, p.boardSize)).toBe(0);
      });

      it("ESC-009 initial black group has at least one liberty", () => {
        const p = problems.find((x) => x.id === "ESC-009")!;
        const blackStone = p.initialStones.find((s) => s.color === "black")!;
        const blackGroup = getGroup(blackStone, p.initialStones, p.boardSize);
        expect(countLiberties(blackGroup, p.initialStones, p.boardSize)).toBeGreaterThan(0);
      });

      it("ESC-009 answers are empty escape route points", () => {
        const p = problems.find((x) => x.id === "ESC-009")!;
        for (const ans of p.answers) {
          const occupied = p.initialStones.some(
            (s) => s.x === ans.x && s.y === ans.y,
          );
          expect(occupied).toBe(false);
        }
      });
    });
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

    it("fails when step answer targets an occupied point on the simulated board", () => {
      const problem: Problem = {
        id: "TEST-MULTI-007",
        boardSize: 9,
        category: "capture",
        level: 2,
        tags: ["multi-step", "test"],
        toPlay: "black",
        title: "Test Occupied Answer Point",
        description: "Test step answer landing on an occupied point",
        initialStones: [
          { x: 3, y: 3, color: "white" },
          { x: 2, y: 3, color: "black" },
        ],
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
            removedStones: [],
            answers: [{ x: 3, y: 3 }], // Already occupied by white stone
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
          {
            step: 2,
            addedStones: [],
            removedStones: [],
            answers: [{ x: 4, y: 3 }],
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
        ],
      };
      const result = validateProblem(problem);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("already occupied"))).toBe(true);
    });

    it("fails when step 2 answer targets a point occupied by prior step's addedStones", () => {
      const problem: Problem = {
        id: "TEST-MULTI-008",
        boardSize: 9,
        category: "capture",
        level: 2,
        tags: ["multi-step", "test"],
        toPlay: "black",
        title: "Test Step 2 Answer on AddedStone",
        description: "Test step 2 answer landing on a point occupied by step 1 addedStones",
        initialStones: [
          { x: 3, y: 3, color: "white" },
          { x: 2, y: 3, color: "black" },
        ],
        answers: [{ x: 4, y: 3 }],
        hints: ["Hint"],
        explanation: "Explanation",
        successMessage: "Good",
        failureMessage: "Try again",
        totalSteps: 2,
        steps: [
          {
            step: 1,
            addedStones: [{ x: 4, y: 3, color: "white" }],
            removedStones: [],
            answers: [{ x: 4, y: 3 }], // Player answers here, then addedStone placed
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
          {
            step: 2,
            addedStones: [],
            removedStones: [],
            answers: [{ x: 4, y: 3 }], // Now occupied by step 1's addedStone
            hints: ["Hint"],
            explanation: "Explanation",
            successMessage: "Good",
            failureMessage: "Try again",
          },
        ],
      };
      const result = validateProblem(problem);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("already occupied"))).toBe(true);
    });
  });
});
