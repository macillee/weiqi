/**
 * Tests for buildAttemptHash determinism (v0.2.4c).
 *
 * Ensures the hash function produces stable output for the same input,
 * and different inputs produce different hashes.
 */

import { buildAttemptHash } from "./progress-import";

describe("buildAttemptHash determinism", () => {
  it("produces the same hash for identical inputs", () => {
    const hash1 = buildAttemptHash("problem-123", "2024-01-01T00:00:00.000Z");
    const hash2 = buildAttemptHash("problem-123", "2024-01-01T00:00:00.000Z");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different problem IDs", () => {
    const hash1 = buildAttemptHash("problem-123", "2024-01-01T00:00:00.000Z");
    const hash2 = buildAttemptHash("problem-456", "2024-01-01T00:00:00.000Z");
    expect(hash1).not.toBe(hash2);
  });

  it("produces different hashes for different createdAt values", () => {
    const hash1 = buildAttemptHash("problem-123", "2024-01-01T00:00:00.000Z");
    const hash2 = buildAttemptHash("problem-123", "2024-01-02T00:00:00.000Z");
    expect(hash1).not.toBe(hash2);
  });

  it("handles empty strings correctly", () => {
    const hash = buildAttemptHash("", "");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("includes problemId in the output for debuggability", () => {
    const hash = buildAttemptHash("problem-123", "2024-01-01T00:00:00.000Z");
    expect(hash).toContain("problem-123:");
  });
});
