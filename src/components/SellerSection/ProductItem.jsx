'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import './ProductItem.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);

function ProductItem({ product, sellerId, sellerName }) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleClick = () => {
    const query = sellerId ? `?seller=${sellerId}` : '';
    router.push(`/product/${product.id}${query}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product, sellerId, 1, sellerName);
  };

  return (
    <div className="product-item" role="listitem">
      <img
        className="product-item__image"
        src={product.image}
        alt={product.name}
        loading="lazy"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
      <div className="product-item__body" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <p className="product-item__name">{product.name}</p>
        <p className="product-item__price">{formatPrice(product.price)}</p>
      </div>
      <button
        className="product-item__add"
        aria-label={`Agregar ${product.name} al carrito`}
        onClick={handleAddToCart}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </button>
    </div>
  );
}

export default ProductItem;
