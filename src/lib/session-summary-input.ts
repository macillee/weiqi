import type { StudentProgress } from "@/lib/progress";
import { loadProblems } from "@/lib/problems";
import type {
  AttemptSummary,
  LearningSessionSummaryInput,
} from "@/lib/session-summary";

export function buildSessionSummaryInput(
  progress: StudentProgress,
): LearningSessionSummaryInput {
  const problems = loadProblems();
  const problemMap = new Map(problems.map((p) => [p.id, p]));

  const attempts: AttemptSummary[] = [];
  const seenProblemAttempts = new Map<string, number>();

  for (const record of progress.attempts) {
    const problem = problemMap.get(record.problemId);
    const category = problem?.category ?? "unknown";
    const level = problem?.level ?? 1;
    const isMultiStep = (problem?.totalSteps ?? 1) > 1;

    const count = (seenProblemAttempts.get(record.problemId) ?? 0) + 1;
    seenProblemAttempts.set(record.problemId, count);

    attempts.push({
      problemId: record.problemId,
      category,
      level,
      correct: record.isCorrect,
      attemptCount: count,
      hintUsed: record.usedHint,
      multiStep: isMultiStep,
    });
  }

  const timestamps = progress.attempts
    .map((a) => a.createdAt)
    .filter((t): t is string => !!t)
    .sort();

  return {
    sessionStartedAt: timestamps[0],
    sessionCompletedAt: timestamps[timestamps.length - 1],
    attempts,
  };
}
