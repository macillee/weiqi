import { loadProgress } from "@/lib/progress";
import { loadProblems } from "@/lib/problems";

export type CategoryStat = {
  category: string;
  label: string;
  completed: number;
  total: number;
  attempts: number;
  correctAttempts: number;
  accuracy: number;
  firstAttemptedProblems: number;
  firstTryCorrectProblems: number;
  firstTryAccuracy: number;
};

export type ReportStats = {
  uniqueAttemptedProblems: number;
  totalProblems: number;
  accuracy: number;
  firstTryAccuracy: number;
  wrongCount: number;
  streakDays: number;
  stars: number;
  categoryStats: CategoryStat[];
  strongestCategory: CategoryStat | null;
  weakestCategory: CategoryStat | null;
  hasProgress: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  capture: "吃子",
  escape: "逃跑",
  connect_cut: "连接与切断",
  life_death: "死活",
  opening: "布局",
  endgame: "官子",
  mixed: "综合",
};

export function computeReportStats(): ReportStats {
  const progress = loadProgress();
  const problems = loadProblems();
  const problemMap = new Map(problems.map((p) => [p.id, p]));

  const totalProblems = problems.length;

  // Unique attempted problems from attempts
  const attemptedProblemIds = new Set(progress.attempts.map((a) => a.problemId));
  const uniqueAttemptedProblems = attemptedProblemIds.size;

  // Overall accuracy
  const totalAttempts = progress.attempts.length;
  const correctAttempts = progress.attempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

  // First-try accuracy: for each problem, look at its FIRST attempt ever
  const firstAttemptMap = new Map<string, boolean>();
  for (const attempt of progress.attempts) {
    if (!firstAttemptMap.has(attempt.problemId)) {
      firstAttemptMap.set(attempt.problemId, attempt.isCorrect);
    }
  }
  const firstAttemptedCount = firstAttemptMap.size;
  const firstTryCorrectCount = Array.from(firstAttemptMap.values()).filter(
    (v) => v,
  ).length;
  const firstTryAccuracy =
    firstAttemptedCount > 0 ? firstTryCorrectCount / firstAttemptedCount : 0;

  // Wrong count (active + reviewing, not mastered)
  const wrongCount = Object.values(progress.wrongProblems).filter(
    (wp) => wp.status !== "mastered",
  ).length;

  // Category stats
  const categoryMap = new Map<string, CategoryStat>();
  for (const [cat, label] of Object.entries(CATEGORY_LABELS)) {
    const catProblems = problems.filter((p) => p.category === cat);
    categoryMap.set(cat, {
      category: cat,
      label,
      completed: 0,
      total: catProblems.length,
      attempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      firstAttemptedProblems: 0,
      firstTryCorrectProblems: 0,
      firstTryAccuracy: 0,
    });
  }

  // Count completed per category from attempts (unique problemIds)
  for (const problemId of attemptedProblemIds) {
    const problem = problemMap.get(problemId);
    if (!problem) continue;
    const stat = categoryMap.get(problem.category);
    if (stat) stat.completed += 1;
  }

  // Count attempts and correct attempts per category
  for (const attempt of progress.attempts) {
    const problem = problemMap.get(attempt.problemId);
    if (!problem) continue;
    const stat = categoryMap.get(problem.category);
    if (!stat) continue;
    stat.attempts += 1;
    if (attempt.isCorrect) stat.correctAttempts += 1;
  }

  // First-try per category
  for (const [problemId, isFirstCorrect] of firstAttemptMap.entries()) {
    const problem = problemMap.get(problemId);
    if (!problem) continue;
    const stat = categoryMap.get(problem.category);
    if (!stat) continue;
    stat.firstAttemptedProblems += 1;
    if (isFirstCorrect) stat.firstTryCorrectProblems += 1;
  }

  // Compute accuracy and firstTryAccuracy per category
  for (const stat of categoryMap.values()) {
    stat.accuracy = stat.attempts > 0 ? stat.correctAttempts / stat.attempts : 0;
    stat.firstTryAccuracy =
      stat.firstAttemptedProblems > 0
        ? stat.firstTryCorrectProblems / stat.firstAttemptedProblems
        : 0;
  }

  const categoryStats = Array.from(categoryMap.values()).filter(
    (s) => s.total > 0,
  );

  // Strongest/weakest based on firstTryAccuracy (fallback to accuracy)
  const activeCategories = categoryStats.filter(
    (s) => s.firstAttemptedProblems > 0,
  );

  let strongestCategory: CategoryStat | null = null;
  let weakestCategory: CategoryStat | null = null;

  if (activeCategories.length > 0) {
    strongestCategory = activeCategories.reduce((a, b) =>
      a.firstTryAccuracy >= b.firstTryAccuracy ? a : b,
    );
    weakestCategory = activeCategories.reduce((a, b) =>
      a.firstTryAccuracy <= b.firstTryAccuracy ? a : b,
    );
  }

  // Has progress if any attempts, wrong problems, or stars
  const hasProgress =
    totalAttempts > 0 || wrongCount > 0 || progress.stars > 0;

  return {
    uniqueAttemptedProblems,
    totalProblems,
    accuracy,
    firstTryAccuracy,
    wrongCount,
    streakDays: progress.streakDays,
    stars: progress.stars,
    categoryStats,
    strongestCategory,
    weakestCategory,
    hasProgress,
  };
}
