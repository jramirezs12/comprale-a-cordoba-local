'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './confirmation.css';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="confirm">
      <div className="confirm__card">
        <div className="confirm__icon" aria-hidden="true" style={{ width: '80px', height: '80px', background: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="confirm__title">¡Gracias por tu compra!</h1>
        {orderNumber && (
          <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0 16px', color: '#ffffff' }}>
            Pedido #{orderNumber}
          </p>
        )}
        <p className="confirm__subtitle">Tu pedido ha sido recibido y está siendo procesado.</p>
        <p className="confirm__shipping">
          Tu pedido será enviado a través de <strong>Inter Rapidísimo</strong>.
        </p>
        <button
          className="confirm__btn"
          onClick={() => router.push('/')}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="confirm" />}>
      <ConfirmationContent />
    </Suspense>
  );
}
