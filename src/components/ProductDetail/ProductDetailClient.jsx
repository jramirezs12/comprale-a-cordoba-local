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

/** Decodes HTML entities like &lt; &nbsp; &oacute; etc. */
function decodeHtmlEntities(input) {
  const s = String(input || '');
  if (!s) return '';
  if (typeof globalThis.window === 'undefined') return s;

  const txt = document.createElement('textarea');
  txt.innerHTML = s;
  return txt.value;
}

/** Remove HTML tags and cleanup whitespace */
function stripHtml(html) {
  return String(html || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalize NBSP and repeated spaces */
function normalizeSpaces(text) {
  return String(text || '')
    .replace(/\u00A0/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

  const cleanDescription = useMemo(() => {
    const decoded = decodeHtmlEntities(product.description);
    const stripped = stripHtml(decoded);
    const normalized = normalizeSpaces(stripped);
    return normalized || 'Sin descripción disponible.';
  }, [product.description]);

  const { data: similarData, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching: similarLoading } =
    useSimilarProducts({ excludeProductId: product.id });

  const similarItems = useMemo(() => similarData?.products || [], [similarData]);

  const similarScrollRef = useRef(null);

  // Pause/resume auto-scroll on interaction
  const resumeTimerRef = useRef(null);
  const [paused, setPaused] = useState(false);

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

  const scrollByStep = useCallback(
    (dir) => {
      const el = similarScrollRef.current;
      if (!el) return;
      pauseAuto();
      el.scrollBy({ left: dir * getStepPx(), behavior: 'smooth' });
    },
    [getStepPx, pauseAuto]
  );

  // ✅ Arrow enable/disable based on scroll position
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrowState = useCallback(() => {
    const el = similarScrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;

    setCanPrev(left > 4);
    setCanNext(left < max - 4);
  }, []);

  useEffect(() => {
    updateArrowState();
  }, [similarItems, updateArrowState]);

  useEffect(() => {
    const el = similarScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      pauseAuto();
      updateArrowState();

      // keep infinite pagination trigger
      if (!hasNextPage || isFetchingNextPage) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 120) {
        fetchNextPage();
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, pauseAuto, updateArrowState]);

  // Auto-scroll (optional): loops back to start when reaching end
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

  // Keyboard when focused
  const handleSimilarKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByStep(1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByStep(-1);
    }
  };

  // ✅ only for "Comprar"
  const [buyAdded, setBuyAdded] = useState(false);

  const handleBuyNow = async () => {
    if (typeof stock === 'number' && stock <= 0) return;
    const safeQty = clampQty(quantity, stock);

    addItem(product, sellerId, safeQty, sellerName);

    setBuyAdded(true);
    await new Promise((r) => setTimeout(r, 250));

    router.push('/checkout');
  };

  // ✅ does NOT add to cart, no "Agregado"
  const handleSelectMore = () => {
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
                <p className="pdp__desc-text">{cleanDescription}</p>
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
                {buyAdded ? 'Agregado ✓' : 'Comprar'}
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
              <div className="pdp__similar-head">
                <h2 className="pdp__similar-title">Artículos similares</h2>

                <div className="pdp__similar-arrows" aria-hidden="false">
                  <button
                    type="button"
                    className="pdp__similar-arrow"
                    onClick={() => scrollByStep(-1)}
                    disabled={!canPrev}
                    aria-label="Anteriores"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="pdp__similar-arrow"
                    onClick={() => scrollByStep(1)}
                    disabled={!canNext}
                    aria-label="Siguientes"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                className="pdp__similar-scroll"
                ref={similarScrollRef}
                role="list"
                aria-label="Productos similares"
                tabIndex={0}
                onKeyDown={handleSimilarKeyDown}
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