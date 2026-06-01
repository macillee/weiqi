export const AUDIO_PREFERENCE_KEY = "children-go-app:v0.6:audio";

const DEFAULT_ENABLED = true;

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function hasWebAudio(): boolean {
  if (!hasWindow()) return false;
  const w = window as unknown as { AudioContext?: unknown; webkitAudioContext?: unknown };
  return typeof w.AudioContext === "function" || typeof w.webkitAudioContext === "function";
}

function getAudioContextCtor(): (new () => AudioContext) | null {
  if (!hasWindow()) return null;
  const w = window as unknown as {
    AudioContext?: new () => AudioContext;
    webkitAudioContext?: new () => AudioContext;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function loadAudioPreference(): boolean {
  if (!hasWindow()) return DEFAULT_ENABLED;
  try {
    const raw = window.localStorage.getItem(AUDIO_PREFERENCE_KEY);
    if (raw === null) return DEFAULT_ENABLED;
    return raw === "true";
  } catch {
    return DEFAULT_ENABLED;
  }
}

export function isAudioEnabled(): boolean {
  return loadAudioPreference();
}

export function setAudioEnabled(enabled: boolean): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(AUDIO_PREFERENCE_KEY, enabled ? "true" : "false");
  } catch {
    return;
  }
}

type ToneSpec = {
  frequency: number;
  durationMs: number;
  type: OscillatorType;
  gain: number;
};

const CORRECT_TONE: ToneSpec = {
  frequency: 660,
  durationMs: 140,
  type: "sine",
  gain: 0.18,
};

const WRONG_TONE: ToneSpec = {
  frequency: 220,
  durationMs: 160,
  type: "sine",
  gain: 0.14,
};

let cachedContext: AudioContext | null = null;

function getSharedContext(): AudioContext | null {
  if (cachedContext) return cachedContext;
  const Ctor = getAudioContextCtor();
  if (!Ctor) return null;
  try {
    cachedContext = new Ctor();
  } catch {
    cachedContext = null;
  }
  return cachedContext;
}

async function ensureContextRunning(ctx: AudioContext): Promise<void> {
  if (ctx.state === "running") return;
  try {
    await ctx.resume();
  } catch {
    return;
  }
}

async function playTone(spec: ToneSpec): Promise<void> {
  if (!loadAudioPreference()) return;
  const ctx = getSharedContext();
  if (!ctx) return;
  await ensureContextRunning(ctx);
  if (ctx.state !== "running") return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = spec.type;
    oscillator.frequency.setValueAtTime(spec.frequency, ctx.currentTime);

    const peak = Math.max(0, Math.min(1, spec.gain));
    const start = ctx.currentTime;
    const stop = start + spec.durationMs / 1000;
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(peak, start + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, stop);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(stop + 0.02);
  } catch {
    return;
  }
}

export async function playCorrect(): Promise<void> {
  if (!hasWebAudio()) return;
  await playTone(CORRECT_TONE);
}

export async function playWrong(): Promise<void> {
  if (!hasWebAudio()) return;
  await playTone(WRONG_TONE);
}

export function _resetAudioContextForTest(): void {
  cachedContext = null;
}
