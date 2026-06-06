import "server-only";

import { type EngineConfig, checkEngineAvailability, type EngineAvailabilityReason } from "./engine-config";

export type EngineReviewInput = {
  boardSize: 9;
  toPlay: "black" | "white";
  initialStones: Array<{ x: number; y: number; color: "black" | "white" }>;
  attemptedMove: { x: number; y: number };
  authoredAnswer: { x: number; y: number };
  category: "capture" | "escape" | "connect_cut" | "life_death" | "opening" | "endgame" | "mixed";
};

export type MoveInfo = {
  x: number;
  y: number;
  visits?: number;
  scoreLead?: number;
  winrate?: number;
};

export type EngineReviewSignal = {
  source: "katago";
  topMoves: MoveInfo[];
  authoredAnswerRank: number | null;
  attemptedMoveRank: number | null;
  agreesWithAuthoredAnswer: boolean;
  confidence: "low" | "medium" | "high";
  warnings: string[];
};

export type EngineAvailability = {
  enabled: boolean;
  available: boolean;
  reason?: EngineAvailabilityReason;
};

export function getEngineAvailability(
  config: EngineConfig,
  existsSync?: (path: string) => boolean,
): EngineAvailability {
  const result = checkEngineAvailability(config, existsSync);
  return {
    enabled: config.enabled,
    available: result.available,
    reason: result.reason,
  };
}

export function buildAnalysisArgs(
  config: EngineConfig,
  input: EngineReviewInput,
): string[] {
  const stonesArg = input.initialStones
    .map((s) => `${s.x},${s.y},${s.color === "black" ? "B" : "W"}`)
    .join(",");

  const args: string[] = [
    "analysis",
    "-model", config.modelPath,
    "-config", config.configPath || "default_gtp.cfg",
    "-analysis-write-jsonl",
    "-override", `boardXSize=${input.boardSize}`,
    "-override", `boardYSize=${input.boardSize}`,
    "-override", `analysisPVLen=0`,
  ];

  if (input.initialStones.length > 0) {
    args.push("-override", `initialStones=${stonesArg}`);
  }

  args.push("-override", `playouts=${config.visits}`);

  return args;
}

function extractRankFromMoves(
  moves: MoveInfo[],
  target: { x: number; y: number },
): number | null {
  const idx = moves.findIndex((m) => m.x === target.x && m.y === target.y);
  return idx >= 0 ? idx + 1 : null;
}

function parseAnalysisOutput(raw: string): {
  moveInfos: MoveInfo[];
} | null {
  try {
    const lines = raw.trim().split("\n");
    for (const line of lines) {
      const parsed = JSON.parse(line);
      if (parsed && parsed.moveInfos && Array.isArray(parsed.moveInfos)) {
        const moveInfos: MoveInfo[] = parsed.moveInfos.map((m: Record<string, unknown>) => {
          const move = m.move as [number, number] | undefined;
          return {
            x: Number(move?.[0] ?? -1),
            y: Number(move?.[1] ?? -1),
            visits: typeof m.visits === "number" ? m.visits : undefined,
            scoreLead: typeof m.scoreLead === "number" ? m.scoreLead : undefined,
            winrate: typeof m.winrate === "number" ? m.winrate : undefined,
          };
        });
        return { moveInfos };
      }
    }
    return null;
  } catch {
    return null;
  }
}

function determineConfidence(
  topMoves: MoveInfo[],
): "low" | "medium" | "high" {
  if (topMoves.length === 0) return "low";
  const topVisits = topMoves[0]?.visits ?? 0;
  if (topVisits >= 200) return "high";
  if (topVisits >= 50) return "medium";
  return "low";
}

/**
 * Runs KataGo analysis on a wrong-move problem and returns an
 * EngineReviewSignal on success, or null for any expected failure:
 * disabled, missing binary/model, timeout, non-zero exit,
 * malformed output, or any other error.
 *
 * Callers should treat null as "engine unavailable" and fall back
 * to the rule/template coach without disrupting the learning flow.
 */
export async function analyzeWrongMove(
  input: EngineReviewInput,
  config: EngineConfig,
  execFileFn?: (
    command: string,
    args: string[],
    options: { timeout: number },
  ) => Promise<{ stdout: string; stderr: string }>,
  existsSync?: (path: string) => boolean,
): Promise<EngineReviewSignal | null> {
  const availability = getEngineAvailability(config, existsSync);
  if (!availability.available) {
    return null;
  }

  const args = buildAnalysisArgs(config, input);
  const execFile = execFileFn || defaultExecFile;

  try {
    const result = await execFile(config.binPath, args, {
      timeout: config.timeoutMs,
    });

    const parsed = parseAnalysisOutput(result.stdout);
    if (!parsed) {
      return null;
    }

    const authoredAnswerRank = extractRankFromMoves(parsed.moveInfos, input.authoredAnswer);
    const attemptedMoveRank = extractRankFromMoves(parsed.moveInfos, input.attemptedMove);
    const agreesWithAuthoredAnswer = authoredAnswerRank === 1;

    const signal: EngineReviewSignal = {
      source: "katago",
      topMoves: parsed.moveInfos,
      authoredAnswerRank,
      attemptedMoveRank,
      agreesWithAuthoredAnswer,
      confidence: determineConfidence(parsed.moveInfos),
      warnings: [],
    };

    return signal;
  } catch {
    return null;
  }
}

async function defaultExecFile(
  command: string,
  args: string[],
  options: { timeout: number },
): Promise<{ stdout: string; stderr: string }> {
  const { execFile } = await import("child_process");
  return new Promise((resolve, reject) => {
    const child = execFile(command, args, { timeout: options.timeout }, (error, stdout, stderr) => {
      if (error) {
        if ((error as { killed?: boolean }).killed) {
          reject(new Error("process timed out"));
        } else {
          reject(error);
        }
        return;
      }
      resolve({ stdout, stderr });
    });
    if (options.timeout > 0) {
      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error("process timed out"));
      }, options.timeout);
      child.on("close", () => clearTimeout(timer));
    }
  });
}
