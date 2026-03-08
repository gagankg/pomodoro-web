import { useState, useRef } from 'react';
import { formatMMSS } from '../utils/time.js';

export default function Display({
  mode,
  phase,
  remaining,
  sessionIndex,
  tasks,
  onAddTask,
  onTaskChange,
  resumeNotice,
  onDismissNotice,
  flicker,
}) {
  const [inputValue, setInputValue] = useState('');
  const [noteValue, setNoteValue] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);

  const activeTask = tasks.find((t) => t.status === 'active') || null;
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const queuedTasks = pendingTasks;

  function handleInputKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const name = inputValue.trim();
      if (!name) return;
      onAddTask({ name, note: noteValue.trim() });
      setInputValue('');
      setNoteValue('');
      setShowNote(false);
      setIsTyping(false);
    }
    if (e.key === 'Escape') {
      setIsTyping(false);
      inputRef.current?.blur();
    }
  }

  const isFocus = phase === 'focus';

  return (
    <div
      className={`lcd-panel flex flex-col ${flicker ? 'lcd-flicker' : ''}`}
      style={{ height: 180, padding: '10px 12px', gap: 0 }}
    >
      {/* Task input row */}
      <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
        <input
          ref={inputRef}
          className="task-input"
          style={{ fontSize: 13, flex: 1 }}
          placeholder="what are you working on?"
          value={inputValue}
          maxLength={40}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(inputValue.length > 0)}
          onKeyDown={handleInputKeyDown}
          aria-label="Task name"
        />
        <button
          onClick={() => setShowNote((v) => !v)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            cursor: 'pointer',
            padding: '0 2px',
            lineHeight: 1,
          }}
          tabIndex={-1}
          aria-label="Add note"
        >
          {showNote ? '−' : '+'}
        </button>
      </div>

      {/* Note input */}
      {showNote && (
        <input
          className="task-input"
          style={{ fontSize: 11, marginBottom: 2, opacity: 0.7 }}
          placeholder="note..."
          value={noteValue}
          maxLength={80}
          onChange={(e) => setNoteValue(e.target.value)}
        />
      )}

      {/* Subtext — hidden while typing */}
      {!isTyping && (
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.05em',
          marginBottom: 4,
          opacity: 0.6,
        }}>
          track · task · intention
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

      {/* Timer row */}
      <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
        <span
          className="timer-digits"
          style={{ fontSize: 36, lineHeight: 1 }}
          aria-live="polite"
          aria-label={`${formatMMSS(remaining)} ${phase}`}
        >
          {formatMMSS(remaining)}
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className={isFocus ? 'phase-dot-active' : 'phase-dot-inactive'} style={{ fontSize: 8 }}>●</span>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: isFocus ? 'var(--lcd-green)' : 'var(--lcd-dim)',
            }}>FOCUS</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={!isFocus ? 'phase-dot-active' : 'phase-dot-inactive'} style={{ fontSize: 8 }}>●</span>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: !isFocus ? 'var(--lcd-green)' : 'var(--lcd-dim)',
            }}>BREAK</span>
          </div>
        </div>
      </div>

      {/* Queue — scrollable, max 2 visible */}
      <div
        style={{
          flex: 1,
          overflowY: 'hidden',
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxHeight: 42,
        }}
      >
        {resumeNotice && (
          <div className="resume-notice" style={{ marginBottom: 2 }}>
            RESUMED FROM LAST SESSION
          </div>
        )}
        {activeTask && (
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: 'var(--text-display)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            ▸ {activeTask.name}
          </div>
        )}
        {queuedTasks.slice(0, 2).map((t) => (
          <div key={t.id} style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: 'var(--text-dim)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            · {t.name}
          </div>
        ))}
        {doneTasks.slice(-1).map((t) => (
          <div key={t.id} className="task-item-done" style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: 'var(--text-dim)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {t.name}
          </div>
        ))}
      </div>

      {/* Session index — bottom right */}
      <div className="flex justify-end" style={{ marginTop: 'auto' }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
        }}>
          #{sessionIndex}
        </span>
      </div>
    </div>
  );
}
