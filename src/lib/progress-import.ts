/**
 * Progress import detection for v0.2.4a.
 *
 * Detects whether local progress exists from v0.1.x anonymous mode
 * and determines if an import prompt should be shown.
 *
 * Safe when running without window, localStorage, or with malformed data.
 * Never throws.
 */

import { type StudentProgress, PROGRESS_KEY } from "./progress";

// Re-export PROGRESS_KEY for use in detection without circular dependency
// We read progress.ts's PROGRESS_KEY via direct import.

export type ImportEligibilityStatus =
  | "no_local_progress"
  | "eligible_for_import"
  | "already_imported";

export type ImportDetectionResult = {
  status: ImportEligibilityStatus;
  localProgress: StudentProgress | null;
  localAttemptCount: number;
  localStars: number;
};

/** localStorage key marking that local progress has been offered for import */
const IMPORT_OFFERED_KEY = "children-go-app:v0.2:import-offered";

/**
 * Detects whether local progress from v0.1.x anonymous mode exists
 * and whether it is eligible for import.
 *
 * Returns:
 * - "no_local_progress" — no meaningful local data
 * - "eligible_for_import" — local data exists and import has not been offered yet
 * - "already_imported" — import was previously offered (user accepted or declined)
 *
 * Safe when running without window, without localStorage, or with
 * malformed localStorage data. Never throws.
 */
export function detectImportEligibility(): ImportDetectionResult {
  // No window/localStorage → no local progress to detect
  if (typeof window === "undefined") {
    return {
      status: "no_local_progress",
      localProgress: null,
      localAttemptCount: 0,
      localStars: 0,
    };
  }

  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return {
        status: "no_local_progress",
        localProgress: null,
        localAttemptCount: 0,
        localStars: 0,
      };
    }

    let parsed: StudentProgress;
    try {
      parsed = JSON.parse(raw) as StudentProgress;
    } catch {
      // Malformed localStorage data — treat as no progress
      return {
        status: "no_local_progress",
        localProgress: null,
        localAttemptCount: 0,
        localStars: 0,
      };
    }

    const attemptCount = parsed.attempts?.length ?? 0;
    const stars = parsed.stars ?? 0;

    // No meaningful progress if zero attempts and zero stars
    if (attemptCount === 0 && stars === 0) {
      return {
        status: "no_local_progress",
        localProgress: null,
        localAttemptCount: 0,
        localStars: 0,
      };
    }

    // Check if import has already been offered
    try {
      const offered = localStorage.getItem(IMPORT_OFFERED_KEY);
      if (offered) {
        return {
          status: "already_imported",
          localProgress: parsed,
          localAttemptCount: attemptCount,
          localStars: stars,
        };
      }
    } catch {
      // localStorage access failure for offered key — assume not offered
      // so the user gets a chance to see the prompt
    }

    return {
      status: "eligible_for_import",
      localProgress: parsed,
      localAttemptCount: attemptCount,
      localStars: stars,
    };
  } catch {
    // localStorage access failure — no local progress to detect
    return {
      status: "no_local_progress",
      localProgress: null,
      localAttemptCount: 0,
      localStars: 0,
    };
  }
}

/**
 * Marks that the import prompt has been shown to the user,
 * so it will not appear again in future sessions.
 *
 * Never throws. Safe without window/localStorage.
 */
export function markImportOffered(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(IMPORT_OFFERED_KEY, new Date().toISOString());
  } catch {
    // silently ignore
  }
}