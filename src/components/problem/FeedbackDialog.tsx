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
          {onTryAgain && !showAnswer && (
            <button
              onClick={onTryAgain}
              className="mt-3 px-6 py-2 bg-red-400 text-white rounded-full font-medium hover:bg-red-500"
            >
              再试一次
            </button>
          )}
        </div>
      )}
    </div>
  );
}
