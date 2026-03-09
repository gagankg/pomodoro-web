import { useEffect, useState, useRef, useCallback } from 'react';
import Device from './components/Device.jsx';
import { useTimer } from './hooks/useTimer.js';
import { useSound } from './hooks/useSound.js';
import { useNotifications } from './hooks/useNotifications.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { logCurve } from './utils/knob.js';

let taskIdCounter = 1;

function makeTask(name, note = '') {
  return { id: taskIdCounter++, name, note, status: 'pending' };
}

export default function App() {
  // ── Persisted settings ──
  const [focusDuration, setFocusDuration] = useLocalStorage('pomo_focus_duration', 15);
  const [breakDuration, setBreakDuration] = useLocalStorage('pomo_break_duration', 5);
  const [soundMode, setSoundMode] = useLocalStorage('pomo_sound_mode', 'OFF');
  const [volume, setVolume] = useLocalStorage('pomo_volume', 0.5);
  const [notifEnabled, setNotifEnabled] = useLocalStorage('pomo_notif_enabled', false);
  const [soundPauseOnBreak, setSoundPauseOnBreak] = useLocalStorage('pomo_sound_pause', true);
  const [taskQueue, setTaskQueue] = useLocalStorage('pomo_task_queue', []);

  // ── UI state ──
  const [resumeNotice, setResumeNotice] = useState(false);
  const [flicker, setFlicker] = useState(false);

  // ── Hooks ──
  const sound = useSound();
  const { requestPermission, notify } = useNotifications();

  // ── Audio init flag ──
  const audioInitialized = useRef(false);

  const initSound = useCallback(() => {
    if (!audioInitialized.current) {
      sound.init();
      audioInitialized.current = true;
      sound.setVolume(logCurve(volume));
      if (soundMode !== 'OFF') {
        sound.startAmbient(soundMode);
      }
    }
  }, [sound, volume, soundMode]);

  // ── Timer ──
  const timer = useTimer({
    focusDuration,
    breakDuration,
    onPhaseComplete: (completedPhase, isLongBreak) => {
      // Flicker the LCD
      setFlicker(true);
      setTimeout(() => setFlicker(false), 220);

      // Play phase transition sound
      if (completedPhase === 'focus') {
        isLongBreak ? sound.sounds.longBreak() : sound.sounds.phaseToBreak();
      } else {
        sound.sounds.phaseToFocus();
      }

      // Notify
      if (notifEnabled) {
        const msg = completedPhase === 'focus'
          ? (isLongBreak ? 'Time for a long break!' : 'Break time!')
          : 'Back to focus!';
        notify('PM-25', msg);
      }

      // Advance task if focus complete
      if (completedPhase === 'focus') {
        setTaskQueue((prev) => {
          const q = [...prev];
          const activeIdx = q.findIndex((t) => t.status === 'active');
          if (activeIdx !== -1) q[activeIdx] = { ...q[activeIdx], status: 'done' };
          const nextIdx = q.findIndex((t) => t.status === 'pending');
          if (nextIdx !== -1) q[nextIdx] = { ...q[nextIdx], status: 'active' };
          return q;
        });
      }

      // Handle sound pause on break
      if (completedPhase === 'focus' && soundPauseOnBreak && soundMode !== 'OFF') {
        sound.pauseAmbient();
      } else if (completedPhase === 'break' && soundMode !== 'OFF') {
        sound.resumeAmbient();
      }

      // Check if session set complete
      if (completedPhase === 'focus' && (timer.state.totalSessions + 1) % 4 === 0) {
        sound.sounds.sessionComplete();
      }
    },
  });

  // ── Restore from snapshot on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pomo_timer_snapshot');
      if (!raw) return;
      const snap = JSON.parse(raw);
      if (!snap || !snap.timestamp) return;

      const elapsed = (Date.now() - snap.timestamp) / 1000;
      if (snap.mode === 'running' || snap.mode === 'paused') {
        const remaining = snap.remaining - elapsed;
        if (remaining > 0) {
          timer.restore({
            mode: 'paused',
            phase: snap.phase,
            remaining: Math.ceil(remaining),
            focusDuration: snap.focusDuration || focusDuration,
            breakDuration: snap.breakDuration || breakDuration,
            sessionIndex: snap.sessionIndex || 0,
            totalSessions: snap.totalSessions || 0,
          });
          setResumeNotice(true);
        }
      }
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync volume to master gain ──
  useEffect(() => {
    if (audioInitialized.current) {
      sound.setVolume(logCurve(volume));
    }
  }, [volume, sound]);

  // ── Sync ambient sound to mode/phase ──
  // NOTE: startAmbient is called synchronously in handleSoundModeChange (user gesture).
  // This effect only handles the pause-on-break logic after a track switch.
  useEffect(() => {
    if (!audioInitialized.current) return;
    if (soundMode !== 'OFF') {
      const isOnBreak = timer.state.phase === 'break' && soundPauseOnBreak;
      if (isOnBreak) sound.pauseAmbient();
    }
  }, [soundMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab visibility ──
  useEffect(() => {
    let hiddenAt = null;

    function onVisibilityChange() {
      if (document.hidden) {
        hiddenAt = Date.now();
        if (audioInitialized.current) sound.pauseAmbient();
      } else {
        // Tab returned
        if (audioInitialized.current && soundMode !== 'OFF') {
          const isOnBreak = timer.state.phase === 'break' && soundPauseOnBreak;
          if (!isOnBreak) sound.resumeAmbient();
        }
        hiddenAt = null;
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [soundMode, soundPauseOnBreak, sound, timer.state.phase]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea';

      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        initSound();
        handleStart();
      }
      if (e.key === 'r' && !isInput) {
        e.preventDefault();
        initSound();
        sound.sounds.reset();
        timer.reset();
      }
      if (e.key === 's' && !isInput) {
        e.preventDefault();
        initSound();
        sound.sounds.skip();
        timer.skip();
      }
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isInput) {
        e.preventDefault();
        const delta = e.key === 'ArrowUp' ? 0.05 : -0.05;
        setVolume((prev) => {
          const next = Math.min(1, Math.max(0, prev + delta));
          return next;
        });
      }

      // Dismiss resume notice on any keypress
      if (resumeNotice) setResumeNotice(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [timer, resumeNotice, sound, initSound]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──

  function handleStart() {
    initSound();
    const { mode } = timer.state;
    if (mode === 'running') {
      sound.sounds.pause();
      timer.pause();
      sound.pauseAmbient();
    } else if (mode === 'paused') {
      sound.sounds.start();
      timer.resume();
      if (soundMode !== 'OFF') sound.resumeAmbient();
    } else {
      sound.sounds.start();
      timer.start();
      // Activate first pending task if none active
      const hasActive = taskQueue.some((t) => t.status === 'active');
      if (!hasActive) {
        setTaskQueue((prev) => {
          const q = [...prev];
          const idx = q.findIndex((t) => t.status === 'pending');
          if (idx !== -1) q[idx] = { ...q[idx], status: 'active' };
          return q;
        });
      }
      if (soundMode !== 'OFF') sound.startAmbient(soundMode);
    }
    if (resumeNotice) setResumeNotice(false);
  }

  function handleReset() {
    initSound();
    sound.sounds.reset();
    timer.reset();
    sound.stopAmbient();
  }

  function handleSkip() {
    initSound();
    sound.sounds.skip();
    timer.skip();
  }

  function handleFocusChange(v) {
    setFocusDuration(v);
    timer.setFocusDuration(v);
  }

  function handleBreakChange(v) {
    setBreakDuration(v);
    timer.setBreakDuration(v);
  }

  function handleVolumeChange(v) {
    setVolume(v);
  }

  async function handleNotifToggle() {
    if (!notifEnabled) {
      const granted = await requestPermission();
      if (granted) setNotifEnabled(true);
    } else {
      setNotifEnabled(false);
    }
  }

  function handleSoundPauseToggle() {
    setSoundPauseOnBreak((prev) => !prev);
  }

  function handleSoundModeChange(mode) {
    initSound();
    sound.sounds.soundSelect();
    setSoundMode(mode);
    // Call play/stop synchronously here (inside user gesture) instead of relying
    // on the soundMode effect, which runs async and gets blocked by autoplay policy.
    if (mode === 'OFF') {
      sound.stopAmbient();
    } else {
      sound.startAmbient(mode);
    }
  }

  function handleAddTask({ name, note }) {
    initSound();
    sound.sounds.taskAdded();
    const newTask = makeTask(name, note);
    setTaskQueue((prev) => {
      const hasActive = prev.some((t) => t.status === 'active');
      if (!hasActive && timer.state.mode !== 'idle') {
        newTask.status = 'active';
      }
      return [...prev, newTask];
    });
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <Device
        timerMode={timer.state.mode}
        timerPhase={timer.state.phase}
        remaining={timer.state.remaining}
        sessionIndex={timer.state.sessionIndex}
        totalSessions={timer.state.totalSessions}
        focusDuration={timer.state.focusDuration}
        breakDuration={timer.state.breakDuration}
        onStart={handleStart}
        onReset={handleReset}
        onSkip={handleSkip}
        onFocusChange={handleFocusChange}
        onBreakChange={handleBreakChange}
        tasks={taskQueue}
        onAddTask={handleAddTask}
        soundMode={soundMode}
        onSoundModeChange={handleSoundModeChange}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        notifEnabled={notifEnabled}
        onNotifToggle={handleNotifToggle}
        soundPauseOnBreak={soundPauseOnBreak}
        onSoundPauseToggle={handleSoundPauseToggle}
        onSoundInit={initSound}
        sounds={sound.sounds}
        resumeNotice={resumeNotice}
        onDismissNotice={() => setResumeNotice(false)}
        flicker={flicker}
      />

      <div style={{
        fontFamily: "'DM Mono', monospace",
        color: '#4A4845',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>
        <p style={{ fontSize: 11, letterSpacing: '0.05em', marginBottom: 10 }}>
          A Pomodoro timer built to feel like a Teenage Engineering instrument.
        </p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 10, letterSpacing: '0.08em' }}>
          <span><span style={{ color: '#7A7570' }}>SPACE</span> start / pause</span>
          <span><span style={{ color: '#7A7570' }}>R</span> reset</span>
          <span><span style={{ color: '#7A7570' }}>S</span> skip</span>
          <span><span style={{ color: '#7A7570' }}>↑ ↓</span> volume</span>
        </div>
      </div>
    </div>
  );
}
