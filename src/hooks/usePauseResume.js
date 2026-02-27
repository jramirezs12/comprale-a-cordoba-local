import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Returns `{ paused, pauseAuto }`.
 * Calling `pauseAuto()` sets paused=true and schedules a resume after `resumeAfterMs`.
 */
export function usePauseResume(resumeAfterMs = 2500) {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const pauseAuto = useCallback(() => {
    setPaused(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPaused(false), resumeAfterMs);
  }, [resumeAfterMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { paused, pauseAuto };
}
