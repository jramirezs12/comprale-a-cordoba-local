'use client';

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../Cart/CartDrawer';
import './CartIcon.css';

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function CartIcon() {
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <button className="cart-icon" aria-label={`Carrito, ${count} artículos`} onClick={() => setOpen(true)}>
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {count > 0 && (
          <span className="cart-icon__badge" aria-hidden="true">{count}</span>
        )}
      </button>
      {isClient && createPortal(
        <CartDrawer open={open} onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  );
}

export default CartIcon;
