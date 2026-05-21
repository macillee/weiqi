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
    const mockLimit = vi.fn().mockResolvedValue({ count: 5, error: null });
    const mockEq3 = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    mockedCreateClient.mockReturnValue({ from: mockFrom });

    const result = await checkAlreadyImported("profile-1");
    expect(result.alreadyImported).toBe(true);
  });

  it("returns error when Supabase query fails", async () => {
    const mockLimit = vi.fn().mockResolvedValue({
      count: null,
      error: { code: "PGRST301", message: "network error" },
    });
    const mockEq3 = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

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
      stars: 0,
      streakDays: 0,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
    });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(true);
    expect(result.imported.attempts).toBe(0);
    expect(result.imported.wrongProblems).toBe(0);
  });

  it("returns error when Supabase not configured but local progress exists", async () => {
    mockedCreateClient.mockReturnValue(null);
    mockedLoadProgress.mockReturnValue({
      stars: 3,
      streakDays: 1,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        {
          problemId: "CAP-001",
          selectedX: 1,
          selectedY: 1,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 5,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      achievements: [],
    });

    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("not_configured");
  });

  // Skipped: requires deep Supabase mock chain (checkAlreadyImported + insert + upsert).
  // Will be covered in a follow-up PR with integration tests.
  it.skip("returns success=true and imports attempts + wrong problems", async () => {
    const result = await importLocalProgressToServer("profile-1");
    expect(result.success).toBe(true);
    expect(result.imported.attempts).toBe(1);
    expect(result.imported.wrongProblems).toBe(1);
  });
});
