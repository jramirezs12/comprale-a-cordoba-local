'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ProductItem from './ProductItem';
import './ProductScrollList.css';

const AUTOSCROLL_MS = 3500;
const RESUME_AFTER_MS = 2500;

function getCardStepPx(trackEl) {
  if (!trackEl) return 280;
  const first = trackEl.querySelector('.product-scroll__item');
  const cardWidth = first ? first.getBoundingClientRect().width : 260;

  const styles = window.getComputedStyle(trackEl);
  const gap = parseFloat(styles.columnGap || styles.gap || '16') || 16;

  return cardWidth + gap;
}

function getLimits(el) {
  if (!el) return { canPrev: false, canNext: false };
  const max = el.scrollWidth - el.clientWidth;
  const left = el.scrollLeft;
  return {
    canPrev: left > 4,
    canNext: left < max - 4,
  };
}

const ProductScrollList = forwardRef(function ProductScrollList(
  { products, sellerId, sellerName, loading = false, visibleCount = 3, onLimitsChange },
  ref
) {
  const trackRef = useRef(null);

  // Drag state
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  // Pause/resume autoscroll on interaction
  const resumeTimerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const visible = useMemo(() => products || [], [products]);

  const pauseAuto = useCallback(() => {
    setPaused(true);
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setPaused(false), RESUME_AFTER_MS);
  }, []);

  const reportLimits = useCallback(() => {
    const el = trackRef.current;
    const limits = getLimits(el);
    onLimitsChange?.(limits);
    return limits;
  }, [onLimitsChange]);

  const scrollByStep = useCallback(
    (dir, behavior = 'smooth') => {
      const el = trackRef.current;
      if (!el) return;
      const step = getCardStepPx(el);
      el.scrollBy({ left: dir * step, behavior });
    },
    []
  );

  const scrollNext = useCallback(() => scrollByStep(1), [scrollByStep]);
  const scrollPrev = useCallback(() => scrollByStep(-1), [scrollByStep]);

  // ✅ expose methods for external arrows (SellerCard)
  useImperativeHandle(
    ref,
    () => ({
      next: () => {
        pauseAuto();
        scrollNext();
      },
      prev: () => {
        pauseAuto();
        scrollPrev();
      },
      pause: () => pauseAuto(),
      getLimits: () => reportLimits(),
    }),
    [pauseAuto, scrollNext, scrollPrev, reportLimits]
  );

  // Auto-scroll
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (!visible || visible.length === 0) return;
    if (paused) return;

    const id = window.setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      const nearEnd = el.scrollLeft >= max - 8;

      if (nearEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else scrollNext();
    }, AUTOSCROLL_MS);

    return () => window.clearInterval(id);
  }, [visible, paused, scrollNext]);

  // Cleanup resume timer
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // Initial limits + update when products change
  useEffect(() => {
    // wait one paint so scrollWidth/clientWidth are correct
    const raf = window.requestAnimationFrame(() => reportLimits());
    return () => window.cancelAnimationFrame(raf);
  }, [visible, reportLimits]);

  // Wheel: vertical wheel scrolls horizontally (mouse wheel)
  const handleWheel = (e) => {
    const el = trackRef.current;
    if (!el) return;

    const dx = Math.abs(e.deltaX);
    const dy = Math.abs(e.deltaY);

    // Trackpad horizontal should work naturally; only convert if mostly vertical wheel
    if (dy > dx) {
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: 'auto' });
      pauseAuto();
      reportLimits();
    }
  };

  // Drag handlers
  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    if (e.button !== undefined && e.button !== 0) return;

    isDownRef.current = true;
    el.classList.add('product-scroll__track--dragging');
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    pauseAuto();
  };

  const onPointerMove = (e) => {
    const el = trackRef.current;
    if (!el) return;
    if (!isDownRef.current) return;

    const walk = e.clientX - startXRef.current;
    el.scrollLeft = startScrollLeftRef.current - walk;
    reportLimits();
  };

  const endDrag = () => {
    const el = trackRef.current;
    if (!el) return;
    isDownRef.current = false;
    el.classList.remove('product-scroll__track--dragging');
    reportLimits();
  };

  // Keyboard on focused track
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      pauseAuto();
      scrollNext();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      pauseAuto();
      scrollPrev();
    }
  };

  if (loading && (!visible || visible.length === 0)) {
    return (
      <div ref={trackRef} className="product-scroll__track" role="list" aria-label="Productos del negocio (cargando)">
        {Array.from({ length: visibleCount }).map((_, i) => (
          <div key={i} className="product-item product-item--skeleton" aria-hidden="true" />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className="product-scroll__track"
      role="list"
      aria-label="Productos del negocio"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={handleWheel}
      onScroll={() => {
        pauseAuto();
        reportLimits();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      onMouseEnter={pauseAuto}
      onFocus={() => {
        pauseAuto();
        reportLimits();
      }}
    >
      {visible.map((product) => (
        <div className="product-scroll__item" key={product.id} role="listitem">
          <ProductItem product={product} sellerId={sellerId} sellerName={sellerName} />
        </div>
      ))}
    </div>
  );
});

export default ProductScrollList;