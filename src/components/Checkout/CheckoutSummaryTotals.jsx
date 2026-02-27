'use client';
import { formatPrice } from '../../utils/format';

export default function CheckoutSummaryTotals({ total, shippingCost, grandTotal, cartSyncing, shippingLoading, canSubmit, processing }) {
  const shippingDisplay = cartSyncing || shippingLoading ? '...' : shippingCost !== null ? formatPrice(shippingCost) : '$0';
  return (
    <>
      <hr className="checkout__divider" />
      <div className="checkout__summary">
        <div className="checkout__summary-row">
          <span>Costo de envío</span>
          <span>{shippingDisplay}</span>
        </div>
        <div className="checkout__summary-row">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <hr className="checkout__divider" />
      <div className="checkout__summary-row checkout__summary-row--total">
        <span>Total</span>
        <span>{formatPrice(grandTotal)}</span>
      </div>
      <button
        type="submit"
        className="checkout__pay-btn"
        disabled={!canSubmit}
        aria-busy={processing}
        aria-disabled={!canSubmit}
        title={!canSubmit ? 'Completa todos los campos requeridos para continuar.' : undefined}
      >
        {processing ? 'Procesando…' : 'Pagar'}
      </button>
    </>
  );
}
