'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import { useShippingQuote } from '../../hooks/useShippingQuote';
import { sellers as mockSellers, sponsors } from '../../data/mockData';
import './ProductDetail.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);

export default function ProductDetailClient({ product, sellerId }) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addItem } = useCart();

  const { data: shippingData } = useShippingQuote({ productId: product.id });
  const shippingInfo = shippingData?.shippingQuote;

  const mockSeller = sellerId ? mockSellers.find((s) => String(s.id) === String(sellerId)) : null;
  const sellerName = mockSeller?.name || '';
  const sellerImage = mockSeller?.image || '';

  const handleAddToCart = () => {
    addItem(product, sellerId, quantity, sellerName);
  };

  const handleBuyNow = () => {
    addItem(product, sellerId, quantity, sellerName);
    router.push('/checkout');
  };

  return (
    <div className="pdp" style={{ background: '#1d1d1f', minHeight: '100vh' }}>
      <Navbar />
      <main className="pdp__main">
        <div className="pdp__container">
          <button className="pdp__back" onClick={() => router.back()} aria-label="Volver">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>

          <div className="pdp__layout">
            {/* Left: Image */}
            <div className="pdp__image-wrap">
              <img
                className="pdp__image"
                src={product.image}
                alt={product.name}
              />
            </div>

            {/* Right: Info */}
            <div className="pdp__info" style={{ background: '#0a0a0a', borderRadius: '16px', padding: '32px' }}>
              {/* Seller chip */}
              {sellerId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  {sellerImage && (
                    <img
                      src={sellerImage}
                      alt={sellerName}
                      style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: 0 }}>Vendido por</p>
                    <p style={{ color: '#ffffff', fontWeight: 600, margin: 0 }}>{sellerName || `Vendedor #${sellerId}`}</p>
                  </div>
                  <a
                    href={`/seller/${sellerId}`}
                    style={{ marginLeft: 'auto', color: '#fbfbed', fontSize: '0.875rem', textDecoration: 'none' }}
                  >
                    Ver tienda →
                  </a>
                </div>
              )}

              <h1 className="pdp__name" style={{ color: '#ffffff' }}>{product.name}</h1>
              <p className="pdp__price" style={{ color: '#ffffff' }}>{formatPrice(product.price)}</p>

              <hr className="pdp__divider" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

              {product.description && (
                <p className="pdp__description" style={{ color: 'rgba(255,255,255,0.7)' }}>{product.description}</p>
              )}

              {/* Quantity */}
              <div className="pdp__qty-row">
                <span className="pdp__qty-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Cantidad</span>
                <div className="pdp__qty-ctrl" role="group" aria-label="Control de cantidad">
                  <button
                    className="pdp__qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Reducir cantidad"
                  >
                    −
                  </button>
                  <span className="pdp__qty-num" aria-live="polite" style={{ color: '#ffffff' }}>{quantity}</span>
                  <button
                    className="pdp__qty-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <button
                className="pdp__btn pdp__btn--primary"
                onClick={handleAddToCart}
                style={{ background: '#1d1d1f', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Agregar al carrito
              </button>
              <button
                className="pdp__btn pdp__btn--secondary"
                onClick={handleBuyNow}
                style={{ background: '#fbfbed', color: '#1a1a2e' }}
              >
                Comprar ahora
              </button>

              {/* Shipping info */}
              <div className="pdp__shipping" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>
                  Envío gratis con Inter Rapidísimo
                  {shippingInfo?.deliveryDays ? ` · Entrega en ${shippingInfo.deliveryDays} días` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer sponsors={sponsors} />
    </div>
  );
}
