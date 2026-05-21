import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  detectImportEligibility,
  markImportOffered,
  type ImportDetectionResult,
} from "@/lib/progress-import";

const PROGRESS_KEY = "children-go-app:v0.1:progress";
const IMPORT_OFFERED_KEY = "children-go-app:v0.2:import-offered";

describe("detectImportEligibility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns no_local_progress when localStorage has no progress key", () => {
    const result = detectImportEligibility();
    expect(result.status).toBe("no_local_progress");
    expect(result.localProgress).toBeNull();
    expect(result.localAttemptCount).toBe(0);
    expect(result.localStars).toBe(0);
  });

  it("returns no_local_progress when progress has zero attempts and zero stars", () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        stars: 0,
        streakDays: 0,
        completedProblemIds: [],
        masteredProblemIds: [],
        wrongProblems: {},
        attempts: [],
        achievements: [],
      }),
    );
    const result = detectImportEligibility();
    expect(result.status).toBe("no_local_progress");
  });

  it("returns eligible_for_import when local progress exists with attempts", () => {
    const progress = {
      stars: 3,
      streakDays: 1,
      completedProblemIds: ["CAP-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        {
          problemId: "CAP-001",
          selectedX: 2,
          selectedY: 3,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 10,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      achievements: [],
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

    const result = detectImportEligibility();
    expect(result.status).toBe("eligible_for_import");
    expect(result.localAttemptCount).toBe(1);
    expect(result.localStars).toBe(3);
    expect(result.localProgress).not.toBeNull();
  });

  it("returns eligible_for_import when stars > 0 but no attempts (edge case)", () => {
    const progress = {
      stars: 5,
      streakDays: 1,
      completedProblemIds: [],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [],
      achievements: [],
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

    const result = detectImportEligibility();
    expect(result.status).toBe("eligible_for_import");
    expect(result.localStars).toBe(5);
  });

  it("returns already_imported when import has been previously offered", () => {
    const progress = {
      stars: 10,
      streakDays: 2,
      completedProblemIds: ["CAP-001"],
      masteredProblemIds: [],
      wrongProblems: {},
      attempts: [
        {
          problemId: "CAP-001",
          selectedX: 2,
          selectedY: 3,
          isCorrect: true,
          usedHint: false,
          timeSpentSeconds: 10,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      achievements: [],
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    localStorage.setItem(IMPORT_OFFERED_KEY, "2026-05-20T00:00:00Z");

    const result = detectImportEligibility();
    expect(result.status).toBe("already_imported");
    expect(result.localAttemptCount).toBe(1);
    expect(result.localStars).toBe(10);
  });

  it("returns no_local_progress when localStorage data is malformed JSON", () => {
    localStorage.setItem(PROGRESS_KEY, "not-valid-json{{{");
    const result = detectImportEligibility();
    expect(result.status).toBe("no_local_progress");
    expect(result.localProgress).toBeNull();
  });

  it("returns no_local_progress when localStorage.getItem throws", () => {
    // Simulate localStorage failure
    const originalGetItem = localStorage.getItem.bind(localStorage);
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("localStorage unavailable");
    });

    const result = detectImportEligibility();
    expect(result.status).toBe("no_local_progress");

    vi.restoreAllMocks();
  });
});

describe("markImportOffered", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("writes import-offered key with current timestamp", () => {
    markImportOffered();
    const value = localStorage.getItem(IMPORT_OFFERED_KEY);
    expect(value).not.toBeNull();
    // Should be a valid ISO date string
    expect(new Date(value!).toISOString()).toBe(value);
  });

  it("does not throw when localStorage.setItem fails", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    // Should not throw
    markImportOffered();
    vi.restoreAllMocks();
  });
});