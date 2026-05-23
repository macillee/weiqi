import problemsData from "@/data/problems.json";
import type { Stone, StoneColor } from "@/lib/board";
import { getGroup, countLiberties } from "@/lib/board";

export type Point = {
  x: number;
  y: number;
};

export type ProblemCategory =
  | "capture"
  | "escape"
  | "connect_cut"
  | "life_death"
  | "opening"
  | "endgame"
  | "mixed";

export type ProblemStep = {
  /** Step number, 1-indexed */
  step: number;
  /** Stones to add relative to previous step (or initial position for step 1) */
  addedStones?: Stone[];
  /** Stones to remove relative to previous step */
  removedStones?: Stone[];
  /** Answers for this step */
  answers: Point[];
  /** Hints for this step */
  hints: string[];
  /** Explanation after this step */
  explanation: string;
  /** Success message for this step */
  successMessage: string;
  /** Failure message for this step */
  failureMessage: string;
  /** Wrong moves for this step (optional) */
  wrongMoves?: Array<{ x: number; y: number; message: string }>;
};

export type Problem = {
  id: string;
  boardSize: 9 | 13 | 19;
  category: ProblemCategory;
  level: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  toPlay: StoneColor;
  title: string;
  description: string;
  initialStones: Stone[];
  // v0.1 single-step fields (backward compatible)
  answers: Point[];
  hints: string[];
  explanation: string;
  successMessage: string;
  failureMessage: string;
  wrongMoves?: Array<{
    x: number;
    y: number;
    message: string;
  }>;
  // v0.3 multi-step extension (optional)
  steps?: ProblemStep[];
  /** Total number of steps (1 = single-move, default) */
  totalSteps?: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateProblem(problem: Problem): ValidationResult {
  const errors: string[] = [];

  if (!problem.id) {
    errors.push("Problem must have an id");
  }

  if (!problem.title) {
    errors.push(`Problem ${problem.id || "unknown"} must have a title`);
  }

  if (!problem.description) {
    errors.push(`Problem ${problem.id || "unknown"} must have a description`);
  }

  // Check if this is a multi-step problem
  const isMultiStep = problem.steps && problem.totalSteps && problem.totalSteps > 1;

  if (!isMultiStep) {
    // Single-step validation (backward compatible)
    if (!problem.answers || problem.answers.length === 0) {
      errors.push(`Problem ${problem.id} must have at least one answer`);
    }

    if (!problem.hints || problem.hints.length === 0) {
      errors.push(`Problem ${problem.id} must have at least one hint`);
    }
  } else {
    // Multi-step validation
    if (!problem.steps || problem.steps.length === 0) {
      errors.push(`Problem ${problem.id}: multi-step problem must have steps array`);
    } else {
      // Validate step ordering
      const stepNumbers = problem.steps.map((s) => s.step).sort((a, b) => a - b);
      for (let i = 0; i < stepNumbers.length; i++) {
        if (stepNumbers[i] !== i + 1) {
          errors.push(`Problem ${problem.id}: steps must be sequentially numbered starting from 1`);
          break;
        }
      }

      // Simulate board state across steps to validate deltas
      let currentStones: Stone[] = [...problem.initialStones];
      const boardSize = problem.boardSize;

      // Helper to check if a point has a stone
      const hasStone = (stones: Stone[], x: number, y: number, color?: StoneColor): boolean => {
        return stones.some((s) => s.x === x && s.y === y && (color === undefined || s.color === color));
      };

      // Helper to remove a stone from array
      const removeStone = (stones: Stone[], x: number, y: number): Stone[] => {
        return stones.filter((s) => !(s.x === x && s.y === y));
      };

      // Validate each step
      for (const step of problem.steps) {
        if (!step.answers || step.answers.length === 0) {
          errors.push(`Problem ${problem.id}: step ${step.step} must have at least one answer`);
        }

        if (!step.hints || step.hints.length === 0) {
          errors.push(`Problem ${problem.id}: step ${step.step} must have at least one hint`);
        }

        // Validate step answers are on-board
        if (step.answers) {
          for (const answer of step.answers) {
            if (answer.x < 0 || answer.x >= boardSize) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} answer at (${answer.x}, ${answer.y}) has invalid x coordinate`,
              );
            }
            if (answer.y < 0 || answer.y >= boardSize) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} answer at (${answer.x}, ${answer.y}) has invalid y coordinate`,
              );
            }
          }
        }

        // Validate addedStones: must not overlap with current board
        if (step.addedStones) {
          for (const stone of step.addedStones) {
            if (stone.x < 0 || stone.x >= boardSize) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} addedStone at (${stone.x}, ${stone.y}) has invalid x coordinate`,
              );
            }
            if (stone.y < 0 || stone.y >= boardSize) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} addedStone at (${stone.x}, ${stone.y}) has invalid y coordinate`,
              );
            }
            // Check for overlap with current board state
            if (hasStone(currentStones, stone.x, stone.y)) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} addedStone at (${stone.x}, ${stone.y}) overlaps with existing stone`,
              );
            }
            // Check for duplicate in addedStones
            const duplicateInAdded = step.addedStones.filter(
              (s) => s.x === stone.x && s.y === stone.y,
            ).length > 1;
            if (duplicateInAdded) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} has duplicate addedStone at (${stone.x}, ${stone.y})`,
              );
              break;
            }
          }
        }

        // Validate removedStones: must exist on current board
        if (step.removedStones) {
          for (const stone of step.removedStones) {
            if (stone.x < 0 || stone.x >= boardSize) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} removedStone at (${stone.x}, ${stone.y}) has invalid x coordinate`,
              );
            }
            if (stone.y < 0 || stone.y >= boardSize) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} removedStone at (${stone.x}, ${stone.y}) has invalid y coordinate`,
              );
            }
            // Check that stone exists on current board
            if (!hasStone(currentStones, stone.x, stone.y)) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} removedStone at (${stone.x}, ${stone.y}) does not exist on board`,
              );
            }
          }
        }

        // Apply deltas to simulate board state for next step
        if (step.addedStones) {
          for (const stone of step.addedStones) {
            if (!hasStone(currentStones, stone.x, stone.y)) {
              currentStones.push(stone);
            }
          }
        }
        if (step.removedStones) {
          for (const stone of step.removedStones) {
            currentStones = removeStone(currentStones, stone.x, stone.y);
          }
        }

        // Validate resulting board has no zero-liberty groups
        const checkedGroups = new Set<string>();
        for (const stone of currentStones) {
          const key = `${stone.x},${stone.y}`;
          if (checkedGroups.has(key)) continue;
          const group = getGroup(stone, currentStones, boardSize);
          const groupKey = group
            .map((s) => `${s.x},${s.y}`)
            .sort()
            .join("|");
          if (checkedGroups.has(groupKey)) continue;
          group.forEach((s) => checkedGroups.add(`${s.x},${s.y}`));
          checkedGroups.add(groupKey);

          const liberties = countLiberties(group, currentStones, boardSize);
          if (liberties === 0) {
            const stonesStr = group.map((s) => `(${s.x},${s.y})`).join(", ");
            errors.push(
              `Problem ${problem.id}: step ${step.step} results in zero-liberty group at ${stonesStr}`,
            );
          }
        }

        // Validate wrongMoves if present
        if (step.wrongMoves) {
          for (const wm of step.wrongMoves) {
            if (wm.x < 0 || wm.x >= problem.boardSize) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} wrongMove at (${wm.x}, ${wm.y}) has invalid x coordinate`,
              );
            }
            if (wm.y < 0 || wm.y >= problem.boardSize) {
              errors.push(
                `Problem ${problem.id}: step ${step.step} wrongMove at (${wm.x}, ${wm.y}) has invalid y coordinate`,
              );
            }
          }
        }
      }
    }
  }

  const boardSize = problem.boardSize;

  for (const stone of problem.initialStones) {
    if (stone.x < 0 || stone.x >= boardSize) {
      errors.push(
        `Problem ${problem.id}: stone at (${stone.x}, ${stone.y}) has invalid x coordinate`,
      );
    }
    if (stone.y < 0 || stone.y >= boardSize) {
      errors.push(
        `Problem ${problem.id}: stone at (${stone.x}, ${stone.y}) has invalid y coordinate`,
      );
    }
  }

  for (const answer of problem.answers) {
    if (answer.x < 0 || answer.x >= boardSize) {
      errors.push(
        `Problem ${problem.id}: answer at (${answer.x}, ${answer.y}) has invalid x coordinate`,
      );
    }
    if (answer.y < 0 || answer.y >= boardSize) {
      errors.push(
        `Problem ${problem.id}: answer at (${answer.x}, ${answer.y}) has invalid y coordinate`,
      );
    }
  }

  const stoneKeys = new Set<string>();
  for (const stone of problem.initialStones) {
    const key = `${stone.x},${stone.y}`;
    if (stoneKeys.has(key)) {
      errors.push(
        `Problem ${problem.id}: duplicate stone at (${stone.x}, ${stone.y})`,
      );
    }
    stoneKeys.add(key);
  }

  for (const answer of problem.answers) {
    const answerKey = `${answer.x},${answer.y}`;
    if (stoneKeys.has(answerKey)) {
      errors.push(
        `Problem ${problem.id}: answer at (${answer.x}, ${answer.y}) overlaps with an existing stone`,
      );
    }
  }

  const checkedGroups = new Set<string>();
  for (const stone of problem.initialStones) {
    const key = `${stone.x},${stone.y}`;
    if (checkedGroups.has(key)) continue;
    const group = getGroup(stone, problem.initialStones, boardSize);
    const groupKey = group
      .map((s) => `${s.x},${s.y}`)
      .sort()
      .join("|");
    if (checkedGroups.has(groupKey)) continue;
    group.forEach((s) => checkedGroups.add(`${s.x},${s.y}`));
    checkedGroups.add(groupKey);

    const liberties = countLiberties(group, problem.initialStones, boardSize);
    if (liberties === 0) {
      const stonesStr = group.map((s) => `(${s.x},${s.y})`).join(", ");
      errors.push(
        `Problem ${problem.id}: zero-liberty group at ${stonesStr}`,
      );
    }
  }

  const validCategories: ProblemCategory[] = [
    "capture",
    "escape",
    "connect_cut",
    "life_death",
    "opening",
    "endgame",
    "mixed",
  ];
  if (!validCategories.includes(problem.category)) {
    errors.push(`Problem ${problem.id}: invalid category "${problem.category}"`);
  }

  if (problem.level < 1 || problem.level > 5) {
    errors.push(`Problem ${problem.id}: level must be between 1 and 5`);
  }

  if (problem.wrongMoves) {
    for (const wm of problem.wrongMoves) {
      if (wm.x < 0 || wm.x >= boardSize) {
        errors.push(
          `Problem ${problem.id}: wrongMove at (${wm.x}, ${wm.y}) has invalid x coordinate`,
        );
      }
      if (wm.y < 0 || wm.y >= boardSize) {
        errors.push(
          `Problem ${problem.id}: wrongMove at (${wm.x}, ${wm.y}) has invalid y coordinate`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAllProblems(problems: Problem[]): ValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const problem of problems) {
    const result = validateProblem(problem);
    errors.push(...result.errors);

    if (ids.has(problem.id)) {
      errors.push(`Duplicate problem id: ${problem.id}`);
    }
    ids.add(problem.id);
  }

  return { valid: errors.length === 0, errors };
}

export function loadProblems(): Problem[] {
  const problems = problemsData as Problem[];
  const result = validateAllProblems(problems);
  if (!result.valid) {
    throw new Error(
      `Problem data validation failed:\n${result.errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
  return problems;
}

export function getProblemById(id: string): Problem | undefined {
  const problems = loadProblems();
  return problems.find((p) => p.id === id);
}

export function getProblemsByCategory(
  category: ProblemCategory,
): Problem[] {
  const problems = loadProblems();
  return problems.filter((p) => p.category === category);
}

export function getProblemsByLevel(level: number): Problem[] {
  const problems = loadProblems();
  return problems.filter((p) => p.level === level);
}
