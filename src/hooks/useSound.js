import { useRef, useCallback } from 'react';

// ── Web Audio API (UI sounds) ──

let ctx = null;
let masterGain = null;

function initAudio() {
  if (ctx) return;
  ctx = new AudioContext();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.5;
  masterGain.connect(ctx.destination);
}

function playTone(frequency, durationMs, type = 'square', decayMs = 20, gainLevel = 0.3) {
  if (!ctx || !masterGain) return;
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  osc.type = type;
  osc.frequency.value = frequency;
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(gainLevel, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + decayMs / 1000);
  osc.start(t);
  osc.stop(t + durationMs / 1000);
}

function playSequence(tones) {
  tones.forEach(({ freq, duration, type = 'square', decay, delay = 0, gain = 0.3 }) => {
    setTimeout(() => playTone(freq, duration, type, decay, gain), delay);
  });
}

function playLayeredClick(highFreq, lowFreq, duration) {
  playTone(highFreq, duration, 'square', 15, 0.2);
  playTone(lowFreq, duration, 'square', 15, 0.15);
}

// ── Ambient audio files ──

const AMBIENT_FILES = {
  AMBIENT: '/audio/guilhermebernardes-caves-of-dawn-10376.mp3',
  'LO-FI': '/audio/desifreemusic-lo-fi-ambient-music-with-gentle-rain-sounds-377059.mp3',
  NOISE:   '/audio/tatamusic-restaurant-jazz-cafe-music-486651.mp3',
  RAIN:    '/audio/lorenzobuczek-sleepy-rain-116521.mp3',
};

let ambientAudio = null;

export function useSound() {
  const volumeRef = useRef(0.5);

  const init = useCallback(() => {
    initAudio();
  }, []);

  const setVolume = useCallback((v) => {
    volumeRef.current = v;
    if (masterGain) masterGain.gain.value = v;
    if (ambientAudio) ambientAudio.volume = v * 0.4;
  }, []);

  // ── UI sound events ──

  const sounds = {
    buttonPress:     () => playLayeredClick(1800, 180, 20),
    stepperUp:       () => playTone(1200, 25, 'square', 20, 0.2),
    stepperDown:     () => playTone(900, 25, 'square', 20, 0.2),
    soundSelect:     () => playTone(1400, 15, 'square', 10, 0.15),
    knobTick:        () => playTone(2000, 10, 'square', 8, 0.08),
    toggleOn: () => {
      playTone(2200, 18, 'square', 15, 0.2);
      playTone(160, 18, 'square', 15, 0.15);
    },
    toggleOff: () => {
      playTone(160, 18, 'square', 15, 0.15);
      playTone(2200, 18, 'square', 15, 0.2);
    },
    start: () => playSequence([
      { freq: 440, duration: 60, type: 'sawtooth', decay: 40, gain: 0.25 },
      { freq: 880, duration: 60, type: 'sawtooth', decay: 40, delay: 65, gain: 0.25 },
    ]),
    pause:           () => playTone(330, 40, 'square', 30, 0.2),
    reset:           () => playLayeredClick(1800, 180, 30),
    skip: () => playSequence([
      { freq: 550, duration: 25, type: 'square', decay: 15, gain: 0.2 },
      { freq: 770, duration: 25, type: 'square', decay: 15, delay: 30, gain: 0.2 },
    ]),
    phaseToBreak: () => playSequence([
      { freq: 660, duration: 80, type: 'sawtooth', decay: 60, gain: 0.25 },
      { freq: 440, duration: 80, type: 'sawtooth', decay: 60, delay: 85, gain: 0.25 },
    ]),
    phaseToFocus: () => playSequence([
      { freq: 440, duration: 80, type: 'sawtooth', decay: 60, gain: 0.25 },
      { freq: 660, duration: 80, type: 'sawtooth', decay: 60, delay: 85, gain: 0.25 },
    ]),
    sessionComplete: () => playSequence([
      { freq: 880,  duration: 50, type: 'square', decay: 35, gain: 0.25 },
      { freq: 1100, duration: 50, type: 'square', decay: 35, delay: 60,  gain: 0.25 },
      { freq: 1400, duration: 50, type: 'square', decay: 35, delay: 120, gain: 0.25 },
    ]),
    longBreak: () => playSequence([
      { freq: 660, duration: 70, type: 'square', decay: 50, gain: 0.2 },
      { freq: 440, duration: 70, type: 'square', decay: 50, delay: 80,  gain: 0.2 },
      { freq: 330, duration: 70, type: 'square', decay: 50, delay: 160, gain: 0.2 },
    ]),
    taskAdded: () => playSequence([
      { freq: 1000, duration: 15, type: 'square', decay: 10, gain: 0.15 },
      { freq: 1200, duration: 15, type: 'square', decay: 10, delay: 30, gain: 0.15 },
    ]),
    invalidInput: () => playTone(100, 80, 'sawtooth', 60, 0.2),
  };

  // ── Ambient (file-based) ──

  const startAmbient = useCallback((mode) => {
    stopAmbient();
    if (mode === 'OFF') return;
    const src = AMBIENT_FILES[mode];
    if (!src) return;
    ambientAudio = new Audio(src);
    ambientAudio.loop = true;
    ambientAudio.volume = volumeRef.current * 0.4;
    ambientAudio.play().catch(() => {});
  }, []);

  function stopAmbient() {
    if (ambientAudio) {
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
      ambientAudio = null;
    }
  }

  const pauseAmbient = useCallback(() => {
    if (ambientAudio) ambientAudio.pause();
  }, []);

  const resumeAmbient = useCallback(() => {
    if (ambientAudio) ambientAudio.play().catch(() => {});
  }, []);

  const stopAmbientFn = useCallback(() => stopAmbient(), []);

  return {
    init,
    setVolume,
    sounds,
    startAmbient,
    stopAmbient: stopAmbientFn,
    pauseAmbient,
    resumeAmbient,
    getMasterGain: () => masterGain,
  };
}
