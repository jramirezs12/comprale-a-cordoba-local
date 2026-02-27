'use client';
import { formatPrice } from '../../utils/format';

export default function ProductInfoPanel({ cleanDescription, stock, isOutOfStock, quantity, decDisabled, incDisabled, totalPrice, onDecrement, onIncrement, onBuyNow, onSelectMore, buyAdded }) {
  return (
    <div className="pdp__info-panel">
      <div className="pdp__desc-section">
        <p className="pdp__desc-label">Descripción</p>
        <p className="pdp__desc-text">{cleanDescription}</p>
      </div>
      <div className="pdp__stock-row">
        <span className="pdp__stock-label">Unidades disponibles</span>
        <span className="pdp__stock-value">{stock != null ? stock : '—'}</span>
      </div>
      <div className="pdp__qty-row">
        <span className="pdp__qty-label">Cantidad</span>
        <div className="pdp__qty-ctrl" role="group" aria-label="Control de cantidad">
          <button className="pdp__qty-btn" onClick={onDecrement} aria-label="Reducir cantidad" type="button" disabled={decDisabled || isOutOfStock}>−</button>
          <span className="pdp__qty-num" aria-live="polite">{quantity}</span>
          <button className="pdp__qty-btn" onClick={onIncrement} aria-label="Aumentar cantidad" type="button" disabled={incDisabled || isOutOfStock}>+</button>
        </div>
      </div>
      <hr className="pdp__divider" />
      {quantity > 1 && (
        <div className="pdp__total-row" aria-label="Total según cantidad">
          <span className="pdp__total-text">Total</span>
          <span className="pdp__total-amount" aria-live="polite">{formatPrice(totalPrice)}</span>
        </div>
      )}
      <button className={`pdp__btn pdp__btn--comprar${isOutOfStock ? ' pdp__btn--disabled' : ''}`} onClick={onBuyNow} type="button" disabled={isOutOfStock}>
        {buyAdded ? 'Agregado ✓' : 'Comprar'}
      </button>
      <button className={`pdp__btn pdp__btn--mas${isOutOfStock ? ' pdp__btn--disabled' : ''}`} onClick={onSelectMore} type="button" disabled={isOutOfStock}>
        Seleccionar más productos
      </button>
      {isOutOfStock && <p className="pdp__stock-message">Producto sin stock disponible.</p>}
    </div>
  );
}
