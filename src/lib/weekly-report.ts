import type { StudentProgress, ProblemReviewState } from "./progress";
import { getDueProblems } from "./spaced-review";

export type WeeklyReport = {
  weekStart: string;
  weekEnd: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  hintsUsed: number;
  completedProblemIds: string[];
  completionCount: number;
  activeWrongCount: number;
  masteredWrongCount: number;
  dueReviewCount: number;
  hasActivity: boolean;
};

export function getWeekRange(now: Date): { start: Date; end: Date } {
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function dateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isDateInRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

export function computeWeeklyReport(
  progress: StudentProgress,
  now?: Date,
): WeeklyReport {
  const date = now ?? new Date();
  const { start, end } = getWeekRange(date);

  const weekAttempts = progress.attempts.filter((a) =>
    isDateInRange(a.createdAt, start, end),
  );

  const totalAttempts = weekAttempts.length;
  const correctAttempts = weekAttempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
  const hintsUsed = weekAttempts.filter((a) => a.usedHint).length;

  const completedInWeek = new Set<string>();
  for (const a of weekAttempts) {
    if (a.isCorrect) {
      completedInWeek.add(a.problemId);
    }
  }

  const wrongStates = Object.values(progress.wrongProblems);
  const activeWrongCount = wrongStates.filter((w) => w.status !== "mastered").length;
  const masteredWrongCount = wrongStates.filter((w) => w.status === "mastered").length;

  const dueCount = getDueProblems(progress.reviewSchedule, date).length;

  return {
    weekStart: dateString(start),
    weekEnd: dateString(end),
    totalAttempts,
    correctAttempts,
    accuracy,
    hintsUsed,
    completedProblemIds: Array.from(completedInWeek),
    completionCount: completedInWeek.size,
    activeWrongCount,
    masteredWrongCount,
    dueReviewCount: dueCount,
    hasActivity: totalAttempts > 0 || wrongStates.length > 0,
  };
}
