"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProblemPlayer from "@/components/problem/ProblemPlayer";
import { loadProgress, saveProgress, recordAttempt, getActiveWrongProblems, type WrongProblemState, type StudentProgress } from "@/lib/progress";
import { getProblemById, type Problem } from "@/lib/problems";
import { categoryLabels } from "@/lib/chapters";

type ViewMode = "list" | "reviewing";

const statusLabels: Record<string, string> = {
  active: "待复习",
  reviewing: "复习中",
};

const statusColors: Record<string, string> = {
  active: "bg-red-100 text-red-700",
  reviewing: "bg-orange-100 text-orange-700",
};

export default function WrongBookPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [wrongProblems, setWrongProblems] = useState<WrongProblemState[]>([]);
  const [reviewProblem, setReviewProblem] = useState<Problem | null>(null);

  function refreshProgress() {
    const p = loadProgress();
    setProgress(p);
    const active = getActiveWrongProblems(p.wrongProblems);
    setWrongProblems(active);
  }

  useEffect(() => {
    refreshProgress();
  }, []);

  function startReview(wp: WrongProblemState) {
    const problem = getProblemById(wp.problemId);
    if (!problem) return;
    setReviewProblem(problem);
    setViewMode("reviewing");
  }

  const handleAttempt = useCallback(
    (x: number, y: number, isCorrect: boolean, usedHint: boolean) => {
      if (!reviewProblem) return;
      const currentProgress = loadProgress();
      const { progress: newProgress } = recordAttempt(
        currentProgress,
        reviewProblem.id,
        x,
        y,
        isCorrect,
        usedHint,
        0,
      );
      saveProgress(newProgress);
      setProgress(newProgress);
      const active = getActiveWrongProblems(newProgress.wrongProblems);
      setWrongProblems(active);
    },
    [reviewProblem],
  );

  if (viewMode === "reviewing" && reviewProblem) {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3 bg-amber-100">
            <button
              onClick={() => {
                setViewMode("list");
                refreshProgress();
              }}
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              ← 返回错题本
            </button>
            <div className="text-sm font-medium text-amber-800">
              错题复习
            </div>
          </div>

          <ProblemPlayer
            problem={reviewProblem}
            onNext={() => {
              setViewMode("list");
              refreshProgress();
            }}
            onAttempt={handleAttempt}
          />
        </div>
      </div>
    );
  }

  if (wrongProblems.length === 0) {
    const hasEverWrong = progress && Object.keys(progress.wrongProblems).length > 0;
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📖</div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            错题本
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-sm">
          <div className="text-4xl mb-3">{hasEverWrong ? "🏆" : "🎉"}</div>
          <p className="text-lg font-bold text-amber-900 mb-2">
            {hasEverWrong ? "太厉害了！" : "太棒了！"}
          </p>
          <p className="text-amber-700">
            {hasEverWrong
              ? "你的错题都复习完了，全部掌握！"
              : "你还没有错题，继续保持哦！"}
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 text-amber-600 hover:text-amber-800 text-sm"
        >
          ← 返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">
          错题本
        </h1>
        <p className="text-amber-700">
          复习错题，把不会的变成会的！
        </p>
      </div>

      <div className="w-full max-w-md space-y-3">
        {wrongProblems.map((wp) => {
          const problem = getProblemById(wp.problemId);
          if (!problem) return null;
          return (
            <div
              key={wp.problemId}
              className="bg-white rounded-xl p-4 shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-bold text-amber-900">
                    {problem.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {categoryLabels[problem.category]} · 难度 {problem.level}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[wp.status] || "bg-gray-100 text-gray-600"}`}
                >
                  {statusLabels[wp.status] || wp.status}
                </span>
              </div>

              <div className="text-xs text-gray-400 mb-3">
                做错 {wp.wrongCount} 次
                {wp.correctReviewCount > 0 && ` · 复习对 ${wp.correctReviewCount} 次`}
              </div>

              <button
                onClick={() => startReview(wp)}
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                开始复习
              </button>
            </div>
          );
        })}
      </div>

      <Link
        href="/"
        className="mt-8 text-amber-600 hover:text-amber-800 text-sm"
      >
        ← 返回首页
      </Link>
    </div>
  );
}
