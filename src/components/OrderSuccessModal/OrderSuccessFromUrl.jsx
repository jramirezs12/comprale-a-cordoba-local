'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGuestOrderByToken } from '../../hooks/useGuestOrderByToken';
import OrderSuccessModal from './OrderSuccessModal';

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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.55)',
          }}
          aria-hidden="true"
        />
      )}

      {shouldShow && open && (isError || (data && !order)) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.55)',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            color: '#fff',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Error consultando la orden"
          onClick={handleClose}
        >
          <div
            style={{
              width: 'min(720px, calc(100vw - 48px))',
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>No se pudo consultar el detalle de la orden</h2>
            <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.75)' }}>
              {error?.message || 'Intenta nuevamente.'}
            </p>
            <button
              type="button"
              onClick={handleClose}
              style={{
                marginTop: 16,
                background: '#fbfbed',
                color: '#1a1a2e',
                border: 0,
                borderRadius: 10,
                padding: '10px 14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}