import { useState } from 'react';
import VolumeKnob from './VolumeKnob.jsx';
import RockerToggle from './RockerToggle.jsx';
import { clampDuration } from '../utils/time.js';

function HwButton({ label, onClick, children, className = 'hw-button', style = {}, ariaLabel }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      className={`${className}${pressed ? ' pressed' : ''}`}
      aria-label={ariaLabel}
      style={style}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick?.(); }}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => { setPressed(false); onClick?.(); }}
    >
      {children}
    </button>
  );
}

function Stepper({ label, value, onChange, onSound, ariaLabel }) {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(String(value));

  function commit(val) {
    const clamped = clampDuration(val);
    onChange(clamped);
    setTempVal(String(clamped));
    setEditing(false);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="silk-label">{label}</span>
      <div className="flex items-center gap-1">
        <HwButton
          className="hw-button-dark"
          style={{ width: 24, height: 24, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => { onChange(clampDuration(value - 1)); onSound?.('down'); }}
          ariaLabel={`Decrease ${label} duration`}
        >
          −
        </HwButton>

        {editing ? (
          <input
            className="stepper-display"
            value={tempVal}
            onChange={(e) => setTempVal(e.target.value)}
            onBlur={() => commit(tempVal)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(tempVal); if (e.key === 'Escape') { setEditing(false); setTempVal(String(value)); } }}
            autoFocus
            style={{ width: 28, fontSize: 13, textAlign: 'center', padding: '1px' }}
            aria-label={ariaLabel}
          />
        ) : (
          <button
            className="stepper-display"
            style={{ width: 28, fontSize: 13, padding: '1px', cursor: 'text', background: '#1A1A18', color: 'var(--text-display)', border: 'none', borderRadius: 2 }}
            onClick={() => { setTempVal(String(value)); setEditing(true); }}
            aria-label={ariaLabel}
          >
            {value}
          </button>
        )}

        <HwButton
          className="hw-button-dark"
          style={{ width: 24, height: 24, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => { onChange(clampDuration(value + 1)); onSound?.('up'); }}
          ariaLabel={`Increase ${label} duration`}
        >
          +
        </HwButton>
      </div>
    </div>
  );
}

export default function Controls({
  timerMode,
  timerPhase,
  onStart,
  onReset,
  onSkip,
  focusDuration,
  breakDuration,
  onFocusChange,
  onBreakChange,
  volume,
  onVolumeChange,
  notifEnabled,
  onNotifToggle,
  soundPauseOnBreak,
  onSoundPauseToggle,
  onSoundInit,
  sounds,
}) {
  const isRunning = timerMode === 'running';
  const isPaused = timerMode === 'paused';

  const startLabel = isRunning ? 'PAUSE' : isPaused ? 'RESUME' : 'START';
  const startAriaLabel = isRunning ? 'Pause' : isPaused ? 'Resume' : 'Start focus session';

  function handleStart() {
    onSoundInit?.();
    if (isRunning) {
      sounds?.pause();
    } else {
      sounds?.start();
    }
    onStart();
  }

  function handleReset() {
    onSoundInit?.();
    sounds?.reset();
    onReset();
  }

  function handleSkip() {
    onSoundInit?.();
    sounds?.skip();
    onSkip();
  }

  return (
    <div className="flex flex-col px-3 pt-5 pb-5 gap-0">
      {/* ── Row 1: playback + duration + volume ── */}
      <div className="flex items-center justify-between">
        {/* Left group: playback + duration */}
        <div className="flex items-center gap-3">
          {/* START */}
          <div className="flex flex-col items-center gap-1">
            <span className="silk-label">{startLabel}</span>
            <HwButton
              className="start-button"
              style={{ width: 48, height: 38, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
              onClick={handleStart}
              ariaLabel={startAriaLabel}
            >
              {startLabel}
            </HwButton>
          </div>

          {/* RESET */}
          <div className="flex flex-col items-center gap-1">
            <span className="silk-label">RESET</span>
            <HwButton
              style={{ width: 38, height: 38, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleReset}
              ariaLabel="Reset timer"
            >
              ↺
            </HwButton>
          </div>

          {/* SKIP */}
          <div className="flex flex-col items-center gap-1">
            <span className="silk-label">SKIP</span>
            <HwButton
              style={{ width: 38, height: 38, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleSkip}
              ariaLabel="Skip to next phase"
            >
              ⏭
            </HwButton>
          </div>

          {/* Separator */}
          <div className="hw-separator" style={{ margin: '0 2px' }} />

          {/* FOCUS + BREAK side by side */}
          <Stepper
            label="FOCUS"
            value={focusDuration}
            onChange={onFocusChange}
            onSound={(dir) => { onSoundInit?.(); dir === 'up' ? sounds?.stepperUp() : sounds?.stepperDown(); }}
            ariaLabel="Focus duration in minutes"
          />
          <Stepper
            label="BREAK"
            value={breakDuration}
            onChange={onBreakChange}
            onSound={(dir) => { onSoundInit?.(); dir === 'up' ? sounds?.stepperUp() : sounds?.stepperDown(); }}
            ariaLabel="Break duration in minutes"
          />
        </div>

        {/* Volume knob — right end */}
        <VolumeKnob
          volume={volume}
          onVolumeChange={onVolumeChange}
          onSoundInit={onSoundInit}
        />
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.12)', margin: '10px 0 8px' }} />

      {/* ── Row 2: toggles ── */}
      <div className="flex items-center gap-4">
        <RockerToggle
          label="NOTIF"
          on={notifEnabled}
          onToggle={() => { onSoundInit?.(); notifEnabled ? sounds?.toggleOff() : sounds?.toggleOn(); onNotifToggle(); }}
          ariaLabel="Browser notifications"
        />
        <RockerToggle
          label="SND PAUSE"
          on={soundPauseOnBreak}
          onToggle={() => { onSoundInit?.(); soundPauseOnBreak ? sounds?.toggleOff() : sounds?.toggleOn(); onSoundPauseToggle(); }}
          ariaLabel="Pause sound on break"
        />
      </div>
    </div>
  );
}
