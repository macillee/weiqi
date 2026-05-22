import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkAlreadyImported,
  importLocalProgressToServer,
  markImportCompleted,
  hasImportCompletedLocally,
} from "@/lib/progress-import";

// ---------------------------------------------------------------------------
// Top-level mocks — hoisted by vitest
// ---------------------------------------------------------------------------
vi.mock("@/lib/supabase/client", () => ({
  createSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/progress", () => ({
  PROGRESS_KEY: "children-go-app:v0.1:progress",
  loadProgress: vi.fn(),
}));

import { createSupabaseClient } from "@/lib/supabase/client";
import { loadProgress } from "@/lib/progress";

const mockedCreateClient = vi.mocked(createSupabaseClient);
const mockedLoadProgress = vi.mocked(loadProgress);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Mock chain for checkAlreadyImported: from → select → eq → eq → eq → limit */
function mockCheckChain(count: number) {
  const mockLimit = vi.fn().mockResolvedValue({ count, error: null });
  const mockEq3 = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
  const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
  return { select: mockSelect };
}

function mockCheckErrorChain() {
  const mockLimit = vi.fn().mockResolvedValue({
    count: null,
    error: { code: "PGRST301", message: "network error" },
  });
  const mockEq3 = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
  const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
  return { select: mockSelect };
}

/** Mock chain for progress_summary read: from → select → eq → maybeSingle */
function mockSummarySelectChain(existingSummary: Record<string, unknown> | null) {
  const mockMaybeSingle = vi.fn().mockResolvedValue({ data: existingSummary });
  const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  return { select: mockSelect };
}

// ---------------------------------------------------------------------------
// checkAlreadyImported
// ---------------------------------------------------------------------------
describe("checkAlreadyImported", () => {
  beforeEach(() => {
    mockedCreateClient.mockReset();
    localStorage.clear();
  });

  it("returns alreadyImported=false when Supabase not configured", async () => {
    mockedCreateClient.mockReturnValue(null);
    const result = await checkAlreadyImported("profile-1");
    expect(result.alreadyImported).toBe(false);
    expect(result.error).toBeNull();
  });

  it("returns alreadyImported=true when count > 0", async () => {
    const mockFrom = vi.fn().mockReturnValue(mockCheckChain(5));
    mockedCreateClient.mockReturnValue({ from: mockFrom });
    const result = await checkAlreadyImported("profile-1");
    expect(result.alreadyImported).toBe(true);
  });

  it("returns error when Supabase query fails", async () => {
    const mockFrom = vi.fn().mockReturnValue(mockCheckErrorChain());
    mockedCreateClient.mockReturnValue({ from: mockFrom });
    const result = await checkAlreadyImported("profile-1");
    expect(result.alreadyImported).toBe(false);
    expect(result.error).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// markImportCompleted / hasImportCompletedLocally
// ---------------------------------------------------------------------------
describe("markImportCompleted / hasImportCompletedLocally", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("markImportCompleted writes both keys", () => {
    markImportCompleted();
    expect(localStorage.getItem("children-go-app:v0.2:import-offered")).not.toBeNull();
    expect(localStorage.getItem("children-go-app:v0.2:import-completed")).not.toBeNull();
  });

  it("hasImportCompletedLocally returns false before completion", () => {
    expect(hasImportCompletedLocally()).toBe(false);
  });

  it("hasImportCompletedLocally returns true after completion", () => {
    markImportCompleted();
    expect(hasImportCompletedLocally()).toBe(true);
  });

  it("does not throw when localStorage is unavailable", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("unavailable");
    });
    expect(hasImportCompletedLocally()).toBe(false);
    vi.restoreAllMocks();
  });
});

// ---------------------------------------------------------------------------
// importLocalProgressToServer
// ---------------------------------------------------------------------------
describe("importLocalProgressToServer", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedCreateClient.mockReset();
    mockedLoadProgress.mockReset();
  });

  it("returns success=true with nothing to import when progress is empty", async () => {
    mockedCreateClient.mockReturnValue(null);
    mockedLoadProgress.mockReturnValue({
      stars: 0, streakDays: 0, completedProblemIds: [], masteredProblemIds: [],
      wrongProblems: {}, attempts: [], achievements: [],
    });
    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(true);
    expect(result.imported.attempts).toBe(0);
    expect(result.imported.wrongProblems).toBe(0);
  });

  it("returns error when Supabase not configured but local progress exists", async () => {
    mockedCreateClient.mockReturnValue(null);
    mockedLoadProgress.mockReturnValue({
      stars: 3, streakDays: 1, completedProblemIds: [], masteredProblemIds: [],
      wrongProblems: {},
      attempts: [{ problemId: "CAP-001", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-01-01T00:00:00Z" }],
      achievements: [],
    });
    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("not_configured");
  });

  // --- Successful attempt import (no wrong problems) ---
  it("returns success=true and imports attempts", async () => {
    mockedLoadProgress.mockReturnValue({
      stars: 3, streakDays: 1, completedProblemIds: ["CAP-001"], masteredProblemIds: [],
      wrongProblems: {},
      attempts: [{ problemId: "CAP-001", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-01-01T00:00:00Z" }],
      achievements: [],
    });

    // from calls: check(select), attempts(insert), summary read(select+eq+maybeSingle), summary write(upsert)
    const mockAttemptInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSummaryUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn()
      .mockReturnValueOnce(mockCheckChain(0))             // 1. checkAlreadyImported
      .mockReturnValueOnce({ insert: mockAttemptInsert })  // 2. attempts insert
      .mockReturnValueOnce(mockSummarySelectChain(null))   // 3. summary read (no existing)
      .mockReturnValueOnce({ upsert: mockSummaryUpsert }); // 4. summary write

    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(true);
    expect(result.imported.attempts).toBe(1);
    expect(result.alreadyImported).toBe(false);
  });

  // --- Successful wrong_problems import/upsert ---
  it("returns success=true and imports wrong problems", async () => {
    mockedLoadProgress.mockReturnValue({
      stars: 0, streakDays: 0, completedProblemIds: [], masteredProblemIds: [],
      wrongProblems: {
        "CAP-002": { wrongCount: 2, correctReviewCount: 1, status: "active", lastWrongAt: "2026-01-02T00:00:00Z", lastReviewAt: null },
      },
      attempts: [{ problemId: "CAP-002", selectedX: 3, selectedY: 3, isCorrect: false, usedHint: false, timeSpentSeconds: 10, createdAt: "2026-01-02T00:00:00Z" }],
      achievements: [],
    });

    const mockAttemptInsert = vi.fn().mockResolvedValue({ error: null });
    const mockWrongUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockSummaryUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn()
      .mockReturnValueOnce(mockCheckChain(0))             // 1. check
      .mockReturnValueOnce({ insert: mockAttemptInsert })  // 2. attempts
      .mockReturnValueOnce({ upsert: mockWrongUpsert })    // 3. wrong_problems
      .mockReturnValueOnce(mockSummarySelectChain(null))   // 4. summary read
      .mockReturnValueOnce({ upsert: mockSummaryUpsert }); // 5. summary write

    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(true);
    expect(result.imported.wrongProblems).toBe(1);
  });

  // --- Repeated/idempotent import returns alreadyImported=true ---
  it("returns success=true with alreadyImported=true on repeated import", async () => {
    mockedLoadProgress.mockReturnValue({
      stars: 3, streakDays: 1, completedProblemIds: [], masteredProblemIds: [],
      wrongProblems: {},
      attempts: [{ problemId: "CAP-001", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-01-01T00:00:00Z" }],
      achievements: [],
    });

    // checkAlreadyImported: count > 0 → short-circuit
    const mockFrom = vi.fn().mockReturnValueOnce(mockCheckChain(1));
    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(true);
    expect(result.alreadyImported).toBe(true);
    expect(result.imported.attempts).toBe(0);
  });

  // --- progress_summary merge behavior (Math.max stars, union IDs) ---
  it("merges progress_summary with max-union strategy", async () => {
    mockedLoadProgress.mockReturnValue({
      stars: 5, streakDays: 3, completedProblemIds: ["CAP-001", "CAP-002"], masteredProblemIds: ["CAP-001"],
      wrongProblems: {},
      attempts: [{ problemId: "CAP-002", selectedX: 2, selectedY: 2, isCorrect: true, usedHint: false, timeSpentSeconds: 8, createdAt: "2026-01-03T00:00:00Z" }],
      achievements: [],
    });

    // Server has: stars=2, streak=1, completed=[CAP-003]
    const existingSummary = {
      stars: 2, streak_days: 1, last_practice_date: "2026-01-01",
      completed_problem_ids: ["CAP-003"], mastered_problem_ids: [],
    };

    const mockAttemptInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSummaryUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn()
      .mockReturnValueOnce(mockCheckChain(0))
      .mockReturnValueOnce({ insert: mockAttemptInsert })
      .mockReturnValueOnce(mockSummarySelectChain(existingSummary))
      .mockReturnValueOnce({ upsert: mockSummaryUpsert });

    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(true);

    const summaryCall = mockSummaryUpsert.mock.calls[0][0];
    expect(summaryCall.stars).toBe(5); // Math.max(5, 2)
    expect(summaryCall.streak_days).toBe(3); // Math.max(3, 1)
    expect(summaryCall.completed_problem_ids).toEqual(expect.arrayContaining(["CAP-001", "CAP-002", "CAP-003"]));
    expect(summaryCall.mastered_problem_ids).toEqual(["CAP-001"]);
  });

  // --- Server write failure: attempt insert ---
  it("returns error when attempt insert fails with non-duplicate error", async () => {
    mockedLoadProgress.mockReturnValue({
      stars: 3, streakDays: 1, completedProblemIds: [], masteredProblemIds: [],
      wrongProblems: {},
      attempts: [{ problemId: "CAP-001", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-01-01T00:00:00Z" }],
      achievements: [],
    });

    const mockAttemptInsert = vi.fn().mockResolvedValue({ error: { code: "PGRST301", message: "network error" } });
    const mockFrom = vi.fn()
      .mockReturnValueOnce(mockCheckChain(0))
      .mockReturnValueOnce({ insert: mockAttemptInsert });

    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(false);
    expect(result.error).not.toBeNull();
  });

  // --- Server write failure: wrong_problems upsert ---
  it("returns error when wrong_problems upsert fails", async () => {
    mockedLoadProgress.mockReturnValue({
      stars: 0, streakDays: 0, completedProblemIds: [], masteredProblemIds: [],
      wrongProblems: { "CAP-002": { wrongCount: 1, correctReviewCount: 0, status: "active", lastWrongAt: "2026-01-02T00:00:00Z", lastReviewAt: null } },
      attempts: [{ problemId: "CAP-002", selectedX: 3, selectedY: 3, isCorrect: false, usedHint: false, timeSpentSeconds: 10, createdAt: "2026-01-02T00:00:00Z" }],
      achievements: [],
    });

    const mockAttemptInsert = vi.fn().mockResolvedValue({ error: null });
    const mockWrongUpsert = vi.fn().mockResolvedValue({ error: { code: "23503", message: "FK violation" } });
    const mockFrom = vi.fn()
      .mockReturnValueOnce(mockCheckChain(0))
      .mockReturnValueOnce({ insert: mockAttemptInsert })
      .mockReturnValueOnce({ upsert: mockWrongUpsert });

    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(false);
    expect(result.error).not.toBeNull();
  });

  // --- Server write failure: progress_summary upsert ---
  it("returns error when progress_summary upsert fails", async () => {
    mockedLoadProgress.mockReturnValue({
      stars: 3, streakDays: 1, completedProblemIds: [], masteredProblemIds: [],
      wrongProblems: {},
      attempts: [{ problemId: "CAP-001", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-01-01T00:00:00Z" }],
      achievements: [],
    });

    const mockAttemptInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSummaryUpsert = vi.fn().mockResolvedValue({ error: { code: "PGRST301", message: "network error" } });
    const mockFrom = vi.fn()
      .mockReturnValueOnce(mockCheckChain(0))
      .mockReturnValueOnce({ insert: mockAttemptInsert })
      .mockReturnValueOnce(mockSummarySelectChain(null))
      .mockReturnValueOnce({ upsert: mockSummaryUpsert });

    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(false);
    expect(result.error).not.toBeNull();
  });

  // --- checkAlreadyImported failure short-circuits import ---
  it("returns error when checkAlreadyImported fails", async () => {
    mockedLoadProgress.mockReturnValue({
      stars: 3, streakDays: 1, completedProblemIds: [], masteredProblemIds: [],
      wrongProblems: {},
      attempts: [{ problemId: "CAP-001", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-01-01T00:00:00Z" }],
      achievements: [],
    });

    const mockFrom = vi.fn().mockReturnValueOnce(mockCheckErrorChain());
    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(false);
    expect(result.error).not.toBeNull();
  });

  // --- Duplicate hash (23505) on attempt insert is skipped ---
  it("skips duplicate attempt inserts and continues import", async () => {
    mockedLoadProgress.mockReturnValue({
      stars: 3, streakDays: 1, completedProblemIds: ["CAP-001"], masteredProblemIds: [],
      wrongProblems: {},
      attempts: [{ problemId: "CAP-001", selectedX: 1, selectedY: 1, isCorrect: true, usedHint: false, timeSpentSeconds: 5, createdAt: "2026-01-01T00:00:00Z" }],
      achievements: [],
    });

    const mockAttemptInsert = vi.fn().mockResolvedValue({ error: { code: "23505", message: "duplicate" } });
    const mockSummaryUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn()
      .mockReturnValueOnce(mockCheckChain(0))
      .mockReturnValueOnce({ insert: mockAttemptInsert })
      .mockReturnValueOnce(mockSummarySelectChain(null))
      .mockReturnValueOnce({ upsert: mockSummaryUpsert });

    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(true);
    expect(result.imported.attempts).toBe(1);
  });
});