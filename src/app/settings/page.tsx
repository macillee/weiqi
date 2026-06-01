"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { resetProgress } from "@/lib/progress";
import { useSupabaseAuth } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signOutUser } from "@/lib/supabase/auth-actions";
import {
  loadAudioPreference,
  setAudioEnabled,
} from "@/lib/audioFeedback";

export default function SettingsPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const { session, isLoading } = useSupabaseAuth();
  const configured = isSupabaseConfigured();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabledState] = useState(true);

  useEffect(() => {
    setAudioEnabledState(loadAudioPreference());
  }, []);

  function handleToggleAudio(enabled: boolean) {
    setAudioEnabled(enabled);
    setAudioEnabledState(enabled);
  }

  function handleReset() {
    resetProgress();
    setResetDone(true);
    setShowConfirm(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    const result = await signOutUser();
    setSigningOut(false);
    if (result.error) {
      setSignOutError(result.error.message);
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900 mb-1">设置</h1>
          <p className="text-amber-700 text-sm">管理你的学习数据</p>
        </div>

        {resetDone && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center mb-6">
            <p className="text-green-700 font-bold">重置成功！</p>
            <p className="text-green-600 text-sm mt-1">
              所有学习数据已清除，返回首页后会看到新的空进度。
            </p>
          </div>
        )}

        {configured && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <h2 className="text-lg font-bold text-amber-900 mb-3">
              账号
            </h2>
            {isLoading ? (
              <p className="text-sm text-gray-500">加载中...</p>
            ) : session ? (
              <div>
                <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-3">
                  已登录：{session.user.email}
                </p>
                <Link
                  href="/children"
                  className="block w-full py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-xl font-medium text-center transition-colors mb-3"
                >
                  管理孩子档案
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full py-3 bg-red-400 hover:bg-red-500 disabled:bg-red-200 text-white rounded-xl font-medium transition-colors"
                >
                  {signingOut ? "退出中..." : "退出登录"}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-center transition-colors"
              >
                登录 / 注册
              </Link>
            )}
          </div>
        )}

        {signOutError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{signOutError}</p>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-2">声音设置</h2>
          <p className="text-sm text-gray-600 mb-4">
            答对或答错时播放短促提示音。关闭后，答题时不会发出任何声音。
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700">
              {audioEnabled ? "声音：开" : "声音：关"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={audioEnabled}
              onClick={() => handleToggleAudio(!audioEnabled)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                audioEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  audioEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-amber-900 mb-2">
            重置学习进度
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            清除所有星星、错题记录和练习数据。此操作不可撤销。
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3 bg-red-400 hover:bg-red-500 text-white rounded-xl font-medium transition-colors"
            >
              重置进度
            </button>
          ) : (
            <div>
              <p className="text-sm text-red-600 mb-3 font-medium">
                确定要重置吗？所有数据都会丢失！
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  确定重置
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="block w-full bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-xl p-4 shadow text-center transition-colors mt-6"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
