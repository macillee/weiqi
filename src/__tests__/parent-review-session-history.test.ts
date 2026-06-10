import { describe, it, expect, vi, beforeEach } from "vitest";
import type { StudentProgress } from "@/lib/progress";
import type {
  AttemptSummary,
  LearningSessionSummaryInput,
  ParentSessionSummary,
} from "@/lib/session-summary";
import {
  createEmptyProgress,
  enrichAttempt,
  startSession,
  recordAttemptInSession,
  closeSession,
  buildDailySummary,
  buildHistoricalSummary,
  validateSessionContract,
  toParentReviewSafeAggregate,
  checkPrivacyBoundary,
} from "@/lib/parent-review-session-history";

beforeEach(() => {
  vi.useFakeTimers();
});

function makeAttempt(
  overrides: Partial<AttemptSummary> = {},
): AttemptSummary {
  return {
    problemId: "CAP-001",
    category: "capture",
    level: 1,
    correct: true,
    attemptCount: 1,
    hintUsed: false,
    multiStep: false,
    ...overrides,
  };
}

function makeSessionInput(
  attempts: AttemptSummary[],
): LearningSessionSummaryInput {
  return {
    sessionStartedAt: new Date(0).toISOString(),
    sessionCompletedAt: new Date(10000).toISOString(),
    attempts,
  };
}

/* ───── createEmptyProgress ───── */

describe("createEmptyProgress", () => {
  it("returns default empty progress", () => {
    const p = createEmptyProgress();
    expect(p.stars).toBe(0);
    expect(p.streakDays).toBe(0);
    expect(p.completedProblemIds).toEqual([]);
    expect(p.masteredProblemIds).toEqual([]);
    expect(p.wrongProblems).toEqual({});
    expect(p.attempts).toEqual([]);
    expect(p.achievements).toEqual([]);
    expect(p.reviewSchedule).toEqual({});
  });
});

/* ───── enrichAttempt ───── */

describe("enrichAttempt", () => {
  it("enriches a capture attempt with category from problem data", () => {
    const result = enrichAttempt(
      { problemId: "CAP-001", isCorrect: true, usedHint: false, multiStep: false },
      1,
    );
    expect(result.problemId).toBe("CAP-001");
    expect(result.category).toBe("capture");
    expect(result.level).toBe(1);
    expect(result.isCorrect).toBe(true);
    expect(result.attemptCount).toBe(1);
  });

  it("falls back to unknown for missing problem", () => {
    const result = enrichAttempt(
      { problemId: "NONEXIST", isCorrect: false, usedHint: true, multiStep: false },
      1,
    );
    expect(result.category).toBe("unknown");
    expect(result.level).toBe(1);
  });

  it("uses provided timestamp", () => {
    const ts = "2025-01-01T00:00:00.000Z";
    const result = enrichAttempt(
      { problemId: "CAP-001", isCorrect: true, usedHint: false, multiStep: false, timestamp: ts },
      1,
    );
    expect(result.timestamp).toBe(ts);
  });

  it("uses current date when no timestamp", () => {
    vi.setSystemTime(new Date("2025-06-10T12:00:00.000Z"));
    const result = enrichAttempt(
      { problemId: "CAP-001", isCorrect: true, usedHint: false, multiStep: false },
      1,
    );
    expect(result.timestamp).toBe("2025-06-10T12:00:00.000Z");
    vi.useRealTimers();
  });
});

/* ───── startSession ───── */

describe("startSession", () => {
  it("creates an empty active session", () => {
    vi.setSystemTime(new Date("2025-06-10T12:00:00.000Z"));
    const s = startSession();
    expect(s.id).toMatch(/^session-/);
    expect(s.startedAt).toBe("2025-06-10T12:00:00.000Z");
    expect(s.attempts).toEqual([]);
    expect(s.completed).toBe(false);
    vi.useRealTimers();
  });
});

/* ───── recordAttemptInSession ───── */

describe("recordAttemptInSession", () => {
  it("adds first attempt with attemptCount=1", () => {
    const s = startSession();
    const r = recordAttemptInSession(s, {
      problemId: "CAP-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    expect(r.attempts).toHaveLength(1);
    expect(r.attempts[0].attemptCount).toBe(1);
    expect(r.attempts[0].problemId).toBe("CAP-001");
  });

  it("increments attemptCount for same problem", () => {
    const s = startSession();
    const r1 = recordAttemptInSession(s, {
      problemId: "CAP-001",
      isCorrect: false,
      usedHint: true,
      multiStep: false,
    });
    const r2 = recordAttemptInSession(r1, {
      problemId: "CAP-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    expect(r2.attempts).toHaveLength(2);
    expect(r2.attempts[0].attemptCount).toBe(1);
    expect(r2.attempts[1].attemptCount).toBe(2);
  });
});

/* ───── closeSession ───── */

describe("closeSession", () => {
  it("returns a completed session with computed totals", () => {
    const s = startSession();
    const r1 = recordAttemptInSession(s, {
      problemId: "CAP-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    const r2 = recordAttemptInSession(r1, {
      problemId: "ESC-001",
      isCorrect: false,
      usedHint: true,
      multiStep: false,
    });
    const closed = closeSession(r2);
    expect(closed.id).toMatch(/^session-/);
    expect(closed.totalAttempts).toBe(2);
    expect(closed.totalCorrect).toBe(1);
    expect(closed.totalHintUsed).toBe(1);
    expect(closed.categoryBreakdown).toHaveProperty("capture");
    expect(closed.categoryBreakdown).toHaveProperty("escape");
    expect(closed.categoryBreakdown.capture.attempted).toBe(1);
    expect(closed.categoryBreakdown.capture.correct).toBe(1);
    expect(closed.categoryBreakdown.escape.attempted).toBe(1);
    expect(closed.categoryBreakdown.escape.correct).toBe(0);
  });
});

/* ───── buildDailySummary ───── */

describe("buildDailySummary", () => {
  it("aggregates a single session", () => {
    const s = startSession();
    const r = recordAttemptInSession(s, {
      problemId: "CAP-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    const closed = closeSession(r);
    const ds = buildDailySummary([closed], "2025-06-10");
    expect(ds.date).toBe("2025-06-10");
    expect(ds.sessions).toHaveLength(1);
    expect(ds.totalAttempts).toBe(1);
    expect(ds.totalCorrect).toBe(1);
  });

  it("merges category breakdown across sessions", () => {
    const s1 = startSession();
    const r1 = recordAttemptInSession(s1, {
      problemId: "CAP-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    const c1 = closeSession(r1);

    const s2 = startSession();
    const r2 = recordAttemptInSession(s2, {
      problemId: "CAP-002",
      isCorrect: false,
      usedHint: true,
      multiStep: false,
    });
    const c2 = closeSession(r2);

    const ds = buildDailySummary([c1, c2], "2025-06-10");
    expect(ds.totalAttempts).toBe(2);
    expect(ds.totalCorrect).toBe(1);
    expect(ds.categoryBreakdown.capture.attempted).toBe(2);
    expect(ds.categoryBreakdown.capture.correct).toBe(1);
  });
});

/* ───── buildHistoricalSummary ───── */

describe("buildHistoricalSummary", () => {
  it("returns empty summary for no attempts", () => {
    const p: StudentProgress = createEmptyProgress();
    const hs = buildHistoricalSummary(p);
    expect(hs.dailySummaries).toEqual([]);
    expect(hs.totalAttempts).toBe(0);
    expect(hs.totalCorrect).toBe(0);
    expect(hs.totalHintUsed).toBe(0);
  });

  it("groups attempts by day", () => {
    const p: StudentProgress = {
      ...createEmptyProgress(),
      attempts: [
        {
          problemId: "CAP-001",
          selectedX: 0,
          selectedY: 0,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 10,
          createdAt: "2025-06-10T10:00:00.000Z",
        },
        {
          problemId: "CAP-002",
          selectedX: 1,
          selectedY: 1,
          isCorrect: false,
          usedHint: true,
          timeSpentSeconds: 15,
          createdAt: "2025-06-11T10:00:00.000Z",
        },
      ],
    };
    const hs = buildHistoricalSummary(p);
    expect(hs.dailySummaries).toHaveLength(2);
    expect(hs.dailySummaries[0].date).toBe("2025-06-10");
    expect(hs.dailySummaries[1].date).toBe("2025-06-11");
    expect(hs.totalAttempts).toBe(2);
    expect(hs.totalCorrect).toBe(1);
    expect(hs.totalHintUsed).toBe(1);
  });
});

/* ───── validateSessionContract ───── */

describe("validateSessionContract", () => {
  it("passes valid input", () => {
    const input = makeSessionInput([
      makeAttempt(),
      makeAttempt({ problemId: "CAP-002", attemptCount: 1 }),
    ]);
    const result = validateSessionContract(input);
    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("rejects empty attempts", () => {
    const input = makeSessionInput([]);
    const result = validateSessionContract(input);
    expect(result.valid).toBe(false);
    expect(result.violations[0].type).toBe("empty");
  });

  it("rejects non-monotonic attemptCount", () => {
    const input = makeSessionInput([
      makeAttempt({ problemId: "CAP-001", attemptCount: 2 }),
    ]);
    const result = validateSessionContract(input);
    expect(result.valid).toBe(false);
    expect(result.violations[0].type).toBe("attempt-count");
  });

  it("rejects inverted time order", () => {
    const input: LearningSessionSummaryInput = {
      sessionStartedAt: new Date(10000).toISOString(),
      sessionCompletedAt: new Date(0).toISOString(),
      attempts: [makeAttempt()],
    };
    const result = validateSessionContract(input);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.type === "time-order")).toBe(true);
  });

  it("rejects missing category", () => {
    const input = makeSessionInput([
      makeAttempt({ category: "" as "capture" }),
    ]);
    const result = validateSessionContract(input);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.type === "missing-category")).toBe(true);
  });

  it("rejects invalid level", () => {
    const input = makeSessionInput([
      makeAttempt({ level: 0 }),
    ]);
    const result = validateSessionContract(input);
    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.type === "invalid-level")).toBe(true);
  });
});

/* ───── toParentReviewSafeAggregate ───── */

describe("toParentReviewSafeAggregate", () => {
  it("strips problemId from each problem entry", () => {
    const summary: ParentSessionSummary = {
      sessionId: "session-test",
      reviewedAt: "2025-06-10T12:00:00.000Z",
      signalQuality: "complete",
      totalAttempted: 1,
      totalCorrectFirstTry: 1,
      totalRetried: 0,
      totalHintsUsed: 0,
      multiStepAttempted: 0,
      multiStepCompleted: 0,
      categories: [],
      levels: [],
      problems: [
        {
          problemId: "CAP-001",
          category: "capture",
          level: 1,
          result: "correct-first-try",
          hintsUsed: 0,
          multiStep: false,
        },
      ],
      strengths: [],
      shakyConcepts: [],
      suggestedNextFocus: [],
      parentNote: "note",
      warnings: [],
    };
    const safe = toParentReviewSafeAggregate(summary);
    expect(safe.totalAttempted).toBe(1);
    expect(safe.problems).toHaveLength(1);
    expect("problemId" in safe.problems[0]).toBe(false);
    expect(safe.problems[0].category).toBe("capture");
    expect(safe.problems[0].result).toBe("correct-first-try");
  });

  it("keeps all non-problem fields intact", () => {
    const summary: ParentSessionSummary = {
      sessionId: "session-test",
      reviewedAt: "2025-06-10T12:00:00.000Z",
      signalQuality: "empty",
      totalAttempted: 0,
      totalCorrectFirstTry: 0,
      totalRetried: 0,
      totalHintsUsed: 0,
      multiStepAttempted: 0,
      multiStepCompleted: 0,
      categories: [],
      levels: [],
      problems: [],
      strengths: [],
      shakyConcepts: [],
      suggestedNextFocus: [],
      parentNote: "note",
      warnings: [],
    };
    const safe = toParentReviewSafeAggregate(summary);
    expect(safe.sessionId).toBe("session-test");
    expect(safe.parentNote).toBe("note");
    expect(safe.warnings).toEqual([]);
  });
});

/* ───── checkPrivacyBoundary ───── */

describe("checkPrivacyBoundary", () => {
  it("passes clean data", () => {
    const violations = checkPrivacyBoundary({
      sessionId: "s1",
      totalAttempted: 5,
      categories: [],
    });
    expect(violations).toEqual([]);
  });

  it("detects forbidden coordinate fields", () => {
    const violations = checkPrivacyBoundary({
      selectedX: 3,
      selectedY: 4,
      sessionId: "s1",
    });
    expect(violations.some((v) => v.field === "selectedX")).toBe(true);
    expect(violations.some((v) => v.field === "selectedY")).toBe(true);
  });

  it("detects nested forbidden fields", () => {
    const violations = checkPrivacyBoundary({
      items: [{ x: 0, y: 1 }],
    });
    expect(violations.some((v) => v.field === "x")).toBe(true);
    expect(violations.some((v) => v.field === "y")).toBe(true);
  });

  it("detects stars and achievements", () => {
    const violations = checkPrivacyBoundary({
      stars: 10,
      streakDays: 3,
      achievements: ["first_correct"],
    });
    expect(violations.some((v) => v.field === "stars")).toBe(true);
    expect(violations.some((v) => v.field === "streakDays")).toBe(true);
    expect(violations.some((v) => v.field === "achievements")).toBe(true);
  });

  it("detects review schedule", () => {
    const violations = checkPrivacyBoundary({
      reviewSchedule: {},
    });
    expect(violations.some((v) => v.field === "reviewSchedule")).toBe(true);
  });

  it("detects problemId in parent data", () => {
    const violations = checkPrivacyBoundary({
      problemId: "CAP-001",
    });
    expect(violations.some((v) => v.field === "problemId")).toBe(true);
  });

  it("detects sensitive field after fifth array item", () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      label: `item-${i}`,
    }));
    items[5] = { id: 5, problemId: "CAP-001", selectedX: 3 };
    const violations = checkPrivacyBoundary({ items });
    expect(violations.some((v) => v.field === "problemId")).toBe(true);
    expect(violations.some((v) => v.field === "selectedX")).toBe(true);
    expect(violations.length).toBe(2);
  });
});

/* ───── Scenario: all attempts correct ───── */

describe("scenario: all correct", () => {
  it("correct on first try, no hints, no retries", () => {
    const s = startSession();
    const r1 = recordAttemptInSession(s, {
      problemId: "CAP-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    const r2 = recordAttemptInSession(r1, {
      problemId: "ESC-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    const closed = closeSession(r2);
    expect(closed.totalAttempts).toBe(2);
    expect(closed.totalCorrect).toBe(2);
    expect(closed.totalHintUsed).toBe(0);
  });
});

/* ───── Scenario: all attempts incorrect ───── */

describe("scenario: all incorrect", () => {
  it("all wrong, all hints used", () => {
    const s = startSession();
    const r1 = recordAttemptInSession(s, {
      problemId: "CAP-001",
      isCorrect: false,
      usedHint: true,
      multiStep: false,
    });
    const r2 = recordAttemptInSession(r1, {
      problemId: "CAP-002",
      isCorrect: false,
      usedHint: true,
      multiStep: false,
    });
    const closed = closeSession(r2);
    expect(closed.totalAttempts).toBe(2);
    expect(closed.totalCorrect).toBe(0);
    expect(closed.totalHintUsed).toBe(2);
  });
});

/* ───── Scenario: mixed results ───── */

describe("scenario: mixed results", () => {
  it("mix of correct/wrong with/without hints", () => {
    const s = startSession();
    const r1 = recordAttemptInSession(s, {
      problemId: "CAP-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    const r2 = recordAttemptInSession(r1, {
      problemId: "ESC-001",
      isCorrect: false,
      usedHint: true,
      multiStep: false,
    });
    const r3 = recordAttemptInSession(r2, {
      problemId: "CC-001",
      isCorrect: true,
      usedHint: true,
      multiStep: false,
    });
    const closed = closeSession(r3);
    expect(closed.totalAttempts).toBe(3);
    expect(closed.totalCorrect).toBe(2);
    expect(closed.totalHintUsed).toBe(2);
    expect(closed.categoryBreakdown.capture).toBeDefined();
    expect(closed.categoryBreakdown.escape).toBeDefined();
    expect(closed.categoryBreakdown.connect_cut).toBeDefined();
  });
});

/* ───── Scenario: hint + retry ───── */

describe("scenario: hint and retry", () => {
  it("first wrong with hint, then correct without hint", () => {
    const s = startSession();
    const r1 = recordAttemptInSession(s, {
      problemId: "CAP-001",
      isCorrect: false,
      usedHint: true,
      multiStep: false,
    });
    const r2 = recordAttemptInSession(r1, {
      problemId: "CAP-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    const closed = closeSession(r2);
    expect(closed.totalAttempts).toBe(2);
    expect(closed.totalCorrect).toBe(1);
    expect(closed.totalHintUsed).toBe(1);
    expect(closed.attempts[0].attemptCount).toBe(1);
    expect(closed.attempts[1].attemptCount).toBe(2);
  });
});

/* ───── Scenario: multi-step ───── */

describe("scenario: multi-step problem", () => {
  it("records multiStep flag in enriched attempt", () => {
    const s = startSession();
    const r = recordAttemptInSession(s, {
      problemId: "MULTI-001",
      isCorrect: true,
      usedHint: false,
      multiStep: true,
    });
    expect(r.attempts[0].multiStep).toBe(true);
  });
});

/* ───── Scenario: reset / new session ───── */

describe("scenario: reset and new session", () => {
  it("multiple session lifecycles produce independent sessions", () => {
    const s1 = startSession();
    const r1 = recordAttemptInSession(s1, {
      problemId: "CAP-001",
      isCorrect: true,
      usedHint: false,
      multiStep: false,
    });
    const c1 = closeSession(r1);

    const s2 = startSession();
    const r2 = recordAttemptInSession(s2, {
      problemId: "CAP-002",
      isCorrect: false,
      usedHint: true,
      multiStep: false,
    });
    const c2 = closeSession(r2);

    expect(c1.id).not.toBe(c2.id);
    expect(c1.totalAttempts).toBe(1);
    expect(c2.totalAttempts).toBe(1);

    const ds = buildDailySummary([c1, c2], "2025-06-10");
    expect(ds.sessions).toHaveLength(2);
  });
});

/* ───── Scenario: stale history ───── */

describe("scenario: stale history (cross-day)", () => {
  it("buildHistoricalSummary groups attempts by date across multiple days", () => {
    const p: StudentProgress = {
      ...createEmptyProgress(),
      attempts: [
        {
          problemId: "CAP-001",
          selectedX: 0,
          selectedY: 0,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 5,
          createdAt: "2025-06-08T23:59:00.000Z",
        },
        {
          problemId: "CAP-002",
          selectedX: 1,
          selectedY: 1,
          isCorrect: false,
          usedHint: true,
          timeSpentSeconds: 10,
          createdAt: "2025-06-09T00:01:00.000Z",
        },
        {
          problemId: "CAP-003",
          selectedX: 2,
          selectedY: 2,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 8,
          createdAt: "2025-06-10T12:00:00.000Z",
        },
      ],
    };
    const hs = buildHistoricalSummary(p);
    expect(hs.dailySummaries).toHaveLength(3);
    expect(hs.dailySummaries[0].date).toBe("2025-06-08");
    expect(hs.dailySummaries[1].date).toBe("2025-06-09");
    expect(hs.dailySummaries[2].date).toBe("2025-06-10");
    expect(hs.totalAttempts).toBe(3);
    expect(hs.totalCorrect).toBe(2);
  });
});

/* ───── Scenario: localStorage clear/missing ───── */

describe("scenario: localStorage clear / missing", () => {
  it("createEmptyProgress returns safe defaults", () => {
    const p = createEmptyProgress();
    expect(p.stars).toBe(0);
    expect(p.attempts).toEqual([]);
  });
});
