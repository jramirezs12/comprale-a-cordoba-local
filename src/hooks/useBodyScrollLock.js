import { useEffect } from 'react';

/**
 * Locks body scroll when `active` is true. Restores on cleanup.
 */
export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [active]);
}
