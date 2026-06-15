import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  explainChildEngine,
  validateChildEngineExplain,
  setChildEngineExplainEnabled,
  getChildEngineExplainFlag,
  shouldUseChildEngineExplain,
  type ChildEngineExplainInput,
} from "@/lib/child-engine-explain";
import type { Problem } from "@/lib/problems";
import type { EngineReviewSignalLike, LocalReviewResult } from "@/lib/ai-review";

function makeProblem(overrides: Partial<Problem> & { id: string }): Problem {
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

const baseInput: ChildEngineExplainInput = {
  problem: makeProblem({ id: "CAP-001" }),
  attemptedMove: { x: 0, y: 0 },
  authoredAnswer: { x: 3, y: 3 },
  usedHint: false,
  signal: { confidence: "high", agreesWithAuthoredAnswer: true } satisfies EngineReviewSignalLike,
};

describe("explainChildEngine", () => {
  it("returns engine-assisted source when signal agrees and confidence is high", () => {
    const result = explainChildEngine(baseInput);
    expect(result.source).toBe("engine-assisted");
  });

  it("returns engine-assisted source when signal agrees and confidence is medium", () => {
    const result = explainChildEngine({
      ...baseInput,
      signal: { confidence: "medium", agreesWithAuthoredAnswer: true },
    });
    expect(result.source).toBe("engine-assisted");
  });

  it("returns rule-template source when confidence is low", () => {
    const result = explainChildEngine({
      ...baseInput,
      signal: { confidence: "low", agreesWithAuthoredAnswer: true },
    });
    expect(result.source).toBe("rule-template");
  });

  it("returns rule-template source when signal disagrees with authored answer", () => {
    const result = explainChildEngine({
      ...baseInput,
      signal: { confidence: "high", agreesWithAuthoredAnswer: false },
    });
    expect(result.source).toBe("rule-template");
  });

  it("returns a non-empty message under 150 chars for every category", () => {
    const categories = [
      "capture",
      "escape",
      "connect_cut",
      "life_death",
      "opening",
      "endgame",
      "mixed",
    ] as const;
    for (const cat of categories) {
      const result = explainChildEngine({
        ...baseInput,
        problem: makeProblem({ id: `${cat.toUpperCase()}-001`, category: cat }),
      });
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.message.length).toBeLessThanOrEqual(150);
    }
  });

  it("never contains banned phrases in any output (engine + rule-template paths)", () => {
    const banned = [
      "你下错了",
      "初学者错误",
      "初级错误",
      "新手错误",
      "级位",
      "段位",
      "你现在是",
      "你的水平",
      "胜率",
      "winrate",
      "win rate",
      "rating",
      "score",
      "得分",
      "分差",
      "百分点",
      "目数差",
      "visits",
      "playouts",
    ];
    const signals: EngineReviewSignalLike[] = [
      { confidence: "high", agreesWithAuthoredAnswer: true },
      { confidence: "high", agreesWithAuthoredAnswer: false },
      { confidence: "medium", agreesWithAuthoredAnswer: true },
      { confidence: "low", agreesWithAuthoredAnswer: true },
    ];
    for (const cat of [
      "capture",
      "escape",
      "connect_cut",
      "life_death",
      "opening",
      "endgame",
      "mixed",
    ] as const) {
      for (const signal of signals) {
        const result = explainChildEngine({
          ...baseInput,
          problem: makeProblem({ id: `${cat.toUpperCase()}-${signal.confidence}-${String(signal.agreesWithAuthoredAnswer)}`, category: cat }),
          signal,
        });
        for (const phrase of banned) {
          expect(result.message).not.toContain(phrase);
        }
      }
    }
  });

  it("is deterministic for the same (problem, attempt, authored, hint, signal) input", () => {
    const a = explainChildEngine(baseInput);
    const b = explainChildEngine(baseInput);
    expect(a).toEqual(b);
  });

  it("attaches the close-by refinement when attemptedRank and authoredRank both finite and authored=1", () => {
    const result = explainChildEngine({
      ...baseInput,
      attemptedMoveRank: 2,
      authoredMoveRank: 1,
    });
    expect(result.source).toBe("engine-assisted");
    expect(result.message).toContain("旁边");
  });

  it("uses the far refinement when delta is large", () => {
    const result = explainChildEngine({
      ...baseInput,
      attemptedMoveRank: 5,
      authoredMoveRank: 1,
    });
    expect(result.source).toBe("engine-assisted");
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.message.length).toBeLessThanOrEqual(150);
  });

  it("ignores malformed rank values (null / undefined / non-finite) without crashing", () => {
    const inputs: ChildEngineExplainInput[] = [
      { ...baseInput, attemptedMoveRank: null, authoredMoveRank: null },
      { ...baseInput, attemptedMoveRank: undefined, authoredMoveRank: undefined },
      { ...baseInput, attemptedMoveRank: NaN as unknown as number, authoredMoveRank: NaN as unknown as number },
      { ...baseInput, attemptedMoveRank: 0, authoredMoveRank: 0 },
    ];
    for (const i of inputs) {
      const result = explainChildEngine(i);
      expect(result.source).toBe("engine-assisted");
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it("uses hint-aware rule-template fallback when usedHint is true and signal fails engine-assisted gate", () => {
    const result = explainChildEngine({
      ...baseInput,
      usedHint: true,
      signal: { confidence: "low", agreesWithAuthoredAnswer: true },
    });
    expect(result.source).toBe("rule-template");
    expect(result.message).toContain("用了提示也没关系");
  });

  it("produces a valid output for a multi-step problem (helper does not gate on multi-step)", () => {
    const multiStep = makeProblem({
      id: "MUL-001",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 5, y: 4 }],
          hints: [],
          explanation: "",
          successMessage: "",
          failureMessage: "",
        },
        {
          step: 2,
          answers: [{ x: 5, y: 7 }],
          hints: [],
          explanation: "",
          successMessage: "",
          failureMessage: "",
        },
      ],
      category: "life_death",
    });
    const result = explainChildEngine({ ...baseInput, problem: multiStep });
    expect(result.source).toBe("engine-assisted");
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("uses fallback category for unknown category without throwing", () => {
    const result = explainChildEngine({
      ...baseInput,
      problem: makeProblem({
        id: "UNK-001",
        // Cast through unknown to simulate a category that is not in the
        // known set; the helper should treat it as fallback.
        category: "unknown" as unknown as Problem["category"],
      }),
    });
    expect(result.source).toBe("engine-assisted");
    expect(result.message.length).toBeGreaterThan(0);
  });
});

describe("validateChildEngineExplain", () => {
  it("returns true for a valid engine-assisted output", () => {
    const result: LocalReviewResult = {
      message: "引擎分析认为答案是这里。",
      concept: "气",
      source: "engine-assisted",
    };
    expect(validateChildEngineExplain(result)).toBe(true);
  });

  it("rejects an empty message", () => {
    const result: LocalReviewResult = { message: "", concept: "气", source: "engine-assisted" };
    const v = validateChildEngineExplain(result);
    expect(v).not.toBe(true);
    if (v !== true) {
      expect(v.reason).toBe("empty");
    }
  });

  it("rejects a message that is too long", () => {
    const result: LocalReviewResult = {
      message: "a".repeat(151),
      concept: "气",
      source: "engine-assisted",
    };
    const v = validateChildEngineExplain(result);
    expect(v).not.toBe(true);
    if (v !== true) {
      expect(v.reason).toBe("too-long");
    }
  });

  it("rejects a banned phrase in the message", () => {
    const result: LocalReviewResult = {
      message: "引擎分析胜率高达 80%。",
      concept: "气",
      source: "engine-assisted",
    };
    const v = validateChildEngineExplain(result);
    expect(v).not.toBe(true);
    if (v !== true) {
      expect(v.reason).toBe("banned");
    }
  });

  it("rejects an unknown source enum", () => {
    const result = {
      message: "引擎分析",
      concept: "气",
      source: "ai-turbo" as unknown as "engine-assisted",
    };
    const v = validateChildEngineExplain(result);
    expect(v).not.toBe(true);
    if (v !== true) {
      expect(v.reason).toBe("bad-source");
    }
  });

  // Case-insensitive variants of the engine-specific banned phrases.
  // The validator lower-cases both sides, so any casing is caught.
  it.each([
    ["WinRate", "引擎分析：当前 WinRate 偏低。"],
    ["WIN RATE", "ENGINE: WIN RATE dropped this turn."],
    ["SCORE", "Engine: SCORE after the move is unstable."],
    ["Rating", "Engine reports a lower Rating here."],
    ["Visits", "Engine: Visits are too low to be confident."],
  ])("rejects case-insensitive banned phrase: %s", (_label, message) => {
    const result: LocalReviewResult = {
      message,
      concept: "气",
      source: "engine-assisted",
    };
    const v = validateChildEngineExplain(result);
    expect(v).not.toBe(true);
    if (v !== true) {
      expect(v.reason).toBe("banned");
    }
  });
});

/* ───── v0.20.0b feature flag contract ───── */

describe("CHILD_ENGINE_EXPLAIN feature flag", () => {
  beforeEach(() => {
    setChildEngineExplainEnabled(undefined);
  });
  afterEach(() => {
    setChildEngineExplainEnabled(undefined);
  });

  it("defaults to off (source = default)", () => {
    const flag = getChildEngineExplainFlag();
    expect(flag.enabled).toBe(false);
    expect(flag.source).toBe("default");
  });

  it("runtime setter overrides default when env is unset", () => {
    setChildEngineExplainEnabled(true);
    const flag = getChildEngineExplainFlag();
    expect(flag.enabled).toBe(true);
    expect(flag.source).toBe("runtime");
  });

  it("env wins over runtime setter (env=true, runtime=false -> enabled=true, source=env)", () => {
    const previousEnv = process.env.CHILD_ENGINE_EXPLAIN;
    process.env.CHILD_ENGINE_EXPLAIN = "true";
    setChildEngineExplainEnabled(false);
    try {
      const flag = getChildEngineExplainFlag();
      expect(flag.enabled).toBe(true);
      expect(flag.source).toBe("env");
    } finally {
      if (previousEnv === undefined) {
        delete process.env.CHILD_ENGINE_EXPLAIN;
      } else {
        process.env.CHILD_ENGINE_EXPLAIN = previousEnv;
      }
      setChildEngineExplainEnabled(undefined);
    }
  });

  it("env wins over runtime setter (env=false, runtime=true -> enabled=false, source=env)", () => {
    const previousEnv = process.env.CHILD_ENGINE_EXPLAIN;
    process.env.CHILD_ENGINE_EXPLAIN = "false";
    setChildEngineExplainEnabled(true);
    try {
      const flag = getChildEngineExplainFlag();
      expect(flag.enabled).toBe(false);
      expect(flag.source).toBe("env");
    } finally {
      if (previousEnv === undefined) {
        delete process.env.CHILD_ENGINE_EXPLAIN;
      } else {
        process.env.CHILD_ENGINE_EXPLAIN = previousEnv;
      }
      setChildEngineExplainEnabled(undefined);
    }
  });
});

/* ───── v0.20.0b consumer wiring gate ───── */

describe("shouldUseChildEngineExplain", () => {
  beforeEach(() => {
    setChildEngineExplainEnabled(undefined);
  });
  afterEach(() => {
    setChildEngineExplainEnabled(undefined);
  });

  it("returns false on single-step problems regardless of flag", () => {
    setChildEngineExplainEnabled(true);
    expect(shouldUseChildEngineExplain(false)).toBe(false);
  });

  it("returns false on multi-step when flag is off", () => {
    expect(shouldUseChildEngineExplain(true)).toBe(false);
  });

  it("returns true on multi-step when flag is on", () => {
    setChildEngineExplainEnabled(true);
    expect(shouldUseChildEngineExplain(true)).toBe(true);
  });

  it("returns true on multi-step when env is true and runtime unset", () => {
    const previousEnv = process.env.CHILD_ENGINE_EXPLAIN;
    process.env.CHILD_ENGINE_EXPLAIN = "true";
    try {
      expect(shouldUseChildEngineExplain(true)).toBe(true);
      expect(shouldUseChildEngineExplain(false)).toBe(false);
    } finally {
      if (previousEnv === undefined) {
        delete process.env.CHILD_ENGINE_EXPLAIN;
      } else {
        process.env.CHILD_ENGINE_EXPLAIN = previousEnv;
      }
    }
  });
});
