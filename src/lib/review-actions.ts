"use server";

import { parseEngineConfig } from "./engine-config";
import { analyzeWrongMove, type EngineReviewInput, type EngineReviewSignal } from "./engine-adapter";

export type EngineReviewRequest = {
  boardSize: number;
  initialStones: Array<{ x: number; y: number; color: "black" | "white" }>;
  attemptedMove: { x: number; y: number };
  authoredAnswer: { x: number; y: number };
  category: string;
};

export async function requestEngineReview(
  input: EngineReviewRequest,
): Promise<EngineReviewSignal | null> {
  const config = parseEngineConfig();

  if (!config.enabled) {
    return null;
  }

  const engineInput: EngineReviewInput = {
    boardSize: input.boardSize as 9,
    toPlay: "black",
    initialStones: input.initialStones,
    attemptedMove: input.attemptedMove,
    authoredAnswer: input.authoredAnswer,
    category: input.category as EngineReviewInput["category"],
  };

  return analyzeWrongMove(engineInput, config);
}
