'use client';
import ProductItem from '../SellerSection/ProductItem';

export default function SimilarProductsSection({ similarItems, similarLoading, isFetchingNextPage, hasNextPage, canPrev, canNext, onScrollPrev, onScrollNext, onFetchNext, scrollRef, handleKeyDown, onMouseEnter, onFocus }) {
  if (!similarItems.length && !similarLoading) return null;
  return (
    <section className="pdp__similar" aria-label="Artículos similares">
      <div className="pdp__similar-head">
        <h2 className="pdp__similar-title">Artículos similares</h2>
        <div className="pdp__similar-arrows" aria-hidden="false">
          <button type="button" className="pdp__similar-arrow" onClick={onScrollPrev} disabled={!canPrev} aria-label="Anteriores">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" className="pdp__similar-arrow" onClick={onScrollNext} disabled={!canNext} aria-label="Siguientes">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
      <div
        className="pdp__similar-scroll"
        ref={scrollRef}
        role="list"
        aria-label="Productos similares"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
      >
        {similarItems.map(({ id, sku, name, price, image, sellerId: sid, sellerName: sname }) => (
          <ProductItem key={`${sid}-${id}`} product={{ id, sku, name, price, image }} sellerId={sid} sellerName={sname} />
        ))}
        {(similarLoading || isFetchingNextPage) &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} className="product-item product-item--skeleton" aria-hidden="true" />
          ))}
      </div>
      {hasNextPage && !isFetchingNextPage && (
        <button className="pdp__similar-more" onClick={onFetchNext} type="button">
          Ver más
        </button>
      )}
    </section>
  );
}
