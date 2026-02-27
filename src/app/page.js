'use client';

import { useMemo, useRef, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import SellerSection from '../components/SellerSection/SellerSection';
import Stats from '../components/Stats/Stats';
import Footer from '../components/Footer/Footer';
import { stats } from '../data/mockData';
import { useSellersWithProductsInfinite } from '../hooks/useSellersWithProductsInfinite';
import { useInfiniteScrollTrigger } from '../hooks/useInfiniteScrollTrigger';
import OrderSuccessFromUrl from '../components/OrderSuccessModal/OrderSuccessFromUrl';
import './home.css';

const SELLER_PLACEHOLDER = 'https://via.placeholder.com/400x300?text=Negocio';
const PRODUCT_PLACEHOLDER = 'https://via.placeholder.com/200x200?text=Producto';

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapSellers(items) {
  return (items || []).map((item) => {
    const s = item?.seller || {};
    const productItems = Array.isArray(item?.products?.items) ? item.products.items : [];

    return {
      id: s.seller_id,
      name: s.shop_title || s.shop_url || `Seller ${s.seller_id}`,
      description: stripHtml(s.description),
      image: s.banner_pic || s.logo_pic || SELLER_PLACEHOLDER,
      category: 'Negocio',
      rating: 4.8,
      products: productItems.map((p, i) => ({
        id: p?.sku || `${s.seller_id || 'seller'}-${i}`,
        name: p?.name || '',
        price: p?.price_range?.minimum_price?.final_price?.value ?? 0,
        image: p?.image?.url || PRODUCT_PLACEHOLDER,
      })),
    };
  });
}

export default function HomePage() {
  const howItWorksSectionRef = useRef(null);
  const router = useRouter();

  const q = useSellersWithProductsInfinite({ pageSize: 20, productLimit: 6 });

  const sellers = useMemo(() => {
    const pages = q.data?.pages || [];
    const allItems = pages.flatMap((p) => p?.sellersWithProducts?.items || []);
    return mapSellers(allItems);
  }, [q.data]);

  const canLoadMore = !!q.hasNextPage && !q.isFetchingNextPage;

  const loadMore = useCallback(() => {
    if (!canLoadMore) return;
    q.fetchNextPage();
  }, [canLoadMore, q]);

  const sentinelRef = useInfiniteScrollTrigger({
    enabled: canLoadMore,
    onLoadMore: loadMore,
    rootMargin: '900px',
  });

  return (
    <div className="home-page">
      {/* ✅ this must be inside Suspense because it uses useSearchParams */}
      <Suspense fallback={null}>
        <OrderSuccessFromUrl />
      </Suspense>

      <Navbar />
      <main>
        <Hero nextSectionRef={howItWorksSectionRef} />
        <HowItWorks sectionRef={howItWorksSectionRef} />

        {/* ✅ Home sellers section WITHOUT the "Los emprendedores" text */}
        <section className="home-sellers" aria-label="Emprendedores destacados">
          <SellerSection sellers={sellers} onSellerClick={(seller) => router.push(`/seller/${seller.id}`)} />

          <div className="home-sellers__footer">
            <button
              type="button"
              className="home-sellers__link"
              onClick={() => router.push('/sellers')}
              aria-label="Ver todos los emprendedores"
            >
              Ver todos
            </button>
          </div>
        </section>

        <div ref={sentinelRef} className="home-infinite__sentinel" />
        <Stats stats={stats} />
        <Footer sponsors={[]} />
      </main>
    </div>
  );
}