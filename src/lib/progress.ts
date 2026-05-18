const PROGRESS_KEY = "children-go-app:v0.1:progress";

export type WrongProblemStatus = "active" | "reviewing" | "mastered";

export type WrongProblemState = {
  problemId: string;
  wrongCount: number;
  correctReviewCount: number;
  lastWrongAt: string;
  lastReviewAt?: string;
  status: WrongProblemStatus;
};

export type AttemptRecord = {
  problemId: string;
  selectedX: number;
  selectedY: number;
  isCorrect: boolean;
  usedHint: boolean;
  timeSpentSeconds: number;
  createdAt: string;
};

export type StudentProgress = {
  stars: number;
  streakDays: number;
  lastPracticeDate?: string;
  completedProblemIds: string[];
  masteredProblemIds: string[];
  wrongProblems: Record<string, WrongProblemState>;
  attempts: AttemptRecord[];
  achievements: string[];
};

function defaultProgress(): StudentProgress {
  return {
    stars: 0,
    streakDays: 0,
    lastPracticeDate: undefined,
    completedProblemIds: [],
    masteredProblemIds: [],
    wrongProblems: {},
    attempts: [],
    achievements: [],
  };
}

export function loadProgress(): StudentProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as StudentProgress;
    return {
      ...defaultProgress(),
      ...parsed,
      wrongProblems: parsed.wrongProblems || {},
      completedProblemIds: parsed.completedProblemIds || [],
      masteredProblemIds: parsed.masteredProblemIds || [],
      attempts: parsed.attempts || [],
      achievements: parsed.achievements || [],
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: StudentProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore storage errors
  }
}

export function recordAttempt(
  progress: StudentProgress,
  problemId: string,
  selectedX: number,
  selectedY: number,
  isCorrect: boolean,
  usedHint: boolean,
  timeSpentSeconds: number,
): { progress: StudentProgress; starsEarned: number } {
  const attempt: AttemptRecord = {
    problemId,
    selectedX,
    selectedY,
    isCorrect,
    usedHint,
    timeSpentSeconds,
    createdAt: new Date().toISOString(),
  };

  let starsEarned = 0;
  const isFirstCorrect =
    isCorrect && !progress.completedProblemIds.includes(problemId);

  if (isFirstCorrect) {
    starsEarned += 1;
    progress.completedProblemIds = [
      ...progress.completedProblemIds,
      problemId,
    ];
  }

  if (isCorrect) {
    progress.wrongProblems = updateWrongProblemOnCorrect(
      progress.wrongProblems,
      problemId,
    );
  } else {
    progress.wrongProblems = updateWrongProblemOnWrong(
      progress.wrongProblems,
      problemId,
    );
  }

  progress.attempts = [...progress.attempts, attempt];
  progress.stars += starsEarned;

  return { progress, starsEarned };
}

export function updateWrongProblemOnCorrect(
  wrongProblems: Record<string, WrongProblemState>,
  problemId: string,
): Record<string, WrongProblemState> {
  const existing = wrongProblems[problemId];
  if (!existing) return wrongProblems;
  if (existing.status === "mastered") return wrongProblems;

  const newCorrectCount = existing.correctReviewCount + 1;
  let newStatus: WrongProblemStatus = existing.status;

  if (existing.status === "active") {
    newStatus = "reviewing";
  } else if (existing.status === "reviewing" && newCorrectCount >= 2) {
    newStatus = "mastered";
  }

  return {
    ...wrongProblems,
    [problemId]: {
      ...existing,
      correctReviewCount: newCorrectCount,
      status: newStatus,
      lastReviewAt: new Date().toISOString(),
    },
  };
}

export function updateWrongProblemOnWrong(
  wrongProblems: Record<string, WrongProblemState>,
  problemId: string,
): Record<string, WrongProblemState> {
  const existing = wrongProblems[problemId];
  const now = new Date().toISOString();

  if (!existing) {
    return {
      ...wrongProblems,
      [problemId]: {
        problemId,
        wrongCount: 1,
        correctReviewCount: 0,
        lastWrongAt: now,
        status: "active",
      },
    };
  }

  if (existing.status === "mastered") {
    return {
      ...wrongProblems,
      [problemId]: {
        ...existing,
        wrongCount: existing.wrongCount + 1,
        correctReviewCount: 0,
        lastWrongAt: now,
        status: "active",
      },
    };
  }

  return {
    ...wrongProblems,
    [problemId]: {
      ...existing,
      wrongCount: existing.wrongCount + 1,
      lastWrongAt: now,
    },
  };
}

export function getActiveWrongProblems(
  wrongProblems: Record<string, WrongProblemState>,
): WrongProblemState[] {
  return Object.values(wrongProblems).filter(
    (wp) => wp.status !== "mastered",
  );
}

export function recordDailyPracticeComplete(
  progress: StudentProgress,
): { progress: StudentProgress; starsEarned: number } {
  let starsEarned = 5;
  const today = new Date().toISOString().slice(0, 10);

  if (progress.lastPracticeDate === today) {
    starsEarned = 0;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (progress.lastPracticeDate === yesterdayStr) {
      progress.streakDays += 1;
    } else {
      progress.streakDays = 1;
    }
    progress.lastPracticeDate = today;
  }

  progress.stars += starsEarned;
  return { progress, starsEarned };
}
