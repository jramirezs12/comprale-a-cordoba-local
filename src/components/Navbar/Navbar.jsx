'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CartIcon from './CartIcon';
import MenuDropdown from './MenuDropdown';
import TrackingModal from '../TrackingModal/TrackingModal';
import SearchPanel from './SearchPanel';
import { useProductSearch } from '../../hooks/useProductSearch';
import './Navbar.css';

function encodePathSegment(value) {
  return encodeURIComponent(String(value ?? ''));
}

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingQuery, setTrackingQuery] = useState('');
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const router = useRouter();

  const search = useProductSearch(searchQuery, { enabled: true });
  const results = useMemo(() => search.products || [], [search.products]);

  const handleProductSearchSubmit = (e) => {
    e.preventDefault();
    if (String(searchQuery || '').trim().length >= 2) setSearchOpen(true);
  };

  const openTracking = () => {
    const clean = String(trackingQuery || '').trim();
    if (!clean) return;
    setIsTrackingOpen(true);
  };

  const handleTrackingSubmit = (e) => {
    e.preventDefault();
    openTracking();
  };

  const handleLogoClick = () => router.push('/');

  const handleSelectProduct = (p) => {
    setSearchOpen(false);
    setSearchQuery('');

    const sellerQ = p?.sellerId ? `?seller=${encodeURIComponent(String(p.sellerId))}` : '';
    const productSegment = encodePathSegment(p?.sku); // ✅ critical: prevents invalid % / ñ / spaces issues
    router.push(`/product/${productSegment}${sellerQ}`);
  };

  const shouldAutoOpen = String(searchQuery || '').trim().length >= 2;

  return (
    <>
      <nav className="navbar" aria-label="Navegación principal">
        <button className="navbar__logo" onClick={handleLogoClick} aria-label="Ir al inicio">
          <Image src="/brand/inter.svg" alt="Inter Rapidísimo" className="navbar__logo-img" width={96} height={28} priority />
        </button>

        <div className="navbar__search-bar" role="search" aria-label="Búsqueda y rastreo">
          <form className="navbar__segment" onSubmit={handleProductSearchSubmit} aria-label="Buscar productos">
            <input
              type="search"
              className="navbar__search-input"
              placeholder="Busca tu producto"
              value={searchQuery}
              onChange={(e) => {
                const v = e.target.value;
                setSearchQuery(v);
                if (v.trim().length >= 2) setSearchOpen(true);
              }}
              onFocus={() => {
                if (shouldAutoOpen) setSearchOpen(true);
              }}
              aria-label="Buscar productos"
              inputMode="search"
              autoCorrect="off"
              autoCapitalize="none"
              enterKeyHint="search"
            />
            <button type="submit" className="navbar__icon-btn" aria-label="Buscar">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          <span className="navbar__divider" aria-hidden="true" />

          <form className="navbar__segment" onSubmit={handleTrackingSubmit} aria-label="Rastrear envío">
            <input
              type="search"
              className="navbar__search-input"
              placeholder="Rastrea tu envío"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              aria-label="Número de guía de envío"
              inputMode="search"
              autoCorrect="off"
              autoCapitalize="none"
              enterKeyHint="go"
            />
            <button type="submit" className="navbar__icon-btn" aria-label="Rastrear envío">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
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

      <SearchPanel
        open={searchOpen && shouldAutoOpen}
        anchorTop={96}
        query={searchQuery}
        results={results}
        loading={search.isFetching && search.queryEnabled}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSelectProduct}
      />

      <TrackingModal open={isTrackingOpen} trackNumber={trackingQuery} onClose={() => setIsTrackingOpen(false)} />
    </>
  );
}

export default Navbar;