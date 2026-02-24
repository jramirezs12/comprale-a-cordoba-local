'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CartIcon from './CartIcon';
import MenuDropdown from './MenuDropdown';
import './Navbar.css';

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingQuery, setTrackingQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <nav className="navbar" aria-label="Navegación principal">
      <button
        className="navbar__logo"
        onClick={handleLogoClick}
        aria-label="Ir al inicio"
      >
        <Image
          src="/brand/inter.svg"
          alt="Inter Rapidísimo"
          className="navbar__logo-img"
          width={160}
          height={44}
          priority
        />
      </button>

      <div className="navbar__search-bar" role="search" aria-label="Búsqueda y rastreo">
        {/* Segment 1: product search */}
        <form
          className="navbar__segment"
          onSubmit={handleSearchSubmit}
          aria-label="Buscar productos"
        >
          <input
            type="search"
            className="navbar__search-input"
            placeholder="Busca tu producto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar productos o negocios"
          />
          <button
            type="submit"
            className="navbar__icon-btn"
            aria-label="Buscar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        <span className="navbar__divider" aria-hidden="true" />

        {/* Segment 2: shipment tracking */}
        <form
          className="navbar__segment"
          onSubmit={handleSearchSubmit}
          aria-label="Rastrear envío"
        >
          <input
            type="search"
            className="navbar__search-input"
            placeholder="Rastrea tu envío"
            value={trackingQuery}
            onChange={(e) => setTrackingQuery(e.target.value)}
            aria-label="Número de guía de envío"
          />
          <button
            type="submit"
            className="navbar__icon-btn"
            aria-label="Rastrear envío"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </button>
        </form>
      </div>

      <div className="navbar__actions">
        <CartIcon />
        <MenuDropdown />
      </div>
    </nav>
  );
}

export default Navbar;

