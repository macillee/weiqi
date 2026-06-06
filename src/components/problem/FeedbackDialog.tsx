import type { Point } from "@/lib/problems";

type FeedbackDialogProps = {
  isCorrect: boolean;
  successMessage: string;
  failureMessage: string;
  explanation?: string;
  correctAnswer?: Point;
  onNext?: () => void;
  onTryAgain?: () => void;
  showAnswer: boolean;
  onShowCoach?: () => void;
  coachMessage?: string | null;
};

const GO_LABELS = "ABCDEFGHJKLMNOPQRST";

function pointToGoLabel(point: Point): string {
  const col = GO_LABELS[point.x] || String(point.x + 1);
  const row = String(point.y + 1);
  return `${col}${row}`;
}

export default function FeedbackDialog({
  isCorrect,
  successMessage,
  failureMessage,
  explanation,
  correctAnswer,
  onNext,
  onTryAgain,
  showAnswer,
  onShowCoach,
  coachMessage,
}: FeedbackDialogProps) {
  return (
    <div
      className={`rounded-2xl p-4 shadow-lg text-center ${
        isCorrect ? "bg-green-50 border-2 border-green-300" : "bg-red-50 border-2 border-red-200"
      }`}
    >
      {isCorrect ? (
        <div>
          <p className="text-lg font-bold text-green-700">{successMessage}</p>
          {explanation && (
            <p className="text-sm text-green-600 mt-2">{explanation}</p>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="mt-3 px-6 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600"
            >
              下一题
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="text-lg font-bold text-red-600">{failureMessage}</p>
          {showAnswer && correctAnswer && (
            <div className="mt-2">
              <p className="text-sm text-red-500">
                正确答案：{pointToGoLabel(correctAnswer)}
              </p>
              {explanation && (
                <p className="text-sm text-red-500 mt-1">{explanation}</p>
              )}
            </div>
          )}
          {coachMessage && (
            <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2">
              <p className="text-sm text-amber-800">{coachMessage}</p>
            </div>
          )}
          {onShowCoach && !coachMessage && (
            <button
              onClick={onShowCoach}
              className="mt-2 px-4 py-1.5 bg-amber-400 text-amber-900 rounded-full text-sm font-medium hover:bg-amber-500"
            >
              请老师帮忙
            </button>
          )}
          {onTryAgain && !showAnswer && (
            <button
              onClick={onTryAgain}
              className="mt-3 px-6 py-2 bg-red-400 text-white rounded-full font-medium hover:bg-red-500"
            >
              再试一次
            </button>
          )}
          {showAnswer && onNext && (
            <button
              onClick={onNext}
              className="mt-3 px-6 py-2 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600"
            >
              下一题
            </button>
          )}
        </div>
      )}
    </div>
  );
}
