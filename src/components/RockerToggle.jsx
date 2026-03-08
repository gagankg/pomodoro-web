export default function RockerToggle({ on, onToggle, label, ariaLabel }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="silk-label">{label}</span>
      <div
        className="toggle-housing"
        role="switch"
        aria-checked={on}
        aria-label={ariaLabel}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
      >
        {/* ON side (left) */}
        <div
          style={{
            width: 11,
            height: 13,
            borderRadius: 2,
            ...(on ? {
              background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
              boxShadow: '0 1px 0 #15803D, inset 0 1px 0 rgba(255,255,255,0.2)',
            } : {
              background: '#2A2A28',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)',
            }),
          }}
        />
        {/* OFF side (right) */}
        <div
          style={{
            width: 11,
            height: 13,
            borderRadius: 2,
            ...(on ? {
              background: '#3A3835',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)',
            } : {
              background: 'linear-gradient(180deg, #9A9690 0%, #7A7670 100%)',
              boxShadow: '0 1px 0 #5A5650, inset 0 1px 0 rgba(255,255,255,0.15)',
            }),
          }}
        />
      </div>
    </div>
  );
}
