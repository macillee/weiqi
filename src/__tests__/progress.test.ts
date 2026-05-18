import { describe, it, expect } from "vitest";
import {
  recordAttempt,
  getActiveWrongProblems,
  recordDailyPracticeComplete,
  type StudentProgress,
} from "@/lib/progress";

function freshProgress(): StudentProgress {
  return {
    stars: 0,
    streakDays: 0,
    completedProblemIds: [],
    masteredProblemIds: [],
    wrongProblems: {},
    attempts: [],
    achievements: [],
  };
}

describe("recordAttempt", () => {
  it("records an attempt", () => {
    const progress = freshProgress();
    const { progress: newProgress } = recordAttempt(
      progress,
      "CAP-001",
      3,
      3,
      true,
      false,
      0,
    );
    expect(newProgress.attempts).toHaveLength(1);
    expect(newProgress.attempts[0].problemId).toBe("CAP-001");
    expect(newProgress.attempts[0].isCorrect).toBe(true);
  });

  it("awards 1 star for first correct answer", () => {
    const progress = freshProgress();
    const { starsEarned, progress: newProgress } = recordAttempt(
      progress,
      "CAP-001",
      3,
      3,
      true,
      false,
      0,
    );
    expect(starsEarned).toBe(1);
    expect(newProgress.stars).toBe(1);
    expect(newProgress.completedProblemIds).toContain("CAP-001");
  });

  it("does not award star for second correct on same problem", () => {
    const progress = freshProgress();
    const { progress: p1 } = recordAttempt(
      progress,
      "CAP-001",
      3,
      3,
      true,
      false,
      0,
    );
    const { starsEarned } = recordAttempt(
      p1,
      "CAP-001",
      3,
      3,
      true,
      false,
      0,
    );
    expect(starsEarned).toBe(0);
  });

  it("does not award star for wrong answer", () => {
    const progress = freshProgress();
    const { starsEarned, progress: newProgress } = recordAttempt(
      progress,
      "CAP-001",
      5,
      5,
      false,
      false,
      0,
    );
    expect(starsEarned).toBe(0);
    expect(newProgress.stars).toBe(0);
  });

  it("creates wrong problem entry on wrong answer", () => {
    const progress = freshProgress();
    const { progress: newProgress } = recordAttempt(
      progress,
      "CAP-001",
      5,
      5,
      false,
      false,
      0,
    );
    expect(newProgress.wrongProblems["CAP-001"]).toBeDefined();
    expect(newProgress.wrongProblems["CAP-001"].status).toBe("active");
    expect(newProgress.wrongProblems["CAP-001"].wrongCount).toBe(1);
  });
});

describe("wrong problem status transitions", () => {
  it("active -> reviewing on first correct review", () => {
    let progress = freshProgress();
    progress = recordAttempt(progress, "CAP-001", 5, 5, false, false, 0)
      .progress;
    expect(progress.wrongProblems["CAP-001"].status).toBe("active");

    progress = recordAttempt(progress, "CAP-001", 3, 3, true, false, 0)
      .progress;
    expect(progress.wrongProblems["CAP-001"].status).toBe("reviewing");
  });

  it("reviewing -> mastered on second correct review", () => {
    let progress = freshProgress();
    progress = recordAttempt(progress, "CAP-001", 5, 5, false, false, 0)
      .progress;
    progress = recordAttempt(progress, "CAP-001", 3, 3, true, false, 0)
      .progress;
    expect(progress.wrongProblems["CAP-001"].status).toBe("reviewing");

    progress = recordAttempt(progress, "CAP-001", 3, 3, true, false, 0)
      .progress;
    expect(progress.wrongProblems["CAP-001"].status).toBe("mastered");
  });

  it("reviewing -> active on wrong answer", () => {
    let progress = freshProgress();
    progress = recordAttempt(progress, "CAP-001", 5, 5, false, false, 0)
      .progress;
    progress = recordAttempt(progress, "CAP-001", 3, 3, true, false, 0)
      .progress;
    expect(progress.wrongProblems["CAP-001"].status).toBe("reviewing");

    progress = recordAttempt(progress, "CAP-001", 5, 5, false, false, 0)
      .progress;
    expect(progress.wrongProblems["CAP-001"].status).toBe("active");
  });

  it("does not change mastered status on correct", () => {
    let progress = freshProgress();
    progress = recordAttempt(progress, "CAP-001", 5, 5, false, false, 0)
      .progress;
    progress = recordAttempt(progress, "CAP-001", 3, 3, true, false, 0)
      .progress;
    progress = recordAttempt(progress, "CAP-001", 3, 3, true, false, 0)
      .progress;
    expect(progress.wrongProblems["CAP-001"].status).toBe("mastered");

    progress = recordAttempt(progress, "CAP-001", 3, 3, true, false, 0)
      .progress;
    expect(progress.wrongProblems["CAP-001"].status).toBe("mastered");
  });
});

describe("getActiveWrongProblems", () => {
  it("excludes mastered problems", () => {
    const wrongProblems = {
      "CAP-001": {
        problemId: "CAP-001",
        wrongCount: 1,
        correctReviewCount: 0,
        lastWrongAt: new Date().toISOString(),
        status: "active" as const,
      },
      "CAP-002": {
        problemId: "CAP-002",
        wrongCount: 1,
        correctReviewCount: 2,
        lastWrongAt: new Date().toISOString(),
        status: "mastered" as const,
      },
    };
    const active = getActiveWrongProblems(wrongProblems);
    expect(active).toHaveLength(1);
    expect(active[0].problemId).toBe("CAP-001");
  });

  it("returns empty array when no wrong problems", () => {
    const active = getActiveWrongProblems({});
    expect(active).toHaveLength(0);
  });
});

describe("recordDailyPracticeComplete", () => {
  it("awards 5 stars and starts streak on first practice", () => {
    const progress = freshProgress();
    const { progress: newProgress, starsEarned } =
      recordDailyPracticeComplete(progress);
    expect(starsEarned).toBe(5);
    expect(newProgress.stars).toBe(5);
    expect(newProgress.streakDays).toBe(1);
  });

  it("does not award stars for same-day repeat", () => {
    const progress = freshProgress();
    const { progress: p1 } = recordDailyPracticeComplete(progress);
    const { starsEarned } = recordDailyPracticeComplete(p1);
    expect(starsEarned).toBe(0);
  });

  it("increments streak for consecutive day", () => {
    const progress = freshProgress();
    const { progress: p1 } = recordDailyPracticeComplete(progress);
    expect(p1.streakDays).toBe(1);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const p2: StudentProgress = {
      ...p1,
      lastPracticeDate: yesterday.toISOString().slice(0, 10),
    };
    const { progress: p3 } = recordDailyPracticeComplete(p2);
    expect(p3.streakDays).toBe(2);
  });

  it("resets streak for non-consecutive day", () => {
    const progress = freshProgress();
    const { progress: p1 } = recordDailyPracticeComplete(progress);

    const oldDate = "2020-01-01";
    const p2: StudentProgress = {
      ...p1,
      lastPracticeDate: oldDate,
    };
    const { progress: p3 } = recordDailyPracticeComplete(p2);
    expect(p3.streakDays).toBe(1);
  });
});
