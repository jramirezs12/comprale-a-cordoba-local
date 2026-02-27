'use client';
import { formatPrice } from '../../utils/format';

export default function CheckoutItem({ product, quantity, onUpdateQuantity }) {
  return (
    <li className="checkout__item">
      <img className="checkout__item-img" src={product.image} alt={product.name} />
      <div className="checkout__item-info">
        <p className="checkout__item-name">{product.name}</p>
        <div className="checkout__item-qty" role="group" aria-label={`Cantidad de ${product.name}`}>
          <button type="button" className="checkout__qty-btn" onClick={() => onUpdateQuantity(product.id, quantity - 1)} aria-label="Reducir">
            −
          </button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" className="checkout__qty-btn" onClick={() => onUpdateQuantity(product.id, quantity + 1)} aria-label="Aumentar">
            +
          </button>
        </div>
      </div>
      <p className="checkout__item-price">{formatPrice(product.price * quantity)}</p>
    </li>
  );
}
