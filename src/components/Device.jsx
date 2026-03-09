import Display from './Display.jsx';
import SoundSelector from './SoundSelector.jsx';
import Controls from './Controls.jsx';
import SessionDots from './SessionDots.jsx';

export default function Device({
  // Timer state
  timerMode,
  timerPhase,
  remaining,
  sessionIndex,
  totalSessions,
  focusDuration,
  breakDuration,
  // Timer actions
  onStart,
  onReset,
  onSkip,
  onFocusChange,
  onBreakChange,
  // Tasks
  tasks,
  onAddTask,
  onTaskChange,
  // Sound
  soundMode,
  onSoundModeChange,
  volume,
  onVolumeChange,
  onSoundInit,
  sounds,
  // Toggles
  notifEnabled,
  onNotifToggle,
  soundPauseOnBreak,
  onSoundPauseToggle,
  // UI
  resumeNotice,
  onDismissNotice,
  flicker,
}) {
  return (
    <div className="device-casing flex flex-col" style={{ padding: '12px 10px 10px' }}>

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between" style={{ height: 40, paddingBottom: 8 }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--text-label)',
        }}>
          PM-25
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.1em',
          color: 'var(--text-dim)',
        }}>
          POMODORO TIMER
        </div>
        <div className="dot-grid" />
      </div>

      {/* ── LCD Display ── */}
      <div style={{ padding: '0 2px 8px' }}>
        <Display
          mode={timerMode}
          phase={timerPhase}
          remaining={remaining}
          sessionIndex={sessionIndex}
          tasks={tasks}
          onAddTask={onAddTask}
          onTaskChange={onTaskChange}
          resumeNotice={resumeNotice}
          onDismissNotice={onDismissNotice}
          flicker={flicker}
        />
      </div>

      {/* ── Sound selector strip ── */}
      <div style={{ marginBottom: 8, borderRadius: 4, overflow: 'hidden' }}>
        <SoundSelector mode={soundMode} onSelect={onSoundModeChange} />
      </div>

      {/* ── Controls row ── */}
      <div style={{
        background: 'linear-gradient(180deg, #D0CCC4 0%, #C2BEB8 100%)',
        borderRadius: 8,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.1)',
      }}>
        <Controls
          timerMode={timerMode}
          timerPhase={timerPhase}
          onStart={onStart}
          onReset={onReset}
          onSkip={onSkip}
          focusDuration={focusDuration}
          breakDuration={breakDuration}
          onFocusChange={onFocusChange}
          onBreakChange={onBreakChange}
          volume={volume}
          onVolumeChange={onVolumeChange}
          notifEnabled={notifEnabled}
          onNotifToggle={onNotifToggle}
          soundPauseOnBreak={soundPauseOnBreak}
          onSoundPauseToggle={onSoundPauseToggle}
          onSoundInit={onSoundInit}
          sounds={sounds}
        />
      </div>

      {/* ── Session footer ── */}
      <div style={{ marginTop: 6 }}>
        <SessionDots sessionIndex={sessionIndex} totalSessions={totalSessions} />
      </div>

    </div>
  );
}
