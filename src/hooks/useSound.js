import { useRef, useCallback } from 'react';

let ctx = null;
let masterGain = null;
let noiseBuffer = null;
let ambientSource = null;
let ambientGain = null;
let ambientMode = null;

function createNoiseBuffer(audioCtx) {
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function initAudio() {
  if (ctx) return;
  ctx = new AudioContext();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.5;
  masterGain.connect(ctx.destination);
  noiseBuffer = createNoiseBuffer(ctx);
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

export function useSound() {
  const volumeRef = useRef(0.5);

  const init = useCallback(() => {
    initAudio();
  }, []);

  const setVolume = useCallback((v) => {
    volumeRef.current = v;
    if (masterGain) {
      masterGain.gain.value = v;
    }
    if (ambientGain) {
      ambientGain.gain.value = v * 0.4;
    }
  }, []);

  // ── UI sound events ──

  const sounds = {
    buttonPress: () => playLayeredClick(1800, 180, 20),
    stepperUp: () => playTone(1200, 25, 'square', 20, 0.2),
    stepperDown: () => playTone(900, 25, 'square', 20, 0.2),
    soundSelect: () => playTone(1400, 15, 'square', 10, 0.15),
    knobTick: () => playTone(2000, 10, 'square', 8, 0.08),
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
    pause: () => playTone(330, 40, 'square', 30, 0.2),
    reset: () => playLayeredClick(1800, 180, 30),
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
      { freq: 880, duration: 50, type: 'square', decay: 35, gain: 0.25 },
      { freq: 1100, duration: 50, type: 'square', decay: 35, delay: 60, gain: 0.25 },
      { freq: 1400, duration: 50, type: 'square', decay: 35, delay: 120, gain: 0.25 },
    ]),
    longBreak: () => playSequence([
      { freq: 660, duration: 70, type: 'square', decay: 50, gain: 0.2 },
      { freq: 440, duration: 70, type: 'square', decay: 50, delay: 80, gain: 0.2 },
      { freq: 330, duration: 70, type: 'square', decay: 50, delay: 160, gain: 0.2 },
    ]),
    taskAdded: () => playSequence([
      { freq: 1000, duration: 15, type: 'square', decay: 10, gain: 0.15 },
      { freq: 1200, duration: 15, type: 'square', decay: 10, delay: 30, gain: 0.15 },
    ]),
    invalidInput: () => playTone(100, 80, 'sawtooth', 60, 0.2),
  };

  // ── Ambient sound ──

  const startAmbient = useCallback((mode) => {
    if (!ctx) return;
    stopAmbient();
    if (mode === 'OFF') return;

    ambientMode = mode;
    ambientGain = ctx.createGain();
    ambientGain.gain.value = volumeRef.current * 0.4;
    ambientGain.connect(ctx.destination);

    if (mode === 'NOISE') {
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      source.connect(ambientGain);
      source.start();
      ambientSource = source;
      return;
    }

    if (mode === 'AMBIENT') {
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.5;
      source.connect(filter);
      filter.connect(ambientGain);
      source.start();
      ambientSource = source;
      return;
    }

    if (mode === 'LO-FI') {
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = 0.7;
      source.connect(filter);
      filter.connect(ambientGain);
      source.start();
      ambientSource = source;
      return;
    }

    if (mode === 'RAIN') {
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1400;
      bandpass.Q.value = 0.8;

      // LFO for rain variation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 1.2;
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain);
      lfoGain.connect(ambientGain.gain);

      source.connect(bandpass);
      bandpass.connect(ambientGain);
      lfo.start();
      source.start();
      ambientSource = source;
      return;
    }
  }, []);

  function stopAmbient() {
    if (ambientSource) {
      try { ambientSource.stop(); } catch {}
      ambientSource = null;
    }
    ambientGain = null;
    ambientMode = null;
  }

  const pauseAmbient = useCallback(() => {
    if (ambientGain) ambientGain.gain.value = 0;
  }, []);

  const resumeAmbient = useCallback(() => {
    if (ambientGain) ambientGain.gain.value = volumeRef.current * 0.4;
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
