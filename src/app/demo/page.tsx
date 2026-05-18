"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import ProblemPlayer from "@/components/problem/ProblemPlayer";
import { loadProblems } from "@/lib/problems";
import type { Problem } from "@/lib/problems";
import { loadProgress, saveProgress, recordAttempt } from "@/lib/progress";

export default function DemoPage() {
  const problems = loadProblems();
  const [currentIndex, setCurrentIndex] = useState(0);

  const problem = problems[currentIndex];

  function handleNext() {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handleSelect(index: number) {
    setCurrentIndex(index);
  }

  const handleResult = useCallback(
    (correct: boolean, wrongAttempts: number, usedHint: boolean, selectedX: number, selectedY: number) => {
      const currentProgress = loadProgress();
      const { progress: newProgress } = recordAttempt(
        currentProgress,
        problem.id,
        selectedX,
        selectedY,
        correct,
        usedHint,
        0,
      );
      saveProgress(newProgress);
    },
    [problem.id],
  );

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-2xl mx-auto py-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-sm text-amber-600 hover:text-amber-800">
            ← 返回
          </Link>
          <div className="text-sm text-amber-700">
            第 {currentIndex + 1} / {problems.length} 题
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {problems.map((p, i) => (
            <button
              key={p.id}
              onClick={() => handleSelect(i)}
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                i === currentIndex
                  ? "bg-amber-500 text-white"
                  : "bg-amber-200 text-amber-800 hover:bg-amber-300"
              }`}
            >
              {p.id}
            </button>
          ))}
        </div>

        <ProblemPlayer
          problem={problem}
          onNext={handleNext}
          onResult={handleResult}
        />
      </div>
    </div>
  );
}
