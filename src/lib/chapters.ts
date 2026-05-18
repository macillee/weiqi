import type { ProblemCategory } from "@/lib/problems";

export type LevelNode = {
  id: string;
  title: string;
  problemIds: string[];
};

export type Chapter = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  levels: LevelNode[];
};

export const chapters: Chapter[] = [
  {
    id: "capture",
    title: "吃子小岛",
    emoji: "🏝️",
    description: "学会吃掉对方的棋子",
    levels: [
      { id: "capture-1", title: "第 1 关", problemIds: ["CAP-001", "CAP-002"] },
      { id: "capture-2", title: "第 2 关", problemIds: ["CAP-003", "CAP-004"] },
      { id: "capture-3", title: "第 3 关", problemIds: ["CAP-005"] },
    ],
  },
  {
    id: "escape",
    title: "逃跑森林",
    emoji: "🌲",
    description: "学会把自己的棋跑出去",
    levels: [
      { id: "escape-1", title: "第 1 关", problemIds: ["ESC-001"] },
    ],
  },
  {
    id: "connect_cut",
    title: "连接桥",
    emoji: "🌉",
    description: "学会连接和切断",
    levels: [
      { id: "connect-cut-1", title: "第 1 关", problemIds: ["CC-001", "CC-002"] },
    ],
  },
  {
    id: "opening",
    title: "布局城堡",
    emoji: "🏰",
    description: "学会开局占角",
    levels: [
      { id: "opening-1", title: "第 1 关", problemIds: ["OP-001"] },
    ],
  },
];

export const categoryLabels: Record<ProblemCategory, string> = {
  capture: "吃子",
  escape: "逃子",
  connect_cut: "连接与切断",
  life_death: "死活",
  opening: "布局",
  endgame: "官子",
  mixed: "综合",
};

export function getChapterById(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}

export function getLevelById(levelId: string): LevelNode | undefined {
  for (const chapter of chapters) {
    const level = chapter.levels.find((l) => l.id === levelId);
    if (level) return level;
  }
  return undefined;
}

export function getAllProblemIdsInChapter(chapterId: string): string[] {
  const chapter = getChapterById(chapterId);
  if (!chapter) return [];
  return chapter.levels.flatMap((l) => l.problemIds);
}

export function getAllProblemIds(): string[] {
  return chapters.flatMap((c) => c.levels.flatMap((l) => l.problemIds));
}
