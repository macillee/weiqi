import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildEngineHint,
  setEngineHintProjectionEnabled,
  getEngineHintProjectionFlag,
  type EngineHintInput,
  type EngineHintNoHintReason,
} from "@/lib/engine-hint";
import type { Problem } from "@/lib/problems";
import type { EngineReviewSignalLike } from "@/lib/ai-review";

function makeProblem(overrides: Partial<Problem> & { id: string }): Problem {
  return {
    boardSize: 9,
    category: "capture",
    level: 1,
    tags: [],
    toPlay: "black",
    title: "test",
    description: "test",
    initialStones: [
      { x: 2, y: 2, color: "white" },
      { x: 3, y: 2, color: "black" },
      { x: 4, y: 2, color: "black" },
    ],
    answers: [{ x: 2, y: 1 }],
    hints: [],
    explanation: "",
    successMessage: "",
    failureMessage: "",
    ...overrides,
  };
}

const baseInput: EngineHintInput = {
  problem: makeProblem({ id: "CAP-001" }),
  attemptedMove: { x: 0, y: 0 },
  authoredAnswer: { x: 2, y: 1 },
  signal: { confidence: "high", agreesWithAuthoredAnswer: true } satisfies EngineReviewSignalLike,
  topMoves: [
    { x: 2, y: 1 },
    { x: 1, y: 1 },
  ],
};

describe("engine-hint feature flag", () => {
  beforeEach(() => {
    setEngineHintProjectionEnabled(undefined);
  });
  afterEach(() => {
    setEngineHintProjectionEnabled(undefined);
  });

  it("defaults to off", () => {
    const flag = getEngineHintProjectionFlag();
    expect(flag.enabled).toBe(false);
    expect(flag.source).toBe("default");
  });

  it("runtime setter overrides default", () => {
    setEngineHintProjectionEnabled(true);
    const flag = getEngineHintProjectionFlag();
    expect(flag.enabled).toBe(true);
    expect(flag.source).toBe("runtime");
  });
});

describe("buildEngineHint", () => {
  beforeEach(() => {
    setEngineHintProjectionEnabled(true);
  });
  afterEach(() => {
    setEngineHintProjectionEnabled(undefined);
  });

  it("returns no-hint with flag-off when flag is off", () => {
    setEngineHintProjectionEnabled(false);
    const result = buildEngineHint(baseInput);
    expect(result.kind).toBe("no-hint");
    if (result.kind === "no-hint") {
      expect(result.reason).toBe("flag-off" satisfies EngineHintNoHintReason);
    }
  });

  it("returns no-hint with low-confidence when signal confidence is low", () => {
    const result = buildEngineHint({
      ...baseInput,
      signal: { confidence: "low", agreesWithAuthoredAnswer: true },
    });
    expect(result.kind).toBe("no-hint");
    if (result.kind === "no-hint") {
      expect(result.reason).toBe("low-confidence");
    }
  });

  it("returns no-hint with no-top-moves when topMoves is missing", () => {
    const input: EngineHintInput = { ...baseInput, topMoves: undefined };
    const result = buildEngineHint(input);
    expect(result.kind).toBe("no-hint");
    if (result.kind === "no-hint") {
      expect(result.reason).toBe("no-top-moves");
    }
  });

  it("returns no-hint with single-top-move when only one top move is available", () => {
    const result = buildEngineHint({
      ...baseInput,
      topMoves: [{ x: 2, y: 1 }],
    });
    expect(result.kind).toBe("no-hint");
    if (result.kind === "no-hint") {
      expect(result.reason).toBe("single-top-move");
    }
  });

  it("returns no-hint with second-move-equals-attempted when second top move is the child's attempt", () => {
    const result = buildEngineHint({
      ...baseInput,
      attemptedMove: { x: 1, y: 1 },
      topMoves: [
        { x: 2, y: 1 },
        { x: 1, y: 1 },
      ],
    });
    expect(result.kind).toBe("no-hint");
    if (result.kind === "no-hint") {
      expect(result.reason).toBe("second-move-equals-attempted");
    }
  });

  it("returns no-hint with second-move-equals-authored when second top move matches the correct answer", () => {
    const result = buildEngineHint({
      ...baseInput,
      topMoves: [
        { x: 0, y: 0 },
        { x: 2, y: 1 },
      ],
    });
    expect(result.kind).toBe("no-hint");
    if (result.kind === "no-hint") {
      expect(result.reason).toBe("second-move-equals-authored");
    }
  });

  it("returns no-hint with second-move-malformed when the second coordinate is out of board range", () => {
    const result = buildEngineHint({
      ...baseInput,
      topMoves: [
        { x: 2, y: 1 },
        { x: 99, y: 99 },
      ],
    });
    expect(result.kind).toBe("no-hint");
    if (result.kind === "no-hint") {
      expect(result.reason).toBe("second-move-malformed");
    }
  });

  it("returns no-hint with no-usable-second-move when the second move is on an occupied intersection", () => {
    const result = buildEngineHint({
      ...baseInput,
      topMoves: [
        { x: 2, y: 1 },
        { x: 3, y: 2 },
      ],
    });
    expect(result.kind).toBe("no-hint");
    if (result.kind === "no-hint") {
      expect(result.reason).toBe("no-usable-second-move");
    }
  });

  it("returns a hint with a single point and a child-friendly reason when all conditions are met", () => {
    const result = buildEngineHint(baseInput);
    expect(result.kind).toBe("hint");
    if (result.kind === "hint") {
      expect(result.point).toEqual({ x: 1, y: 1 });
      expect(result.reason.length).toBeGreaterThan(0);
      expect(result.reason.length).toBeLessThanOrEqual(150);
      for (const banned of [
        "你下错了",
        "级位",
        "段位",
        "胜率",
        "winrate",
        "rating",
      ]) {
        expect(result.reason).not.toContain(banned);
      }
    }
  });

  it("is deterministic for the same (problem, attempt, authored) input", () => {
    const a = buildEngineHint(baseInput);
    const b = buildEngineHint(baseInput);
    expect(a).toEqual(b);
  });

  it("accepts multi-step problem input and still produces a valid hint", () => {
    const multiStep = makeProblem({
      id: "MUL-001",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          addedStones: [{ x: 5, y: 5, color: "black" }],
          answers: [{ x: 5, y: 4 }],
          hints: [],
          explanation: "",
          successMessage: "",
          failureMessage: "",
        },
        {
          step: 2,
          addedStones: [{ x: 5, y: 6, color: "white" }],
          answers: [{ x: 5, y: 7 }],
          hints: [],
          explanation: "",
          successMessage: "",
          failureMessage: "",
        },
      ],
      category: "life_death",
    });
    const result = buildEngineHint({
      ...baseInput,
      problem: multiStep,
    });
    expect(result.kind).toBe("hint");
    if (result.kind === "hint") {
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });
});
