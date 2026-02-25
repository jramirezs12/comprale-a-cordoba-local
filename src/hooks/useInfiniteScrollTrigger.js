import { useEffect, useRef } from 'react';

export function useInfiniteScrollTrigger({ enabled, onLoadMore, rootMargin = '800px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore?.();
      },
      { root: null, rootMargin, threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [enabled, onLoadMore, rootMargin]);

  return ref;
}