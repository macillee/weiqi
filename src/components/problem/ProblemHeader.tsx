import type { Problem } from "@/lib/problems";
import { categoryLabels } from "@/lib/chapters";

type ProblemHeaderProps = {
  problem: Problem;
};

export default function ProblemHeader({ problem }: ProblemHeaderProps) {
  return (
    <div className="w-full max-w-md text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
          {categoryLabels[problem.category]}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          难度 {problem.level}
        </span>
      </div>
      <h2 className="text-xl font-bold text-amber-900">{problem.title}</h2>
      <p className="text-amber-700 mt-1">{problem.description}</p>
    </div>
  );
}
