'use client';

import { useTrackShipment } from '../../hooks/useTrackShipment';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './TrackingModal.css';

export default function TrackingModal({ open, trackNumber, onClose }) {
  const { data, isFetching, isError, error } = useTrackShipment(trackNumber, { enabled: open });

  const info = data?.trackShipment || null;

  useEscapeKey(open, onClose);

  if (!open) return null;

  return (
    <div className="tracking" role="dialog" aria-modal="true" aria-label="Tracking del pedido">
      <div className="tracking__backdrop" onClick={onClose} />

      <div className="tracking__card" role="document">
        <button className="tracking__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <h2 className="tracking__title">Tracking del pedido</h2>

        <div className="tracking__top">
          <div>
            <div className="tracking__k">Número de guía</div>
            <div className="tracking__v">{String(trackNumber || '').trim() || '—'}</div>
          </div>

          <div className="tracking__right">
            <div className="tracking__k">Fecha de pedido</div>
            <div className="tracking__v">{info?.order_date || '—'}</div>
          </div>
        </div>

        <div className="tracking__divider" />

        {isFetching && <p className="tracking__muted">Consultando estado…</p>}

        {!isFetching && (isError || info?.errors) && (
          <p className="tracking__error">
            {info?.error_message || error?.message || 'No se pudo consultar el envío.'}
          </p>
        )}

        {!isFetching && info && !info.errors && (
          <div className="tracking__body">
            <div className="tracking__row">
              <span className="tracking__k">Estado</span>
              <span className="tracking__v">
                {info.status_name || '—'} · {info.status_time || '—'}
              </span>
            </div>

            <div className="tracking__row">
              <span className="tracking__k">Cliente</span>
              <span className="tracking__v">{info.name_customer || '—'}</span>
            </div>

            <div className="tracking__row">
              <span className="tracking__k">Dirección</span>
              <span className="tracking__v">{info.shipping_address || '—'}</span>
            </div>

            <div className="tracking__row">
              <span className="tracking__k">Ciudad</span>
              <span className="tracking__v">{info.shipping_city || '—'}</span>
            </div>

            <div className="tracking__row">
              <span className="tracking__k">Teléfono</span>
              <span className="tracking__v">{info.shipping_phone || '—'}</span>
            </div>

            <div className="tracking__row">
              <span className="tracking__k">Entrega estimada</span>
              <span className="tracking__v">{info.delivery_time ? `${info.delivery_time} día(s)` : '—'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}