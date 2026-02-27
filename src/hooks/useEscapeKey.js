import { useEffect } from 'react';

/**
 * Calls `onClose` when the Escape key is pressed while `open` is true.
 */
export function useEscapeKey(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);
}
