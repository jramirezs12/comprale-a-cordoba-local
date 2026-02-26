'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderSuccessModal from '../../../components/OrderSuccessModal/OrderSuccessModal';
import { useGuestOrderByToken } from '../../../hooks/useGuestOrderByToken';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ tu pasarela realmente está enviando "order" (token)
  const token = searchParams.get('order') || searchParams.get('token') || '';

  const status = (searchParams.get('status') || '').toLowerCase();
  const shouldShow = status === 'success' && token;

  const [open, setOpen] = useState(true);

  const { data, isFetching, isError } = useGuestOrderByToken(token, { enabled: shouldShow });
  const order = useMemo(() => data?.guestOrderByToken || null, [data]);

  const handleClose = () => {
    setOpen(false);
    router.push('/');
  };

  return (
    <>
      <OrderSuccessModal open={open && !!order} order={order} onClose={handleClose} />

      {shouldShow && isFetching && <div style={{ minHeight: '100vh', background: '#1d1d1f' }} />}

      {shouldShow && isError && (
        <div style={{ minHeight: '100vh', background: '#1d1d1f', color: '#fff', padding: 40 }}>
          No se pudo consultar el detalle de la orden.
        </div>
      )}
    </>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1d1d1f' }} />}>
      <CallbackContent />
    </Suspense>
  );
}