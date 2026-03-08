export default function SessionDots({ sessionIndex, totalSessions }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => {
          const isDone = i < (totalSessions % 4) || (totalSessions > 0 && totalSessions % 4 === 0 && i < 4);
          const isActive = i === sessionIndex;
          let cls = 'session-dot ';
          if (isActive) cls += 'session-dot-active';
          else if (isDone) cls += 'session-dot-done';
          else cls += 'session-dot-empty';
          return <div key={i} className={cls} />;
        })}
      </div>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: 'var(--text-dim)',
      }}>
        PC-25
      </span>
    </div>
  );
}
