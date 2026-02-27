'use client';
import { formatPrice } from '../../utils/format';

export default function CartDrawerFooter({ total, onCheckout }) {
  return (
    <div className="cart-drawer__footer">
      <div className="cart-drawer__summary">
        <div className="cart-drawer__summary-row"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
        <div className="cart-drawer__summary-row cart-drawer__summary-row--total"><span>Total</span><span>{formatPrice(total)}</span></div>
      </div>
      <button className="cart-drawer__checkout-btn" onClick={onCheckout} type="button">Quiero ayudar</button>
    </div>
  );
}
