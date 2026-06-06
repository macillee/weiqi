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
      { id: "capture-3", title: "第 3 关", problemIds: ["CAP-005", "CAP-006"] },
      { id: "capture-4", title: "第 4 关", problemIds: ["CAP-007", "CAP-008", "CAP-009"] },
      { id: "capture-5", title: "第 5 关", problemIds: ["CAP-010"] },
      { id: "capture-6", title: "第 6 关", problemIds: ["CAP-011", "CAP-012"] },
      { id: "capture-7", title: "第 7 关", problemIds: ["CAP-013", "CAP-014"] },
      { id: "capture-8", title: "第 8 关", problemIds: ["CAP-018"] },
      { id: "capture-9", title: "第 9 关", problemIds: ["CAP-015", "CAP-016", "CAP-017"] },
      { id: "capture-10", title: "第 10 关", problemIds: ["CAP-019"] },
      { id: "capture-11", title: "第 11 关", problemIds: ["CAP-020"] },
      { id: "capture-12", title: "第 12 关", problemIds: ["MULTI-001", "MULTI-004", "MULTI-005"] },
    ],
  },
  {
    id: "escape",
    title: "逃跑森林",
    emoji: "🌲",
    description: "学会把自己的棋跑出去",
    levels: [
      { id: "escape-1", title: "第 1 关", problemIds: ["ESC-001"] },
      { id: "escape-2", title: "第 2 关", problemIds: ["ESC-002", "ESC-003"] },
      { id: "escape-3", title: "第 3 关", problemIds: ["ESC-004", "ESC-005"] },
      { id: "escape-4", title: "第 4 关", problemIds: ["ESC-006", "ESC-007", "ESC-008"] },
      { id: "escape-5", title: "第 5 关", problemIds: ["ESC-011"] },
      { id: "escape-6", title: "第 6 关", problemIds: ["ESC-009", "ESC-010"] },
      { id: "escape-7", title: "第 7 关", problemIds: ["ESC-012"] },
      { id: "escape-8", title: "第 8 关", problemIds: ["MULTI-009"] },
    ],
  },
  {
    id: "connect_cut",
    title: "连接桥",
    emoji: "🌉",
    description: "学会连接和切断",
    levels: [
      { id: "connect-cut-1", title: "第 1 关", problemIds: ["CC-001", "CC-002"] },
      { id: "connect-cut-2", title: "第 2 关", problemIds: ["CC-003", "CC-004"] },
      { id: "connect-cut-3", title: "第 3 关", problemIds: ["CC-005", "CC-006"] },
      { id: "connect-cut-4", title: "第 4 关", problemIds: ["CC-007", "CC-008", "CC-011"] },
      { id: "connect-cut-5", title: "第 5 关", problemIds: ["CC-009", "CC-014", "CC-015"] },
      { id: "connect-cut-6", title: "第 6 关", problemIds: ["CC-012", "CC-013"] },
      { id: "connect-cut-7", title: "第 7 关", problemIds: ["CC-016"] },
      { id: "connect-cut-8", title: "第 8 关", problemIds: ["MULTI-003", "MULTI-008"] },
    ],
  },
  {
    id: "opening",
    title: "布局城堡",
    emoji: "🏰",
    description: "学会开局占角",
    levels: [
      { id: "opening-1", title: "第 1 关", problemIds: ["OP-001"] },
      { id: "opening-2", title: "第 2 关", problemIds: ["OP-002", "OP-003"] },
      { id: "opening-3", title: "第 3 关", problemIds: ["OP-004", "OP-007", "OP-008"] },
      { id: "opening-4", title: "第 4 关", problemIds: ["OP-005", "OP-009", "OP-006"] },
      { id: "opening-5", title: "第 5 关", problemIds: ["OP-010"] },
    ],
  },
  {
    id: "life_death",
    title: "死活山洞",
    emoji: "🏯",
    description: "学会救活自己的棋",
    levels: [
      { id: "life-death-1", title: "第 1 关", problemIds: ["LD-001", "LD-002", "LD-007"] },
      { id: "life-death-2", title: "第 2 关", problemIds: ["LD-003", "LD-004", "LD-006"] },
      { id: "life-death-3", title: "第 3 关", problemIds: ["LD-010", "LD-011"] },
      { id: "life-death-4", title: "第 4 关", problemIds: ["LD-008", "LD-009"] },
      { id: "life-death-5", title: "第 5 关", problemIds: ["LD-012"] },
      { id: "life-death-6", title: "第 6 关", problemIds: ["MULTI-002", "MULTI-006", "MULTI-007"] },
    ],
  },
  {
    id: "endgame",
    title: "官子山谷",
    emoji: "🌄",
    description: "学会收官",
    levels: [
      { id: "endgame-1", title: "第 1 关", problemIds: ["END-001", "END-002", "END-004"] },
      { id: "endgame-2", title: "第 2 关", problemIds: ["END-005", "END-003", "END-006", "END-009"] },
      { id: "endgame-3", title: "第 3 关", problemIds: ["END-007", "END-008"] },
      { id: "endgame-4", title: "第 4 关", problemIds: ["END-010"] },
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
