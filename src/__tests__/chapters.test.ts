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

  it("every Pack B ID appears exactly once across all chapters (exact-once duplicate protection)", () => {
    const packBIds = [
      "END-013", "END-014", "END-015", "END-016",
      "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008",
    ];
    const allProblemIds = getAllProblemIds();
    for (const id of packBIds) {
      const count = allProblemIds.filter((pid) => pid === id).length;
      expect(count, `Pack B ID ${id} appears ${count} times, expected exactly 1`).toBe(1);
    }
  });

  it("no duplicated problemId exists globally across all chapters", () => {
    const allProblemIds = getAllProblemIds();
    const seen = new Map<string, number>();
    for (const id of allProblemIds) {
      seen.set(id, (seen.get(id) ?? 0) + 1);
    }
    const duplicates = [...seen.entries()].filter(([, count]) => count > 1);
    expect(duplicates, `duplicated problemIds found: ${duplicates.map(([id, count]) => `${id}(${count}x)`).join(", ")}`).toHaveLength(0);
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

  it("v0.20.0d Pack B problems appear in their correct chapters", () => {
    expect(getChapterById("endgame")!.levels.find((l) => l.id === "endgame-5")!.problemIds)
      .toEqual(expect.arrayContaining(["END-013", "END-014", "END-015", "END-016"]));
    const mixedIds = getAllProblemIdsInChapter("mixed");
    expect(mixedIds)
      .toEqual(expect.arrayContaining(["MIX-001", "MIX-002", "MIX-003", "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008"]));
  });
});

describe("v0.22.0b — Wire remaining 4 unwired v0.7.0b problems", () => {
  it("getAllProblemIds count grew from 99 to at least 103 (v0.23.0b extends further)", () => {
    const allIds = getAllProblemIds();
    expect(allIds.length).toBeGreaterThanOrEqual(103);
  });

  it("END-011 and END-012 are wired in the endgame chapter", () => {
    const endgameIds = getAllProblemIdsInChapter("endgame");
    expect(endgameIds, "endgame missing END-011").toContain("END-011");
    expect(endgameIds, "endgame missing END-012").toContain("END-012");
  });

  it("endgame-6 level exists and contains END-011 and END-012", () => {
    const level = getLevelById("endgame-6");
    expect(level).toBeDefined();
    expect(level?.problemIds).toEqual(expect.arrayContaining(["END-011", "END-012"]));
  });

  it("CAP-022 is wired in the capture chapter", () => {
    const captureIds = getAllProblemIdsInChapter("capture");
    expect(captureIds, "capture missing CAP-022").toContain("CAP-022");
  });

  it("capture-13 level exists and contains CAP-022", () => {
    const level = getLevelById("capture-13");
    expect(level).toBeDefined();
    expect(level?.problemIds).toEqual(["CAP-022"]);
  });

  it("CC-018 is wired in the connect_cut chapter", () => {
    const ccIds = getAllProblemIdsInChapter("connect_cut");
    expect(ccIds, "connect_cut missing CC-018").toContain("CC-018");
  });

  it("connect-cut-9 level exists and contains CC-018", () => {
    const level = getLevelById("connect-cut-9");
    expect(level).toBeDefined();
    expect(level?.problemIds).toEqual(["CC-018"]);
  });

  it("each of the 4 target IDs appears exactly once across all chapters", () => {
    const targetIds = ["END-011", "END-012", "CAP-022", "CC-018"];
    const allProblemIds = getAllProblemIds();
    for (const id of targetIds) {
      const count = allProblemIds.filter((pid) => pid === id).length;
      expect(count, `${id} appears ${count} times, expected exactly 1`).toBe(1);
    }
  });

  it("no duplicated problemId exists globally across all chapters", () => {
    const allProblemIds = getAllProblemIds();
    const seen = new Map<string, number>();
    for (const id of allProblemIds) {
      seen.set(id, (seen.get(id) ?? 0) + 1);
    }
    const duplicates = [...seen.entries()].filter(([, count]) => count > 1);
    expect(duplicates, `duplicated problemIds found: ${duplicates.map(([id, count]) => `${id}(${count}x)`).join(", ")}`).toHaveLength(0);
  });

  it("existing v0.21.0b Pack B wiring remains unchanged", () => {
    const endgame5 = getLevelById("endgame-5");
    expect(endgame5?.problemIds).toEqual(expect.arrayContaining(["END-013", "END-014", "END-015", "END-016"]));
    const mixedIds = getAllProblemIdsInChapter("mixed");
    expect(mixedIds).toEqual(expect.arrayContaining(["MIX-001", "MIX-002", "MIX-003", "MIX-004", "MIX-005", "MIX-006", "MIX-007", "MIX-008"]));
  });
});

describe("v0.23.0b — Wire remaining 7 unwired v0.7.0b problems", () => {
  it("getAllProblemIds count moves from 103 to 110 (full library coverage)", () => {
    const allIds = getAllProblemIds();
    expect(allIds.length).toBe(110);
  });

  it("CAP-021 is wired in the capture chapter", () => {
    const captureIds = getAllProblemIdsInChapter("capture");
    expect(captureIds, "capture missing CAP-021").toContain("CAP-021");
  });

  it("capture-14 level exists and contains CAP-021", () => {
    const level = getLevelById("capture-14");
    expect(level).toBeDefined();
    expect(level?.problemIds).toEqual(["CAP-021"]);
  });

  it("ESC-013 and ESC-014 are wired in the escape chapter", () => {
    const escapeIds = getAllProblemIdsInChapter("escape");
    expect(escapeIds, "escape missing ESC-013").toContain("ESC-013");
    expect(escapeIds, "escape missing ESC-014").toContain("ESC-014");
  });

  it("escape-9 level exists and contains ESC-013 and ESC-014", () => {
    const level = getLevelById("escape-9");
    expect(level).toBeDefined();
    expect(level?.problemIds).toEqual(expect.arrayContaining(["ESC-013", "ESC-014"]));
  });

  it("CC-017 is wired in the connect_cut chapter", () => {
    const ccIds = getAllProblemIdsInChapter("connect_cut");
    expect(ccIds, "connect_cut missing CC-017").toContain("CC-017");
  });

  it("connect-cut-10 level exists and contains CC-017", () => {
    const level = getLevelById("connect-cut-10");
    expect(level).toBeDefined();
    expect(level?.problemIds).toEqual(["CC-017"]);
  });

  it("OP-011 and OP-012 are wired in the opening chapter", () => {
    const openingIds = getAllProblemIdsInChapter("opening");
    expect(openingIds, "opening missing OP-011").toContain("OP-011");
    expect(openingIds, "opening missing OP-012").toContain("OP-012");
  });

  it("opening-6 level exists and contains OP-011 and OP-012", () => {
    const level = getLevelById("opening-6");
    expect(level).toBeDefined();
    expect(level?.problemIds).toEqual(expect.arrayContaining(["OP-011", "OP-012"]));
  });

  it("LD-013 is wired in the life_death chapter", () => {
    const ldIds = getAllProblemIdsInChapter("life_death");
    expect(ldIds, "life_death missing LD-013").toContain("LD-013");
  });

  it("life-death-7 level exists and contains LD-013", () => {
    const level = getLevelById("life-death-7");
    expect(level).toBeDefined();
    expect(level?.problemIds).toEqual(["LD-013"]);
  });

  it("each of the 7 target IDs appears exactly once across all chapters", () => {
    const targetIds = ["CAP-021", "CC-017", "ESC-013", "ESC-014", "LD-013", "OP-011", "OP-012"];
    const allProblemIds = getAllProblemIds();
    for (const id of targetIds) {
      const count = allProblemIds.filter((pid) => pid === id).length;
      expect(count, `${id} appears ${count} times, expected exactly 1`).toBe(1);
    }
  });

  it("no duplicated problemId exists globally across all chapters", () => {
    const allProblemIds = getAllProblemIds();
    const seen = new Map<string, number>();
    for (const id of allProblemIds) {
      seen.set(id, (seen.get(id) ?? 0) + 1);
    }
    const duplicates = [...seen.entries()].filter(([, count]) => count > 1);
    expect(duplicates, `duplicated problemIds found: ${duplicates.map(([id, count]) => `${id}(${count}x)`).join(", ")}`).toHaveLength(0);
  });

  it("existing v0.22.0b wiring remains unchanged", () => {
    const capture13 = getLevelById("capture-13");
    expect(capture13?.problemIds).toEqual(["CAP-022"]);
    const endgame6 = getLevelById("endgame-6");
    expect(endgame6?.problemIds).toEqual(expect.arrayContaining(["END-011", "END-012"]));
    const cc9 = getLevelById("connect-cut-9");
    expect(cc9?.problemIds).toEqual(["CC-018"]);
  });
});
