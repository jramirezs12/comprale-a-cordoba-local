'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductScrollList from './ProductScrollList';
import './SellerCard.css';

function SellerCard({ seller, onViewDetail }) {
  const [offset, setOffset] = useState(0);
  const router = useRouter();
  const visibleCount = 3;
  const products = seller.products ?? [];
  const canPrev = offset > 0;
  const canNext = offset + visibleCount < products.length;

  const handlePrev = () => setOffset((o) => Math.max(0, o - 1));
  const handleNext = () =>
    setOffset((o) => Math.min(Math.max(0, products.length - visibleCount), o + 1));

  const handleSellerNav = () => router.push(`/seller/${seller.id}`);

  return (
    <div className="seller-card-wrap">
      <button
        className="seller-card__arrow seller-card__arrow--prev"
        onClick={handlePrev}
        disabled={!canPrev}
        aria-label="Productos anteriores"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <article className="seller-card">
        <div className="seller-card__left">
          <img
            className="seller-card__cover"
            src={seller.image}
            alt={`Portada de ${seller.name}`}
            loading="lazy"
            onClick={handleSellerNav}
            style={{ cursor: 'pointer' }}
          />
          <div className="seller-card__overlay">
            <span className="seller-card__category">{seller.category}</span>
            <h3
              className="seller-card__name"
              onClick={handleSellerNav}
              style={{ cursor: 'pointer' }}
            >
              {seller.name}
            </h3>
            <p className="seller-card__description">{seller.description}</p>
            <div className="seller-card__meta">
              <span className="seller-card__rating" aria-label={`Calificación: ${seller.rating}`}>
                ★ {seller.rating}
              </span>
              <button
                className="seller-card__btn"
                onClick={onViewDetail}
                aria-label={`Cómprale aquí a ${seller.name}`}
              >
                Cómprale aquí
              </button>
            </div>
          </div>
        </div>

        <div className="seller-card__right">
          <ProductScrollList
            products={products}
            offset={offset}
            visibleCount={visibleCount}
            sellerId={seller.id}
            sellerName={seller.name}
          />
        </div>
      </article>

      <button
        className="seller-card__arrow seller-card__arrow--next"
        onClick={handleNext}
        disabled={!canNext}
        aria-label="Más productos"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

export default SellerCard;
