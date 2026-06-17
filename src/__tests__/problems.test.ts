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
      makeValidProblem({ category: "invalid" as unknown as Problem["category"] }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("invalid category"))).toBe(
      true,
    );
  });

  it("fails for invalid level", () => {
    const result = validateProblem(makeValidProblem({ level: 6 as unknown as Problem["level"] }));
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

  it("total problem count is 110 (after v0.20.0d Pack B pilot)", () => {
    expect(problems).toHaveLength(110);
  });

  it("v0.20.0d added Pack B problem IDs exist", () => {
    const expectedIds = [
      "END-013", "END-014", "END-015", "END-016",
      "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008",
    ];
    for (const id of expectedIds) {
      expect(problems.some((p) => p.id === id)).toBe(true);
    }
  });

  it("v0.20.0d Pack B problems are level 3-5 (no L1/L2), category endgame or mixed", () => {
    const packB = problems.filter((p) =>
      ["END-013", "END-014", "END-015", "END-016",
       "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008"].includes(p.id),
    );
    expect(packB).toHaveLength(9);
    for (const p of packB) {
      expect(p.level).toBeGreaterThanOrEqual(3);
      expect(p.level).toBeLessThanOrEqual(5);
      expect(["endgame", "mixed"]).toContain(p.category);
      expect(p.boardSize).toBe(9);
      expect(p.answers.length).toBeGreaterThanOrEqual(1);
      expect(p.hints.length).toBeGreaterThanOrEqual(1);
      expect(p.explanation.length).toBeGreaterThan(0);
      expect(p.successMessage.length).toBeGreaterThan(0);
      expect(p.failureMessage.length).toBeGreaterThan(0);
    }
  });

  it("v0.20.0d Pack B problem initialStones have no duplicate coordinates", () => {
    const packB = problems.filter((p) =>
      ["END-013", "END-014", "END-015", "END-016",
       "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008"].includes(p.id),
    );
    for (const p of packB) {
      const coords = p.initialStones.map((s) => `${s.x},${s.y}`);
      const unique = new Set(coords);
      expect(coords.length).toBe(unique.size);
    }
  });

  it("v0.20.0d Pack B problem answers land on empty intersections (not on existing stones)", () => {
    const packB = problems.filter((p) =>
      ["END-013", "END-014", "END-015", "END-016",
       "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008"].includes(p.id),
    );
    for (const p of packB) {
      for (const a of p.answers) {
        const onStone = p.initialStones.some(
          (s) => s.x === a.x && s.y === a.y,
        );
        expect(onStone).toBe(false);
      }
    }
  });

  it("v0.20.0d Pack B problem child-facing copy length is reasonable (title <= 12 chars, description <= 60 chars)", () => {
    const packB = problems.filter((p) =>
      ["END-013", "END-014", "END-015", "END-016",
       "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008"].includes(p.id),
    );
    for (const p of packB) {
      expect(p.title.length).toBeLessThanOrEqual(12);
      expect(p.description.length).toBeLessThanOrEqual(60);
    }
  });

  it("v0.20.0d Pack B problem hint and message copy is non-empty and warm (no harsh language)", () => {
    const packB = problems.filter((p) =>
      ["END-013", "END-014", "END-015", "END-016",
       "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008"].includes(p.id),
    );
    for (const p of packB) {
      expect(p.hints.length).toBeGreaterThanOrEqual(2);
      expect(p.successMessage.length).toBeGreaterThan(0);
      expect(p.failureMessage.length).toBeGreaterThan(0);
      // No winrate / rating / harsh language
      const allText = [
        p.title,
        p.description,
        p.explanation,
        p.successMessage,
        p.failureMessage,
        ...p.hints,
      ].join(" ");
      expect(allText).not.toMatch(/winrate|胜率|段位|级位|你下错了/i);
    }
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
        mixed: ["mixed"],
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

    it("endgame category problems have valid level range (1-5)", () => {
      const endgame = problems.filter((p) => p.category === "endgame");
      for (const p of endgame) {
        expect(p.level).toBeGreaterThanOrEqual(1);
        expect(p.level).toBeLessThanOrEqual(5);
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

  describe("v0.7.0b content pack validation", () => {
    const newIds = [
      "END-005", "END-006", "END-007", "END-008",
      "OP-006", "OP-007", "OP-008", "OP-009",
      "CAP-018",
      "ESC-011",
      "CC-014",
      "LD-010",
    ];

    it("all 12 v0.7.0b problem IDs exist", () => {
      const ids = problems.map((p) => p.id);
      for (const id of newIds) {
        expect(ids).toContain(id);
      }
    });

    it("v0.7.0b IDs are beyond v0.5.0b ranges (no accidental reuse)", () => {
      const oldMax: Record<string, number> = {
        CAP: 17, ESC: 10, CC: 13, LD: 9, OP: 5, END: 4,
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

    it("endgame count increases by at least 4 (v0.5.0b: 4 → v0.7.0b: 8)", () => {
      const endgame = problems.filter((p) => p.category === "endgame");
      expect(endgame.length).toBeGreaterThanOrEqual(8);
    });

    it("opening count increases by at least 3 (v0.5.0b: 5 → v0.7.0b: 9)", () => {
      const opening = problems.filter((p) => p.category === "opening");
      expect(opening.length).toBeGreaterThanOrEqual(8);
    });

    it("at least one new opening level 5 problem exists (OP-006)", () => {
      const op5 = problems.filter(
        (p) => p.category === "opening" && p.level === 5,
      );
      expect(op5.length).toBeGreaterThanOrEqual(1);
      expect(op5.map((p) => p.id)).toContain("OP-006");
    });

    it("at least one new endgame level 4 problem exists (END-007)", () => {
      const end4 = problems.filter(
        (p) => p.category === "endgame" && p.level === 4,
      );
      expect(end4.length).toBeGreaterThanOrEqual(1);
      expect(end4.map((p) => p.id)).toContain("END-007");
    });

    it("at least one new endgame level 5 problem exists (END-008)", () => {
      const end5 = problems.filter(
        (p) => p.category === "endgame" && p.level === 5,
      );
      expect(end5.length).toBeGreaterThanOrEqual(1);
      expect(end5.map((p) => p.id)).toContain("END-008");
    });

    it("level 3-5 problem count increases meaningfully", () => {
      const upper = problems.filter((p) => p.level >= 3);
      expect(upper.length).toBeGreaterThanOrEqual(30);
    });

    it("all v0.7.0b problems are 9x9 single-step (no 3+ step)", () => {
      const newProblems = problems.filter((p) => newIds.includes(p.id));
      for (const p of newProblems) {
        expect(p.boardSize).toBe(9);
        expect(p.steps === undefined || p.totalSteps === undefined || p.totalSteps <= 2).toBe(true);
      }
    });

    describe("review-time correctness checks", () => {
      it("END-005 answer is empty and adjacent to black wall", () => {
        const p = problems.find((x) => x.id === "END-005")!;
        const occupied = p.initialStones.some(
          (s) => s.x === 3 && s.y === 4,
        );
        expect(occupied).toBe(false);
        // Adjacent black stones: (2,4), (3,3), (3,5)
        for (const [x, y] of [[2, 4], [3, 3], [3, 5]]) {
          const adj = p.initialStones.some(
            (s) => s.x === x && s.y === y && s.color === "black",
          );
          expect(adj).toBe(true);
        }
      });

      it("END-007 connects the two black groups via (4,4)", () => {
        const p = problems.find((x) => x.id === "END-007")!;
        const ans = p.answers[0];
        expect(ans).toEqual({ x: 4, y: 4 });
        // Two black groups: (3,2)(3,3)(4,3) and (5,4)(5,5).
        // (4,4) is adjacent to (4,3) and (5,4) so playing it joins them.
        const adj34 = p.initialStones.some(
          (s) => s.x === 4 && s.y === 3 && s.color === "black",
        );
        const adj54 = p.initialStones.some(
          (s) => s.x === 5 && s.y === 4 && s.color === "black",
        );
        expect(adj34).toBe(true);
        expect(adj54).toBe(true);
      });

      it("CAP-018: white 2x2 block is in atari; filling the only liberty (4,1) captures all 4 stones", () => {
        const p = problems.find((x) => x.id === "CAP-018")!;
        // Single answer (4,1).
        expect(p.answers).toEqual([{ x: 4, y: 1 }]);
        // Answer point must be empty in the initial state.
        const occupied = p.initialStones.some(
          (s) => s.x === 4 && s.y === 1,
        );
        expect(occupied).toBe(false);
        // White 2x2 block must be in atari (exactly 1 liberty).
        const whiteStones = p.initialStones.filter((s) => s.color === "white");
        const whiteGroup = getGroup(whiteStones[0], p.initialStones, p.boardSize);
        const initialLibs = countLiberties(whiteGroup, p.initialStones, p.boardSize);
        expect(initialLibs).toBe(1);
        // After black plays the answer, the white group has 0 liberties
        // (i.e., the 4-stone block is captured in a single move).
        const afterStones = [
          ...p.initialStones,
          { x: 4, y: 1, color: "black" as const },
        ];
        const afterLibs = countLiberties(whiteGroup, afterStones, p.boardSize);
        expect(afterLibs).toBe(0);
      });

      it("ESC-011 black stone is in atari and answer escapes to center", () => {
        const p = problems.find((x) => x.id === "ESC-011")!;
        const blackStone = p.initialStones.find((s) => s.color === "black")!;
        const blackGroup = getGroup(blackStone, p.initialStones, p.boardSize);
        const libs = countLiberties(blackGroup, p.initialStones, p.boardSize);
        expect(libs).toBe(1);
        // Answer (3,4) must be empty and is the only liberty.
        const occupied = p.initialStones.some(
          (s) => s.x === 3 && s.y === 4,
        );
        expect(occupied).toBe(false);
      });

      it("OP-006 answer (4,4) is the tengen (center of 9x9)", () => {
        const p = problems.find((x) => x.id === "OP-006")!;
        expect(p.answers).toEqual([{ x: 4, y: 4 }]);
        const occupied = p.initialStones.some(
          (s) => s.x === 4 && s.y === 4,
        );
        expect(occupied).toBe(false);
      });

      it("LD-010 answer (3,3) is the center of the 3x3 black ring", () => {
        const p = problems.find((x) => x.id === "LD-010")!;
        expect(p.answers).toEqual([{ x: 3, y: 3 }]);
        // The 8 ring stones must all be black.
        for (const [x, y] of [
          [2, 2], [2, 3], [2, 4],
          [3, 2],          [3, 4],
          [4, 2], [4, 3], [4, 4],
        ]) {
          const stone = p.initialStones.find(
            (s) => s.x === x && s.y === y,
          );
          expect(stone?.color).toBe("black");
        }
        const occupied = p.initialStones.some(
          (s) => s.x === 3 && s.y === 3,
        );
        expect(occupied).toBe(false);
      });

      it("END-006 answer (3,3) is empty and fills the gap in the black corner wall", () => {
        const p = problems.find((x) => x.id === "END-006")!;
        expect(p.answers).toEqual([{ x: 3, y: 3 }]);
        const occupied = p.initialStones.some(
          (s) => s.x === 3 && s.y === 3,
        );
        expect(occupied).toBe(false);
        // Black wall exists at (2,2),(2,3),(2,4),(3,2)
        for (const [x, y] of [[2, 2], [2, 3], [2, 4], [3, 2]]) {
          const stone = p.initialStones.find(
            (s) => s.x === x && s.y === y,
          );
          expect(stone?.color).toBe("black");
        }
      });

      it("END-008 answer (3,3) is empty and fills black's internal gap", () => {
        const p = problems.find((x) => x.id === "END-008")!;
        expect(p.answers).toEqual([{ x: 3, y: 3 }]);
        const occupied = p.initialStones.some(
          (s) => s.x === 3 && s.y === 3,
        );
        expect(occupied).toBe(false);
        // Black formation around the gap
        for (const [x, y] of [[2, 2], [2, 3], [2, 4], [3, 2], [3, 4], [4, 2]]) {
          const stone = p.initialStones.find(
            (s) => s.x === x && s.y === y,
          );
          expect(stone?.color).toBe("black");
        }
      });

      it("OP-007 answer (2,2) is the small knight approach to white corner (0,0)", () => {
        const p = problems.find((x) => x.id === "OP-007")!;
        expect(p.answers).toEqual([{ x: 2, y: 2 }]);
        const occupied = p.initialStones.some(
          (s) => s.x === 2 && s.y === 2,
        );
        expect(occupied).toBe(false);
      });

      it("OP-008 answer (2,2) is the small knight enclosure from black corner (0,0)", () => {
        const p = problems.find((x) => x.id === "OP-008")!;
        expect(p.answers).toEqual([{ x: 2, y: 2 }]);
        const occupied = p.initialStones.some(
          (s) => s.x === 2 && s.y === 2,
        );
        expect(occupied).toBe(false);
      });

      it("OP-009 answer (0,3) is a proper extension along the edge from (0,0)", () => {
        const p = problems.find((x) => x.id === "OP-009")!;
        expect(p.answers).toEqual([{ x: 0, y: 3 }]);
        const occupied = p.initialStones.some(
          (s) => s.x === 0 && s.y === 3,
        );
        expect(occupied).toBe(false);
      });

      it("CC-014 answer (3,3) cuts the two white groups at (3,2) and (3,4)", () => {
        const p = problems.find((x) => x.id === "CC-014")!;
        expect(p.answers).toEqual([{ x: 3, y: 3 }]);
        const occupied = p.initialStones.some(
          (s) => s.x === 3 && s.y === 3,
        );
        expect(occupied).toBe(false);
        // White stones on both sides of (3,3)
        const whiteAbove = p.initialStones.some(
          (s) => s.x === 3 && s.y === 4 && s.color === "white",
        );
        const whiteBelow = p.initialStones.some(
          (s) => s.x === 3 && s.y === 2 && s.color === "white",
        );
        expect(whiteAbove).toBe(true);
        expect(whiteBelow).toBe(true);
      });
    });

    describe("per-property v0.7.0b validation", () => {
      it("all v0.7.0b answer points are empty in the initial board state", () => {
        const newProblems = problems.filter((p) => newIds.includes(p.id));
        for (const p of newProblems) {
          for (const ans of p.answers) {
            const occupied = p.initialStones.some(
              (s) => s.x === ans.x && s.y === ans.y,
            );
            expect([p.id, `(${ans.x},${ans.y}) occupied`]).toBeTruthy();
            expect(occupied).toBe(false);
          }
        }
      });

      it("all v0.7.0b problems have at least 2 hints", () => {
        const newProblems = problems.filter((p) => newIds.includes(p.id));
        for (const p of newProblems) {
          expect(p.hints.length).toBeGreaterThanOrEqual(2);
        }
      });

      it("all v0.7.0b failureMessages avoid harsh or blame wording", () => {
        const harshPatterns = [
          /错[误了]/,
          /笨/,
          /傻/,
          /太差/,
          /不行/,
          /不对/,
          /错了/,
        ];
        const newProblems = problems.filter((p) => newIds.includes(p.id));
        for (const p of newProblems) {
          for (const pattern of harshPatterns) {
            expect([p.id, p.failureMessage]).toBeTruthy();
            expect(p.failureMessage).not.toMatch(pattern);
          }
        }
      });

      it("all v0.7.0b problems have a single answer point (no multi-answer)", () => {
        const newProblems = problems.filter((p) => newIds.includes(p.id));
        for (const p of newProblems) {
          expect([p.id, p.answers.length]).toBeTruthy();
          expect(p.answers.length).toBe(1);
        }
      });
    });
  });

  describe("v0.15.0c Intermediate Problem Pack A validation", () => {
    const newIds = [
      "CAP-021", "CAP-022",
      "ESC-013", "ESC-014",
      "CC-017", "CC-018",
      "LD-013",
      "OP-011", "OP-012",
      "END-011", "END-012",
      "MIX-001", "MIX-002", "MIX-003",
    ];
    const singleStepIds = ["CAP-021", "ESC-013", "ESC-014", "CC-017", "LD-013", "OP-011", "OP-012", "END-011", "END-012", "MIX-002", "MIX-003"];
    const multiStepIds = ["CAP-022", "CC-018", "MIX-001"];
    const categories = ["capture", "escape", "connect_cut", "life_death", "opening", "endgame", "mixed"] as const;

    it("all 14 v0.15.0c problem IDs exist", () => {
      const ids = problems.map((p) => p.id);
      for (const id of newIds) {
        expect(ids).toContain(id);
      }
    });

    it("v0.15.0c IDs are beyond previous ranges", () => {
      const oldMax: Record<string, number> = {
        CAP: 20, ESC: 12, CC: 16, LD: 12, OP: 10, END: 10,
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

    it("exactly 3 level 3, 7 level 4, 4 level 5 problems added", () => {
      const packProblems = problems.filter((p) => newIds.includes(p.id));
      expect(packProblems.filter((p) => p.level === 3).length).toBe(3);
      expect(packProblems.filter((p) => p.level === 4).length).toBe(7);
      expect(packProblems.filter((p) => p.level === 5).length).toBe(4);
    });

    it("no level 1-2 problems in Pack A", () => {
      const packProblems = problems.filter((p) => newIds.includes(p.id));
      for (const p of packProblems) {
        expect(p.level).toBeGreaterThanOrEqual(3);
      }
    });

    it("every category is represented", () => {
      const packProblems = problems.filter((p) => newIds.includes(p.id));
      const cats = new Set(packProblems.map((p) => p.category));
      for (const cat of categories) {
        expect(cats.has(cat)).toBe(true);
      }
    });

    it("exactly 3 multi-step problems: capture, connect_cut, mixed", () => {
      const packProblems = problems.filter((p) => newIds.includes(p.id));
      const ms = packProblems.filter((p) => p.steps && p.totalSteps && p.totalSteps > 1);
      expect(ms.length).toBe(3);
      expect(ms.map((p) => p.id).sort()).toEqual(multiStepIds.sort());
    });

    it("all 11 single-step problems are not multi-step", () => {
      const packProblems = problems.filter((p) => newIds.includes(p.id));
      for (const id of singleStepIds) {
        const p = packProblems.find((x) => x.id === id)!;
        expect(p.steps).toBeUndefined();
      }
    });

    it("all multi-step problems have valid step data", () => {
      const packProblems = problems.filter((p) => newIds.includes(p.id));
      for (const p of packProblems) {
        if (!p.steps) continue;
        expect(p.totalSteps).toBeGreaterThan(0);
        expect(p.steps.length).toBe(p.totalSteps);
        for (const step of p.steps) {
          expect(step.answers.length).toBeGreaterThanOrEqual(1);
          expect(step.hints.length).toBeGreaterThanOrEqual(1);
        }
      }
    });
  });

  describe("v0.15.0d Pack A content validation and regression", () => {
    const packAIds = [
      "CAP-021", "CAP-022",
      "ESC-013", "ESC-014",
      "CC-017", "CC-018",
      "LD-013",
      "OP-011", "OP-012",
      "END-011", "END-012",
      "MIX-001", "MIX-002", "MIX-003",
    ];
    const packProblems = problems.filter((p) => packAIds.includes(p.id));

    it("total library count is 110 (101 + 9 v0.20.0d Pack B)", () => {
      expect(problems.length).toBe(110);
    });

    it("total L3-5 count is 67 (58 pre-Pack-B + 9 Pack B all at L3-5)", () => {
      // Pre-Pack-B baseline: 26 L3 + 19 L4 + 13 L5 = 58 L3-5 problems.
      // Pack B adds 9 problems, all level 3-5:
      //   L3: END-013, MIX-004
      //   L4: END-014, END-015, MIX-005, MIX-006
      //   L5: END-016, MIX-007, MIX-008
      //   = 2 L3 + 4 L4 + 3 L5 = 9 problems
      // Post-Pack-B: 28 L3 + 23 L4 + 16 L5 = 67 L3-5.
      const l35 = problems.filter((p) => p.level >= 3 && p.level <= 5);
      expect(l35.length).toBe(67);
    });

    it("exact Pack A category/level matrix matches target", () => {
      const matrix: Record<string, number[]> = {};
      for (const p of packProblems) {
        if (!matrix[p.category]) matrix[p.category] = [0, 0, 0, 0, 0, 0];
        matrix[p.category][p.level]++;
      }
      expect(matrix.capture[4]).toBe(1);
      expect(matrix.capture[5]).toBe(1);
      expect(matrix.escape[4]).toBe(1);
      expect(matrix.escape[5]).toBe(1);
      expect(matrix.connect_cut[4]).toBe(1);
      expect(matrix.connect_cut[5]).toBe(1);
      expect(matrix.life_death[4]).toBe(1);
      expect(matrix.opening[3]).toBe(1);
      expect(matrix.opening[4]).toBe(1);
      expect(matrix.endgame[3]).toBe(1);
      expect(matrix.endgame[4]).toBe(1);
      expect(matrix.mixed[3]).toBe(1);
      expect(matrix.mixed[4]).toBe(1);
      expect(matrix.mixed[5]).toBe(1);
    });

    it("all Pack A answer points are empty in initial board", () => {
      for (const p of packProblems) {
        for (const ans of p.answers) {
          const occupied = p.initialStones.some((s) => s.x === ans.x && s.y === ans.y);
          expect(occupied).toBe(false);
        }
      }
    });

    it("all Pack A initial stones have no coordinate duplicates", () => {
      for (const p of packProblems) {
        const coords = new Set(p.initialStones.map((s) => `${s.x},${s.y}`));
        expect(coords.size).toBe(p.initialStones.length);
      }
    });

    it("all Pack A descriptions are within reasonable length", () => {
      for (const p of packProblems) {
        expect(p.description.length).toBeLessThanOrEqual(80);
      }
    });

    it("all Pack A explanations are within reasonable length", () => {
      for (const p of packProblems) {
        expect(p.explanation.length).toBeLessThanOrEqual(80);
      }
    });

    it("all Pack A failure messages are child-friendly", () => {
      const harshPatterns = /笨蛋|错误|失败|不对|错/;
      for (const p of packProblems) {
        expect(p.failureMessage).not.toMatch(harshPatterns);
        expect(p.failureMessage.startsWith("想") || p.failureMessage.startsWith("看看")).toBe(true);
      }
    });

    it("all Pack A multi-step problems have valid step count and required fields", () => {
      for (const p of packProblems) {
        if (!p.steps) continue;
        expect(p.totalSteps).toBe(p.steps.length);
        expect(p.totalSteps).toBeGreaterThanOrEqual(2);
        for (const step of p.steps) {
          expect(step.answers.length).toBeGreaterThanOrEqual(1);
          expect(step.hints.length).toBeGreaterThanOrEqual(1);
          expect(step.explanation.length).toBeGreaterThanOrEqual(1);
          expect(step.successMessage.length).toBeGreaterThanOrEqual(1);
          expect(step.failureMessage.length).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it("mixed category problems have 'mixed' tag", () => {
      const mixedPack = packProblems.filter((p) => p.category === "mixed");
      for (const p of mixedPack) {
        expect(p.tags).toContain("mixed");
      }
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
