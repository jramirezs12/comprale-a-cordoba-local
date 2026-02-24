'use client';

import { useEffect, useRef } from 'react';
import './Hero.css';

const SCROLL_THRESHOLD = 2;
const VIDEO_URL =
  'https://www.w3schools.com/howto/rain.mp4';

function Hero({ nextSectionRef }) {
  const heroRef = useRef(null);
  const scrollCountRef = useRef(0);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const handleWheel = (e) => {
      if (hasScrolledRef.current) return;

      const hero = heroRef.current;
      if (!hero) return;

      const heroBottom = hero.getBoundingClientRect().bottom;
      const isHeroVisible = heroBottom > 0;

      if (!isHeroVisible) return;

      if (e.deltaY > 0) {
        scrollCountRef.current += 1;
      }

      if (scrollCountRef.current >= SCROLL_THRESHOLD) {
        hasScrolledRef.current = true;
        nextSectionRef?.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [nextSectionRef]);

  return (
    <section className="hero" ref={heroRef} id="hero">
      <video
        className="hero__video"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      <div className="hero__overlay" />

      <div className="hero__content">
        <h1 className="hero__title">
          Cómprale a <span className="hero__title-accent">Córdoba</span>
        </h1>
        <p className="hero__subtitle">
          Apoya los negocios locales y recibe tus productos sin costo adicional
        </p>
        <button
          className="hero__cta"
          onClick={() => nextSectionRef?.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          Descubrir negocios
        </button>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

export default Hero;
