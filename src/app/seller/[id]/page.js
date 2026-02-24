'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { sellers as mockSellers, sponsors } from '../../../data/mockData';
import { useProductsBySeller } from '../../../hooks/useProductsBySeller';
import { useCart } from '../../../context/CartContext';
import ClientProviders from '../../../providers/ClientProviders';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import '../../../pages/SellerDetailPage.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);

function SellerDetailContent({ id }) {
  const router = useRouter();
  const { addItem } = useCart();

  const { data, isError, isLoading } = useProductsBySeller({ sellerId: id });

  const mockSeller = mockSellers.find((s) => String(s.id) === id);

  const apiProducts =
    !isError && !isLoading && data?.productsBySeller?.items?.length
      ? data.productsBySeller.items.map((p) => ({
          id: p.sku,
          name: p.name,
          price: p.price_range?.minimum_price?.final_price?.value ?? 0,
          image: p.image?.url || '',
          description: p.description?.html?.replace(/<[^>]*>/g, '').trim() || '',
        }))
      : null;

  const seller = mockSeller || { id, name: 'Negocio', image: '', products: [] };
  const products = apiProducts || mockSeller?.products || [];

  if (!mockSeller && (isLoading || !data)) {
    return (
      <div className="seller-detail-page">
        <Navbar />
        <main className="seller-detail-page__notfound">
          <p>Cargando...</p>
        </main>
      </div>
    );
  }

  if (!mockSeller && isError && !data) {
    return (
      <div className="seller-detail-page seller-detail-page--notfound">
        <Navbar />
        <main className="seller-detail-page__notfound">
          <p>Negocio no encontrado.</p>
          <button className="seller-detail-page__back" onClick={() => router.push('/')}>
            ← Volver al inicio
          </button>
        </main>
        <Footer sponsors={sponsors} />
      </div>
    );
  }

  return (
    <div className="seller-detail-page" style={{ background: '#1d1d1f', minHeight: '100vh' }}>
      <Navbar />
      <main>
        <header className="sdp-hero" style={{ height: '380px', position: 'relative', overflow: 'hidden' }}>
          <img
            className="sdp-hero__image"
            src={seller.image}
            alt={`Portada de ${seller.name}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div className="sdp-hero__overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }}>
            <div className="sdp-hero__inner" style={{ padding: '32px 40px' }}>
              <button
                className="sdp-hero__back"
                onClick={() => router.push('/')}
                aria-label="Volver al inicio"
                style={{ marginBottom: '12px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Volver
              </button>
              <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{seller.name}</h1>
            </div>
          </div>
        </header>

        <section className="sdp-products" aria-labelledby="sdp-products-title" style={{ padding: '40px' }}>
          <div className="sdp-products__inner" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 className="sdp-products__title" id="sdp-products-title" style={{ color: '#ffffff', marginBottom: '24px' }}>
              Productos disponibles
            </h2>
            <div
              className="sdp-products__grid"
              role="list"
              aria-label={`Productos de ${seller.name}`}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  role="listitem"
                  style={{ background: '#f5f5f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => router.push(`/product/${product.id}?seller=${id}`)}
                  />
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p
                      style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a1a2e', cursor: 'pointer', margin: 0 }}
                      onClick={() => router.push(`/product/${product.id}?seller=${id}`)}
                    >
                      {product.name}
                    </p>
                    <p style={{ color: '#4a4a6a', fontSize: '0.875rem', margin: 0 }}>{formatPrice(product.price)}</p>
                    <button
                      style={{ marginTop: 'auto', background: '#1d1d1f', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => addItem(product, id, 1, seller.name)}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer sponsors={sponsors} />
    </div>
  );
}

export default function SellerDetailPage({ params }) {
  const { id } = use(params);
  return (
    <ClientProviders>
      <SellerDetailContent id={id} />
    </ClientProviders>
  );
}
