import { describe, it, expect, vi, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ParentSessionSummary } from "@/lib/session-summary";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const mockSummary: ParentSessionSummary = {
  sessionId: "session-test123",
  reviewedAt: "2026-06-09T10:30:00.000Z",
  signalQuality: "complete",
  totalAttempted: 5,
  totalCorrectFirstTry: 3,
  totalRetried: 1,
  totalHintsUsed: 2,
  multiStepAttempted: 1,
  multiStepCompleted: 0,
  categories: [
    { category: "capture", attempted: 3, correctFirstTry: 2, retried: 1, hintsUsed: 1, multiStepAttempted: 0, multiStepCompleted: 0 },
    { category: "escape", attempted: 2, correctFirstTry: 1, retried: 0, hintsUsed: 1, multiStepAttempted: 0, multiStepCompleted: 0 },
  ],
  levels: [
    { level: 1, attempted: 2, correctFirstTry: 2, hintsUsed: 0 },
    { level: 2, attempted: 3, correctFirstTry: 1, hintsUsed: 2 },
  ],
  problems: [
    { problemId: "CAP-001", category: "capture", level: 1, result: "correct-first-try", hintsUsed: 0, multiStep: false },
  ],
  strengths: ["capture 表现不错"],
  shakyConcepts: ["escape 需要再练"],
  suggestedNextFocus: ["建议明天多练escape的题目"],
  parentNote: "今天完成了5道题，3道一次做对。capture 表现不错。",
  warnings: [],
};

const emptySummary: ParentSessionSummary = {
  sessionId: "session-empty",
  reviewedAt: "unknown",
  signalQuality: "empty",
  totalAttempted: 0,
  totalCorrectFirstTry: 0,
  totalRetried: 0,
  totalHintsUsed: 0,
  multiStepAttempted: 0,
  multiStepCompleted: 0,
  categories: [],
  levels: [],
  problems: [],
  strengths: [],
  shakyConcepts: [],
  suggestedNextFocus: [],
  parentNote: "今天还没有练习记录，开始一局今日练习吧。",
  warnings: ["本次没有练习记录，数据为空。"],
};

vi.mock("@/lib/progress", () => ({
  loadProgress: vi.fn(() => ({
    stars: 0,
    streakDays: 0,
    lastPracticeDate: undefined,
    completedProblemIds: [],
    masteredProblemIds: [],
    wrongProblems: {},
    attempts: [],
    achievements: [],
    reviewSchedule: {},
  })),
}));

vi.mock("@/lib/session-summary-input", () => ({
  buildSessionSummaryInput: vi.fn(() => ({
    sessionStartedAt: "2026-06-09T10:00:00.000Z",
    sessionCompletedAt: "2026-06-09T10:30:00.000Z",
    attempts: [],
  })),
}));

vi.mock("@/lib/session-summary", () => ({
  summarizeLearningSession: vi.fn(),
}));

import DevSessionSummaryPage from "@/app/dev/session-summary/page";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

async function mountPage() {
  container = document.createElement("div");
  document.body.appendChild(container);
  await act(async () => {
    root = createRoot(container!);
    root.render(<DevSessionSummaryPage />);
  });
}

afterEach(() => {
  if (root) {
    act(() => { root!.unmount(); });
    root = null;
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  container = null;
  vi.clearAllMocks();
});

describe("DevSessionSummaryPage", () => {
  it("renders without crashing with empty/no progress state", async () => {
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(emptySummary);

    await mountPage();
    expect(container!.textContent).toContain("暂无练习数据");
    expect(container!.textContent).toContain("开始练习");
  });

  it("displays developer/debug-only copy", async () => {
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(emptySummary);

    await mountPage();
    expect(container!.textContent).toContain("开发者调试面板");
  });

  it("displays local-only / not-a-grade copy", async () => {
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(emptySummary);

    await mountPage();
    expect(container!.textContent).toContain("仅存储在本地浏览器");
    expect(container!.textContent).toContain("不是成绩或排名");
  });

  it("renders sanitized summary fields", async () => {
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(mockSummary);

    await mountPage();
    expect(container!.textContent).toContain("会话概要");
    expect(container!.textContent).toContain("5");
    expect(container!.textContent).toContain("3");
    expect(container!.textContent).toContain("capture");
    expect(container!.textContent).toContain("escape");
    expect(container!.textContent).toContain("家长笔记");
    expect(container!.textContent).toContain("capture 表现不错");
  });

  it("does not render forbidden privacy keys/labels", async () => {
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(mockSummary);

    await mountPage();
    const text = container!.textContent ?? "";
    const forbidden = ["selectedX", "selectedY", "board", "winrate", "scoreLead", "engine", "supabase", "accountId", "childName", "profile"];
    for (const key of forbidden) {
      expect(text).not.toContain(key);
    }
  });

  it("renders strengths section when present", async () => {
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(mockSummary);

    await mountPage();
    expect(container!.textContent).toContain("表现不错");
    expect(container!.textContent).toContain("capture 表现不错");
  });

  it("renders warnings when present", async () => {
    const summaryWithWarnings: ParentSessionSummary = {
      ...mockSummary,
      warnings: ["数据较少，只作为参考。"],
    };
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(summaryWithWarnings);

    await mountPage();
    expect(container!.textContent).toContain("数据较少");
  });

  it("does not render problem IDs", async () => {
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(mockSummary);

    await mountPage();
    expect(container!.textContent).not.toContain("CAP-001");
  });

  it("renders shaky concepts section when present", async () => {
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(mockSummary);

    await mountPage();
    expect(container!.textContent).toContain("可以继续巩固");
    expect(container!.textContent).toContain("escape 需要再练");
  });

  it("renders suggested next focus section when present", async () => {
    const { summarizeLearningSession } = await import("@/lib/session-summary");
    vi.mocked(summarizeLearningSession).mockReturnValue(mockSummary);

    await mountPage();
    expect(container!.textContent).toContain("明日建议");
    expect(container!.textContent).toContain("建议明天多练escape的题目");
  });
});
