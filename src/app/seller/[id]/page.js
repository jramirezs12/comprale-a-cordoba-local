'use client';

import { use, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerById } from '../../../hooks/useSellerById';
import { useProductsBySellerInfinite } from '../../../hooks/useProductsBySellerInfinite';
import { useInfiniteScrollTrigger } from '../../../hooks/useInfiniteScrollTrigger';
import { useCart } from '../../../context/CartContext';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import '../../../pages/SellerDetailPage.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);

function ensureHiRes(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.searchParams.get('optimize') === 'medium') u.searchParams.delete('optimize');
    return u.toString();
  } catch {
    return String(url).replace(/([?&])optimize=medium(&|$)/, '$1').replace(/[?&]$/, '');
  }
}

function SellerDetailContent({ id }) {
  const router = useRouter();
  const { addItem } = useCart();

  const sellerIdNum = Number(id);

  const { data: seller, isLoading: sellerLoading, isError: sellerError } = useSellerById({ sellerId: sellerIdNum });

  const productsQ = useProductsBySellerInfinite({ sellerId: sellerIdNum, pageSize: 12 });

  const products = useMemo(() => {
    const pages = productsQ.data?.pages || [];
    const out = [];
    for (const page of pages) {
      const items = page?.productsBySeller?.items || [];
      for (const p of items) {
        out.push({
          id: p.sku,
          sku: p.sku,
          productId: typeof p.id === 'number' ? p.id : null,
          stock: typeof p.stock_saleable === 'number' ? p.stock_saleable : null,
          name: p.name,
          price: p.price_range?.minimum_price?.final_price?.value ?? 0,
          image: p.image?.url || '',
          description: p.description?.html?.replace(/<[^>]*>/g, '').trim() || '',
        });
      }
    }
    return out;
  }, [productsQ.data]);

  const sellerName = seller?.shop_title || 'Negocio';
  const sellerDescription = seller?.description || '';
  const bannerUrl = ensureHiRes(seller?.banner_pic || '');

  const loading = sellerLoading || productsQ.isLoading;

  // ✅ define canLoadMore early
  const canLoadMore = !!productsQ.hasNextPage && !productsQ.isFetchingNextPage;

  // ✅ stable callback for hook deps
  const loadMore = useCallback(() => {
    if (!canLoadMore) return;
    productsQ.fetchNextPage();
  }, [canLoadMore, productsQ]);

  // ✅ IMPORTANT: call hook ALWAYS (no conditional)
  const sentinelRef = useInfiniteScrollTrigger({
    enabled: !loading && !sellerError && !!seller && canLoadMore,
    onLoadMore: loadMore,
    rootMargin: '900px',
  });

  if (loading) {
    return (
      <div className="seller-detail-page">
        <Navbar />
        <main className="seller-detail-page__notfound">
          <p>Cargando...</p>
        </main>
      </div>
    );
  }

  if (sellerError || !seller) {
    return (
      <div className="seller-detail-page seller-detail-page--notfound">
        <Navbar />
        <main className="seller-detail-page__notfound">
          <p>Negocio no encontrado.</p>
          <button className="seller-detail-page__back" onClick={() => router.push('/')} type="button">
            ← Volver al inicio
          </button>
        </main>
        <Footer sponsors={[]} />
      </div>
    );
  }

  return (
    <div className="seller-detail-page">
      <Navbar />

      <main className="sdp">
        <header className={`sdp-hero${bannerUrl ? '' : ' sdp-hero--noimage'}`}>
          {bannerUrl && <img className="sdp-hero__image" src={bannerUrl} alt={`Portada de ${sellerName}`} />}

          <div className="sdp-hero__overlay">
            <div className="sdp-hero__inner">
              <div className="sdp-hero__head sdp-hero__head--simple">
                <div className="sdp-hero__text">
                  <h1 className="sdp-hero__name">{sellerName}</h1>
                  {sellerDescription ? <p className="sdp-hero__description">{sellerDescription}</p> : null}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="sdp-products" aria-labelledby="sdp-products-title">
          <div className="sdp-products__inner">
            <h2 className="sdp-products__title" id="sdp-products-title">
              Productos disponibles
            </h2>

            {productsQ.isError ? (
              <p className="sdp-products__state">Error cargando productos.</p>
            ) : products.length === 0 ? (
              <p className="sdp-products__state">Este negocio no tiene productos.</p>
            ) : (
              <>
                <div className="sdp-products__grid" role="list" aria-label={`Productos de ${sellerName}`}>
                  {products.map((product) => (
                    <article className="sdp-card" key={product.id} role="listitem">
                      <button
                        type="button"
                        className="sdp-card__imageBtn"
                        onClick={() => router.push(`/product/${product.id}?seller=${id}`)}
                        aria-label={`Ver ${product.name}`}
                      >
                        <img className="sdp-card__img" src={product.image} alt={product.name} />
                      </button>

                      <div className="sdp-card__body">
                        <button
                          type="button"
                          className="sdp-card__name"
                          onClick={() => router.push(`/product/${product.id}?seller=${id}`)}
                        >
                          {product.name}
                        </button>

                        <p className="sdp-card__price">{formatPrice(product.price)}</p>

                        <button className="sdp-card__btn" type="button" onClick={() => addItem(product, id, 1, sellerName)}>
                          Agregar al carrito
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* sentinel always exists; it just won't load when disabled */}
                <div ref={sentinelRef} style={{ height: 1 }} />

                {productsQ.isFetchingNextPage ? <p className="sdp-products__state">Cargando más productos…</p> : null}
                {!productsQ.hasNextPage && products.length > 0 ? <p className="sdp-products__state">Ya viste todos los productos.</p> : null}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer sponsors={[]} />
    </div>
  );
}

export default function SellerDetailPage({ params }) {
  const { id } = use(params);
  return <SellerDetailContent id={id} />;
}