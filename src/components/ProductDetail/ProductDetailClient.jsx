'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import ProductItem from '../SellerSection/ProductItem';
import { useSimilarProducts } from '../../hooks/useSimilarProducts';
import './ProductDetail.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);

function clampQty(qty, stock) {
  if (typeof stock !== 'number') return Math.max(1, qty);
  if (stock <= 0) return 1;
  return Math.min(Math.max(1, qty), stock);
}

const AUTOSCROLL_MS = 3500;
const RESUME_AFTER_MS = 2500;

export default function ProductDetailClient({ product, sellerId }) {
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const [activeImg, setActiveImg] = useState(0);

  const stock = typeof product.stock === 'number' ? product.stock : null;
  const isOutOfStock = stock === 0;

  const [quantity, setQuantity] = useState(() => clampQty(1, stock));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuantity((q) => clampQty(q, stock));
  }, [stock]);

  const router = useRouter();
  const { addItem } = useCart();

  const sellerName = '';

  const unitPrice = Number(product.price) || 0;
  const totalPrice = useMemo(() => unitPrice * (Number(quantity) || 1), [unitPrice, quantity]);

  const { data: similarData, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching: similarLoading } =
    useSimilarProducts({ excludeProductId: product.id });

  const similarItems = useMemo(() => similarData?.products || [], [similarData]);

  const similarScrollRef = useRef(null);

  // =========================
  // ✅ Similar scroll behavior (same as SellerSection)
  // =========================
  const resumeTimerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  const pauseAuto = useCallback(() => {
    setPaused(true);
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setPaused(false), RESUME_AFTER_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const getStepPx = useCallback(() => {
    const el = similarScrollRef.current;
    if (!el) return 280;
    const firstCard = el.querySelector('.product-item');
    const cardW = firstCard ? firstCard.getBoundingClientRect().width : 260;
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || '20') || 20;
    return cardW + gap;
  }, []);

  // Auto-scroll (loops back to start when reaching end)
  useEffect(() => {
    const el = similarScrollRef.current;
    if (!el) return;
    if (!similarItems || similarItems.length === 0) return;
    if (paused) return;

    const id = window.setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      const nearEnd = el.scrollLeft >= max - 8;

      if (nearEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: getStepPx(), behavior: 'smooth' });
    }, AUTOSCROLL_MS);

    return () => window.clearInterval(id);
  }, [similarItems, paused, getStepPx]);

  // Wheel: vertical wheel scrolls horizontally
  const handleSimilarWheel = (e) => {
    const el = similarScrollRef.current;
    if (!el) return;

    const dx = Math.abs(e.deltaX);
    const dy = Math.abs(e.deltaY);

    if (dy > dx) {
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: 'auto' });
      pauseAuto();
    }
  };

  // Drag
  const handleSimilarPointerDown = (e) => {
    const el = similarScrollRef.current;
    if (!el) return;
    if (e.button !== undefined && e.button !== 0) return;

    isDownRef.current = true;
    el.classList.add('pdp__similar-scroll--dragging');
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    pauseAuto();
  };

  const handleSimilarPointerMove = (e) => {
    const el = similarScrollRef.current;
    if (!el) return;
    if (!isDownRef.current) return;

    const walk = e.clientX - startXRef.current;
    el.scrollLeft = startScrollLeftRef.current - walk;
  };

  const endSimilarDrag = () => {
    const el = similarScrollRef.current;
    if (!el) return;
    isDownRef.current = false;
    el.classList.remove('pdp__similar-scroll--dragging');
  };

  // Keyboard when focused
  const handleSimilarKeyDown = (e) => {
    const el = similarScrollRef.current;
    if (!el) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      pauseAuto();
      el.scrollBy({ left: getStepPx(), behavior: 'smooth' });
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      pauseAuto();
      el.scrollBy({ left: -getStepPx(), behavior: 'smooth' });
    }
  };

  // Keep your infinite pagination trigger (load more when reaching end)
  useEffect(() => {
    const el = similarScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      pauseAuto();

      if (!hasNextPage || isFetchingNextPage) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 120) {
        fetchNextPage();
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, pauseAuto]);

  const handleBuyNow = () => {
    if (typeof stock === 'number' && stock <= 0) return;
    const safeQty = clampQty(quantity, stock);
    addItem(product, sellerId, safeQty, sellerName);
    router.push('/checkout');
  };

  const handleSelectMore = () => {
    if (typeof stock === 'number' && stock <= 0) return;
    const safeQty = clampQty(quantity, stock);
    addItem(product, sellerId, safeQty, sellerName);
    router.push('/');
  };

  const decDisabled = quantity <= 1;
  const incDisabled = typeof stock === 'number' ? quantity >= stock : false;

  return (
    <div className="pdp">
      <Navbar />

      <main className="pdp__main">
        <div className="pdp__container">
          <div className="pdp__title-row">
            <h1 className="pdp__title">{product.name}</h1>

            <div className="pdp__price-col" aria-label="Precio unitario del producto">
              <span className="pdp__price-display">{formatPrice(unitPrice)}</span>
            </div>
          </div>

          <div className="pdp__content-row">
            <div className="pdp__image-section">
              {gallery.length > 1 && (
                <div className="pdp__thumbnails" role="group" aria-label="Galería de imágenes del producto">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      className={`pdp__thumb-btn${activeImg === i ? ' pdp__thumb-btn--active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      aria-label={`Ver imagen ${i + 1} de ${gallery.length}`}
                      aria-pressed={activeImg === i}
                      type="button"
                    >
                      <img src={src} alt="" className="pdp__thumb-img" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}

              <div className="pdp__image-card">
                <img className="pdp__main-image" src={gallery[activeImg]} alt={product.name} />
              </div>
            </div>

            <div className="pdp__info-panel">
              <div className="pdp__desc-section">
                <p className="pdp__desc-label">Descripción</p>
                <p className="pdp__desc-text">{product.description || 'Sin descripción disponible.'}</p>
              </div>

              <div className="pdp__stock-row">
                <span className="pdp__stock-label">Unidades disponibles</span>
                <span className="pdp__stock-value">{stock != null ? stock : '—'}</span>
              </div>

              <div className="pdp__qty-row">
                <span className="pdp__qty-label">Cantidad</span>
                <div className="pdp__qty-ctrl" role="group" aria-label="Control de cantidad">
                  <button
                    className="pdp__qty-btn"
                    onClick={() => setQuantity((q) => clampQty(q - 1, stock))}
                    aria-label="Reducir cantidad"
                    type="button"
                    disabled={decDisabled || isOutOfStock}
                  >
                    −
                  </button>
                  <span className="pdp__qty-num" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    className="pdp__qty-btn"
                    onClick={() => setQuantity((q) => clampQty(q + 1, stock))}
                    aria-label="Aumentar cantidad"
                    type="button"
                    disabled={incDisabled || isOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>

              <hr className="pdp__divider" />

              {quantity > 1 && (
                <div className="pdp__total-row" aria-label="Total según cantidad">
                  <span className="pdp__total-text">Total</span>
                  <span className="pdp__total-amount" aria-live="polite">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              )}

              <button
                className="pdp__btn pdp__btn--comprar"
                onClick={handleBuyNow}
                type="button"
                disabled={isOutOfStock}
                style={isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
              >
                Comprar
              </button>

              <button
                className="pdp__btn pdp__btn--mas"
                onClick={handleSelectMore}
                type="button"
                disabled={isOutOfStock}
                style={isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
              >
                Seleccionar más productos
              </button>

              {isOutOfStock && (
                <p style={{ marginTop: 10, color: '#efefef', opacity: 0.8, fontSize: 13 }}>
                  Producto sin stock disponible.
                </p>
              )}
            </div>
          </div>

          {(similarItems.length > 0 || similarLoading) && (
            <section className="pdp__similar" aria-label="Artículos similares">
              <h2 className="pdp__similar-title">Artículos similares</h2>

              <div
                className="pdp__similar-scroll"
                ref={similarScrollRef}
                role="list"
                aria-label="Productos similares"
                tabIndex={0}
                onKeyDown={handleSimilarKeyDown}
                onWheel={handleSimilarWheel}
                onPointerDown={handleSimilarPointerDown}
                onPointerMove={handleSimilarPointerMove}
                onPointerUp={endSimilarDrag}
                onPointerCancel={endSimilarDrag}
                onPointerLeave={endSimilarDrag}
                onMouseEnter={pauseAuto}
                onFocus={pauseAuto}
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
                <button className="pdp__similar-more" onClick={() => fetchNextPage()} type="button">
                  Ver más
                </button>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer sponsors={[]} />
    </div>
  );
}