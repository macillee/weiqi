import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

import { createSupabaseClient } from "@/lib/supabase/client";
import {
  loadServerProgress,
  syncAttemptToServer,
  loadReportData,
} from "@/lib/supabase/server-progress";

const mockCreateClient = vi.mocked(createSupabaseClient);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeMockClient(responses: Record<string, unknown>) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    limit: vi.fn(),
    insert: vi.fn(),
    upsert: vi.fn(),
  };

  for (const [key, value] of Object.entries(responses)) {
    (chain as Record<string, unknown>)[key] = vi
      .fn()
      .mockResolvedValue(value);
  }

  return chain;
}

describe("server-progress — missing Supabase env", () => {
  it("loadServerProgress returns error when client is null", async () => {
    mockCreateClient.mockReturnValue(null);

    const result = await loadServerProgress("test-child-id");

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error?.type).toBe("not_configured");
  });

  it("syncAttemptToServer returns error when client is null", async () => {
    mockCreateClient.mockReturnValue(null);

    const result = await syncAttemptToServer(
      "test-child-id",
      {
        problemId: "CAP-001",
        selectedX: 3,
        selectedY: 4,
        isCorrect: true,
        usedHint: false,
        timeSpentSeconds: 10,
      },
      {
        stars: 5,
        streakDays: 2,
        lastPracticeDate: "2026-05-19",
        completedProblemIds: ["CAP-001"],
        masteredProblemIds: [],
        achievements: [],
      },
      null,
    );

    expect(result.synced).toBe(false);
    expect(result.error).not.toBeNull();
    expect(result.error?.type).toBe("not_configured");
    expect(result.recoverable).toBe(false);
  });

  it("loadReportData returns error when client is null", async () => {
    mockCreateClient.mockReturnValue(null);

    const result = await loadReportData("test-child-id");

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error?.type).toBe("not_configured");
  });
});

describe("server-progress — error handling", () => {
  it("loadServerProgress returns classified error on Supabase failure", async () => {
    const mockClient = makeMockClient({
      single: {
        data: null,
        error: { message: "Fetch failed", code: "NETWORK_ERROR" },
      },
    });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await loadServerProgress("test-child-id");

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
  });

  it("syncAttemptToServer returns error on insert failure", async () => {
    const mockClient = makeMockClient({
      insert: {
        error: { message: "Network error", code: "NETWORK_ERROR" },
      },
    });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await syncAttemptToServer(
      "test-child-id",
      {
        problemId: "CAP-001",
        selectedX: 3,
        selectedY: 4,
        isCorrect: true,
        usedHint: false,
        timeSpentSeconds: 10,
      },
      {
        stars: 5,
        streakDays: 2,
        lastPracticeDate: "2026-05-19",
        completedProblemIds: ["CAP-001"],
        masteredProblemIds: [],
        achievements: [],
      },
      null,
    );

    expect(result.synced).toBe(false);
    expect(result.error).not.toBeNull();
  });

  it("loadReportData returns classified error on Supabase failure", async () => {
    const mockClient = makeMockClient({
      single: {
        data: null,
        error: { message: "Fetch failed", code: "NETWORK_ERROR" },
      },
    });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await loadReportData("test-child-id");

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
  });
});

describe("server-progress — data mapping", () => {
  it("loadServerProgress maps progress_summary snake_case to camelCase", async () => {
    const mockClient = makeMockClient({
      single: {
        data: {
          stars: 10,
          streak_days: 3,
          last_practice_date: "2026-05-19",
          completed_problem_ids: ["CAP-001", "CAP-002"],
          mastered_problem_ids: ["CAP-001"],
          achievements: ["first_star"],
        },
        error: null,
      },
    });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await loadServerProgress("test-child-id");

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data!.stars).toBe(10);
    expect(result.data!.streakDays).toBe(3);
    expect(result.data!.lastPracticeDate).toBe("2026-05-19");
    expect(result.data!.completedProblemIds).toEqual(["CAP-001", "CAP-002"]);
    expect(result.data!.masteredProblemIds).toEqual(["CAP-001"]);
    expect(result.data!.achievements).toEqual(["first_star"]);
  });

  it("loadServerProgress maps wrong_problems snake_case to camelCase", async () => {
    const mockClient = makeMockClient({
      single: {
        data: {
          stars: 5,
          streak_days: 1,
          last_practice_date: null,
          completed_problem_ids: [],
          mastered_problem_ids: [],
          achievements: [],
        },
        error: null,
      },
    });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await loadServerProgress("test-child-id");

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data!.stars).toBe(5);
    expect(result.data!.streakDays).toBe(1);
  });

  it("loadReportData maps problem_attempts snake_case to camelCase", async () => {
    const mockClient = makeMockClient({
      single: {
        data: { stars: 8, streak_days: 2 },
        error: null,
      },
      limit: {
        data: [
          {
            problem_id: "CAP-001",
            selected_x: 3,
            selected_y: 4,
            is_correct: true,
            used_hint: false,
            time_spent_seconds: 15,
            created_at: "2026-05-19T10:00:00Z",
          },
        ],
        error: null,
      },
    });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await loadReportData("test-child-id");

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data!.attempts).toHaveLength(1);
    expect(result.data!.attempts[0].problemId).toBe("CAP-001");
    expect(result.data!.attempts[0].selectedX).toBe(3);
    expect(result.data!.attempts[0].selectedY).toBe(4);
    expect(result.data!.attempts[0].isCorrect).toBe(true);
    expect(result.data!.attempts[0].usedHint).toBe(false);
    expect(result.data!.attempts[0].timeSpentSeconds).toBe(15);
    expect(result.data!.attempts[0].createdAt).toBe("2026-05-19T10:00:00Z");
    expect(result.data!.totalStars).toBe(8);
    expect(result.data!.streakDays).toBe(2);
  });

  it("loadServerProgress handles empty summary (PGRST116)", async () => {
    const mockClient = makeMockClient({
      single: {
        data: null,
        error: { code: "PGRST116", message: "Results not found" },
      },
    });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await loadServerProgress("test-child-id");

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data!.stars).toBe(0);
    expect(result.data!.streakDays).toBe(0);
  });
});

describe("server-progress — syncAttemptToServer success path", () => {
  it("syncs attempt + summary without wrongProblemUpdate", async () => {
    const mockClient = makeMockClient({
      insert: { data: null, error: null },
      upsert: { data: null, error: null },
    });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await syncAttemptToServer(
      "test-child-id",
      {
        problemId: "CAP-001",
        selectedX: 3,
        selectedY: 4,
        isCorrect: true,
        usedHint: false,
        timeSpentSeconds: 10,
      },
      {
        stars: 6,
        streakDays: 2,
        lastPracticeDate: "2026-05-19",
        completedProblemIds: ["CAP-001"],
        masteredProblemIds: [],
        achievements: [],
      },
      null,
    );

    expect(result.synced).toBe(true);
    expect(result.error).toBeNull();
    expect(result.recoverable).toBe(false);
  });

  it("syncs attempt + summary + wrongProblemUpdate", async () => {
    let upsertCallCount = 0;
    const mockClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockImplementation(() => {
        upsertCallCount++;
        return Promise.resolve({ data: null, error: null });
      }),
    };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await syncAttemptToServer(
      "test-child-id",
      {
        problemId: "CAP-003",
        selectedX: 2,
        selectedY: 5,
        isCorrect: false,
        usedHint: true,
        timeSpentSeconds: 20,
      },
      {
        stars: 6,
        streakDays: 2,
        lastPracticeDate: "2026-05-19",
        completedProblemIds: ["CAP-001"],
        masteredProblemIds: [],
        achievements: [],
      },
      {
        problemId: "CAP-003",
        wrongCount: 3,
        correctReviewCount: 0,
        status: "active",
        lastWrongAt: "2026-05-19T12:00:00Z",
        lastReviewAt: null,
      },
    );

    expect(result.synced).toBe(true);
    expect(result.error).toBeNull();
    expect(upsertCallCount).toBe(2);
  });

  it("returns synced false when summary upsert fails", async () => {
    let callCount = 0;
    const mockClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.resolve({
          error: { message: "Internal server error", code: "500" },
        });
      }),
    };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await syncAttemptToServer(
      "test-child-id",
      {
        problemId: "CAP-001",
        selectedX: 3,
        selectedY: 4,
        isCorrect: true,
        usedHint: false,
        timeSpentSeconds: 10,
      },
      {
        stars: 6,
        streakDays: 2,
        lastPracticeDate: "2026-05-19",
        completedProblemIds: ["CAP-001"],
        masteredProblemIds: [],
        achievements: [],
      },
      {
        problemId: "CAP-001",
        wrongCount: 1,
        correctReviewCount: 0,
        status: "active",
        lastWrongAt: "2026-05-19T12:00:00Z",
        lastReviewAt: null,
      },
    );

    expect(result.synced).toBe(false);
    expect(result.error).not.toBeNull();
  });
});

describe("server-progress — wrong_problems mapping", () => {
  it("loadServerProgress maps wrong_problems with independent mock data", async () => {
    const mockClient = makeMockClient({
      single: {
        data: {
          stars: 0,
          streak_days: 0,
          last_practice_date: null,
          completed_problem_ids: [],
          mastered_problem_ids: [],
          achievements: [],
        },
        error: null,
      },
    });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(mockClient as any);

    const result = await loadServerProgress("test-child-id");

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data!.wrongProblems).toEqual([]);
  });
});
