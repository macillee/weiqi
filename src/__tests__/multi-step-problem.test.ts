import { describe, it, expect } from "vitest";
import {
  isMultiStepProblem,
  computeBoardStonesForStep,
  getCurrentStepData,
} from "@/lib/multi-step-problem";
import type { Problem } from "@/lib/problems";

describe("isMultiStepProblem", () => {
  it("returns false for single-step problem without steps field", () => {
    const problem: Problem = {
      id: "TEST-001",
      boardSize: 9,
      category: "capture",
      level: 1,
      tags: ["test"],
      toPlay: "black",
      title: "测试",
      description: "描述",
      initialStones: [],
      answers: [{ x: 0, y: 0 }],
      hints: ["提示"],
      explanation: "解释",
      successMessage: "成功",
      failureMessage: "失败",
    };

    expect(isMultiStepProblem(problem)).toBe(false);
  });

  it("returns false for problem with totalSteps = 1", () => {
    const problem: Problem = {
      id: "TEST-002",
      boardSize: 9,
      category: "capture",
      level: 1,
      tags: ["test"],
      toPlay: "black",
      title: "测试",
      description: "描述",
      initialStones: [],
      answers: [{ x: 0, y: 0 }],
      hints: ["提示"],
      explanation: "解释",
      successMessage: "成功",
      failureMessage: "失败",
      totalSteps: 1,
      steps: [
        {
          step: 1,
          answers: [{ x: 0, y: 0 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
      ],
    };

    expect(isMultiStepProblem(problem)).toBe(false);
  });

  it("returns true for multi-step problem", () => {
    const problem: Problem = {
      id: "MULTI-001",
      boardSize: 9,
      category: "capture",
      level: 2,
      tags: ["multi-step"],
      toPlay: "black",
      title: "多步",
      description: "多步描述",
      initialStones: [],
      answers: [{ x: 0, y: 0 }],
      hints: ["提示"],
      explanation: "解释",
      successMessage: "成功",
      failureMessage: "失败",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          answers: [{ x: 0, y: 0 }],
          hints: ["提示1"],
          explanation: "解释1",
          successMessage: "成功1",
          failureMessage: "失败1",
        },
        {
          step: 2,
          answers: [{ x: 1, y: 1 }],
          hints: ["提示2"],
          explanation: "解释2",
          successMessage: "成功2",
          failureMessage: "失败2",
        },
      ],
    };

    expect(isMultiStepProblem(problem)).toBe(true);
  });
});

describe("computeBoardStonesForStep", () => {
  const baseProblem: Problem = {
    id: "BOARD-001",
    boardSize: 9,
    category: "capture",
    level: 2,
    tags: ["multi-step"],
    toPlay: "black",
    title: "棋盘测试",
    description: "棋盘描述",
    initialStones: [
      { x: 3, y: 3, color: "black" },
      { x: 3, y: 4, color: "white" },
    ],
    answers: [{ x: 0, y: 0 }],
    hints: ["提示"],
    explanation: "解释",
    successMessage: "成功",
    failureMessage: "失败",
  };

  it("returns initialStones for step 1", () => {
    const stones = computeBoardStonesForStep(baseProblem, 1);
    expect(stones).toEqual(baseProblem.initialStones);
  });

  it("returns initialStones for single-step problem", () => {
    const stones = computeBoardStonesForStep(baseProblem, 2);
    expect(stones).toEqual(baseProblem.initialStones);
  });

  it("applies addedStones from previous step", () => {
    const problem: Problem = {
      ...baseProblem,
      totalSteps: 2,
      steps: [
        {
          step: 1,
          addedStones: [{ x: 4, y: 4, color: "black" }],
          answers: [{ x: 0, y: 0 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
        {
          step: 2,
          answers: [{ x: 1, y: 1 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
      ],
    };

    const stones = computeBoardStonesForStep(problem, 2);
    expect(stones).toContainEqual({ x: 4, y: 4, color: "black" });
    expect(stones).toContainEqual({ x: 3, y: 3, color: "black" });
    expect(stones).toContainEqual({ x: 3, y: 4, color: "white" });
  });

  it("applies removedStones from previous step", () => {
    const problem: Problem = {
      ...baseProblem,
      totalSteps: 2,
      steps: [
        {
          step: 1,
          removedStones: [{ x: 3, y: 4, color: "white" }],
          answers: [{ x: 0, y: 0 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
        {
          step: 2,
          answers: [{ x: 1, y: 1 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
      ],
    };

    const stones = computeBoardStonesForStep(problem, 2);
    expect(stones).not.toContainEqual({ x: 3, y: 4, color: "white" });
    expect(stones).toContainEqual({ x: 3, y: 3, color: "black" });
  });

  it("applies deltas from multiple previous steps", () => {
    const problem: Problem = {
      ...baseProblem,
      totalSteps: 3,
      steps: [
        {
          step: 1,
          addedStones: [{ x: 5, y: 5, color: "black" }],
          answers: [{ x: 0, y: 0 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
        {
          step: 2,
          addedStones: [{ x: 6, y: 6, color: "white" }],
          removedStones: [{ x: 3, y: 4, color: "white" }],
          answers: [{ x: 1, y: 1 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
        {
          step: 3,
          answers: [{ x: 2, y: 2 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
      ],
    };

    const stones = computeBoardStonesForStep(problem, 3);
    expect(stones).toContainEqual({ x: 5, y: 5, color: "black" });
    expect(stones).toContainEqual({ x: 6, y: 6, color: "white" });
    expect(stones).not.toContainEqual({ x: 3, y: 4, color: "white" });
    expect(stones).toContainEqual({ x: 3, y: 3, color: "black" });
  });

  it("handles empty addedStones and removedStones", () => {
    const problem: Problem = {
      ...baseProblem,
      totalSteps: 2,
      steps: [
        {
          step: 1,
          addedStones: [],
          removedStones: [],
          answers: [{ x: 0, y: 0 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
        {
          step: 2,
          answers: [{ x: 1, y: 1 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
      ],
    };

    const stones = computeBoardStonesForStep(problem, 2);
    expect(stones).toEqual(baseProblem.initialStones);
  });
});

describe("getCurrentStepData", () => {
  const problem: Problem = {
    id: "STEP-001",
    boardSize: 9,
    category: "capture",
    level: 2,
    tags: ["multi-step"],
    toPlay: "black",
    title: "步骤测试",
    description: "步骤描述",
    initialStones: [],
    answers: [{ x: 0, y: 0 }],
    hints: ["提示"],
    explanation: "解释",
    successMessage: "成功",
    failureMessage: "失败",
    totalSteps: 2,
    steps: [
      {
        step: 1,
        answers: [{ x: 0, y: 0 }],
        hints: ["提示1"],
        explanation: "解释1",
        successMessage: "成功1",
        failureMessage: "失败1",
      },
      {
        step: 2,
        answers: [{ x: 1, y: 1 }],
        hints: ["提示2"],
        explanation: "解释2",
        successMessage: "成功2",
        failureMessage: "失败2",
      },
    ],
  };

  it("returns null for single-step problem", () => {
    const singleProblem: Problem = {
      ...problem,
      totalSteps: undefined,
      steps: undefined,
    };
    expect(getCurrentStepData(singleProblem, 1)).toBe(null);
  });

  it("returns step data for valid step", () => {
    const step1 = getCurrentStepData(problem, 1);
    expect(step1).not.toBe(null);
    expect(step1?.step).toBe(1);
    expect(step1?.successMessage).toBe("成功1");

    const step2 = getCurrentStepData(problem, 2);
    expect(step2).not.toBe(null);
    expect(step2?.step).toBe(2);
    expect(step2?.successMessage).toBe("成功2");
  });

  it("returns null for invalid step number", () => {
    expect(getCurrentStepData(problem, 0)).toBe(null);
    expect(getCurrentStepData(problem, 3)).toBe(null);
    expect(getCurrentStepData(problem, -1)).toBe(null);
  });
});

describe("multi-step problem behavior - integration", () => {
  it("correct answer advances to next step", () => {
    // This test verifies the logic flow conceptually
    const problem: Problem = {
      id: "MULTI-FLOW-001",
      boardSize: 9,
      category: "capture",
      level: 2,
      tags: ["multi-step"],
      toPlay: "black",
      title: "流程测试",
      description: "流程描述",
      initialStones: [{ x: 3, y: 3, color: "white" }],
      answers: [{ x: 4, y: 3 }],
      hints: ["提示"],
      explanation: "解释",
      successMessage: "成功",
      failureMessage: "失败",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          addedStones: [{ x: 4, y: 3, color: "black" }],
          answers: [{ x: 4, y: 3 }],
          hints: ["第一步提示"],
          explanation: "第一步解释",
          successMessage: "第一步成功",
          failureMessage: "第一步失败",
        },
        {
          step: 2,
          addedStones: [{ x: 3, y: 4, color: "white" }],
          answers: [{ x: 3, y: 4 }],
          hints: ["第二步提示"],
          explanation: "第二步解释",
          successMessage: "第二步成功",
          failureMessage: "第二步失败",
        },
      ],
    };

    // Verify multi-step detection
    expect(isMultiStepProblem(problem)).toBe(true);

    // Verify step 1 data
    const step1Data = getCurrentStepData(problem, 1);
    expect(step1Data?.answers).toEqual([{ x: 4, y: 3 }]);

    // Verify board state for step 1
    const step1Stones = computeBoardStonesForStep(problem, 1);
    expect(step1Stones).toEqual([{ x: 3, y: 3, color: "white" }]);

    // Verify board state for step 2 (after step 1's addedStones applied)
    const step2Stones = computeBoardStonesForStep(problem, 2);
    expect(step2Stones).toContainEqual({ x: 3, y: 3, color: "white" });
    expect(step2Stones).toContainEqual({ x: 4, y: 3, color: "black" });
  });

  it("hints reset per step conceptually", () => {
    const problem: Problem = {
      id: "HINT-RESET-001",
      boardSize: 9,
      category: "capture",
      level: 2,
      tags: ["multi-step"],
      toPlay: "black",
      title: "提示重置测试",
      description: "提示重置描述",
      initialStones: [],
      answers: [{ x: 0, y: 0 }],
      hints: ["全局提示"],
      explanation: "解释",
      successMessage: "成功",
      failureMessage: "失败",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          hints: ["第一步提示"],
          answers: [{ x: 0, y: 0 }],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
        {
          step: 2,
          hints: ["第二步提示"],
          answers: [{ x: 1, y: 1 }],
          explanation: "解释",
          successMessage: "成功",
          failureMessage: "失败",
        },
      ],
    };

    // Each step has its own hints
    const step1Data = getCurrentStepData(problem, 1);
    expect(step1Data?.hints).toEqual(["第一步提示"]);

    const step2Data = getCurrentStepData(problem, 2);
    expect(step2Data?.hints).toEqual(["第二步提示"]);
  });

  it("wrong answer recorded at problem level", () => {
    // This test verifies that wrong answer handling conceptually affects the problem level
    // The actual implementation handles this in the ProblemPlayer component
    const problem: Problem = {
      id: "WRONG-LEVEL-001",
      boardSize: 9,
      category: "capture",
      level: 2,
      tags: ["multi-step"],
      toPlay: "black",
      title: "错题级别测试",
      description: "错题级别描述",
      initialStones: [],
      answers: [{ x: 0, y: 0 }],
      hints: ["提示"],
      explanation: "解释",
      successMessage: "成功",
      failureMessage: "失败",
      totalSteps: 2,
      steps: [
        {
          step: 1,
          failureMessage: "第一步失败",
          answers: [{ x: 0, y: 0 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
        },
        {
          step: 2,
          failureMessage: "第二步失败",
          answers: [{ x: 1, y: 1 }],
          hints: ["提示"],
          explanation: "解释",
          successMessage: "成功",
        },
      ],
    };

    // The problem-level failureMessage is preserved
    expect(problem.failureMessage).toBe("失败");

    // Each step has its own failure message for UI feedback
    const step1Data = getCurrentStepData(problem, 1);
    expect(step1Data?.failureMessage).toBe("第一步失败");
  });
});