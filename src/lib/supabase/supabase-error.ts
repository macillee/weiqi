/**
 * Supabase error classification for cloud-failure tolerance.
 *
 * v0.2 must remain functional when Supabase Cloud is unavailable.
 * These error types help the app decide whether to fall back to
 * local mode or show a clear error message.
 */

export type SupabaseErrorType =
  /** Supabase env vars are missing — stay in local mode silently. */
  | "not_configured"
  /** Network request failed (DNS, timeout, offline). */
  | "network_error"
  /** Supabase Cloud returned an error (5xx, 429). */
  | "server_error"
  /** Auth session expired or invalid — user should sign in again. */
  | "auth_error"
  /** RLS policy denied access — unexpected, log for debugging. */
  | "permission_error"
  /** Unknown error — treat as network error for safety. */
  | "unknown";

export interface SupabaseError {
  type: SupabaseErrorType;
  message: string;
  /** Original error, if available. Do not display to users. */
  cause?: unknown;
}

/**
 * Classifies a Supabase error into a known type.
 * This allows the app to respond appropriately without
 * exposing technical details to the user.
 */
export function classifySupabaseError(error: unknown): SupabaseError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors: fetch failed, DNS resolution, timeout
    if (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("dns") ||
      message.includes("timeout") ||
      message.includes("offline")
    ) {
      return {
        type: "network_error",
        message: "网络连接失败，请检查网络后重试。",
        cause: error,
      };
    }

    // Server errors: 5xx, rate limiting
    if (
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("429")
    ) {
      return {
        type: "server_error",
        message: "服务器暂时不可用，请稍后重试。",
        cause: error,
      };
    }

    // Auth errors: session expired, invalid token
    if (
      message.includes("session") ||
      message.includes("token") ||
      message.includes("auth") ||
      message.includes("401")
    ) {
      return {
        type: "auth_error",
        message: "登录已过期，请重新登录。",
        cause: error,
      };
    }

    // Permission errors: RLS denied
    if (message.includes("403") || message.includes("permission")) {
      return {
        type: "permission_error",
        message: "权限不足，请联系管理员。",
        cause: error,
      };
    }
  }

  return {
    type: "unknown",
    message: "发生未知错误，请稍后重试。",
    cause: error,
  };
}

/**
 * User-friendly message for sync status.
 * Never claim success unless the server write actually succeeded.
 */
export function getSyncErrorMessage(error: SupabaseError): string {
  switch (error.type) {
    case "not_configured":
      return "云端功能尚未配置。";
    case "network_error":
      return "网络连接失败，进度已保存在本地，请稍后重试同步。";
    case "server_error":
      return "服务器暂时不可用，进度已保存在本地，请稍后重试同步。";
    case "auth_error":
      return "登录已过期，请重新登录后同步进度。";
    case "permission_error":
      return "权限不足，无法同步进度。";
    case "unknown":
      return "同步失败，进度已保存在本地，请稍后重试。";
  }
}

/**
 * Returns true if the error is recoverable by retrying.
 * Network and server errors are typically transient.
 */
export function isRecoverableError(error: SupabaseError): boolean {
  return error.type === "network_error" || error.type === "server_error";
}
