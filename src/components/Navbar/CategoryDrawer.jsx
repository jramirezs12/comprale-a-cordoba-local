'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useCategories } from '../../hooks/useCategories';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import './CategoryDrawer.css';

function pickChildren(categoriesData) {
  const items = categoriesData?.categories?.items || [];
  const defaultCat = items.find((c) => c?.name === 'Default Category') || items[0];
  const children = defaultCat?.children || [];
  return children.filter((c) => c?.id && c?.name).map((c) => ({ id: String(c.id), name: c.name }));
}

export default function CategoryDrawer({ open, onClose }) {
  const { data, isLoading, isError } = useCategories();
  const categories = useMemo(() => pickChildren(data), [data]);

  // ✅ ensure portal target exists (avoids SSR mismatch)
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const portalTarget = mounted ? document.body : null;

  useBodyScrollLock(open && mounted);
  useEscapeKey(open && mounted, onClose);

  if (!portalTarget) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`cat-drawer__overlay${open ? ' cat-drawer__overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className={`cat-drawer${open ? ' cat-drawer--open' : ''}`} aria-label="Categorías" aria-modal="true" role="dialog">
        <div className="cat-drawer__header">
          <h2 className="cat-drawer__title">Categorías</h2>
          <button className="cat-drawer__close" onClick={onClose} aria-label="Cerrar categorías" type="button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="cat-drawer__empty">
            <p>Cargando…</p>
          </div>
        ) : isError ? (
          <div className="cat-drawer__empty">
            <p>Error cargando categorías.</p>
          </div>
        ) : (
          <ul className="cat-drawer__items" aria-label="Listado de categorías">
            {categories.map((c) => (
              <li key={c.id} className="cat-drawer__item">
                <Link className="cat-drawer__link" href={`/category/${c.id}`} onClick={onClose}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>,
    portalTarget
  );
}