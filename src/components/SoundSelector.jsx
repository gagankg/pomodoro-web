const MODES = ['OFF', 'AMBIENT', 'LO-FI', 'JAZZ', 'RAIN'];

export default function SoundSelector({ mode, onSelect }) {
  return (
    <div
      className="flex items-center"
      style={{
        background: 'linear-gradient(180deg, #C0BCB4 0%, #B0ACA4 100%)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(255,255,255,0.3)',
        padding: '6px 12px',
        gap: 4,
      }}
    >
      {MODES.map((m) => (
        <button
          key={m}
          className={mode === m ? 'sound-tab-active' : 'sound-tab-inactive'}
          aria-pressed={mode === m}
          onClick={() => onSelect(m)}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            flex: 1,
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
