/**
 * Tests for buildAttemptHash determinism (v0.2.4c).
 */

import { buildAttemptHash } from "@/lib/progress-import";

describe("buildAttemptHash (exported for v0.2.4c)", () => {
  it("produces stable hash for same inputs", () => {
    const hash1 = buildAttemptHash("CAP-001", "2026-05-20T10:00:00.000Z");
    const hash2 = buildAttemptHash("CAP-001", "2026-05-20T10:00:00.000Z");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different problemIds", () => {
    const hash1 = buildAttemptHash("CAP-001", "2026-05-20T10:00:00.000Z");
    const hash2 = buildAttemptHash("CAP-002", "2026-05-20T10:00:00.000Z");
    expect(hash1).not.toBe(hash2);
  });

  it("produces different hashes for different timestamps", () => {
    const hash1 = buildAttemptHash("CAP-001", "2026-05-20T10:00:00.000Z");
    const hash2 = buildAttemptHash("CAP-001", "2026-05-21T10:00:00.000Z");
    expect(hash1).not.toBe(hash2);
  });

  it("hash format is problemId:hashSuffix", () => {
    const hash = buildAttemptHash("CAP-001", "2026-05-20T10:00:00.000Z");
    expect(hash).toMatch(/^CAP-001:[a-z0-9]+$/);
  });

  it("handles edge case: empty problemId", () => {
    const hash = buildAttemptHash("", "2026-05-20T10:00:00.000Z");
    expect(hash).toMatch(/^:/);
  });

  it("handles edge case: special characters in problemId", () => {
    const hash = buildAttemptHash("CAP-001_2.5", "2026-05-20T10:00:00.000Z");
    expect(hash).toMatch(/^CAP-001_2\.5:/);
  });
});
