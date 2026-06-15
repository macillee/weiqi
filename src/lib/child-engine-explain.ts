import type { Problem, Point, ProblemCategory } from "@/lib/problems";
import type { LocalReviewResult, EngineReviewSignalLike } from "@/lib/ai-review";

/* ───── Validator extension (extends ai-review rules with engine-specific banned phrases) ───── */

const MAX_LENGTH = 150;

const BANNED_PHRASES = [
  // Carried from ai-review.ts
  "你下错了",
  "初学者错误",
  "初级错误",
  "新手错误",
  "级位",
  "段位",
  "你现在是",
  "你的水平",
  // Engine-specific additions
  "胜率",
  "winrate",
  "win rate",
  "rating",
  "score",
  "得分",
  "分差",
  "百分点",
  "目数差",
  "visits",
  "playouts",
];

// Lower-cased once at module load; comparison is case-insensitive
// so WinRate / WIN RATE / SCORE / Rating / Visits are all caught.
const BANNED_PHRASES_LOWER = BANNED_PHRASES.map((p) => p.toLowerCase());

export type ValidationFailure = { reason: "too-long" | "empty" | "banned" | "bad-source"; detail: string };

export function validateChildEngineExplain(result: LocalReviewResult): true | ValidationFailure {
  if (typeof result.message !== "string" || result.message.length === 0) {
    return { reason: "empty", detail: "message is empty" };
  }
  if (result.message.length > MAX_LENGTH) {
    return { reason: "too-long", detail: `message length ${result.message.length} > ${MAX_LENGTH}` };
  }
  if (result.source !== "rule-template" && result.source !== "engine-assisted") {
    return { reason: "bad-source", detail: `unknown source: ${String(result.source)}` };
  }
  const messageLower = result.message.toLowerCase();
  for (let i = 0; i < BANNED_PHRASES_LOWER.length; i++) {
    if (messageLower.includes(BANNED_PHRASES_LOWER[i])) {
      return { reason: "banned", detail: `message contains banned phrase: ${BANNED_PHRASES[i]}` };
    }
  }
  if (typeof result.concept !== "string" || result.concept.length === 0) {
    return { reason: "empty", detail: "concept is empty" };
  }
  return true;
}

/* ───── Public input / output ───── */

export type ChildEngineExplainInput = {
  problem: Problem;
  attemptedMove: Point;
  authoredAnswer: Point;
  usedHint: boolean;
  signal: EngineReviewSignalLike;
  attemptedMoveRank?: number | null;
  authoredMoveRank?: number | null;
};

/**
 * Output is always a `LocalReviewResult`. The helper never throws.
 *
 * `source` rule:
 *   - `"engine-assisted"` only when the input signal agrees with the authored
 *     answer AND confidence is `medium` or `high`. Otherwise the output is
 *     shaped as a rule-template fallback (source = `"rule-template"`).
 *
 * The helper does NOT gate on multi-step itself. The gate (`isMultiStep`)
 * lives at the consumer — wiring into `ProblemPlayer.handleShowCoach` is a
 * separate, gated follow-up.
 */
export type ChildEngineExplainOutput = LocalReviewResult;

/* ───── Helpers ───── */

function isFiniteRank(rank: number | null | undefined): rank is number {
  return typeof rank === "number" && Number.isFinite(rank) && rank > 0;
}

function pickCategory(category: ProblemCategory): ProblemCategory | "fallback" {
  const known: ProblemCategory[] = [
    "capture",
    "escape",
    "connect_cut",
    "life_death",
    "opening",
    "endgame",
    "mixed",
  ];
  return known.includes(category) ? category : "fallback";
}

function clampMessage(msg: string): string {
  if (msg.length <= MAX_LENGTH) return msg;
  return msg.slice(0, MAX_LENGTH - 1) + "…";
}

const CATEGORY_CONCEPTS: Record<ProblemCategory | "fallback", string[]> = {
  capture: ["叫吃", "气", "提子", "收气"],
  escape: ["逃跑", "长气", "出头", "气"],
  connect_cut: ["连接", "断点", "切断", "粘"],
  life_death: ["眼", "活棋", "死棋", "要点"],
  opening: ["角", "边", "大场", "方向"],
  endgame: ["边界", "先手", "官子", "目"],
  mixed: ["判断", "选择", "计算", "要点"],
  fallback: ["判断", "计算", "选择", "要点"],
};

const CATEGORY_RULE_MESSAGES: Record<ProblemCategory | "fallback", string[]> = {
  capture: [
    "先数一数对方还有几口气。",
    "试试找对方气最少的地方。",
    "看一看哪里能收对方的气。",
  ],
  escape: [
    "先数一数自己还有几口气。",
    "试着找一条逃跑的路线。",
    "想一想往哪边长气最多。",
  ],
  connect_cut: [
    "先看看哪里是关键连接。",
    "想一想对方想切断哪里。",
    "试着先把自己的棋连在一起。",
  ],
  life_death: [
    "先看看能不能做出两只眼。",
    "找一找做眼的要点在哪里。",
    "想一想对方想破哪里。",
  ],
  opening: [
    "先看看角上有没有好的位置。",
    "想一想这步棋的方向对不对。",
    "试试往更开阔的地方下。",
  ],
  endgame: [
    "先看看哪里还有边界没有确定。",
    "想一想哪步是先手。",
    "试试找最大的目数。",
  ],
  mixed: [
    "先判断一下这里最关键的是什么。",
    "试着算一算再下。",
    "看看有没有更急的地方。",
  ],
  fallback: [
    "先仔细看看棋盘上的情况。",
    "试着算一算再下。",
    "再想一想，别着急。",
  ],
};

const CATEGORY_ENGINE_MESSAGES: Record<ProblemCategory | "fallback", string[]> = {
  capture: [
    "引擎分析认为这里是要收气的关键。",
    "引擎也认为这一步更接近正确方向。",
    "引擎分析显示正确答案在你下的一带。",
  ],
  escape: [
    "引擎分析认为这里是逃跑的关键。",
    "引擎也认为这一步方向更对。",
    "引擎分析显示这一步能长出更多气。",
  ],
  connect_cut: [
    "引擎分析认为这里是连接要点。",
    "引擎也认为这一步能补上断点。",
    "引擎分析显示正确答案在附近。",
  ],
  life_death: [
    "引擎分析认为这里是做眼要点。",
    "引擎也认为这一步对做活很重要。",
    "引擎分析显示正确答案在附近。",
  ],
  opening: [
    "引擎分析认为这个方向更合理。",
    "引擎也认为这里是好的大场。",
    "引擎分析显示这一步符合开局原则。",
  ],
  endgame: [
    "引擎分析认为这里是先手要点。",
    "引擎也认为这一步官子价值更大。",
    "引擎分析显示这一步更急。",
  ],
  mixed: [
    "引擎分析认为这里是关键。",
    "引擎也认为这一步更合理。",
    "引擎分析显示正确答案在附近。",
  ],
  fallback: [
    "引擎分析认为这里是关键。",
    "引擎也认为这一步更合理。",
    "引擎分析显示正确答案在附近。",
  ],
};

function pickFromPool(pool: string[], seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % pool.length;
  return pool[idx];
}

/* ───── Public API ───── */

export function explainChildEngine(input: ChildEngineExplainInput): ChildEngineExplainOutput {
  const category = pickCategory(input.problem.category);
  const concepts = CATEGORY_CONCEPTS[category];
  const seed = `${input.problem.id}:${input.attemptedMove.x},${input.attemptedMove.y}:${input.authoredAnswer.x},${input.authoredAnswer.y}:${input.usedHint ? 1 : 0}`;

  const isEngineAssisted =
    input.signal &&
    input.signal.agreesWithAuthoredAnswer === true &&
    (input.signal.confidence === "high" || input.signal.confidence === "medium");

  // Engine-assisted message
  if (isEngineAssisted) {
    let message = pickFromPool(CATEGORY_ENGINE_MESSAGES[category], seed);

    // Refine with rank info when available
    if (isFiniteRank(input.attemptedMoveRank) && isFiniteRank(input.authoredMoveRank)) {
      const attempted = input.attemptedMoveRank!;
      const authored = input.authoredMoveRank!;
      if (authored === 1 && attempted > 1) {
        // Engine agrees with the authored answer; the child's attempt is lower-ranked
        const delta = attempted - authored;
        if (delta === 1) {
          message = "引擎分析认为答案就在这一步旁边。";
        } else if (delta <= 3) {
          message = "引擎分析认为答案离你下的一步很近。";
        } else {
          message = "引擎分析认为还需要再多看几步。";
        }
      }
    }

    const concept = concepts[Math.abs(seed.length) % concepts.length];
    return {
      message: clampMessage(message),
      concept,
      source: "engine-assisted",
    };
  }

  // Rule-template fallback (deterministic, never throws)
  let message = pickFromPool(CATEGORY_RULE_MESSAGES[category], seed);
  if (input.usedHint) {
    message = "用了提示也没关系，再看看。";
  }
  const concept = concepts[Math.abs(seed.length) % concepts.length];
  return {
    message: clampMessage(message),
    concept,
    source: "rule-template",
  };
}

/* ───── Feature flag contract (consumer wiring gate) ───── */

/**
 * `CHILD_ENGINE_EXPLAIN` feature flag — gates the v0.20.0b consumer
 * wiring of `explainChildEngine()` into `ProblemPlayer` for multi-step
 * wrong attempts.
 *
 * Default: OFF. The helper itself does not read this flag — the flag is
 * a consumer-side gate. When the flag is off, `ProblemPlayer` continues
 * to use the v0.13 / v0.19 server-action `handleShowCoach` path; the
 * helper is unreachable. Off-state is byte-identical to v0.19.
 *
 * Resolution order (first non-undefined wins):
 *   1. `CHILD_ENGINE_EXPLAIN` env var
 *      (Node: `process.env`; Next.js: `import.meta.env`)
 *   2. `setChildEngineExplainEnabled()` runtime override (tests / dev)
 *   3. Default: `false`
 *
 * Env wins over runtime, matching the `ENGINE_HINT_PROJECTION` contract.
 */
export type ChildEngineExplainFlagSource = "env" | "runtime" | "default";

export type ChildEngineExplainFlagState = {
  enabled: boolean;
  source: ChildEngineExplainFlagSource;
};

let childEngineExplainRuntimeFlag: boolean | undefined = undefined;

export function setChildEngineExplainEnabled(value: boolean | undefined): void {
  childEngineExplainRuntimeFlag = value;
}

function readChildEngineExplainEnv(): boolean | undefined {
  if (typeof process !== "undefined" && process.env) {
    const raw = process.env.CHILD_ENGINE_EXPLAIN;
    if (raw === "true" || raw === "1") return true;
    if (raw === "false" || raw === "0") return false;
  }
  try {
    const meta = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (meta && typeof meta === "object") {
      const raw = meta.CHILD_ENGINE_EXPLAIN;
      if (raw === "true" || raw === "1") return true;
      if (raw === "false" || raw === "0") return false;
    }
  } catch {
    // import.meta.env not available
  }
  return undefined;
}

export function getChildEngineExplainFlag(): ChildEngineExplainFlagState {
  const fromEnv = readChildEngineExplainEnv();
  if (fromEnv !== undefined) {
    return { enabled: fromEnv, source: "env" };
  }
  if (childEngineExplainRuntimeFlag !== undefined) {
    return { enabled: childEngineExplainRuntimeFlag, source: "runtime" };
  }
  return { enabled: false, source: "default" };
}

/**
 * Helper that the consumer (`ProblemPlayer`) uses to decide whether to
 * route the multi-step wrong-attempt "请老师帮忙" button to the v0.20.0b
 * local-only `handleShowChildCoach` path (which calls
 * `explainChildEngine()`) instead of the v0.13 / v0.19 server-action
 * `handleShowCoach` path.
 *
 * The wiring is a *replacement* of the multi-step branch only; the
 * single-step branch and the multi-step+flag-off branch are unaffected.
 */
export function shouldUseChildEngineExplain(isMultiStep: boolean): boolean {
  if (!isMultiStep) return false;
  return getChildEngineExplainFlag().enabled;
}
