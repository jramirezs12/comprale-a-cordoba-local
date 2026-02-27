'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import CartDrawerItem from './CartDrawerItem';
import CartDrawerFooter from './CartDrawerFooter';
import './CartDrawer.css';

export default function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeItem, total } = useCart();
  const router = useRouter();

  // ✅ same portal approach as CategoryDrawer
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const portalTarget = mounted ? document.body : null;

  useBodyScrollLock(open && mounted);
  useEscapeKey(open && mounted, onClose);

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
                <CartDrawerItem
                  key={product.id}
                  product={product}
                  quantity={quantity}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </ul>
            <CartDrawerFooter total={total} onCheckout={handleCheckout} />
          </>
        )}
      </aside>
    </>,
    portalTarget
  );
}
