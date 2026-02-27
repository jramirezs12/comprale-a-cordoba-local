import { useEffect } from 'react';

/**
 * Auto-scrolls a container element at a fixed interval.
 * Loops back to start when reaching the end.
 *
 * @param {object} params
 * @param {React.RefObject} params.trackRef - ref to the scrollable container
 * @param {any[]} params.items - list being rendered; scroll starts only when non-empty
 * @param {boolean} params.paused - when true, scroll is suspended
 * @param {() => number} params.getStepPx - returns the px amount to scroll each tick
 * @param {number} [params.intervalMs=3500] - interval between scroll steps
 */
export function useAutoScroll({ trackRef, items, paused, getStepPx, intervalMs = 3500 }) {
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !items?.length || paused) return;

    const id = window.setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      const nearEnd = el.scrollLeft >= max - 8;
      if (nearEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: getStepPx(), behavior: 'smooth' });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [items, paused, getStepPx, intervalMs, trackRef]);
}
