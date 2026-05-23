import { describe, it, expect } from "vitest";
import {
  classifyOutcome,
  computeNextReview,
  updateReviewSchedule,
  getDueProblems,
} from "@/lib/spaced-review";
import type { ProblemReviewState } from "@/lib/progress";

describe("classifyOutcome", () => {
  it("classifies failed problem", () => {
    expect(classifyOutcome(false, 2, false)).toBe("failed");
  });

  it("classifies correct with wrong attempts", () => {
    expect(classifyOutcome(true, 1, false)).toBe("correct_with_wrong");
    expect(classifyOutcome(true, 3, false)).toBe("correct_with_wrong");
  });

  it("classifies correct with hint", () => {
    expect(classifyOutcome(true, 0, true)).toBe("correct_with_hint");
  });

  it("classifies clean success", () => {
    expect(classifyOutcome(true, 0, false)).toBe("clean");
  });
});

describe("computeNextReview", () => {
  const baseDate = new Date("2026-05-23T12:00:00Z");

  it("failed problem is due in 1 day", () => {
    const result = computeNextReview("failed", null, baseDate);
    expect(result.nextReviewAt).toBe("2026-05-24");
    expect(result.intervalDays).toBe(1);
  });

  it("correct with wrong attempts is due in 2 days", () => {
    const result = computeNextReview("correct_with_wrong", null, baseDate);
    expect(result.nextReviewAt).toBe("2026-05-25");
    expect(result.intervalDays).toBe(2);
  });

  it("correct with hint is due in 2 days", () => {
    const result = computeNextReview("correct_with_hint", null, baseDate);
    expect(result.nextReviewAt).toBe("2026-05-25");
    expect(result.intervalDays).toBe(2);
  });

  it("clean success initial is due in 4 days", () => {
    const result = computeNextReview("clean", null, baseDate);
    expect(result.nextReviewAt).toBe("2026-05-27");
    expect(result.intervalDays).toBe(4);
  });

  it("clean success after failure resets to 4 days", () => {
    const prevState: ProblemReviewState = {
      problemId: "P1",
      nextReviewAt: "2026-05-24",
      intervalDays: 1,
      lastResult: "failed",
      lastReviewAt: "2026-05-23",
    };
    const result = computeNextReview("clean", prevState, baseDate);
    expect(result.nextReviewAt).toBe("2026-05-27");
    expect(result.intervalDays).toBe(4);
  });

  it("repeated clean success doubles interval up to 30", () => {
    const prevState: ProblemReviewState = {
      problemId: "P1",
      nextReviewAt: "2026-05-27",
      intervalDays: 4,
      lastResult: "clean",
      lastReviewAt: "2026-05-23",
    };
    const r1 = computeNextReview("clean", prevState, baseDate);
    expect(r1.intervalDays).toBe(8);
    expect(r1.nextReviewAt).toBe("2026-05-31");

    const state2: ProblemReviewState = { ...prevState, intervalDays: 8, nextReviewAt: r1.nextReviewAt };
    const r2 = computeNextReview("clean", state2, baseDate);
    expect(r2.intervalDays).toBe(16);
    expect(r2.nextReviewAt).toBe("2026-06-08");

    const state3: ProblemReviewState = { ...prevState, intervalDays: 16, nextReviewAt: r2.nextReviewAt };
    const r3 = computeNextReview("clean", state3, baseDate);
    expect(r3.intervalDays).toBe(30);
    expect(r3.nextReviewAt).toBe("2026-06-22");
  });

  it("interval is capped at 30", () => {
    const prevState: ProblemReviewState = {
      problemId: "P1",
      nextReviewAt: "2026-07-23",
      intervalDays: 30,
      lastResult: "clean",
      lastReviewAt: "2026-06-23",
    };
    const result = computeNextReview("clean", prevState, baseDate);
    expect(result.intervalDays).toBe(30);
  });
});

describe("updateReviewSchedule", () => {
  const baseDate = new Date("2026-05-23T12:00:00Z");

  it("adds new entry for first attempt", () => {
    const schedule = updateReviewSchedule(
      {},
      "PROB-001",
      true,
      0,
      false,
      baseDate,
    );

    expect(schedule["PROB-001"]).toBeDefined();
    expect(schedule["PROB-001"].problemId).toBe("PROB-001");
    expect(schedule["PROB-001"].nextReviewAt).toBe("2026-05-27");
    expect(schedule["PROB-001"].intervalDays).toBe(4);
    expect(schedule["PROB-001"].lastResult).toBe("clean");
    expect(schedule["PROB-001"].lastReviewAt).toBe("2026-05-23");
  });

  it("updates existing entry", () => {
    const existing: Record<string, ProblemReviewState> = {
      "PROB-001": {
        problemId: "PROB-001",
        nextReviewAt: "2026-05-24",
        intervalDays: 1,
        lastResult: "failed",
        lastReviewAt: "2026-05-23",
      },
    };

    const schedule = updateReviewSchedule(
      existing,
      "PROB-001",
      true,
      0,
      false,
      baseDate,
    );

    expect(schedule["PROB-001"].nextReviewAt).toBe("2026-05-27");
    expect(schedule["PROB-001"].intervalDays).toBe(4);
    expect(schedule["PROB-001"].lastResult).toBe("clean");
  });

  it("preserves other entries when updating one", () => {
    const existing: Record<string, ProblemReviewState> = {
      "OTHER": {
        problemId: "OTHER",
        nextReviewAt: "2026-06-01",
        intervalDays: 10,
        lastResult: "clean",
        lastReviewAt: "2026-05-20",
      },
    };

    const schedule = updateReviewSchedule(
      existing,
      "PROB-001",
      false,
      2,
      false,
      baseDate,
    );

    expect(schedule["OTHER"]).toBeDefined();
    expect(schedule["OTHER"].intervalDays).toBe(10);
    expect(schedule["PROB-001"].lastResult).toBe("failed");
  });

  it("uses current date when now is not provided", () => {
    const schedule = updateReviewSchedule({}, "P1", true, 0, false);
    expect(schedule["P1"]).toBeDefined();
  });
});

describe("getDueProblems", () => {
  it("returns problems with nextReviewAt <= today", () => {
    const schedule: Record<string, ProblemReviewState> = {
      "P1": {
        problemId: "P1",
        nextReviewAt: "2026-05-22",
        intervalDays: 1,
        lastResult: "failed",
        lastReviewAt: "2026-05-21",
      },
      "P2": {
        problemId: "P2",
        nextReviewAt: "2026-05-23",
        intervalDays: 2,
        lastResult: "correct_with_wrong",
        lastReviewAt: "2026-05-21",
      },
      "P3": {
        problemId: "P3",
        nextReviewAt: "2026-05-25",
        intervalDays: 4,
        lastResult: "clean",
        lastReviewAt: "2026-05-21",
      },
    };

    const now = new Date("2026-05-23T12:00:00Z");
    const due = getDueProblems(schedule, now);

    expect(due).toHaveLength(2);
    expect(due.map((p) => p.problemId).sort()).toEqual(["P1", "P2"]);
  });

  it("returns empty when no problems due", () => {
    const schedule: Record<string, ProblemReviewState> = {
      "P1": {
        problemId: "P1",
        nextReviewAt: "2126-01-01",
        intervalDays: 100,
        lastResult: "clean",
        lastReviewAt: "2026-05-21",
      },
    };

    const due = getDueProblems(schedule, new Date("2026-05-23"));
    expect(due).toHaveLength(0);
  });

  it("returns empty when schedule is empty", () => {
    const due = getDueProblems({}, new Date("2026-05-23"));
    expect(due).toHaveLength(0);
  });
});

describe("scheduling priority (sooner vs later)", () => {
  const baseDate = new Date("2026-05-23T12:00:00Z");

  it("failed schedules sooner than correct_with_wrong", () => {
    const failed = computeNextReview("failed", null, baseDate);
    const wrong = computeNextReview("correct_with_wrong", null, baseDate);
    expect(failed.nextReviewAt < wrong.nextReviewAt).toBe(true);
  });

  it("correct_with_wrong schedules sooner than clean", () => {
    const wrong = computeNextReview("correct_with_wrong", null, baseDate);
    const clean = computeNextReview("clean", null, baseDate);
    expect(wrong.nextReviewAt < clean.nextReviewAt).toBe(true);
  });

  it("correct_with_hint schedules sooner than clean", () => {
    const hint = computeNextReview("correct_with_hint", null, baseDate);
    const clean = computeNextReview("clean", null, baseDate);
    expect(hint.nextReviewAt < clean.nextReviewAt).toBe(true);
  });

  it("correct_with_wrong and correct_with_hint schedule same", () => {
    const wrong = computeNextReview("correct_with_wrong", null, baseDate);
    const hint = computeNextReview("correct_with_hint", null, baseDate);
    expect(wrong.nextReviewAt).toBe(hint.nextReviewAt);
  });
});

describe("backward compatibility", () => {
  it("old progress data without reviewSchedule field loads safely", () => {
    const oldData = {
      stars: 10,
      streakDays: 3,
      completedProblemIds: ["P1", "P2"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
    };

    const progress = {
      ...oldData,
      reviewSchedule: (oldData as Record<string, unknown>).reviewSchedule || {},
    };

    expect(progress.reviewSchedule).toEqual({});
  });

  it("loadProgress handles missing reviewSchedule gracefully", async () => {
    const { loadProgress } = await import("@/lib/progress");
    const p = loadProgress();
    expect(Array.isArray((p as Record<string, unknown>).reviewSchedule)).toBe(false);
    expect(typeof (p as Record<string, unknown>).reviewSchedule).toBe("object");
  });
});
