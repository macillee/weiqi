"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { computeReportStats, type ReportStats } from "@/lib/report";

export default function ReportPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    setStats(computeReportStats());
  }, []);

  if (!stats) return null;

  if (!stats.hasProgress) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center py-12 px-4">
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="text-2xl font-bold text-amber-900 mb-2">
          还没有学习记录哦
        </h1>
        <p className="text-amber-700 mb-6">
          快去完成第一道练习题吧！
        </p>
        <Link
          href="/practice"
          className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-3 shadow-lg transition-colors"
        >
          开始练习
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900 mb-1">
            学习报告
          </h1>
          <p className="text-amber-700 text-sm">
            看看你的进步吧！
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.uniqueAttemptedProblems}
            </div>
            <div className="text-xs text-gray-500">已做过</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-yellow-500">
              ⭐ {stats.stars}
            </div>
            <div className="text-xs text-gray-500">星星</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(stats.accuracy * 100)}%
            </div>
            <div className="text-xs text-gray-500">正确率</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.firstTryAccuracy * 100)}%
            </div>
            <div className="text-xs text-gray-500">一次做对</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-red-500">
              {stats.wrongCount}
            </div>
            <div className="text-xs text-gray-500">待复习</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-orange-500">
              {stats.streakDays} 天
            </div>
            <div className="text-xs text-gray-500">连续练习</div>
          </div>
        </div>

        {stats.strongestCategory && stats.weakestCategory && (
          <div className="bg-white rounded-xl p-4 shadow mb-6">
            <h2 className="text-lg font-bold text-amber-900 mb-3">
              分类表现
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  最强项 💪
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">
                    {stats.strongestCategory.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(stats.strongestCategory.firstTryAccuracy * 100)}% 一次做对
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  加油项 🌱
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-500">
                    {stats.weakestCategory.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(stats.weakestCategory.firstTryAccuracy * 100)}% 一次做对
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-3">
            各分类进度
          </h2>
          <div className="space-y-3">
            {stats.categoryStats.map((cat) => {
              const pct =
                cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-gray-500">
                      {cat.completed}/{cat.total}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 rounded-full h-2 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Link
          href="/"
          className="block w-full bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-xl p-4 shadow text-center transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
