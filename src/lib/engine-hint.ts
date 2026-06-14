import type { Problem, Point } from "@/lib/problems";
import type { EngineReviewSignalLike } from "@/lib/ai-review";

/* ───── Feature flag contract ───── */

/**
 * Engine hint projection feature flag.
 *
 * Default: OFF. The helper treats the off state as "no hint", so a consumer
 * wired with the flag off is byte-identical to the v0.18 behavior — no hint
 * ever appears, no engine signal is ever projected onto the board.
 *
 * Resolution order (first non-undefined wins):
 *   1. `ENGINE_HINT_PROJECTION` env var (Node only — server runtime reads
 *      `process.env`; `import.meta.env` is also recognized so Next.js
 *      inlining and unit tests can flip the flag without a build step)
 *   2. Module-level `setEngineHintProjectionEnabled()` for runtime toggling
 *      in tests and dev tools
 *   3. Default: `false`
 *
 * The flag is read once per `buildEngineHint()` call so that toggling it at
 * runtime takes effect immediately.
 */
export type EngineHintFlagSource = "env" | "runtime" | "default";

export type EngineHintFlagState = {
  enabled: boolean;
  source: EngineHintFlagSource;
};

let runtimeFlag: boolean | undefined = undefined;

export function setEngineHintProjectionEnabled(value: boolean | undefined): void {
  runtimeFlag = value;
}

function readEnvFlag(): boolean | undefined {
  if (typeof process !== "undefined" && process.env) {
    const raw = process.env.ENGINE_HINT_PROJECTION;
    if (raw === "true" || raw === "1") return true;
    if (raw === "false" || raw === "0") return false;
  }
  try {
    // Next.js may inline `import.meta.env` at build time
    const meta = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (meta && typeof meta === "object") {
      const raw = meta.ENGINE_HINT_PROJECTION;
      if (raw === "true" || raw === "1") return true;
      if (raw === "false" || raw === "0") return false;
    }
  } catch {
    // import.meta.env not available — fall through
  }
  return undefined;
}

export function getEngineHintProjectionFlag(): EngineHintFlagState {
  if (runtimeFlag !== undefined) {
    return { enabled: runtimeFlag, source: "runtime" };
  }
  const fromEnv = readEnvFlag();
  if (fromEnv !== undefined) {
    return { enabled: fromEnv, source: "env" };
  }
  return { enabled: false, source: "default" };
}

/* ───── Banned phrases (mirrors ai-review.ts wording rules) ───── */

const BANNED_PHRASES = [
  "你下错了",
  "初学者错误",
  "初级错误",
  "新手错误",
  "级位",
  "段位",
  "你现在是",
  "你的水平",
  "胜率",
  "winrate",
  "胜率",
  "rating",
];

const MAX_REASON_LENGTH = 150;

/* ───── Public types ───── */

export type EngineHintInput = {
  problem: Problem;
  attemptedMove: Point;
  authoredAnswer: Point;
  signal: EngineReviewSignalLike;
  topMoves?: ReadonlyArray<{ x: number; y: number; visits?: number; scoreLead?: number }>;
};

export type EngineHintOutput =
  | { kind: "no-hint"; reason: EngineHintNoHintReason }
  | { kind: "hint"; point: Point; reason: string };

export type EngineHintNoHintReason =
  | "flag-off"
  | "low-confidence"
  | "no-top-moves"
  | "single-top-move"
  | "second-move-equals-attempted"
  | "second-move-equals-authored"
  | "second-move-malformed"
  | "no-usable-second-move";

/* ───── Helpers ───── */

function pickCategory(category: Problem["category"]): keyof typeof CATEGORY_HINT_REASONS {
  if (category in CATEGORY_HINT_REASONS) {
    return category as keyof typeof CATEGORY_HINT_REASONS;
  }
  return "fallback";
}

const CATEGORY_HINT_REASONS = {
  capture: [
    "引擎也考虑了这里（次优点）。",
    "引擎认为这里可以收气。",
    "除了你下的位置，引擎还看了这里。",
  ],
  escape: [
    "引擎也考虑了这里（次优点）。",
    "引擎认为这里是逃跑的关键。",
    "除了你下的位置，引擎还看了这里。",
  ],
  connect_cut: [
    "引擎也考虑了这里（次优点）。",
    "引擎认为这里是关键连接点。",
    "除了你下的位置，引擎还看了这里。",
  ],
  life_death: [
    "引擎也考虑了这里（次优点）。",
    "引擎认为这里是做眼要点。",
    "除了你下的位置，引擎还看了这里。",
  ],
  opening: [
    "引擎也考虑了这里（次优点）。",
    "引擎认为这里方向正确。",
    "除了你下的位置，引擎还看了这里。",
  ],
  endgame: [
    "引擎也考虑了这里（次优点）。",
    "引擎认为这里是先手要点。",
    "除了你下的位置，引擎还看了这里。",
  ],
  mixed: [
    "引擎也考虑了这里（次优点）。",
    "引擎认为这里是关键。",
    "除了你下的位置，引擎还看了这里。",
  ],
  fallback: [
    "引擎也考虑了这里（次优点）。",
    "引擎认为这里是关键。",
    "除了你下的位置，引擎还看了这里。",
  ],
} as const;

function pointEquals(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function isValidCoordinate(point: Point, problem: Problem): boolean {
  if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) return false;
  if (point.x < 0 || point.y < 0) return false;
  if (point.x >= problem.boardSize || point.y >= problem.boardSize) return false;
  return true;
}

function isEmptyIntersection(point: Point, problem: Problem): boolean {
  return !problem.initialStones.some(
    (s) => s.x === point.x && s.y === point.y,
  );
}

function clampReason(text: string): string {
  if (text.length <= MAX_REASON_LENGTH) return text;
  return text.slice(0, MAX_REASON_LENGTH - 1) + "…";
}

function passesReasonRules(reason: string): boolean {
  if (reason.length === 0) return false;
  if (reason.length > MAX_REASON_LENGTH) return false;
  for (const banned of BANNED_PHRASES) {
    if (reason.includes(banned)) return false;
  }
  return true;
}

function pickReason(problem: Problem, attemptedMove: Point, authoredAnswer: Point): string {
  const category = pickCategory(problem.category);
  const pool = CATEGORY_HINT_REASONS[category];
  // Deterministic pick from the (attempted, authored, category) tuple so the
  // helper's output is stable per problem/attempt combination.
  const seed = `${problem.id}:${attemptedMove.x},${attemptedMove.y}:${authoredAnswer.x},${authoredAnswer.y}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % pool.length;
  return clampReason(pool[idx]);
}

/* ───── Public API ───── */

/**
 * Pure helper that derives a single next-best-move `Point` (with child-facing
 * rationale text) from an existing engine signal. Returns `{ kind: "no-hint" }`
 * when the helper is disabled, the engine is low-confidence, or there is no
 * usable second move to project.
 *
 * This helper does NOT touch React, the DOM, the board, or any page. It is
 * a pure function of its inputs. Consumer wiring (overlay, dialog copy, side
 * panel) is a separate, gated follow-up.
 */
export function buildEngineHint(input: EngineHintInput): EngineHintOutput {
  const flag = getEngineHintProjectionFlag();
  if (!flag.enabled) {
    return { kind: "no-hint", reason: "flag-off" };
  }

  if (!input.signal || input.signal.confidence === "low") {
    return { kind: "no-hint", reason: "low-confidence" };
  }

  const topMoves = input.topMoves;
  if (!topMoves || topMoves.length === 0) {
    return { kind: "no-hint", reason: "no-top-moves" };
  }
  if (topMoves.length < 2) {
    return { kind: "no-hint", reason: "single-top-move" };
  }

  const second = topMoves[1];
  if (!second || typeof second.x !== "number" || typeof second.y !== "number") {
    return { kind: "no-hint", reason: "second-move-malformed" };
  }

  const secondPoint: Point = { x: second.x, y: second.y };
  if (pointEquals(secondPoint, input.attemptedMove)) {
    return { kind: "no-hint", reason: "second-move-equals-attempted" };
  }
  if (pointEquals(secondPoint, input.authoredAnswer)) {
    return { kind: "no-hint", reason: "second-move-equals-authored" };
  }
  if (!isValidCoordinate(secondPoint, input.problem)) {
    return { kind: "no-hint", reason: "second-move-malformed" };
  }
  if (!isEmptyIntersection(secondPoint, input.problem)) {
    return { kind: "no-hint", reason: "no-usable-second-move" };
  }

  const reason = pickReason(input.problem, input.attemptedMove, input.authoredAnswer);
  if (!passesReasonRules(reason)) {
    return { kind: "no-hint", reason: "no-usable-second-move" };
  }

  return { kind: "hint", point: secondPoint, reason };
}
