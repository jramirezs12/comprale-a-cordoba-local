'use client';

import { useEffect, useRef } from 'react';
import './Hero.css';

// ✅ Put your .jpeg in /public and update this path.
// Example: /public/hero-banner.jpeg  =>  src="/hero-banner.jpeg"
const HERO_BANNER_URL = '/hero-banner.jpeg';

function Hero({ nextSectionRef }) {
  const heroRef = useRef(null);
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
        hasScrolledRef.current = true;
        nextSectionRef?.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [nextSectionRef]);

  return (
    <section className="hero" ref={heroRef} id="hero">
      {/* ✅ Image banner (replaces video) */}
      <img
        className="hero__media"
        src={HERO_BANNER_URL}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />

      <div className="hero__overlay" />

      <div className="hero__content">
        <h1 className="hero__title" aria-label="compraleacordoba.com">
          <span className="hero__title-regular">compralea</span>
          <span className="hero__title-bold">cordoba.com</span>
        </h1>

        <p className="hero__subtitle">
          Un marketplace hecho para ayudarle a los
          <br />
          emprendedores de Córdoba a reempezar.
        </p>

        <div className="hero__arrows" aria-hidden="true">
          <svg
            className="hero__arrow"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <svg
            className="hero__arrow hero__arrow--second"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default Hero;