"use client";

import { useState, useEffect } from "react";
import {
  detectImportEligibility,
  markImportOffered,
  type ImportDetectionResult,
} from "@/lib/progress-import";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth";
import { getSelectedChildProfileId } from "@/lib/selected-child";

/**
 * Shows a gentle prompt when an authenticated parent with a selected
 * child profile has existing local progress from v0.1.x anonymous mode.
 *
 * The prompt explains that local progress can be imported later.
 * It does NOT perform the actual import.
 */
export default function ImportPromptBanner() {
  const [detection, setDetection] = useState<ImportDetectionResult | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const { session } = useSupabaseAuth();

  useEffect(() => {
    // Only check when: Supabase configured + authenticated + child selected
    if (!isSupabaseConfigured()) return;
    if (!session?.user?.id) return;
    const childId = getSelectedChildProfileId(session.user.id);
    if (!childId) return;

    const result = detectImportEligibility();
    setDetection(result);
  }, [session]);

  if (!detection) return null;
  if (detection.status !== "eligible_for_import") return null;
  if (dismissed) return null;

  const handleDismiss = () => {
    markImportOffered();
    setDismissed(true);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
      <span className="text-2xl">💾</span>
      <div className="flex-1">
        <p className="text-sm text-blue-800 font-medium">
          发现本地学习记录
        </p>
        <p className="text-xs text-blue-600 mt-1">
          你之前在本设备上做了 {detection.localAttemptCount} 道题、获得 {detection.localStars} 颗星星。
          这些进度可以在后续版本中导入到云端档案。
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-blue-400 hover:text-blue-600 text-sm font-medium whitespace-nowrap"
      >
        知道了
      </button>
    </div>
  );
}