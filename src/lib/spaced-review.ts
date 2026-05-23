import type { ReviewOutcome, ProblemReviewState } from "./progress";

export function classifyOutcome(
  correct: boolean,
  wrongAttempts: number,
  usedHint: boolean,
): ReviewOutcome {
  if (!correct) return "failed";
  if (wrongAttempts > 0) return "correct_with_wrong";
  if (usedHint) return "correct_with_hint";
  return "clean";
}

export function computeNextReview(
  outcome: ReviewOutcome,
  currentState: ProblemReviewState | null,
  now: Date,
): { nextReviewAt: string; intervalDays: number } {
  const today = dateString(now);

  switch (outcome) {
    case "failed":
      return { nextReviewAt: dateString(addDays(now, 1)), intervalDays: 1 };
    case "correct_with_wrong":
      return { nextReviewAt: dateString(addDays(now, 2)), intervalDays: 2 };
    case "correct_with_hint":
      return { nextReviewAt: dateString(addDays(now, 2)), intervalDays: 2 };
    case "clean": {
      if (!currentState || currentState.intervalDays <= 1) {
        return { nextReviewAt: dateString(addDays(now, 4)), intervalDays: 4 };
      }
      const newInterval = Math.min(currentState.intervalDays * 2, 30);
      return { nextReviewAt: dateString(addDays(now, newInterval)), intervalDays: newInterval };
    }
  }
}

export function updateReviewSchedule(
  schedule: Record<string, ProblemReviewState>,
  problemId: string,
  correct: boolean,
  wrongAttempts: number,
  usedHint: boolean,
  now?: Date,
): Record<string, ProblemReviewState> {
  const date = now ?? new Date();
  const outcome = classifyOutcome(correct, wrongAttempts, usedHint);
  const currentState = schedule[problemId] ?? null;
  const nextReview = computeNextReview(outcome, currentState, date);

  return {
    ...schedule,
    [problemId]: {
      problemId,
      nextReviewAt: nextReview.nextReviewAt,
      intervalDays: nextReview.intervalDays,
      lastResult: outcome,
      lastReviewAt: dateString(date),
    },
  };
}

export function getDueProblems(
  schedule: Record<string, ProblemReviewState>,
  now?: Date,
): ProblemReviewState[] {
  const date = now ?? new Date();
  const today = dateString(date);
  return Object.values(schedule).filter(
    (state) => state.nextReviewAt <= today,
  );
}

function dateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
