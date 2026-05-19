import {
  loadProgress,
  saveProgress,
  recordAttempt as recordLocalAttempt,
  type StudentProgress,
} from "./progress";

/**
 * Progress source abstraction.
 *
 * v0.2.2 is local-only. All progress is stored in localStorage.
 * Server sync will be added in v0.2.3.
 */
export type ProgressMode = "local";

/**
 * Result of a sync attempt.
 * In v0.2.2 this is always local-only (synced: false, no error).
 */
export interface SyncResult {
  synced: boolean;
  error: null;
  recoverable: false;
}

/**
 * Returns the current progress mode.
 * v0.2.2 is always "local".
 */
export function getProgressMode(): ProgressMode {
  return "local";
}

/**
 * Saves an attempt to localStorage.
 *
 * v0.2.2: local-only. Server sync is deferred to v0.2.3.
 */
export function recordAttempt(
  progress: StudentProgress,
  problemId: string,
  selectedX: number,
  selectedY: number,
  isCorrect: boolean,
  usedHint: boolean,
  timeSpentSeconds: number,
): { progress: StudentProgress; sync: SyncResult; starsEarned: number } {
  const result = recordLocalAttempt(
    progress,
    problemId,
    selectedX,
    selectedY,
    isCorrect,
    usedHint,
    timeSpentSeconds,
  );
  saveProgress(result.progress);
  return { progress: result.progress, sync: { synced: false, error: null, recoverable: false }, starsEarned: result.starsEarned };
}

/**
 * Loads progress from localStorage.
 */
export function loadProgressFromSource(): StudentProgress {
  return loadProgress();
}
