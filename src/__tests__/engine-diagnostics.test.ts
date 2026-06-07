import { describe, it, expect } from "vitest";
import { getLocalEngineDiagnostics } from "@/lib/engine-diagnostics";
import type { EngineConfig } from "@/lib/engine-config";

const mockAvailable = { available: true };
const mockDisabled = { available: false, reason: "disabled" as const };
const mockMissingBinary = { available: false, reason: "missing-binary" as const };
const mockMissingModel = { available: false, reason: "missing-model" as const };

function makeEnabledConfig(overrides?: Partial<EngineConfig>): EngineConfig {
  return {
    enabled: true,
    binPath: "/usr/local/bin/katago",
    modelPath: "/models/kata1.bin.gz",
    configPath: "/etc/katago.cfg",
    visits: 300,
    timeoutMs: 5000,
    ...overrides,
  };
}

describe("getLocalEngineDiagnostics", () => {
  const fixedNow = () => new Date("2026-06-07T12:00:00.000Z");

  it("returns disabled when config.enabled is false", () => {
    const result = getLocalEngineDiagnostics({
      config: { enabled: false, binPath: "", modelPath: "", configPath: undefined, visits: 300, timeoutMs: 5000 },
      availability: mockDisabled,
      now: fixedNow,
    });
    expect(result.status).toBe("disabled");
    expect(result.reasons).toEqual(["disabled"]);
    expect(result.enabled).toBe(false);
    expect(result.available).toBe(false);
  });

  it("returns enabled-unavailable when binary is missing", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig({ binPath: "" }),
      availability: mockMissingBinary,
      now: fixedNow,
    });
    expect(result.status).toBe("enabled-unavailable");
    expect(result.reasons).toContain("missing-binary");
    expect(result.enabled).toBe(true);
    expect(result.available).toBe(false);
  });

  it("returns enabled-unavailable when model is missing", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig({ modelPath: "" }),
      availability: mockMissingModel,
      now: fixedNow,
    });
    expect(result.status).toBe("enabled-unavailable");
    expect(result.reasons).toContain("missing-model");
    expect(result.enabled).toBe(true);
    expect(result.available).toBe(false);
  });

  it("returns available when engine is configured and available", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      now: fixedNow,
    });
    expect(result.status).toBe("available");
    expect(result.reasons).toEqual([]);
    expect(result.enabled).toBe(true);
    expect(result.available).toBe(true);
  });

  it("includes missing-config reason when configPath is not set", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig({ configPath: undefined }),
      availability: mockAvailable,
      now: fixedNow,
    });
    expect(result.status).toBe("available");
    expect(result.reasons).toContain("missing-config");
  });

  it("sanitizes config to booleans only, no raw paths", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      now: fixedNow,
    });
    expect(result.config.hasBinPath).toBe(true);
    expect(result.config.hasModelPath).toBe(true);
    expect(result.config.hasConfigPath).toBe(true);
    expect(result.config.visitsConfigured).toBe(false);
    expect(result.config.timeoutConfigured).toBe(false);
    expect("binPath" in result.config).toBe(false);
    expect("modelPath" in result.config).toBe(false);
  });

  it("returns default lastAnalysis as not-run", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      now: fixedNow,
    });
    expect(result.lastAnalysis.attempted).toBe(false);
    expect(result.lastAnalysis.result).toBe("not-run");
    expect(result.lastAnalysis.latencyBucket).toBe("not-run");
    expect(result.lastAnalysis.warnings).toEqual([]);
    expect(result.lastAnalysis.feedbackSource).toBeUndefined();
  });

  it("maps timeout lastAnalysis to rule-template fallback", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      lastAnalysis: {
        attempted: true,
        result: "timeout",
        latencyBucket: "timeout",
        warnings: ["engine did not respond"],
      },
      now: fixedNow,
    });
    expect(result.lastAnalysis.attempted).toBe(true);
    expect(result.lastAnalysis.result).toBe("timeout");
    expect(result.lastAnalysis.latencyBucket).toBe("timeout");
    expect(result.lastAnalysis.feedbackSource).toBe("rule-template");
    expect(result.lastAnalysis.warnings).toEqual(["engine did not respond"]);
  });

  it("maps malformed-output lastAnalysis to rule-template fallback", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      lastAnalysis: {
        attempted: true,
        result: "malformed-output",
        latencyBucket: "not-run",
        warnings: ["could not parse engine output"],
      },
      now: fixedNow,
    });
    expect(result.lastAnalysis.feedbackSource).toBe("rule-template");
  });

  it("maps process-error lastAnalysis to rule-template fallback", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      lastAnalysis: {
        attempted: true,
        result: "process-error",
        latencyBucket: "not-run",
        warnings: [],
      },
      now: fixedNow,
    });
    expect(result.lastAnalysis.feedbackSource).toBe("rule-template");
  });

  it("maps successful lastAnalysis to engine-assisted source", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      lastAnalysis: {
        attempted: true,
        result: "success",
        latencyBucket: "1-3s",
        confidence: "high",
        agreesWithAuthoredAnswer: true,
        warnings: [],
      },
      now: fixedNow,
    });
    expect(result.lastAnalysis.result).toBe("success");
    expect(result.lastAnalysis.latencyBucket).toBe("1-3s");
    expect(result.lastAnalysis.confidence).toBe("high");
    expect(result.lastAnalysis.agreesWithAuthoredAnswer).toBe(true);
    expect(result.lastAnalysis.feedbackSource).toBe("engine-assisted");
  });

  it("includes checkedAt using injected clock", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      now: fixedNow,
    });
    expect(result.checkedAt).toBe("2026-06-07T12:00:00.000Z");
  });

  it("does not include raw engine output, winrate, or scoreLead", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      now: fixedNow,
    });
    const keys = Object.keys(result);
    expect(keys).not.toContain("boardPosition");
    expect(keys).not.toContain("rawOutput");
  });

  it("does not include child data or progress", () => {
    const result = getLocalEngineDiagnostics({
      config: makeEnabledConfig(),
      availability: mockAvailable,
      now: fixedNow,
    });
    const keys = Object.keys(result);
    expect(keys).not.toContain("childName");
    expect(keys).not.toContain("childProfile");
    expect(keys).not.toContain("progress");
  });
});
