import { loadProblems, type Problem } from "@/lib/problems";
import { getAllProblemIds } from "@/lib/chapters";
import type { StudentProgress } from "@/lib/progress";

const DAILY_PRACTICE_COUNT = 10;

const KNOWN_CATEGORIES = [
  "capture",
  "escape",
  "connect_cut",
  "life_death",
  "opening",
  "endgame",
] as const;

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function deriveMaxLevel(
  progress: StudentProgress | null | undefined,
  available: Problem[],
): number {
  if (!progress) return 5;
  const relevantIds = [
    ...new Set([
      ...(progress.completedProblemIds ?? []),
      ...(progress.masteredProblemIds ?? []),
    ]),
  ];
  if (relevantIds.length === 0) return 5;
  const done = available.filter((p) => relevantIds.includes(p.id));
  if (done.length === 0) return 5;
  return Math.max(...done.map((p) => p.level));
}

function hasUsableProgress(
  progress: StudentProgress | null | undefined,
  available: Problem[],
): boolean {
  if (progress == null) return false;
  const relevantIds = new Set([
    ...(progress.completedProblemIds ?? []),
    ...(progress.masteredProblemIds ?? []),
  ]);
  if (relevantIds.size === 0) return false;
  return available.some((p) => relevantIds.has(p.id));
}

function pickRandom(available: Problem[]): Problem[] {
  const shuffled = [...available];
  shuffle(shuffled);
  return shuffled.slice(0, DAILY_PRACTICE_COUNT);
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getPriorityProblems(
  progress: StudentProgress,
  candidates: Problem[],
  today: string,
): { problems: Problem[]; usedCats: Record<string, number> } {
  const candidateIds = new Set(candidates.map((p) => p.id));
  const problems: Problem[] = [];
  const usedCats: Record<string, number> = {};

  const dueEntries = Object.entries(progress.reviewSchedule).filter(
    ([id, state]) => state.nextReviewAt <= today && candidateIds.has(id),
  );
  shuffle(dueEntries);
  for (let i = 0; i < Math.min(dueEntries.length, 2); i++) {
    const p = candidates.find((c) => c.id === dueEntries[i][0]);
    if (p) {
      problems.push(p);
      if (p.category !== "mixed") {
        usedCats[p.category] = (usedCats[p.category] ?? 0) + 1;
      }
    }
  }

  const selectedIds = new Set(problems.map((p) => p.id));
  const wrongEntries = Object.entries(progress.wrongProblems).filter(
    ([id, state]) =>
      state.status !== "mastered" && candidateIds.has(id) && !selectedIds.has(id),
  );
  shuffle(wrongEntries);
  if (wrongEntries.length > 0) {
    const p = candidates.find((c) => c.id === wrongEntries[0][0]);
    if (p) {
      problems.push(p);
      if (p.category !== "mixed") {
        usedCats[p.category] = (usedCats[p.category] ?? 0) + 1;
      }
    }
  }

  return { problems, usedCats };
}

export function selectDailyProblems(
  progress?: StudentProgress | null,
  today?: string,
): Problem[] {
  const allProblems = loadProblems();
  const allIds = getAllProblemIds();
  const available = allProblems.filter((p) => allIds.includes(p.id));

  if (available.length <= DAILY_PRACTICE_COUNT) {
    return available;
  }

  if (!hasUsableProgress(progress, available)) {
    return pickRandom(available);
  }
  const usableProgress = progress as StudentProgress;

  const childMax = deriveMaxLevel(usableProgress, available);
  const maxAllowed = Math.max(childMax, 2);
  const levelFiltered = available.filter((p) => p.level <= maxAllowed);
  const candidates = levelFiltered.length >= DAILY_PRACTICE_COUNT
    ? levelFiltered
    : available;

  const now = today ?? todayString();
  const { problems: priority, usedCats } = getPriorityProblems(
    usableProgress,
    candidates,
    now,
  );
  const priorityIds = new Set(priority.map((p) => p.id));

  const byCat: Record<string, Problem[]> = {};
  const mixed: Problem[] = [];
  for (const p of candidates) {
    if (priorityIds.has(p.id)) continue;
    if (p.category === "mixed") {
      mixed.push(p);
    } else {
      if (!byCat[p.category]) byCat[p.category] = [];
      byCat[p.category].push(p);
    }
  }

  for (const arr of Object.values(byCat)) shuffle(arr);
  shuffle(mixed);

  const selected = [...priority];
  const countPerCat = { ...usedCats };
  const maxPerCat = 3;
  let moved = true;

  while (selected.length < DAILY_PRACTICE_COUNT && moved) {
    moved = false;
    for (const cat of KNOWN_CATEGORIES) {
      if (selected.length >= DAILY_PRACTICE_COUNT) break;
      const bucket = byCat[cat] ?? [];
      const used = countPerCat[cat] ?? 0;
      if (used < maxPerCat && bucket.length > 0) {
        selected.push(bucket.shift()!);
        countPerCat[cat] = used + 1;
        moved = true;
      }
    }

    if (selected.length < DAILY_PRACTICE_COUNT && mixed.length > 0) {
      selected.push(mixed.shift()!);
      moved = true;
    }
  }

  if (selected.length < DAILY_PRACTICE_COUNT) {
    const remaining = candidates.filter((p) => !selected.includes(p));
    shuffle(remaining);
    selected.push(...remaining.slice(0, DAILY_PRACTICE_COUNT - selected.length));
  }

  return selected;
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
