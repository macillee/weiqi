import { describe, it, expect } from "vitest";
import { loadProblems } from "@/lib/problems";
import {
  chapters,
  getChapterById,
  getLevelById,
  getAllProblemIdsInChapter,
  getAllProblemIds,
  categoryLabels,
} from "@/lib/chapters";

describe("chapters module", () => {
  it("exports 7 chapters (6 legacy + 1 new mixed)", () => {
    const ids = chapters.map((c) => c.id);
    expect(ids).toEqual(["capture", "escape", "connect_cut", "opening", "life_death", "endgame", "mixed"]);
  });

  it("every chapter has at least one level and a unique id", () => {
    const seenIds = new Set<string>();
    for (const chapter of chapters) {
      expect(chapter.levels.length, `${chapter.id} has no levels`).toBeGreaterThan(0);
      expect(seenIds.has(chapter.id), `duplicate chapter id: ${chapter.id}`).toBe(false);
      seenIds.add(chapter.id);
    }
  });

  it("every level has a unique id and at least one problem", () => {
    const seenIds = new Set<string>();
    for (const chapter of chapters) {
      for (const level of chapter.levels) {
        expect(level.problemIds.length, `${chapter.id}/${level.id} has no problems`).toBeGreaterThan(0);
        expect(seenIds.has(level.id), `duplicate level id: ${level.id}`).toBe(false);
        seenIds.add(level.id);
      }
    }
  });

  it("every problemId referenced in chapters exists in problems.json", () => {
    const allProblems = new Set(loadProblems().map((p) => p.id));
    for (const chapter of chapters) {
      for (const level of chapter.levels) {
        for (const id of level.problemIds) {
          expect(allProblems.has(id), `${chapter.id}/${level.id} references missing problem ${id}`).toBe(true);
        }
      }
    }
  });
});

describe("v0.21.0b — Pack B wiring", () => {
  it("endgame chapter includes all v0.20.0d Pack B endgame problems (END-013..016)", () => {
    const endgame = getChapterById("endgame");
    expect(endgame).toBeDefined();
    const endgameProblemIds = getAllProblemIdsInChapter("endgame");
    for (const id of ["END-013", "END-014", "END-015", "END-016"]) {
      expect(endgameProblemIds, `endgame missing ${id}`).toContain(id);
    }
  });

  it("endgame-5 level exists and contains the Pack B endgame problems", () => {
    const level = getLevelById("endgame-5");
    expect(level).toBeDefined();
    expect(level?.problemIds).toEqual(expect.arrayContaining(["END-013", "END-014", "END-015", "END-016"]));
  });

  it("preserves the existing endgame-1..endgame-4 level ids (backward compatibility)", () => {
    for (const id of ["endgame-1", "endgame-2", "endgame-3", "endgame-4"]) {
      expect(getLevelById(id), `expected ${id} to still exist`).toBeDefined();
    }
  });

  it("new mixed chapter wires all 8 mixed problems (MIX-001..008)", () => {
    const mixed = getChapterById("mixed");
    expect(mixed).toBeDefined();
    expect(mixed?.title).toBe("综合擂台");
    expect(mixed?.levels.length).toBe(4);

    const mixedProblemIds = getAllProblemIdsInChapter("mixed");
    for (const id of ["MIX-001", "MIX-002", "MIX-003", "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008"]) {
      expect(mixedProblemIds, `mixed missing ${id}`).toContain(id);
    }
  });

  it("mixed-1..mixed-4 level ids exist", () => {
    for (const id of ["mixed-1", "mixed-2", "mixed-3", "mixed-4"]) {
      expect(getLevelById(id), `expected ${id} to exist`).toBeDefined();
    }
  });

  it("categoryLabels has a 'mixed' entry", () => {
    expect(categoryLabels.mixed).toBeDefined();
    expect(typeof categoryLabels.mixed).toBe("string");
  });
});

describe("v0.21.0b — getAllProblemIds daily rotation pool", () => {
  it("v0.21.0b scope: daily pool now includes all 9 v0.20.0d Pack B problems + the 3 pre-existing v0.4.0b MIX problems (12 new entries in scope)", () => {
    const allIds = new Set(getAllProblemIds());
    const v0_21_0b_in_scope = [
      // v0.20.0d Pack B
      "END-013", "END-014", "END-015", "END-016",
      "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008",
      // v0.4.0b MIX that were unreachable before this slice
      "MIX-001", "MIX-002", "MIX-003",
    ];
    for (const id of v0_21_0b_in_scope) {
      expect(allIds.has(id), `v0.21.0b scope problem ${id} missing from daily pool`).toBe(true);
    }
  });

  it("v0.21.0b out of scope: END-011/012, CAP-022, CC-018 are not in the daily pool yet (deferred to a later slice)", () => {
    const allIds = new Set(getAllProblemIds());
    // END-011/012 are v0.7.0b endgame problems that were added to
    // problems.json but never wired. CAP-022 and CC-018 are likewise
    // v0.7.0b additions that were never wired. v0.21.0b is scoped to
    // Pack B wiring only; wiring these is a follow-up slice.
    // (Note: MULTI-008 and MULTI-009 ARE in the daily pool because
    // they were wired in v0.8 wiring.)
    const out_of_scope = ["END-011", "END-012", "CAP-022", "CC-018"];
    for (const id of out_of_scope) {
      expect(allIds.has(id), `v0.21.0b OUT-OF-SCOPE: ${id} unexpectedly in daily pool`).toBe(false);
    }
  });

  it("v0.20.0d Pack B problems appear in their correct chapters", () => {
    expect(getChapterById("endgame")!.levels.find((l) => l.id === "endgame-5")!.problemIds)
      .toEqual(expect.arrayContaining(["END-013", "END-014", "END-015", "END-016"]));
    const mixedIds = getAllProblemIdsInChapter("mixed");
    expect(mixedIds)
      .toEqual(expect.arrayContaining(["MIX-001", "MIX-002", "MIX-003", "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008"]));
  });
});
