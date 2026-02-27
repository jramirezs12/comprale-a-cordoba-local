'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGuestOrderByToken } from '../../hooks/useGuestOrderByToken';
import OrderSuccessModal from './OrderSuccessModal';
import './OrderSuccessFromUrl.css';

export default function OrderSuccessFromUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (searchParams.get('status') || '').toLowerCase();
  const tokenRaw = searchParams.get('order') || searchParams.get('token') || '';

  // ✅ important: sometimes "+" arrives as space
  const token = String(tokenRaw).trim().replace(/ /g, '+');

  const shouldShow = status === 'success' && token.length > 0;

  // keep modal open only when shouldShow becomes true
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (shouldShow) setOpen(true);
  }, [shouldShow]);

  const { data, isFetching, isError, error } = useGuestOrderByToken(token, { enabled: shouldShow });

  const order = useMemo(() => data?.guestOrderByToken || null, [data]);

  const handleClose = () => {
    setOpen(false);
    // ✅ remove params so it doesn't reopen on refresh/back
    router.replace('/', { scroll: false });
  };

  // If payment succeeded but we are still fetching, we can keep modal closed
  // until we have the order to show (current behavior), OR you can show a loader.
  // We'll keep it simple: open only when we have order.
  const modalOpen = shouldShow && open && !!order;

  return (
    <>
      <OrderSuccessModal open={modalOpen} order={order} onClose={handleClose} />

      {shouldShow && open && isFetching && (
        <div className="order-success-overlay" aria-hidden="true" />
      )}

      {shouldShow && open && (isError || (data && !order)) && (
        <div
          className="order-success-error-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Error consultando la orden"
          onClick={handleClose}
        >
          <div
            className="order-success-error-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="order-success-error-title">No se pudo consultar el detalle de la orden</h2>
            <p className="order-success-error-msg">
              {error?.message || 'Intenta nuevamente.'}
            </p>
            <button
              type="button"
              className="order-success-error-btn"
              onClick={handleClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
