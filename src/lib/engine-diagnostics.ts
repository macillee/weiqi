import "server-only";

import { parseEngineConfig, checkEngineAvailability, type EngineConfig } from "./engine-config";

export type EngineDiagnosticsStatus =
  | "disabled"
  | "enabled-unavailable"
  | "available"
  | "error";

export type EngineDiagnosticsReason =
  | "disabled"
  | "missing-binary"
  | "missing-model"
  | "missing-config"
  | "unsupported-platform"
  | "timeout"
  | "malformed-output"
  | "process-error"
  | "unknown-error";

export type EngineLatencyBucket =
  | "not-run"
  | "<1s"
  | "1-3s"
  | "3-5s"
  | ">5s"
  | "timeout";

export type EngineLastAnalysisDiagnostics = {
  attempted: boolean;
  result: "not-run" | "success" | "fallback" | "timeout" | "malformed-output" | "process-error" | "unavailable";
  latencyBucket: EngineLatencyBucket;
  confidence?: "low" | "medium" | "high";
  agreesWithAuthoredAnswer?: boolean;
  feedbackSource?: "rule-template" | "engine-assisted";
  warnings: string[];
};

export type LocalEngineDiagnostics = {
  status: EngineDiagnosticsStatus;
  reasons: EngineDiagnosticsReason[];
  enabled: boolean;
  available: boolean;
  checkedAt: string;
  config: {
    hasBinPath: boolean;
    hasModelPath: boolean;
    hasConfigPath: boolean;
    visitsConfigured: boolean;
    timeoutConfigured: boolean;
  };
  lastAnalysis: EngineLastAnalysisDiagnostics;
};

function toStatus(
  config: EngineConfig,
  availability: { available: boolean; reason?: string },
): EngineDiagnosticsStatus {
  if (availability.reason === "disabled") return "disabled";
  if (availability.available) return "available";
  if (!config.enabled) return "disabled";
  return "enabled-unavailable";
}

export function getLocalEngineDiagnostics(options?: {
  config?: EngineConfig;
  availability?: { available: boolean; reason?: string };
  lastAnalysis?: Partial<EngineLastAnalysisDiagnostics>;
  now?: () => Date;
}): LocalEngineDiagnostics {
  const cfg = options?.config ?? parseEngineConfig();
  const availability = options?.availability ?? checkEngineAvailability(cfg);
  const nowFn = options?.now ?? (() => new Date());

  const status = toStatus(cfg, availability);
  const reasons: EngineDiagnosticsReason[] = [];

  if (status === "disabled") {
    reasons.push("disabled");
  } else if (!availability.available) {
    if (cfg.binPath === "" || availability.reason === "missing-binary") {
      reasons.push("missing-binary");
    }
    if (cfg.modelPath === "" || availability.reason === "missing-model") {
      reasons.push("missing-model");
    }
    if (!cfg.configPath) {
      reasons.push("missing-config");
    }
    if (availability.reason === "unsupported-platform") {
      reasons.push("unsupported-platform");
    }
    if (availability.reason === "error") {
      reasons.push("unknown-error");
    }
    if (reasons.length === 0) {
      reasons.push("unknown-error");
    }
  } else {
    if (!cfg.configPath) {
      reasons.push("missing-config");
    }
  }

  const defaultLastAnalysis: EngineLastAnalysisDiagnostics = {
    attempted: false,
    result: "not-run",
    latencyBucket: "not-run",
    warnings: [],
  };

  let lastAnalysis: EngineLastAnalysisDiagnostics;
  if (options?.lastAnalysis) {
    const la = options.lastAnalysis;
    let feedbackSource = la.feedbackSource;
    if (!feedbackSource) {
      feedbackSource = la.result === "success" ? "engine-assisted" : "rule-template";
    }
    lastAnalysis = {
      attempted: la.attempted ?? false,
      result: la.result ?? "not-run",
      latencyBucket: la.latencyBucket ?? (la.result === "timeout" ? "timeout" : "not-run"),
      confidence: la.confidence,
      agreesWithAuthoredAnswer: la.agreesWithAuthoredAnswer,
      feedbackSource,
      warnings: la.warnings ?? [],
    };
  } else {
    lastAnalysis = { ...defaultLastAnalysis };
  }

  return {
    status,
    reasons,
    enabled: cfg.enabled,
    available: availability.available,
    checkedAt: nowFn().toISOString(),
    config: {
      hasBinPath: cfg.binPath !== "",
      hasModelPath: cfg.modelPath !== "",
      hasConfigPath: cfg.configPath !== undefined,
      visitsConfigured: cfg.visits !== 300,
      timeoutConfigured: cfg.timeoutMs !== 5000,
    },
    lastAnalysis,
  };
}
