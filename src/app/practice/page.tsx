"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import ProblemPlayer from "@/components/problem/ProblemPlayer";
import { selectDailyProblems, type PracticeSession, createPracticeSession, recordResult, advancePracticeSession, getPracticeSummary } from "@/lib/practice";
import type { Problem } from "@/lib/problems";
import {
  loadProgress,
  saveProgress,
  recordAttempt,
  recordDailyPracticeComplete,
  type StudentProgress,
} from "@/lib/progress";

type Phase = "idle" | "playing" | "summary";

export default function PracticePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [starsEarnedThisSession, setStarsEarnedThisSession] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  function handleStart() {
    const problems = selectDailyProblems();
    const newSession = createPracticeSession(problems);
    setSession(newSession);
    setPhase("playing");
    setStarsEarnedThisSession(0);
    setProgress(loadProgress());
  }

  const handleAttempt = useCallback(
    (x: number, y: number, isCorrect: boolean, usedHint: boolean) => {
      if (!session) return;
      const problem = session.problems[session.currentIndex];
      const currentProgress = loadProgress();
      const { progress: newProgress, starsEarned } = recordAttempt(
        currentProgress,
        problem.id,
        x,
        y,
        isCorrect,
        usedHint,
        0,
      );
      saveProgress(newProgress);
      setProgress(newProgress);
      setStarsEarnedThisSession((prev) => prev + starsEarned);
    },
    [session],
  );

  const handleResult = useCallback(
    (correct: boolean, wrongAttempts: number, usedHint: boolean) => {
      if (!session) return;
      const result = {
        problemId: session.problems[session.currentIndex].id,
        correct,
        wrongAttempts,
        usedHint,
      };
      const updated = recordResult(session, result);
      setSession(updated);
    },
    [session],
  );

  const handleNext = useCallback(() => {
    if (!session) return;
    const updated = advancePracticeSession(session);
    setSession(updated);
    if (updated.completed) {
      const currentProgress = loadProgress();
      const { progress: newProgress, starsEarned } = recordDailyPracticeComplete(currentProgress);
      saveProgress(newProgress);
      setProgress(newProgress);
      setStarsEarnedThisSession((prev) => prev + starsEarned);
      setPhase("summary");
    }
  }, [session]);

  if (phase === "idle") {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            今日练习
          </h1>
          <p className="text-amber-700">
            每天练一练，棋力天天涨！
          </p>
        </div>

        <button
          onClick={handleStart}
          className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-xl font-bold shadow-lg transition-colors"
        >
          开始练习
        </button>

        <Link
          href="/"
          className="mt-6 text-amber-600 hover:text-amber-800 text-sm"
        >
          ← 返回首页
        </Link>
      </div>
    );
  }

  if (phase === "summary" && session) {
    const summary = getPracticeSummary(session);
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            练习完成！
          </h1>
          <p className="text-amber-700">你今天真棒！</p>
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">
              {summary.accuracy}%
            </div>
            <div className="text-sm text-gray-500">正确率</div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-700">
                {summary.total}
              </div>
              <div className="text-xs text-gray-500">总题数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {summary.correct}
              </div>
              <div className="text-xs text-gray-500">答对</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {summary.wrong}
              </div>
              <div className="text-xs text-gray-500">答错</div>
            </div>
          </div>

          {summary.hintsUsed > 0 && (
            <div className="text-center text-sm text-gray-500">
              使用了 {summary.hintsUsed} 次提示
            </div>
          )}

          {starsEarnedThisSession > 0 && (
            <div className="text-center bg-yellow-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-yellow-600">
                +{starsEarnedThisSession} ⭐
              </div>
              <div className="text-sm text-yellow-500">获得星星</div>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            总星星：{progress?.stars ?? 0} ⭐
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
          >
            再来一次
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-xl font-medium transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "playing" && session) {
    const problem = session.problems[session.currentIndex];
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3 bg-amber-100">
            <Link
              href="/"
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              ← 返回
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-yellow-600 font-medium">
                ⭐ {progress?.stars ?? 0}
              </span>
              <span className="text-sm font-medium text-amber-800">
                第 {session.currentIndex + 1} / {session.problems.length} 题
              </span>
            </div>
          </div>

          <div className="w-full bg-amber-200 h-2">
            <div
              className="bg-green-500 h-2 transition-all"
              style={{
                width: `${((session.currentIndex) / session.problems.length) * 100}%`,
              }}
            />
          </div>

          <ProblemPlayer
            problem={problem}
            onNext={handleNext}
            onAttempt={handleAttempt}
            onResult={handleResult}
          />
        </div>
      </div>
    );
  }

  return null;
}
