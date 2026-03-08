import { useRef, useCallback, useEffect } from 'react';
import { MIN_ANGLE, MAX_ANGLE, clampAngle, angleToVolume, volumeToAngle, logCurve } from '../utils/knob.js';

export default function VolumeKnob({ volume, onVolumeChange, onSoundInit }) {
  const knobRef = useRef(null);
  const dragging = useRef(false);
  const lastY = useRef(0);
  const angleRef = useRef(volumeToAngle(volume));

  // Keep angle ref in sync with volume prop
  useEffect(() => {
    angleRef.current = volumeToAngle(volume);
  }, [volume]);

  const applyAngle = useCallback((angle) => {
    const clamped = clampAngle(angle);
    angleRef.current = clamped;
    const vol = angleToVolume(clamped);
    onVolumeChange(vol);
    if (knobRef.current) {
      knobRef.current.querySelector('.knob-marker').style.transform = `rotate(${clamped}deg)`;
    }
  }, [onVolumeChange]);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    onSoundInit?.();
    dragging.current = true;
    lastY.current = e.clientY;
    document.body.style.cursor = 'grabbing';
  }, [onSoundInit]);

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    const deltaY = lastY.current - e.clientY;
    lastY.current = e.clientY;
    const sensitivity = 1.5;
    applyAngle(angleRef.current + deltaY * sensitivity);
    // Tick sound every ~10deg movement
  }, [applyAngle]);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    document.body.style.cursor = '';
  }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    onSoundInit?.();
    const delta = e.deltaY > 0 ? -5 : 5;
    applyAngle(angleRef.current + delta);
    onSoundInit?.();
  }, [applyAngle, onSoundInit]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const angle = volumeToAngle(volume);
  const pct = Math.round(angleToVolume(angle) * 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="silk-label">VOL</span>
      <div
        ref={knobRef}
        className="volume-knob"
        onMouseDown={onMouseDown}
        onWheel={onWheel}
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); applyAngle(angleRef.current + 9); }
          if (e.key === 'ArrowDown') { e.preventDefault(); applyAngle(angleRef.current - 9); }
        }}
      >
        <div
          className="knob-marker"
          style={{ transform: `rotate(${angle}deg)` }}
        />
      </div>
    </div>
  );
}
