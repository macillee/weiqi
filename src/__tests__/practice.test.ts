import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  selectDailyProblems,
  createPracticeSession,
  recordResult,
  advancePracticeSession,
  getPracticeSummary,
} from "@/lib/practice";
import * as problemsModule from "@/lib/problems";
import type { Problem } from "@/lib/problems";
import * as chaptersModule from "@/lib/chapters";

vi.mock("@/lib/problems", () => ({
  loadProblems: vi.fn(),
}));

vi.mock("@/lib/chapters", () => ({
  getAllProblemIds: vi.fn(),
}));

function makeProblem(id: string): Problem {
  return {
    id,
    boardSize: 9 as const,
    category: "capture" as const,
    level: 1 as const,
    tags: ["capture"],
    toPlay: "black" as const,
    title: `Problem ${id}`,
    description: "Test",
    initialStones: [],
    answers: [{ x: 3, y: 3 }],
    hints: ["Hint"],
    explanation: "Exp",
    successMessage: "Good",
    failureMessage: "Try again",
  };
}

describe("selectDailyProblems", () => {
  beforeEach(() => {
    const problems = Array.from({ length: 15 }, (_, i) =>
      makeProblem(`P-${String(i + 1).padStart(3, "0")}`),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );
  });

  it("returns exactly 10 problems when more are available", () => {
    const selected = selectDailyProblems();
    expect(selected).toHaveLength(10);
  });

  it("returns all problems when fewer than 10 exist", () => {
    vi.mocked(problemsModule.loadProblems).mockReturnValue([
      makeProblem("P-001"),
      makeProblem("P-002"),
    ]);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue([
      "P-001",
      "P-002",
    ]);

    const selected = selectDailyProblems();
    expect(selected).toHaveLength(2);
  });

  it("only returns problems that are in chapter definitions", () => {
    const problems = [makeProblem("A-001"), makeProblem("B-001")];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(["A-001"]);

    const selected = selectDailyProblems();
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe("A-001");
  });
});

describe("practice session management", () => {
  const problems = [makeProblem("P-001"), makeProblem("P-002"), makeProblem("P-003")];

  it("creates a session with correct initial state", () => {
    const session = createPracticeSession(problems);
    expect(session.problems).toHaveLength(3);
    expect(session.currentIndex).toBe(0);
    expect(session.results).toHaveLength(0);
    expect(session.completed).toBe(false);
  });

  it("records results", () => {
    let session = createPracticeSession(problems);
    session = recordResult(session, {
      problemId: "P-001",
      correct: true,
      wrongAttempts: 0,
      usedHint: false,
    });
    expect(session.results).toHaveLength(1);
    expect(session.results[0].correct).toBe(true);
  });

  it("advances to next problem", () => {
    let session = createPracticeSession(problems);
    session = advancePracticeSession(session);
    expect(session.currentIndex).toBe(1);
    expect(session.completed).toBe(false);
  });

  it("marks session as completed after last problem", () => {
    let session = createPracticeSession(problems);
    session = advancePracticeSession(session);
    session = advancePracticeSession(session);
    session = advancePracticeSession(session);
    expect(session.completed).toBe(true);
  });

  it("generates correct summary", () => {
    let session = createPracticeSession(problems);
    session = recordResult(session, {
      problemId: "P-001",
      correct: true,
      wrongAttempts: 0,
      usedHint: false,
    });
    session = recordResult(session, {
      problemId: "P-002",
      correct: false,
      wrongAttempts: 2,
      usedHint: true,
    });
    session = recordResult(session, {
      problemId: "P-003",
      correct: true,
      wrongAttempts: 0,
      usedHint: false,
    });

    const summary = getPracticeSummary(session);
    expect(summary.total).toBe(3);
    expect(summary.correct).toBe(2);
    expect(summary.wrong).toBe(1);
    expect(summary.accuracy).toBe(67);
    expect(summary.hintsUsed).toBe(1);
  });
});
