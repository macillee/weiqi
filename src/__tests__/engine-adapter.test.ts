import { describe, it, expect, beforeEach, vi } from "vitest";
import { parseEngineConfig, checkEngineAvailability } from "@/lib/engine-config";
import {
  buildAnalysisArgs,
  getEngineAvailability,
  analyzeWrongMove,
  type EngineReviewInput,
} from "@/lib/engine-adapter";

const mockExistsSync = () => true;

function makeReviewInput(overrides?: Partial<EngineReviewInput>): EngineReviewInput {
  return {
    boardSize: 9,
    toPlay: "black",
    initialStones: [],
    attemptedMove: { x: 3, y: 3 },
    authoredAnswer: { x: 2, y: 3 },
    category: "capture",
    ...overrides,
  };
}

describe("engine-config", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
    delete process.env.KATAGO_ENABLED;
    delete process.env.KATAGO_BIN_PATH;
    delete process.env.KATAGO_MODEL_PATH;
    delete process.env.KATAGO_CONFIG_PATH;
    delete process.env.KATAGO_VISITS;
    delete process.env.KATAGO_TIMEOUT_MS;
  });

  it("parseEngineConfig returns defaults when no env vars set", () => {
    const cfg = parseEngineConfig();
    expect(cfg.enabled).toBe(false);
    expect(cfg.binPath).toBe("");
    expect(cfg.modelPath).toBe("");
    expect(cfg.configPath).toBeUndefined();
    expect(cfg.visits).toBe(300);
    expect(cfg.timeoutMs).toBe(5000);
  });

  it("parseEngineConfig reads all env vars", () => {
    process.env.KATAGO_ENABLED = "true";
    process.env.KATAGO_BIN_PATH = "/usr/local/bin/katago";
    process.env.KATAGO_MODEL_PATH = "/models/kata1.bin.gz";
    process.env.KATAGO_CONFIG_PATH = "/etc/katago.cfg";
    process.env.KATAGO_VISITS = "100";
    process.env.KATAGO_TIMEOUT_MS = "3000";

    const cfg = parseEngineConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.binPath).toBe("/usr/local/bin/katago");
    expect(cfg.modelPath).toBe("/models/kata1.bin.gz");
    expect(cfg.configPath).toBe("/etc/katago.cfg");
    expect(cfg.visits).toBe(100);
    expect(cfg.timeoutMs).toBe(3000);
  });

  it("parseEngineConfig clamps invalid visits to default", () => {
    process.env.KATAGO_VISITS = "-5";
    expect(parseEngineConfig().visits).toBe(300);
    process.env.KATAGO_VISITS = "0";
    expect(parseEngineConfig().visits).toBe(300);
    process.env.KATAGO_VISITS = "abc";
    expect(parseEngineConfig().visits).toBe(300);
    process.env.KATAGO_VISITS = "";
    expect(parseEngineConfig().visits).toBe(300);
  });

  it("parseEngineConfig clamps invalid timeout to default", () => {
    process.env.KATAGO_TIMEOUT_MS = "-1";
    expect(parseEngineConfig().timeoutMs).toBe(5000);
    process.env.KATAGO_TIMEOUT_MS = "0";
    expect(parseEngineConfig().timeoutMs).toBe(5000);
    process.env.KATAGO_TIMEOUT_MS = "not-a-number";
    expect(parseEngineConfig().timeoutMs).toBe(5000);
  });

  describe("checkEngineAvailability", () => {
    it("returns disabled when not enabled", () => {
      const result = checkEngineAvailability({
        enabled: false,
        binPath: "",
        modelPath: "",
        configPath: undefined,
        visits: 300,
        timeoutMs: 5000,
      });
      expect(result.available).toBe(false);
      expect(result.reason).toBe("disabled");
    });

    it("returns missing-binary when binPath is empty", () => {
      const result = checkEngineAvailability({
        enabled: true,
        binPath: "",
        modelPath: "/models/kata1.bin.gz",
        configPath: undefined,
        visits: 300,
        timeoutMs: 5000,
      });
      expect(result.available).toBe(false);
      expect(result.reason).toBe("missing-binary");
    });

    it("returns missing-model when modelPath is empty", () => {
      const result = checkEngineAvailability({
        enabled: true,
        binPath: "/usr/local/bin/katago",
        modelPath: "",
        configPath: undefined,
        visits: 300,
        timeoutMs: 5000,
      });
      expect(result.available).toBe(false);
      expect(result.reason).toBe("missing-model");
    });

    it("returns missing-binary when existsSync returns false for binPath", () => {
      const falseExists = () => false;
      const result = checkEngineAvailability({
        enabled: true,
        binPath: "/usr/local/bin/katago",
        modelPath: "/models/kata1.bin.gz",
        configPath: undefined,
        visits: 300,
        timeoutMs: 5000,
      }, falseExists);
      expect(result.available).toBe(false);
      expect(result.reason).toBe("missing-binary");
    });

    it("returns missing-model when existsSync returns false for modelPath", () => {
      let callCount = 0;
      const falseOnSecond = () => {
        callCount++;
        return callCount < 2;
      };
      const result = checkEngineAvailability({
        enabled: true,
        binPath: "/usr/local/bin/katago",
        modelPath: "/models/kata1.bin.gz",
        configPath: undefined,
        visits: 300,
        timeoutMs: 5000,
      }, falseOnSecond);
      expect(result.available).toBe(false);
      expect(result.reason).toBe("missing-model");
    });

    it("returns available when existsSync returns true", () => {
      const result = checkEngineAvailability({
        enabled: true,
        binPath: "/usr/local/bin/katago",
        modelPath: "/models/kata1.bin.gz",
        configPath: undefined,
        visits: 300,
        timeoutMs: 5000,
      }, mockExistsSync);
      expect(result.available).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });
});

describe("engine-adapter", () => {
  describe("getEngineAvailability", () => {
    it("returns disabled when engine not enabled", () => {
      const result = getEngineAvailability({
        enabled: false,
        binPath: "/usr/local/bin/katago",
        modelPath: "/models/kata1.bin.gz",
        configPath: undefined,
        visits: 300,
        timeoutMs: 5000,
      });
      expect(result.available).toBe(false);
      expect(result.enabled).toBe(false);
      expect(result.reason).toBe("disabled");
    });

    it("returns available=false when paths are empty", () => {
      const result = getEngineAvailability({
        enabled: true,
        binPath: "",
        modelPath: "",
        configPath: undefined,
        visits: 300,
        timeoutMs: 5000,
      });
      expect(result.available).toBe(false);
      expect(result.enabled).toBe(true);
    });
  });

  describe("buildAnalysisArgs", () => {
    it("builds command for empty board", () => {
      const config = {
        enabled: true,
        binPath: "/usr/local/bin/katago",
        modelPath: "/models/kata1.bin.gz",
        configPath: undefined,
        visits: 300,
        timeoutMs: 5000,
      };
      const input = makeReviewInput();
      const args = buildAnalysisArgs(config, input);
      expect(args).toContain("analysis");
      expect(args).toContain("-model");
      expect(args).toContain("/models/kata1.bin.gz");
      expect(args).toContain("-config");
      expect(args).toContain("default_gtp.cfg");
      expect(args).toContain("-override");
      expect(args).toContain("boardXSize=9");
      expect(args).toContain("boardYSize=9");
      expect(args).toContain("playouts=300");
    });

    it("includes initial stones when provided", () => {
      const config = {
        enabled: true,
        binPath: "/usr/local/bin/katago",
        modelPath: "/models/kata1.bin.gz",
        configPath: "/etc/katago.cfg",
        visits: 100,
        timeoutMs: 5000,
      };
      const input = makeReviewInput({
        initialStones: [
          { x: 0, y: 0, color: "black" },
          { x: 4, y: 4, color: "white" },
        ],
      });
      const args = buildAnalysisArgs(config, input);
      expect(args).toContain("/etc/katago.cfg");
      expect(args).toContain("initialStones=0,0,B,4,4,W");
      expect(args).toContain("playouts=100");
    });
  });

  describe("analyzeWrongMove", () => {
    const mockConfig = {
      enabled: true,
      binPath: "/usr/local/bin/katago",
      modelPath: "/models/kata1.bin.gz",
      configPath: undefined,
      visits: 100,
      timeoutMs: 5000,
    };

    it("returns null when engine not enabled", async () => {
      const result = await analyzeWrongMove(
        makeReviewInput(),
        { ...mockConfig, enabled: false },
      );
      expect(result).toBeNull();
    });

    it("returns null when paths are empty", async () => {
      const result = await analyzeWrongMove(
        makeReviewInput(),
        { ...mockConfig, binPath: "" },
      );
      expect(result).toBeNull();
    });

    it("returns null when model path is empty", async () => {
      const result = await analyzeWrongMove(
        makeReviewInput(),
        { ...mockConfig, modelPath: "" },
      );
      expect(result).toBeNull();
    });

    it("returns signal with parsed engine output", async () => {
      const mockStdout = JSON.stringify({
        moveInfos: [
          { move: [2, 3], visits: 150, scoreLead: 3.5, winrate: 0.85 },
          { move: [3, 3], visits: 50, scoreLead: 1.2, winrate: 0.55 },
          { move: [0, 0], visits: 10, scoreLead: -2.1, winrate: 0.3 },
        ],
      });

      const mockExecFile = vi.fn().mockResolvedValue({ stdout: mockStdout, stderr: "" });

      const result = await analyzeWrongMove(
        makeReviewInput(),
        mockConfig,
        mockExecFile,
        mockExistsSync,
      );

      expect(result).not.toBeNull();
      expect(result!.source).toBe("katago");
      expect(result!.topMoves).toHaveLength(3);
      expect(result!.topMoves[0].x).toBe(2);
      expect(result!.topMoves[0].y).toBe(3);
      expect(result!.authoredAnswerRank).toBe(1);
      expect(result!.attemptedMoveRank).toBe(2);
      expect(result!.agreesWithAuthoredAnswer).toBe(true);
      expect(result!.confidence).toBe("medium");
    });

    it("returns low confidence when visits are low", async () => {
      const mockStdout = JSON.stringify({
        moveInfos: [{ move: [2, 3], visits: 10 }],
      });

      const mockExecFile = vi.fn().mockResolvedValue({ stdout: mockStdout, stderr: "" });

      const result = await analyzeWrongMove(
        makeReviewInput(),
        mockConfig,
        mockExecFile,
        mockExistsSync,
      );

      expect(result).not.toBeNull();
      expect(result!.confidence).toBe("low");
    });

    it("returns high confidence when visits are high", async () => {
      const mockStdout = JSON.stringify({
        moveInfos: [{ move: [2, 3], visits: 250 }],
      });

      const mockExecFile = vi.fn().mockResolvedValue({ stdout: mockStdout, stderr: "" });

      const result = await analyzeWrongMove(
        makeReviewInput(),
        mockConfig,
        mockExecFile,
        mockExistsSync,
      );

      expect(result).not.toBeNull();
      expect(result!.confidence).toBe("high");
    });

    it("returns null when engine times out", async () => {
      const mockExecFile = vi.fn().mockRejectedValue(new Error("process timed out"));

      const result = await analyzeWrongMove(
        makeReviewInput(),
        mockConfig,
        mockExecFile,
        mockExistsSync,
      );

      expect(result).toBeNull();
    });

    it("returns null when engine returns unparseable output", async () => {
      const mockExecFile = vi.fn().mockResolvedValue({ stdout: "not json", stderr: "" });

      const result = await analyzeWrongMove(
        makeReviewInput(),
        mockConfig,
        mockExecFile,
        mockExistsSync,
      );

      expect(result).toBeNull();
    });

    it("returns null ranks when authoredAnswer/attemptedMove not in top moves", async () => {
      const mockStdout = JSON.stringify({
        moveInfos: [{ move: [5, 5], visits: 100 }],
      });

      const mockExecFile = vi.fn().mockResolvedValue({ stdout: mockStdout, stderr: "" });

      const result = await analyzeWrongMove(
        makeReviewInput(),
        mockConfig,
        mockExecFile,
        mockExistsSync,
      );

      expect(result).not.toBeNull();
      expect(result!.authoredAnswerRank).toBeNull();
      expect(result!.attemptedMoveRank).toBeNull();
      expect(result!.agreesWithAuthoredAnswer).toBe(false);
    });

    it("passes timeout to execFile", async () => {
      const mockExecFile = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });

      await analyzeWrongMove(
        makeReviewInput(),
        { ...mockConfig, timeoutMs: 3000 },
        mockExecFile,
        mockExistsSync,
      );

      expect(mockExecFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({ timeout: 3000 }),
      );
    });

    it("returns null on execFile error (non-zero exit)", async () => {
      const mockExecFile = vi.fn().mockRejectedValue(new Error("Command failed: exit code 1"));

      const result = await analyzeWrongMove(
        makeReviewInput(),
        mockConfig,
        mockExecFile,
        mockExistsSync,
      );

      expect(result).toBeNull();
    });
  });
});
