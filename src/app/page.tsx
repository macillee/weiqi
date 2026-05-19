"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadProgress } from "@/lib/progress";
import { getActiveWrongProblems } from "@/lib/progress";
import { useSupabaseAuth } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signOutUser } from "@/lib/supabase/auth-actions";

export default function Home() {
  const [stars, setStars] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const { session } = useSupabaseAuth();
  const configured = isSupabaseConfigured();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    const progress = loadProgress();
    setStars(progress.stars);
    const activeWrong = getActiveWrongProblems(progress.wrongProblems);
    setWrongCount(activeWrong.length);
  }, []);

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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">
          欢迎回来，小棋手！
        </h1>
        <p className="text-amber-700">今天也要加油哦。</p>
      </div>

      {configured && (
        <div className="flex items-center gap-3 mb-4">
          {session ? (
            <>
              <span className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-1">
                {session.user.email}
              </span>
              <Link
                href="/children"
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                孩子档案
              </Link>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-sm text-red-500 hover:text-red-700 disabled:text-red-300"
              >
                {signingOut ? "退出中..." : "退出"}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              登录 / 注册
            </Link>
          )}
        </div>
      )}

      {signOutError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
          <p className="text-sm text-red-600">{signOutError}</p>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="bg-yellow-50 rounded-xl px-4 py-2 shadow">
          <span className="text-lg font-bold text-yellow-600">
            ⭐ {stars}
          </span>
          <span className="text-sm text-yellow-500 ml-1">星星</span>
        </div>
        {wrongCount > 0 && (
          <div className="bg-red-50 rounded-xl px-4 py-2 shadow">
            <span className="text-lg font-bold text-red-500">
              {wrongCount}
            </span>
            <span className="text-sm text-red-400 ml-1">待复习</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-md space-y-4">
        <Link
          href="/practice"
          className="block w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl p-6 shadow-lg text-center transition-colors"
        >
          <div className="text-4xl mb-2">📝</div>
          <div className="text-xl font-bold">今日练习</div>
          <div className="text-sm text-green-100 mt-1">
            完成今天的练习题
          </div>
        </Link>

        <Link
          href="/levels"
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-6 shadow-lg text-center transition-colors"
        >
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-xl font-bold">闯关地图</div>
          <div className="text-sm text-blue-100 mt-1">
            挑战不同的关卡
          </div>
        </Link>

        <Link
          href="/wrong-book"
          className="block w-full bg-red-400 hover:bg-red-500 text-white rounded-2xl p-6 shadow-lg text-center transition-colors"
        >
          <div className="text-4xl mb-2">📖</div>
          <div className="text-xl font-bold">错题本</div>
          <div className="text-sm text-red-100 mt-1">
            {wrongCount > 0 ? `${wrongCount} 道题需要复习` : "暂无错题，真棒！"}
          </div>
        </Link>

        <Link
          href="/report"
          className="block w-full bg-purple-500 hover:bg-purple-600 text-white rounded-2xl p-6 shadow-lg text-center transition-colors"
        >
          <div className="text-4xl mb-2">📊</div>
          <div className="text-xl font-bold">学习报告</div>
          <div className="text-sm text-purple-100 mt-1">
            看看你的进步
          </div>
        </Link>

        <Link
          href="/demo"
          className="block w-full bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-2xl p-4 shadow text-center transition-colors"
        >
          <div className="text-lg font-bold">题目演示</div>
          <div className="text-sm text-amber-800 mt-1">
            浏览所有题目
          </div>
        </Link>

        <div className="text-center pt-4">
          <Link
            href="/settings"
            className="text-xs text-amber-400 hover:text-amber-600"
          >
            设置
          </Link>
        </div>
      </div>
    </div>
  );
}
