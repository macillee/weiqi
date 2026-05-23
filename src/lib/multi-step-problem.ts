import type { Problem, ProblemStep } from "@/lib/problems";
import type { Stone } from "@/lib/board";

/**
 * Check if a problem is multi-step
 */
export function isMultiStepProblem(problem: Problem): boolean {
  return !!(problem.steps && problem.totalSteps && problem.totalSteps > 1);
}

/**
 * Compute board stones for a given step
 * For step 1, returns initialStones
 * For step N > 1, applies all deltas from steps 1 to N-1
 */
export function computeBoardStonesForStep(
  problem: Problem,
  targetStep: number
): Stone[] {
  if (targetStep <= 1 || !problem.steps) {
    return [...problem.initialStones];
  }

  let stones = [...problem.initialStones];

  // Apply deltas from steps 1 to targetStep-1
  for (let i = 0; i < targetStep - 1 && i < problem.steps.length; i++) {
    const step = problem.steps[i];

    // Remove stones first
    if (step.removedStones) {
      stones = stones.filter(
        (s) => !step.removedStones!.some((r) => r.x === s.x && r.y === s.y)
      );
    }

    // Add stones
    if (step.addedStones) {
      for (const stone of step.addedStones) {
        if (!stones.some((s) => s.x === stone.x && s.y === stone.y)) {
          stones.push(stone);
        }
      }
    }
  }

  return stones;
}

/**
 * Get current step data
 */
export function getCurrentStepData(
  problem: Problem,
  currentStep: number
): ProblemStep | null {
  if (!problem.steps) return null;
  return problem.steps.find((s) => s.step === currentStep) || null;
}
