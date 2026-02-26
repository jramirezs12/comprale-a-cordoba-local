'use client';

import { useEffect } from 'react';
import './OrderSuccessModal.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);

export default function OrderSuccessModal({ open, order, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="order-success" role="dialog" aria-modal="true" aria-label="Orden creada">
      <div className="order-success__backdrop" onClick={onClose} />

      <div className="order-success__card" role="document">
        <button className="order-success__close" onClick={onClose} aria-label="Cerrar" type="button">
          ×
        </button>

        <h2 className="order-success__title">Orden creada exitosamente</h2>

        <div className="order-success__grid">
          <div className="order-success__row">
            <span className="order-success__k">Pedido</span>
            <span className="order-success__v">{order?.increment_id || '—'}</span>
          </div>

          <div className="order-success__row">
            <span className="order-success__k">Total</span>
            <span className="order-success__v">{formatPrice(order?.grand_total)}</span>
          </div>

          <div className="order-success__row">
            <span className="order-success__k">Email</span>
            <span className="order-success__v">{order?.email || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}