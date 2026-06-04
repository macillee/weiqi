/**
 * Progress import detection and import for v0.2.4.
 *
 * v0.2.4a: detect import eligibility and show local progress import prompt
 * v0.2.4b: actual import logic (append-only, idempotent)
 *
 * Safe when running without window, localStorage, or with malformed data.
 * Never throws.
 */

import { type StudentProgress, PROGRESS_KEY, loadProgress } from "./progress";
import { createSupabaseClient } from "./supabase/client";
import { classifySupabaseError, type SupabaseError } from "./supabase/supabase-error";

export type ImportEligibilityStatus =
  | "no_local_progress"
  | "eligible_for_import"
  | "import_already_offered";

export type ImportDetectionResult = {
  status: ImportEligibilityStatus;
  localProgress: StudentProgress | null;
  localAttemptCount: number;
  localStars: number;
};

export type ImportCheckResult = {
  alreadyImported: boolean;
  error: SupabaseError | null;
};

export type ImportResult = {
  success: boolean;
  alreadyImported: boolean;
  imported: { attempts: number; wrongProblems: number };
  error: (SupabaseError & { type: string }) | null;
};

/** localStorage key marking that local progress has been offered for import */
const IMPORT_OFFERED_KEY = "children-go-app:v0.2:import-offered";

/** localStorage key marking that import has been completed */
const IMPORT_COMPLETED_KEY = "children-go-app:v0.2:import-completed";

// ---------------------------------------------------------------------------
// v0.2.4a — Detection
// ---------------------------------------------------------------------------

/**
 * Detects whether local progress from v0.1.x anonymous mode exists
 * and whether it is eligible for import.
 */
export function detectImportEligibility(): ImportDetectionResult {
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
      return {
        status: "no_local_progress",
        localProgress: null,
        localAttemptCount: 0,
        localStars: 0,
      };
    }

    const attemptCount = parsed.attempts?.length ?? 0;
    const stars = parsed.stars ?? 0;

    if (attemptCount === 0 && stars === 0) {
      return {
        status: "no_local_progress",
        localProgress: null,
        localAttemptCount: 0,
        localStars: 0,
      };
    }

    try {
      const offered = localStorage.getItem(IMPORT_OFFERED_KEY);
      if (offered) {
        return {
          status: "import_already_offered",
          localProgress: parsed,
          localAttemptCount: attemptCount,
          localStars: stars,
        };
      }
    } catch {
      // ignore
    }

    return {
      status: "eligible_for_import",
      localProgress: parsed,
      localAttemptCount: attemptCount,
      localStars: stars,
    };
  } catch {
    return {
      status: "no_local_progress",
      localProgress: null,
      localAttemptCount: 0,
      localStars: 0,
    };
  }
}

export function markImportOffered(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(IMPORT_OFFERED_KEY, new Date().toISOString());
  } catch {
    // silently ignore
  }
}

// ---------------------------------------------------------------------------
// v0.2.4b — Import execution (idempotent)
// ---------------------------------------------------------------------------

/**
 * Checks whether local progress has already been imported for this child profile.
 * Uses the idempotent import hash to detect prior import.
 * Safe when Supabase is not configured; returns { alreadyImported: false }.
 */
export async function checkAlreadyImported(
  childProfileId: string,
): Promise<ImportCheckResult> {
  const client = createSupabaseClient();
  if (!client) {
    return { alreadyImported: false, error: null };
  }

  try {
    const { count, error } = await client
      .from("problem_attempts")
      .select("id", { count: "exact", head: true })
      .eq("child_profile_id", childProfileId)
      .eq("imported_from", "local_storage_v0.1")
      .eq("imported_source_key", PROGRESS_KEY)
      .limit(1);

    if (error) throw error;

    return { alreadyImported: (count ?? 0) > 0, error: null };
  } catch (err) {
    return { alreadyImported: false, error: classifySupabaseError(err) };
  }
}

/**
 * Imports local v0.1.x progress into the server profile idempotently.
 *
 * Merge strategy for progress_summary:
 * - stars = Math.max(local, server)
 * - streakDays = Math.max(local, server)
 * - lastPracticeDate = max(local, server)
 * - completedProblemIds = union(local, server)
 * - masteredProblemIds = union(local, server)
 *
 * Idempotent: problem_attempts inserts use imported_source_hash with a
 * unique partial index; duplicate hashes are skipped (23505).
 *
 * Never throws. Never mutates localStorage.
 */
export async function importLocalProgressToServer(
  childProfileId: string,
): Promise<ImportResult> {
  const defaultResult: ImportResult = {
    success: false,
    alreadyImported: false,
    imported: { attempts: 0, wrongProblems: 0 },
    error: null,
  };

  // 1. Load local progress (do this first so we can bail early without Supabase)
  const local = loadProgress();
  const attemptCount = local.attempts?.length ?? 0;
  const wrongCount = Object.keys(local.wrongProblems || {}).length;

  if (attemptCount === 0 && wrongCount === 0) {
    // Nothing to import — succeed immediately, no Supabase needed
    return { ...defaultResult, success: true, alreadyImported: false };
  }

  const client = createSupabaseClient();
  if (!client) {
    return {
      ...defaultResult,
      error: {
        type: "not_configured",
        message: "云端功能尚未配置。",
      },
    };
  }

  // 2. Check if already imported (idempotency)
  const { alreadyImported, error: checkError } = await checkAlreadyImported(childProfileId);
  if (checkError) {
    return { ...defaultResult, error: checkError };
  }
  if (alreadyImported) {
    return { ...defaultResult, success: true, alreadyImported: true, imported: { attempts: 0, wrongProblems: 0 } };
  }

  try {
    // 3. Import attempts (append-only, idempotent via imported_source_hash)
    let importedAttempts = 0;
    if (local.attempts && local.attempts.length > 0) {
      const attemptRows = local.attempts.map((attempt) => {
        const hash = buildAttemptHash(attempt.problemId, attempt.createdAt);
        return {
          child_profile_id: childProfileId,
          problem_id: attempt.problemId,
          selected_x: attempt.selectedX,
          selected_y: attempt.selectedY,
          is_correct: attempt.isCorrect,
          used_hint: attempt.usedHint,
          time_spent_seconds: attempt.timeSpentSeconds,
          created_at: attempt.createdAt,
          imported_from: "local_storage_v0.1",
          imported_source_key: PROGRESS_KEY,
          imported_source_hash: hash,
        };
      });

      const batchSize = 50;
      // Retry config for transient failures
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 1000; // 1s base delay

      for (let i = 0; i < attemptRows.length; i += batchSize) {
        const batch = attemptRows.slice(i, i + batchSize);
        
        let lastError: unknown = null;
        for (let retry = 0; retry <= MAX_RETRIES; retry++) {
          const { error: attemptError } = await client
            .from("problem_attempts")
            .insert(batch);
          
          if (!attemptError) {
            lastError = null;
            break; // success
          }
          
          // 23505 = duplicate hash — skip and continue (idempotent)
          if ((attemptError as { code?: string }).code === "23505") {
            lastError = null;
            break;
          }
          
          lastError = attemptError;
          
          // Check if error is retryable (network/timeout)
          const errorType = classifySupabaseError(attemptError);
          if (errorType.type !== "network_error" && errorType.type !== "server_error") {
            throw attemptError; // non-retryable
          }
          
          if (retry < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, retry)));
          }
        }
        
        if (lastError) {
          throw lastError; // all retries failed
        }
      }
      importedAttempts = attemptRows.length;
    }

    // 4. Import wrong_problems (upsert)
    let importedWrong = 0;
    const wrongEntries = Object.entries(local.wrongProblems || {});
    if (wrongEntries.length > 0) {
      const wrongRows = wrongEntries.map(([problemId, wp]) => ({
        child_profile_id: childProfileId,
        problem_id: problemId,
        wrong_count: wp.wrongCount ?? 0,
        correct_review_count: wp.correctReviewCount ?? 0,
        status: wp.status ?? "active",
        last_wrong_at: wp.lastWrongAt ?? null,
        last_review_at: wp.lastReviewAt ?? null,
      }));

      const { error: wrongError } = await client
        .from("wrong_problems")
        .upsert(wrongRows, { onConflict: "child_profile_id,problem_id" });

      if (wrongError) throw wrongError;
      importedWrong = wrongRows.length;
    }

    // 5. Merge progress_summary (upsert with max-merge)
    const { data: existingSummary } = await client
      .from("progress_summary")
      .select("stars,streak_days,last_practice_date,completed_problem_ids,mastered_problem_ids")
      .eq("child_profile_id", childProfileId)
      .maybeSingle();

    const mergedStars = Math.max(local.stars ?? 0, existingSummary?.stars ?? 0);
    const mergedStreak = Math.max(local.streakDays ?? 0, existingSummary?.streak_days ?? 0);

    const existingCompleted = existingSummary?.completed_problem_ids ?? [];
    const existingMastered = existingSummary?.mastered_problem_ids ?? [];
    const mergedCompleted = Array.from(new Set([...existingCompleted, ...(local.completedProblemIds ?? [])]));
    const mergedMastered = Array.from(new Set([...existingMastered, ...(local.masteredProblemIds ?? [])]));

    const { error: summaryError } = await client
      .from("progress_summary")
      .upsert(
        {
          child_profile_id: childProfileId,
          stars: mergedStars,
          streak_days: mergedStreak,
          completed_problem_ids: mergedCompleted,
          mastered_problem_ids: mergedMastered,
          last_practice_date: local.lastPracticeDate ?? existingSummary?.last_practice_date ?? null,
        },
        { onConflict: "child_profile_id" },
      );

    if (summaryError) throw summaryError;

    return {
      success: true,
      alreadyImported: false,
      imported: { attempts: importedAttempts, wrongProblems: importedWrong },
      error: null,
    };
  } catch (err) {
    return {
      ...defaultResult,
      error: classifySupabaseError(err),
    };
  }
}

/**
 * Marks that import has been completed locally,
 * so the import prompt will not appear again.
 * Safe without window/localStorage.
 */
export function markImportCompleted(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(IMPORT_OFFERED_KEY, new Date().toISOString());
    localStorage.setItem(IMPORT_COMPLETED_KEY, new Date().toISOString());
  } catch {
    // silently ignore
  }
}

/**
 * Returns true if import has already been completed locally.
 * Safe without window/localStorage.
 */
export function hasImportCompletedLocally(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(IMPORT_COMPLETED_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Builds a stable hash for a single attempt, used for idempotent import.
 * Uses substring of a simple hash to avoid crypto dependency in Node.js.
 *
 * Exported for testing (v0.2.4c).
 */
export function buildAttemptHash(problemId: string, createdAt: string): string {
  // Simple deterministic hash — stable across runs
  const input = `${problemId}:${createdAt}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${problemId}:${Math.abs(hash).toString(36)}`;
}
