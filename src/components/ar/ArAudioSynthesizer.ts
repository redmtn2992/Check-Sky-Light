// Web Audio API Synthesizer for Tactical Sound Effects
// ABSOLUTE SILENCE DIRECTIVE: Sound is disabled by default to keep device speaker completely silent,
// preventing phone speaker bleed into the microphone during authentic UAP encounter recordings.
import { 
  isTargetLockSoundEnabled, 
  isRadarPingSoundEnabled, 
  isCameraShutterSoundEnabled 
} from '../../lib/soundSettings';

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;

export function unlockAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    if (audioCtx && audioCtx.state === 'running') {
      const buffer = audioCtx.createBuffer(1, 1, 22050);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start(0);
    }
  } catch {
    // Ignore audio unlock exceptions
  }
  return audioCtx;
}

if (typeof window !== 'undefined') {
  const unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown'];
  const handleFirstInteraction = () => {
    unlockAudioContext();
    unlockEvents.forEach((evt) => {
      window.removeEventListener(evt, handleFirstInteraction, true);
    });
  };
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleFirstInteraction, { capture: true, passive: true });
  });
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getMasterDestination(ctx: AudioContext): AudioNode {
  try {
    if (!masterCompressor || masterCompressor.context !== ctx) {
      masterCompressor = ctx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-10, ctx.currentTime);
      masterCompressor.knee.setValueAtTime(8, ctx.currentTime);
      masterCompressor.ratio.setValueAtTime(6, ctx.currentTime);
      masterCompressor.attack.setValueAtTime(0.002, ctx.currentTime);
      masterCompressor.release.setValueAtTime(0.08, ctx.currentTime);
      masterCompressor.connect(ctx.destination);
    }
    return masterCompressor;
  } catch {
    return ctx.destination;
  }
}

export function playTargetAcquiredChime(freq: number = 880, durationSec: number = 0.28) {
  if (!isTargetLockSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + durationSec);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSec);
    osc.connect(gain);
    gain.connect(getMasterDestination(ctx));
    osc.start(t);
    osc.stop(t + durationSec);
  } catch {
    // Ignore audio playback exceptions
  }
}

export function playTargetLockedSolidTone(freq: number = 1046, durationSec: number = 0.38) {
  if (!isTargetLockSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.25, t);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.setValueAtTime(0.28, t + durationSec * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSec);
    const master = getMasterDestination(ctx);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(master);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + durationSec);
    osc2.stop(t + durationSec);
  } catch {
    // Ignore audio error
  }
}

export function playFighterJetMissileLockTone() {
  if (!isTargetLockSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    const master = getMasterDestination(ctx);

    const chirp1 = ctx.createOscillator();
    const chirp1Gain = ctx.createGain();
    chirp1.type = 'sawtooth';
    chirp1.frequency.setValueAtTime(900, t);
    chirp1.frequency.linearRampToValueAtTime(1450, t + 0.05);
    chirp1Gain.gain.setValueAtTime(0.24, t);
    chirp1Gain.gain.linearRampToValueAtTime(0.001, t + 0.05);
    chirp1.connect(chirp1Gain);
    chirp1Gain.connect(master);
    chirp1.start(t);
    chirp1.stop(t + 0.05);

    const chirp2 = ctx.createOscillator();
    const chirp2Gain = ctx.createGain();
    chirp2.type = 'sawtooth';
    chirp2.frequency.setValueAtTime(1150, t + 0.06);
    chirp2.frequency.linearRampToValueAtTime(1750, t + 0.11);
    chirp2Gain.gain.setValueAtTime(0.26, t + 0.06);
    chirp2Gain.gain.linearRampToValueAtTime(0.001, t + 0.11);
    chirp2.connect(chirp2Gain);
    chirp2Gain.connect(master);
    chirp2.start(t + 0.06);
    chirp2.stop(t + 0.11);

    const solidOsc1 = ctx.createOscillator();
    const solidOsc2 = ctx.createOscillator();
    const solidGain = ctx.createGain();
    solidOsc1.type = 'square';
    solidOsc1.frequency.setValueAtTime(1046, t + 0.11);
    solidOsc2.type = 'sawtooth';
    solidOsc2.frequency.setValueAtTime(1050, t + 0.11);
    solidGain.gain.setValueAtTime(0.001, t);
    solidGain.gain.setValueAtTime(0.28, t + 0.11);
    solidGain.gain.setValueAtTime(0.28, t + 0.38);
    solidGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
    solidOsc1.connect(solidGain);
    solidOsc2.connect(solidGain);
    solidGain.connect(master);
    solidOsc1.start(t + 0.11);
    solidOsc2.start(t + 0.11);
    solidOsc1.stop(t + 0.48);
    solidOsc2.stop(t + 0.48);
  } catch {
    playTargetLockedSolidTone();
  }
}

export function playTargetAcquiringTone() {
  if (!isTargetLockSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.08);
    gain.gain.setValueAtTime(0.20, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain);
    gain.connect(getMasterDestination(ctx));
    osc.start(t);
    osc.stop(t + 0.08);
  } catch {
    // Ignore
  }
}

export function playTargetBreakTone() {
  if (!isTargetLockSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(480, t);
    osc1.frequency.exponentialRampToValueAtTime(220, t + 0.18);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(475, t);
    osc2.frequency.exponentialRampToValueAtTime(215, t + 0.18);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    const master = getMasterDestination(ctx);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(master);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.18);
    osc2.stop(t + 0.18);
  } catch {
    // Ignore
  }
}

export function playTrackingRadarSweepPing(freq: number = 750, durationSec: number = 0.16) {
  if (!isRadarPingSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + durationSec);
    gain.gain.setValueAtTime(0.20, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSec);
    osc.connect(gain);
    gain.connect(getMasterDestination(ctx));
    osc.start(t);
    osc.stop(t + durationSec);
  } catch {
    // Ignore
  }
}

export function playCameraShutterSound() {
  if (!isCameraShutterSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(getMasterDestination(ctx));
    whiteNoise.start(t);
  } catch {
    // Ignore
  }
}

export function triggerHapticFeedback(pattern: number[] = [25, 35, 25]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error
    }
  }
}

/**
 * Diagnostic Speaker Test:
 * Explicitly invoked by user inside Sound Options to test device speaker volume.
 * Operates on-demand with a gentle, non-intrusive 880Hz chime.
 */
export function playDiagnosticSpeakerTest() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.22);
    gain.gain.setValueAtTime(0.20, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain);
    gain.connect(getMasterDestination(ctx));
    osc.start(t);
    osc.stop(t + 0.22);
  } catch {
    // Ignore
  }
}

