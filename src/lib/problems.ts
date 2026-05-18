import problemsData from "@/data/problems.json";

export type StoneColor = "black" | "white";

export type Stone = {
  x: number;
  y: number;
  color: StoneColor;
};

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

  if (!problem.answers || problem.answers.length === 0) {
    errors.push(`Problem ${problem.id} must have at least one answer`);
  }

  if (!problem.hints || problem.hints.length === 0) {
    errors.push(`Problem ${problem.id} must have at least one hint`);
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
    console.error("Problem data validation errors:", result.errors);
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
