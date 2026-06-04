"use client";

import { useState, useEffect } from "react";
import {
  detectImportEligibility,
  markImportOffered,
  importLocalProgressToServer,
  markImportCompleted,
  hasImportCompletedLocally,
  type ImportDetectionResult,
} from "@/lib/progress-import";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth";
import { getSelectedChildProfileId } from "@/lib/selected-child";

type ImportUiState = "pending" | "importing" | "success" | "failure" | "already_imported";

/**
 * Shows a prompt when an authenticated parent with a selected child profile
 * has existing local progress from v0.1.x anonymous mode.
 *
 * v0.2.4a: detection + dismiss only
 * v0.2.4b: full import interaction (import / retry / dismiss)
 */
export default function ImportPromptBanner() {
  const [detection, setDetection] = useState<ImportDetectionResult | null>(null);
  const [uiState, setUiState] = useState<ImportUiState>("pending");
  const [dismissed, setDismissed] = useState(false);
  const [importResult, setImportResult] = useState<{ attempts: number; wrongProblems: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const { session } = useSupabaseAuth();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (!session?.user?.id) return;
    const childId = getSelectedChildProfileId(session.user.id);
    if (!childId) return;

    // If already completed locally, don't show
    if (hasImportCompletedLocally()) return;

    const result = detectImportEligibility();
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage init must happen client-side */
    setDetection(result);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [session]);

  // Hide conditions
  if (!detection) return null;
  if (detection.status !== "eligible_for_import" && detection.status !== "import_already_offered") return null;
  if (dismissed) return null;
  if (hasImportCompletedLocally()) return null;

  const handleImport = async () => {
    setUiState("importing");
    const childId = getSelectedChildProfileId(session!.user!.id!);
    if (!childId) {
      setUiState("failure");
      return;
    }

    const result = await importLocalProgressToServer(childId);
    if (result.success && !result.alreadyImported) {
      setImportResult(result.imported);
      setUiState("success");
      markImportCompleted();
    } else if (result.alreadyImported) {
      setUiState("already_imported");
      markImportCompleted();
    } else {
      setUiState("failure");
      // Store error message for display
      setImportError(result.error?.message ?? "网络连接不稳定，请稍后重试。");
    }
  };

  const handleDismiss = () => {
    markImportOffered();
    setDismissed(true);
  };

  const handleRemindLater = () => {
    setDismissed(true);
    // Will re-appear next session (import-offered not set)
  };

  // --- Render by state ---

  if (uiState === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
        <span className="text-2xl">✅</span>
        <div className="flex-1">
          <p className="text-sm text-green-800 font-medium">导入成功！</p>
          <p className="text-xs text-green-600 mt-1">
            已导入 {importResult?.attempts ?? 0} 条答题记录
            {importResult && importResult.wrongProblems > 0 && (
              <> 和 {importResult.wrongProblems} 条错题记录</>
            )}。
          </p>
        </div>
      </div>
    );
  }

  if (uiState === "already_imported") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
        <span className="text-2xl">✅</span>
        <div className="flex-1">
          <p className="text-sm text-green-800 font-medium">进度已导入</p>
          <p className="text-xs text-green-600 mt-1">
            本地学习记录已成功导入云端档案。
          </p>
        </div>
      </div>
    );
  }

  if (uiState === "failure") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="text-sm text-red-800 font-medium">导入失败</p>
          <p className="text-xs text-red-600 mt-1">
            {importError ?? "网络连接不稳定，请稍后重试。"}
          </p>
          <p className="text-xs text-red-500 mt-1">
            💡 重试不会重复导入已成功的数据。
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setImportError(null); handleImport(); }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            重试
          </button>
          <button
            onClick={handleDismiss}
            className="text-red-400 hover:text-red-600 text-sm font-medium"
          >
            不再提醒
          </button>
        </div>
      </div>
    );
  }

  // Default: pending — show import prompt
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
      <span className="text-2xl">💾</span>
      <div className="flex-1">
        <p className="text-sm text-blue-800 font-medium">
          发现本地学习记录
        </p>
        <p className="text-xs text-blue-600 mt-1">
          你之前在本设备上做了 {detection.localAttemptCount} 道题、获得 {detection.localStars} 颗星星。
          是否将这些进度导入到云端档案？
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <button
          onClick={handleImport}
          disabled={uiState === "importing"}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap"
        >
          {uiState === "importing" ? "导入中..." : "导入到云端"}
        </button>
        <button
          onClick={handleRemindLater}
          className="text-blue-500 hover:text-blue-700 text-xs font-medium whitespace-nowrap"
        >
          稍后提醒
        </button>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 text-xs font-medium whitespace-nowrap"
        >
          不再提醒
        </button>
      </div>
    </div>
  );
}
