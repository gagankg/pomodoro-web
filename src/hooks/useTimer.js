import { useReducer, useEffect, useRef, useCallback } from 'react';

const DEFAULT_FOCUS = 25;
const DEFAULT_BREAK = 5;

function makeInitialState(focusDuration, breakDuration) {
  return {
    mode: 'idle',   // 'idle' | 'running' | 'paused'
    phase: 'focus', // 'focus' | 'break'
    remaining: focusDuration * 60,
    focusDuration,
    breakDuration,
    sessionIndex: 0,    // 0–3 (current dot position)
    totalSessions: 0,   // completed focus sessions
  };
}

function timerReducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, mode: 'running' };

    case 'PAUSE':
      return { ...state, mode: 'paused' };

    case 'RESUME':
      return { ...state, mode: 'running' };

    case 'RESET': {
      const remaining = state.phase === 'focus'
        ? state.focusDuration * 60
        : state.breakDuration * 60;
      return { ...state, mode: 'idle', remaining };
    }

    case 'FULL_RESET':
      return makeInitialState(DEFAULT_FOCUS, DEFAULT_BREAK);

    case 'SKIP': {
      const completedFocus = state.phase === 'focus';
      const nextPhase = completedFocus ? 'break' : 'focus';
      const newTotal = completedFocus ? state.totalSessions + 1 : state.totalSessions;
      const newIndex = completedFocus
        ? (state.sessionIndex + 1) % 4
        : state.sessionIndex;
      const isLongBreak = completedFocus && newTotal > 0 && newTotal % 4 === 0;
      const nextRemaining = nextPhase === 'focus'
        ? state.focusDuration * 60
        : (isLongBreak ? state.breakDuration * 3 * 60 : state.breakDuration * 60);
      return {
        ...state,
        mode: 'idle',
        phase: nextPhase,
        remaining: nextRemaining,
        sessionIndex: newIndex,
        totalSessions: newTotal,
      };
    }

    case 'SET_REMAINING':
      return { ...state, remaining: action.remaining };

    case 'PHASE_COMPLETE': {
      const completedFocus = state.phase === 'focus';
      const nextPhase = completedFocus ? 'break' : 'focus';
      const newTotal = completedFocus ? state.totalSessions + 1 : state.totalSessions;
      const newIndex = completedFocus
        ? (state.sessionIndex + 1) % 4
        : state.sessionIndex;
      const isLongBreak = completedFocus && newTotal > 0 && newTotal % 4 === 0;
      const nextRemaining = nextPhase === 'focus'
        ? state.focusDuration * 60
        : (isLongBreak ? state.breakDuration * 3 * 60 : state.breakDuration * 60);
      return {
        ...state,
        mode: 'idle',
        phase: nextPhase,
        remaining: nextRemaining,
        sessionIndex: newIndex,
        totalSessions: newTotal,
        justCompleted: state.phase,
        isLongBreak,
      };
    }

    case 'SET_FOCUS_DURATION': {
      const remaining = state.phase === 'focus' && state.mode === 'idle'
        ? action.value * 60
        : state.remaining;
      return { ...state, focusDuration: action.value, remaining };
    }

    case 'SET_BREAK_DURATION': {
      const remaining = state.phase === 'break' && state.mode === 'idle'
        ? action.value * 60
        : state.remaining;
      return { ...state, breakDuration: action.value, remaining };
    }

    case 'RESTORE':
      return { ...state, ...action.payload, justCompleted: undefined };

    default:
      return state;
  }
}

export function useTimer({
  focusDuration: initFocus = DEFAULT_FOCUS,
  breakDuration: initBreak = DEFAULT_BREAK,
  onPhaseComplete,
}) {
  const [state, dispatch] = useReducer(
    timerReducer,
    makeInitialState(initFocus, initBreak)
  );

  const endTimeRef = useRef(null);
  const onPhaseCompleteRef = useRef(onPhaseComplete);
  onPhaseCompleteRef.current = onPhaseComplete;

  const prevModeRef = useRef(state.mode);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Set endTime when transitioning to running
  useEffect(() => {
    if (state.mode === 'running') {
      endTimeRef.current = Date.now() + state.remaining * 1000;
    } else {
      endTimeRef.current = null;
    }
  }, [state.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick interval
  useEffect(() => {
    if (state.mode !== 'running') return;

    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        dispatch({ type: 'PHASE_COMPLETE' });
      } else {
        dispatch({ type: 'SET_REMAINING', remaining });
      }
    }, 250);

    return () => clearInterval(interval);
  }, [state.mode]);

  // Fire onPhaseComplete callback
  useEffect(() => {
    if (state.justCompleted) {
      onPhaseCompleteRef.current?.(state.justCompleted, state.isLongBreak);
    }
  }, [state.justCompleted, state.isLongBreak]);

  // Snapshot every 5s while running
  useEffect(() => {
    if (state.mode !== 'running') return;
    const interval = setInterval(() => {
      const s = stateRef.current;
      localStorage.setItem('pomo_timer_snapshot', JSON.stringify({
        phase: s.phase,
        remaining: s.remaining,
        mode: s.mode,
        timestamp: Date.now(),
        focusDuration: s.focusDuration,
        breakDuration: s.breakDuration,
        sessionIndex: s.sessionIndex,
        totalSessions: s.totalSessions,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [state.mode]);

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const fullReset = useCallback(() => dispatch({ type: 'FULL_RESET' }), []);
  const skip = useCallback(() => dispatch({ type: 'SKIP' }), []);
  const restore = useCallback((payload) => dispatch({ type: 'RESTORE', payload }), []);
  const setFocusDuration = useCallback((v) =>
    dispatch({ type: 'SET_FOCUS_DURATION', value: v }), []);
  const setBreakDuration = useCallback((v) =>
    dispatch({ type: 'SET_BREAK_DURATION', value: v }), []);

  return {
    state,
    start,
    pause,
    resume,
    reset,
    fullReset,
    skip,
    restore,
    setFocusDuration,
    setBreakDuration,
  };
}
