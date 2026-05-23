import { describe, it, expect } from "vitest";
import { getWeekRange, computeWeeklyReport } from "@/lib/weekly-report";
import type { StudentProgress, AttemptRecord, WrongProblemState, ProblemReviewState } from "@/lib/progress";

describe("getWeekRange", () => {
  it("returns Monday to Sunday for a Wednesday", () => {
    const wed = new Date("2026-05-27T12:00:00Z");
    const { start, end } = getWeekRange(wed);

    expect(start.getDay()).toBe(1);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(4);
    expect(start.getDate()).toBe(25);

    expect(end.getDay()).toBe(0);
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(4);
    expect(end.getDate()).toBe(31);
  });

  it("returns correct week for a Monday", () => {
    const mon = new Date("2026-06-01T12:00:00Z");
    const { start, end } = getWeekRange(mon);

    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(7);
  });

  it("returns correct week for a Sunday (day 0)", () => {
    const sun = new Date("2026-05-31T12:00:00Z");
    const { start, end } = getWeekRange(sun);

    expect(start.getDay()).toBe(1);
    expect(start.getDate()).toBe(25);
    expect(end.getDay()).toBe(0);
    expect(end.getDate()).toBe(31);
  });

  it("times are normalized to start/end of day", () => {
    const wed = new Date("2026-05-27T15:30:00Z");
    const { start, end } = getWeekRange(wed);

    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);

    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });
});

function makeAttempt(overrides: Partial<AttemptRecord> & { createdAt: string }): AttemptRecord {
  return {
    problemId: "P1",
    selectedX: 0,
    selectedY: 0,
    isCorrect: true,
    usedHint: false,
    timeSpentSeconds: 10,
    ...overrides,
  };
}

function emptyProgress(): StudentProgress {
  return {
    stars: 0,
    streakDays: 0,
    completedProblemIds: [],
    masteredProblemIds: [],
    wrongProblems: {},
    attempts: [],
    achievements: [],
    reviewSchedule: {},
  };
}

describe("computeWeeklyReport", () => {
  const wedMay27 = new Date("2026-05-27T12:00:00Z");
  const monMay25 = "2026-05-25";

  it("returns empty report for new user", () => {
    const report = computeWeeklyReport(emptyProgress(), wedMay27);

    expect(report.hasActivity).toBe(false);
    expect(report.totalAttempts).toBe(0);
    expect(report.accuracy).toBe(0);
    expect(report.completionCount).toBe(0);
  });

  it("filters attempts to current week only", () => {
    const progress = emptyProgress();
    progress.attempts = [
      makeAttempt({ createdAt: "2026-05-26T10:00:00Z", problemId: "P1" }),
      makeAttempt({ createdAt: "2026-05-24T10:00:00Z", problemId: "P2" }),
      makeAttempt({ createdAt: "2026-05-20T10:00:00Z", problemId: "P3" }),
    ];

    const report = computeWeeklyReport(progress, wedMay27);

    expect(report.totalAttempts).toBe(1);
    expect(report.completedProblemIds).toEqual(["P1"]);
  });

  it("calculates correct accuracy", () => {
    const progress = emptyProgress();
    progress.attempts = [
      makeAttempt({ createdAt: "2026-05-26T10:00:00Z", isCorrect: true, problemId: "P1" }),
      makeAttempt({ createdAt: "2026-05-26T10:01:00Z", isCorrect: false, problemId: "P1" }),
      makeAttempt({ createdAt: "2026-05-26T10:02:00Z", isCorrect: true, problemId: "P2" }),
      makeAttempt({ createdAt: "2026-05-26T10:03:00Z", isCorrect: false, problemId: "P2" }),
    ];

    const report = computeWeeklyReport(progress, wedMay27);

    expect(report.totalAttempts).toBe(4);
    expect(report.correctAttempts).toBe(2);
    expect(report.accuracy).toBe(0.5);
  });

  it("counts hints used this week", () => {
    const progress = emptyProgress();
    progress.attempts = [
      makeAttempt({ createdAt: "2026-05-26T10:00:00Z", usedHint: true, problemId: "P1" }),
      makeAttempt({ createdAt: "2026-05-26T10:01:00Z", usedHint: false, problemId: "P1" }),
      makeAttempt({ createdAt: "2026-05-26T10:02:00Z", usedHint: true, problemId: "P2" }),
    ];

    const report = computeWeeklyReport(progress, wedMay27);

    expect(report.hintsUsed).toBe(2);
  });

  it("counts active and mastered wrong problems", () => {
    const progress = emptyProgress();
    progress.wrongProblems = {
      "WP1": { problemId: "WP1", wrongCount: 2, correctReviewCount: 0, lastWrongAt: "2026-05-26", status: "active" },
      "WP2": { problemId: "WP2", wrongCount: 1, correctReviewCount: 2, lastWrongAt: "2026-05-20", lastReviewAt: "2026-05-26", status: "mastered" },
      "WP3": { problemId: "WP3", wrongCount: 3, correctReviewCount: 1, lastWrongAt: "2026-05-20", status: "reviewing" },
    };

    const report = computeWeeklyReport(progress, wedMay27);

    expect(report.activeWrongCount).toBe(2);
    expect(report.masteredWrongCount).toBe(1);
  });

  it("counts due reviews from reviewSchedule", () => {
    const progress = emptyProgress();
    progress.reviewSchedule = {
      "R1": { problemId: "R1", nextReviewAt: "2026-05-26", intervalDays: 1, lastResult: "failed", lastReviewAt: "2026-05-25" },
      "R2": { problemId: "R2", nextReviewAt: "2026-05-27", intervalDays: 2, lastResult: "correct_with_wrong", lastReviewAt: "2026-05-25" },
      "R3": { problemId: "R3", nextReviewAt: "2026-05-30", intervalDays: 4, lastResult: "clean", lastReviewAt: "2026-05-26" },
    };

    const report = computeWeeklyReport(progress, wedMay27);

    expect(report.dueReviewCount).toBe(2);
  });

  it("hasActivity is true when there are attempts this week", () => {
    const progress = emptyProgress();
    progress.attempts = [
      makeAttempt({ createdAt: "2026-05-26T10:00:00Z", problemId: "P1" }),
    ];

    const report = computeWeeklyReport(progress, wedMay27);

    expect(report.hasActivity).toBe(true);
  });

  it("hasActivity is true when there are wrong problems even without attempts", () => {
    const progress = emptyProgress();
    progress.wrongProblems = {
      "WP1": { problemId: "WP1", wrongCount: 1, correctReviewCount: 0, lastWrongAt: "2026-05-26", status: "active" },
    };

    const report = computeWeeklyReport(progress, wedMay27);

    expect(report.hasActivity).toBe(true);
  });

  it("deterministic output with injected now", () => {
    const progress = emptyProgress();
    progress.attempts = [
      makeAttempt({ createdAt: "2026-06-02T10:00:00Z", isCorrect: true, problemId: "P1" }),
      makeAttempt({ createdAt: "2026-06-03T10:00:00Z", isCorrect: false, problemId: "P2" }),
    ];

    const now1 = new Date("2026-06-04T12:00:00Z");
    const report1 = computeWeeklyReport(progress, now1);
    expect(report1.totalAttempts).toBe(2);

    const now2 = new Date("2026-06-10T12:00:00Z");
    const report2 = computeWeeklyReport(progress, now2);
    expect(report2.totalAttempts).toBe(0);
  });
});
