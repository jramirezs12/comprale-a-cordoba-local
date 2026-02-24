'use client';

import { useRef, useEffect, useState } from 'react';
import './Stats.css';

function formatDisplay(value, format) {
  if (format === 'currency') {
    if (value < 1000) return String(Math.floor(value));
    const k = Math.floor(value / 1000);
    return `${k}k`;
  }
  return String(Math.floor(value));
}

function useCountUp(target, duration = 1800, isVisible) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || startedRef.current) return;
    startedRef.current = true;

    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, target, duration]);

  return count;
}

function StatItem({ value, label, format }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(value, 1800, isVisible);
  const display = formatDisplay(count, format);

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-item__number" aria-label={display}>{display}</span>
      <span className="stat-item__label">{label}</span>
    </div>
  );
}

export default StatItem;
