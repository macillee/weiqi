import type { Problem, ProblemCategory, Point } from "./problems";

export type LocalReviewInput = {
  problem: Problem;
  attemptedMove: { x: number; y: number };
  correctMove?: Point;
  usedHint?: boolean;
};

export type EngineReviewSignalLike = {
  confidence: "low" | "medium" | "high";
  agreesWithAuthoredAnswer: boolean;
};

export type LocalReviewResult = {
  message: string;
  concept: string;
  source: "rule-template" | "engine-assisted";
};

const MAX_LENGTH = 150;

const BANNED_PHRASES = [
  "你下错了",
  "初学者错误",
  "初级错误",
  "新手错误",
  "级位",
  "段位",
  "你现在是",
  "你的水平",
];

type CategoryKey = ProblemCategory | "fallback";

const CATEGORY_CONCEPTS: Record<CategoryKey, string[]> = {
  capture: ["叫吃", "气", "提子", "收气"],
  escape: ["逃跑", "长气", "出头", "气"],
  connect_cut: ["连接", "断点", "切断", "粘"],
  life_death: ["眼", "活棋", "死棋", "要点"],
  opening: ["角", "边", "大场", "方向"],
  endgame: ["边界", "先手", "官子", "目"],
  mixed: ["判断", "选择", "计算", "要点"],
  fallback: ["判断", "计算", "选择", "要点"],
};

const CATEGORY_MESSAGES: Record<CategoryKey, string[]> = {
  capture: [
    "先数一数对方还有几口气。",
    "试试找对方气最少的地方。",
    "想一想哪里能收对方的气。",
    "看看对方哪颗子只有一口气。",
  ],
  escape: [
    "先数一数自己还有几口气。",
    "试着找一条逃跑的路线。",
    "想一想往哪边长气最多。",
    "看看能不能先向外出头。",
  ],
  connect_cut: [
    "这里更像是连接题，先保护断点。",
    "看看哪里是关键的连接位置。",
    "想一想对方想切断哪里。",
    "试着先把自己的棋连在一起。",
  ],
  life_death: [
    "先看看能不能做出两只眼。",
    "找一找做眼的要点在哪里。",
    "想一想对方想破哪里。",
    "看看中间有没有关键的一步。",
  ],
  opening: [
    "先看看角上有没有好的位置。",
    "想一想这步棋的方向对不对。",
    "试试往更开阔的地方下。",
    "看看边上有没有大场。",
  ],
  endgame: [
    "先看看哪里还有边界没有确定。",
    "想一想哪步是先手。",
    "试试找最大的目数。",
    "看看有没有先手便宜。",
  ],
  mixed: [
    "先判断一下这里最关键的是什么。",
    "试着算一算再下。",
    "看看有没有更急的地方。",
    "想一想对方的弱点在哪里。",
  ],
  fallback: [
    "先仔细看看棋盘上的情况。",
    "试着算一算再下。",
    "再想一想，别着急。",
    "看看有没有更好的选择。",
  ],
};

const HINT_USED_MESSAGES: Record<CategoryKey, string[]> = {
  capture: ["用了提示也没关系，再看看对方的气。"],
  escape: ["用了提示也没关系，再看看自己的气。"],
  connect_cut: ["用了提示也没关系，再找找断点。"],
  life_death: ["用了提示也没关系，再找找眼位。"],
  opening: ["用了提示也没关系，再看看方向。"],
  endgame: ["用了提示也没关系，再看看边界。"],
  mixed: ["用了提示也没关系，再想想。"],
  fallback: ["用了提示也没关系，再仔细看看。"],
};

const ENGINE_ASSISTED_MESSAGES: Record<CategoryKey, string[]> = {
  capture: [
    "引擎分析确认这里是要收气的要点。",
    "引擎也认为这是正确的一步。",
    "引擎分析显示这步棋在正确的方向上。",
  ],
  escape: [
    "引擎分析确认这里是逃跑的关键。",
    "引擎也认为这是正确的方向。",
    "引擎分析显示往这里走是好棋。",
  ],
  connect_cut: [
    "引擎分析确认这里是关键的连接位置。",
    "引擎也认为这是正确的切断点。",
    "引擎分析显示这步棋很关键。",
  ],
  life_death: [
    "引擎分析确认这里是做眼的关键。",
    "引擎也认为这是正确的一步。",
    "引擎分析显示这步棋很重要。",
  ],
  opening: [
    "引擎分析确认这个方向是正确的。",
    "引擎也认为这是好位置。",
    "引擎分析显示这步棋符合开局原则。",
  ],
  endgame: [
    "引擎分析确认这里是官子要点。",
    "引擎也认为这是正确的一步。",
    "引擎分析显示这步棋价值很大。",
  ],
  mixed: [
    "引擎分析确认这里是关键。",
    "引擎也认为这是好棋。",
    "引擎分析显示这步棋值得考虑。",
  ],
  fallback: [
    "引擎分析确认这里是关键。",
    "引擎也认为这是好棋。",
    "引擎分析显示这步棋值得考虑。",
  ],
};

function hashInput(input: LocalReviewInput): number {
  const s = `${input.problem.id}:${input.attemptedMove.x},${input.attemptedMove.y}:${input.correctMove ? `${input.correctMove.x},${input.correctMove.y}` : ""}:${input.usedHint ? 1 : 0}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickCategoryKey(category: ProblemCategory): CategoryKey {
  if (category in CATEGORY_MESSAGES) return category;
  return "fallback";
}

function clampMessage(msg: string): string {
  if (msg.length <= MAX_LENGTH) return msg;
  return msg.slice(0, MAX_LENGTH - 1) + "…";
}

export function getLocalReview(
  input: LocalReviewInput,
  engineSignal?: EngineReviewSignalLike,
): LocalReviewResult {
  const { problem, attemptedMove, correctMove, usedHint } = input;

  if (engineSignal && engineSignal.confidence !== "low" && engineSignal.agreesWithAuthoredAnswer) {
    const key = pickCategoryKey(problem.category);
    const messages = usedHint ? HINT_USED_MESSAGES : ENGINE_ASSISTED_MESSAGES;
    const msgPool = messages[key];
    const idx = hashInput(input) % msgPool.length;
    const concept = CATEGORY_CONCEPTS[key][idx % CATEGORY_CONCEPTS[key].length];
    return {
      message: clampMessage(msgPool[idx]),
      concept,
      source: "engine-assisted",
    };
  }

  const wrongMoveEntry = problem.wrongMoves?.find(
    (wm) => wm.x === attemptedMove.x && wm.y === attemptedMove.y,
  );

  if (wrongMoveEntry) {
    const msg = clampMessage(wrongMoveEntry.message);
    const concept = pickConceptForCategory(problem.category, 0);
    return { message: msg, concept, source: "rule-template" };
  }

  const key = pickCategoryKey(problem.category);

  if (usedHint) {
    const hintMsgs = HINT_USED_MESSAGES[key];
    const idx = hashInput(input) % hintMsgs.length;
    const concept = CATEGORY_CONCEPTS[key][idx % CATEGORY_CONCEPTS[key].length];
    return {
      message: clampMessage(hintMsgs[idx]),
      concept,
      source: "rule-template",
    };
  }

  const msgs = CATEGORY_MESSAGES[key];
  const idx = hashInput(input) % msgs.length;
  const concept = CATEGORY_CONCEPTS[key][idx % CATEGORY_CONCEPTS[key].length];

  let message = msgs[idx];

  if (correctMove) {
    const nearCorrect =
      Math.abs(attemptedMove.x - correctMove.x) <= 1 &&
      Math.abs(attemptedMove.y - correctMove.y) <= 1;
    if (nearCorrect) {
      message = "差一点点！再仔细看看旁边。";
    }
  }

  return { message: clampMessage(message), concept, source: "rule-template" };
}

function pickConceptForCategory(
  category: ProblemCategory,
  idx: number,
): string {
  const key = pickCategoryKey(category);
  return CATEGORY_CONCEPTS[key][idx % CATEGORY_CONCEPTS[key].length];
}

export function validateReviewOutput(result: LocalReviewResult): boolean {
  if (result.message.length > MAX_LENGTH) return false;
  if (result.source !== "rule-template" && result.source !== "engine-assisted") return false;
  for (const banned of BANNED_PHRASES) {
    if (result.message.includes(banned)) return false;
  }
  return true;
}
