export type EngineConfig = {
  enabled: boolean;
  binPath: string;
  modelPath: string;
  configPath: string | undefined;
  visits: number;
  timeoutMs: number;
};

const DEFAULT_VISITS = 300;
const DEFAULT_TIMEOUT_MS = 5000;

export function parseEngineConfig(): EngineConfig {
  const enabled = process.env.KATAGO_ENABLED === "true";

  const visitsRaw = process.env.KATAGO_VISITS;
  const visits = parsePositiveInt(visitsRaw, DEFAULT_VISITS);

  const timeoutRaw = process.env.KATAGO_TIMEOUT_MS;
  const timeoutMs = parsePositiveInt(timeoutRaw, DEFAULT_TIMEOUT_MS);

  return {
    enabled,
    binPath: process.env.KATAGO_BIN_PATH || "",
    modelPath: process.env.KATAGO_MODEL_PATH || "",
    configPath: process.env.KATAGO_CONFIG_PATH || undefined,
    visits,
    timeoutMs,
  };
}

export type EngineAvailabilityReason =
  | "disabled"
  | "missing-binary"
  | "missing-model"
  | "unsupported-platform"
  | "error";

export function checkEngineAvailability(
  config: EngineConfig,
  existsSync?: (path: string) => boolean,
): {
  available: boolean;
  reason?: EngineAvailabilityReason;
} {
  if (!config.enabled) {
    return { available: false, reason: "disabled" };
  }
  if (!config.binPath) {
    return { available: false, reason: "missing-binary" };
  }
  if (!config.modelPath) {
    return { available: false, reason: "missing-model" };
  }
  const check = existsSync || defaultExistsSync;
  try {
    if (!check(config.binPath)) {
      return { available: false, reason: "missing-binary" };
    }
    if (!check(config.modelPath)) {
      return { available: false, reason: "missing-model" };
    }
  } catch {
    return { available: false, reason: "error" };
  }
  return { available: true };
}

function defaultExistsSync(path: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("fs").existsSync(path);
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return fallback;
  return n;
}
