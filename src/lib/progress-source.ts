import {
  loadProgress,
  saveProgress,
  recordAttempt as recordLocalAttempt,
  recordDailyPracticeComplete as recordLocalDailyPractice,
  updateWrongProblemOnCorrect,
  updateWrongProblemOnWrong,
  getActiveWrongProblems,
  type StudentProgress,
  type WrongProblemState,
} from "./progress";
import { isSupabaseConfigured } from "./supabase/client";
import { getSelectedChildProfileId } from "./selected-child";
import {
  syncAttemptToServer,
  loadReportData,
  type ServerSyncResult,
  type ServerReportData,
  type WrongProblemStatus,
} from "./supabase/server-progress";

export type ProgressMode = "local" | "server";

export interface SyncResult {
  synced: boolean;
  error: string | null;
  recoverable: boolean;
}

/**
 * Determines the progress mode based on auth and child profile state.
 *
 * Server mode requires ALL of:
 * - Supabase configured
 * - Authenticated parent (session.user.id present)
 * - Selected child profile exists for that parent
 *
 * Otherwise returns "local".
 */
export function getProgressMode(
  parentUserId: string | null,
): ProgressMode {
  if (!isSupabaseConfigured()) return "local";
  if (!parentUserId) return "local";
  const childId = getSelectedChildProfileId(parentUserId);
  if (!childId) return "local";
  return "server";
}

/**
 * Records an attempt: always saves to localStorage first,
 * then syncs to server if in server mode.
 *
 * Never throws. Server failure does not block local save.
 * Never claims sync success unless server confirms.
 */
export async function recordAttemptWithSync(
  parentUserId: string | null,
  problemId: string,
  selectedX: number,
  selectedY: number,
  isCorrect: boolean,
  usedHint: boolean,
  timeSpentSeconds: number,
): Promise<{ progress: StudentProgress; sync: SyncResult; starsEarned: number }> {
  const progress = loadProgress();
  const localResult = recordLocalAttempt(
    progress,
    problemId,
    selectedX,
    selectedY,
    isCorrect,
    usedHint,
    timeSpentSeconds,
  );
  saveProgress(localResult.progress);

  const mode = getProgressMode(parentUserId);
  if (mode !== "server") {
    return { progress: localResult.progress, sync: { synced: false, error: null, recoverable: false }, starsEarned: localResult.starsEarned };
  }

  const childProfileId = getSelectedChildProfileId(parentUserId)!;
  const wrongState = localResult.progress.wrongProblems[problemId] ?? null;
  const wrongUpdate = wrongState
    ? {
        problemId: wrongState.problemId,
        wrongCount: wrongState.wrongCount,
        correctReviewCount: wrongState.correctReviewCount,
        status: wrongState.status,
        lastWrongAt: wrongState.lastWrongAt,
        lastReviewAt: wrongState.lastReviewAt ?? null,
      }
    : null;

  const serverResult = await syncAttemptToServer(
    childProfileId,
    { problemId, selectedX, selectedY, isCorrect, usedHint, timeSpentSeconds },
    {
      stars: localResult.progress.stars,
      streakDays: localResult.progress.streakDays,
      lastPracticeDate: localResult.progress.lastPracticeDate ?? null,
      completedProblemIds: localResult.progress.completedProblemIds,
      masteredProblemIds: localResult.progress.masteredProblemIds,
      achievements: localResult.progress.achievements,
    },
    wrongUpdate,
  );

  return {
    progress: localResult.progress,
    sync: {
      synced: serverResult.synced,
      error: serverResult.error?.message ?? null,
      recoverable: serverResult.recoverable,
    },
    starsEarned: localResult.starsEarned,
  };
}

/**
 * Records daily practice complete: always saves to localStorage first,
 * then syncs to server if in server mode.
 *
 * Never throws. Server failure does not block local save.
 */
export async function recordDailyPracticeCompleteWithSync(
  parentUserId: string | null,
): Promise<{ progress: StudentProgress; sync: SyncResult; starsEarned: number }> {
  const progress = loadProgress();
  const localResult = recordLocalDailyPractice(progress);
  saveProgress(localResult.progress);

  const mode = getProgressMode(parentUserId);
  if (mode !== "server") {
    return { progress: localResult.progress, sync: { synced: false, error: null, recoverable: false }, starsEarned: localResult.starsEarned };
  }

  const childProfileId = getSelectedChildProfileId(parentUserId)!;
  const serverResult = await syncAttemptToServer(
    childProfileId,
    {
      problemId: "__daily_practice_complete__",
      selectedX: -1,
      selectedY: -1,
      isCorrect: true,
      usedHint: false,
      timeSpentSeconds: 0,
    },
    {
      stars: localResult.progress.stars,
      streakDays: localResult.progress.streakDays,
      lastPracticeDate: localResult.progress.lastPracticeDate ?? null,
      completedProblemIds: localResult.progress.completedProblemIds,
      masteredProblemIds: localResult.progress.masteredProblemIds,
      achievements: localResult.progress.achievements,
    },
    null,
  );

  return {
    progress: localResult.progress,
    sync: {
      synced: serverResult.synced,
      error: serverResult.error?.message ?? null,
      recoverable: serverResult.recoverable,
    },
    starsEarned: localResult.starsEarned,
  };
}

/**
 * Updates wrong problem review state: always saves to localStorage first,
 * then syncs to server if in server mode.
 *
 * Handles both correct and incorrect review attempts.
 * Never throws. Server failure does not block local save.
 */
export async function updateWrongProblemReviewWithSync(
  parentUserId: string | null,
  problemId: string,
  isCorrect: boolean,
): Promise<{ progress: StudentProgress; sync: SyncResult }> {
  const progress = loadProgress();
  const wrongProblems = isCorrect
    ? updateWrongProblemOnCorrect(progress.wrongProblems, problemId)
    : updateWrongProblemOnWrong(progress.wrongProblems, problemId);

  const newProgress: StudentProgress = {
    ...progress,
    wrongProblems,
  };
  saveProgress(newProgress);

  const mode = getProgressMode(parentUserId);
  if (mode !== "server") {
    return { progress: newProgress, sync: { synced: false, error: null, recoverable: false } };
  }

  const childProfileId = getSelectedChildProfileId(parentUserId)!;
  const wrongState = wrongProblems[problemId] ?? null;
  const wrongUpdate = wrongState
    ? {
        problemId: wrongState.problemId,
        wrongCount: wrongState.wrongCount,
        correctReviewCount: wrongState.correctReviewCount,
        status: wrongState.status,
        lastWrongAt: wrongState.lastWrongAt,
        lastReviewAt: wrongState.lastReviewAt ?? null,
      }
    : null;

  const serverResult = await syncAttemptToServer(
    childProfileId,
    {
      problemId,
      selectedX: -1,
      selectedY: -1,
      isCorrect,
      usedHint: false,
      timeSpentSeconds: 0,
    },
    {
      stars: newProgress.stars,
      streakDays: newProgress.streakDays,
      lastPracticeDate: newProgress.lastPracticeDate ?? null,
      completedProblemIds: newProgress.completedProblemIds,
      masteredProblemIds: newProgress.masteredProblemIds,
      achievements: newProgress.achievements,
    },
    wrongUpdate,
  );

  return {
    progress: newProgress,
    sync: {
      synced: serverResult.synced,
      error: serverResult.error?.message ?? null,
      recoverable: serverResult.recoverable,
    },
  };
}

/**
 * Loads report data from the appropriate source.
 *
 * In server mode: tries to load from server first, falls back to local on failure.
 * In local mode: loads from localStorage via report.ts.
 *
 * Never throws.
 */
export async function loadReportWithSource(
  parentUserId: string | null,
): Promise<{ data: ServerReportData | null; error: string | null; fallbackToLocal: boolean }> {
  const mode = getProgressMode(parentUserId);
  if (mode !== "server") {
    return { data: null, error: null, fallbackToLocal: true };
  }

  const childProfileId = getSelectedChildProfileId(parentUserId)!;
  const result = await loadReportData(childProfileId);

  if (result.error) {
    return { data: null, error: result.error.message, fallbackToLocal: true };
  }

  return { data: result.data, error: null, fallbackToLocal: false };
}
