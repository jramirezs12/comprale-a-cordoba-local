'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import { useSimilarProducts } from '../../hooks/useSimilarProducts';
import { formatPrice } from '../../utils/format';
import { decodeHtmlEntities, normalizeSpaces, stripHtmlDeep } from '../../utils/html';
import { usePauseResume } from '../../hooks/usePauseResume';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import ProductGallery from './ProductGallery';
import ProductInfoPanel from './ProductInfoPanel';
import SimilarProductsSection from './SimilarProductsSection';
import './ProductDetail.css';

function clampQty(qty, stock) {
  if (typeof stock !== 'number') return Math.max(1, qty);
  if (stock <= 0) return 1;
  return Math.min(Math.max(1, qty), stock);
}

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
    const stripped = stripHtmlDeep(decoded);
    const normalized = normalizeSpaces(stripped);
    return normalized || 'Sin descripción disponible.';
  }, [product.description]);

  const { data: similarData, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching: similarLoading } =
    useSimilarProducts({ excludeProductId: product.id });
  const similarItems = useMemo(() => similarData?.products || [], [similarData]);

  const similarScrollRef = useRef(null);
  const { paused, pauseAuto } = usePauseResume(2500);

  const getStepPx = useCallback(() => {
    const el = similarScrollRef.current;
    if (!el) return 280;
    const firstCard = el.querySelector('.product-item');
    const cardW = firstCard ? firstCard.getBoundingClientRect().width : 260;
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || '20') || 20;
    return cardW + gap;
  }, []);

  const scrollByStep = useCallback((dir) => {
    const el = similarScrollRef.current;
    if (!el) return;
    pauseAuto();
    el.scrollBy({ left: dir * getStepPx(), behavior: 'smooth' });
  }, [getStepPx, pauseAuto]);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrowState = useCallback(() => {
    const el = similarScrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => { updateArrowState(); }, [similarItems, updateArrowState]);

  useEffect(() => {
    const el = similarScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      pauseAuto();
      updateArrowState();
      if (!hasNextPage || isFetchingNextPage) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 120) fetchNextPage();
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, pauseAuto, updateArrowState]);

  useAutoScroll({ trackRef: similarScrollRef, items: similarItems, paused, getStepPx, intervalMs: 3500 });

  const handleSimilarKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByStep(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByStep(-1); }
  };

  const [buyAdded, setBuyAdded] = useState(false);

  const handleBuyNow = async () => {
    if (typeof stock === 'number' && stock <= 0) return;
    addItem(product, sellerId, clampQty(quantity, stock), sellerName);
    setBuyAdded(true);
    await new Promise((r) => setTimeout(r, 250));
    router.push('/checkout');
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
            <ProductGallery gallery={gallery} activeImg={activeImg} onSelectImage={setActiveImg} productName={product.name} />
            <ProductInfoPanel
              cleanDescription={cleanDescription}
              stock={stock}
              isOutOfStock={isOutOfStock}
              quantity={quantity}
              decDisabled={decDisabled}
              incDisabled={incDisabled}
              totalPrice={totalPrice}
              onDecrement={() => setQuantity((q) => clampQty(q - 1, stock))}
              onIncrement={() => setQuantity((q) => clampQty(q + 1, stock))}
              onBuyNow={handleBuyNow}
              onSelectMore={() => router.push('/')}
              buyAdded={buyAdded}
            />
          </div>

          <SimilarProductsSection
            similarItems={similarItems}
            similarLoading={similarLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            canPrev={canPrev}
            canNext={canNext}
            onScrollPrev={() => scrollByStep(-1)}
            onScrollNext={() => scrollByStep(1)}
            onFetchNext={() => fetchNextPage()}
            scrollRef={similarScrollRef}
            handleKeyDown={handleSimilarKeyDown}
            onMouseEnter={pauseAuto}
            onFocus={pauseAuto}
          />
        </div>
      </main>
      <Footer sponsors={[]} />
    </div>
  );
}
