import type { StudentProgress, AttemptRecord } from "@/lib/progress";
import type { ProblemCategory } from "@/lib/problems";
import { loadProblems, getProblemById } from "@/lib/problems";
import type {
  AttemptSummary,
  LearningSessionSummaryInput,
  ParentSessionSummary,
  CategorySummary,
  LevelSummary,
  ProblemSummaryResult,
} from "@/lib/session-summary";

/* ───── Session attempt types ───── */

export type SessionAttemptInput = {
  problemId: string;
  isCorrect: boolean;
  usedHint: boolean;
  multiStep: boolean;
  timestamp?: string;
};

export type EnrichedAttempt = {
  problemId: string;
  category: ProblemCategory | "unknown";
  level: number;
  isCorrect: boolean;
  usedHint: boolean;
  attemptCount: number;
  multiStep: boolean;
  timestamp: string;
};

/* ───── Session lifecycle types ───── */

export type CurrentSessionState = {
  id: string;
  startedAt: string;
  attempts: EnrichedAttempt[];
  completed: boolean;
};

export type CompletedSession = {
  id: string;
  startedAt: string;
  completedAt: string;
  attempts: EnrichedAttempt[];
  totalAttempts: number;
  totalCorrect: number;
  totalHintUsed: number;
  categoryBreakdown: Record<string, { attempted: number; correct: number }>;
};

export type DailySummary = {
  date: string;
  sessions: CompletedSession[];
  totalAttempts: number;
  totalCorrect: number;
  totalHintUsed: number;
  categoryBreakdown: Record<string, { attempted: number; correct: number }>;
};

export type HistoricalSummary = {
  dailySummaries: DailySummary[];
  totalAttempts: number;
  totalCorrect: number;
  totalHintUsed: number;
};

/* ───── Contract validation types ───── */

export type ContractViolation = {
  type: string;
  message: string;
};

export type ContractValidationResult = {
  valid: boolean;
  violations: ContractViolation[];
};

/* ───── Privacy boundary types ───── */

export type ParentReviewSafeProblem = {
  category: ProblemCategory | "unknown";
  level: number;
  result: ProblemSummaryResult;
  hintsUsed: number;
  multiStep: boolean;
};

export type ParentReviewSafeSession = Omit<
  ParentSessionSummary,
  "problems"
> & {
  problems: ParentReviewSafeProblem[];
};

export type PrivacyViolation = {
  field: string;
  reason: string;
};

/* ───── Helpers ───── */

const FORBIDDEN_PARENT_FIELDS = [
  "selectedX",
  "selectedY",
  "x",
  "y",
  "stars",
  "streakDays",
  "achievements",
  "reviewSchedule",
  "timeSpentSeconds",
  "wrongProblems",
  "problemId",
  "boardState",
  "identity",
  "telemetry",
];

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `session-${ts}-${rand}`;
}

function toDateString(isoString: string): string {
  return isoString.slice(0, 10);
}

/* ───── Pure helpers ───── */

export function createEmptyProgress(): StudentProgress {
  return {
    stars: 0,
    streakDays: 0,
    completedProblemIds: [],
    masteredProblemIds: [],
    wrongProblems: {},
    attempts: [],
    achievements: [],
    reviewSchedule: {},
  };
}

export function enrichAttempt(
  attempt: SessionAttemptInput,
  count: number,
): EnrichedAttempt {
  const problem = getProblemById(attempt.problemId);
  return {
    problemId: attempt.problemId,
    category: problem?.category ?? "unknown",
    level: problem?.level ?? 1,
    isCorrect: attempt.isCorrect,
    usedHint: attempt.usedHint,
    attemptCount: count,
    multiStep: attempt.multiStep,
    timestamp: attempt.timestamp ?? new Date().toISOString(),
  };
}

export function startSession(): CurrentSessionState {
  return {
    id: generateId(),
    startedAt: new Date().toISOString(),
    attempts: [],
    completed: false,
  };
}

export function recordAttemptInSession(
  session: CurrentSessionState,
  attemptInput: SessionAttemptInput,
): CurrentSessionState {
  const sameProblem = session.attempts.filter(
    (a) => a.problemId === attemptInput.problemId,
  );
  const nextCount = sameProblem.length + 1;
  const enriched = enrichAttempt(attemptInput, nextCount);
  return {
    ...session,
    attempts: [...session.attempts, enriched],
  };
}

export function closeSession(session: CurrentSessionState): CompletedSession {
  const breakdown: Record<string, { attempted: number; correct: number }> = {};
  for (const a of session.attempts) {
    if (!breakdown[a.category]) {
      breakdown[a.category] = { attempted: 0, correct: 0 };
    }
    breakdown[a.category].attempted++;
    if (a.isCorrect) breakdown[a.category].correct++;
  }

  return {
    id: session.id,
    startedAt: session.startedAt,
    completedAt: new Date().toISOString(),
    attempts: [...session.attempts],
    totalAttempts: session.attempts.length,
    totalCorrect: session.attempts.filter((a) => a.isCorrect).length,
    totalHintUsed: session.attempts.filter((a) => a.usedHint).length,
    categoryBreakdown: breakdown,
  };
}

export function buildDailySummary(
  sessions: CompletedSession[],
  date: string,
): DailySummary {
  const breakdown: Record<string, { attempted: number; correct: number }> = {};
  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalHintUsed = 0;

  for (const s of sessions) {
    totalAttempts += s.totalAttempts;
    totalCorrect += s.totalCorrect;
    totalHintUsed += s.totalHintUsed;
    for (const [cat, b] of Object.entries(s.categoryBreakdown)) {
      if (!breakdown[cat]) breakdown[cat] = { attempted: 0, correct: 0 };
      breakdown[cat].attempted += b.attempted;
      breakdown[cat].correct += b.correct;
    }
  }

  return {
    date,
    sessions,
    totalAttempts,
    totalCorrect,
    totalHintUsed,
    categoryBreakdown: breakdown,
  };
}

export function buildHistoricalSummary(
  progress: StudentProgress,
): HistoricalSummary {
  const dayMap = new Map<string, AttemptRecord[]>();
  for (const a of progress.attempts) {
    const day = toDateString(a.createdAt);
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day)!.push(a);
  }

  const dailySummaries: DailySummary[] = [];
  const problems = loadProblems();
  const problemMap = new Map(problems.map((p) => [p.id, p]));

  for (const [date, dayAttempts] of dayMap) {
    const session = startSession();
    for (const a of dayAttempts) {
      const problem = problemMap.get(a.problemId);
      session.attempts.push({
        problemId: a.problemId,
        category: problem?.category ?? "unknown",
        level: problem?.level ?? 1,
        isCorrect: a.isCorrect,
        usedHint: a.usedHint,
        attemptCount:
          session.attempts.filter((ea) => ea.problemId === a.problemId).length +
          1,
        multiStep: (problem?.totalSteps ?? 1) > 1,
        timestamp: a.createdAt,
      });
    }
    const completed = closeSession(session);
    dailySummaries.push(buildDailySummary([completed], date));
  }

  dailySummaries.sort((a, b) => a.date.localeCompare(b.date));

  const totalAttempts = dailySummaries.reduce(
    (s, d) => s + d.totalAttempts,
    0,
  );
  const totalCorrect = dailySummaries.reduce(
    (s, d) => s + d.totalCorrect,
    0,
  );
  const totalHintUsed = dailySummaries.reduce(
    (s, d) => s + d.totalHintUsed,
    0,
  );

  return { dailySummaries, totalAttempts, totalCorrect, totalHintUsed };
}

/* ───── Contract validation ───── */

export function validateSessionContract(
  input: LearningSessionSummaryInput,
): ContractValidationResult {
  const violations: ContractViolation[] = [];

  if (!input.attempts || input.attempts.length === 0) {
    violations.push({
      type: "empty",
      message: "No attempts provided; session is empty.",
    });
    return { valid: false, violations };
  }

  const seenAttemptCounts = new Map<string, number>();
  for (const a of input.attempts) {
    const key = a.problemId;
    const expected = (seenAttemptCounts.get(key) ?? 0) + 1;
    if (a.attemptCount !== expected) {
      violations.push({
        type: "attempt-count",
        message: `Problem ${a.problemId}: expected attemptCount ${expected}, got ${a.attemptCount}.`,
      });
    }
    seenAttemptCounts.set(key, expected);
  }

  if (input.sessionStartedAt && input.sessionCompletedAt) {
    const start = new Date(input.sessionStartedAt).getTime();
    const end = new Date(input.sessionCompletedAt).getTime();
    if (end < start) {
      violations.push({
        type: "time-order",
        message: "sessionCompletedAt must be >= sessionStartedAt.",
      });
    }
  }

  for (const a of input.attempts) {
    if (!a.category) {
      violations.push({
        type: "missing-category",
        message: `Attempt ${a.problemId} has no category.`,
      });
    }
    if (a.level < 1 || a.level > 5) {
      violations.push({
        type: "invalid-level",
        message: `Attempt ${a.problemId} has invalid level ${a.level}. Must be 1-5.`,
      });
    }
  }

  return { valid: violations.length === 0, violations };
}

/* ───── Privacy boundary ───── */

export function toParentReviewSafeAggregate(
  summary: ParentSessionSummary,
): ParentReviewSafeSession {
  const safeProblems: ParentReviewSafeProblem[] = summary.problems.map(
    (p) => ({
      category: p.category,
      level: p.level,
      result: p.result,
      hintsUsed: p.hintsUsed,
      multiStep: p.multiStep,
    }),
  );

  const { problems: _removed, ...rest } = summary;
  return {
    ...rest,
    problems: safeProblems,
  };
}

export function checkPrivacyBoundary(
  data: Record<string, unknown>,
): PrivacyViolation[] {
  const violations: PrivacyViolation[] = [];
  const flatKeys = new Set<string>();

  function collectKeys(obj: unknown, prefix: string): void {
    if (obj === null || obj === undefined) return;
    if (typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      for (let i = 0; i < Math.min(obj.length, 5); i++) {
        collectKeys(obj[i], `${prefix}[${i}].`);
      }
      return;
    }
    const dict = obj as Record<string, unknown>;
    for (const key of Object.keys(dict)) {
      flatKeys.add(key);
      collectKeys(dict[key], `${prefix}${key}.`);
    }
  }

  collectKeys(data, "");

  for (const field of FORBIDDEN_PARENT_FIELDS) {
    if (flatKeys.has(field)) {
      violations.push({
        field,
        reason: `"${field}" must not appear in parent-review data.`,
      });
    }
  }

  return violations;
}
