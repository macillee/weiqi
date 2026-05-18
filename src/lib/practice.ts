import { loadProblems, type Problem } from "@/lib/problems";
import { getAllProblemIds } from "@/lib/chapters";

const DAILY_PRACTICE_COUNT = 10;

export function selectDailyProblems(): Problem[] {
  const allProblems = loadProblems();
  const allIds = getAllProblemIds();
  const availableProblems = allProblems.filter((p) =>
    allIds.includes(p.id),
  );

  if (availableProblems.length <= DAILY_PRACTICE_COUNT) {
    return availableProblems;
  }

  const shuffled = [...availableProblems].sort(
    () => Math.random() - 0.5,
  );
  return shuffled.slice(0, DAILY_PRACTICE_COUNT);
}

export type PracticeResult = {
  problemId: string;
  correct: boolean;
  wrongAttempts: number;
  usedHint: boolean;
};

export type PracticeSession = {
  problems: Problem[];
  currentIndex: number;
  results: PracticeResult[];
  completed: boolean;
};

export function createPracticeSession(problems: Problem[]): PracticeSession {
  return {
    problems,
    currentIndex: 0,
    results: [],
    completed: false,
  };
}

export function recordResult(
  session: PracticeSession,
  result: PracticeResult,
): PracticeSession {
  const newResults = [...session.results, result];

  return {
    ...session,
    results: newResults,
  };
}

export function advancePracticeSession(
  session: PracticeSession,
): PracticeSession {
  const nextIndex = session.currentIndex + 1;
  const completed = nextIndex >= session.problems.length;

  return {
    ...session,
    currentIndex: nextIndex,
    completed,
  };
}

export function getPracticeSummary(session: PracticeSession) {
  const total = session.results.length;
  const correct = session.results.filter((r) => r.correct).length;
  const wrong = total - correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const hintsUsed = session.results.filter((r) => r.usedHint).length;

  return {
    total,
    correct,
    wrong,
    accuracy,
    hintsUsed,
  };
}
