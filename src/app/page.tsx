"use client";

import { useState } from "react";
import GoBoard from "@/components/board/GoBoard";
import type { Stone, Highlight } from "@/lib/board";

const demoStones: Stone[] = [
  { x: 3, y: 3, color: "black" },
  { x: 4, y: 3, color: "white" },
  { x: 3, y: 4, color: "black" },
  { x: 5, y: 3, color: "black" },
  { x: 3, y: 2, color: "white" },
];

const demoHighlights: Highlight[] = [
  { x: 3, y: 5, type: "hint" },
];

const demoLastMove = { x: 3, y: 4 };

export default function Home() {
  const [clickLog, setClickLog] = useState<string[]>([]);
  const [stones, setStones] = useState<Stone[]>(demoStones);
  const [disabled, setDisabled] = useState(false);

  function handleClick(x: number, y: number) {
    const entry = `点击: (${x}, ${y})`;
    setClickLog((prev) => [entry, ...prev].slice(0, 10));
    setStones((prev) => [...prev, { x, y, color: "black" }]);
  }

  function handleReset() {
    setStones(demoStones);
    setClickLog([]);
    setDisabled(false);
  }

  function handleDisable() {
    setDisabled(true);
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center py-8 px-4">
      <h1 className="text-2xl font-bold text-amber-900 mb-4">
        围棋棋盘演示
      </h1>
      <p className="text-amber-700 mb-6 text-center max-w-md">
        点击棋盘空交叉点放置黑子。已有棋子的交叉点不会触发点击。
      </p>

      <div className="flex flex-col items-center gap-4">
        <GoBoard
          size={9}
          stones={stones}
          disabled={disabled}
          lastMove={demoLastMove}
          highlights={demoHighlights}
          onPointClick={handleClick}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
          >
            重置
          </button>
          <button
            onClick={handleDisable}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            禁用棋盘
          </button>
        </div>

        <div className="mt-6 w-full max-w-sm bg-white rounded-lg p-4 shadow">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            点击记录（最近 10 次）
          </h2>
          {clickLog.length === 0 ? (
            <p className="text-gray-400 text-sm">还没有点击记录</p>
          ) : (
            <ul className="space-y-1">
              {clickLog.map((entry, i) => (
                <li key={i} className="text-sm text-gray-600 font-mono">
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 w-full max-w-sm bg-white rounded-lg p-4 shadow">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            图例
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-blue-400 opacity-60" />
              <span>蓝色：提示点 (hint)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 opacity-50" />
              <span>黄色：最后一手 (lastMove)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-black" />
              <span>黑子</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-gray-100 border border-gray-400" />
              <span>白子</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
