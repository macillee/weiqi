"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import GoBoard from "@/components/board/GoBoard";
import ProblemHeader from "@/components/problem/ProblemHeader";
import HintPanel from "@/components/problem/HintPanel";
import FeedbackDialog from "@/components/problem/FeedbackDialog";
import CelebrationOverlay from "@/components/problem/CelebrationOverlay";
import type { Problem } from "@/lib/problems";
import type { Stone as BoardStone, Highlight } from "@/lib/board";
import {
  isMultiStepProblem,
  computeBoardStonesForStep,
  getCurrentStepData,
} from "@/lib/multi-step-problem";
import { playCorrect, playWrong } from "@/lib/audioFeedback";
import { getRevealedHintCoordinates } from "@/lib/hintCoordinate";

type ProblemPlayerProps = {
  problem: Problem;
  onNext?: () => void;
  onAttempt?: (x: number, y: number, isCorrect: boolean, usedHint: boolean) => void;
  onResult?: (correct: boolean, wrongAttempts: number, usedHint: boolean) => void;
};

const MAX_WRONG_ATTEMPTS = 2;

export default function ProblemPlayer({ problem, onNext, onAttempt, onResult }: ProblemPlayerProps) {
  const isMultiStep = isMultiStepProblem(problem);
  const totalSteps = problem.totalSteps || 1;

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const [stepWrongAttempts, setStepWrongAttempts] = useState<number[]>([]);
  const [stepHintIndex, setStepHintIndex] = useState<number[]>([]);
  const [stepResults, setStepResults] = useState<Array<"correct" | "wrong" | null>>([]);
  const [stepWrongMoves, setStepWrongMoves] = useState<Array<{ x: number; y: number } | null>>([]);

  // Single-step state (backward compatible)
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [lastWrongMove, setLastWrongMove] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [celebrateTrigger, setCelebrateTrigger] = useState(0);

  // Reset all state when problem changes
  useEffect(() => {
    setWrongAttempts(0);
    setHintIndex(0);
    setResult(null);
    setLastWrongMove(null);
    
    // Reset multi-step state
    setCurrentStep(1);
    setStepWrongAttempts([]);
    setStepHintIndex([]);
    setStepResults([]);
    setStepWrongMoves([]);
  }, [problem.id]);

  // Compute current step data
  const currentStepData = useMemo(() => {
    if (!isMultiStep) return null;
    return getCurrentStepData(problem, currentStep);
  }, [isMultiStep, problem, currentStep]);

  // Compute board stones for current step
  const boardStones = useMemo(() => {
    if (!isMultiStep) {
      return problem.initialStones;
    }
    return computeBoardStonesForStep(problem, currentStep);
  }, [isMultiStep, problem, currentStep]);

  // Get current step answers
  const currentAnswers = useMemo(() => {
    if (!isMultiStep) return problem.answers;
    return currentStepData?.answers || problem.answers;
  }, [isMultiStep, problem.answers, currentStepData]);

  // Get current step hints
  const currentHints = useMemo(() => {
    if (!isMultiStep) return problem.hints;
    return currentStepData?.hints || problem.hints;
  }, [isMultiStep, problem.hints, currentStepData]);

  // Get current step wrong attempts
  const currentWrongAttempts = useMemo(() => {
    if (!isMultiStep) return wrongAttempts;
    return stepWrongAttempts[currentStep - 1] || 0;
  }, [isMultiStep, wrongAttempts, stepWrongAttempts, currentStep]);

  // Get current step hint index
  const currentHintIndex = useMemo(() => {
    if (!isMultiStep) return hintIndex;
    return stepHintIndex[currentStep - 1] || 0;
  }, [isMultiStep, hintIndex, stepHintIndex, currentStep]);

  // Get current step result
  const currentResult = useMemo(() => {
    if (!isMultiStep) return result;
    return stepResults[currentStep - 1] || null;
  }, [isMultiStep, result, stepResults, currentStep]);

  // Get current step wrong move
  const currentWrongMove = useMemo(() => {
    if (!isMultiStep) return lastWrongMove;
    return stepWrongMoves[currentStep - 1] || null;
  }, [isMultiStep, lastWrongMove, stepWrongMoves, currentStep]);

  const showAnswer = currentWrongAttempts >= MAX_WRONG_ATTEMPTS;

  // Handle point click
  const handlePointClick = useCallback(
    (x: number, y: number) => {
      if (currentResult !== null) return;

      const isCorrect = currentAnswers.some(
        (a) => a.x === x && a.y === y,
      );

      onAttempt?.(x, y, isCorrect, currentHintIndex > 0);

      if (isCorrect) {
        void playCorrect();
        setCelebrateTrigger((prev) => prev + 1);
        if (isMultiStep) {
          // Update step result
          setStepResults((prev) => {
            const newResults = [...prev];
            newResults[currentStep - 1] = "correct";
            return newResults;
          });

          // Check if this is the final step
          if (currentStep >= totalSteps) {
            // Problem completed - record result at problem level
            const totalWrongAttempts = stepWrongAttempts.reduce((sum, w) => sum + w, 0);
            const totalUsedHint = stepHintIndex.some((h) => h > 0);
            onResult?.(true, totalWrongAttempts, totalUsedHint);
          }
        } else {
          setResult("correct");
          onResult?.(true, wrongAttempts, hintIndex > 0);
        }
      } else {
        // Wrong answer
        void playWrong();
        if (isMultiStep) {
          const newWrong = currentWrongAttempts + 1;
          
          // Update step wrong attempts
          setStepWrongAttempts((prev) => {
            const newAttempts = [...prev];
            newAttempts[currentStep - 1] = newWrong;
            return newAttempts;
          });

          // Update step wrong move
          setStepWrongMoves((prev) => {
            const newMoves = [...prev];
            newMoves[currentStep - 1] = { x, y };
            return newMoves;
          });

          // Update step result
          setStepResults((prev) => {
            const newResults = [...prev];
            newResults[currentStep - 1] = "wrong";
            return newResults;
          });

          // If max wrong attempts reached, record problem failure
          if (newWrong >= MAX_WRONG_ATTEMPTS) {
            const totalWrongAttempts = stepWrongAttempts.reduce((sum, w) => sum + w, 0) + 1;
            const totalUsedHint = stepHintIndex.some((h) => h > 0);
            onResult?.(false, totalWrongAttempts, totalUsedHint);
          }
        } else {
          setLastWrongMove({ x, y });
          const newWrong = wrongAttempts + 1;
          setWrongAttempts(newWrong);
          setResult("wrong");
          if (newWrong >= MAX_WRONG_ATTEMPTS) {
            onResult?.(false, newWrong, hintIndex > 0);
          }
        }
      }
    },
    [
      currentAnswers,
      currentResult,
      currentWrongAttempts,
      currentHintIndex,
      currentStep,
      isMultiStep,
      totalSteps,
      stepWrongAttempts,
      stepHintIndex,
      wrongAttempts,
      hintIndex,
      onAttempt,
      onResult,
    ],
  );

  // Handle show hint
  const handleShowHint = useCallback(() => {
    if (currentHintIndex >= currentHints.length) return;

    if (isMultiStep) {
      setStepHintIndex((prev) => {
        const newIndexes = [...prev];
        newIndexes[currentStep - 1] = (prev[currentStep - 1] || 0) + 1;
        return newIndexes;
      });
    } else {
      setHintIndex((prev) => prev + 1);
    }
  }, [isMultiStep, currentHintIndex, currentHints.length, currentStep]);

  // Handle try again
  const handleTryAgain = useCallback(() => {
    if (isMultiStep) {
      setStepResults((prev) => {
        const newResults = [...prev];
        newResults[currentStep - 1] = null;
        return newResults;
      });
      setStepWrongMoves((prev) => {
        const newMoves = [...prev];
        newMoves[currentStep - 1] = null;
        return newMoves;
      });
    } else {
      setResult(null);
      setLastWrongMove(null);
    }
  }, [isMultiStep, currentStep]);

  // Handle next step (for multi-step problems)
  const handleNextStep = useCallback(() => {
    if (!isMultiStep || currentStep >= totalSteps) {
      onNext?.();
      return;
    }

    // Advance to next step
    setCurrentStep((prev) => prev + 1);
  }, [isMultiStep, currentStep, totalSteps, onNext]);

  // Compute highlights
  const highlights: Highlight[] = useMemo(() => {
    const h: Highlight[] = [];

    if (currentWrongMove && currentResult === "wrong") {
      h.push({
        x: currentWrongMove.x,
        y: currentWrongMove.y,
        type: "wrong",
      });
    }

    if (showAnswer) {
      for (const answer of currentAnswers) {
        h.push({ x: answer.x, y: answer.y, type: "correct" });
      }
    }

    const showHintMarkers =
      currentResult === null && !showAnswer && currentHintIndex > 0;
    if (showHintMarkers) {
      const points = getRevealedHintCoordinates(
        currentHints,
        currentHintIndex,
        problem.boardSize,
      );
      for (const p of points) {
        h.push({ x: p.x, y: p.y, type: "hint" });
      }
    }

    return h;
  }, [
    currentWrongMove,
    currentResult,
    showAnswer,
    currentAnswers,
    currentHints,
    currentHintIndex,
    problem.boardSize,
  ]);

  const isDisabled = currentResult !== null;

  // Get messages for current step
  const successMessage = isMultiStep && currentStepData ? currentStepData.successMessage : problem.successMessage;
  const failureMessage = isMultiStep && currentStepData ? currentStepData.failureMessage : problem.failureMessage;
  const explanation = isMultiStep && currentStepData ? currentStepData.explanation : problem.explanation;

  // Check if problem is fully completed (all steps correct)
  const isProblemCompleted = isMultiStep && currentStep >= totalSteps && currentResult === "correct";

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6">
      <ProblemHeader problem={problem} />

      {/* Step indicator for multi-step problems */}
      {isMultiStep && (
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => {
              const stepResult = stepResults[stepNum - 1];
              const isCurrent = stepNum === currentStep;
              const isCompleted = stepResult === "correct";
              
              return (
                <div
                  key={stepNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCurrent
                      ? "bg-amber-400 text-amber-900 ring-2 ring-amber-500 ring-offset-2"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? "✓" : stepNum}
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-amber-700 mt-2">
            第 {currentStep} 步 / 共 {totalSteps} 步
          </p>
        </div>
      )}

      <div className="relative">
        <CelebrationOverlay triggered={celebrateTrigger > 0} key={celebrateTrigger} />
        <GoBoard
          size={problem.boardSize}
          stones={boardStones}
          disabled={isDisabled}
          highlights={highlights}
          onPointClick={handlePointClick}
        />
      </div>

      {currentResult === null && (
        <HintPanel
          hints={currentHints}
          visibleCount={currentHintIndex}
          onShowHint={handleShowHint}
          allShown={currentHintIndex >= currentHints.length}
        />
      )}

      {currentResult === "correct" && (
        <FeedbackDialog
          isCorrect
          successMessage={isProblemCompleted ? problem.successMessage : successMessage}
          failureMessage=""
          explanation={isProblemCompleted ? problem.explanation : explanation}
          onNext={isProblemCompleted ? onNext : handleNextStep}
          showAnswer={false}
        />
      )}

      {currentResult === "wrong" && (
        <FeedbackDialog
          isCorrect={false}
          successMessage=""
          failureMessage={failureMessage}
          explanation={showAnswer ? explanation : undefined}
          correctAnswer={showAnswer ? currentAnswers[0] : undefined}
          onNext={showAnswer ? onNext : undefined}
          onTryAgain={showAnswer ? undefined : handleTryAgain}
          showAnswer={showAnswer}
        />
      )}
    </div>
  );
}
