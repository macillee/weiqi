import { describe, it, expect, beforeEach, vi } from "vitest";
import { computeReportStats } from "@/lib/report";
import * as progressModule from "@/lib/progress";
import * as problemsModule from "@/lib/problems";

vi.mock("@/lib/progress", () => ({
  loadProgress: vi.fn(),
}));

vi.mock("@/lib/problems", () => ({
  loadProblems: vi.fn(),
}));

function mockProblems() {
  return [
    {
      id: "CAP-001",
      boardSize: 9,
      category: "capture" as const,
      level: 1,
      tags: ["capture"],
      toPlay: "black" as const,
      title: "Capture 1",
      description: "Test",
      initialStones: [],
      answers: [{ x: 3, y: 3 }],
      hints: ["Hint"],
      explanation: "Exp",
      successMessage: "Good",
      failureMessage: "Try again",
    },
    {
      id: "ESC-001",
      boardSize: 9,
      category: "escape" as const,
      level: 1,
      tags: ["escape"],
      toPlay: "black" as const,
      title: "Escape 1",
      description: "Test",
      initialStones: [],
      answers: [{ x: 4, y: 4 }],
      hints: ["Hint"],
      explanation: "Exp",
      successMessage: "Good",
      failureMessage: "Try again",
    },
  ];
}

describe("computeReportStats", () => {
  beforeEach(() => {
    vi.mocked(progressModule.loadProgress).mockReturnValue({
      stars: 0,
      streakDays: 0,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
    });
    vi.mocked(problemsModule.loadProblems).mockReturnValue(mockProblems());
  });

  it("returns empty stats for new user", () => {
    const stats = computeReportStats();
    expect(stats.uniqueAttemptedProblems).toBe(0);
    expect(stats.accuracy).toBe(0);
    expect(stats.firstTryAccuracy).toBe(0);
    expect(stats.hasProgress).toBe(false);
  });

  it("counts unique attempted problems", () => {
    vi.mocked(progressModule.loadProgress).mockReturnValue({
      stars: 0,
      streakDays: 0,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        {
          problemId: "CAP-001",
          selectedX: 3,
          selectedY: 3,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: new Date().toISOString(),
        },
        {
          problemId: "CAP-001",
          selectedX: 5,
          selectedY: 5,
          isCorrect: false,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: new Date().toISOString(),
        },
        {
          problemId: "ESC-001",
          selectedX: 4,
          selectedY: 4,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      achievements: [],
    });

    const stats = computeReportStats();
    expect(stats.uniqueAttemptedProblems).toBe(2);
  });

  it("calculates overall accuracy correctly", () => {
    vi.mocked(progressModule.loadProgress).mockReturnValue({
      stars: 0,
      streakDays: 0,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        {
          problemId: "CAP-001",
          selectedX: 3,
          selectedY: 3,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: new Date().toISOString(),
        },
        {
          problemId: "CAP-001",
          selectedX: 5,
          selectedY: 5,
          isCorrect: false,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: new Date().toISOString(),
        },
        {
          problemId: "ESC-001",
          selectedX: 4,
          selectedY: 4,
          isCorrect: false,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      achievements: [],
    });

    const stats = computeReportStats();
    expect(stats.accuracy).toBeCloseTo(1 / 3);
  });

  it("calculates first-try accuracy based on first attempt per problem", () => {
    vi.mocked(progressModule.loadProgress).mockReturnValue({
      stars: 0,
      streakDays: 0,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        {
          problemId: "CAP-001",
          selectedX: 5,
          selectedY: 5,
          isCorrect: false,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        {
          problemId: "CAP-001",
          selectedX: 3,
          selectedY: 3,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: "2024-01-01T00:01:00.000Z",
        },
        {
          problemId: "ESC-001",
          selectedX: 4,
          selectedY: 4,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: "2024-01-01T00:02:00.000Z",
        },
      ],
      achievements: [],
    });

    const stats = computeReportStats();
    expect(stats.firstTryAccuracy).toBeCloseTo(0.5);
  });

  it("hasProgress is true when attempts exist", () => {
    vi.mocked(progressModule.loadProgress).mockReturnValue({
      stars: 0,
      streakDays: 0,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        {
          problemId: "CAP-001",
          selectedX: 5,
          selectedY: 5,
          isCorrect: false,
          usedHint: false,
          timeSpentSeconds: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      achievements: [],
    });

    const stats = computeReportStats();
    expect(stats.hasProgress).toBe(true);
  });

  it("hasProgress is true when wrong problems exist but no attempts", () => {
    vi.mocked(progressModule.loadProgress).mockReturnValue({
      stars: 0,
      streakDays: 0,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {
        "CAP-001": {
          problemId: "CAP-001",
          wrongCount: 1,
          correctReviewCount: 0,
          lastWrongAt: new Date().toISOString(),
          status: "active",
        },
      },
      attempts: [],
      achievements: [],
    });

    const stats = computeReportStats();
    expect(stats.hasProgress).toBe(true);
  });
});
