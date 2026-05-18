import { describe, it, expect } from "vitest";
import { validateProblem, validateAllProblems } from "@/lib/problems";
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
