import { describe, it, expect } from "vitest";
import type { StudentProgress } from "@/lib/progress";
import { buildSessionSummaryInput } from "@/lib/session-summary-input";

describe("buildSessionSummaryInput", () => {
  it("returns empty input for empty progress", () => {
    const progress: StudentProgress = {
      stars: 0,
      streakDays: 0,
      lastPracticeDate: undefined,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
      reviewSchedule: {},
    };
    const input = buildSessionSummaryInput(progress);
    expect(input.attempts).toHaveLength(0);
    expect(input.sessionStartedAt).toBeUndefined();
    expect(input.sessionCompletedAt).toBeUndefined();
  });

  it("maps attempt records to AttemptSummary with correct metadata", () => {
    const progress: StudentProgress = {
      stars: 0,
      streakDays: 0,
      lastPracticeDate: undefined,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        { problemId: "CAP-001", selectedX: 0, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 10, createdAt: "2026-06-09T10:00:00.000Z" },
        { problemId: "ESC-001", selectedX: 3, selectedY: 3, isCorrect: false, usedHint: true, timeSpentSeconds: 20, createdAt: "2026-06-09T10:05:00.000Z" },
      ],
      achievements: [],
      reviewSchedule: {},
    };
    const input = buildSessionSummaryInput(progress);
    expect(input.attempts).toHaveLength(2);
    expect(input.attempts[0].problemId).toBe("CAP-001");
    expect(input.attempts[0].correct).toBe(true);
    expect(input.attempts[0].hintUsed).toBe(false);
    expect(input.attempts[0].attemptCount).toBe(1);

    expect(input.attempts[1].problemId).toBe("ESC-001");
    expect(input.attempts[1].correct).toBe(false);
    expect(input.attempts[1].hintUsed).toBe(true);
    expect(input.attempts[1].attemptCount).toBe(1);
  });

  it("increments attemptCount for duplicate problemId", () => {
    const progress: StudentProgress = {
      stars: 0,
      streakDays: 0,
      lastPracticeDate: undefined,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        { problemId: "CAP-001", selectedX: 0, selectedY: 1, isCorrect: false, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-06-09T10:00:00.000Z" },
        { problemId: "CAP-001", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: true, timeSpentSeconds: 15, createdAt: "2026-06-09T10:01:00.000Z" },
        { problemId: "CAP-001", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 3, createdAt: "2026-06-09T10:02:00.000Z" },
      ],
      achievements: [],
      reviewSchedule: {},
    };
    const input = buildSessionSummaryInput(progress);
    expect(input.attempts).toHaveLength(3);
    expect(input.attempts[0].attemptCount).toBe(1);
    expect(input.attempts[1].attemptCount).toBe(2);
    expect(input.attempts[2].attemptCount).toBe(3);
  });

  it("sets timestamps from first and last attempt", () => {
    const progress: StudentProgress = {
      stars: 0,
      streakDays: 0,
      lastPracticeDate: undefined,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        { problemId: "CAP-001", selectedX: 0, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-06-09T09:00:00.000Z" },
        { problemId: "CAP-002", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-06-09T10:00:00.000Z" },
      ],
      achievements: [],
      reviewSchedule: {},
    };
    const input = buildSessionSummaryInput(progress);
    expect(input.sessionStartedAt).toBe("2026-06-09T09:00:00.000Z");
    expect(input.sessionCompletedAt).toBe("2026-06-09T10:00:00.000Z");
  });

  it("maps category unknown for unrecognized problem IDs", () => {
    const progress: StudentProgress = {
      stars: 0,
      streakDays: 0,
      lastPracticeDate: undefined,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        { problemId: "FAKE-999", selectedX: 0, selectedY: 0, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-06-09T10:00:00.000Z" },
      ],
      achievements: [],
      reviewSchedule: {},
    };
    const input = buildSessionSummaryInput(progress);
    expect(input.attempts[0].category).toBe("unknown");
    expect(input.attempts[0].level).toBe(1);
  });
});
