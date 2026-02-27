'use client';

import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './SearchPanel.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);

export default function SearchPanel({ open, anchorTop = 84, query, results, loading, onClose, onSelect }) {
  const list = useMemo(() => (Array.isArray(results) ? results : []), [results]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      {/* soft backdrop (not too invasive) */}
      <div className="search-panel__backdrop" onClick={onClose} aria-hidden="true" />

      <section
        className="search-panel"
        role="dialog"
        aria-modal="false"
        aria-label="Resultados de búsqueda"
        style={{ top: anchorTop }}
      >
        <header className="search-panel__head">
          <div className="search-panel__title">
            Resultados para <span>“{query}”</span>
          </div>

          <button className="search-panel__close" onClick={onClose} type="button" aria-label="Cerrar resultados">
            ✕
          </button>
        </header>

        <div className="search-panel__body">
          {loading ? (
            <p className="search-panel__state">Buscando…</p>
          ) : list.length ? (
            <div className="search-panel__grid" role="list" aria-label="Productos encontrados">
              {list.slice(0, 18).map((p) => (
                <button
                  key={`${p.sellerId}-${p.sku}`}
                  className="search-panel__card"
                  type="button"
                  role="listitem"
                  onClick={() => onSelect?.(p)}
                >
                  <img className="search-panel__img" src={p.image} alt={p.name} loading="lazy" />
                  <div className="search-panel__meta">
                    <div className="search-panel__name">{p.name}</div>
                    <div className="search-panel__price">{formatPrice(p.price)}</div>
                    {p.sellerName ? <div className="search-panel__seller">{p.sellerName}</div> : null}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="search-panel__state">No encontramos productos con ese término.</p>
          )}
        </div>
      </section>
    </>,
    document.body
  );
}