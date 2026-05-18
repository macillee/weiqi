"use client";

import { useState } from "react";
import ProblemPlayer from "@/components/problem/ProblemPlayer";
import { loadProblems } from "@/lib/problems";
import type { Problem } from "@/lib/problems";

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

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-2xl mx-auto py-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-amber-900">题目演示</h1>
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

        <ProblemPlayer problem={problem} onNext={handleNext} />
      </div>
    </div>
  );
}
