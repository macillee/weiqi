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
import type { StudentProgress } from "@/lib/progress";

vi.mock("@/lib/problems", () => ({
  loadProblems: vi.fn(),
}));

vi.mock("@/lib/chapters", () => ({
  getAllProblemIds: vi.fn(),
}));

function makeProblem(
  id: string,
  overrides?: Partial<Problem>,
): Problem {
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
    ...overrides,
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

  it("accepts null progress and returns 10 problems", () => {
    const selected = selectDailyProblems(null);
    expect(selected).toHaveLength(10);
  });

  it("accepts empty progress and returns 10 problems", () => {
    const emptyProgress: StudentProgress = {
      stars: 0,
      streakDays: 0,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };
    const selected = selectDailyProblems(emptyProgress);
    expect(selected).toHaveLength(10);
  });

  it("null progress does not enforce category cap (random fallback)", () => {
    const problems = Array.from({ length: 15 }, (_, i) =>
      makeProblem(`SINGLE-CAT-${i}`, { category: "life_death", level: 1 }),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );
    const selected = selectDailyProblems(null);
    expect(selected).toHaveLength(10);
    expect(selected.every((p) => p.category === "life_death")).toBe(true);
  });

  it("stale completed IDs not in available pool fall back to random selection", () => {
    const problems = Array.from({ length: 15 }, (_, i) =>
      makeProblem(`CURRENT-${i}`, { category: "escape", level: 1 }),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["OLD-001", "OLD-002"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    const selected = selectDailyProblems(progress);
    expect(selected).toHaveLength(10);
    expect(selected.every((p) => p.category === "escape")).toBe(true);
  });

  it("limits progress-based level clamp when child has low-level completions", () => {
    const problems = [
      makeProblem("L1-A", { level: 1, category: "capture" }),
      makeProblem("L1-B", { level: 1, category: "capture" }),
      makeProblem("L1-C", { level: 1, category: "capture" }),
      makeProblem("L1-D", { level: 1, category: "escape" }),
      makeProblem("L1-E", { level: 1, category: "escape" }),
      makeProblem("L1-F", { level: 1, category: "connect_cut" }),
      makeProblem("L1-G", { level: 1, category: "connect_cut" }),
      makeProblem("L1-H", { level: 1, category: "life_death" }),
      makeProblem("L1-I", { level: 1, category: "life_death" }),
      makeProblem("L1-J", { level: 1, category: "opening" }),
      makeProblem("L1-K", { level: 1, category: "opening" }),
      makeProblem("L1-L", { level: 1, category: "endgame" }),
      makeProblem("L2-A", { level: 2, category: "capture" }),
      makeProblem("L2-B", { level: 2, category: "escape" }),
      makeProblem("L4-A", { level: 4, category: "life_death" }),
      makeProblem("L4-B", { level: 4, category: "opening" }),
    ];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 3,
      completedProblemIds: ["L1-A", "L1-B", "L2-A"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress);
      expect(selected).toHaveLength(10);
      for (const p of selected) {
        expect(p.level).toBeLessThanOrEqual(2);
      }
    }
  });

  it("does not clamp when progress has high-level completions", () => {
    const problems = [
      makeProblem("L4-A", { level: 4, category: "capture" }),
      makeProblem("L4-B", { level: 4, category: "escape" }),
      makeProblem("L5-A", { level: 5, category: "life_death" }),
      makeProblem("L5-B", { level: 5, category: "opening" }),
      makeProblem("L2-A", { level: 2, category: "endgame" }),
      makeProblem("L2-B", { level: 2, category: "connect_cut" }),
      makeProblem("L1-A", { level: 1, category: "capture" }),
      makeProblem("L1-B", { level: 1, category: "escape" }),
      makeProblem("L1-C", { level: 1, category: "life_death" }),
      makeProblem("L1-D", { level: 1, category: "opening" }),
      makeProblem("L1-E", { level: 1, category: "endgame" }),
      makeProblem("L1-F", { level: 1, category: "connect_cut" }),
    ];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 10,
      streakDays: 5,
      completedProblemIds: ["L4-A", "L5-A"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress);
      expect(selected.length).toBe(10);
      const hasHighLevel = selected.some((p) => p.level >= 4);
      expect(hasHighLevel).toBe(true);
    }
  });

  it("distributes no more than 3 from a single category when alternatives exist", () => {
    const problems: Problem[] = [];
    const categories = [
      "capture", "escape", "connect_cut",
      "life_death", "opening", "endgame",
    ] as const;
    let idx = 0;
    for (const cat of categories) {
      for (let n = 0; n < 5; n++) {
        idx++;
        problems.push(
          makeProblem(`P-${String(idx).padStart(3, "0")}`, {
            category: cat,
            level: 1,
          }),
        );
      }
    }
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["P-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress);
      expect(selected).toHaveLength(10);
      const catCounts: Record<string, number> = {};
      for (const p of selected) {
        catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;
      }
      for (const count of Object.values(catCounts)) {
        expect(count).toBeLessThanOrEqual(3);
      }
    }
  });

  it("does not crash when pool has sparse categories", () => {
    const problems = [
      makeProblem("ONLY-A", { category: "capture", level: 1 }),
      makeProblem("ONLY-B", { category: "capture", level: 1 }),
      makeProblem("ONLY-C", { category: "capture", level: 1 }),
      makeProblem("ONLY-D", { category: "capture", level: 1 }),
      makeProblem("ONLY-E", { category: "capture", level: 1 }),
      makeProblem("ONLY-F", { category: "capture", level: 1 }),
      makeProblem("ONLY-G", { category: "capture", level: 1 }),
      makeProblem("ONLY-H", { category: "capture", level: 1 }),
      makeProblem("ONLY-I", { category: "capture", level: 1 }),
      makeProblem("ONLY-J", { category: "capture", level: 1 }),
      makeProblem("ONLY-K", { category: "capture", level: 1 }),
      makeProblem("ONLY-L", { category: "capture", level: 1 }),
    ];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const selected = selectDailyProblems();
    expect(selected).toHaveLength(10);
  });

  it("includes a due review problem when reviewSchedule has a due entry", () => {
    const problems = Array.from({ length: 15 }, (_, i) =>
      makeProblem(`P-${String(i + 1).padStart(3, "0")}`),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["P-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {
        "P-005": {
          problemId: "P-005",
          nextReviewAt: "2020-01-01",
          intervalDays: 1,
          lastResult: "failed",
          lastReviewAt: "2019-12-31",
        },
      },
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected.some((p) => p.id === "P-005")).toBe(true);
    }
  });

  it("does not prioritize future-dated review problems", () => {
    const problems: Problem[] = Array.from({ length: 14 }, (_, i) =>
      makeProblem(`L1-${String(i + 1).padStart(3, "0")}`, { level: 1, category: "capture" }),
    );
    problems.push(
      makeProblem("FUTURE-L1", { level: 1, category: "life_death" }),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["L1-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {
        "FUTURE-L1": {
          problemId: "FUTURE-L1",
          nextReviewAt: "2099-12-31",
          intervalDays: 30,
          lastResult: "clean",
          lastReviewAt: "2099-01-01",
        },
      },
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      const idx = selected.findIndex((p) => p.id === "FUTURE-L1");
      expect(idx).toBeGreaterThan(0);
    }
  });

  it("includes a wrong problem when wrongProblems is non-empty", () => {
    const problems = Array.from({ length: 15 }, (_, i) =>
      makeProblem(`P-${String(i + 1).padStart(3, "0")}`),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["P-001"],
      masteredProblemIds: [],
      wrongProblems: {
        "P-008": {
          problemId: "P-008",
          wrongCount: 3,
          correctReviewCount: 0,
          lastWrongAt: "2020-06-01",
          status: "active",
        },
      },
      attempts: [{
        problemId: "P-008",
        selectedX: 1, selectedY: 1,
        isCorrect: false, usedHint: false,
        timeSpentSeconds: 5, createdAt: "2020-06-01",
      }],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected.some((p) => p.id === "P-008")).toBe(true);
    }
  });

  it("does not duplicate a wrong problem already selected as a due review", () => {
    const problems = Array.from({ length: 15 }, (_, i) =>
      makeProblem(`P-${String(i + 1).padStart(3, "0")}`),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["P-001"],
      masteredProblemIds: [],
      wrongProblems: {
        "P-003": {
          problemId: "P-003",
          wrongCount: 2,
          correctReviewCount: 0,
          lastWrongAt: "2020-06-01",
          status: "active",
        },
      },
      attempts: [{
        problemId: "P-003",
        selectedX: 2, selectedY: 2,
        isCorrect: false, usedHint: false,
        timeSpentSeconds: 10, createdAt: "2020-06-01",
      }],
      achievements: [],
      reviewSchedule: {
        "P-003": {
          problemId: "P-003",
          nextReviewAt: "2020-01-01",
          intervalDays: 1,
          lastResult: "failed",
          lastReviewAt: "2019-12-31",
        },
      },
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      const count = selected.filter((p) => p.id === "P-003").length;
      expect(count).toBeLessThanOrEqual(1);
    }
  });

  it("preserves category balance when review/wrong candidates are present", () => {
    const problems: Problem[] = [];
    const categories = [
      "capture", "escape", "connect_cut",
      "life_death", "opening", "endgame",
    ] as const;
    let idx = 0;
    for (const cat of categories) {
      for (let n = 0; n < 4; n++) {
        idx++;
        problems.push(
          makeProblem(`P-${String(idx).padStart(3, "0")}`, {
            category: cat, level: 1,
          }),
        );
      }
    }
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["P-001"],
      masteredProblemIds: [],
      wrongProblems: {
        "P-003": {
          problemId: "P-003",
          wrongCount: 1,
          correctReviewCount: 0,
          lastWrongAt: "2020-06-01",
          status: "active",
        },
      },
      attempts: [],
      achievements: [],
      reviewSchedule: {
        "P-005": {
          problemId: "P-005",
          nextReviewAt: "2020-01-01",
          intervalDays: 1,
          lastResult: "failed",
          lastReviewAt: "2019-12-31",
        },
      },
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected).toHaveLength(10);
      const catCounts: Record<string, number> = {};
      for (const p of selected) {
        catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;
      }
      for (const count of Object.values(catCounts)) {
        expect(count).toBeLessThanOrEqual(3);
      }
    }
  });

  it("does not select wrong problems that are mastered", () => {
    const problems: Problem[] = Array.from({ length: 14 }, (_, i) =>
      makeProblem(`L1-${String(i + 1).padStart(3, "0")}`, { level: 1, category: "capture" }),
    );
    problems.push(
      makeProblem("MASTERED-L1", { level: 1, category: "life_death" }),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["L1-001"],
      masteredProblemIds: [],
      wrongProblems: {
        "MASTERED-L1": {
          problemId: "MASTERED-L1",
          wrongCount: 1,
          correctReviewCount: 3,
          lastWrongAt: "2020-05-01",
          lastReviewAt: "2020-06-01",
          status: "mastered",
        },
      },
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      const idx = selected.findIndex((p) => p.id === "MASTERED-L1");
      expect(idx).toBeGreaterThan(0);
    }
  });

  it("ignores due review IDs not in current wired/available pool", () => {
    const problems: Problem[] = Array.from({ length: 15 }, (_, i) =>
      makeProblem(`P-${String(i + 1).padStart(3, "0")}`, { level: 1, category: "capture" }),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["P-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {
        "OLD-DEAD-ID": {
          problemId: "OLD-DEAD-ID",
          nextReviewAt: "2020-01-01",
          intervalDays: 1,
          lastResult: "failed",
          lastReviewAt: "2019-12-31",
        },
      },
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected).toHaveLength(10);
      expect(selected.some((p) => p.id === "OLD-DEAD-ID")).toBe(false);
      const ids = selected.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("excludes ineligible multi-step problems when child has no completed single-step in category", () => {
    const singleStepProblemsCapture = Array.from({ length: 6 }, (_, i) =>
      makeProblem(`SINGLE-CAP-${String(i + 1).padStart(3, "0")}`, {
        level: 1,
        category: "capture",
      }),
    );
    const singleStepProblemsEscape = Array.from({ length: 6 }, (_, i) =>
      makeProblem(`SINGLE-ESC-${String(i + 1).padStart(3, "0")}`, {
        level: 1,
        category: "escape",
      }),
    );
    const multiStepProblem = makeProblem("MULTI-001", {
      level: 2,
      category: "capture",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 3, y: 3 }],
          hints: ["Hint 1"],
          explanation: "Step 1",
          successMessage: "Good",
          failureMessage: "Try again",
        },
        {
          step: 2,
          answers: [{ x: 4, y: 4 }],
          hints: ["Hint 2"],
          explanation: "Step 2",
          successMessage: "Done",
          failureMessage: "Try again",
        },
      ],
    });
    const problems = [...singleStepProblemsCapture, ...singleStepProblemsEscape, multiStepProblem];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["SINGLE-ESC-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected.some((p) => p.id === "MULTI-001")).toBe(false);
    }
  });

  it("excludes ineligible multi-step problems when child max level is too low", () => {
    const singleStepProblems = Array.from({ length: 12 }, (_, i) =>
      makeProblem(`SINGLE-${String(i + 1).padStart(3, "0")}`, {
        level: i < 6 ? 1 : 2,
        category: "capture",
      }),
    );
    const multiStepProblem = makeProblem("MULTI-LEVEL3", {
      level: 3,
      category: "capture",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 3, y: 3 }],
          hints: ["Hint 1"],
          explanation: "Step 1",
          successMessage: "Good",
          failureMessage: "Try again",
        },
        {
          step: 2,
          answers: [{ x: 4, y: 4 }],
          hints: ["Hint 2"],
          explanation: "Step 2",
          successMessage: "Done",
          failureMessage: "Try again",
        },
      ],
    });
    const problems = [...singleStepProblems, multiStepProblem];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["SINGLE-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected.some((p) => p.id === "MULTI-LEVEL3")).toBe(false);
    }
  });

  it("includes eligible multi-step problems when child has completed single-step within 1 level", () => {
    const singleStepProblems = Array.from({ length: 12 }, (_, i) =>
      makeProblem(`SINGLE-${String(i + 1).padStart(3, "0")}`, {
        level: i < 6 ? 1 : 2,
        category: "capture",
      }),
    );
    const multiStepProblem = makeProblem("MULTI-LEVEL2", {
      level: 2,
      category: "capture",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 3, y: 3 }],
          hints: ["Hint 1"],
          explanation: "Step 1",
          successMessage: "Good",
          failureMessage: "Try again",
        },
        {
          step: 2,
          answers: [{ x: 4, y: 4 }],
          hints: ["Hint 2"],
          explanation: "Step 2",
          successMessage: "Done",
          failureMessage: "Try again",
        },
      ],
    });
    const problems = [...singleStepProblems, multiStepProblem];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["SINGLE-006"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    let foundMulti = false;
    for (let i = 0; i < 50; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      if (selected.some((p) => p.id === "MULTI-LEVEL2")) {
        foundMulti = true;
        break;
      }
    }
    expect(foundMulti).toBe(true);
  });

  it("does not force ineligible multi-step due review into session", () => {
    const singleStepProblems = Array.from({ length: 12 }, (_, i) =>
      makeProblem(`SINGLE-${String(i + 1).padStart(3, "0")}`, {
        level: 1,
        category: "capture",
      }),
    );
    const multiStepProblem = makeProblem("MULTI-DUE", {
      level: 3,
      category: "capture",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 3, y: 3 }],
          hints: ["Hint 1"],
          explanation: "Step 1",
          successMessage: "Good",
          failureMessage: "Try again",
        },
        {
          step: 2,
          answers: [{ x: 4, y: 4 }],
          hints: ["Hint 2"],
          explanation: "Step 2",
          successMessage: "Done",
          failureMessage: "Try again",
        },
      ],
    });
    const problems = [...singleStepProblems, multiStepProblem];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["SINGLE-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {
        "MULTI-DUE": {
          problemId: "MULTI-DUE",
          nextReviewAt: "2020-01-01",
          intervalDays: 1,
          lastResult: "failed",
          lastReviewAt: "2019-12-31",
        },
      },
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected.some((p) => p.id === "MULTI-DUE")).toBe(false);
    }
  });

  it("does not force ineligible multi-step wrong problem into session", () => {
    const singleStepProblems = Array.from({ length: 12 }, (_, i) =>
      makeProblem(`SINGLE-${String(i + 1).padStart(3, "0")}`, {
        level: 1,
        category: "capture",
      }),
    );
    const multiStepProblem = makeProblem("MULTI-WRONG", {
      level: 3,
      category: "capture",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 3, y: 3 }],
          hints: ["Hint 1"],
          explanation: "Step 1",
          successMessage: "Good",
          failureMessage: "Try again",
        },
        {
          step: 2,
          answers: [{ x: 4, y: 4 }],
          hints: ["Hint 2"],
          explanation: "Step 2",
          successMessage: "Done",
          failureMessage: "Try again",
        },
      ],
    });
    const problems = [...singleStepProblems, multiStepProblem];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["SINGLE-001"],
      masteredProblemIds: [],
      wrongProblems: {
        "MULTI-WRONG": {
          problemId: "MULTI-WRONG",
          wrongCount: 2,
          correctReviewCount: 0,
          lastWrongAt: "2020-06-01",
          status: "active",
        },
      },
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected.some((p) => p.id === "MULTI-WRONG")).toBe(false);
    }
  });

  it("preserves category balance with multi-step eligibility filtering", () => {
    const problems: Problem[] = [];
    const categories = [
      "capture",
      "escape",
      "connect_cut",
      "life_death",
      "opening",
      "endgame",
    ] as const;
    let idx = 0;
    for (const cat of categories) {
      for (let n = 0; n < 4; n++) {
        idx++;
        problems.push(
          makeProblem(`SINGLE-${String(idx).padStart(3, "0")}`, {
            category: cat,
            level: 1,
          }),
        );
      }
    }
    problems.push(
      makeProblem("MULTI-CAPTURE", {
        category: "capture",
        level: 2,
        totalSteps: 2,
        steps: [
          {
            step: 1,
            answers: [{ x: 3, y: 3 }],
            hints: ["Hint 1"],
            explanation: "Step 1",
            successMessage: "Good",
            failureMessage: "Try again",
          },
          {
            step: 2,
            answers: [{ x: 4, y: 4 }],
            hints: ["Hint 2"],
            explanation: "Step 2",
            successMessage: "Done",
            failureMessage: "Try again",
          },
        ],
      }),
    );
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["SINGLE-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected).toHaveLength(10);
      const catCounts: Record<string, number> = {};
      for (const p of selected) {
        catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;
      }
      for (const count of Object.values(catCounts)) {
        expect(count).toBeLessThanOrEqual(3);
      }
    }
  });

  it("falls back safely when multi-step filtering leaves too few candidates", () => {
    const singleStepProblem = makeProblem("ONLY-SINGLE", {
      level: 1,
      category: "capture",
    });
    const multiStepProblems = Array.from({ length: 12 }, (_, i) =>
      makeProblem(`MULTI-${String(i + 1).padStart(3, "0")}`, {
        level: 3,
        category: "capture",
        totalSteps: 2,
        steps: [
          {
            step: 1,
            answers: [{ x: 3, y: 3 }],
            hints: ["Hint 1"],
            explanation: "Step 1",
            successMessage: "Good",
            failureMessage: "Try again",
          },
          {
            step: 2,
            answers: [{ x: 4, y: 4 }],
            hints: ["Hint 2"],
            explanation: "Step 2",
            successMessage: "Done",
            failureMessage: "Try again",
          },
        ],
      }),
    );
    const problems = [singleStepProblem, ...multiStepProblems];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["ONLY-SINGLE"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    const selected = selectDailyProblems(progress, "2020-06-05");
    expect(selected.length).toBeGreaterThan(0);
    expect(selected.length).toBeLessThanOrEqual(10);
    expect(selected.every((p) => !p.id.startsWith("MULTI-"))).toBe(true);
  });

  it("excludes ineligible multi-step due review even when eligible candidates are fewer than 10", () => {
    const singleStepProblems = Array.from({ length: 3 }, (_, i) =>
      makeProblem(`SINGLE-${String(i + 1).padStart(3, "0")}`, {
        level: 1,
        category: "capture",
      }),
    );
    const multiStepDueProblem = makeProblem("MULTI-DUE-SPARSE", {
      level: 3,
      category: "capture",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 3, y: 3 }],
          hints: ["Hint 1"],
          explanation: "Step 1",
          successMessage: "Good",
          failureMessage: "Try again",
        },
        {
          step: 2,
          answers: [{ x: 4, y: 4 }],
          hints: ["Hint 2"],
          explanation: "Step 2",
          successMessage: "Done",
          failureMessage: "Try again",
        },
      ],
    });
    const problems = [...singleStepProblems, multiStepDueProblem];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["SINGLE-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {
        "MULTI-DUE-SPARSE": {
          problemId: "MULTI-DUE-SPARSE",
          nextReviewAt: "2020-01-01",
          intervalDays: 1,
          lastResult: "failed",
          lastReviewAt: "2019-12-31",
        },
      },
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected.some((p) => p.id === "MULTI-DUE-SPARSE")).toBe(false);
    }
  });

  it("excludes ineligible multi-step wrong problem even when eligible candidates are fewer than 10", () => {
    const singleStepProblems = Array.from({ length: 3 }, (_, i) =>
      makeProblem(`SINGLE-${String(i + 1).padStart(3, "0")}`, {
        level: 1,
        category: "capture",
      }),
    );
    const multiStepWrongProblem = makeProblem("MULTI-WRONG-SPARSE", {
      level: 3,
      category: "capture",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 3, y: 3 }],
          hints: ["Hint 1"],
          explanation: "Step 1",
          successMessage: "Good",
          failureMessage: "Try again",
        },
        {
          step: 2,
          answers: [{ x: 4, y: 4 }],
          hints: ["Hint 2"],
          explanation: "Step 2",
          successMessage: "Done",
          failureMessage: "Try again",
        },
      ],
    });
    const problems = [...singleStepProblems, multiStepWrongProblem];
    vi.mocked(problemsModule.loadProblems).mockReturnValue(problems);
    vi.mocked(chaptersModule.getAllProblemIds).mockReturnValue(
      problems.map((p) => p.id),
    );

    const progress: StudentProgress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: ["SINGLE-001"],
      masteredProblemIds: [],
      wrongProblems: {
        "MULTI-WRONG-SPARSE": {
          problemId: "MULTI-WRONG-SPARSE",
          wrongCount: 2,
          correctReviewCount: 0,
          lastWrongAt: "2020-06-01",
          status: "active",
        },
      },
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };

    for (let i = 0; i < 20; i++) {
      const selected = selectDailyProblems(progress, "2020-06-05");
      expect(selected.some((p) => p.id === "MULTI-WRONG-SPARSE")).toBe(false);
    }
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
