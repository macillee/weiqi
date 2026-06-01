import { describe, it, expect } from "vitest";
import {
  extractHintCoordinate,
  extractHintCoordinates,
} from "@/lib/hintCoordinate";

describe("extractHintCoordinate", () => {
  it("parses a single (x, y) coordinate", () => {
    expect(extractHintCoordinate("第一步：黑棋下在中间 (3,4)", 9)).toEqual({
      x: 3,
      y: 4,
    });
  });

  it("parses (x,y) without surrounding whitespace", () => {
    expect(extractHintCoordinate("下在(0,0) 就能守住自己的地盘", 9)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("parses coordinates with extra spaces", () => {
    expect(extractHintCoordinate("下在 ( 6 , 6 ) 附近", 9)).toEqual({
      x: 6,
      y: 6,
    });
  });

  it("returns the first in-range coordinate when multiple are present", () => {
    expect(
      extractHintCoordinate("从 (0,0) 到 (4,4) 再到 (8,8)", 9),
    ).toEqual({ x: 0, y: 0 });
  });

  it("skips out-of-range coordinates and returns the next in-range one", () => {
    expect(extractHintCoordinate("试 (9,9) 然后下在 (2,2)", 9)).toEqual({
      x: 2,
      y: 2,
    });
  });

  it("returns null when no coordinate pattern is present", () => {
    expect(extractHintCoordinate("白棋上面、左边、下面都有黑棋", 9)).toBeNull();
  });

  it("returns null when the only coordinate is out of range", () => {
    expect(extractHintCoordinate("下在 (9,9) 才能赢", 9)).toBeNull();
  });

  it("returns null for negative coordinates", () => {
    expect(extractHintCoordinate("下在 (-1, 3) 就行", 9)).toBeNull();
  });

  it("returns null for malformed patterns", () => {
    expect(extractHintCoordinate("下在 3,4 就行", 9)).toBeNull();
    expect(extractHintCoordinate("下在 (3 4) 就行", 9)).toBeNull();
    expect(extractHintCoordinate("下在 (3,) 就行", 9)).toBeNull();
    expect(extractHintCoordinate("下在 (,4) 就行", 9)).toBeNull();
  });

  it("returns null for empty or non-string input", () => {
    expect(extractHintCoordinate("", 9)).toBeNull();
    expect(extractHintCoordinate(null, 9)).toBeNull();
    expect(extractHintCoordinate(undefined, 9)).toBeNull();
  });

  it("returns null when boardSize is invalid", () => {
    expect(extractHintCoordinate("下在 (3,4)", 0)).toBeNull();
    expect(extractHintCoordinate("下在 (3,4)", -1)).toBeNull();
    expect(extractHintCoordinate("下在 (3,4)", 1.5)).toBeNull();
  });

  it("respects the provided boardSize boundary", () => {
    expect(extractHintCoordinate("下在 (3,3)", 4)).toEqual({ x: 3, y: 3 });
    expect(extractHintCoordinate("下在 (4,4)", 4)).toBeNull();
  });
});

describe("extractHintCoordinates", () => {
  it("returns coordinates from each hint that contains one", () => {
    const hints = [
      "第一步：黑棋下在中间 (3,4)",
      "白棋被包围了",
      "下在 (2,2) 就能守住自己的地盘",
    ];
    expect(extractHintCoordinates(hints, 9)).toEqual([
      { x: 3, y: 4 },
      { x: 2, y: 2 },
    ]);
  });

  it("returns an empty array when no hints contain coordinates", () => {
    expect(
      extractHintCoordinates(["上面", "左边", "中间"], 9),
    ).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(extractHintCoordinates([], 9)).toEqual([]);
  });
});
