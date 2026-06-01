import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  AUDIO_PREFERENCE_KEY,
  isAudioEnabled,
  loadAudioPreference,
  setAudioEnabled,
  playCorrect,
  playWrong,
  _resetAudioContextForTest,
} from "@/lib/audioFeedback";

describe("audioFeedback preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
    _resetAudioContextForTest();
  });

  it("defaults to enabled when no preference stored", () => {
    expect(loadAudioPreference()).toBe(true);
    expect(isAudioEnabled()).toBe(true);
  });

  it("persists enabled = false across reads", () => {
    setAudioEnabled(false);
    expect(loadAudioPreference()).toBe(false);
    expect(isAudioEnabled()).toBe(false);
  });

  it("persists enabled = true across reads", () => {
    setAudioEnabled(false);
    setAudioEnabled(true);
    expect(loadAudioPreference()).toBe(true);
  });

  it("writes the value using the documented storage key", () => {
    setAudioEnabled(false);
    expect(window.localStorage.getItem(AUDIO_PREFERENCE_KEY)).toBe("false");
    setAudioEnabled(true);
    expect(window.localStorage.getItem(AUDIO_PREFERENCE_KEY)).toBe("true");
  });

  it("treats stored value 'true' as enabled and any other string as disabled", () => {
    window.localStorage.setItem(AUDIO_PREFERENCE_KEY, "true");
    expect(loadAudioPreference()).toBe(true);

    window.localStorage.setItem(AUDIO_PREFERENCE_KEY, "yes");
    expect(loadAudioPreference()).toBe(false);

    window.localStorage.setItem(AUDIO_PREFERENCE_KEY, "");
    expect(loadAudioPreference()).toBe(false);
  });

  it("falls back to default when localStorage access throws", () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    expect(loadAudioPreference()).toBe(true);
    getItemSpy.mockRestore();
  });

  it("setAudioEnabled is a no-op when localStorage write throws", () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    expect(() => setAudioEnabled(false)).not.toThrow();
    setItemSpy.mockRestore();
  });
});

describe("audioFeedback playback (no real audio)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    _resetAudioContextForTest();
  });

  it("playCorrect returns without throwing when AudioContext is unavailable", async () => {
    const originalAudioContext = (window as unknown as { AudioContext?: unknown }).AudioContext;
    (window as unknown as { AudioContext?: unknown }).AudioContext = undefined;
    (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext = undefined;
    try {
      await expect(playCorrect()).resolves.toBeUndefined();
      await expect(playWrong()).resolves.toBeUndefined();
    } finally {
      (window as unknown as { AudioContext?: unknown }).AudioContext = originalAudioContext;
    }
  });

  it("playCorrect skips audio when preference is disabled", async () => {
    setAudioEnabled(false);
    const oscSpy = vi.fn();
    const mockOsc = {
      type: "" as OscillatorType,
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      start: oscSpy,
      stop: vi.fn(),
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn().mockReturnThis(),
    };
    const mockCtx = {
      state: "running",
      currentTime: 0,
      destination: {},
      createOscillator: () => mockOsc,
      createGain: () => mockGain,
      resume: vi.fn().mockResolvedValue(undefined),
    };
    (window as unknown as { AudioContext?: unknown }).AudioContext = function () {
      return mockCtx;
    };
    _resetAudioContextForTest();

    await playCorrect();
    expect(oscSpy).not.toHaveBeenCalled();
  });

  it("playCorrect plays a tone when enabled and AudioContext is available", async () => {
    const oscStart = vi.fn();
    const oscStop = vi.fn();
    const mockOsc = {
      type: "" as OscillatorType,
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      start: oscStart,
      stop: oscStop,
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn().mockReturnThis(),
    };
    const mockCtx = {
      state: "running",
      currentTime: 0,
      destination: {},
      createOscillator: () => mockOsc,
      createGain: () => mockGain,
      resume: vi.fn().mockResolvedValue(undefined),
    };
    (window as unknown as { AudioContext?: unknown }).AudioContext = function () {
      return mockCtx;
    };
    _resetAudioContextForTest();

    await playCorrect();
    expect(oscStart).toHaveBeenCalledTimes(1);
    expect(oscStop).toHaveBeenCalledTimes(1);
    expect(mockOsc.type).toBe("sine");
    expect(mockOsc.frequency.setValueAtTime).toHaveBeenCalledWith(660, 0);
  });

  it("playWrong plays a lower-pitch tone when enabled", async () => {
    const oscStart = vi.fn();
    const mockOsc = {
      type: "" as OscillatorType,
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      start: oscStart,
      stop: vi.fn(),
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn().mockReturnThis(),
    };
    const mockCtx = {
      state: "running",
      currentTime: 0,
      destination: {},
      createOscillator: () => mockOsc,
      createGain: () => mockGain,
      resume: vi.fn().mockResolvedValue(undefined),
    };
    (window as unknown as { AudioContext?: unknown }).AudioContext = function () {
      return mockCtx;
    };
    _resetAudioContextForTest();

    await playWrong();
    expect(oscStart).toHaveBeenCalledTimes(1);
    expect(mockOsc.type).toBe("sine");
    expect(mockOsc.frequency.setValueAtTime).toHaveBeenCalledWith(220, 0);
  });
});
