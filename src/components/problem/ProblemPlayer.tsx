"use client";

import { useState, useCallback } from "react";
import GoBoard from "@/components/board/GoBoard";
import ProblemHeader from "@/components/problem/ProblemHeader";
import HintPanel from "@/components/problem/HintPanel";
import FeedbackDialog from "@/components/problem/FeedbackDialog";
import type { Problem } from "@/lib/problems";
import type { Stone as BoardStone, Highlight } from "@/lib/board";

type ProblemPlayerProps = {
  problem: Problem;
  onNext?: () => void;
};

const MAX_WRONG_ATTEMPTS = 2;

export default function ProblemPlayer({ problem, onNext }: ProblemPlayerProps) {
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [lastWrongMove, setLastWrongMove] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const showAnswer = wrongAttempts >= MAX_WRONG_ATTEMPTS;

  const handlePointClick = useCallback(
    (x: number, y: number) => {
      if (result !== null) return;

      const isCorrect = problem.answers.some(
        (a) => a.x === x && a.y === y,
      );

      if (isCorrect) {
        setResult("correct");
      } else {
        setLastWrongMove({ x, y });
        const newWrong = wrongAttempts + 1;
        setWrongAttempts(newWrong);
        setResult("wrong");
      }
    },
    [problem.answers, result, wrongAttempts],
  );

  const handleShowHint = useCallback(() => {
    if (hintIndex < problem.hints.length) {
      setHintIndex((prev) => prev + 1);
    }
  }, [hintIndex, problem.hints.length]);

  const handleTryAgain = useCallback(() => {
    setResult(null);
    setLastWrongMove(null);
  }, []);

  const handleNext = useCallback(() => {
    onNext?.();
  }, [onNext]);

  const boardStones: BoardStone[] = problem.initialStones;

  const highlights: Highlight[] = [];

  if (lastWrongMove && result === "wrong") {
    highlights.push({
      x: lastWrongMove.x,
      y: lastWrongMove.y,
      type: "wrong",
    });
  }

  if (showAnswer) {
    for (const answer of problem.answers) {
      highlights.push({ x: answer.x, y: answer.y, type: "correct" });
    }
  }

  const isDisabled = result === "correct" || showAnswer;

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6">
      <ProblemHeader problem={problem} />

      <GoBoard
        size={problem.boardSize}
        stones={boardStones}
        disabled={isDisabled}
        highlights={highlights}
        onPointClick={handlePointClick}
      />

      {result === null && (
        <HintPanel
          hints={problem.hints}
          visibleCount={hintIndex}
          onShowHint={handleShowHint}
          allShown={hintIndex >= problem.hints.length}
        />
      )}

      {result === "correct" && (
        <FeedbackDialog
          isCorrect
          successMessage={problem.successMessage}
          failureMessage=""
          explanation={problem.explanation}
          onNext={onNext}
          onTryAgain={undefined}
          showAnswer={false}
        />
      )}

      {result === "wrong" && (
        <FeedbackDialog
          isCorrect={false}
          successMessage=""
          failureMessage={problem.failureMessage}
          explanation={showAnswer ? problem.explanation : undefined}
          correctAnswer={showAnswer ? problem.answers[0] : undefined}
          onNext={showAnswer ? onNext : undefined}
          onTryAgain={showAnswer ? undefined : handleTryAgain}
          showAnswer={showAnswer}
        />
      )}
    </div>
  );
}
