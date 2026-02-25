'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../Cart/CartDrawer';
import './CartIcon.css';

export default function CartIcon() {
  const { items } = useCart();
  const [open, setOpen] = useState(false);

  const count = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);

  return (
    <>
      <button className="cart-icon" onClick={() => setOpen(true)} aria-label="Abrir carrito" type="button">
        <Image src="/brand/carrito-icon.svg" alt="" width={22} height={22} aria-hidden="true" />
        {count > 0 && <span className="cart-icon__badge">{count}</span>}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}