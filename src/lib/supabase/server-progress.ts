import { createSupabaseClient } from "./client";
import { classifySupabaseError, type SupabaseError } from "./supabase-error";

export type WrongProblemStatus = "active" | "reviewing" | "mastered";

export interface ServerWrongProblem {
  problemId: string;
  wrongCount: number;
  correctReviewCount: number;
  status: WrongProblemStatus;
  lastWrongAt: string | null;
  lastReviewAt: string | null;
}

export interface ServerProgressData {
  stars: number;
  streakDays: number;
  lastPracticeDate: string | null;
  completedProblemIds: string[];
  masteredProblemIds: string[];
  achievements: string[];
  wrongProblems: ServerWrongProblem[];
}

export interface ServerAttemptRecord {
  problemId: string;
  selectedX: number;
  selectedY: number;
  isCorrect: boolean;
  usedHint: boolean;
  timeSpentSeconds: number;
  createdAt: string;
}

export interface ServerReportData {
  attempts: ServerAttemptRecord[];
  wrongProblems: ServerWrongProblem[];
  totalStars: number;
  streakDays: number;
}

export interface ServerSyncResult {
  synced: boolean;
  error: SupabaseError | null;
  recoverable: boolean;
}

/**
 * Loads progress data from the server for a given child profile.
 *
 * Reads progress_summary and wrong_problems from Supabase.
 * Returns null if Supabase is not configured or if no data exists.
 * Never throws.
 */
export async function loadServerProgress(
  childProfileId: string,
): Promise<{ data: ServerProgressData | null; error: SupabaseError | null }> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      data: null,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  try {
    const [summaryRes, wrongRes] = await Promise.all([
      client
        .from("progress_summary")
        .select("*")
        .eq("child_profile_id", childProfileId)
        .single(),
      client
        .from("wrong_problems")
        .select("*")
        .eq("child_profile_id", childProfileId)
        .order("last_wrong_at", { ascending: false }),
    ]);

    if (summaryRes.error && (summaryRes.error as { code?: string }).code !== "PGRST116") {
      throw summaryRes.error;
    }

    if (wrongRes.error) {
      throw wrongRes.error;
    }

    const summary = summaryRes.data;
    const wrongRows = wrongRes.data || [];

    const data: ServerProgressData = {
      stars: summary?.stars ?? 0,
      streakDays: summary?.streak_days ?? 0,
      lastPracticeDate: summary?.last_practice_date ?? null,
      completedProblemIds: summary?.completed_problem_ids ?? [],
      masteredProblemIds: summary?.mastered_problem_ids ?? [],
      achievements: summary?.achievements ?? [],
      wrongProblems: wrongRows.map((row) => ({
        problemId: row.problem_id,
        wrongCount: row.wrong_count,
        correctReviewCount: row.correct_review_count,
        status: row.status as WrongProblemStatus,
        lastWrongAt: row.last_wrong_at ?? null,
        lastReviewAt: row.last_review_at ?? null,
      })),
    };

    return { data, error: null };
  } catch (err) {
    return { data: null, error: classifySupabaseError(err) };
  }
}

/**
 * Syncs an attempt to the server.
 *
 * Writes problem_attempts (append-only), upserts progress_summary,
 * and optionally upserts wrong_problems.
 *
 * Returns a structured result. Never throws.
 * Does not claim sync success unless all necessary writes succeed.
 */
export async function syncAttemptToServer(
  childProfileId: string,
  attempt: {
    problemId: string;
    selectedX: number;
    selectedY: number;
    isCorrect: boolean;
    usedHint: boolean;
    timeSpentSeconds: number;
  },
  progressUpdate: {
    stars: number;
    streakDays: number;
    lastPracticeDate: string | null;
    completedProblemIds: string[];
    masteredProblemIds: string[];
    achievements: string[];
  },
  wrongProblemUpdate: {
    problemId: string;
    wrongCount: number;
    correctReviewCount: number;
    status: WrongProblemStatus;
    lastWrongAt: string | null;
    lastReviewAt: string | null;
  } | null,
): Promise<ServerSyncResult> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      synced: false,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
      recoverable: false,
    };
  }

  try {
    const { error: attemptError } = await client
      .from("problem_attempts")
      .insert({
        child_profile_id: childProfileId,
        problem_id: attempt.problemId,
        selected_x: attempt.selectedX,
        selected_y: attempt.selectedY,
        is_correct: attempt.isCorrect,
        used_hint: attempt.usedHint,
        time_spent_seconds: attempt.timeSpentSeconds,
      });

    if (attemptError) throw attemptError;

    const { error: summaryError } = await client
      .from("progress_summary")
      .upsert(
        {
          child_profile_id: childProfileId,
          stars: progressUpdate.stars,
          streak_days: progressUpdate.streakDays,
          last_practice_date: progressUpdate.lastPracticeDate,
          completed_problem_ids: progressUpdate.completedProblemIds,
          mastered_problem_ids: progressUpdate.masteredProblemIds,
          achievements: progressUpdate.achievements,
        },
        { onConflict: "child_profile_id" },
      );

    if (summaryError) throw summaryError;

    if (wrongProblemUpdate) {
      const { error: wrongError } = await client
        .from("wrong_problems")
        .upsert(
          {
            child_profile_id: childProfileId,
            problem_id: wrongProblemUpdate.problemId,
            wrong_count: wrongProblemUpdate.wrongCount,
            correct_review_count: wrongProblemUpdate.correctReviewCount,
            status: wrongProblemUpdate.status,
            last_wrong_at: wrongProblemUpdate.lastWrongAt,
            last_review_at: wrongProblemUpdate.lastReviewAt,
          },
          { onConflict: "child_profile_id,problem_id" },
        );

      if (wrongError) throw wrongError;
    }

    return { synced: true, error: null, recoverable: false };
  } catch (err) {
    const classified = classifySupabaseError(err);
    return {
      synced: false,
      error: classified,
      recoverable:
        classified.type === "network_error" ||
        classified.type === "server_error",
    };
  }
}

/**
 * Loads report data from the server for a given child profile.
 *
 * Reads problem_attempts, wrong_problems, and progress_summary from Supabase.
 * Returns null if Supabase is not configured.
 * Never throws.
 */
export async function loadReportData(
  childProfileId: string,
): Promise<{ data: ServerReportData | null; error: SupabaseError | null }> {
  const client = createSupabaseClient();
  if (!client) {
    return {
      data: null,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  try {
    const [summaryRes, attemptsRes, wrongRes] = await Promise.all([
      client
        .from("progress_summary")
        .select("stars, streak_days")
        .eq("child_profile_id", childProfileId)
        .single(),
      client
        .from("problem_attempts")
        .select(
          "problem_id, selected_x, selected_y, is_correct, used_hint, time_spent_seconds, created_at",
        )
        .eq("child_profile_id", childProfileId)
        .order("created_at", { ascending: false })
        .limit(100),
      client
        .from("wrong_problems")
        .select("*")
        .eq("child_profile_id", childProfileId)
        .order("last_wrong_at", { ascending: false }),
    ]);

    if (summaryRes.error && (summaryRes.error as { code?: string }).code !== "PGRST116") {
      throw summaryRes.error;
    }

    if (attemptsRes.error) {
      throw attemptsRes.error;
    }

    if (wrongRes.error) {
      throw wrongRes.error;
    }

    const summary = summaryRes.data;
    const attemptRows = attemptsRes.data || [];
    const wrongRows = wrongRes.data || [];

    const data: ServerReportData = {
      attempts: attemptRows.map((row) => ({
        problemId: row.problem_id,
        selectedX: row.selected_x,
        selectedY: row.selected_y,
        isCorrect: row.is_correct,
        usedHint: row.used_hint,
        timeSpentSeconds: row.time_spent_seconds,
        createdAt: row.created_at,
      })),
      wrongProblems: wrongRows.map((row) => ({
        problemId: row.problem_id,
        wrongCount: row.wrong_count,
        correctReviewCount: row.correct_review_count,
        status: row.status as WrongProblemStatus,
        lastWrongAt: row.last_wrong_at ?? null,
        lastReviewAt: row.last_review_at ?? null,
      })),
      totalStars: summary?.stars ?? 0,
      streakDays: summary?.streak_days ?? 0,
    };

    return { data, error: null };
  } catch (err) {
    return { data: null, error: classifySupabaseError(err) };
  }
}
