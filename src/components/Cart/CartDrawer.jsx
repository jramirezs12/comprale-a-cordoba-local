'use client';

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);

export default function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeItem, total } = useCart();
  const router = useRouter();

  // ✅ same portal approach as CategoryDrawer
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const portalTarget = mounted ? document.body : null;

  // ✅ lock body scroll when open
  useEffect(() => {
    if (!mounted) return;

    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, mounted]);

  // ✅ close on ESC
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!mounted) return;

    if (open) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown, mounted]);

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  if (!portalTarget) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`cart-drawer__overlay${open ? ' cart-drawer__overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`cart-drawer${open ? ' cart-drawer--open' : ''}`}
        aria-label="Carrito de compras"
        aria-modal="true"
        role="dialog"
      >
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">Tu carrito</h2>
          <button className="cart-drawer__close" onClick={onClose} aria-label="Cerrar carrito" type="button">
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

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <ul className="cart-drawer__items" aria-label="Artículos en el carrito">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="cart-drawer__item">
                  <img className="cart-drawer__item-img" src={product.image} alt={product.name} />
                  <div className="cart-drawer__item-info">
                    <p className="cart-drawer__item-name">{product.name}</p>
                    <p className="cart-drawer__item-price">{formatPrice(product.price)}</p>

                    <div className="cart-drawer__qty" role="group" aria-label={`Cantidad de ${product.name}`}>
                      <button
                        className="cart-drawer__qty-btn"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Reducir cantidad"
                        type="button"
                      >
                        −
                      </button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        className="cart-drawer__qty-btn"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Aumentar cantidad"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-drawer__item-right">
                    <p className="cart-drawer__item-total">{formatPrice(product.price * quantity)}</p>
                    <button
                      className="cart-drawer__remove"
                      onClick={() => removeItem(product.id)}
                      aria-label={`Eliminar ${product.name}`}
                      type="button"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__summary">
                <div className="cart-drawer__summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="cart-drawer__summary-row cart-drawer__summary-row--total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button className="cart-drawer__checkout-btn" onClick={handleCheckout} type="button">
                Quiero ayudar
              </button>
            </div>
          </>
        )}
      </aside>
    </>,
    portalTarget
  );
}