'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import { formatPrice } from '../../utils/format';
import { encodePathSegment } from '../../utils/url';
import './ProductItem.css';

function ProductItem({ product, sellerId, sellerName }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [added, setAdded] = useState(false);

  const handleClick = () => {
    const query = sellerId ? `?seller=${encodeURIComponent(String(sellerId))}` : '';
    const productSegment = encodePathSegment(product.id); // ✅ critical
    router.push(`/product/${productSegment}${query}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product, sellerId, 1, sellerName);

    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  };

  return (
    <div
      className={`product-item${added ? ' product-item--added' : ''}`}
      role="listitem"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <img className="product-item__image" src={product.image} alt={product.name} loading="lazy" />
      <hr className="product-item__divider" />
      <div className="product-item__body">
        <div className="product-item__info">
          <p className="product-item__name">{product.name}</p>
          <p className="product-item__price">{formatPrice(product.price)}</p>
        </div>

        <button
          className={`product-item__add${added ? ' product-item__add--added' : ''}`}
          aria-label={added ? `${product.name} agregado al carrito` : `Agregar ${product.name} al carrito`}
          onClick={handleAddToCart}
          type="button"
        >
          {added ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          )}
        </button>
      </div>

      <div className="product-item__addedToast" aria-hidden="true">
        Agregado
      </div>
    </div>
  );
}

export default ProductItem;