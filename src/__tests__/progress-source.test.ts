import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/selected-child", () => ({
  getSelectedChildProfileId: vi.fn(),
}));

vi.mock("@/lib/supabase/server-progress", () => ({
  syncAttemptToServer: vi.fn(),
  loadReportData: vi.fn(),
}));

import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getSelectedChildProfileId } from "@/lib/selected-child";
import { syncAttemptToServer, loadReportData } from "@/lib/supabase/server-progress";
import {
  getProgressMode,
  recordAttemptWithSync,
  recordDailyPracticeCompleteWithSync,
  updateWrongProblemReviewWithSync,
  loadReportWithSource,
} from "@/lib/progress-source";

const mockIsConfigured = vi.mocked(isSupabaseConfigured);
const mockGetSelectedChild = vi.mocked(getSelectedChildProfileId);
const mockSyncAttempt = vi.mocked(syncAttemptToServer);
const mockLoadReport = vi.mocked(loadReportData);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getProgressMode", () => {
  it("returns local when Supabase not configured", () => {
    mockIsConfigured.mockReturnValue(false);
    expect(getProgressMode("any-user-id")).toBe("local");
  });

  it("returns local when parentUserId is null", () => {
    mockIsConfigured.mockReturnValue(true);
    expect(getProgressMode(null)).toBe("local");
  });

  it("returns local when no child profile selected", () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetSelectedChild.mockReturnValue(null);
    expect(getProgressMode("parent-123")).toBe("local");
  });

  it("returns server when configured, authenticated, and child selected", () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetSelectedChild.mockReturnValue("child-456");
    expect(getProgressMode("parent-123")).toBe("server");
  });
});

describe("recordAttemptWithSync — local mode", () => {
  it("saves to localStorage and returns no sync when not configured", async () => {
    mockIsConfigured.mockReturnValue(false);

    const result = await recordAttemptWithSync(
      null,
      "CAP-001",
      3,
      4,
      true,
      false,
      10,
    );

    expect(result.progress.completedProblemIds).toContain("CAP-001");
    expect(result.sync.synced).toBe(false);
    expect(result.sync.error).toBeNull();
    expect(result.starsEarned).toBe(1);
  });

  it("saves to localStorage and returns no sync when no child selected", async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetSelectedChild.mockReturnValue(null);

    const result = await recordAttemptWithSync(
      "parent-123",
      "CAP-001",
      3,
      4,
      true,
      false,
      10,
    );

    expect(result.progress.completedProblemIds).toContain("CAP-001");
    expect(result.sync.synced).toBe(false);
    expect(result.sync.error).toBeNull();
  });
});

describe("recordAttemptWithSync — server mode", () => {
  it("syncs to server and returns synced true on success", async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetSelectedChild.mockReturnValue("child-456");
    mockSyncAttempt.mockResolvedValue({ synced: true, error: null, recoverable: false });

    const result = await recordAttemptWithSync(
      "parent-123",
      "CAP-001",
      3,
      4,
      true,
      false,
      10,
    );

    expect(result.sync.synced).toBe(true);
    expect(result.sync.error).toBeNull();
    expect(mockSyncAttempt).toHaveBeenCalled();
  });

  it("returns synced false when server sync fails", async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetSelectedChild.mockReturnValue("child-456");
    mockSyncAttempt.mockResolvedValue({
      synced: false,
      error: { type: "network_error", message: "网络连接失败" },
      recoverable: true,
    });

    const result = await recordAttemptWithSync(
      "parent-123",
      "CAP-001",
      3,
      4,
      true,
      false,
      10,
    );

    expect(result.sync.synced).toBe(false);
    expect(result.sync.error).toBe("网络连接失败");
    expect(result.progress.completedProblemIds).toContain("CAP-001");
  });
});

describe("recordDailyPracticeCompleteWithSync", () => {
  it("returns no sync in local mode", async () => {
    mockIsConfigured.mockReturnValue(false);

    const result = await recordDailyPracticeCompleteWithSync(null);

    expect(result.sync.synced).toBe(false);
    expect(result.sync.error).toBeNull();
    expect(result.starsEarned).toBeGreaterThanOrEqual(0);
  });

  it("syncs to server in server mode", async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetSelectedChild.mockReturnValue("child-456");
    mockSyncAttempt.mockResolvedValue({ synced: true, error: null, recoverable: false });

    const result = await recordDailyPracticeCompleteWithSync("parent-123");

    expect(result.sync.synced).toBe(true);
    expect(mockSyncAttempt).toHaveBeenCalled();
  });
});

describe("updateWrongProblemReviewWithSync", () => {
  it("returns no sync in local mode", async () => {
    mockIsConfigured.mockReturnValue(false);

    const result = await updateWrongProblemReviewWithSync(null, "CAP-001", true);

    expect(result.sync.synced).toBe(false);
    expect(result.sync.error).toBeNull();
  });

  it("syncs to server in server mode on correct review", async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetSelectedChild.mockReturnValue("child-456");
    mockSyncAttempt.mockResolvedValue({ synced: true, error: null, recoverable: false });

    const result = await updateWrongProblemReviewWithSync("parent-123", "CAP-001", true);

    expect(result.sync.synced).toBe(true);
    expect(mockSyncAttempt).toHaveBeenCalled();
  });
});

describe("loadReportWithSource", () => {
  it("returns fallbackToLocal in local mode", async () => {
    mockIsConfigured.mockReturnValue(false);

    const result = await loadReportWithSource(null);

    expect(result.fallbackToLocal).toBe(true);
    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });

  it("returns server data in server mode on success", async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetSelectedChild.mockReturnValue("child-456");
    mockLoadReport.mockResolvedValue({
      data: {
        attempts: [],
        wrongProblems: [],
        totalStars: 10,
        streakDays: 3,
      },
      error: null,
    });

    const result = await loadReportWithSource("parent-123");

    expect(result.fallbackToLocal).toBe(false);
    expect(result.data).not.toBeNull();
    expect(result.data!.totalStars).toBe(10);
    expect(result.error).toBeNull();
  });

  it("returns fallbackToLocal with error when server fails", async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetSelectedChild.mockReturnValue("child-456");
    mockLoadReport.mockResolvedValue({
      data: null,
      error: { type: "network_error", message: "网络连接失败" },
    });

    const result = await loadReportWithSource("parent-123");

    expect(result.fallbackToLocal).toBe(true);
    expect(result.data).toBeNull();
    expect(result.error).toBe("网络连接失败");
  });
});
