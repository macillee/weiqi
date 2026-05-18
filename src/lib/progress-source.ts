import { createSupabaseClient } from "./supabase/client";
import {
  classifySupabaseError,
  getSyncErrorMessage,
  isRecoverableError,
  type SupabaseError,
} from "./supabase/supabase-error";
import {
  loadProgress,
  saveProgress,
  type StudentProgress,
} from "./progress";

/**
 * Progress source abstraction.
 *
 * v0.2 supports two modes:
 * - "local": localStorage only (v0.1 behavior)
 * - "server": Supabase-backed with localStorage fallback
 *
 * The app should use this abstraction instead of directly
 * calling localStorage or Supabase. This ensures cloud-failure
 * tolerance: if the server is unavailable, local mode continues.
 */
export type ProgressMode = "local" | "server";

/**
 * Result of a server sync attempt.
 * Never claim success unless `synced` is true.
 */
export interface SyncResult {
  /** True only if the server write actually succeeded. */
  synced: boolean;
  /** Error details if sync failed. null if synced or local mode. */
  error: SupabaseError | null;
  /** Whether the error is recoverable by retrying. */
  recoverable: boolean;
}

/**
 * Returns the current progress mode.
 * "server" only if Supabase is configured AND user is signed in.
 */
export function getProgressMode(): ProgressMode {
  const client = createSupabaseClient();
  if (!client) return "local";
  // TODO: check auth session in v0.2.1b+
  // For v0.2.1a, always return local since no auth UI exists
  return "local";
}

/**
 * Saves an attempt to localStorage first, then attempts server sync.
 *
 * Cloud-failure tolerance:
 * - localStorage write always succeeds (or throws if storage full)
 * - Server failure does NOT block local save
 * - Returns SyncResult so caller can show appropriate message
 */
export async function recordAttempt(
  problemId: string,
  selectedX: number,
  selectedY: number,
  isCorrect: boolean,
  usedHint: boolean,
  timeSpentSeconds: number,
): Promise<SyncResult> {
  // 1. Always save to localStorage first
  const progress = loadProgress();
  progress.attempts.push({
    problemId,
    selectedX,
    selectedY,
    isCorrect,
    usedHint,
    timeSpentSeconds,
    createdAt: new Date().toISOString(),
  });
  saveProgress(progress);

  // 2. Try server sync (non-blocking)
  const client = createSupabaseClient();
  if (!client) {
    return { synced: false, error: null, recoverable: false };
  }

  try {
    const { error } = await client.from("problem_attempts").insert({
      problem_id: problemId,
      selected_x: selectedX,
      selected_y: selectedY,
      is_correct: isCorrect,
      used_hint: usedHint,
      time_spent_seconds: timeSpentSeconds,
    });

    if (error) throw error;

    return { synced: true, error: null, recoverable: false };
  } catch (err) {
    const classified = classifySupabaseError(err);
    return {
      synced: false,
      error: classified,
      recoverable: isRecoverableError(classified),
    };
  }
}

/**
 * Loads progress from the appropriate source.
 * In v0.2.1a, always returns localStorage progress.
 * Server loading will be added in v0.2.3.
 */
export function loadProgressFromSource(): StudentProgress {
  return loadProgress();
}
