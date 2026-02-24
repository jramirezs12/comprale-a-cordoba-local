'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductScrollList from './ProductScrollList';
import { useProductsBySeller } from '../../hooks/useProductsBySeller';
import './SellerCard.css';

const SELLER_PLACEHOLDER = 'https://via.placeholder.com/600x400?text=Negocio';
const PRODUCT_PLACEHOLDER = 'https://via.placeholder.com/400x400?text=Producto';

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapProductsFromApi(items = [], sellerId) {
  return (items || []).map((p, idx) => ({
    id: p?.sku || `${sellerId || 'seller'}-${idx}`,
    name: p?.name || '',
    price: p?.price_range?.minimum_price?.final_price?.value ?? 0,
    currency: p?.price_range?.minimum_price?.final_price?.currency || 'COP',
    image: p?.image?.url || PRODUCT_PLACEHOLDER,
    sku: p?.sku || null,
  }));
}

function SellerCard({ seller, onViewDetail }) {
  const [offset, setOffset] = useState(0);
  const router = useRouter();
  const visibleCount = 3;

  const sellerId = seller?.id;
  const sellerName = seller?.name || '';
  const sellerImage = seller?.image || SELLER_PLACEHOLDER;
  const sellerDescription = stripHtml(seller?.description);

  // Fetch real products (with image/price) per seller
  const qProducts = useProductsBySeller({ sellerId, pageSize: 12, currentPage: 1, enabled: true });

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const products = useMemo(() => {
    const items = qProducts.data?.productsBySeller?.items;
    if (Array.isArray(items) && items.length) return mapProductsFromApi(items, sellerId);

    // fallback to whatever was passed (might contain only name)
    const fallback = Array.isArray(seller?.products) ? seller.products : [];
    return fallback.map((p, idx) => ({
      id: p?.id || `${sellerId || 'seller'}-${idx}`,
      name: p?.name || '',
      price: p?.price ?? 0,
      currency: 'COP',
      image: p?.image || PRODUCT_PLACEHOLDER,
      sku: p?.sku || null,
    }));
  }, [qProducts.data, seller?.products, sellerId]);

  const canPrev = offset > 0;
  const canNext = offset + visibleCount < products.length;

  const handlePrev = () => setOffset((o) => Math.max(0, o - 1));
  const handleNext = () => setOffset((o) => Math.min(Math.max(0, products.length - visibleCount), o + 1));

  const handleSellerNav = () => router.push(`/seller/${sellerId}`);

  return (
    <article className="seller-card" aria-label={`Negocio ${sellerName}`}>
      {/* Flecha izquierda */}
      <button
        className="seller-card__arrow seller-card__arrow--prev"
        onClick={handlePrev}
        disabled={!canPrev}
        aria-label="Productos anteriores"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Panel izquierdo: imagen arriba + info abajo */}
      <div className="seller-card__left">
        <div className="seller-card__image-wrap" onClick={handleSellerNav} role="button" tabIndex={0}>
          <img className="seller-card__cover" src={sellerImage} alt={`Portada de ${sellerName}`} loading="lazy" />
          <div className="seller-card__name-overlay">
            <h3 className="seller-card__name">{sellerName}</h3>
          </div>
        </div>

        <div className="seller-card__info">
          <p className="seller-card__description">{sellerDescription}</p>
          <button className="seller-card__btn" onClick={onViewDetail} aria-label={`Cómprale aquí a ${sellerName}`} type="button">
            Cómprale aquí
          </button>
        </div>
      </div>

      {/* Panel derecho: productos */}
      <div className="seller-card__right">
        <ProductScrollList
          products={products}
          offset={offset}
          visibleCount={visibleCount}
          sellerId={sellerId}
          sellerName={sellerName}
          loading={qProducts.isLoading}
        />
      </div>

      {/* Flecha derecha */}
      <button
        className="seller-card__arrow seller-card__arrow--next"
        onClick={handleNext}
        disabled={!canNext}
        aria-label="Más productos"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </article>
  );
}

export default SellerCard;