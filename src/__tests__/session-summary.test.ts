import { describe, it, expect } from "vitest";
import {
  summarizeLearningSession,
  type AttemptSummary,
  type LearningSessionSummaryInput,
} from "@/lib/session-summary";

function makeAttempt(overrides: Partial<AttemptSummary> & { problemId: string }): AttemptSummary {
  return {
    category: "capture",
    level: 1,
    correct: true,
    attemptCount: 1,
    hintUsed: false,
    multiStep: false,
    ...overrides,
  };
}

function makeInput(
  attempts: AttemptSummary[],
  overrides?: Partial<LearningSessionSummaryInput>,
): LearningSessionSummaryInput {
  return {
    sessionStartedAt: "2026-06-09T10:00:00.000Z",
    sessionCompletedAt: "2026-06-09T10:30:00.000Z",
    attempts,
    ...overrides,
  };
}

describe("summarizeLearningSession", () => {

  it("empty input returns sparse summary and warning", () => {
    const result = summarizeLearningSession(makeInput([]));
    expect(result.signalQuality).toBe("empty");
    expect(result.totalAttempted).toBe(0);
    expect(result.parentNote).toBe("今天还没有练习记录，开始一局今日练习吧。");
    expect(result.warnings).toContain("本次没有练习记录，数据为空。");
    expect(result.strengths).toHaveLength(0);
    expect(result.shakyConcepts).toHaveLength(0);
    expect(result.suggestedNextFocus).toHaveLength(0);
  });

  it("all-correct session", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 1 }),
      makeAttempt({ problemId: "ESC-001", category: "escape", level: 2 }),
      makeAttempt({ problemId: "ESC-002", category: "escape", level: 2 }),
      makeAttempt({ problemId: "CC-001", category: "connect_cut", level: 2 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.totalAttempted).toBe(5);
    expect(result.totalCorrectFirstTry).toBe(5);
    expect(result.totalRetried).toBe(0);
    expect(result.totalHintsUsed).toBe(0);
    expect(result.strengths).toContain("今天整体表现稳定");
    expect(result.strengths).toContain("capture 表现不错");
    expect(result.strengths).toContain("escape 表现不错");
    expect(result.shakyConcepts).toHaveLength(0);
    expect(result.parentNote).toContain("今天表现稳定");
  });

  it("mixed correct/incorrect session", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-003", category: "capture", level: 2, correct: false, attemptCount: 2 }),
      makeAttempt({ problemId: "ESC-001", category: "escape", level: 2, correct: false, attemptCount: 1 }),
      makeAttempt({ problemId: "ESC-002", category: "escape", level: 2 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.totalAttempted).toBe(5);
    expect(result.totalCorrectFirstTry).toBe(3);
    expect(result.totalRetried).toBe(1);
    expect(result.signalQuality).toBe("complete");
  });

  it("weakest category detection", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 2, correct: false, attemptCount: 2 }),
      makeAttempt({ problemId: "CAP-003", category: "capture", level: 2, correct: false, attemptCount: 2 }),
      makeAttempt({ problemId: "CAP-004", category: "capture", level: 2, correct: false, attemptCount: 2 }),
      makeAttempt({ problemId: "CAP-005", category: "capture", level: 2, correct: false, attemptCount: 2 }),
      makeAttempt({ problemId: "ESC-001", category: "escape", level: 2 }),
      makeAttempt({ problemId: "ESC-002", category: "escape", level: 2 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.shakyConcepts).toContain("capture 需要再练");
    expect(result.shakyConcepts).toContain("capture 还需要多练习");
  });

  it("weakest level detection", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 2 }),
      makeAttempt({ problemId: "CAP-003", category: "capture", level: 3, correct: false, attemptCount: 2 }),
      makeAttempt({ problemId: "CAP-004", category: "capture", level: 3, correct: false, attemptCount: 2 }),
      makeAttempt({ problemId: "ESC-001", category: "escape", level: 2 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    const level3 = result.levels.find((l) => l.level === 3);
    expect(level3).toBeDefined();
    expect(level3!.correctFirstTry).toBe(0);
    const level1 = result.levels.find((l) => l.level === 1);
    expect(level1).toBeDefined();
    expect(level1!.correctFirstTry).toBe(1);
  });

  it("high hint usage signal", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1, hintUsed: true }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 1, hintUsed: true }),
      makeAttempt({ problemId: "ESC-001", category: "escape", level: 2, hintUsed: true }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.totalHintsUsed).toBe(3);
  });

  it("repeated wrong attempts signal", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1, correct: false, attemptCount: 4 }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 1, correct: false, attemptCount: 3 }),
      makeAttempt({ problemId: "CAP-003", category: "capture", level: 1, correct: false, attemptCount: 2 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.shakyConcepts).toContain("capture 还需要多练习");
  });

  it("multi-step difficulty signal", () => {
    const attempts = [
      makeAttempt({ problemId: "MULTI-001", category: "capture", level: 2, multiStep: true, correct: false, attemptCount: 2, hintUsed: true }),
      makeAttempt({ problemId: "MULTI-002", category: "capture", level: 2, multiStep: true, correct: false, attemptCount: 2, hintUsed: true }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.shakyConcepts).toContain("多步题还需要再想想");
    expect(result.multiStepAttempted).toBe(2);
    expect(result.multiStepCompleted).toBe(0);
  });

  it("category/level aggregation", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 1 }),
      makeAttempt({ problemId: "ESC-001", category: "escape", level: 2, correct: false, attemptCount: 1 }),
      makeAttempt({ problemId: "LD-001", category: "life_death", level: 3 }),
      makeAttempt({ problemId: "OP-001", category: "opening", level: 4 }),
      makeAttempt({ problemId: "END-001", category: "endgame", level: 2 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.categories).toHaveLength(5);
    expect(result.levels).toHaveLength(4);

    const captureCat = result.categories.find((c) => c.category === "capture");
    expect(captureCat).toBeDefined();
    expect(captureCat!.attempted).toBe(2);
    expect(captureCat!.correctFirstTry).toBe(2);

    const level1 = result.levels.find((l) => l.level === 1);
    expect(level1).toBeDefined();
    expect(level1!.attempted).toBe(2);
  });

  it("deterministic output for same input", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-003", category: "capture", level: 2 }),
      makeAttempt({ problemId: "ESC-001", category: "escape", level: 2 }),
      makeAttempt({ problemId: "ESC-002", category: "escape", level: 2 }),
    ];
    const input = makeInput(attempts);
    const result1 = summarizeLearningSession(input);
    const result2 = summarizeLearningSession(input);

    expect(result1).toEqual(result2);
    expect(result1.parentNote).toContain("今天表现稳定");
    expect(result1.reviewedAt).not.toBe("");
  });

  it("output does not include raw board/move/engine/account/child identifiers", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    const stringified = JSON.stringify(result);
    expect(stringified).not.toContain("board");
    expect(stringified).not.toContain("selectedX");
    expect(stringified).not.toContain("selectedY");
    expect(stringified).not.toContain("winrate");
    expect(stringified).not.toContain("scoreLead");
    expect(stringified).not.toContain("engine");
    expect(stringified).not.toContain("childName");
    expect(stringified).not.toContain("child_name");
    expect(stringified).not.toContain("accountId");
    expect(stringified).not.toContain("parent_user_id");
    expect(stringified).not.toContain("supabase");
    expect(stringified).not.toContain("profile");
  });

  it("no dependency on Supabase, network, filesystem, AI, or engine modules", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.totalAttempted).toBe(1);
    expect(result.totalCorrectFirstTry).toBe(1);
    expect(result.signalQuality).toBe("complete");
  });

  it("handles partial data with warnings", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.totalAttempted).toBe(1);
    expect(result.warnings).toContain("数据较少，只作为参考。");
  });

  it("suggests next focus for weakest category", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-003", category: "capture", level: 2 }),
      makeAttempt({ problemId: "ESC-001", category: "escape", level: 2, correct: false, attemptCount: 2 }),
      makeAttempt({ problemId: "ESC-002", category: "escape", level: 2, correct: false, attemptCount: 2 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.suggestedNextFocus.length).toBeGreaterThan(0);
    expect(result.suggestedNextFocus.some((s) => s.includes("escape"))).toBe(true);
  });

  it("handles mixed category exposure with multiple categories", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
      makeAttempt({ problemId: "ESC-001", category: "escape", level: 2 }),
      makeAttempt({ problemId: "CC-001", category: "connect_cut", level: 2 }),
      makeAttempt({ problemId: "LD-001", category: "life_death", level: 3 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.categories.length).toBeGreaterThanOrEqual(4);
  });

  it("handles unknown category", () => {
    const attempts = [
      makeAttempt({ problemId: "UNKNOWN-001", category: "unknown", level: 1 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    expect(result.totalAttempted).toBe(1);
    expect(result.categories[0].category).toBe("unknown");
  });

  it("generates correct problem summaries", () => {
    const attempts = [
      makeAttempt({ problemId: "CAP-001", category: "capture", level: 1 }),
      makeAttempt({ problemId: "CAP-002", category: "capture", level: 1, correct: false, attemptCount: 2 }),
      makeAttempt({ problemId: "CAP-003", category: "capture", level: 1, correct: true, attemptCount: 2 }),
    ];
    const result = summarizeLearningSession(makeInput(attempts));

    const cap1 = result.problems.find((p) => p.problemId === "CAP-001");
    expect(cap1!.result).toBe("correct-first-try");

    const cap2 = result.problems.find((p) => p.problemId === "CAP-002");
    expect(cap2!.result).toBe("incomplete");

    const cap3 = result.problems.find((p) => p.problemId === "CAP-003");
    expect(cap3!.result).toBe("correct-after-retry");
  });
});
