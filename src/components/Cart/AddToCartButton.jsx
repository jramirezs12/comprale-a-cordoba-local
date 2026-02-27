'use client';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './AddToCartButton.css';

export default function AddToCartButton({
  product,
  sellerId,
  sellerName,
  quantity = 1,
  className = '',
  children = 'Agregar al carrito',
  ariaLabel,
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product, sellerId, quantity, sellerName);

    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  };

  return (
    <button
      type="button"
      className={`${className} addcart-btn${added ? ' addcart-btn--added' : ''}`}
      onClick={handleAdd}
      aria-label={ariaLabel || (added ? 'Agregado al carrito' : 'Agregar al carrito')}
    >
      <span className="addcart-btn__text">{added ? 'Agregado ✓' : children}</span>
    </button>
  );
}