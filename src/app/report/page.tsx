"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadProgress } from "@/lib/progress";
import { loadProblems } from "@/lib/problems";

type CategoryStat = {
  category: string;
  label: string;
  completed: number;
  total: number;
  firstTryCorrect: number;
  totalAttempts: number;
};

type ReportStats = {
  totalCompleted: number;
  totalProblems: number;
  accuracy: number;
  firstTryAccuracy: number;
  wrongCount: number;
  streakDays: number;
  stars: number;
  categoryStats: CategoryStat[];
  strongestCategory: CategoryStat | null;
  weakestCategory: CategoryStat | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  capture: "吃子",
  escape: "逃跑",
  connect_cut: "连接与切断",
  life_death: "死活",
  opening: "布局",
  endgame: "官子",
  mixed: "综合",
};

function computeStats(): ReportStats {
  const progress = loadProgress();
  const problems = loadProblems();
  const problemMap = new Map(problems.map((p) => [p.id, p]));

  const totalProblems = problems.length;
  const totalCompleted = progress.completedProblemIds.length;
  const wrongCount = Object.values(progress.wrongProblems).filter(
    (wp) => wp.status !== "mastered",
  ).length;

  const totalAttempts = progress.attempts.length;
  const correctAttempts = progress.attempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

  const firstTryProblems = new Set<string>();
  const firstTryCorrectProblems = new Set<string>();
  for (const attempt of progress.attempts) {
    if (!firstTryProblems.has(attempt.problemId)) {
      firstTryProblems.add(attempt.problemId);
      if (attempt.isCorrect) {
        firstTryCorrectProblems.add(attempt.problemId);
      }
    }
  }
  const firstTryAccuracy =
    firstTryProblems.size > 0
      ? firstTryCorrectProblems.size / firstTryProblems.size
      : 0;

  const categoryMap = new Map<string, CategoryStat>();
  for (const [cat, label] of Object.entries(CATEGORY_LABELS)) {
    const catProblems = problems.filter((p) => p.category === cat);
    categoryMap.set(cat, {
      category: cat,
      label,
      completed: 0,
      total: catProblems.length,
      firstTryCorrect: 0,
      totalAttempts: 0,
    });
  }

  for (const attempt of progress.attempts) {
    const problem = problemMap.get(attempt.problemId);
    if (!problem) continue;
    const stat = categoryMap.get(problem.category);
    if (!stat) continue;
    stat.totalAttempts += 1;
    if (attempt.isCorrect) {
      const isFirst =
        progress.attempts.filter(
          (a) => a.problemId === attempt.problemId && a.isCorrect,
        )[0]?.createdAt === attempt.createdAt;
      if (isFirst) {
        stat.firstTryCorrect += 1;
      }
    }
  }

  for (const problemId of progress.completedProblemIds) {
    const problem = problemMap.get(problemId);
    if (!problem) continue;
    const stat = categoryMap.get(problem.category);
    if (stat) stat.completed += 1;
  }

  const categoryStats = Array.from(categoryMap.values()).filter(
    (s) => s.total > 0,
  );

  let strongestCategory: CategoryStat | null = null;
  let weakestCategory: CategoryStat | null = null;
  const completedCategories = categoryStats.filter((s) => s.completed > 0);
  if (completedCategories.length > 0) {
    strongestCategory = completedCategories.reduce((a, b) =>
      a.completed / a.total >= b.completed / b.total ? a : b,
    );
    weakestCategory = completedCategories.reduce((a, b) =>
      a.completed / a.total <= b.completed / b.total ? a : b,
    );
  }

  return {
    totalCompleted,
    totalProblems,
    accuracy,
    firstTryAccuracy,
    wrongCount,
    streakDays: progress.streakDays,
    stars: progress.stars,
    categoryStats,
    strongestCategory,
    weakestCategory,
  };
}

export default function ReportPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    setStats(computeStats());
  }, []);

  if (!stats) return null;

  const hasProgress = stats.totalCompleted > 0 || stats.stars > 0;

  if (!hasProgress) {
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
              {stats.totalCompleted}
            </div>
            <div className="text-xs text-gray-500">已完成</div>
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
                    {stats.strongestCategory.completed}/{stats.strongestCategory.total}
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
                    {stats.weakestCategory.completed}/{stats.weakestCategory.total}
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
