'use client';
import { formatPrice } from '../../utils/format';

export default function CartDrawerItem({ product, quantity, onUpdateQuantity, onRemove }) {
  return (
    <li className="cart-drawer__item">
      <img className="cart-drawer__item-img" src={product.image} alt={product.name} />
      <div className="cart-drawer__item-info">
        <p className="cart-drawer__item-name">{product.name}</p>
        <p className="cart-drawer__item-price">{formatPrice(product.price)}</p>
        <div className="cart-drawer__qty" role="group" aria-label={`Cantidad de ${product.name}`}>
          <button className="cart-drawer__qty-btn" onClick={() => onUpdateQuantity(product.id, quantity - 1)} aria-label="Reducir cantidad" type="button">−</button>
          <span aria-live="polite">{quantity}</span>
          <button className="cart-drawer__qty-btn" onClick={() => onUpdateQuantity(product.id, quantity + 1)} aria-label="Aumentar cantidad" type="button">+</button>
        </div>
      </div>
      <div className="cart-drawer__item-right">
        <p className="cart-drawer__item-total">{formatPrice(product.price * quantity)}</p>
        <button className="cart-drawer__remove" onClick={() => onRemove(product.id)} aria-label={`Eliminar ${product.name}`} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </li>
  );
}
