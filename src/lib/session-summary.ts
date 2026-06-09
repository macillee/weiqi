export type ProblemCategory =
  | "capture"
  | "escape"
  | "connect_cut"
  | "life_death"
  | "opening"
  | "endgame"
  | "mixed";

export type AttemptSummary = {
  problemId: string;
  category: ProblemCategory | "unknown";
  level: number;
  correct: boolean;
  attemptCount: number;
  hintUsed: boolean;
  multiStep: boolean;
};

export type LearningSessionSummaryInput = {
  sessionStartedAt?: string;
  sessionCompletedAt?: string;
  attempts: AttemptSummary[];
};

export type CategorySummary = {
  category: ProblemCategory | "unknown";
  attempted: number;
  correctFirstTry: number;
  retried: number;
  hintsUsed: number;
  multiStepAttempted: number;
  multiStepCompleted: number;
};

export type LevelSummary = {
  level: number;
  attempted: number;
  correctFirstTry: number;
  hintsUsed: number;
};

export type ProblemSummaryResult =
  | "correct-first-try"
  | "correct-after-retry"
  | "incomplete"
  | "unknown";

export type ProblemSummary = {
  problemId: string;
  category: ProblemCategory | "unknown";
  level: number;
  result: ProblemSummaryResult;
  hintsUsed: number;
  multiStep: boolean;
};

export type SignalQuality = "complete" | "partial" | "empty";

export type ParentSessionSummary = {
  sessionId: string;
  reviewedAt: string;
  signalQuality: SignalQuality;
  totalAttempted: number;
  totalCorrectFirstTry: number;
  totalRetried: number;
  totalHintsUsed: number;
  multiStepAttempted: number;
  multiStepCompleted: number;
  categories: CategorySummary[];
  levels: LevelSummary[];
  problems: ProblemSummary[];
  strengths: string[];
  shakyConcepts: string[];
  suggestedNextFocus: string[];
  parentNote: string;
  warnings: string[];
};

function generateSessionId(
  attempts: AttemptSummary[],
  startedAt?: string,
): string {
  if (attempts.length === 0) return "session-empty";
  const ts = startedAt
    ? new Date(startedAt).getTime().toString(36)
    : attempts[0].problemId;
  return "session-" + ts;
}

function classifyResult(
  attempt: AttemptSummary,
): ProblemSummaryResult {
  if (attempt.attemptCount === 0) return "unknown";
  if (attempt.correct && attempt.attemptCount === 1) return "correct-first-try";
  if (attempt.correct && attempt.attemptCount > 1) return "correct-after-retry";
  if (!attempt.correct) return "incomplete";
  return "unknown";
}

function computeCategories(
  attempts: AttemptSummary[],
): CategorySummary[] {
  const map = new Map<string, AttemptSummary[]>();
  for (const a of attempts) {
    const cat = a.category;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(a);
  }
  const result: CategorySummary[] = [];
  for (const [cat, items] of map) {
    let correctFirstTry = 0;
    let retried = 0;
    let hintsUsed = 0;
    let multiStepAttempted = 0;
    let multiStepCompleted = 0;
    for (const a of items) {
      if (a.correct && a.attemptCount === 1) correctFirstTry++;
      if (a.attemptCount > 1) retried++;
      if (a.hintUsed) hintsUsed++;
      if (a.multiStep) {
        multiStepAttempted++;
        if (a.correct) multiStepCompleted++;
      }
    }
    result.push({
      category: cat as ProblemCategory | "unknown",
      attempted: items.length,
      correctFirstTry,
      retried,
      hintsUsed,
      multiStepAttempted,
      multiStepCompleted,
    });
  }
  result.sort((a, b) => b.attempted - a.attempted);
  return result;
}

function computeLevels(
  attempts: AttemptSummary[],
): LevelSummary[] {
  const map = new Map<number, AttemptSummary[]>();
  for (const a of attempts) {
    if (!map.has(a.level)) map.set(a.level, []);
    map.get(a.level)!.push(a);
  }
  const result: LevelSummary[] = [];
  for (const [level, items] of map) {
    let correctFirstTry = 0;
    let hintsUsed = 0;
    for (const a of items) {
      if (a.correct && a.attemptCount === 1) correctFirstTry++;
      if (a.hintUsed) hintsUsed++;
    }
    result.push({
      level,
      attempted: items.length,
      correctFirstTry,
      hintsUsed,
    });
  }
  result.sort((a, b) => a.level - b.level);
  return result;
}

function computeProblems(
  attempts: AttemptSummary[],
): ProblemSummary[] {
  const map = new Map<string, AttemptSummary>();
  for (const a of attempts) {
    const existing = map.get(a.problemId);
    if (!existing || a.attemptCount >= existing.attemptCount) {
      map.set(a.problemId, a);
    }
  }
  const result: ProblemSummary[] = [];
  for (const a of map.values()) {
    result.push({
      problemId: a.problemId,
      category: a.category,
      level: a.level,
      result: classifyResult(a),
      hintsUsed: a.hintUsed ? 1 : 0,
      multiStep: a.multiStep,
    });
  }
  return result;
}

function detectStrengths(
  categories: CategorySummary[],
  totalAttempted: number,
  totalCorrectFirstTry: number,
  multiStepAttempted: number,
  multiStepCompleted: number,
): string[] {
  const result: string[] = [];
  for (const c of categories) {
    if (c.correctFirstTry >= 2) {
      const rate = c.correctFirstTry / c.attempted;
      if (rate >= 0.6) {
        result.push(`${c.category} 表现不错`);
      }
    }
  }
  if (multiStepAttempted >= 2 && multiStepCompleted / multiStepAttempted >= 0.5) {
    result.push("多步题完成得很好");
  }
  if (totalAttempted >= 5 && totalCorrectFirstTry / totalAttempted >= 0.7) {
    result.push("今天整体表现稳定");
  }
  return result;
}

function detectShakyConcepts(
  categories: CategorySummary[],
  multiStepAttempted: number,
  multiStepCompleted: number,
  totalHintsUsed: number,
): string[] {
  const result: string[] = [];
  for (const c of categories) {
    if (c.attempted >= 2) {
      const firstTryRate = c.correctFirstTry / c.attempted;
      if (firstTryRate <= 0.4) {
        result.push(`${c.category} 需要再练`);
      }
    }
    if (c.retried >= 3) {
      result.push(`${c.category} 还需要多练习`);
    }
  }
  if (multiStepAttempted >= 2 && multiStepCompleted < 2 && totalHintsUsed > 0) {
    result.push("多步题还需要再想想");
  }
  return result;
}

function suggestNextFocus(
  categories: CategorySummary[],
  multiStepAttempted: number,
  multiStepCompleted: number,
  allCategories: string[],
  totalAttempted: number,
): string[] {
  const result: string[] = [];
  if (totalAttempted === 0) return result;

  const shaky = categories
    .filter((c) => c.attempted >= 2)
    .sort((a, b) => (a.correctFirstTry / a.attempted) - (b.correctFirstTry / b.attempted));

  if (shaky.length > 0 && shaky[0].correctFirstTry / shaky[0].attempted < 0.6) {
    const worst = shaky.slice(0, 2);
    for (const c of worst) {
      result.push(`建议明天多练${c.category}的题目`);
    }
  } else if (
    multiStepAttempted >= 2 &&
    multiStepCompleted / multiStepAttempted < 0.5
  ) {
    result.push("建议明天多练几道多步题");
  } else if (totalAttempted >= 5) {
    result.push("建议明天尝试不同类别的题目");
  }

  const practiced = new Set(categories.map((c) => c.category));
  const unpracticed = allCategories.filter((c) => !practiced.has(c as ProblemCategory));
  if (unpracticed.length > 0 && totalAttempted >= 3) {
    result.push(`明天可以试试${unpracticed[0]}的题目`);
  }

  return result;
}

function generateParentNote(
  params: {
    totalAttempted: number;
    totalCorrectFirstTry: number;
    strengths: string[];
    shakyConcepts: string[];
    suggestedNextFocus: string[];
    multiStepAttempted: number;
    multiStepCompleted: number;
    totalHintsUsed: number;
    categoriesLength: number;
  },
): string {
  const {
    totalAttempted,
    totalCorrectFirstTry,
    strengths,
    shakyConcepts,
    suggestedNextFocus,
    multiStepAttempted,
    multiStepCompleted,
    totalHintsUsed,
    categoriesLength,
  } = params;

  if (totalAttempted === 0) {
    return "今天还没有练习记录，开始一局今日练习吧。";
  }

  const strengthText = strengths.length > 0 ? strengths.join("，") : "";
  const focusText = suggestedNextFocus.length > 0 ? suggestedNextFocus.join("，") : "";

  if (shakyConcepts.length > 0) {
    const shakyText = shakyConcepts.join("，");
    return `今天在${shakyText}方面还需要再练一练。完成了${totalAttempted}道题，明天可以多试试这些类型的题目。`;
  }

  if (totalHintsUsed > 0 && totalAttempted > 0) {
    const retrySuccess = totalAttempted - totalCorrectFirstTry;
    if (retrySuccess > 0) {
      return `今天遇到难题时会主动看提示，这是很好的学习习惯。完成了${totalAttempted}道题，${totalCorrectFirstTry}道一次做对。${focusText}`;
    }
  }

  if (
    multiStepAttempted >= 2 &&
    multiStepCompleted / multiStepAttempted < 0.5
  ) {
    return `多步题还需要再想想，慢慢来，多练几次就会越来越熟练。${focusText}`;
  }

  if (
    totalAttempted >= 5 &&
    totalCorrectFirstTry / totalAttempted >= 0.7
  ) {
    return `今天表现稳定！完成了${totalAttempted}道题，其中${totalCorrectFirstTry}道一次做对。${strengthText}。${focusText}`;
  }

  if (categoriesLength >= 4) {
    return `今天尝试了不同类别的题目，练习面很广！${strengthText}。${focusText}`;
  }

  return `今天完成了${totalAttempted}道题，${totalCorrectFirstTry}道一次做对。${strengthText}。${focusText}`;
}

export function summarizeLearningSession(
  input: LearningSessionSummaryInput,
): ParentSessionSummary {
  const warnings: string[] = [];
  const attempts = input.attempts || [];

  const determinedAt = input.sessionCompletedAt ?? input.sessionStartedAt ?? "unknown";

  if (attempts.length === 0) {
    return {
      sessionId: generateSessionId([], input.sessionStartedAt),
      reviewedAt: determinedAt,
      signalQuality: "empty",
      totalAttempted: 0,
      totalCorrectFirstTry: 0,
      totalRetried: 0,
      totalHintsUsed: 0,
      multiStepAttempted: 0,
      multiStepCompleted: 0,
      categories: [],
      levels: [],
      problems: [],
      strengths: [],
      shakyConcepts: [],
      suggestedNextFocus: [],
      parentNote: "今天还没有练习记录，开始一局今日练习吧。",
      warnings: ["本次没有练习记录，数据为空。"],
    };
  }

  const signalQuality: SignalQuality = attempts.length > 0 ? "complete" : "partial";

  const uniqueProblemIds = new Set(attempts.map((a) => a.problemId));
  const totalAttempted = uniqueProblemIds.size;

  let totalCorrectFirstTry = 0;
  let totalRetried = 0;
  for (const pid of uniqueProblemIds) {
    const problemAttempts = attempts.filter((a) => a.problemId === pid);
    const isFirstCorrect = problemAttempts.some(
      (a) => a.correct && a.attemptCount === 1,
    );
    if (isFirstCorrect) totalCorrectFirstTry++;
    if (problemAttempts.length > 1 || problemAttempts.some((a) => a.attemptCount > 1)) {
      totalRetried++;
    }
  }

  const totalHintsUsed = attempts.filter((a) => a.hintUsed).length;
  const multiStepAttempted = attempts.filter((a) => a.multiStep).length;
  const multiStepCompleted = attempts.filter(
    (a) => a.multiStep && a.correct,
  ).length;

  const categories = computeCategories(attempts);
  const levels = computeLevels(attempts);
  const problems = computeProblems(attempts);

  const strengths = detectStrengths(
    categories,
    totalAttempted,
    totalCorrectFirstTry,
    multiStepAttempted,
    multiStepCompleted,
  );

  const shakyConcepts = detectShakyConcepts(
    categories,
    multiStepAttempted,
    multiStepCompleted,
    totalHintsUsed,
  );

  const allCategories: ProblemCategory[] = [
    "capture",
    "escape",
    "connect_cut",
    "life_death",
    "opening",
    "endgame",
    "mixed",
  ];

  const suggestedNextFocus = suggestNextFocus(
    categories,
    multiStepAttempted,
    multiStepCompleted,
    allCategories,
    totalAttempted,
  );

  const parentNote = generateParentNote({
    totalAttempted,
    totalCorrectFirstTry,
    strengths,
    shakyConcepts,
    suggestedNextFocus,
    multiStepAttempted,
    multiStepCompleted,
    totalHintsUsed,
    categoriesLength: categories.length,
  });

  if (attempts.length === 0) warnings.push("本次没有练习记录，数据为空。");
  if (attempts.length > 0 && attempts.length < 3) {
    warnings.push("数据较少，只作为参考。");
  }

  return {
    sessionId: generateSessionId(attempts, input.sessionStartedAt),
    reviewedAt: determinedAt,
    signalQuality,
    totalAttempted,
    totalCorrectFirstTry,
    totalRetried,
    totalHintsUsed,
    multiStepAttempted,
    multiStepCompleted,
    categories,
    levels,
    problems,
    strengths,
    shakyConcepts,
    suggestedNextFocus,
    parentNote,
    warnings,
  };
}
